import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * EpicProfile Component
 * Epic Theme: Black background with bright yellow borders and accents
 */
const EpicProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safety net: if backend theme is not epic, redirect to the correct theme route
  useEffect(() => {
    const ensureTheme = async () => {
      if (!userId) return;
      try {
        const res = await axios.post(
          'https://pg-cards.vercel.app/userProfile/getUser',
          { userId },
          { headers: { 'Content-Type': 'application/json' } }
        );
        if (res.data?.code === 200 && res.data.data) {
          let theme = res.data.data.theme || res.data.data.selectedTemplate || 'standard';
          theme = String(theme).toLowerCase().trim();
          if (theme === 'epi') theme = 'epic';
          const validThemes = ['standard', 'modern', 'epic'];
          if (!validThemes.includes(theme)) theme = 'standard';
          if (theme !== 'epic') {
            const target = `/${theme}/${userId}`;
            console.log('⚠️ EpicProfile: theme mismatch, redirecting to', target);
            window.history.replaceState({}, '', target);
            window.dispatchEvent(new Event('popstate'));
          }
        }
      } catch (e) {
        console.warn('EpicProfile: could not verify theme, staying on epic.', e);
      }
    };
    ensureTheme();
  }, [userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('Profile not found');
        setLoading(false);
        return;
      }
      try {
        let profileRes = await axios.get(
          `https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`
        );

        if (profileRes.data?.status === true && profileRes.data?.data) {
          setProfile(profileRes.data.data);
          setLoading(false);
          return;
        }
        if (profileRes.data?.code === 200 && profileRes.data?.data) {
          setProfile(profileRes.data.data);
          setLoading(false);
          return;
        }

        // If direct fetch failed, try resolving via getUser -> profileId
        try {
          const userRes = await axios.post(
            'https://pg-cards.vercel.app/userProfile/getUser',
            { userId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (userRes.data?.code === 200 && userRes.data?.data) {
            const profileId = userRes.data.data.profileId || userRes.data.data._id;
            if (profileId) {
              profileRes = await axios.get(
                `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
              );
              if (profileRes.data?.status === true && profileRes.data?.data) {
                setProfile(profileRes.data.data);
                setLoading(false);
                return;
              }
              if (profileRes.data?.code === 200 && profileRes.data?.data) {
                setProfile(profileRes.data.data);
                setLoading(false);
                return;
              }
            }
          }
        } catch (e) {
          console.warn('EpicProfile: fallback getUser -> profileId failed', e);
        }

        // Extra fallback: use cached profileId from localStorage
        try {
          const cachedId = localStorage.getItem('userProfileId');
          if (cachedId && cachedId !== userId) {
            profileRes = await axios.get(
              `https://pg-cards.vercel.app/userProfile/getUserProfile/${cachedId}`
            );
            if ((profileRes.data?.status === true || profileRes.data?.code === 200) && profileRes.data?.data) {
              setProfile(profileRes.data.data);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('EpicProfile: cached profileId fetch failed', e);
        }

        setError('Profile not found');
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000'
      }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #ffeb3b', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: '#ffeb3b' }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: '20px'
      }}>
        <h2 style={{ color: '#ffeb3b', marginBottom: '10px' }}>Profile not available</h2>
        <p style={{ color: '#fff' }}>{error || 'This profile could not be found.'}</p>
      </div>
    );
  }

  const fullName = profile?.fullName || 'John Doe';
  const designation = profile?.companyDesignation || 'Software Engineer';
  const company = profile?.companyName || 'Tech Company Inc.';
  const about = profile?.about || '';
  const contactDetails = profile?.contactDetails || {};
  const address = contactDetails.address || '';
  const emirates = contactDetails.state || '';
  const country = contactDetails.country || '';
  const googleMapLink = contactDetails.googleMapLink || '';
  const profilePic = profile?.profilePicture || profile?.profileImage || '';
  const coverImage = profile?.coverImage || '';
  const companyLogo = profile?.companyLogo || '';
  const socialMedia = profile?.socialMedia || [];

  const allPhones = (profile?.phoneNumbers || []).map(phoneObj => {
    if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
      return phoneObj.number;
    }
    return phoneObj.countryCode 
      ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
      : phoneObj.number || '';
  }).filter(p => p);

  const allEmails = (profile?.emails || []).map(e => e.emailAddress).filter(e => e);

  const socialLabels = socialMedia.length >= 3 
    ? socialMedia.slice(0, 3).map(s => s.platform)
    : ['Linkedin', 'Instagram', 'Twitter'];

  return (
    <div
      className="public-profile-template"
      style={{
        borderRadius: 0,
        padding: '40px 20px',
        background: coverImage 
          ? `linear-gradient(rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.95)), url(${coverImage}) center/cover no-repeat`
          : '#000000',
        border: '4px solid #ffeb3b',
        color: '#fff',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        {/* Company Logo */}
        {companyLogo && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '20px' 
          }}>
            <img
              src={companyLogo}
              alt={company}
              style={{
                maxWidth: 'clamp(120px, 20vw, 200px)',
                maxHeight: '80px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(255, 235, 59, 0.3))',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Profile Picture */}
        {profilePic && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '20px' 
          }}>
            <img
              src={profilePic}
              alt={fullName}
              style={{
                width: 'clamp(120px, 20vw, 180px)',
                height: 'clamp(120px, 20vw, 180px)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #ffeb3b',
                boxShadow: '0 4px 12px rgba(255, 235, 59, 0.3)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Personal Information - Centered */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#fff', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, margin: '0 0 6px 0' }}>
            {fullName}
          </h3>
          <p style={{ color: '#ffeb3b', fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 700, margin: '0 0 6px 0' }}>
            {designation}
          </p>
          <p style={{ color: '#fff', fontSize: 'clamp(13px, 2vw, 16px)', opacity: 0.9, margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
            {company}
          </p>
        </div>

        {/* About Section */}
        {about && (
          <div style={{ marginBottom: '12px', textAlign: 'center' }}>
            <p style={{ color: '#fff', fontSize: 'clamp(10px, 1.5vw, 14px)', margin: 0, opacity: 0.7, lineHeight: '1.3' }}>
              {about}
            </p>
          </div>
        )}

        {/* Yellow separator line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: '#ffeb3b',
            margin: '0 auto 16px',
          }}
        />

        {/* Contact Info */}
        <div style={{ 
          marginBottom: '20px', 
          fontSize: 'clamp(11px, 1.8vw, 16px)',
        }}>
          {allPhones.map((phoneNum, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: 'clamp(12px, 2vw, 16px)', opacity: 0.7, flexShrink: 0 }}>📞</span>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{phoneNum}</span>
            </div>
          ))}
          {allEmails.map((emailAddr, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: 'clamp(12px, 2vw, 16px)', opacity: 0.7, flexShrink: 0 }}>📧</span>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{emailAddr}</span>
            </div>
          ))}
          {address && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '6px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: 'clamp(12px, 2vw, 16px)', opacity: 0.7, flexShrink: 0 }}>📍</span>
              <span style={{ color: '#fff', wordBreak: 'break-word', fontSize: 'clamp(11px, 1.5vw, 14px)' }}>
                {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}
              </span>
            </div>
          )}
          {googleMapLink && (
            <div style={{ marginTop: '8px' }}>
              <a 
                href={googleMapLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#ffeb3b', 
                  fontSize: 'clamp(10px, 1.5vw, 14px)', 
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                📍 View on Map
              </a>
            </div>
          )}
        </div>

        {/* Social Media Buttons */}
        {socialMedia.length > 0 && (
          <div style={{ 
            marginTop: 'auto', 
            display: 'flex', 
            gap: '8px',
            width: '100%',
            flexWrap: 'wrap'
          }}>
            {socialMedia.slice(0, 3).map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '1px solid #ffeb3b',
                  borderRadius: '8px',
                  fontSize: 'clamp(11px, 1.8vw, 14px)',
                  fontWeight: 600,
                  textAlign: 'center',
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                {social.platform || socialLabels[idx] || 'Link'}
              </a>
            ))}
          </div>
        )}

        {/* Add to Contacts Button */}
        <div style={{ marginTop: '24px' }}>
          <button
            style={{
              width: '100%',
              padding: 'clamp(16px, 3vw, 24px)',
              backgroundColor: '#ffeb3b',
              color: '#000',
              border: 'none',
              borderRadius: '12px',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => {
              const nameParts = fullName.trim().split(/\s+/);
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              
              let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
              vcard += `N:${lastName};${firstName};;;\n`;
              vcard += `FN:${fullName}\n`;
              
              if (company && company.trim()) {
                vcard += `ORG:${company.trim()}\n`;
              }
              
              if (designation && designation.trim()) {
                vcard += `TITLE:${designation.trim()}\n`;
              }
              
              allPhones.forEach((phoneNum, idx) => {
                const cleanPhone = phoneNum.replace(/\s+/g, ' ').trim();
                const phoneType = idx === 0 ? 'TEL;TYPE=CELL' : `TEL;TYPE=OTHER`;
                vcard += `${phoneType}:${cleanPhone}\n`;
              });
              
              allEmails.forEach((emailAddr, idx) => {
                const emailType = idx === 0 ? 'EMAIL;TYPE=WORK' : `EMAIL;TYPE=OTHER`;
                vcard += `${emailType}:${emailAddr}\n`;
              });
              
              if (address) {
                vcard += `ADR;TYPE=WORK:;;${address};${emirates || ''};${country || ''};;\n`;
              }
              
              if (about) {
                vcard += `NOTE:${about}\n`;
              }
              
              vcard += `END:VCARD`;
              
              const blob = new Blob([vcard], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${fullName.replace(/\s+/g, '_')}.vcf`;
              link.click();
              
              setTimeout(() => URL.revokeObjectURL(url), 100);
            }}
          >
            Add to Contacts
          </button>
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
};

export default EpicProfile;
