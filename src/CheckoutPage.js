// CheckoutPage.js - Fixed Stripe Integration
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { getUserId } from './components/Utils';
import ProfilePreview from './components/ProfilePreview';

// Cloudinary config (unsigned upload). Keep secrets out of frontend.
const CLOUDINARY_CLOUD_NAME = 'dhcwgdobf';
// Fallback to known unsigned preset so uploads work without env vars
const CLOUDINARY_UPLOAD_PRESET =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'pgcards_unsigned';
const CLOUDINARY_FOLDER = process.env.REACT_APP_CLOUDINARY_FOLDER || 'pgcards';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51SYlQeCt0GZs5TLdv40gy5CFNFZQwjJBKKafhRcRkAteocPEM5UVtYrXtiOMGeuFrci9HUgwn8rPIua4wuqysHsw00cCrrypSt');

// Template Options - Only 3 distinct designs
const TEMPLATE_OPTIONS = [
  { id: 'standard', label: 'Standard', description: 'Clean white background with green accents' },
  { id: 'modern', label: 'Modern', description: 'Purple-blue gradient design' },
  { id: 'epic', label: 'Epic', description: 'Dark theme with yellow accents' },
];

// Country codes for phone numbers
const COUNTRY_CODES = [
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
];

// Profile Form Component
const ProfileForm = ({ onProfileSaved, selectedTemplate, onFormDataChange, initialData, onFormDataReady }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form data with initialData if provided, or defaults
  const initializeFormData = () => {
    if (initialData) {
      // Parse phone numbers to extract country code if needed
      const phoneNumbers = initialData.phoneNumbers?.map(phone => {
        if (phone.number && phone.number.startsWith('+') && !phone.countryCode) {
          const parts = phone.number.split(' ');
          if (parts.length > 1) {
            return {
              ...phone,
              countryCode: parts[0],
              number: parts.slice(1).join(' ')
            };
          }
        }
        return { ...phone, countryCode: phone.countryCode || '+971' };
      }) || [{ label: 'work', countryCode: '+971', number: '' }];
      
      return {
        ...initialData,
      phoneNumbers,
      profilePicture: initialData.profilePicture || initialData.profileImage || '',
      coverImage: initialData.coverImage || ''
      };
    }
    
    return {
      userId: getUserId() || '',
      fullName: '',
      companyDesignation: '',
      companyName: '',
      about: '',
      phoneNumbers: [{ label: 'work', countryCode: '+971', number: '' }],
      emails: [{ emailAddress: '' }],
      contactDetails: {
        address: '',
        state: '',
        country: '',
        googleMapLink: ''
      },
      socialMedia: [],
      profilePicture: '',
      coverImage: ''
    };
  };
  
  const [formData, setFormData] = useState(initializeFormData());
  const [socialInput, setSocialInput] = useState({ platform: 'linkedin', url: '' });
  
  // Upload helper for profile/cover to Cloudinary (returns hosted URL)
  const uploadImageToServer = async (file, label = 'image') => {
    if (!CLOUDINARY_UPLOAD_PRESET) {
      toast.error('Upload preset missing. Set REACT_APP_CLOUDINARY_UPLOAD_PRESET.');
      return null;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    if (CLOUDINARY_FOLDER) formDataUpload.append('folder', CLOUDINARY_FOLDER);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formDataUpload,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      const data = response.data || {};
      const uploadedUrl = data.secure_url || data.url;
      if (uploadedUrl) return uploadedUrl;
      throw new Error('No URL returned');
    } catch (err) {
      console.error(`Upload failed for ${label}:`, err?.response?.data || err);
      const message =
        err?.response?.data?.error?.message ||
        err?.message ||
        'Failed to upload';
      toast.error(`${message}. Using local preview only.`);
      // Fallback: keep local preview (data URL) so UI does not break
      return null;
    }
  };

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      // Parse phone numbers to extract country code if needed
      const phoneNumbers = initialData.phoneNumbers?.map(phone => {
        if (phone.number && phone.number.startsWith('+') && !phone.countryCode) {
          const parts = phone.number.split(' ');
          if (parts.length > 1) {
            return {
              ...phone,
              countryCode: parts[0],
              number: parts.slice(1).join(' ')
            };
          }
        }
        return { ...phone, countryCode: phone.countryCode || '+971' };
      }) || [{ label: 'work', countryCode: '+971', number: '' }];
      
      const updatedData = {
        ...initialData,
        phoneNumbers,
        profilePicture: initialData.profilePicture || initialData.profileImage || '',
        coverImage: initialData.coverImage || ''
      };
      setFormData(updatedData);
      if (onFormDataChange) {
        onFormDataChange(updatedData);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);
    // Notify parent component of form data changes for live preview
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
    // Also notify parent that form data is ready
    if (onFormDataReady) {
      onFormDataReady(updatedData);
    }
  };

  const handleContactDetailsChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      contactDetails: { ...formData.contactDetails, [name]: value }
    };
    setFormData(updatedData);
    // Notify parent component of form data changes for live preview
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const handleImageUpload = async (field, fileEvent) => {
    const file = fileEvent.target.files?.[0];
    if (!file) return;
  
    // Create a URL for immediate preview
    const objectUrl = URL.createObjectURL(file);
    
    // Set immediate preview with object URL
    const updated = { ...formData, [field]: objectUrl };
    setFormData(updated);
    
    // Notify parent immediately
    if (onFormDataChange) onFormDataChange(updated);
    if (onFormDataReady) onFormDataReady(updated);
  
    // Also read as data URL for backup
    const reader = new FileReader();
    reader.onloadend = () => {
      // Update with data URL if object URL fails
      const updatedWithDataUrl = { ...formData, [field]: reader.result };
      setFormData(updatedWithDataUrl);
      if (onFormDataChange) onFormDataChange(updatedWithDataUrl);
      if (onFormDataReady) onFormDataReady(updatedWithDataUrl);
    };
    reader.readAsDataURL(file);
  
    // Upload to server
    try {
      const hostedUrl = await uploadImageToServer(
        file,
        field === 'coverImage' ? 'cover image' : 'profile image'
      );
      if (hostedUrl) {
        // Clean up object URL
        URL.revokeObjectURL(objectUrl);
        
        const finalUpdated = { ...formData, [field]: hostedUrl };
        setFormData(finalUpdated);
        if (onFormDataChange) onFormDataChange(finalUpdated);
        if (onFormDataReady) onFormDataReady(finalUpdated);
      }
    } catch (err) {
      // Keep the object URL or data URL if upload fails
      console.error('Upload failed:', err);
    }
  };

  const handlePhoneChange = (index, field, value) => {
    const newPhones = [...formData.phoneNumbers];
    newPhones[index][field] = value;
    const updatedData = { ...formData, phoneNumbers: newPhones };
    setFormData(updatedData);
    // Notify parent component of form data changes for live preview
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const addPhone = () => {
    const updatedData = {
      ...formData,
      phoneNumbers: [...formData.phoneNumbers, { label: 'work', countryCode: '+971', number: '' }]
    };
    setFormData(updatedData);
    // Notify parent component of form data changes for live preview
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const removePhone = (index) => {
    if (formData.phoneNumbers.length > 1) {
      const updatedData = {
        ...formData,
        phoneNumbers: formData.phoneNumbers.filter((_, i) => i !== index)
      };
      setFormData(updatedData);
      if (onFormDataChange) {
        onFormDataChange(updatedData);
      }
    }
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...formData.emails];
    newEmails[index].emailAddress = value;
    const updatedData = { ...formData, emails: newEmails };
    setFormData(updatedData);
    // Notify parent component of form data changes for live preview
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const addEmail = () => {
    const updatedData = {
      ...formData,
      emails: [...formData.emails, { emailAddress: '' }]
    };
    setFormData(updatedData);
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const removeEmail = (index) => {
    if (formData.emails.length > 1) {
      const updatedData = {
        ...formData,
        emails: formData.emails.filter((_, i) => i !== index)
      };
      setFormData(updatedData);
      if (onFormDataChange) {
        onFormDataChange(updatedData);
      }
    }
  };

  const addSocialMedia = () => {
    if (socialInput.url.trim()) {
      const updatedData = {
        ...formData,
        socialMedia: [...formData.socialMedia, { ...socialInput }]
      };
      setFormData(updatedData);
      setSocialInput({ platform: 'linkedin', url: '' });
      // Notify parent component of form data changes for live preview
      if (onFormDataChange) {
        onFormDataChange(updatedData);
      }
    }
  };

  const removeSocialMedia = (index) => {
    const updatedData = {
      ...formData,
      socialMedia: formData.socialMedia.filter((_, i) => i !== index)
    };
    setFormData(updatedData);
    if (onFormDataChange) {
      onFormDataChange(updatedData);
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.companyDesignation.trim()) {
      setError('Company designation is required');
      return false;
    }
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return false;
    }
    
    // Validate at least one phone number
    const validPhones = formData.phoneNumbers.filter(p => p.number.trim());
    if (validPhones.length === 0) {
      setError('At least one phone number is required');
      return false;
    }
    
    // Validate at least one email
    const validEmails = formData.emails.filter(e => e.emailAddress.trim());
    if (validEmails.length === 0) {
      setError('At least one email address is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    // Just validate and close - don't save yet
    // Profile will be saved when user clicks "Proceed to Payment"
    toast.success('Profile information validated! You can now choose your preview.');
    if (onProfileSaved) {
      onProfileSaved();
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      linkedin: '💼', instagram: '📷', github: '💻',
      twitter: '🐦', facebook: '👥', youtube: '🎥',
      website: '🌐', whatsapp: '💬'
    };
    return icons[platform] || '🔗';
  };

  return (
    <div style={styles.profileContainer}>
      <div style={styles.header}>
        <p style={styles.subtitle}>
          Fill in your details for your business card order
        </p>
      </div>

      <div style={styles.formContainer}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 Basic Information</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="John Doe"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Designation *</label>
            <input
              type="text"
              name="companyDesignation"
              value={formData.companyDesignation}
              onChange={handleInputChange}
              placeholder="Senior Software Engineer"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="TechCorp Solutions"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>About</label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleInputChange}
              placeholder="Brief description about yourself"
              style={styles.textarea}
              rows="3"
            />
          </div>
        </div>

        {/* Photos */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📷 Photos</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('profilePicture', e)}
              style={styles.input}
            />
            {formData.profilePicture && (
              <img
                src={formData.profilePicture}
                alt="Profile preview"
                style={{ marginTop: 8, width: 120, height: 120, objectFit: 'cover', borderRadius: '12px' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload('coverImage', e)}
              style={styles.input}
            />
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Cover preview"
                style={{ marginTop: 8, width: '100%', maxWidth: 280, height: 120, objectFit: 'cover', borderRadius: '12px' }}
                onError={(e) => (e.target.style.display = 'none')}
              />
            )}
          </div>

        </div>

        {/* Phone Numbers */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📞 Phone Numbers *</h3>
          
          {formData.phoneNumbers.map((phone, index) => (
            <div key={index} style={styles.dynamicRow}>
              <select
                value={phone.label}
                onChange={(e) => handlePhoneChange(index, 'label', e.target.value)}
                style={styles.selectSmall}
              >
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="mobile">Mobile</option>
                <option value="home">Home</option>
              </select>
              
              <select
                value={phone.countryCode || '+971'}
                onChange={(e) => handlePhoneChange(index, 'countryCode', e.target.value)}
                style={styles.countryCodeSelect}
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.code}
                  </option>
                ))}
              </select>
              
              <input
                type="tel"
                value={phone.number}
                onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                placeholder="50 000 0000"
                style={styles.inputFlex}
                required={index === 0}
              />
              
              {formData.phoneNumbers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePhone(index)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addPhone}
            style={styles.addBtn}
          >
            + Add Phone Number
          </button>
        </div>

        {/* Email Addresses */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📧 Email Addresses *</h3>
          
          {formData.emails.map((email, index) => (
            <div key={index} style={styles.dynamicRow}>
              <input
                type="email"
                value={email.emailAddress}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                placeholder="john.doe@company.com"
                style={styles.inputFlex}
                required={index === 0}
              />
              
              {formData.emails.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEmail(index)}
                  style={styles.removeBtn}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addEmail}
            style={styles.addBtn}
          >
            + Add Email Address
          </button>
        </div>

        {/* Contact Details */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📍 Contact Details</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={formData.contactDetails.address}
              onChange={handleContactDetailsChange}
              placeholder="123 MG Road"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Emirates</label>
            <input
              type="text"
              name="state"
              value={formData.contactDetails.state}
              onChange={handleContactDetailsChange}
              placeholder="Dubai"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Country</label>
            <input
              type="text"
              name="country"
              value={formData.contactDetails.country}
              onChange={handleContactDetailsChange}
              placeholder="United Arab Emirates"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Google Maps Link</label>
            <input
              type="url"
              name="googleMapLink"
              value={formData.contactDetails.googleMapLink}
              onChange={handleContactDetailsChange}
              placeholder="https://maps.app.goo.gl/example"
              style={styles.input}
            />
          </div>
        </div>

        {/* Social Media */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🌐 Social Media</h3>
          
          {formData.socialMedia.length > 0 && (
            <div style={styles.socialList}>
              {formData.socialMedia.map((social, index) => (
                <div key={index} style={styles.socialItem}>
                  <span style={styles.socialIcon}>{getPlatformIcon(social.platform)}</span>
                  <span style={styles.socialPlatform}>
                    {social.platform.charAt(0).toUpperCase() + social.platform.slice(1)}
                  </span>
                  <span style={styles.socialUrl}>{social.url}</span>
                  <button
                    type="button"
                    onClick={() => removeSocialMedia(index)}
                    style={styles.removeBtn}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.dynamicRow}>
            <select
              value={socialInput.platform}
              onChange={(e) => setSocialInput(prev => ({ ...prev, platform: e.target.value }))}
              style={styles.selectSmall}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="instagram">Instagram</option>
              <option value="github">GitHub</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
              <option value="website">Website</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            
            <input
              type="url"
              value={socialInput.url}
              onChange={(e) => setSocialInput(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://linkedin.com/in/username"
              style={styles.inputFlex}
            />
            
            <button
              type="button"
              onClick={addSocialMedia}
              style={styles.addBtnSmall}
            >
              Add
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            ...styles.submitBtn,
            ...(loading ? styles.submitBtnDisabled : {})
          }}
        >
          {loading ? (
            <>
              <span style={styles.spinner}></span>
              Saving Profile...
            </>
          ) : (
            'Save Profile & Continue'
          )}
        </button>
      </div>
    </div>
  );
};

// Stripe Card Form Component
const StripeCardForm = ({ 
  clientSecret, 
  orderId, 
  onSuccess, 
  onError, 
  selectedAddress,
  totalAmount
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please wait...');
      return;
    }

    setProcessing(true);
    setCardError(null);

    try {
      const cardElement = elements.getElement(CardNumberElement);
      
      if (!cardElement) {
        toast.error('Please enter card details');
        setProcessing(false);
        return;
      }

      // Create payment method
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: selectedAddress?.name || 'Customer',
          phone: selectedAddress?.phone || '',
          address: {
            line1: selectedAddress?.addressLine1 || '',
            line2: selectedAddress?.addressLine2 || '',
            city: selectedAddress?.city || '',
            state: selectedAddress?.state || '',
            postal_code: selectedAddress?.pincode || '',
            country: 'IN'
          }
        }
      });

      if (createError) {
        console.error('Payment method error:', createError);
        setCardError(createError.message);
        toast.error(`Card error: ${createError.message}`);
        setProcessing(false);
        return;
      }

      // Confirm card payment with proper error handling
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
          return_url: `${window.location.origin}/order-success`
        }
      );

      if (confirmError) {
        console.error('Payment confirmation error:', confirmError);
        setCardError(confirmError.message);
        toast.error(`Payment failed: ${confirmError.message}`);
        setProcessing(false);
        return;
      }

      // Handle different payment intent statuses
      switch (paymentIntent.status) {
        case 'succeeded':
          toast.success('Payment successful!');
          onSuccess(orderId, paymentMethod.id, paymentIntent.id);
          break;
          
        case 'requires_action':
          // Handle 3D Secure
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          
          if (actionError) {
            setCardError(actionError.message);
            toast.error(`3D Secure failed: ${actionError.message}`);
            setProcessing(false);
            return;
          }
          
          toast.success('3D Secure authentication successful!');
          onSuccess(orderId, paymentMethod.id, paymentIntent.id);
          break;
          
        case 'requires_payment_method':
          setCardError('Payment failed. Please try another payment method.');
          toast.error('Payment method was declined.');
          break;
          
        default:
          setCardError(`Payment status: ${paymentIntent.status}`);
          toast.error(`Payment ${paymentIntent.status}`);
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setCardError('An unexpected error occurred. Please try again.');
      toast.error('Payment failed. Please try again.');
      onError(error);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
    hidePostalCode: true,
  };

  return (
    <div style={styles.paymentContainer} className="checkout-payment-container">
      <div style={styles.paymentHeader}>
        <h3 style={styles.paymentTitle}>Secure Payment</h3>
        <div style={styles.paymentAmount}>
          <span>Amount to Pay:</span>
          <span style={styles.amountValue}>AED {totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.stripeForm}>
        <div style={styles.stripeSection}>
          <label style={styles.stripeLabel}>Card Number</label>
          <div style={styles.stripeInputWrapper}>
            <CardNumberElement 
              options={cardElementOptions}
              style={styles.cardElement}
            />
          </div>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formHalf}>
            <label style={styles.stripeLabel}>Expiry Date</label>
            <div style={styles.stripeInputWrapper}>
              <CardExpiryElement options={cardElementOptions} />
            </div>
          </div>
          <div style={styles.formHalf}>
            <label style={styles.stripeLabel}>CVC</label>
            <div style={styles.stripeInputWrapper}>
              <CardCvcElement options={cardElementOptions} />
            </div>
          </div>
        </div>

        {cardError && (
          <div style={styles.cardError}>
            <span style={styles.errorIcon}>⚠</span>
            <span style={{ flex: 1 }}>{cardError}</span>
            <button 
              onClick={() => setCardError(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ×
            </button>
          </div>
        )}

        <div style={styles.securityNote}>
          <span style={styles.lockIcon}>🔒</span>
          Your payment is secured with 256-bit SSL encryption
        </div>

        <button
          type="submit"
          disabled={!stripe || processing}
          style={{
            ...styles.payButton,
            ...((processing || !stripe) ? styles.payButtonDisabled : {})
          }}
        >
          {processing ? (
            <>
              <div style={styles.spinner}></div>
              Processing Payment...
            </>
          ) : `Pay AED ${totalAmount.toFixed(2)}`}
        </button>
        
        <div style={styles.cardLogos}>
          <span>Accepted Cards:</span>
          <div style={styles.logos}>
            <span style={styles.cardLogo}>💳</span>
            <span style={styles.cardLogo}>Visa</span>
            <span style={styles.cardLogo}>Mastercard</span>
            <span style={styles.cardLogo}>RuPay</span>
          </div>
        </div>
      </form>
    </div>
  );
};

// Address Form Component
const AddressForm = ({ 
  onClose, 
  onAddressAdded, 
  initialAddress = {
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  }
}) => {
  const [newAddress, setNewAddress] = useState({
    ...initialAddress,
    country: initialAddress.country || 'United Arab Emirates',
    state: initialAddress.state || 'Dubai'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = getUserId();
    if (!userId) {
      toast.error('Please login to add address');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://pg-cards.vercel.app/user/addAddress', {
        userId,
        ...newAddress
      });

      if (response.data.status === 'SUCCESS') {
        toast.success('Address added successfully');
        if (onAddressAdded) {
          onAddressAdded(response.data.data);
        }
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.addressFormOverlay}>
      <div style={styles.addressForm}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>Add New Address</h2>
          <button 
            style={styles.closeBtn}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={newAddress.name}
                onChange={handleChange}
                placeholder="John Doe"
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={newAddress.phone}
                onChange={handleChange}
                placeholder="+971 50 000 0000"
                style={styles.input}
                required
              />
            </div>
          </div>
          
          <div>
            <label style={styles.label}>Address Line 1 *</label>
            <input
              type="text"
              name="addressLine1"
              value={newAddress.addressLine1}
              onChange={handleChange}
              placeholder="House No, Building, Street"
              style={styles.input}
              required
            />
          </div>
          
          <div>
            <label style={styles.label}>Address Line 2</label>
            <input
              type="text"
              name="addressLine2"
              value={newAddress.addressLine2}
              onChange={handleChange}
              placeholder="Area, Locality"
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>City *</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleChange}
                placeholder="City"
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Emirates *</label>
              <input
                type="text"
                name="state"
                value={newAddress.state}
                onChange={handleChange}
                placeholder="Dubai"
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <label style={styles.label}>Pincode *</label>
              <input
                type="text"
                name="pincode"
                value={newAddress.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                style={styles.input}
                required
                pattern="[0-9]{6}"
                maxLength="6"
              />
            </div>
          </div>
          
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isDefault"
              checked={newAddress.isDefault}
              onChange={handleChange}
              style={{ marginRight: '8px' }}
            />
            Set as default address
          </label>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {})
            }}
          >
            {loading ? 'Adding Address...' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Template Preview Component
const TemplatePreviewSelector = ({ userProfile, selectedTemplate, onTemplateSelect }) => {
  const renderAddToContactsButton = (styleOverrides = {}) => (
    <div style={{ marginTop: 'auto' }}>
      <button
        type="button"
        style={{
          width: '100%',
          padding: '12px',
          background: '#4CAF50',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          ...styleOverrides,
        }}
      >
        Add to Contacts
      </button>
    </div>
  );
  const renderTemplatePreview = (templateId) => {
    const profileData = userProfile || {};
    const allPhones = (profileData?.phoneNumbers || []).map(phoneObj => {
      if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
        return phoneObj.number;
      }
      return phoneObj.countryCode 
        ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
        : phoneObj.number || '';
    }).filter(p => p);
    const phone = allPhones[0] || '+971 50 000 0000';
    const allEmails = (profileData?.emails || []).map(e => e.emailAddress).filter(e => e);
    const email = allEmails[0] || 'john.doe@company.com';
    const fullName = profileData?.fullName || 'John Doe';
    const designation = profileData?.companyDesignation || 'Software Engineer';
    const company = profileData?.companyName || 'Tech Company Inc.';
    const about = profileData?.about || '';
    const contactDetails = profileData?.contactDetails || {};
    const address = contactDetails.address || '';
    const emirates = contactDetails.state || '';
    const country = contactDetails.country || '';
    const profilePic = profileData?.profilePicture || profileData?.profileImage || '';
    const coverImage = profileData?.coverImage || '';
    const socialMedia = profileData?.socialMedia || [];

    const baseCard = {
      borderRadius: 16,
      padding: '16px',
      minHeight: '280px',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    };

    if (templateId === 'standard') {
      return (
        <div style={{ ...baseCard, background: '#fff', border: '1px solid #e0e0e0' }}>
          {coverImage && (
            <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ width: '100%', height: 120, background: `url(${coverImage}) center/cover no-repeat` }} />
            </div>
          )}
          {profilePic && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <img src={profilePic} alt="Profile" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #81C784' }} />
            </div>
          )}
          <h3 style={{ textAlign: 'center', margin: '4px 0', color: '#000' }}>{fullName}</h3>
          <p style={{ textAlign: 'center', margin: '2px 0', color: '#666' }}>{designation}</p>
          <p style={{ textAlign: 'center', margin: '2px 0', color: '#000' }}>{company}</p>
          {about && <p style={{ marginTop: 12, color: '#555', fontSize: 12 }}>{about}</p>}
          <div style={{ marginTop: 12, fontSize: 12, color: '#000' }}>
            {phone && <div>📞 {phone}</div>}
            {email && <div>📧 {email}</div>}
            {address && <div>📍 {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}</div>}
          </div>
          {socialMedia.length > 0 && (
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {socialMedia.slice(0, 3).map((s, i) => (
                <a key={i} href={s.url || '#'} onClick={e => !s.url && e.preventDefault()} style={{ padding: '6px 10px', border: '1px solid #81C784', borderRadius: 6, fontSize: 11, color: '#000', textDecoration: 'none' }}>
                  {s.platform || 'Link'}
                </a>
              ))}
            </div>
          )}
          {renderAddToContactsButton({ marginTop: 12 })}
        </div>
      );
    }

    if (templateId === 'modern') {
      return (
        <div style={{ ...baseCard, background: coverImage ? `linear-gradient(180deg, rgba(156,136,255,0.9) 0%, rgba(118,75,162,0.9) 100%), url(${coverImage}) center/cover no-repeat` : 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)', color: '#fff' }}>
          {profilePic && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <img src={profilePic} alt="Profile" style={{ width: 78, height: 78, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.3)' }} />
            </div>
          )}
          <h3 style={{ textAlign: 'center', margin: '4px 0' }}>{fullName}</h3>
          <p style={{ textAlign: 'center', margin: '2px 0' }}>{designation}</p>
          <p style={{ textAlign: 'center', margin: '2px 0' }}>{company}</p>
          {about && <p style={{ marginTop: 12, color: '#fff', opacity: 0.9, fontSize: 12 }}>{about}</p>}
          <div style={{ marginTop: 12, fontSize: 12 }}>
            {phone && <div>📞 {phone}</div>}
            {email && <div>📧 {email}</div>}
            {address && <div>📍 {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}</div>}
          </div>
          {socialMedia.length > 0 && (
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {socialMedia.slice(0, 3).map((s, i) => (
                <a key={i} href={s.url || '#'} onClick={e => !s.url && e.preventDefault()} style={{ padding: '8px 12px', background: '#005885', color: '#fff', borderRadius: 8, fontSize: 11, textDecoration: 'none' }}>
                  {s.platform || 'Link'}
                </a>
              ))}
            </div>
          )}
          {renderAddToContactsButton({ background: 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)', color: '#fff', marginTop: 12 })}
        </div>
      );
    }

    if (templateId === 'map') {
      return (
        <div style={{ ...baseCard, background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)', color: '#fff' }}>
          {(coverImage || profilePic) && (
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <div style={{ height: 110, borderRadius: 12, background: coverImage ? `url(${coverImage}) center/cover no-repeat` : 'rgba(255,255,255,0.12)' }} />
              {profilePic && (
                <img src={profilePic} alt="Profile" style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', position: 'absolute', left: '50%', bottom: -35, transform: 'translateX(-50%)' }} />
              )}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: profilePic ? 40 : 0, marginBottom: 12 }}>
            <h3 style={{ margin: '4px 0' }}>{fullName}</h3>
            <p style={{ margin: '2px 0' }}>{designation}</p>
            <p style={{ margin: '2px 0' }}>{company}</p>
          </div>
          <div style={{ fontSize: 12, marginBottom: 12 }}>
            {phone && <div>📞 {phone}</div>}
            {email && <div>📧 {email}</div>}
          </div>
          {socialMedia.length > 0 && (
            <div style={{ marginTop: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {socialMedia.slice(0, 3).map((s, i) => (
                <a key={i} href={s.url || '#'} onClick={e => !s.url && e.preventDefault()} style={{ padding: '8px 12px', background: '#2E7D32', color: '#fff', borderRadius: 8, fontSize: 11, textDecoration: 'none' }}>
                  {s.platform || 'Link'}
                </a>
              ))}
            </div>
          )}
          {renderAddToContactsButton({ background: 'linear-gradient(135deg, #34A853 0%, #0b8043 100%)', color: '#fff', marginTop: 12 })}
        </div>
      );
    }

    // Epic
    return (
      <div style={{ ...baseCard, background: coverImage ? `linear-gradient(rgba(0,0,0,0.92), rgba(0,0,0,0.92)), url(${coverImage}) center/cover no-repeat` : '#000', color: '#fff', border: '2px solid #ffeb3b' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          {profilePic && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
              <img src={profilePic} alt="Profile" style={{ width: 78, height: 78, borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffeb3b' }} />
            </div>
          )}
          <h3 style={{ margin: '4px 0' }}>{fullName}</h3>
          <p style={{ margin: '2px 0', color: '#ffeb3b' }}>{designation}</p>
          <p style={{ margin: '2px 0', opacity: 0.8 }}>{company}</p>
        </div>
        {about && <p style={{ textAlign: 'center', color: '#fff', opacity: 0.7, fontSize: 11 }}>{about}</p>}
        <div style={{ height: 1, background: '#ffeb3b', margin: '10px 0' }} />
        <div style={{ fontSize: 11, marginBottom: 12 }}>
          {allPhones.map((p, i) => <div key={i}>📞 {p}</div>)}
          {allEmails.map((e, i) => <div key={i}>📧 {e}</div>)}
          {address && <div>📍 {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}</div>}
        </div>
        {socialMedia.length > 0 && (
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            {socialMedia.slice(0, 3).map((s, i) => (
              <a key={i} href={s.url || '#'} onClick={e => !s.url && e.preventDefault()} style={{ flex: 1, padding: '8px 10px', border: '1px solid #ffeb3b', color: '#fff', textAlign: 'center', borderRadius: 8, fontSize: 11, textDecoration: 'none' }}>
                {s.platform || 'Link'}
              </a>
            ))}
          </div>
        )}
        {renderAddToContactsButton({ background: '#ffeb3b', color: '#000', marginTop: 12 })}
      </div>
    );
  };

  return (
    <div style={styles.templateSelector}>
      <p style={styles.templateSelectorDesc} className="checkout-template-selector-desc">
        Choose a design template for your business card preview
      </p>
      <div style={styles.templatesGrid} className="checkout-template-grid">
        {TEMPLATE_OPTIONS.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            style={{
              ...styles.templateCard,
              ...(selectedTemplate === template.id ? styles.templateCardSelected : {})
            }}
            className="checkout-template-card"
          >
            <div style={styles.templatePreviewWrapper} className="checkout-template-preview">
              {renderTemplatePreview(template.id)}
            </div>
            <div style={styles.templateInfo} className="checkout-template-info">
              <h4 style={styles.templateName} className="checkout-template-name">{template.label}</h4>
              <p style={styles.templateDescription} className="checkout-template-description">{template.description}</p>
            </div>
            {selectedTemplate === template.id && (
              <div style={styles.selectedBadge}>✓ Selected</div>
            )}
          </div>
        ))}
      </div>

      {selectedTemplate && (
  <div style={styles.selectedTemplatePreviewCard} className="checkout-selected-template-preview">
    <div style={styles.selectedTemplatePreviewHeader}>
      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111' }}>Selected Theme Preview</h4>
      <p style={{ margin: '6px 0 0', fontSize: 12, color: '#555' }}>
        Your profile image, cover photo, and contact details appear here.
      </p>
    </div>
    <div style={styles.selectedTemplatePreviewWrapper}>
      {/* Use ProfilePreview to mirror QR scan view */}
      <ProfilePreview
        profile={userProfile}
        themeOverride={selectedTemplate}
      />
    </div>
  </div>
)}
    </div>
  );
};

// Main Checkout Component
const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [trialSelected, setTrialSelected] = useState(false); // 3-day trial opt-in
  const [profileSaved, setProfileSaved] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [liveFormData, setLiveFormData] = useState(null); // For real-time preview updates

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
    fetchUserProfile();
    // Load selected template from localStorage if exists
    const savedTemplate = localStorage.getItem('selectedCardTemplate');
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  // Initialize liveFormData with userProfile when it loads
  useEffect(() => {
    if (userProfile && !liveFormData) {
      setLiveFormData(userProfile);
    }
  }, [userProfile]);

  const fetchUserProfile = async () => {
    const profileId = localStorage.getItem('userProfileId');
    if (!profileId) return;

    try {
      const response = await fetch(
        `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
      );
      const result = await response.json();
      if (response.ok && result?.data) {
        // Parse phone numbers to extract country code if needed
        const profileData = result.data;
        if (profileData.phoneNumbers && profileData.phoneNumbers.length > 0) {
          profileData.phoneNumbers = profileData.phoneNumbers.map(phone => {
            // If phone number starts with +, try to extract country code
            if (phone.number && phone.number.startsWith('+')) {
              const parts = phone.number.split(' ');
              if (parts.length > 1) {
                return {
                  ...phone,
                  countryCode: parts[0],
                  number: parts.slice(1).join(' ')
                };
              }
            }
            return { ...phone, countryCode: phone.countryCode || '+971' };
          });
        }
        setUserProfile(profileData);
        setLiveFormData(profileData); // keep previews in sync with loaded profile
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchCartItems = async () => {
    const userId = getUserId();
    if (!userId) {
      toast.error('Please login to view cart');
      navigateTo('/');
      return;
    }

    try {
      const response = await axios.post('https://pg-cards.vercel.app/cart/getUserCart', {
        userId
      });
      
      if (response.data.msg === 'Cart fetched') {
        const cartData = response.data.data;
        const items = cartData.items || [];
        setCartItems(items.map(item => ({
          _id: item._id,
          // Force quantity to 1 to show exact product price
          quantity: 1,
          product: item.productId
        })));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await axios.get(`https://pg-cards.vercel.app/user/addresses/${userId}`);
      if (response.data.status === 'SUCCESS') {
        const addressList = response.data.data || [];
        setAddresses(addressList);
        const defaultAddr = addressList.find(addr => addr.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Navigation helper function
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  const updateQuantity = async (itemId, newQuantity) => {
    // Ensure quantity is at least 1 and is a valid integer
    const validQuantity = Math.max(1, Math.floor(Number(newQuantity) || 1));

    try {
      const userId = getUserId();
      await axios.post('https://pg-cards.vercel.app/cart/updateQuantity', {
        userId,
        itemId,
        quantity: validQuantity
      });
      
      setCartItems(cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: validQuantity } : item
      ));
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const userId = getUserId();
      await axios.post('https://pg-cards.vercel.app/cart/removeItem', {
        userId,
        itemId
      });
      
      setCartItems(cartItems.filter(item => item._id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses([...addresses, newAddress]);
    setSelectedAddress(newAddress);
    setShowAddressForm(false);
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const response = await axios.post('https://pg-cards.vercel.app/coupon/apply', {
        code: couponCode,
        userId: getUserId(),
        cartTotal: calculateSubtotal()
      });

      if (response.data.status === 'SUCCESS') {
        setAppliedCoupon(response.data.data);
        toast.success('Coupon applied successfully!');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((sum, item) => {
      const product = item.product;
      if (!product) return sum;
      
      const variant = product?.variants?.[0];
      // Use the exact same price logic as displayed: variant price first, then basePrice
      // According to API: variant.price = 999, product.basePrice = 899
      const price = variant?.price !== undefined ? variant.price : (product?.basePrice !== undefined ? product.basePrice : 0);
      
      // Ensure price is a number (should be 999 from variant)
      let numericPrice = 0;
      if (typeof price === 'number' && !isNaN(price)) {
        numericPrice = price;
      } else if (typeof price === 'string') {
        numericPrice = parseFloat(price) || 0;
      }
      
      // Force quantity to 1 to show exact product price (999)
      const quantity = 1;
      
      const itemTotal = numericPrice * quantity;
      return sum + itemTotal;
    }, 0);
  };

  const calculateDiscount = () => {
    let discount = 0;
    cartItems.forEach(item => {
      const product = item.product;
      const variant = product?.variants?.[0];
      if (variant?.originalPrice && variant?.price) {
        const itemDiscount = (variant.originalPrice - variant.price) * (item.quantity || 1);
        discount += itemDiscount;
      }
    });
    return discount;
  };

  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return appliedCoupon.value;
  };

  /**
   * Upload a dataURL/base64 image to backend and return a hosted URL.
   * If the incoming value is already a URL, return it unchanged.
   */
  const uploadImageIfNeeded = async (imageValue, label = 'image') => {
    if (!imageValue) return '';

    // Already a hosted URL
    if (typeof imageValue === 'string' && /^https?:\/\//i.test(imageValue)) {
      return imageValue;
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      toast.error('Missing Cloudinary preset. Set REACT_APP_CLOUDINARY_UPLOAD_PRESET.');
      return imageValue; // fallback to existing value to avoid blocking
    }

    // If it's not a data URL, pass through
    if (typeof imageValue !== 'string' || !imageValue.startsWith('data:')) {
      return imageValue;
    }

    try {
      const blob = await (await fetch(imageValue)).blob();
      const formData = new FormData();
      const extension = blob.type?.split('/')?.[1] || 'png';
      formData.append('file', blob, `upload-${Date.now()}.${extension}`);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      if (CLOUDINARY_FOLDER) formData.append('folder', CLOUDINARY_FOLDER);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const uploadJson = await uploadResponse.json().catch(() => ({}));
      const uploadedUrl = uploadJson?.secure_url || uploadJson?.url;

      if (uploadResponse.ok && uploadedUrl) {
        return uploadedUrl;
      }

      const message =
        uploadJson?.error?.message ||
        uploadJson?.message ||
        'Upload failed';
      toast.error(`${message}. Using local image instead.`);
      return imageValue; // fallback to base64/data URL so save can proceed
    } catch (err) {
      console.error(`Failed to upload ${label}:`, err);
      toast.error(`Failed to upload ${label}. Using local image instead.`);
      return imageValue; // fallback to avoid blocking
    }
  };

  const calculateGST = () => {
    // Not used anymore - kept for compatibility
    return 0;
  };

  const calculateTotal = () => {
    // Only return the product subtotal - no additional charges
    // Use exactly the same calculation as calculateSubtotal
    return calculateSubtotal();
  };

 const createPaymentIntent = async () => {
  if (cartItems.length === 0) {
    toast.error('Your cart is empty');
    return false;
  }

  if (!liveFormData && !userProfile) {
    toast.error('Please complete your profile information first');
    setShowProfileForm(true);
    return false;
  }

  if (!selectedTemplate) {
    toast.error('Please select a card preview template first');
    return false;
  }

  setProcessingPayment(true);

  try {
    const userId = getUserId();
    const amount = Math.round(calculateTotal() * 100);

    // Assuming you want to process only the first item in cart
    // Or you need to adjust the API to accept cart items array
    const firstCartItem = cartItems[0];
    
          // Based on Postman screenshot, the API expects specific fields
          const paymentResponse = await axios.post('https://pg-cards.vercel.app/payment/createPayment', {
            amount: amount,
            userId: userId,
            productId: firstCartItem.product?._id,
            variantId: firstCartItem.product?.variants?.[0]?._id,
            isTrial: trialSelected ? true : false, // flag to inform backend about 3-day trial
          });

    console.log('Payment intent response:', paymentResponse.data);

    // Based on Postman response, check for the correct message
    if (paymentResponse.data.msg === 'Order Created & Payment Intent Generated') {
      const { orderId, clientSecret, paymentIntentId } = paymentResponse.data.data;
      setOrderId(orderId);
      setClientSecret(clientSecret);
      setPaymentIntentId(paymentIntentId);
      setShowPaymentForm(true);
      toast.success('Payment initialized successfully!');
      return true;
    }
    
    toast.error(paymentResponse.data.message || 'Failed to create payment intent');
    return false;
  } catch (error) {
    console.error('Error creating payment intent:', error.response?.data || error);
    toast.error(error.response?.data?.message || 'Failed to initialize payment. Please try again.');
    return false;
  } finally {
    setProcessingPayment(false);
  }
};

 const handlePaymentSuccess = async (orderId, paymentMethodId, stripePaymentIntentId) => {
  try {
    // First, confirm the payment on backend
    const confirmResponse = await axios.post(
      'https://pg-cards.vercel.app/payment/confirmPayment',
      {
        orderId,
        paymentIntentId: stripePaymentIntentId,
        paymentMethodId: paymentMethodId
      }
    );

    console.log('Payment confirmation response:', confirmResponse.data);

    if (confirmResponse.data.status === 'SUCCESS' || 
        confirmResponse.data.code === 200 || 
        confirmResponse.data.msg === 'Payment confirmed successfully') {
      
      // Update local cart state to empty
      setCartItems([]);
      
      toast.success('Payment successful! Order confirmed.');
      navigateTo('/order-success');
    } else {
      toast.error('Payment confirmation failed on server');
    }
  } catch (error) {
    console.error('Error confirming payment:', error.response?.data || error);
    toast.error(error.response?.data?.message || 'Payment confirmation failed. Please contact support.');
  }
};

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const handleProceedToPayment = async () => {
    // First save the profile with theme, then proceed to payment
    if (!liveFormData && !userProfile) {
      toast.error('Please complete your profile information first');
      setShowProfileForm(true);
      return;
    }
    
    // Save profile with theme before proceeding to payment
    await saveProfileWithTheme();
    await createPaymentIntent();
  };

  const handleStartTrial = async () => {
    if (processingPayment) return;
    if (!liveFormData && !userProfile) {
      toast.error('Please complete your profile information first');
      setShowProfileForm(true);
      return;
    }
    if (!selectedTemplate) {
      toast.error('Please select a preview template first');
      return;
    }

    try {
      setProcessingPayment(true);
      setTrialSelected(true);
      await saveProfileWithTheme();
      navigateTo('/order-success?trial=true');
    } catch (err) {
      console.error('Error starting trial:', err);
      toast.error(err?.message || 'Unable to start trial. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  const saveProfileWithTheme = async () => {
    if (!liveFormData && !userProfile) {
      return; // No data to save
    }
    
    try {
      // Use liveFormData if available, otherwise use userProfile
      const profileData = liveFormData || userProfile;
      
      // Combine country code with phone number
      const cleanedPhoneNumbers = profileData.phoneNumbers
        ?.filter(p => p && p.number && p.number.trim())
        .map(p => {
          // If already combined (starts with +), use as is; otherwise combine
          if (p.number && p.number.startsWith('+') && !p.countryCode) {
            return { label: p.label || 'work', number: p.number };
          }
          return {
            label: p.label || 'work',
            number: p.countryCode ? `${p.countryCode} ${p.number.trim()}` : p.number.trim()
          };
        }) || [];
      
      // Upload images first (profile, cover, optional logo)
      const rawProfileImage = profileData.profilePicture || profileData.profileImage || '';
      const rawCoverImage = profileData.coverImage || '';

      const [profilePictureUrl, coverImageUrl] = await Promise.all([
        uploadImageIfNeeded(rawProfileImage, 'profile image'),
        uploadImageIfNeeded(rawCoverImage, 'cover image'),
      ]);

      const cleanedData = {
        ...profileData,
        // ensure images are uploaded then passed to API
        profilePicture: profilePictureUrl || rawProfileImage,
        profileImage: profilePictureUrl || rawProfileImage,
        coverImage: coverImageUrl || rawCoverImage,
        phoneNumbers: cleanedPhoneNumbers,
        emails: profileData.emails?.filter(e => e.emailAddress?.trim()) || [],
        // Include theme (backend expects 'theme' not 'selectedTemplate')
        ...(selectedTemplate && { theme: selectedTemplate })
      };

      console.log('Saving profile with theme before payment:', cleanedData);

      const response = await fetch('https://pg-cards.vercel.app/userProfile/saveUserProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save profile');
      }

      const result = await response.json();
      console.log('Profile saved before payment:', result);

      // Store the profile ID and theme
      try {
        const profileId = result?.data?._id || result?.data?.id;
        if (profileId) {
          localStorage.setItem('userProfileId', profileId);
        }
        // Also save the selected theme to localStorage for consistency
        if (selectedTemplate) {
          localStorage.setItem('selectedCardTemplate', selectedTemplate);
        }
      } catch (e) {
        console.warn('Unable to cache profile id or theme', e);
      }

      // Update userProfile state
      setUserProfile(cleanedData);
      setLiveFormData(cleanedData); // ensure previews keep the saved images/values
      setProfileSaved(true);
      
      toast.success('Profile saved successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.message || 'Failed to save profile. Please try again.');
      throw err; // Re-throw to prevent payment if profile save fails
    }
  };

  const handleProfileSaved = async () => {
    // Just mark profile as filled (not saved yet)
    // Profile will be saved when user clicks "Proceed to Payment"
    setProfileSaved(true);
    setShowProfileForm(false);
    toast.success('Profile information completed! Now choose your preview and proceed to payment.');
  };

  const handleTemplateSelect = async (templateId) => {
    setSelectedTemplate(templateId);
    localStorage.setItem('selectedCardTemplate', templateId);
    
    // If we have profile data, immediately save the theme to backend
    // This ensures the QR code is generated with the correct theme
    if ((liveFormData || userProfile) && templateId) {
      try {
        const profileData = liveFormData || userProfile;
        const userId = getUserId();
        const profileId = localStorage.getItem('userProfileId');
        
        if (userId && profileId) {
          console.log('Immediately saving theme selection:', templateId);
          
          const response = await fetch('https://pg-cards.vercel.app/userProfile/saveUserProfile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...profileData,
              userId: userId,
              _id: profileId,
              theme: templateId
            })
          });
          
          if (response.ok) {
            console.log('Theme saved successfully to backend');
          } else {
            console.warn('Failed to save theme to backend');
          }
        }
      } catch (error) {
        console.warn('Error saving theme immediately:', error);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading checkout...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div style={styles.container} className="checkout-container">
        <div style={styles.content} className="checkout-responsive-content">
          <div style={styles.leftSection}>
            {/* Step 1: Profile Information */}
            <div style={styles.section}>
              <div style={styles.stepHeader} className="checkout-step-header">
                <div style={styles.stepNumber} className="checkout-step-number">1</div>
                <h2 style={styles.stepTitle} className="checkout-step-title">Profile Information</h2>
                {profileSaved && <span style={styles.checkmark}>✓</span>}
              </div>
              <div style={styles.addressContent}>
                {!profileSaved ? (
                  <button 
                    style={styles.addAddressBtn} 
                    onClick={() => setShowProfileForm(true)}
                  >
                    + Add Profile Information
                  </button>
                ) : (
                  <div style={styles.profileSaved}>
                    <span style={styles.checkmark}>✓</span>
                    Profile information saved
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Choose Preview */}
            {(profileSaved || liveFormData) && (
              <div style={styles.section}>
                <div style={styles.stepHeader} className="checkout-step-header">
                  <div style={styles.stepNumber} className="checkout-step-number">2</div>
                  <h2 style={styles.stepTitle} className="checkout-step-title">Choose Your Preview</h2>
                  {profileSaved && selectedTemplate && <span style={styles.checkmark}>✓</span>}
                </div>
                <div style={styles.addressContent} className="checkout-address-content">
                  {(liveFormData || userProfile) && (
                    <TemplatePreviewSelector
                      userProfile={liveFormData || userProfile}
                      selectedTemplate={selectedTemplate}
                      onTemplateSelect={handleTemplateSelect}
                    />
                  )}
                  {liveFormData && (
                    <p style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      marginTop: '12px', 
                      fontStyle: 'italic',
                      textAlign: 'center'
                    }}>
                      💡 Preview updates as you fill the profile form
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Delivery Address - Commented out */}
            {/* <div style={styles.section}>
              <div style={styles.stepHeader}>
                <div style={styles.stepNumber}>2</div>
                <h2 style={styles.stepTitle}>Delivery Address</h2>
                {selectedAddress && <span style={styles.checkmark}>✓</span>}
              </div>

              <div style={styles.addressContent}>
                {addresses.length === 0 ? (
                  <div style={styles.noAddressContainer}>
                    <p style={styles.noAddressText}>No Saved Address yet!</p>
                    <button style={styles.addAddressBtn} onClick={() => setShowAddressForm(true)}>
                      + Add New Address
                    </button>
                  </div>
                ) : (
                  <>
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="checkout-address-card"
                        style={{
                          ...styles.addressCard,
                          ...(selectedAddress?._id === address._id ? styles.addressCardSelected : {})
                        }}
                        onClick={() => setSelectedAddress(address)}
                      >
                        <input
                          type="radio"
                          checked={selectedAddress?._id === address._id}
                          onChange={() => setSelectedAddress(address)}
                          style={styles.radioInput}
                        />
                        <div style={styles.addressDetails}>
                          <div style={styles.addressName}>{address.name}</div>
                          <div style={styles.addressText}>
                            {address.addressLine1}, {address.addressLine2}
                          </div>
                          <div style={styles.addressText}>
                            {address.city}, {address.state} - {address.pincode}
                          </div>
                          <div style={styles.addressPhone}>Phone: {address.phone}</div>
                          {address.isDefault && (
                            <div style={styles.defaultBadge}>Default</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    <button style={styles.addNewAddressBtn} onClick={() => setShowAddressForm(true)}>
                      + Add New Address
                    </button>
                  </>
                )}
              </div>
            </div> */}

            {/* Step 3: Payment */}
            {!showPaymentForm ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button 
                  className="checkout-proceed-btn"
                  style={{
                    ...styles.proceedBtn,
                    ...(processingPayment 
                      || !selectedTemplate
                      || (!liveFormData && !userProfile) ? styles.proceedBtnDisabled : {})
                  }} 
                  onClick={handleProceedToPayment}
                  disabled={processingPayment || cartItems.length === 0 || 
                    (!liveFormData && !userProfile) || !selectedTemplate}
                >
                  {processingPayment ? (
                    <>
                      <div style={styles.buttonSpinner}></div>
                      Initializing Payment...
                    </>
                  ) :  
                    (!liveFormData && !userProfile) ? 'Complete Profile Information' :
                    !selectedTemplate ? 'Choose Your Preview' :
                    'Proceed to Payment'}
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.proceedBtn,
                    backgroundColor: '#fff7e6',
                    color: '#8c6b2f',
                    border: '1px solid #ffd591'
                  }}
                  disabled={processingPayment || cartItems.length === 0 || (!liveFormData && !userProfile)}
                  onClick={handleStartTrial}
                >
                  Start 3-Day Free Trial
                </button>
              </div>
            ) : (
              <div style={styles.paymentContainerWrapper}>
                <div style={styles.section}>
                  <div style={styles.stepHeader} className="checkout-step-header">
                    <div style={styles.stepNumber} className="checkout-step-number">3</div>
                    <h2 style={styles.stepTitle} className="checkout-step-title">Payment Details</h2>
                  </div>
                  {selectedTemplate && (
                    <div style={styles.selectedTemplateInfo}>
                      <span style={styles.selectedTemplateLabel}>Selected Template: </span>
                      <span style={styles.selectedTemplateValue}>
                        {TEMPLATE_OPTIONS.find(t => t.id === selectedTemplate)?.label || selectedTemplate}
                      </span>
                    </div>
                  )}



                  <div style={styles.paymentContent}>
                    {clientSecret && (
                      <StripeCardForm
                        clientSecret={clientSecret}
                        orderId={orderId}
                        selectedAddress={selectedAddress}
                        totalAmount={calculateTotal()}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        disabled={!trialSelected}
                      />
                    )}
                    <button 
                      style={styles.backToAddressBtn}
                      onClick={() => setShowPaymentForm(false)}
                    >
                      ← Back to Address
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <p style={styles.note}>
              Note: Once payment is complete, our sales team will promptly reach out to you.
            </p>
          </div>

          {/* Order Summary */}
          <div style={styles.rightSection} className="checkout-responsive-right checkout-right-section">
            <h2 style={styles.summaryTitle} className="checkout-summary-title">Order Summary</h2>

            {cartItems.length === 0 ? (
              <div style={styles.emptyCart}>
                <p style={styles.emptyCartText}>Your cart is empty</p>
                <button 
                  style={styles.continueShoppingBtn}
                  onClick={() => navigateTo('/products')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {cartItems.map((item) => {
                  const product = item.product;
                  const variant = product?.variants?.[0];
                  // Use exact same price logic as calculateSubtotal: variant price first, then basePrice
                  const price = variant?.price || product?.basePrice || 0;
                  const numericPrice = typeof price === 'number' ? price : (typeof price === 'string' ? parseFloat(price) || 0 : 0);
                  const originalPrice = variant?.originalPrice || product?.originalPrice;
                  const numericOriginalPrice = typeof originalPrice === 'string' ? parseFloat(originalPrice) : (typeof originalPrice === 'number' ? originalPrice : null);
                  const discount = numericOriginalPrice && numericOriginalPrice > numericPrice ? Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100) : 0;
                  const color = variant?.color || 'Default';
                  const finish = variant?.finish || 'Standard';

                  return (
                    <div key={item._id} style={styles.cartItem} className="checkout-cart-item">
                      <img
                        src={variant?.frontImage || 'https://via.placeholder.com/120'}
                        alt={product?.title}
                        style={styles.productImage}
                        className="checkout-product-image"
                      />
                      <div style={styles.productInfo}>
                        <h3 style={styles.productTitle} className="checkout-product-title">{product?.title}</h3>
                        <p style={styles.productVariant} className="checkout-product-variant">
                          {color} with {finish}
                        </p>
                        <div style={styles.priceRow}>
                          <span style={styles.productPrice}>AED {numericPrice}</span>
                          {originalPrice && originalPrice > numericPrice && (
                            <>
                              <span style={styles.originalPrice}>AED {originalPrice}</span>
                              <span style={styles.discountBadge}>{discount}% off</span>
                            </>
                          )}
                        </div>
                        
                       
                      </div>
                      
                      <button 
                        style={styles.removeBtn} 
                        onClick={() => removeItem(item._id)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}

                <div style={styles.deliveryInfo}>
                  Products will delivered within 5-7 Working Days
                </div>

                {/* Coupon Section */}
             

                <div style={styles.priceDetails}>
                  <h3 style={styles.priceDetailsTitle}>Price Details</h3>
                  
                  <div style={{...styles.priceRow, ...styles.totalRow}}>
                    <span style={styles.totalLabel}>Total Payable</span>
                    <span style={styles.totalAmount}>AED {calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {showAddressForm && (
          <AddressForm
            onClose={() => setShowAddressForm(false)}
            onAddressAdded={handleAddressAdded}
          />
        )}

        {showProfileForm && (
          <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="checkout-modal-content">
            <div style={styles.modalHeader} className="checkout-modal-header">
              <h2 style={styles.modalTitle} className="checkout-modal-title">Complete Your Profile</h2>
                <button 
                  style={styles.closeBtn}
                  onClick={() => {
                    setShowProfileForm(false);
                    // Keep liveFormData for preview even when modal closes
                  }}
                  type="button"
                >
                  ×
                </button>
              </div>
              <ProfileForm 
                onProfileSaved={handleProfileSaved} 
                selectedTemplate={selectedTemplate}
                onFormDataChange={setLiveFormData}
                onFormDataReady={setLiveFormData}
                initialData={userProfile || liveFormData}
              />
            </div>
          </div>
        )}
      </div>
      <style>{`
        @media (max-width: 1200px) {
          .checkout-responsive-content {
            gap: 24px !important;
          }
        }
        @media (max-width: 968px) {
          .checkout-responsive-content {
            grid-template-columns: 1fr !important;
          }
          .checkout-responsive-right {
            position: static !important;
            top: auto !important;
          }
          .checkout-template-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
            gap: 16px !important;
          }
          .checkout-modal-content {
            max-width: 95% !important;
            padding: 24px 16px !important;
          }
          .checkout-section {
            padding: 20px !important;
          }
        }
        @media (max-width: 768px) {
          .checkout-container {
            padding-top: 80px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          .checkout-responsive-content {
            margin-top: 30px !important;
            gap: 20px !important;
            padding: 0 8px !important;
          }
          .checkout-section {
            padding: 16px !important;
            margin-bottom: 16px !important;
          }
          .checkout-step-header {
            padding: 16px !important;
          }
          .checkout-step-title {
            font-size: 16px !important;
          }
          .checkout-address-content {
            padding: 16px !important;
          }
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-template-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .checkout-template-card {
            max-width: 100% !important;
          }
          .checkout-template-preview {
            padding: 12px !important;
          }
          .checkout-template-preview > div {
            padding: 12px !important;
            min-height: auto !important;
          }
          .checkout-template-preview h3,
          .checkout-template-preview h4 {
            font-size: 14px !important;
            margin-bottom: 4px !important;
          }
          .checkout-template-preview p {
            font-size: 11px !important;
            margin-bottom: 4px !important;
          }
          .checkout-template-preview button {
            padding: 10px !important;
            font-size: 12px !important;
          }
          .checkout-template-preview div[style*="border"] {
            padding: 12px !important;
          }
          .checkout-address-card {
            flex-direction: column !important;
            gap: 12px !important;
            padding: 16px !important;
          }
          .checkout-payment-container {
            padding: 20px 16px !important;
          }
          .checkout-right-section {
            padding: 20px 16px !important;
          }
          .checkout-cart-item {
            flex-wrap: wrap !important;
          }
          .checkout-product-image {
            width: 80px !important;
            height: 80px !important;
          }
          .checkout-proceed-btn {
            font-size: 14px !important;
            padding: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .checkout-container {
            padding-top: 70px !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
          }
          .checkout-responsive-content {
            padding: 0 4px !important;
            margin-top: 20px !important;
          }
          .checkout-section {
            padding: 12px !important;
            border-radius: 6px !important;
          }
          .checkout-step-header {
            padding: 12px !important;
            gap: 12px !important;
          }
          .checkout-step-number {
            width: 28px !important;
            height: 28px !important;
            font-size: 14px !important;
          }
          .checkout-step-title {
            font-size: 14px !important;
          }
          .checkout-address-content {
            padding: 12px !important;
          }
          .checkout-template-selector-desc {
            font-size: 12px !important;
            margin-bottom: 16px !important;
          }
          .checkout-template-grid {
            gap: 12px !important;
          }
          .checkout-template-preview {
            padding: 8px !important;
          }
          .checkout-template-preview > div {
            padding: 10px !important;
            border-radius: 8px !important;
          }
          .checkout-template-preview h3 {
            font-size: 13px !important;
            margin-bottom: 4px !important;
          }
          .checkout-template-preview h4 {
            font-size: 12px !important;
            margin-bottom: 6px !important;
          }
          .checkout-template-preview p {
            font-size: 10px !important;
          }
          .checkout-template-info {
            padding: 12px !important;
          }
          .checkout-template-name {
            font-size: 14px !important;
          }
          .checkout-template-description {
            font-size: 11px !important;
          }
          .checkout-template-preview button {
            padding: 10px !important;
            font-size: 12px !important;
          }
          .checkout-template-preview div[style*="width"] {
            width: 24px !important;
            height: 24px !important;
            font-size: 9px !important;
          }
          .checkout-modal-content {
            padding: 16px 12px !important;
            max-height: 95vh !important;
            margin: 10px !important;
          }
          .checkout-modal-header {
            padding: 12px !important;
          }
          .checkout-modal-title {
            font-size: 18px !important;
          }
          .checkout-right-section {
            padding: 16px 12px !important;
          }
          .checkout-summary-title {
            font-size: 18px !important;
            margin-bottom: 16px !important;
          }
          .checkout-cart-item {
            padding-bottom: 16px !important;
            margin-bottom: 16px !important;
          }
          .checkout-product-image {
            width: 70px !important;
            height: 70px !important;
          }
          .checkout-product-title {
            font-size: 13px !important;
          }
          .checkout-product-variant {
            font-size: 11px !important;
          }
          .checkout-coupon-input {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .checkout-coupon-field {
            width: 100% !important;
          }
          .checkout-apply-btn {
            width: 100% !important;
          }
          .checkout-proceed-btn {
            font-size: 14px !important;
            padding: 12px !important;
            margin-top: 16px !important;
          }
        }
      `}</style>
    </Elements>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingTop: '100px',
    paddingBottom: '40px',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  loader: {
    width: '50px',
    height: '50px',
    border: '3px solid #ddd',
    borderTop: '3px solid #ff6b35',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' }
  },
  loadingText: {
    marginTop: '20px',
    color: '#666',
    fontSize: '16px',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '30px',
    marginTop: '50px',
  },
  leftSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: '#000',
    gap: '16px',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ff6b35',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '16px',
  },
  stepTitle: {
    flex: 1,
    fontSize: '18px',
    fontWeight: '600',
    color: '#fff',
    margin: 0,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: '24px',
    fontWeight: '700',
  },
  addressContent: {
    padding: '24px',
  },
  paymentContainerWrapper: {
    marginTop: '20px',
  },
  paymentContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    border: '1px solid #e0e0e0',
  },
  paymentHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  paymentTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000',
    margin: '0 0 12px 0',
  },
  paymentAmount: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '16px',
    color: '#666',
  },
  amountValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
  },
  paymentContent: {
    padding: '0',
  },
  noAddressContainer: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  noAddressText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  addAddressBtn: {
    padding: '12px 32px',
    backgroundColor: '#fff',
    color: '#ff6b35',
    border: '2px solid #ff6b35',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#fff5f2',
    }
  },
  profileSaved: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#4CAF50',
    fontWeight: '600',
  },
  defaultBadge: {
    display: 'inline-block',
    padding: '2px 8px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '12px',
    marginTop: '8px',
  },
  addressCard: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  addressCardSelected: {
    borderColor: '#ff6b35',
    backgroundColor: '#fff5f2',
  },
  radioInput: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    accentColor: '#ff6b35',
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#000',
  },
  addressText: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  addressPhone: {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
  },
  addNewAddressBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#fff',
    color: '#ff6b35',
    border: '2px dashed #ff6b35',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#fff5f2',
    }
  },
  addressFormOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  addressForm: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '32px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
    margin: 0,
  },
  closeBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f5f5f5',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    }
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
    margin: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover:not(:disabled)': {
      backgroundColor: '#e55a2b',
    }
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  proceedBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    '&:hover:not(:disabled)': {
      backgroundColor: '#e55a2b',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
    }
  },
  proceedBtnDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  buttonSpinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  note: {
    fontSize: '12px',
    color: '#666',
    marginTop: '12px',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  rightSection: {
    backgroundColor: '#fff',
    padding: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '24px',
    color: '#000',
    paddingBottom: '16px',
    borderBottom: '1px solid #e0e0e0',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyCartText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '20px',
  },
  continueShoppingBtn: {
    padding: '12px 24px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e55a2b',
    }
  },
  cartItem: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #f0f0f0',
    position: 'relative',
  },
  productImage: {
    width: '120px',
    height: '120px',
    objectFit: 'contain',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fafafa',
    padding: '8px',
  },
  productInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  productTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#000',
    margin: 0,
  },
  productVariant: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
  },
  productPrice: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#000',
  },
  originalPrice: {
    fontSize: '13px',
    color: '#999',
    textDecoration: 'line-through',
    marginLeft: '8px',
  },
  discountBadge: {
    fontSize: '11px',
    color: '#4CAF50',
    fontWeight: '600',
    backgroundColor: '#e8f5e9',
    padding: '2px 6px',
    borderRadius: '3px',
    marginLeft: '8px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  qtyBtn: {
    width: '28px',
    height: '28px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      borderColor: '#ff6b35',
    }
  },
  quantity: {
    fontSize: '14px',
    fontWeight: '600',
    minWidth: '30px',
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '24px',
    height: '24px',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    transition: 'color 0.3s',
    '&:hover': {
      color: '#ff6b35',
    }
  },
  deliveryInfo: {
    padding: '12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#2e7d32',
    marginBottom: '20px',
    textAlign: 'center',
  },
  couponSection: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  couponTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#000',
  },
  couponInput: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  couponField: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  applyBtn: {
    padding: '10px 24px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e55a2b',
    }
  },
  couponApplied: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    fontSize: '13px',
  },
  couponCode: {
    fontWeight: '600',
    color: '#2e7d32',
  },
  couponDiscount: {
    marginLeft: 'auto',
    color: '#2e7d32',
    fontWeight: '600',
  },
  removeCouponBtn: {
    background: 'none',
    border: 'none',
    color: '#ff6b35',
    cursor: 'pointer',
    fontSize: '12px',
    textDecoration: 'underline',
    '&:hover': {
      color: '#e55a2b',
    }
  },
  priceDetails: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  priceDetailsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#000',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
    fontSize: '14px',
    color: '#666',
  },
  greenText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  totalRow: {
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
    marginTop: '16px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#000',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#000',
  },
  // Stripe Form Styles
  stripeForm: {
    width: '100%',
  },
  stripeSection: {
    marginBottom: '20px',
  },
  stripeLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  stripeInputWrapper: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    transition: 'border-color 0.3s',
    '&:focus-within': {
      borderColor: '#ff6b35',
      boxShadow: '0 0 0 2px rgba(255, 107, 53, 0.1)',
    }
  },
  cardElement: {
    width: '100%',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
  },
  formHalf: {
    flex: 1,
  },
  cardError: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#666',
    marginBottom: '20px',
  },
  lockIcon: {
    fontSize: '16px',
  },
  payButton: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    '&:hover:not(:disabled)': {
      backgroundColor: '#218838',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
    }
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
    transform: 'none !important',
    boxShadow: 'none !important',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  cardLogos: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    fontSize: '13px',
    color: '#666',
  },
  logos: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  cardLogo: {
    padding: '4px 8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    fontSize: '12px',
  },
  backToAddressBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      borderColor: '#999',
    }
  },
  // Profile Form Styles
  profileContainer: {
    padding: '20px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#000',
    margin: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#000',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    resize: 'vertical',
    minHeight: '80px',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  dynamicRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  selectSmall: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    minWidth: '120px',
    outline: 'none',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  countryCodeSelect: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    minWidth: '140px',
    outline: 'none',
    cursor: 'pointer',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  inputFlex: {
    flex: 1,
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    '&:focus': {
      borderColor: '#ff6b35',
    }
  },
  removeBtn: {
    width: '30px',
    height: '30px',
    border: 'none',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#ffcdd2',
    }
  },
  addBtn: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#ff6b35',
    border: '1px solid #ff6b35',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      backgroundColor: '#fff5f2',
    }
  },
  addBtnSmall: {
    padding: '8px 16px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    '&:hover': {
      backgroundColor: '#e55a2b',
    }
  },
  socialList: {
    marginBottom: '16px',
  },
  socialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  socialIcon: {
    fontSize: '16px',
  },
  socialPlatform: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    minWidth: '80px',
  },
  socialUrl: {
    flex: 1,
    fontSize: '14px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  errorBox: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorIcon: {
    fontSize: '18px',
  },
  errorText: {
    flex: 1,
  },
  // Template Selector Styles
  templateSelector: {
    width: '100%',
  },
  templateSelectorDesc: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
    textAlign: 'center',
  },
  templatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
  },
  templateCard: {
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #e0e0e0',
    backgroundColor: '#fff',
  },
  templateCardSelected: {
    borderColor: '#ff6b35',
    boxShadow: '0 4px 12px rgba(255, 107, 53, 0.2)',
    transform: 'translateY(-4px)',
  },
  templatePreviewWrapper: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
  },
  templateInfo: {
    padding: '16px',
    textAlign: 'center',
  },
  templateName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#000',
    margin: '0 0 6px 0',
  },
  templateDescription: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  selectedBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#ff6b35',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)',
  },
  selectedTemplatePreviewCard: {
    marginTop: '24px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
  },
  selectedTemplatePreviewHeader: {
    padding: '16px 16px 0',
  },
  selectedTemplatePreviewWrapper: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
  },
  loadingTemplate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px',
  },
  selectedTemplateInfo: {
    padding: '12px 24px',
    backgroundColor: '#fff5f2',
    borderLeft: '4px solid #ff6b35',
    marginBottom: '16px',
    fontSize: '14px',
  },
  trialBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    background: '#fff7e6',
    border: '1px solid #ffd591',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '12px',
    color: '#8c6b2f',
    fontSize: '14px',
    lineHeight: 1.4,
  },
  selectedTemplateLabel: {
    fontWeight: '600',
    color: '#666',
  },
  selectedTemplateValue: {
    fontWeight: '700',
    color: '#ff6b35',
    textTransform: 'capitalize',
  },
};

export default CheckoutPage;