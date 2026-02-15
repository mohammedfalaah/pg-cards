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
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>Send us a message</h2>
            {submitted ? (
              <div style={styles.successMessage}>
                <div style={styles.successIcon}>✓</div>
                <h3 style={styles.successTitle}>Message Sent!</h3>
                <p style={styles.successText}>Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            ) : (
              <div style={styles.form}>
                {error && (
                  <div style={styles.errorMessage}>
                    <span style={styles.errorIcon}>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Your name"
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="your.email@example.com"
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="+971 00 000 0000"
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    style={{...styles.input, ...styles.textarea}}
                    placeholder="Tell us how we can help you..."
                    disabled={loading}
                  />
                </div>

                <button 
                  onClick={handleSubmit} 
                  style={{
                    ...styles.submitButton,
                    opacity: loading ? 0.6 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}
          </div>

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
                <a href="tel:+97100000000" style={styles.link}>
                  +971 00 000 0000
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
  },
  heroSubtitle: {
    fontSize: '18px',
    color: '#999',
    margin: 0,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '40px',
    marginBottom: '60px',
  },
  formSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #222',
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
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ccc',
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
  },
  successMessage: {
    textAlign: 'center',
    padding: '40px 20px',
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
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  successText: {
    fontSize: '16px',
    color: '#999',
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
  },
  icon: {
    fontSize: '24px',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#fff',
  },
  infoText: {
    fontSize: '14px',
    color: '#999',
    margin: '4px 0',
    lineHeight: '1.5',
  },
  link: {
    fontSize: '14px',
    color: '#fff',
    textDecoration: 'none',
    transition: 'color 0.3s',
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
  },
  mapIcon: {
    fontSize: '20px',
  },
  mapSection: {
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid #222',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
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