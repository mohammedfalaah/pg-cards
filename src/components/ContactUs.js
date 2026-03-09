import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const ContactUs = () => {
  // Initialize EmailJS with your public key
  useEffect(() => {
    // Your actual public key from EmailJS dashboard
    emailjs.init('TYPlzGqN0BSQ2-8UP');
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.message.trim()) {
      setError('Please enter a message');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // EmailJS configuration
      const serviceId = 'service_kdjlhme';
      const templateId = 'template_isbqzte';

      // Prepare email parameters - match your EmailJS template variable names
      const templateParams = {
        from_name: formData.name,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'Not provided',
        message: formData.message
      };

      console.log('Sending email...', templateParams);

      // Send email using EmailJS (public key already initialized in useEffect)
      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams
      );

      console.log('Email sent successfully:', response);

      if (response.status === 200) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 5000);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('EmailJS Error:', error);
      
      // Better error messages
      if (error.text) {
        setError(`Error: ${error.text}`);
      } else if (error.status === 412) {
        setError('Configuration error. Please verify your EmailJS template variables match: from_name, from_email, phone, message, reply_to');
      } else {
        setError('Failed to send message. Please contact us directly at sales@pgcards.com');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Get In Touch</h1>
          <p style={styles.heroSubtitle}>We'd love to hear from you</p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <div style={styles.grid}>
          {/* Contact Form */}
          

          {/* Contact Info */}
          <div style={styles.infoSection}>
            {/* <h2 style={styles.sectionTitle}>Visit us</h2> */}
            
            <div style={styles.infoCard}>
              <div style={styles.iconWrapper}>
                <span style={styles.icon}>📍</span>
              </div>
              <div style={styles.infoContent}>
                <h3 style={styles.infoTitle}>Address</h3>
                <p style={styles.infoText}>PENS GALLERY LLC</p>
                <p style={styles.infoText}>Shop 21, National Paint HQ Building</p>
                <p style={styles.infoText}>Industrial Area 13, Sharjah, UAE</p>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.iconWrapper}>
                <span style={styles.icon}>📧</span>
              </div>
              <div style={styles.infoContent}>
                <h3 style={styles.infoTitle}>Email</h3>
                <a href="mailto:sales@pgcards.com" style={styles.link}>
                  sales@pgcards.com
                </a>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.iconWrapper}>
                <span style={styles.icon}>📞</span>
              </div>
              <div style={styles.infoContent}>
                <h3 style={styles.infoTitle}>Phone</h3>
                <a href="tel:+97165796957" style={styles.link}>
                  +971 6 579 6957
                </a>
              </div>
            </div>

            <a 
              href="https://maps.app.goo.gl/nxa3qhony6EyL7yA9?g_st=iwb" 
              target="_blank" 
              rel="noopener noreferrer"
              style={styles.mapButton}
            >
              <span style={styles.mapIcon}>🗺️</span>
              Open in Google Maps
            </a>
          </div>
        </div>

        {/* Map Section */}
        <div style={styles.mapSection}>
          <div style={styles.mapContainer}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3607.3658!2d55.437667!3d25.297861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDE3JzUyLjMiTiA1NcKwMjYnMTUuNiJF!5e0!3m2!1sen!2sae!4v1234567890"
              style={styles.map}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location Map"
            />
          </div>
        </div>
      </div>

      {/* Footer decoration */}
      <div style={styles.footer}>
        <div style={styles.footerLine}></div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 968px) {
          .contact-hero-title {
            font-size: 36px !important;
          }
          
          .contact-grid {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          
          .contact-map-container {
            height: 300px !important;
          }
        }
        
        @media (max-width: 768px) {
          .contact-hero {
            padding: 60px 16px 40px !important;
          }
          
          .contact-hero-title {
            font-size: 32px !important;
            margin: 25px 0 12px 0 !important;
          }
          
          .contact-hero-subtitle {
            font-size: 16px !important;
          }
          
          .contact-content {
            padding: 40px 16px !important;
          }
          
          .contact-form-section {
            padding: 24px !important;
          }
          
          .contact-section-title {
            font-size: 20px !important;
            margin-bottom: 20px !important;
          }
          
          .contact-info-card {
            padding: 20px !important;
            gap: 12px !important;
          }
          
          .contact-icon-wrapper {
            width: 40px !important;
            height: 40px !important;
          }
          
          .contact-icon {
            font-size: 20px !important;
          }
          
          .contact-map-button {
            padding: 14px 20px !important;
            font-size: 15px !important;
          }
        }
        
        @media (max-width: 480px) {
          .contact-hero {
            padding: 50px 12px 30px !important;
          }
          
          .contact-hero-title {
            font-size: 28px !important;
            margin: 20px 0 10px 0 !important;
          }
          
          .contact-hero-subtitle {
            font-size: 14px !important;
          }
          
          .contact-content {
            padding: 30px 12px !important;
          }
          
          .contact-grid {
            gap: 24px !important;
            margin-bottom: 40px !important;
          }
          
          .contact-form-section {
            padding: 20px !important;
            border-radius: 12px !important;
          }
          
          .contact-section-title {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }
          
          .contact-form-group {
            gap: 6px !important;
          }
          
          .contact-label {
            font-size: 13px !important;
          }
          
          .contact-input {
            padding: 10px 14px !important;
            font-size: 15px !important;
          }
          
          .contact-submit-button {
            padding: 12px 24px !important;
            font-size: 15px !important;
          }
          
          .contact-info-card {
            padding: 16px !important;
            gap: 10px !important;
            border-radius: 10px !important;
          }
          
          .contact-icon-wrapper {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          
          .contact-icon {
            font-size: 18px !important;
          }
          
          .contact-info-title {
            font-size: 15px !important;
          }
          
          .contact-info-text {
            font-size: 13px !important;
          }
          
          .contact-link {
            font-size: 13px !important;
          }
          
          .contact-map-button {
            padding: 12px 16px !important;
            font-size: 14px !important;
            gap: 10px !important;
          }
          
          .contact-map-icon {
            font-size: 18px !important;
          }
          
          .contact-map-section {
            border-radius: 12px !important;
          }
          
          .contact-map-container {
            height: 250px !important;
          }
          
          .contact-success-message {
            padding: 30px 16px !important;
          }
          
          .contact-success-icon {
            width: 50px !important;
            height: 50px !important;
            font-size: 28px !important;
            margin: 0 auto 16px !important;
          }
          
          .contact-success-title {
            font-size: 20px !important;
          }
          
          .contact-success-text {
            font-size: 14px !important;
          }
          
          .contact-error-message {
            padding: 10px 14px !important;
            gap: 10px !important;
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: '#fff',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  hero: {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
    padding: '80px 20px 60px',
    textAlign: 'center',
    borderBottom: '1px solid #222',
    className: 'contact-hero',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    margin: '35px 0 16px 0',
    background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    className: 'contact-hero-title',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#999',
    margin: 0,
    className: 'contact-hero-subtitle',
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    className: 'contact-content',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
    marginBottom: '60px',
    className: 'contact-grid',
  },
  formSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #222',
    className: 'contact-form-section',
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px',
    color: '#fff',
    className: 'contact-section-title',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    className: 'contact-form-group',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ccc',
    className: 'contact-label',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    transition: 'border-color 0.3s',
    className: 'contact-input',
  },
  textarea: {
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  submitButton: {
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    marginTop: '8px',
    className: 'contact-submit-button',
  },
  successMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    className: 'contact-success-message',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    margin: '0 auto 20px',
    className: 'contact-success-icon',
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px',
    className: 'contact-success-title',
  },
  successText: {
    fontSize: '16px',
    color: '#999',
    className: 'contact-success-text',
  },
  errorMessage: {
    backgroundColor: '#2a1515',
    border: '1px solid #ff4444',
    borderRadius: '8px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#ff6b6b',
    fontSize: '14px',
    className: 'contact-error-message',
  },
  errorIcon: {
    fontSize: '18px',
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    gap: '16px',
    border: '1px solid #222',
    transition: 'border-color 0.3s',
    className: 'contact-info-card',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    className: 'contact-icon-wrapper',
  },
  icon: {
    fontSize: '24px',
    className: 'contact-icon',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#fff',
    className: 'contact-info-title',
  },
  infoText: {
    fontSize: '14px',
    color: '#999',
    margin: '4px 0',
    lineHeight: '1.5',
    className: 'contact-info-text',
  },
  link: {
    fontSize: '14px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'color 0.3s',
    className: 'contact-link',
  },
  mapButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'border-color 0.3s, background-color 0.3s',
    cursor: 'pointer',
    className: 'contact-map-button',
  },
  mapIcon: {
    fontSize: '20px',
    className: 'contact-map-icon',
  },
  mapSection: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #222',
    className: 'contact-map-section',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
    className: 'contact-map-container',
  },
  map: {
    width: '100%',
    height: '100%',
    border: 'none',
    filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(85%)',
  },
  footer: {
    padding: '40px 20px',
    textAlign: 'center',
  },
  footerLine: {
    maxWidth: '200px',
    height: '2px',
    background: 'linear-gradient(90deg, transparent, #333, transparent)',
    margin: '0 auto',
  },
};

export default ContactUs;