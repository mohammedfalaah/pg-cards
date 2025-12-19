import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Template rendering function - matches CheckoutPage templates exactly
const renderProfileTemplate = (templateId, profile) => {
  const fullName = profile?.fullName || 'John Doe';
  const designation = profile?.companyDesignation || 'Software Engineer';
  const company = profile?.companyName || 'Tech Company Inc.';
  const phone = profile?.phoneNumbers?.[0]?.number || '+1 (555) 123-4567';
  const email = profile?.emails?.[0]?.emailAddress || 'john.doe@company.com';
  const profilePic = profile?.profilePicture || '';
  const socialMedia = profile?.socialMedia || [];

  // Standard Template
  if (templateId === 'standard') {
    const socialLabels = socialMedia.length >= 3 
      ? [socialMedia[0]?.platform?.substring(0, 2) || 'Li', socialMedia[1]?.platform?.substring(0, 2) || 'In', socialMedia[2]?.platform?.substring(0, 2) || 'Tw']
      : ['Li', 'In', 'Tw'];
    
    return (
      <div
        className="public-profile-template"
        style={{
          borderRadius: 0,
          padding: '40px 20px',
          background: '#ffffff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
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
          }}
        >
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
            textAlign: 'center' 
          }}>
            {company}
          </p>
        </div>

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
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '20px', 
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📞</span>
            <span style={{ color: '#000', wordBreak: 'break-word' }}>{phone}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            fontSize: 'clamp(16px, 2.5vw, 24px)',
            flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📧</span>
            <span style={{ color: '#000', wordBreak: 'break-word' }}>{email}</span>
          </div>
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
              {socialLabels.map((label, idx) => (
                <a
                  key={idx}
                  href={socialMedia[idx]?.url || '#'}
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
                >
                  {label}
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
              // Add to contacts functionality
              const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${fullName}\nORG:${company}\nTITLE:${designation}\nTEL:${phone}\nEMAIL:${email}\nEND:VCARD`;
              const blob = new Blob([vcard], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${fullName}.vcf`;
              link.click();
            }}
          >
            Add to Contacts
          </button>
        </div>
      </div>
    );
  }

  // Modern Template
  if (templateId === 'modern') {
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
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px', 
              fontSize: 'clamp(18px, 3vw, 28px)',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📞</span>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{phone}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              fontSize: 'clamp(18px, 3vw, 28px)',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📧</span>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{email}</span>
            </div>
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
                {socialMedia.slice(0, 3).map((social, idx) => (
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
      </div>
    );
  }

  // Epic Template
  if (templateId === 'epic') {
    return (
      <div
        className="public-profile-template"
        style={{
          borderRadius: 0,
          padding: '60px 20px',
          background: '#000000',
          border: '4px solid #ffeb3b',
          color: '#fff',
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
          <h1 style={{ 
            color: '#fff', 
            fontSize: 'clamp(32px, 6vw, 48px)', 
            fontWeight: 700, 
            margin: '0 0 16px 0' 
          }}>
            {fullName}
          </h1>
          <p style={{ 
            color: '#ffeb3b', 
            fontSize: 'clamp(22px, 4vw, 36px)', 
            fontWeight: 700, 
            margin: '0 0 16px 0' 
          }}>
            {designation}
          </p>
          <p style={{ 
            color: '#fff', 
            fontSize: 'clamp(18px, 3vw, 28px)', 
            opacity: 0.8, 
            margin: 0, 
            fontStyle: 'italic' 
          }}>
            {company}
          </p>
        </div>

          <div
            style={{
              width: 'calc(100% - 40px)',
              maxWidth: '1000px',
              height: '3px',
              backgroundColor: '#ffeb3b',
              margin: '0 auto 40px',
            }}
          />

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: '60px', 
            fontSize: 'clamp(18px, 3vw, 28px)', 
            maxWidth: '1000px', 
            margin: '0 auto 60px', 
            flexWrap: 'wrap', 
            gap: '24px',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              flex: '1 1 auto',
              minWidth: '200px',
            }}>
              <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.8 }}>📞</span>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{phone}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              flex: '1 1 auto',
              minWidth: '200px',
            }}>
              <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.8 }}>📧</span>
              <span style={{ color: '#fff', wordBreak: 'break-word' }}>{email}</span>
            </div>
          </div>

          {socialMedia.length > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap', 
              maxWidth: '1000px', 
              margin: '0 auto',
              width: '100%',
              padding: '0 20px',
              boxSizing: 'border-box',
            }}>
              {socialMedia.slice(0, 3).map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: '1 1 auto',
                    padding: 'clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px)',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '3px solid #ffeb3b',
                    borderRadius: '12px',
                    fontSize: 'clamp(16px, 2.5vw, 24px)',
                    fontWeight: 600,
                    textAlign: 'center',
                    textDecoration: 'none',
                    minWidth: 'clamp(150px, 25vw, 200px)',
                  }}
                >
                  {social.platform || 'Link'}
                </a>
              ))}
            </div>
          )}
      </div>
    );
  }

  // Default fallback
  return renderProfileTemplate('standard', profile);
};

const PublicProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let theme = 'standard'; // default theme
        let profileData = null;

        // Step 1: Try to get profile data from getUserProfile API first
        try {
          const profileRes = await axios.get(
            `https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`
          );

          if (profileRes.data?.status === true && profileRes.data?.data) {
            profileData = profileRes.data.data;
          } else if (profileRes.data?.code === 200 && profileRes.data?.data) {
            profileData = profileRes.data.data;
          }
        } catch (profileErr) {
          console.warn('Could not fetch from getUserProfile:', profileErr);
        }

        // Step 2: Get theme from getUser API (this is the primary source for theme)
        // Try with userId first (in case userId is actually a userId)
        try {
          const userRes = await axios.post(
            'https://pg-cards.vercel.app/userProfile/getUser',
            { userId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (userRes.data?.code === 200 && userRes.data.data) {
            // Get theme from getUser response - this is the primary source
            const userTheme = userRes.data.data.theme || userRes.data.data.selectedTemplate;
            if (userTheme) {
              theme = userTheme;
              console.log('✅ Theme from getUser API:', theme);
            }
          }
        } catch (getUserErr) {
          console.warn('Could not fetch theme from getUser API with userId:', getUserErr);
          
          // If userId might be a profileId, try to get the actual userId from profile
          if (profileData?.userId) {
            try {
              const userRes2 = await axios.post(
                'https://pg-cards.vercel.app/userProfile/getUser',
                { userId: profileData.userId },
                { headers: { 'Content-Type': 'application/json' } }
              );
              
              if (userRes2.data?.code === 200 && userRes2.data.data) {
                const userTheme = userRes2.data.data.theme || userRes2.data.data.selectedTemplate;
                if (userTheme) {
                  theme = userTheme;
                  console.log('✅ Theme from getUser API (using profile.userId):', theme);
                }
              }
            } catch (getUserErr2) {
              console.warn('Could not fetch theme from getUser API with profile.userId:', getUserErr2);
            }
          }
        }

        // Step 3: Use profile data if we have it, otherwise try fallback
        if (profileData) {
          // Prioritize theme from getUser API, then profile theme, then selectedTemplate
          profileData.theme = theme || profileData.theme || profileData.selectedTemplate || 'standard';
          console.log('🎨 Final theme applied:', profileData.theme);
          setProfile(profileData);
        } else {
          // Fallback: try getUser endpoint to get profileId
          try {
            const userRes = await axios.post(
              'https://pg-cards.vercel.app/userProfile/getUser',
              { userId },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (userRes.data?.code === 200 && userRes.data.data) {
              const userData = userRes.data.data;
              const profileId = userData.profileId || userData._id;
              theme = userData.theme || userData.selectedTemplate || 'standard';
              
              if (profileId) {
                const profileRes = await axios.get(
                  `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
                );
                
                if (profileRes.data?.data || profileRes.data?.status === true) {
                  profileData = profileRes.data.data || profileRes.data.data;
                  profileData.theme = theme || profileData.theme || profileData.selectedTemplate || 'standard';
                  console.log('🎨 Final theme applied (fallback):', profileData.theme);
                  setProfile(profileData);
                  return;
                }
              }
            }
          } catch (fallbackErr) {
            console.error('Fallback fetch error:', fallbackErr);
          }
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Public profile fetch error:', err);
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
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #ddd', borderTop: '3px solid #ff6b35', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
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

  // Get theme from profile (from getUser API), default to 'standard'
  // Support both 'theme' and 'selectedTemplate' for backward compatibility
  let theme = profile?.theme || profile?.selectedTemplate || 'standard';
  
  // Normalize theme values: handle variations
  if (theme === 'epi') theme = 'epic';
  if (theme === 'standard' || theme === 'modern' || theme === 'epic') {
    // Valid theme, use as is
  } else {
    // Invalid theme, default to standard
    console.warn('Invalid theme detected:', theme, '- defaulting to standard');
    theme = 'standard';
  }
  
  const normalizedTheme = theme;
  
  console.log('🎨 Rendering profile with theme:', normalizedTheme);

  // Set background color based on theme
  const getBackgroundColor = (theme) => {
    switch(theme) {
      case 'modern':
        return 'linear-gradient(180deg, #f0ebff 0%, #e8e0f5 100%)';
      case 'epic':
        return '#1a1a1a';
      default:
        return '#f5f5f5';
    }
  };

  // Debug: Log theme information
  console.log('🎨 PublicProfile Render:', {
    theme: normalizedTheme,
    profileTheme: profile?.theme,
    profileSelectedTemplate: profile?.selectedTemplate,
    profileId: profile?._id || profile?.id
  });

  return (
    <div style={{
      width: '100%',
      margin: 0,
      padding: 0,
    }}>
      {renderProfileTemplate(normalizedTheme, profile)}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        html {
          margin: 0;
          padding: 0;
        }
        @media (max-width: 768px) {
          .public-profile-template > div {
            padding: 20px !important;
          }
          .public-profile-template h1 {
            font-size: 32px !important;
          }
          .public-profile-template h3 {
            font-size: 24px !important;
          }
          .public-profile-template p {
            font-size: 18px !important;
          }
        }
        @media (max-width: 480px) {
          .public-profile-template > div {
            padding: 16px !important;
          }
          .public-profile-template h1 {
            font-size: 28px !important;
          }
          .public-profile-template h3 {
            font-size: 20px !important;
          }
          .public-profile-template p {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicProfile;



