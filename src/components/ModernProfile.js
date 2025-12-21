import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * ModernProfile Component
 * Modern Theme: Purple gradient background with white text
 */
const ModernProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safety net: if backend theme is not modern, redirect to the correct theme route
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
          if (theme !== 'modern') {
            const target = `/${theme}/${userId}`;
            console.log('⚠️ ModernProfile: theme mismatch, redirecting to', target);
            window.history.replaceState({}, '', target);
            window.dispatchEvent(new Event('popstate'));
          }
        }
      } catch (e) {
        console.warn('ModernProfile: could not verify theme, staying on modern.', e);
      }
    };
    ensureTheme();
  }, [userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await axios.get(
          `https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`
        );

        if (profileRes.data?.status === true && profileRes.data?.data) {
          setProfile(profileRes.data.data);
        } else if (profileRes.data?.code === 200 && profileRes.data?.data) {
          setProfile(profileRes.data.data);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)'
      }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #fff', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: '#fff' }}>Loading profile...</p>
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
        background: 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <h2 style={{ color: '#fff', marginBottom: '10px' }}>Profile not available</h2>
        <p style={{ color: '#fff', opacity: 0.9 }}>{error || 'This profile could not be found.'}</p>
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
    ? ['Linkedin', 'Instagram', 'Twitter']
    : socialMedia.slice(0, 3).map(s => s.platform);

  return (
    <div
      className="public-profile-template"
      style={{
        borderRadius: 0,
        padding: '60px 20px',
        background: 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)',
        color: '#ffffff',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '60px', 
        maxWidth: '1000px', 
        margin: '0 auto 60px',
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        {/* Company Logo */}
        {companyLogo && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '24px' 
          }}>
            <img
              src={companyLogo}
              alt={company}
              style={{
                maxWidth: 'clamp(120px, 20vw, 200px)',
                maxHeight: '80px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
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
            marginBottom: '24px' 
          }}>
            <img
              src={profilePic}
              alt={fullName}
              style={{
                width: 'clamp(120px, 20vw, 180px)',
                height: 'clamp(120px, 20vw, 180px)',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <h1 style={{ 
          color: '#fff', 
          fontSize: 'clamp(32px, 6vw, 48px)', 
          fontWeight: 700, 
          margin: '0 0 16px 0' 
        }}>
          {fullName}
        </h1>
        <p style={{ 
          color: '#fff', 
          fontSize: 'clamp(20px, 3.5vw, 32px)', 
          margin: '0 0 16px 0' 
        }}>
          {designation}
        </p>
        <p style={{ 
          color: '#fff', 
          fontSize: 'clamp(18px, 3vw, 28px)', 
          margin: 0 
        }}>
          {company}
        </p>
      </div>

      {/* About Section */}
      {about && (
        <div style={{ 
          marginBottom: '40px', 
          maxWidth: '1000px', 
          margin: '0 auto 40px',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
          textAlign: 'center',
        }}>
          <p style={{ 
            color: '#fff', 
            fontSize: 'clamp(16px, 2.5vw, 24px)', 
            lineHeight: '1.6',
            margin: 0,
            opacity: 0.95
          }}>
            {about}
          </p>
        </div>
      )}

      <div style={{ 
        marginBottom: '60px', 
        maxWidth: '1000px', 
        margin: '0 auto 60px',
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <h3 style={{ 
          color: '#fff', 
          fontSize: 'clamp(22px, 4vw, 36px)', 
          fontWeight: 700, 
          margin: '0 0 24px 0', 
          textAlign: 'left' 
        }}>
          Contact Information
        </h3>
        {allPhones.map((phoneNum, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px', 
            fontSize: 'clamp(18px, 3vw, 28px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📞</span>
            <span style={{ color: '#fff', wordBreak: 'break-word' }}>{phoneNum}</span>
          </div>
        ))}
        {allEmails.map((emailAddr, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px', 
            fontSize: 'clamp(18px, 3vw, 28px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📧</span>
            <span style={{ color: '#fff', wordBreak: 'break-word' }}>{emailAddr}</span>
          </div>
        ))}
        {address && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '20px', 
            fontSize: 'clamp(18px, 3vw, 28px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📍</span>
            <span style={{ color: '#fff', wordBreak: 'break-word' }}>
              {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}
            </span>
          </div>
        )}
        {googleMapLink && (
          <div style={{ marginTop: '16px' }}>
            <a 
              href={googleMapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#fff', 
                fontSize: 'clamp(16px, 2.5vw, 22px)', 
                textDecoration: 'none',
                fontWeight: 600,
                opacity: 0.95
              }}
            >
              📍 View on Map
            </a>
          </div>
        )}
      </div>

      {socialMedia.length > 0 && (
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}>
          <h3 style={{ 
            color: '#fff', 
            fontSize: 'clamp(22px, 4vw, 36px)', 
            fontWeight: 700, 
            margin: '0 0 24px 0', 
            textAlign: 'left' 
          }}>
            Social Media
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {socialMedia.map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: 'clamp(14px, 2.5vw, 20px) clamp(20px, 4vw, 32px)',
                  backgroundColor: '#0077b5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: 'clamp(16px, 2.5vw, 24px)',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {social.platform || 'Link'}
              </a>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ModernProfile;
