import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePreview = ({ userId, profile: profileProp, themeOverride, accentColor, embedded = false }) => {
  const [profile, setProfile] = useState(profileProp || null);
  const [loading, setLoading] = useState(!profileProp);
  const [error, setError] = useState('');
  const [downloadingVCard, setDownloadingVCard] = useState(false);
  const [urlTheme, setUrlTheme] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    if (!embedded) {
      window.scrollTo(0, 0);
    }
  }, [embedded]);

  // Extract theme from URL path (e.g., /epic/profileId, /modern/profileId, /standard/profileId)
  useEffect(() => {
    const path = window.location.pathname;
    console.log('ProfilePreview: Current path:', path);
    
    // Match themed URLs like /epic/123, /modern/abc, /standard/xyz
    const themeMatch = path.match(/^\/(standard|modern|epic)\/([^/]+)$/i);
    if (themeMatch && themeMatch[1]) {
      const extractedTheme = themeMatch[1].toLowerCase();
      console.log('ProfilePreview: Extracted theme from URL:', extractedTheme);
      setUrlTheme(extractedTheme);
    }
  }, []);

  // Update profile when profileProp changes (for live preview)
  useEffect(() => {
    if (profileProp) {
      console.log('ProfilePreview: Updating profile from prop:', {
        profilePicture: profileProp.profilePicture,
        profileImage: profileProp.profileImage,
        coverImage: profileProp.coverImage,
        fullName: profileProp.fullName
      });
      setProfile({...profileProp}); // Create new object to ensure re-render
      setLoading(false);
    }
  }, [profileProp, profileProp?.profilePicture, profileProp?.profileImage, profileProp?.coverImage]);

  useEffect(() => {
    // If profile prop is provided, skip fetch
    if (profileProp) {
      return;
    }
    
    const fetchProfile = async () => {
      if (!userId) {
        setError('Profile not available');
        setLoading(false);
        return;
      }
      
      console.log('ProfilePreview: Fetching profile for ID:', userId);
      
      try {
        // Try primary endpoint
        const res = await axios.get(`https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`);
        console.log('ProfilePreview: Full API response:', JSON.stringify(res.data, null, 2));
        
        if ((res.data?.status === true || res.data?.code === 200) && res.data?.data) {
          const profileData = res.data.data;
          console.log('ProfilePreview: Profile loaded successfully');
          console.log('ProfilePreview: Theme from profile:', profileData.theme);
          console.log('ProfilePreview: profilePicture field:', profileData.profilePicture);
          console.log('ProfilePreview: profileImage field:', profileData.profileImage);
          console.log('ProfilePreview: coverImage field:', profileData.coverImage);
          console.log('ProfilePreview: backgroundImage field:', profileData.backgroundImage);
          setProfile(profileData);
        } else {
          // Try alternative endpoint
          console.log('ProfilePreview: Trying alternative endpoint');
          const altRes = await axios.post('https://pg-cards.vercel.app/userProfile/getUser', { userId });
          if (altRes.data?.code === 200 && altRes.data?.data) {
            setProfile(altRes.data.data);
          } else {
            setError('Profile not available');
          }
        }
      } catch (err) {
        console.error('ProfilePreview fetch error:', err);
        if (err.response?.status === 404) {
          setError('Profile not found');
        } else if (err.response?.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('Unable to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [userId, profileProp]);

  const generateVCard = () => {
    // Use profileProp directly for live preview, fall back to profile state
    const activeProfile = profileProp || profile;
    if (!activeProfile) return '';
    
    // Parse phone numbers - handle both formats
    const allPhones = (activeProfile.phoneNumbers || []).map(phoneObj => {
      if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
        return phoneObj.number;
      }
      return phoneObj.countryCode 
        ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
        : phoneObj.number || '';
    }).filter(p => p);
    
    const allEmails = (activeProfile.emails || []).map(e => e.emailAddress).filter(e => e);
    
    const contactDetails = activeProfile.contactDetails || {};
    
    // Parse name - iOS needs proper first/last name split
    const fullName = (activeProfile.fullName || '').trim();
    const nameParts = fullName.split(' ').filter(p => p);
    
    // For "Mohammed Falah K": First=Mohammed, Last=Falah K
    let firstName = fullName; // Default to full name as first name
    let lastName = '';
    
    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }
    
    // Build vCard 3.0 - iOS compatible format
    // Using simple format that iOS recognizes
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${lastName};${firstName};;;`,
      `FN:${fullName || 'Contact'}`,
    ];
    
    // Organization (company name)
    if (activeProfile.companyName) {
      lines.push(`ORG:${activeProfile.companyName}`);
    }
    
    // Job title
    if (activeProfile.companyDesignation) {
      lines.push(`TITLE:${activeProfile.companyDesignation}`);
    }
    
    // Add phone numbers
    allPhones.forEach((phone, index) => {
      const label = activeProfile.phoneNumbers[index]?.label || 'CELL';
      lines.push(`TEL;type=${label.toUpperCase()};type=VOICE:${phone}`);
    });
    
    // Add emails
    allEmails.forEach(email => {
      lines.push(`EMAIL;type=INTERNET;type=WORK:${email}`);
    });
    
    // Add address
    if (contactDetails.address || contactDetails.state || contactDetails.country) {
      const street = contactDetails.address || '';
      const state = contactDetails.state || '';
      const country = contactDetails.country || '';
      lines.push(`ADR;type=WORK:;;${street};;${state};;${country}`);
    }
    
    // Add URL if available
    if (contactDetails.googleMapLink) {
      lines.push(`URL:${contactDetails.googleMapLink}`);
    }
    
    // Add social media
    (activeProfile.socialMedia || []).forEach(social => {
      if (social.url) {
        lines.push(`URL;type=${(social.platform || 'other').toUpperCase()}:${social.url}`);
      }
    });
    
    // Add note/about
    if (activeProfile.about) {
      lines.push(`NOTE:${activeProfile.about}`);
    }
    
    lines.push('END:VCARD');
    
    // Join with CRLF as per vCard spec
    return lines.join('\r\n');
  };

  const downloadVCard = () => {
    setDownloadingVCard(true);
    try {
      const activeProfile = profileProp || profile;
      const vcard = generateVCard();
      console.log('vCard generated:', vcard); // Debug log
      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeProfile?.fullName || 'contact'}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading vCard:', error);
      alert('Failed to download contact. Please try again.');
    } finally {
      setDownloadingVCard(false);
    }
  };

  const renderCard = (theme) => {
    // Use profileProp directly for live preview, fall back to profile state
    const activeProfile = profileProp || profile;
    const fullName = activeProfile?.fullName || 'John Doe';
    const designation = activeProfile?.companyDesignation || 'Software Engineer';
    const company = activeProfile?.companyName || 'Tech Company';
    const about = activeProfile?.about || '';
    
    // Get theme accent color (custom or default)
    const getThemeAccentColor = () => {
      if (accentColor) return accentColor;
      if (theme === 'standard') return '#4CAF50';
      if (theme === 'modern') return '#0a66c2';
      if (theme === 'epic') return '#ffeb3b';
      return '#4CAF50';
    };
    const themeAccent = getThemeAccentColor();
    
    // Parse ALL phone numbers - handle both formats
    const allPhones = (activeProfile?.phoneNumbers || []).map(phoneObj => {
      const label = phoneObj.label || 'Phone';
      let number = '';
      if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
        number = phoneObj.number;
      } else {
        number = phoneObj.countryCode 
          ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
          : phoneObj.number || '';
      }
      return { label, number };
    }).filter(p => p.number);
    
    // Parse ALL emails
    const allEmails = (activeProfile?.emails || []).map(e => e.emailAddress).filter(e => e);
    
    const contactDetails = activeProfile?.contactDetails || {};
    const address = contactDetails.address || '';
    const state = contactDetails.state || '';
    const country = contactDetails.country || '';
    const googleMapLink = contactDetails.googleMapLink || '';
    
    // Build full address string
    const fullAddress = [address, state, country].filter(Boolean).join(', ');
    
    // Handle multiple image field names from API
    const profilePic = activeProfile?.profilePicture || activeProfile?.profileImage || '';
    const cover = activeProfile?.coverImage || activeProfile?.backgroundImage || '';
    
    // Parse ALL social media links
    const socialMedia = (activeProfile?.socialMedia || []).filter(s => s.url);

    // Parse carousel images
    const carouselImages = (activeProfile?.carouselImages || []).filter(img => img && !img.startsWith('blob:'));

    console.log('ProfilePreview renderCard - Images:', {
      profilePicture: activeProfile?.profilePicture,
      profileImage: activeProfile?.profileImage,
      coverImage: activeProfile?.coverImage,
      backgroundImage: activeProfile?.backgroundImage,
      finalProfilePic: profilePic,
      finalCover: cover,
      carouselImages: carouselImages
    });

    // Helper to convert Cloudinary HEIC URLs to JPG format for browser compatibility
    const convertCloudinaryUrl = (url) => {
      if (!url) return url;
      if (url.includes('cloudinary.com') && (url.endsWith('.heic') || url.endsWith('.HEIC'))) {
        return url.replace(/\.heic$/i, '.jpg');
      }
      if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        if (!url.includes('/f_auto') && !url.includes('/f_jpg') && !url.includes('/f_png')) {
          return url.replace('/upload/', '/upload/f_auto,q_auto/');
        }
      }
      return url;
    };

    // Convert URLs for browser compatibility
    const displayProfilePic = convertCloudinaryUrl(profilePic);
    const displayCover = convertCloudinaryUrl(cover);

    // Helper to render profile image with error handling
    // eslint-disable-next-line no-unused-vars
    const renderProfileImage = (size, borderColor, borderWidth = 3) => {
      if (!displayProfilePic) return null;
      
      return (
        <div style={{ textAlign: 'center', marginBottom: size > 80 ? 12 : 8 }}>
          <img 
            src={displayProfilePic} 
            alt="Profile" 
            style={{ 
              width: size, 
              height: size, 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: `${borderWidth}px solid ${borderColor}`,
              backgroundColor: '#f0f0f0'
            }}
            onError={(e) => {
              console.error('Profile image failed to load:', displayProfilePic);
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxOCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0yMCA4NWMwLTIwIDEzLTMwIDMwLTMwczMwIDEwIDMwIDMwIiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';
            }}
            onLoad={() => {
              console.log('Profile image loaded successfully:', displayProfilePic);
            }}
          />
        </div>
      );
    };

    // Helper to get social media icon
    const getSocialIcon = (platform) => {
      const icons = {
        facebook: '📘', instagram: '📸', twitter: '🐦', linkedin: '💼',
        youtube: '📺', tiktok: '🎵', whatsapp: '💬', telegram: '✈️',
        snapchat: '👻', pinterest: '📌', github: '💻', website: '🌐'
      };
      return icons[platform?.toLowerCase()] || '🔗';
    };

    // Helper to render carousel images with auto-sliding animation
    const renderCarouselImages = (images, themeAccent) => {
      if (!images || images.length === 0) return null;

      return (
        <div style={{
          background: finalTheme === 'epic' ? '#111' : finalTheme === 'modern' ? 'rgba(255,255,255,0.15)' : '#fff',
          backdropFilter: finalTheme === 'modern' ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: finalTheme === 'modern' ? 'blur(10px)' : 'none',
          margin: '0 16px 12px',
          padding: '16px',
          borderRadius: 16,
          border: finalTheme === 'modern' ? '1px solid rgba(255,255,255,0.2)' : finalTheme === 'epic' ? '1px solid #222' : '1px solid #e0e0e0',
          boxShadow: finalTheme === 'standard' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
        }}>
          <h3 style={{ 
            fontSize: 16, 
            fontWeight: 600, 
            color: finalTheme === 'standard' ? '#000' : '#fff', 
            margin: '0 0 12px' 
          }}>
            Gallery
          </h3>
          <div style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#f0f0f0',
          }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={convertCloudinaryUrl(img)}
                alt={`Gallery ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0,
                  animation: `carouselSlide ${images.length * 2}s infinite`,
                  animationDelay: `${index * 2}s`,
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
            
            {/* Carousel indicator dots */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
            }}>
              {images.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.7)',
                    animation: `carouselDot ${images.length * 2}s infinite`,
                    animationDelay: `${index * 2}s`,
                  }}
                />
              ))}
            </div>
          </div>
          
          <style>{`
            @keyframes carouselSlide {
              0%, 8.33% { opacity: 1; }
              16.66%, 100% { opacity: 0; }
            }
            
            @keyframes carouselDot {
              0%, 8.33% { background: ${themeAccent}; transform: scale(1.2); }
              16.66%, 100% { background: rgba(255,255,255,0.7); transform: scale(1); }
            }
          `}</style>
        </div>
      );
    };

    // Render all contact details section - simple list
    const renderContactDetails = (textColor, linkColor) => (
      <div style={{ fontSize: 15 }}>
        {/* All Phone Numbers */}
        {allPhones.length > 0 && allPhones.map((p, i) => (
          <div key={`phone-${i}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 20 }}>📞</span>
            <a href={`tel:${p.number.replace(/\s/g, '')}`} style={{ 
              color: linkColor, 
              textDecoration: 'none', 
              fontSize: 16,
            }}>
              {p.number}
            </a>
          </div>
        ))}
        
        {/* All Emails */}
        {allEmails.length > 0 && allEmails.map((email, i) => (
          <div key={`email-${i}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <a href={`mailto:${email}`} style={{ 
              color: linkColor, 
              textDecoration: 'none', 
              fontSize: 16,
            }}>
              {email}
            </a>
          </div>
        ))}
      </div>
    );

    if (theme === 'modern') {
      // Modern theme - Purple gradient with glassmorphism cards
      const gradientBg = accentColor 
        ? `linear-gradient(135deg, ${themeAccent} 0%, ${themeAccent}cc 50%, ${themeAccent}99 100%)`
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
      
      return (
        <div className="profile-card-content" style={{
          minHeight: '100vh',
          width: '100%',
          paddingBottom: '80px',
          background: gradientBg,
        }}>
          {/* Cover Image with overlay */}
          {displayCover && (
            <div style={{
              width: '100%',
              height: 200,
              background: `linear-gradient(to bottom, transparent 0%, rgba(102,126,234,0.8) 100%), url(${displayCover}) center/cover no-repeat`,
            }} />
          )}
          
          {/* Profile Section - Centered */}
          <div style={{
            textAlign: 'center',
            padding: displayCover ? '0 20px 20px' : '40px 20px 20px',
            marginTop: displayCover ? -60 : 0,
          }}>
            {/* Profile Picture */}
            {displayProfilePic ? (
              <img 
                src={displayProfilePic} 
                alt="Profile" 
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '4px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM5Yzg4ZmYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxOCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMCA4NWMwLTIwIDEzLTMwIDMwLTMwczMwIDEwIDMwIDMwIiBmaWxsPSIjZmZmIi8+PC9zdmc+';
                }}
              />
            ) : (
              <div style={{
                width: 120, height: 120, borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                border: '4px solid rgba(255,255,255,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 48, color: '#fff',
                margin: '0 auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}>👤</div>
            )}
            
            {/* Name & Title */}
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: '16px 0 4px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{fullName}</h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.95)', margin: '0 0 4px' }}>{designation}</p>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', margin: '0 0 8px' }}>{company}</p>
            {fullAddress && (
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                📍 {fullAddress}
              </p>
            )}
          </div>
          
          {/* About Section - Glass Card */}
          {about && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              margin: '0 16px 12px',
              padding: '16px',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 10px' }}>About</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, margin: 0 }}>{about}</p>
            </div>
          )}
          
          {/* Contact Info - Glass Card */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            margin: '0 16px 12px',
            padding: '16px',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>Contact Info</h3>
            {renderContactDetails('rgba(255,255,255,0.9)', '#fff')}
          </div>
          
          {/* Carousel Images - Glass Card */}
          {renderCarouselImages(carouselImages, themeAccent)}
          
          {/* Social Links - Glass Card */}
          {socialMedia.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              margin: '0 16px 12px',
              padding: '16px',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 12px' }}>Social Links</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {socialMedia.map((social, i) => (
                  <a 
                    key={`social-${i}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 20,
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      border: '1px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    {getSocialIcon(social.platform)} {social.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Map Link - Glass Card */}
          {googleMapLink && (
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              margin: '0 16px 12px',
              padding: '16px',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <a 
                href={googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                🗺️ View on Google Maps
              </a>
            </div>
          )}
        </div>
      );
    }

    if (theme === 'epic') {
      return (
        <div className="profile-card-content" style={{
          minHeight: '100vh',
          width: '100%',
          paddingBottom: '80px',
          background: '#000',
        }}>
          {/* Cover Image - LinkedIn/Facebook style */}
          <div style={{
            width: '100%',
            height: 180,
            background: displayCover 
              ? `url(${displayCover}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
            borderRadius: '0 0 8px 8px',
            borderBottom: `2px solid ${themeAccent}`,
          }} />
          
          {/* Profile Header Card - LinkedIn style */}
          <div style={{
            background: '#111',
            margin: '0 12px 12px',
            marginTop: -40,
            borderRadius: 8,
            border: '1px solid #222',
            position: 'relative',
          }}>
            {/* Profile Picture - overlapping at top-left */}
            <div style={{
              position: 'absolute',
              top: -50,
              left: 16,
            }}>
              {displayProfilePic ? (
                <img 
                  src={displayProfilePic} 
                  alt="Profile" 
                  style={{ 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: `4px solid ${themeAccent}`,
                    backgroundColor: '#1a1a1a',
                    boxShadow: `0 2px 8px ${themeAccent}33`
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMxYTFhMWEiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxOCIgZmlsbD0iIzMzMyIvPjxwYXRoIGQ9Ik0yMCA4NWMwLTIwIDEzLTMwIDMwLTMwczMwIDEwIDMwIDMwIiBmaWxsPSIjMzMzIi8+PC9zdmc+';
                  }}
                />
              ) : (
                <div style={{
                  width: 120, height: 120, borderRadius: '50%', 
                  background: '#1a1a1a', border: `4px solid ${themeAccent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 40, color: themeAccent,
                  boxShadow: `0 2px 8px ${themeAccent}33`
                }}>👤</div>
              )}
            </div>
            
            {/* Profile Info */}
            <div style={{ padding: '80px 16px 16px' }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{fullName}</h1>
              <p style={{ fontSize: 16, color: themeAccent, margin: '0 0 4px' }}>{designation}</p>
              <p style={{ fontSize: 14, color: '#999', margin: '0 0 8px' }}>{company}</p>
              {fullAddress && (
                <p style={{ fontSize: 14, color: '#888', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                  📍 {fullAddress}
                </p>
              )}
            </div>
          </div>
          
          {/* About Section */}
          {about && (
            <div style={{
              background: '#111',
              margin: '0 12px 12px',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #222',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: themeAccent, margin: '0 0 12px' }}>About</h3>
              <p style={{ fontSize: 14, color: '#ccc', lineHeight: 1.6, margin: 0 }}>{about}</p>
            </div>
          )}
          
          {/* Contact Info Section */}
          <div style={{
            background: '#111',
            margin: '0 12px 12px',
            padding: '16px',
            borderRadius: 8,
            border: '1px solid #222',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: themeAccent, margin: '0 0 12px' }}>Contact Info</h3>
            {renderContactDetails('#ccc', themeAccent)}
          </div>
          
          {/* Carousel Images Section */}
          {renderCarouselImages(carouselImages, themeAccent)}
          
          {/* Social Links Section */}
          {socialMedia.length > 0 && (
            <div style={{
              background: '#111',
              margin: '0 12px 12px',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #222',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: themeAccent, margin: '0 0 12px' }}>Social Links</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {socialMedia.map((social, i) => (
                  <a 
                    key={`social-${i}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 16,
                      background: '#1a1a1a',
                      border: `1px solid ${themeAccent}`,
                      color: themeAccent,
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500
                    }}
                  >
                    {getSocialIcon(social.platform)} {social.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Map Link */}
          {googleMapLink && (
            <div style={{
              background: '#111',
              margin: '0 12px 12px',
              padding: '16px',
              borderRadius: 8,
              border: '1px solid #222',
            }}>
              <a 
                href={googleMapLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: themeAccent,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 500
                }}
              >
                🗺️ View on Google Maps
              </a>
            </div>
          )}
        </div>
      );
    }

    // standard - clean white/green theme - LinkedIn/Facebook style
    return (
      <div className="profile-card-content" style={{
        minHeight: '100vh',
        width: '100%',
        paddingBottom: '80px',
        background: '#f5f5f5',
      }}>
        {/* Cover Image - LinkedIn/Facebook style */}
        <div style={{
          width: '100%',
          height: 180,
          background: displayCover 
            ? `url(${displayCover}) center/cover no-repeat`
            : `linear-gradient(135deg, ${themeAccent} 0%, ${themeAccent}cc 100%)`,
          borderRadius: '0 0 8px 8px',
        }} />
        
        {/* Profile Header Card - LinkedIn style */}
        <div style={{
          background: '#fff',
          margin: '0 12px 12px',
          marginTop: -40,
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'relative',
        }}>
          {/* Profile Picture - overlapping at top-left */}
          <div style={{
            position: 'absolute',
            top: -50,
            left: 16,
          }}>
            {displayProfilePic ? (
              <img 
                src={displayProfilePic} 
                alt="Profile" 
                style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%', 
                  objectFit: 'cover', 
                  border: '4px solid #fff',
                  backgroundColor: '#f0f0f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxOCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0yMCA4NWMwLTIwIDEzLTMwIDMwLTMwczMwIDEwIDMwIDMwIiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';
                }}
              />
            ) : (
              <div style={{
                width: 120, height: 120, borderRadius: '50%', 
                background: '#e0e0e0', border: '4px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40, color: '#999',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>👤</div>
            )}
          </div>
          
          {/* Profile Info */}
          <div style={{ padding: '80px 16px 16px' }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#000', margin: '0 0 4px' }}>{fullName}</h1>
            <p style={{ fontSize: 16, color: '#333', margin: '0 0 4px' }}>{designation}</p>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 8px' }}>{company}</p>
            {fullAddress && (
              <p style={{ fontSize: 14, color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                📍 {fullAddress}
              </p>
            )}
          </div>
        </div>
        
        {/* About Section */}
        {about && (
          <div style={{
            background: '#fff',
            margin: '0 12px 12px',
            padding: '16px',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: '0 0 12px' }}>About</h3>
            <p style={{ fontSize: 14, color: '#333', lineHeight: 1.6, margin: 0 }}>{about}</p>
          </div>
        )}
        
        {/* Contact Info Section */}
        <div style={{
          background: '#fff',
          margin: '0 12px 12px',
          padding: '16px',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: '0 0 12px' }}>Contact Info</h3>
          {renderContactDetails('#333', themeAccent)}
        </div>
        
        {/* Carousel Images Section */}
        {renderCarouselImages(carouselImages, themeAccent)}
        
        {/* Social Links Section */}
        {socialMedia.length > 0 && (
          <div style={{
            background: '#fff',
            margin: '0 12px 12px',
            padding: '16px',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#000', margin: '0 0 12px' }}>Social Links</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {socialMedia.map((social, i) => (
                <a 
                  key={`social-${i}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 16,
                    background: '#f0f2f5',
                    color: themeAccent,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  {getSocialIcon(social.platform)} {social.platform}
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* Map Link */}
        {googleMapLink && (
          <div style={{
            background: '#fff',
            margin: '0 12px 12px',
            padding: '16px',
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <a 
              href={googleMapLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: themeAccent,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500
              }}
            >
              🗺️ View on Google Maps
            </a>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #ff6b35',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}></div>
            <p style={styles.statusText}>Loading profile...</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Use profileProp directly for live preview, fall back to profile state
  const activeProfile = profileProp || profile;

  if (error || !activeProfile) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ fontSize: 16, color: '#d32f2f', marginBottom: 16 }}>{error || 'Profile not available'}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff6b35',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IMPORTANT: Theme priority - URL theme > themeOverride > activeProfile.theme > activeProfile.selectedTemplate > 'standard'
  let rawTheme = urlTheme || themeOverride || activeProfile?.theme || activeProfile?.selectedTemplate || 'standard';
  rawTheme = rawTheme.toString().toLowerCase().trim();
  
  // Handle theme name variations
  if (rawTheme === 'epi') rawTheme = 'epic';
  
  const finalTheme = ['standard', 'modern', 'epic'].includes(rawTheme) ? rawTheme : 'standard';
  
  console.log('ProfilePreview: Final theme determination:', {
    urlTheme,
    themeOverride,
    profileTheme: activeProfile?.theme,
    selectedTemplate: activeProfile?.selectedTemplate,
    rawTheme,
    finalTheme,
    profilePicture: activeProfile?.profilePicture,
    profileImage: activeProfile?.profileImage
  });

  // Get theme-based background color
  const getThemeBackground = () => {
    if (finalTheme === 'epic') return '#000';
    if (finalTheme === 'modern') {
      return accentColor 
        ? `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 50%, ${accentColor}99 100%)`
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)';
    }
    return '#f5f5f5';
  };

  // If embedded in checkout page, show compact preview with preview button
  if (embedded) {
    return (
      <div style={{ 
        background: getThemeBackground(),
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {renderCard(finalTheme)}
        
        {/* Preview Add to Contacts Button */}
        <div style={{
          padding: '12px 16px 16px',
          background: finalTheme === 'epic' ? '#111' : finalTheme === 'modern' ? 'rgba(255,255,255,0.1)' : '#fff',
        }}>
          <button
            style={{
              width: '100%',
              padding: '14px 20px',
              background: finalTheme === 'epic' 
                ? `linear-gradient(135deg, ${accentColor || '#ffeb3b'} 0%, ${accentColor ? accentColor + 'cc' : '#ffc107'} 100%)` 
                : finalTheme === 'modern' 
                  ? 'rgba(255,255,255,0.25)' 
                  : `linear-gradient(135deg, ${accentColor || '#4CAF50'} 0%, ${accentColor ? accentColor + 'cc' : '#45a049'} 100%)`,
              color: finalTheme === 'epic' ? '#000' : '#fff',
              border: finalTheme === 'modern' ? '1px solid rgba(255,255,255,0.3)' : 'none',
              borderRadius: 25,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            }}
          >
            📇 Add to Contacts
          </button>
        </div>
      </div>
    );
  }

  // Standalone view (after QR scan) - SAME design as embedded but full screen
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: getThemeBackground(),
        margin: 0,
        padding: 0,
        overflow: 'auto',
        zIndex: 9999,
      }} 
      className="profile-preview-standalone"
    >
      {renderCard(finalTheme)}
      
      {/* Fixed Add to Contacts Button at bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: finalTheme === 'epic' ? 'rgba(0,0,0,0.95)' : finalTheme === 'modern' ? 'rgba(118,75,162,0.95)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 10000,
      }}>
        <button
          onClick={downloadVCard}
          disabled={downloadingVCard}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: finalTheme === 'epic' 
              ? 'linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%)' 
              : finalTheme === 'modern' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
            color: finalTheme === 'epic' ? '#000' : '#fff',
            border: 'none',
            borderRadius: 30,
            fontSize: 17,
            fontWeight: 700,
            cursor: downloadingVCard ? 'not-allowed' : 'pointer',
            opacity: downloadingVCard ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          }}
        >
          {downloadingVCard ? 'Saving...' : 'Add to Contacts'}
        </button>
      </div>
      
      {/* Full screen styles for mobile */}
      <style>{`
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          background: ${finalTheme === 'epic' ? '#000' : finalTheme === 'modern' ? '#764ba2' : '#fff'} !important;
        }
        .profile-preview-standalone {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: '#000', // Match epic theme background
    padding: '0',
  },
  card: {
    width: '100%',
    maxWidth: '100%',
    background: 'transparent',
    borderRadius: 0,
    padding: '12px',
    boxShadow: 'none',
  },
  // Desktop styles applied via media query in component
  containerDesktop: {
    padding: 20,
    alignItems: 'center',
  },
  cardDesktop: {
    maxWidth: 420,
    minHeight: 'auto',
    borderRadius: 14,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    margin: '8px 0',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    margin: '16px 0',
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    margin: '16px 0 0',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '16px 0',
    transition: 'background-color 0.3s',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #ff6b35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  },
};

// Add CSS animation for spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.head.querySelector('style[data-profile-preview]')) {
    styleSheet.setAttribute('data-profile-preview', 'true');
    document.head.appendChild(styleSheet);
  }
}



export default ProfilePreview;
