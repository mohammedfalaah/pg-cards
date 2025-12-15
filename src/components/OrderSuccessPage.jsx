// OrderSuccessPage.js - Order Confirmation Page
import React, { useEffect, useState } from 'react';

const OrderSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);

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

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
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
                <span style={styles.infoValue}>{orderDetails.estimatedDelivery}</span>
              </div>
              
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Confirmation Email:</span>
                <span style={styles.infoValue}>{orderDetails.email}</span>
              </div>
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