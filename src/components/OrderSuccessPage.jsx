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
          setRedirectUrl(result.data.redirectUrl || '');
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
    const phone = profile?.phoneNumbers?.[0]?.number || '+91 9876543210';
    const email = profile?.emails?.[0]?.emailAddress || 'john@company.com';
    const address = profile?.contactDetails?.address || 'MG Road, Kerala, India';
    const mapLink = profile?.contactDetails?.googleMapLink;
    const profilePic = profile?.profilePicture || '';
    const cover = profile?.backgroundImage || '';

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
          ...templateStyles,
          textAlign: 'center',
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
              border: `3px solid ${primary}`,
              marginBottom: 16,
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
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Success Animation */}
        <div style={{
          ...styles.checkmarkCircle,
          ...(animationComplete ? styles.checkmarkCircleAnimated : {})
        }}>
          <div style={styles.checkmark}>✓</div>
        </div>

        {/* Success Message */}
        <h1 style={styles.title}>Order Placed Successfully!</h1>
        <p style={styles.subtitle}>
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>

        {/* Order Details Card */}
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
                <span style={styles.infoValue}>{orderDetails.expectedDelivery || orderDetails.estimatedDelivery}</span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Confirmation Email:</span>
                <span style={styles.infoValue}>{orderDetails.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* QR from backend (POST /userProfile/getUser) */}
        {!qrLoading && (qrImage || redirectUrl) && (
          <div style={styles.nextStepsCard}>
            <h3 style={styles.nextStepsTitle}>Your Profile QR Code</h3>
            <p style={styles.subtitle}>
              This QR is generated from your profile. Scan it to open your public profile page.
            </p>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              {qrImage ? (
                <img
                  src={qrImage}
                  alt="Profile QR"
                  style={{ width: 180, height: 180, borderRadius: 12, background: '#fff' }}
                />
              ) : null}
            </div>
            {redirectUrl && (
              <p style={{ fontSize: 14, wordBreak: 'break-all' }}>
                <strong>Profile URL:</strong> {redirectUrl}
              </p>
            )}
          </div>
        )}

        {/* Profile template selection */}
        {!loadingProfile && (
          <div style={styles.nextStepsCard}>
            <h3 style={styles.nextStepsTitle}>Preview Your Card Styles</h3>
            <p style={styles.subtitle}>
              Here are all the available templates generated from your profile: Standard, Modern, Classic, Location Map and Epic.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
              {TEMPLATE_OPTIONS.map((t) => (
                <div key={t.id}>
                  <h4 style={{ fontSize: 14, marginBottom: 8 }}>{t.label}</h4>
                  {renderProfilePreview(t.id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What's Next Section */}
        <div style={styles.nextStepsCard}>
          <h3 style={styles.nextStepsTitle}>What happens next?</h3>
          
          <div style={styles.stepsList}>
            <div style={styles.step}>
              <div style={styles.stepIcon}>📧</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Order Confirmation</h4>
                <p style={styles.stepText}>
                  You'll receive an email confirmation with your order details and card profile information.
                </p>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepIcon}>🎨</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Design Processing</h4>
                <p style={styles.stepText}>
                  Our design team will prepare your custom business card based on your profile.
                </p>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepIcon}>📞</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Sales Team Contact</h4>
                <p style={styles.stepText}>
                  Our sales team will reach out to you shortly to confirm details and answer any questions.
                </p>
              </div>
            </div>

            <div style={styles.step}>
              <div style={styles.stepIcon}>🚚</div>
              <div style={styles.stepContent}>
                <h4 style={styles.stepTitle}>Shipping & Delivery</h4>
                <p style={styles.stepText}>
                  Your order will be shipped within 5-7 working days to your delivery address.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionsContainer}>
          <button 
            style={styles.primaryBtn}
            onClick={() => navigateTo('/orders')}
          >
            View My Orders
          </button>
          
          <button 
            style={styles.secondaryBtn}
            onClick={() => navigateTo('/products')}
          >
            Continue Shopping
          </button>
        </div>

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

// Add CSS animation for spinning loader
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default OrderSuccessPage;