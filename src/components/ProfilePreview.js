import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePreview = ({ userId, profile: profileProp, themeOverride }) => {
  const [profile, setProfile] = useState(profileProp || null);
  const [loading, setLoading] = useState(!profileProp);
  const [error, setError] = useState('');
  const [urlTheme, setUrlTheme] = useState(null);

  // Extract theme from URL if present
  useEffect(() => {
    const path = window.location.pathname;
    const themeMatch = path.match(/^\/(standard|modern|epic)\/([^/]+)$/);
    if (themeMatch && themeMatch[1]) {
      setUrlTheme(themeMatch[1]);
    }
  }, []);

  useEffect(() => {
    // If profile prop is provided, skip fetch
    if (profileProp) {
      setProfile(profileProp);
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      if (!userId) {
        setError('Profile not available');
        setLoading(false);
        return;
      }
      
      try {
        console.log('ProfilePreview: Fetching profile for userId:', userId);
        console.log('ProfilePreview: Current URL:', window.location.href);
        
        let profileData = null;
        let lastError = null;
        
        // Try multiple API approaches to find the profile
        const attempts = [
          // Attempt 1: Primary API endpoint
          async () => {
            console.log('ProfilePreview: Trying primary API endpoint');
            const res = await axios.get(`https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`);
            return res.data;
          },
          // Attempt 2: Alternative POST endpoint
          async () => {
            console.log('ProfilePreview: Trying alternative POST endpoint');
            const res = await axios.post('https://pg-cards.vercel.app/userProfile/getUser', {
              userId: userId
            });
            return res.data;
          },
          // Attempt 3: Try with different ID format (if userId looks like it might be a profile ID)
          async () => {
            if (userId.length > 10) { // Likely a MongoDB ObjectId
              console.log('ProfilePreview: Trying as profile lookup');
              const res = await axios.get(`https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`);
              return res.data;
            }
            throw new Error('Not applicable');
          }
        ];
        
        // Try each approach until one works
        for (let i = 0; i < attempts.length; i++) {
          try {
            const result = await attempts[i]();
            console.log(`ProfilePreview: Attempt ${i + 1} response:`, result);
            
            // Handle different response formats
            if (result?.status === true && result?.data) {
              profileData = result.data;
              break;
            } else if (result?.code === 200 && result?.data) {
              profileData = result.data;
              break;
            } else if (result?.data && typeof result.data === 'object' && result.data.fullName) {
              profileData = result.data;
              break;
            } else if (result && typeof result === 'object' && result.fullName) {
              // Direct profile object
              profileData = result;
              break;
            }
          } catch (attemptError) {
            console.log(`ProfilePreview: Attempt ${i + 1} failed:`, attemptError.message);
            lastError = attemptError;
            continue;
          }
        }
        
        if (profileData) {
          console.log('ProfilePreview: Profile loaded successfully:', profileData);
          setProfile(profileData);
          setError('');
        } else {
          console.error('ProfilePreview: All attempts failed. Last error:', lastError);
          if (lastError?.response?.status === 404) {
            setError('Profile not found');
          } else if (lastError?.response?.status >= 500) {
            setError('Server error. Please try again later.');
          } else {
            setError('Unable to load profile');
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

  const renderCard = (theme) => {
    const fullName = profile?.fullName || 'John Doe';
    const designation = profile?.companyDesignation || 'Software Engineer';
    const company = profile?.companyName || 'Tech Company';
    const about = profile?.about || '';
    const phone = profile?.phoneNumbers?.[0]?.number || '+971 50 000 0000';
    const email = profile?.emails?.[0]?.emailAddress || 'john@company.com';
    const address = profile?.contactDetails?.address || '';
    const profilePic = profile?.profilePicture || profile?.profileImage || '';
    const cover = profile?.coverImage || '';

    if (theme === 'modern') {
      return (
        <div style={{
          padding: 20,
          borderRadius: 16,
          color: '#fff',
          background: cover
            ? `linear-gradient(180deg, rgba(156,136,255,0.9) 0%, rgba(118,75,162,0.9) 100%), url(${cover}) center/cover no-repeat`
            : 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)',
        }}>
          {profilePic && (
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <img src={profilePic} alt="Profile" style={{ width: 82, height: 82, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)' }} />
            </div>
          )}
          <h3 style={{ textAlign: 'center', margin: '6px 0' }}>{fullName}</h3>
          <p style={{ textAlign: 'center', margin: '2px 0' }}>{designation}</p>
          <p style={{ textAlign: 'center', margin: '2px 0' }}>{company}</p>
          {about && <p style={{ marginTop: 12, opacity: 0.9 }}>{about}</p>}
          <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
            <div>📞 {phone}</div>
            <div>📧 {email}</div>
            {address && <div>📍 {address}</div>}
          </div>
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
          background: cover
            ? `linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.92)), url(${cover}) center/cover no-repeat`
            : '#000',
        }}>
          {profilePic && (
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <img src={profilePic} alt="Profile" style={{ width: 82, height: 82, borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffeb3b' }} />
            </div>
          )}
          <h3 style={{ textAlign: 'center', margin: '6px 0' }}>{fullName}</h3>
          <p style={{ textAlign: 'center', margin: '2px 0', color: '#ffeb3b' }}>{designation}</p>
          <p style={{ textAlign: 'center', margin: '2px 0', opacity: 0.8 }}>{company}</p>
          {about && <p style={{ marginTop: 10, opacity: 0.7, fontSize: 12, textAlign: 'center' }}>{about}</p>}
          <div style={{ height: 1, background: '#ffeb3b', margin: '10px 0' }} />
          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            <div>📞 {phone}</div>
            <div>📧 {email}</div>
            {address && <div>📍 {address}</div>}
          </div>
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
        {cover && (
          <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ width: '100%', height: 120, background: `url(${cover}) center/cover no-repeat` }} />
          </div>
        )}
        {profilePic && (
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <img src={profilePic} alt="Profile" style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '3px solid #81C784' }} />
          </div>
        )}
        <h3 style={{ textAlign: 'center', margin: '4px 0', color: '#000' }}>{fullName}</h3>
        <p style={{ textAlign: 'center', margin: '2px 0', color: '#666' }}>{designation}</p>
        <p style={{ textAlign: 'center', margin: '2px 0', color: '#000' }}>{company}</p>
        {about && <p style={{ marginTop: 10, color: '#555', fontSize: 12 }}>{about}</p>}
        <div style={{ marginTop: 10, fontSize: 12, color: '#000', lineHeight: 1.5 }}>
          <div>📞 {phone}</div>
          <div>📧 {email}</div>
          {address && <div>📍 {address}</div>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={styles.spinner}></div>
            <p style={styles.statusText}>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={styles.errorText}>{error || 'Profile not available'}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={styles.retryButton}
            >
              Try Again
            </button>
            <p style={styles.helpText}>
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine theme with priority: themeOverride > urlTheme > profile.theme > profile.selectedTemplate > 'standard'
  const theme = (themeOverride || urlTheme || profile?.theme || profile?.selectedTemplate || 'standard')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/^epi$/, 'epic');
  const finalTheme = ['standard', 'modern', 'epic'].includes(theme) ? theme : 'standard';

  console.log('ProfilePreview theme determination:', {
    themeOverride,
    urlTheme,
    profileTheme: profile?.theme,
    selectedTemplate: profile?.selectedTemplate,
    finalTheme
  });

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18, textAlign: 'center' }}>
          Profile Preview ({finalTheme})
        </h2>
        {renderCard(finalTheme)}
      </div>
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
