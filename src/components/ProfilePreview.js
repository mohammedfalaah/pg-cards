import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProfilePreview = ({ userId, profile: profileProp, themeOverride }) => {
  const [profile, setProfile] = useState(profileProp || null);
  const [loading, setLoading] = useState(!profileProp);
  const [error, setError] = useState('');
  const [downloadingVCard, setDownloadingVCard] = useState(false);

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
        const res = await axios.get(`https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`);
        if ((res.data?.status === true || res.data?.code === 200) && res.data?.data) {
          setProfile(res.data.data);
        } else {
          setError('Profile not available');
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
    if (!profile) return '';
    
    // Parse phone numbers - handle both formats
    const allPhones = (profile.phoneNumbers || []).map(phoneObj => {
      if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
        return phoneObj.number;
      }
      return phoneObj.countryCode 
        ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
        : phoneObj.number || '';
    }).filter(p => p);
    
    const allEmails = (profile.emails || []).map(e => e.emailAddress).filter(e => e);
    
    const contactDetails = profile.contactDetails || {};
    const fullAddress = [
      contactDetails.address,
      contactDetails.state,
      contactDetails.country
    ].filter(Boolean).join(', ');
    
    // Build vCard 3.0 format
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `FN:${profile.fullName || 'Unknown'}\n`;
    vcard += `ORG:${profile.companyName || ''}\n`;
    vcard += `TITLE:${profile.companyDesignation || ''}\n`;
    
    // Add phone numbers
    allPhones.forEach((phone, index) => {
      const label = profile.phoneNumbers[index]?.label || 'WORK';
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
    (profile.socialMedia || []).forEach(social => {
      if (social.url) {
        vcard += `URL:${social.url}\n`;
      }
    });
    
    // Add note/about
    if (profile.about) {
      vcard += `NOTE:${profile.about}\n`;
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
    const fullName = profile?.fullName || 'John Doe';
    const designation = profile?.companyDesignation || 'Software Engineer';
    const company = profile?.companyName || 'Tech Company';
    const about = profile?.about || '';
    
    // Parse phone numbers - handle both formats
    const allPhones = (profile?.phoneNumbers || []).map(phoneObj => {
      if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
        return phoneObj.number;
      }
      return phoneObj.countryCode 
        ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
        : phoneObj.number || '';
    }).filter(p => p);
    const phone = allPhones[0] || '+971 50 000 0000';
    
    const allEmails = (profile?.emails || []).map(e => e.emailAddress).filter(e => e);
    const email = allEmails[0] || 'john@company.com';
    
    const contactDetails = profile?.contactDetails || {};
    const address = contactDetails.address || '';
    const state = contactDetails.state || '';
    const country = contactDetails.country || '';
    
    // Handle both profilePicture and profileImage fields
    const profilePic = profile?.profilePicture || profile?.profileImage || '';
    const cover = profile?.coverImage || '';
    
    const socialMedia = profile?.socialMedia || [];

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
        <p style={styles.statusText}>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.container}>
        <p style={styles.statusText}>{error || 'Profile not available'}</p>
      </div>
    );
  }

  const theme = (themeOverride || profile.theme || profile.selectedTemplate || 'standard')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/^epi$/, 'epic');
  const finalTheme = ['standard', 'modern', 'epic'].includes(theme) ? theme : 'standard';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ margin: '0 0 12px', fontSize: 18, textAlign: 'center' }}>Profile Preview ({finalTheme})</h2>
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