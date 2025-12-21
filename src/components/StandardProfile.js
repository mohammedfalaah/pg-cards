import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * StandardProfile Component
 * Standard Theme: White background with green borders
 */
const StandardProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Safety net: if backend theme is not standard, redirect to the correct theme route
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
          if (theme !== 'standard') {
            const target = `/${theme}/${userId}`;
            console.log('⚠️ StandardProfile: theme mismatch, redirecting to', target);
            window.history.replaceState({}, '', target);
            window.dispatchEvent(new Event('popstate'));
          }
        }
      } catch (e) {
        console.warn('StandardProfile: could not verify theme, staying on standard.', e);
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

        // Fallback: resolve profileId via getUser
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
          console.warn('StandardProfile: fallback getUser -> profileId failed', e);
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
          console.warn('StandardProfile: cached profileId fetch failed', e);
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
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #ddd', borderTop: '3px solid #81C784', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading profile...</p>
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
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <h2 style={{ color: '#000', marginBottom: '10px' }}>Profile not available</h2>
        <p style={{ color: '#666' }}>{error || 'This profile could not be found.'}</p>
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
    ? [socialMedia[0]?.platform?.substring(0, 2) || 'Li', socialMedia[1]?.platform?.substring(0, 2) || 'In', socialMedia[2]?.platform?.substring(0, 2) || 'Tw']
    : ['Li', 'In', 'Tw'];

  return (
    <div
      className="public-profile-template"
      style={{
        borderRadius: 0,
        padding: '40px 20px',
        background: coverImage ? `url(${coverImage}) center/cover no-repeat` : '#ffffff',
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
      {coverImage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          zIndex: 0,
        }} />
      )}
      <div
        style={{
          border: '3px solid #81C784',
          borderRadius: '12px',
          padding: '40px 24px',
          backgroundColor: '#ffffff',
          marginBottom: '40px',
          maxWidth: '800px',
          margin: '0 auto 40px',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
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
                border: '4px solid #81C784',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        <h1 style={{ 
          color: '#000', 
          fontSize: 'clamp(28px, 5vw, 42px)', 
          fontWeight: 700, 
          margin: '0 0 16px 0', 
          textAlign: 'center' 
        }}>
          {fullName}
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: 'clamp(18px, 3vw, 28px)', 
          margin: '0 0 16px 0', 
          textAlign: 'center' 
        }}>
          {designation}
        </p>
        <p style={{ 
          color: '#000', 
          fontSize: 'clamp(16px, 2.5vw, 24px)', 
          margin: 0, 
          textAlign: 'center',
          fontWeight: 600
        }}>
          {company}
        </p>
      </div>

      {/* About Section */}
      {about && (
        <div style={{ 
          marginBottom: '40px', 
          maxWidth: '800px', 
          margin: '0 auto 40px',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}>
          <h3 style={{ 
            color: '#000', 
            fontSize: 'clamp(20px, 3.5vw, 32px)', 
            fontWeight: 700, 
            margin: '0 0 16px 0', 
            textAlign: 'left' 
          }}>
            About
          </h3>
          <p style={{ 
            color: '#666', 
            fontSize: 'clamp(14px, 2vw, 20px)', 
            lineHeight: '1.6',
            margin: 0
          }}>
            {about}
          </p>
        </div>
      )}

      <div style={{ 
        marginBottom: '40px', 
        maxWidth: '800px', 
        margin: '0 auto 40px',
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <h3 style={{ 
          color: '#000', 
          fontSize: 'clamp(20px, 3.5vw, 32px)', 
          fontWeight: 700, 
          margin: '0 0 24px 0', 
          textAlign: 'left' 
        }}>
          Contact Info
        </h3>
        {allPhones.map((phoneNum, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px', 
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📞</span>
            <span style={{ color: '#000', wordBreak: 'break-word' }}>{phoneNum}</span>
          </div>
        ))}
        {allEmails.map((emailAddr, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px', 
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📧</span>
            <span style={{ color: '#000', wordBreak: 'break-word' }}>{emailAddr}</span>
          </div>
        ))}
        {address && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            marginBottom: '16px', 
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📍</span>
            <span style={{ color: '#000', wordBreak: 'break-word' }}>
              {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}
            </span>
          </div>
        )}
        {googleMapLink && (
          <div style={{ marginTop: '12px' }}>
            <a 
              href={googleMapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: '#4CAF50', 
                fontSize: 'clamp(14px, 2vw, 18px)', 
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              📍 View on Map
            </a>
          </div>
        )}
      </div>

      {socialMedia.length > 0 && (
        <div style={{ 
          marginBottom: '40px', 
          maxWidth: '800px', 
          margin: '0 auto 40px',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}>
          <h3 style={{ 
            color: '#000', 
            fontSize: 'clamp(20px, 3.5vw, 32px)', 
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
                href={social.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 'clamp(60px, 12vw, 80px)',
                  height: 'clamp(60px, 12vw, 80px)',
                  border: '2px solid #81C784',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(14px, 2vw, 20px)',
                  fontWeight: 600,
                  color: '#000',
                  backgroundColor: '#fff',
                  textDecoration: 'none',
                }}
                title={social.platform}
              >
                {social.platform?.substring(0, 2).toUpperCase() || socialLabels[idx] || 'Li'}
              </a>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        width: '100%',
        padding: '0 20px',
        boxSizing: 'border-box',
      }}>
        <button
          style={{
            width: '100%',
            padding: 'clamp(16px, 3vw, 24px)',
            backgroundColor: '#4CAF50',
            color: '#fff',
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
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StandardProfile;
