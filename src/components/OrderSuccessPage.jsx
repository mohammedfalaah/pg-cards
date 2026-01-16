// OrderSuccessPage.js - Order Confirmation Page
import React, { useEffect, useState } from 'react';

const OrderSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [profile, setProfile] = useState(null);
  const [, setProfileError] = useState('');
  const [, setLoadingProfile] = useState(true);
  const [qrImage, setQrImage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('standard');
  const [, setQrUrlMismatch] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    setOrderDetails({
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      estimatedDelivery: '5-7 Working Days',
      email: 'customer@example.com',
    });

    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('trial') === 'true') {
        setIsTrial(true);
      }
    } catch (_) {}
  }, []);

  // Load user profile
  useEffect(() => {
    const profileId = localStorage.getItem('userProfileId');
    if (!profileId) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
        );
        const result = await res.json();
        if (!res.ok || !result?.data) {
          throw new Error(result?.message || 'Unable to load profile details');
        }
        setProfile(result.data);
        const derivedTheme = (result.data.theme || result.data.selectedTemplate || localStorage.getItem('selectedCardTemplate') || 'standard')
          .toString()
          .toLowerCase()
          .trim()
          .replace(/^epi$/, 'epic');
        setSelectedTheme(['standard', 'modern', 'epic'].includes(derivedTheme) ? derivedTheme : 'standard');
      } catch (e) {
        console.error('Error loading profile:', e);
        setProfileError(e.message || 'Unable to load profile details.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Load QR code
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setQrLoading(false);
      return;
    }

    const fetchQr = async () => {
      try {
        console.log('OrderSuccessPage: Starting QR fetch with userId:', userId);
        
        const res = await fetch('https://pg-cards.vercel.app/userProfile/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const result = await res.json();
        if (result?.code === 200 && result.data) {
          // Get profile ID
          const storedProfileId = localStorage.getItem('userProfileId');
          const profileId = result.data.profileId || storedProfileId || result.data._id || userId;
          
          // Get theme
          const localTheme = localStorage.getItem('selectedCardTemplate');
          let theme =
            (result.data.theme || localTheme || '').toString().toLowerCase().trim();
          if (theme === 'epi') theme = 'epic';
          const validThemes = ['standard', 'modern', 'epic'];
          if (!validThemes.includes(theme)) theme = 'standard';
          setSelectedTheme(theme);

          // ALWAYS use production URL - pg-cards-seven.vercel.app
          const productionOrigin = 'https://pgcards.com';

          // Always build a themed route with profileId
          const targetId = profileId || userId;
          const forcedRedirect = `${productionOrigin}/${theme}/${targetId}`;

          setRedirectUrl(forcedRedirect);
          
          // ALWAYS generate QR code client-side with correct themed URL
          // Don't use backend QR as it may have old/wrong URL format
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(forcedRedirect)}`;
          setQrImage(qrApiUrl);
          
          console.log('OrderSuccessPage: QR URL set to:', forcedRedirect);
        }
      } catch (e) {
        console.error('Error loading QR:', e);
      } finally {
        setQrLoading(false);
      }
    };

    fetchQr();
  }, []);

  // Helper to convert Cloudinary HEIC URLs to web-friendly format
  // eslint-disable-next-line no-unused-vars
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

  // Function to regenerate QR code with correct URL
  // eslint-disable-next-line no-unused-vars
  const regenerateQrCode = async (correctUrl) => {
    try {
      console.log('Regenerating QR code with URL:', correctUrl);
      
      // First try to update the backend
      const userId = localStorage.getItem('userId');
      const profileId = localStorage.getItem('userProfileId');
      
      if (userId && profileId) {
        // Try to update the profile with the correct theme and regenerate QR
        const updateRes = await fetch('https://pg-cards.vercel.app/userProfile/saveUserProfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            _id: profileId,
            theme: selectedTheme,
            // Add other required fields if needed
          })
        });
        
        if (updateRes.ok) {
          // Refresh the QR code from backend
          const qrRes = await fetch('https://pg-cards.vercel.app/userProfile/getUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });
          
          const qrResult = await qrRes.json();
          if (qrResult?.code === 200 && qrResult.data?.qr) {
            setQrImage(qrResult.data.qr);
            setQrUrlMismatch(false);
            console.log('QR code regenerated successfully from backend');
            return;
          }
        }
      }
      
      // Fallback: Generate QR code client-side using a QR service
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(correctUrl)}`;
      setQrImage(qrApiUrl);
      setQrUrlMismatch(false);
      console.log('QR code generated client-side');
      
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
    }
  };

  const renderProfilePreview = (templateId) => {
    const primary = '#f7d27c';
    const secondary = '#888';

    const commonText = {
      color: '#ffffff',
      margin: 0,
    };

    const fullName = profile?.fullName || 'John Doe';
    const designation = profile?.companyDesignation || 'Senior Software Developer';
    const company = profile?.companyName || 'TechCorp';
    const phone = profile?.phoneNumbers?.[0]?.number || '+971 50 000 0000';
    const email = profile?.emails?.[0]?.emailAddress || 'john@company.com';
    const address = profile?.contactDetails?.address || 'Business Bay, Dubai, UAE';
    const mapLink = profile?.contactDetails?.googleMapLink;
    const profilePic = profile?.profilePicture || profile?.profileImage || '';
    const cover = profile?.coverImage || profile?.backgroundImage || '';

    if (templateId === 'epic') {
      return (
        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background:
              'linear-gradient(135deg, #000000 0%, #1c1c1c 100%)',
            border: `2px solid ${primary}`,
            color: '#fff',
            textAlign: 'center',
          }}
        >
          {profilePic && (
            <img src={profilePic} alt="Profile" style={{
              width: 96, height: 96, borderRadius: '50%', objectFit: 'cover',
              border: `3px solid ${primary}`, marginBottom: 16, backgroundColor: '#333',
            }} onError={(e) => e.target.style.display = 'none'} />
          )}
          <h2 style={{ ...commonText, fontSize: 22, fontWeight: 700 }}>{fullName}</h2>
          <p style={{ ...commonText, color: primary, fontWeight: 600 }}>{designation}</p>
          <p style={{ ...commonText, opacity: 0.7 }}>{company}</p>
          <div style={{ width: '60%', height: 1, background: `linear-gradient(90deg, transparent, ${primary}, transparent)`, margin: '16px auto' }} />
          {phone && <p style={commonText}>📞 <span style={{ color: primary }}>{phone}</span></p>}
          {email && <p style={commonText}>📧 <span style={{ color: primary }}>{email}</span></p>}
          {address && <p style={{ ...commonText, fontSize: 12, marginTop: 8 }}>📍 {address}</p>}
          {mapLink && (
            <button onClick={() => window.open(mapLink, '_blank')} style={{
              marginTop: 16, padding: '10px 20px', borderRadius: 20, border: 'none',
              background: primary, color: '#000', fontWeight: 600, cursor: 'pointer',
            }}>View Location</button>
          )}
        </div>
      );
    }

    // Simple variations for other templates
    const templateStyles = {
      standard: {
        background: '#ffffff',
        color: '#000',
        border: '1px solid #e0e0e0',
      },
      modern: {
        background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        color: '#ffffff',
      },
      linkedin: {
        background: 'linear-gradient(135deg,#0077b5 0%,#00a0dc 100%)',
        color: '#ffffff',
      },
      map: {
        background: 'linear-gradient(135deg,#4285F4 0%,#34A853 100%)',
        color: '#ffffff',
      },
    }[templateId] || {
      background: '#ffffff',
      color: '#000000',
      border: '1px solid #e0e0e0',
    };

    return (
      <div
        style={{
          borderRadius: 24,
          padding: 24,
          background: '#ffffff',
          color: '#000',
          border: '1px solid #e0e0e0',
          textAlign: 'center',
          minHeight: '300px',
        }}
      >
        {cover && (
          <div style={{ width: '100%', height: 120, borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            <img src={cover} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => e.target.parentElement.style.display = 'none'} />
          </div>
        )}
        {profilePic && (
          <img
            src={profilePic}
            alt="Profile"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              border: `3px solid ${primary}`,
              marginBottom: 16,
              backgroundColor: '#f0f0f0',
            }}
            onError={(e) => {
              console.error('Profile image failed to load:', profilePic);
              e.target.style.display = 'none';
            }}
          />
        )}
        <h2 style={{ ...commonText, color: templateStyles.color, fontSize: 20, fontWeight: 700 }}>
          {fullName}
        </h2>
        <p style={{ ...commonText, color: secondary, fontSize: 14 }}>
          {designation}
        </p>
        <p style={{ ...commonText, opacity: 0.8 }}>{company}</p>
        {phone && (
          <p style={{ ...commonText, marginTop: 12 }}>
            📞 {phone}
          </p>
        )}
        {email && (
          <p style={{ ...commonText }}>
            📧 {email}
          </p>
        )}
        {address && (
          <p style={{ ...commonText, fontSize: 12, marginTop: 8 }}>
            📍 {address}
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container} className="order-success-container">
      <div style={styles.content} className="order-success-content">
        {isTrial && (
          <div style={styles.trialBanner}>
            🎉 3-Day Free Trial Activated! Your card will be charged after the trial ends unless you cancel.
          </div>
        )}

        <div style={{
          ...styles.checkmarkCircle,
          ...(animationComplete ? styles.checkmarkCircleAnimated : {})
        }}>
          <div style={styles.checkmark}>✓</div>
        </div>

        <h1 style={styles.title}>Order Placed Successfully!</h1>
        <p style={styles.subtitle}>
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {orderDetails && (
          <div style={styles.orderCard}>
            <div style={styles.orderHeader}>
              <h2 style={styles.orderTitle}>Order Details</h2>
            </div>
            <div style={styles.orderInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Order Number:</span>
                <span style={styles.infoValue}>{orderDetails.orderNumber}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Estimated Delivery:</span>
                <span style={styles.infoValue}>{orderDetails.estimatedDelivery}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Confirmation Email:</span>
                <span style={styles.infoValue}>{orderDetails.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Debug info (only show in development or when there are issues) */}
       

        {!qrLoading && (qrImage || redirectUrl) && (
          <div style={styles.nextStepsCard}>
            <h3 style={styles.nextStepsTitle}>Your Profile QR Code</h3>
            <p style={styles.subtitle}>
              This QR is generated from your profile. Scan it to open your public profile page.
            </p>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {qrImage ? (
                <a href={redirectUrl || '#'} target="_blank" rel="noopener noreferrer">
                  <img
                    src={qrImage}
                    alt="Profile QR"
                    style={{ width: 180, height: 180, borderRadius: 12, background: '#fff' }}
                  />
                </a>
              ) : null}
            </div>
            {redirectUrl && (
              <p style={{ fontSize: 14, wordBreak: 'break-all' }}>
                <strong>Profile URL:</strong> {redirectUrl}
              </p>
            )}

            {profile && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>Preview ({selectedTheme})</h4>
                {renderProfilePreview(selectedTheme)}
              </div>
            )}
          </div>
        )}

        <div style={styles.supportSection}>
          <p style={styles.supportText}>Need help with your order?</p>
          <a href="mailto:support@pgcards.com" style={styles.supportLink}>Contact Support</a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '120px',
    paddingBottom: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    maxWidth: '800px',
    width: '100%',
    padding: '0 20px',
    textAlign: 'center',
  },
  checkmarkCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    margin: '0 auto 30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'scale(0)',
    transition: 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  checkmarkCircleAnimated: {
    transform: 'scale(1)',
  },
  checkmark: {
    fontSize: '60px',
    color: '#fff',
    fontWeight: '700',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#000',
    marginBottom: '16px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  orderCard: {
    backgroundColor: '#fff',
     borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textAlign: 'left',
  },
  orderHeader: {
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '16px',
    marginBottom: '24px',
  },
  orderTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000',
    margin: 0,
  },
  orderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#000',
  },
  nextStepsCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    textAlign: 'left',
  },
  trialBanner: {
    background: '#fff7e6',
    border: '1px solid #ffd591',
    color: '#8c6b2f',
    borderRadius: '12px',
    padding: '12px 14px',
    marginBottom: '16px',
    fontWeight: 600,
    textAlign: 'center',
  },
  nextStepsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000',
    marginBottom: '24px',
  },
  supportSection: {
    paddingTop: '32px',
    borderTop: '1px solid #e0e0e0',
  },
  supportText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  supportLink: {
    fontSize: '16px',
    color: '#ff6b35',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default OrderSuccessPage;