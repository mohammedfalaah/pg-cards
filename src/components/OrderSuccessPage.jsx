// OrderSuccessPage.js - Order Confirmation Page
import React, { useEffect, useState } from 'react';

const TEMPLATE_OPTIONS = [
  { id: 'standard', label: 'Standard' },
  { id: 'modern', label: 'Modern' },
  { id: 'linkedin', label: 'Classic' },
  { id: 'map', label: 'Location Map' },
  { id: 'epic', label: 'Epic' },
];

const OrderSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [qrImage, setQrImage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [isTrial, setIsTrial] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('standard');

  useEffect(() => {
    // Animation delay
    setTimeout(() => {
      setAnimationComplete(true);
    }, 500);

    // You can fetch order details here if needed
    // For now, we'll use placeholder data
    setOrderDetails({
      orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
      estimatedDelivery: '5-7 Working Days',
      email: 'customer@example.com',
    });

    // detect trial from query param
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('trial') === 'true') {
        setIsTrial(true);
      }
    } catch (_) {}
  }, []);

  // Load user profile for preview using profileId stored during checkout
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
        // Get theme from multiple sources with proper fallback
        let derivedTheme = result.data.theme || 
                          result.data.selectedTemplate || 
                          localStorage.getItem('selectedCardTemplate') || 
                          'standard';
        
        derivedTheme = derivedTheme.toString().toLowerCase().trim();
        
        // Handle theme name variations
        if (derivedTheme === 'epi') derivedTheme = 'epic';
        if (derivedTheme === 'linkedin') derivedTheme = 'modern'; // Map linkedin to modern
        if (derivedTheme === 'map') derivedTheme = 'standard'; // Map map to standard
        
        // Ensure valid theme
        const validThemes = ['standard', 'modern', 'epic'];
        const finalTheme = validThemes.includes(derivedTheme) ? derivedTheme : 'standard';
        
        console.log('OrderSuccessPage theme selection:', {
          originalTheme: result.data.theme,
          selectedTemplate: result.data.selectedTemplate,
          localStorage: localStorage.getItem('selectedCardTemplate'),
          derivedTheme,
          finalTheme
        });
        
        setSelectedTheme(finalTheme);
      } catch (e) {
        console.error('Error loading profile for success page:', e);
        setProfileError(e.message || 'Unable to load profile details.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Also load QR + redirectUrl for this user so the success page shows the QR code
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setQrLoading(false);
      return;
    }

    const fetchQr = async () => {
      try {
        const res = await fetch('https://pg-cards.vercel.app/userProfile/getUser', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const result = await res.json();
        if (result?.code === 200 && result.data) {
          setQrImage(result.data.qr || '');

          // Build redirect URL with proper theme handling
          const storedProfileId = localStorage.getItem('userProfileId');
          const profileId = result.data.profileId || storedProfileId || result.data._id || userId;
          
          // Get theme from multiple sources
          let theme = result.data.theme || 
                     result.data.selectedTemplate || 
                     localStorage.getItem('selectedCardTemplate') || 
                     'standard';
          
          theme = theme.toString().toLowerCase().trim();
          
          // Handle theme name variations
          if (theme === 'epi') theme = 'epic';
          if (theme === 'linkedin') theme = 'modern'; // Map linkedin to modern
          if (theme === 'map') theme = 'standard'; // Map map to standard
          
          // Ensure valid theme
          const validThemes = ['standard', 'modern', 'epic'];
          const finalTheme = validThemes.includes(theme) ? theme : 'standard';
          
          console.log('OrderSuccessPage QR redirect theme:', {
            originalTheme: result.data.theme,
            selectedTemplate: result.data.selectedTemplate,
            localStorage: localStorage.getItem('selectedCardTemplate'),
            theme,
            finalTheme,
            profileId,
            userId
          });
          
          setSelectedTheme(finalTheme);

          // Build the redirect URL - always use themed route if we have a profileId
          const targetId = profileId || userId;
          let redirectUrl;
          
          if (profileId) {
            // Use themed route: /{theme}/{profileId}
            redirectUrl = `${window.location.origin}/${finalTheme}/${profileId}`;
          } else {
            // Fallback to ThemeRouter path
            redirectUrl = `${window.location.origin}/user_profile/${targetId}`;
          }

          setRedirectUrl(redirectUrl);
        }
      } catch (e) {
        console.error('Error loading QR for success page:', e);
      } finally {
        setQrLoading(false);
      }
    };

    fetchQr();
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const renderProfilePreview = (templateId) => {
    const primary = '#f7d27c';
    const secondary = '#888';
    const text = '#ffffff';

    const commonText = {
      color: text,
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
            background: cover 
              ? `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.85)), url(${cover}) center/cover no-repeat`
              : 'linear-gradient(135deg, #000000 0%, #1c1c1c 100%)',
            border: `2px solid ${primary}`,
            color: '#fff',
            textAlign: 'center',
            minHeight: '300px',
          }}
        >
          {profilePic && (
            <img
              src={profilePic}
              alt="Profile"
              style={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${primary}`,
                marginBottom: 16,
              }}
            />
          )}
          <h2 style={{ ...commonText, fontSize: 22, fontWeight: 700 }}>
            {fullName}
          </h2>
          <p style={{ ...commonText, color: primary, fontWeight: 600 }}>
            {designation}
          </p>
          <p style={{ ...commonText, opacity: 0.7 }}>{company}</p>
          <div
            style={{
              width: '60%',
              height: 1,
              background: `linear-gradient(90deg, transparent, ${primary}, transparent)`,
              margin: '16px auto',
            }}
          />
          {phone && (
            <p style={commonText}>
              📞 <span style={{ color: primary }}>{phone}</span>
            </p>
          )}
          {email && (
            <p style={commonText}>
              📧 <span style={{ color: primary }}>{email}</span>
            </p>
          )}
          {address && (
            <p style={{ ...commonText, fontSize: 12, marginTop: 8 }}>
              📍 {address}
            </p>
          )}
          {mapLink && (
            <button
              onClick={() => window.open(mapLink, '_blank')}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                borderRadius: 20,
                border: 'none',
                background: primary,
                color: '#000',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View Location
            </button>
          )}
        </div>
      );
    }

    if (templateId === 'modern') {
      return (
        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: cover 
              ? `linear-gradient(rgba(156,136,255,0.9), rgba(118,75,162,0.9)), url(${cover}) center/cover no-repeat`
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            textAlign: 'center',
            minHeight: '300px',
          }}
        >
          {profilePic && (
            <img
              src={profilePic}
              alt="Profile"
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255,255,255,0.3)',
                marginBottom: 16,
              }}
            />
          )}
          <h2 style={{ ...commonText, color: '#fff', fontSize: 20, fontWeight: 700 }}>
            {fullName}
          </h2>
          <p style={{ ...commonText, color: '#fff', fontSize: 14, opacity: 0.9 }}>
            {designation}
          </p>
          <p style={{ ...commonText, color: '#fff', opacity: 0.8 }}>{company}</p>
          {phone && (
            <p style={{ ...commonText, color: '#fff', marginTop: 12 }}>
              📞 {phone}
            </p>
          )}
          {email && (
            <p style={{ ...commonText, color: '#fff' }}>
              📧 {email}
            </p>
          )}
          {address && (
            <p style={{ ...commonText, color: '#fff', fontSize: 12, marginTop: 8, opacity: 0.9 }}>
              📍 {address}
            </p>
          )}
        </div>
      );
    }

    // Standard template (default)
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
          <div
            style={{
              width: '100%',
              height: 120,
              borderRadius: 16,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <img
              src={cover}
              alt="Cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
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
              border: '3px solid #81C784',
              marginBottom: 16,
            }}
          />
        )}
        <h2 style={{ ...commonText, color: '#000', fontSize: 20, fontWeight: 700 }}>
          {fullName}
        </h2>
        <p style={{ ...commonText, color: secondary, fontSize: 14 }}>
          {designation}
        </p>
        <p style={{ ...commonText, color: '#000', opacity: 0.8 }}>{company}</p>
        {phone && (
          <p style={{ ...commonText, color: '#000', marginTop: 12 }}>
            📞 {phone}
          </p>
        )}
        {email && (
          <p style={{ ...commonText, color: '#000' }}>
            📧 {email}
          </p>
        )}
        {address && (
          <p style={{ ...commonText, color: '#000', fontSize: 12, marginTop: 8 }}>
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

        {/* Success Animation */}
        <div style={{
          ...styles.checkmarkCircle,
          ...(animationComplete ? styles.checkmarkCircleAnimated : {})
        }} className="order-success-checkmark-circle">
          <div style={styles.checkmark} className="order-success-checkmark">✓</div>
        </div>

        {/* Success Message */}
        <h1 style={styles.title} className="order-success-title">Order Placed Successfully!</h1>
        <p style={styles.subtitle} className="order-success-subtitle">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {/* Order Details Card */}
        {orderDetails && (
          <div style={styles.orderCard} className="order-success-card">
            <div style={styles.orderHeader}>
              <h2 style={styles.orderTitle}>Order Details</h2>
            </div>
            
            <div style={styles.orderInfo}>
              <div style={styles.infoRow} className="order-success-info-row">
                <span style={styles.infoLabel}>Order Number:</span>
                <span style={styles.infoValue}>{orderDetails.orderNumber}</span>
              </div>
              
              <div style={styles.infoRow} className="order-success-info-row">
                <span style={styles.infoLabel}>Estimated Delivery:</span>
                <span style={styles.infoValue}>{orderDetails.expectedDelivery || orderDetails.estimatedDelivery}</span>
              </div>
              
              <div style={styles.infoRow} className="order-success-info-row">
                <span style={styles.infoLabel}>Confirmation Email:</span>
                <span style={styles.infoValue}>{orderDetails.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* QR from backend (POST /userProfile/getUser) */}
        {!qrLoading && (qrImage || redirectUrl) && (
          <div style={styles.nextStepsCard} className="order-success-card">
            <h3 style={styles.nextStepsTitle}>Your Profile QR Code</h3>
            <p style={styles.subtitle}>
              This QR code links to your public profile page with the selected theme.
            </p>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {qrImage ? (
                <div>
                  <a href={redirectUrl || '#'} target="_blank" rel="noopener noreferrer">
                    <img
                      src={qrImage}
                      alt="Profile QR Code"
                      style={{ 
                        width: 180, 
                        height: 180, 
                        borderRadius: 12, 
                        background: '#fff',
                        border: '1px solid #e0e0e0'
                      }}
                      onError={(e) => {
                        console.error('QR image failed to load:', qrImage);
                        e.target.style.display = 'none';
                      }}
                    />
                  </a>
                  <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                    Click QR code to open profile
                  </p>
                </div>
              ) : (
                <div style={{ 
                  width: 180, 
                  height: 180, 
                  borderRadius: 12, 
                  background: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <span style={{ color: '#666', fontSize: 14 }}>QR Code Not Available</span>
                </div>
              )}
            </div>
            {redirectUrl && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Profile URL ({selectedTheme} theme):
                </p>
                <a 
                  href={redirectUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: 13, 
                    wordBreak: 'break-all', 
                    color: '#ff6b35',
                    textDecoration: 'none'
                  }}
                >
                  {redirectUrl}
                </a>
              </div>
            )}

            {/* Profile preview with selected theme */}
            {profile && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700 }}>
                  Preview ({selectedTheme} theme)
                </h4>
                {renderProfilePreview(selectedTheme)}
              </div>
            )}
          </div>
        )}

        

        {/* What's Next Section */}
      
      

        {/* Support Section */}
        <div style={styles.supportSection}>
          <p style={styles.supportText}>
            Need help with your order?
          </p>
          <a href="mailto:support@pgcards.com" style={styles.supportLink}>
            Contact Support
          </a>
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
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  step: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: '48px',
    height: '48px',
    backgroundColor: '#fff5f2',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000',
    marginBottom: '8px',
  },
  stepText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.6',
    margin: 0,
  },
  actionsContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    padding: '14px 32px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)',
  },
  secondaryBtn: {
    padding: '14px 32px',
    backgroundColor: '#fff',
    color: '#ff6b35',
    border: '2px solid #ff6b35',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
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
    transition: 'color 0.3s',
  },
};

// Add CSS animation for spinning loader and responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .order-success-container {
      padding-top: 100px !important;
      padding-bottom: 40px !important;
    }
    .order-success-content {
      padding: 0 16px !important;
    }
    .order-success-title {
      font-size: 28px !important;
    }
    .order-success-subtitle {
      font-size: 16px !important;
    }
    .order-success-card {
      padding: 24px 20px !important;
    }
    .order-success-checkmark-circle {
      width: 100px !important;
      height: 100px !important;
    }
    .order-success-checkmark {
      font-size: 50px !important;
    }
    .order-success-actions {
      flex-direction: column !important;
      gap: 12px !important;
    }
    .order-success-btn {
      width: 100% !important;
    }
    .order-success-info-row {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 8px !important;
    }
  }
  @media (max-width: 480px) {
    .order-success-container {
      padding-top: 90px !important;
    }
    .order-success-title {
      font-size: 24px !important;
    }
    .order-success-card {
      padding: 20px 16px !important;
    }
    .order-success-checkmark-circle {
      width: 80px !important;
      height: 80px !important;
    }
    .order-success-checkmark {
      font-size: 40px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default OrderSuccessPage;