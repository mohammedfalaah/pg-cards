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
        style={{
          borderRadius: 0,
          padding: '40px',
          background: '#ffffff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            border: '3px solid #81C784',
            borderRadius: '12px',
            padding: '40px',
            backgroundColor: '#ffffff',
            marginBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto 40px',
          }}
        >
          <h1 style={{ color: '#000', fontSize: 42, fontWeight: 700, margin: '0 0 16px 0', textAlign: 'center' }}>
            {fullName}
          </h1>
          <p style={{ color: '#666', fontSize: 28, margin: '0 0 16px 0', textAlign: 'center' }}>
            {designation}
          </p>
          <p style={{ color: '#000', fontSize: 24, margin: 0, textAlign: 'center' }}>
            {company}
          </p>
        </div>

        <div style={{ marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
          <h3 style={{ color: '#000', fontSize: 32, fontWeight: 700, margin: '0 0 24px 0', textAlign: 'left' }}>
            Contact Info
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', fontSize: 24 }}>
            <span style={{ fontSize: 32 }}>📞</span>
            <span style={{ color: '#000' }}>{phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 24 }}>
            <span style={{ fontSize: 32 }}>📧</span>
            <span style={{ color: '#000' }}>{email}</span>
          </div>
        </div>

        {socialMedia.length > 0 && (
          <div style={{ marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
            <h3 style={{ color: '#000', fontSize: 32, fontWeight: 700, margin: '0 0 24px 0', textAlign: 'left' }}>
              Social Media
            </h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              {socialLabels.map((label, idx) => (
                <a
                  key={idx}
                  href={socialMedia[idx]?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '80px',
                    height: '80px',
                    border: '2px solid #81C784',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
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

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button
            style={{
              width: '100%',
              padding: '24px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: 24,
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
        style={{
          borderRadius: 0,
          padding: '60px 40px',
          background: 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)',
          color: '#ffffff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
          <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '1000px', margin: '0 auto 60px' }}>
            <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 700, margin: '0 0 16px 0' }}>
              {fullName}
            </h1>
            <p style={{ color: '#fff', fontSize: 32, margin: '0 0 16px 0' }}>
              {designation}
            </p>
            <p style={{ color: '#fff', fontSize: 28, margin: 0 }}>
              {company}
            </p>
          </div>

          <div style={{ marginBottom: '60px', maxWidth: '1000px', margin: '0 auto 60px' }}>
            <h3 style={{ color: '#fff', fontSize: 36, fontWeight: 700, margin: '0 0 24px 0', textAlign: 'left' }}>
              Contact Information
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', fontSize: 28 }}>
              <span style={{ fontSize: 36, opacity: 0.9 }}>📞</span>
              <span style={{ color: '#fff' }}>{phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: 28 }}>
              <span style={{ fontSize: 36, opacity: 0.9 }}>📧</span>
              <span style={{ color: '#fff' }}>{email}</span>
            </div>
          </div>

          {socialMedia.length > 0 && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h3 style={{ color: '#fff', fontSize: 36, fontWeight: 700, margin: '0 0 24px 0', textAlign: 'left' }}>
                Social Media
              </h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {socialMedia.slice(0, 3).map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '20px 32px',
                      backgroundColor: '#0077b5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 24,
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
        style={{
          borderRadius: 0,
          padding: '60px 40px',
          background: '#000000',
          border: '4px solid #ffeb3b',
          color: '#fff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '1000px', margin: '0 auto 60px' }}>
          <h1 style={{ color: '#fff', fontSize: 48, fontWeight: 700, margin: '0 0 16px 0' }}>
            {fullName}
          </h1>
          <p style={{ color: '#ffeb3b', fontSize: 36, fontWeight: 700, margin: '0 0 16px 0' }}>
            {designation}
          </p>
          <p style={{ color: '#fff', fontSize: 28, opacity: 0.8, margin: 0, fontStyle: 'italic' }}>
            {company}
          </p>
        </div>

          <div
            style={{
              width: '100%',
              maxWidth: '1000px',
              height: '3px',
              backgroundColor: '#ffeb3b',
              margin: '0 auto 40px',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '60px', fontSize: 28, maxWidth: '1000px', margin: '0 auto 60px', flexWrap: 'wrap', gap: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 36, opacity: 0.8 }}>📞</span>
              <span style={{ color: '#fff' }}>{phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 36, opacity: 0.8 }}>📧</span>
              <span style={{ color: '#fff' }}>{email}</span>
            </div>
          </div>

        {socialMedia.length > 0 && (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', maxWidth: '1000px', margin: '0 auto' }}>
            {socialMedia.slice(0, 3).map((social, idx) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '24px 32px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: '3px solid #ffeb3b',
                  borderRadius: '12px',
                  fontSize: 24,
                  fontWeight: 600,
                  textAlign: 'center',
                  textDecoration: 'none',
                  minWidth: '200px',
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
        // Directly use getUserProfile API with the userId (which is actually profileId in the route)
        // Route: /user_profile/:userId where userId is the profileId
        const profileRes = await axios.get(
          `https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`
        );

        if (profileRes.data?.status === true && profileRes.data?.data) {
          const profileData = profileRes.data.data;
          
          // Ensure selectedTemplate is set (default to 'standard' if not found)
          profileData.selectedTemplate = profileData.selectedTemplate || 'standard';
          
          setProfile(profileData);
        } else if (profileRes.data?.code === 200 && profileRes.data?.data) {
          // Alternative response format
          const profileData = profileRes.data.data;
          profileData.selectedTemplate = profileData.selectedTemplate || 'standard';
          setProfile(profileData);
        } else {
          setError(profileRes.data?.msg || 'Profile not found');
        }
      } catch (err) {
        console.error('Public profile fetch error:', err);
        // If getUserProfile fails, try fallback to getUser endpoint
        try {
          const userRes = await axios.post(
            'https://pg-cards.vercel.app/userProfile/getUser',
            { userId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          if (userRes.data?.code === 200 && userRes.data.data) {
            const userData = userRes.data.data;
            const profileId = userData.profileId || userData._id;
            
            if (profileId) {
              const profileRes = await axios.get(
                `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
              );
              
              if (profileRes.data?.data || profileRes.data?.status === true) {
                const profileData = profileRes.data.data || profileRes.data.data;
                profileData.selectedTemplate = profileData.selectedTemplate || 'standard';
                setProfile(profileData);
                return;
              }
            }
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch error:', fallbackErr);
        }
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

  // Get selected template from profile, default to 'standard'
  const selectedTemplate = profile?.selectedTemplate || 'standard';

  // Set background color based on template
  const getBackgroundColor = (template) => {
    switch(template) {
      case 'modern':
        return 'linear-gradient(180deg, #f0ebff 0%, #e8e0f5 100%)';
      case 'epic':
        return '#1a1a1a';
      default:
        return '#f5f5f5';
    }
  };

  return (
    <div style={{
      width: '100%',
      margin: 0,
      padding: 0,
    }}>
      {renderProfileTemplate(selectedTemplate, profile)}
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
      `}</style>
    </div>
  );
};

export default PublicProfile;



