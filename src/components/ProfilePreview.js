import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePreview = ({ userId, profile: profileProp, themeOverride }) => {
  const [profile, setProfile] = useState(profileProp || null);
  const [loading, setLoading] = useState(!profileProp);
  const [error, setError] = useState('');
  const [downloadingVCard, setDownloadingVCard] = useState(false);
  const [urlTheme, setUrlTheme] = useState(null);

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
        setError('Unable to load profile');
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
    const fullAddress = [
      contactDetails.address,
      contactDetails.state,
      contactDetails.country
    ].filter(Boolean).join(', ');
    
    // Build vCard 3.0 format
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `FN:${activeProfile.fullName || 'Unknown'}\n`;
    vcard += `ORG:${activeProfile.companyName || ''}\n`;
    vcard += `TITLE:${activeProfile.companyDesignation || ''}\n`;
    
    // Add phone numbers
    allPhones.forEach((phone, index) => {
      const label = activeProfile.phoneNumbers[index]?.label || 'WORK';
      vcard += `TEL;TYPE=${label.toUpperCase()}:${phone}\n`;
    });
    
    // Add emails
    allEmails.forEach(email => {
      vcard += `EMAIL:${email}\n`;
    });
    
    // Add address
    if (fullAddress) {
      vcard += `ADR:;;${fullAddress}\n`;
    }
    
    // Add URL if available
    if (contactDetails.googleMapLink) {
      vcard += `URL:${contactDetails.googleMapLink}\n`;
    }
    
    // Add social media as URLs
    (activeProfile.socialMedia || []).forEach(social => {
      if (social.url) {
        vcard += `URL:${social.url}\n`;
      }
    });
    
    // Add note/about
    if (activeProfile.about) {
      vcard += `NOTE:${activeProfile.about}\n`;
    }
    
    vcard += 'END:VCARD';
    
    return vcard;
  };

  const downloadVCard = () => {
    setDownloadingVCard(true);
    try {
      const vcard = generateVCard();
      const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${profile.fullName || 'contact'}.vcf`;
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
    
    // Parse phone numbers - handle both formats
    const allPhones = (activeProfile?.phoneNumbers || []).map(phoneObj => {
      if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
        return phoneObj.number;
      }
      return phoneObj.countryCode 
        ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
        : phoneObj.number || '';
    }).filter(p => p);
    const phone = allPhones[0] || '+971 50 000 0000';
    
    const allEmails = (activeProfile?.emails || []).map(e => e.emailAddress).filter(e => e);
    const email = allEmails[0] || 'john@company.com';
    
    const contactDetails = activeProfile?.contactDetails || {};
    const address = contactDetails.address || '';
    const state = contactDetails.state || '';
    const country = contactDetails.country || '';
    
    // Handle multiple image field names from API
    const profilePic = activeProfile?.profilePicture || activeProfile?.profileImage || '';
    const cover = activeProfile?.coverImage || activeProfile?.backgroundImage || '';
    
    const socialMedia = activeProfile?.socialMedia || [];

    console.log('ProfilePreview renderCard - Images:', {
      profilePicture: activeProfile?.profilePicture,
      profileImage: activeProfile?.profileImage,
      coverImage: activeProfile?.coverImage,
      backgroundImage: activeProfile?.backgroundImage,
      finalProfilePic: profilePic,
      finalCover: cover
    });

    // Helper to convert Cloudinary HEIC URLs to JPG format for browser compatibility
    const convertCloudinaryUrl = (url) => {
      if (!url) return url;
      // Check if it's a Cloudinary URL with HEIC format
      if (url.includes('cloudinary.com') && (url.endsWith('.heic') || url.endsWith('.HEIC'))) {
        // Replace .heic with .jpg and add format transformation
        return url.replace(/\.heic$/i, '.jpg');
      }
      // For other Cloudinary URLs, ensure they're in a web-friendly format
      if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        // Add auto format transformation if not already present
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
              // Show a placeholder instead of hiding
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNlMGUwZTAiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIxOCIgZmlsbD0iI2JkYmRiZCIvPjxwYXRoIGQ9Ik0yMCA4NWMwLTIwIDEzLTMwIDMwLTMwczMwIDEwIDMwIDMwIiBmaWxsPSIjYmRiZGJkIi8+PC9zdmc+';
            }}
            onLoad={() => {
              console.log('Profile image loaded successfully:', displayProfilePic);
            }}
          />
        </div>
      );
    };

    if (theme === 'modern') {
      return (
        <div style={{
          padding: 20,
          borderRadius: 16,
          color: '#fff',
          background: displayCover
            ? `linear-gradient(180deg, rgba(156,136,255,0.9) 0%, rgba(118,75,162,0.9) 100%), url(${displayCover}) center/cover no-repeat`
            : 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)',
        }}>
          {renderProfileImage(82, 'rgba(255,255,255,0.3)', 4)}
          <h3 style={{ textAlign: 'center', margin: '6px 0' }}>{fullName}</h3>
          <p style={{ textAlign: 'center', margin: '2px 0' }}>{designation}</p>
          <p style={{ textAlign: 'center', margin: '2px 0' }}>{company}</p>
          {about && <p style={{ marginTop: 12, opacity: 0.9, fontSize: 13 }}>{about}</p>}
          <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
            {allPhones.map((p, i) => <div key={i}>📞 {p}</div>)}
            {allEmails.map((e, i) => <div key={i}>📧 {e}</div>)}
            {address && <div>📍 {address}{state ? `, ${state}` : ''}{country ? `, ${country}` : ''}</div>}
          </div>
          {socialMedia.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {socialMedia.map((s, i) => (
                <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => !s.url && e.preventDefault()} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, fontSize: 11, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.3)' }}>
                  {s.platform || 'Link'}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (theme === 'epic') {
      return (
        <div style={{
          padding: 20,
          borderRadius: 16,
          color: '#fff',
          border: '2px solid #ffeb3b',
          background: displayCover
            ? `linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.92)), url(${displayCover}) center/cover no-repeat`
            : '#000',
        }}>
          {renderProfileImage(82, '#ffeb3b', 4)}
          <h3 style={{ textAlign: 'center', margin: '6px 0' }}>{fullName}</h3>
          <p style={{ textAlign: 'center', margin: '2px 0', color: '#ffeb3b' }}>{designation}</p>
          <p style={{ textAlign: 'center', margin: '2px 0', opacity: 0.8 }}>{company}</p>
          {about && <p style={{ marginTop: 10, opacity: 0.7, fontSize: 12, textAlign: 'center' }}>{about}</p>}
          <div style={{ height: 1, background: '#ffeb3b', margin: '10px 0' }} />
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            {allPhones.map((p, i) => <div key={i}>📞 {p}</div>)}
            {allEmails.map((e, i) => <div key={i}>📧 {e}</div>)}
            {address && <div>📍 {address}{state ? `, ${state}` : ''}{country ? `, ${country}` : ''}</div>}
          </div>
          {socialMedia.length > 0 && (
            <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {socialMedia.map((s, i) => (
                <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => !s.url && e.preventDefault()} style={{ flex: 1, padding: '8px 10px', border: '1px solid #ffeb3b', color: '#fff', textAlign: 'center', borderRadius: 8, fontSize: 11, textDecoration: 'none' }}>
                  {s.platform || 'Link'}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    // standard
    return (
      <div style={{
        padding: 18,
        borderRadius: 12,
        border: '1px solid #e0e0e0',
        background: '#fff',
      }}>
        {displayCover && (
          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: '100%', height: 120, background: `url(${displayCover}) center/cover no-repeat` }} />
          </div>
        )}
        {renderProfileImage(76, '#81C784', 3)}
        <h3 style={{ textAlign: 'center', margin: '4px 0', color: '#000' }}>{fullName}</h3>
        <p style={{ textAlign: 'center', margin: '2px 0', color: '#666' }}>{designation}</p>
        <p style={{ textAlign: 'center', margin: '2px 0', color: '#000' }}>{company}</p>
        {about && <p style={{ marginTop: 10, color: '#555', fontSize: 12 }}>{about}</p>}
        <div style={{ marginTop: 10, fontSize: 12, color: '#000', lineHeight: 1.5 }}>
          {allPhones.map((p, i) => <div key={i}>📞 {p}</div>)}
          {allEmails.map((e, i) => <div key={i}>📧 {e}</div>)}
          {address && <div>📍 {address}{state ? `, ${state}` : ''}{country ? `, ${country}` : ''}</div>}
        </div>
        {socialMedia.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {socialMedia.map((s, i) => (
              <a key={i} href={s.url || '#'} target="_blank" rel="noopener noreferrer" onClick={e => !s.url && e.preventDefault()} style={{ padding: '6px 10px', border: '1px solid #81C784', borderRadius: 6, fontSize: 11, color: '#000', textDecoration: 'none' }}>
                {s.platform || 'Link'}
              </a>
            ))}
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Theme indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 16,
          padding: '8px 16px',
          background: finalTheme === 'epic' ? '#000' : finalTheme === 'modern' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
          borderRadius: 8,
          border: finalTheme === 'epic' ? '2px solid #ffeb3b' : 'none',
        }}>
          <span style={{ 
            fontSize: 14, 
            fontWeight: 600,
            color: finalTheme === 'standard' ? '#333' : '#fff'
          }}>
            {finalTheme === 'epic' ? '⚡' : finalTheme === 'modern' ? '✨' : '📋'} {finalTheme.charAt(0).toUpperCase() + finalTheme.slice(1)} Theme
          </span>
        </div>
        
        {renderCard(finalTheme)}
        
        {/* Add to Contacts Button */}
        <button 
          onClick={downloadVCard}
          disabled={downloadingVCard}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '14px',
            background: downloadingVCard ? '#ccc' : '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: downloadingVCard ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onMouseOver={(e) => !downloadingVCard && (e.target.style.background = '#45a049')}
          onMouseOut={(e) => !downloadingVCard && (e.target.style.background = '#4CAF50')}
        >
          {downloadingVCard ? (
            <>
              <span style={{
                width: 16,
                height: 16,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></span>
              Downloading...
            </>
          ) : (
            <>
              <span style={{ fontSize: 18 }}>📇</span>
              Add to Contacts
            </>
          )}
        </button>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 14,
    padding: 16,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
};

export default ProfilePreview;