import React, { useEffect, useMemo, useState } from 'react';
import PGCardsLogo from './PGCardsLogo';

const baseUrl = 'pgcards.info/profile-view/';

const socialPlatforms = [
  'Instagram',
  'Facebook',
  'Whatsapp',
  'Linkedin',
  'Twitter',
  'Youtube',
  'Skype',
  'Snapchat',
  'Tiktok',
  'Company Profile'
];

const premiumThemes = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Clean white background with verified badge',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    accent: '#28a745',
    textColor: '#000000',
    secondaryColor: '#6c757d',
    cardBg: '#ffffff'
  },
  {
    id: 'classic',
    name: 'Classic Custom',
    description: 'Elegant light grey with centered logo',
    background: 'linear-gradient(135deg, #e8e8e8 0%, #d4d4d4 100%)',
    accent: '#000000',
    textColor: '#000000',
    secondaryColor: '#555555',
    cardBg: '#f5f5f5'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Bold red accent with contemporary design',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
    accent: '#ff4757',
    textColor: '#000000',
    secondaryColor: '#ff6b81',
    cardBg: '#ffffff'
  },
  {
    id: 'iconic',
    name: 'Iconic',
    description: 'Minimalist white with icon-based layout',
    background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
    accent: '#1e88e5',
    textColor: '#212121',
    secondaryColor: '#42a5f5',
    cardBg: '#ffffff'
  },
  {
    id: 'digital',
    name: 'Digital',
    description: 'Modern dark theme with cyan accents',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    accent: '#00d9ff',
    textColor: '#ffffff',
    secondaryColor: '#4dd4ff',
    cardBg: '#16213e'
  },
  {
    id: 'epic',
    name: 'Epic',
    description: 'Bold black and gold luxury theme',
    background: 'linear-gradient(135deg, #000000 0%, #1c1c1c 100%)',
    accent: '#ffd700',
    textColor: '#ffffff',
    secondaryColor: '#ffed4e',
    cardBg: '#0a0a0a'
  },
  {
    id: 'vex',
    name: 'Vex',
    description: 'Navy blue professional theme',
    background: 'linear-gradient(135deg, #0a1929 0%, #1e3a5f 100%)',
    accent: '#4a90e2',
    textColor: '#ffffff',
    secondaryColor: '#64b5f6',
    cardBg: '#1e3a5f'
  },
  {
    id: 'obsidian',
    name: 'Black Obsidian',
    description: 'Matte black with premium gold accents',
    background: 'linear-gradient(135deg, #050505 0%, #0A0A10 100%)',
    accent: '#E3BB6B',
    textColor: '#ffffff',
    secondaryColor: '#E8C987',
    cardBg: '#0A0A10'
  },
  {
    id: 'midnight',
    name: 'Midnight Violet',
    description: 'Deep violet gradient for luxury brands',
    background: 'linear-gradient(135deg, #1c1b33 0%, #21102E 100%)',
    accent: '#D4B27B',
    textColor: '#ffffff',
    secondaryColor: '#e3c59b',
    cardBg: '#21102E'
  },
  {
    id: 'polar',
    name: 'Arctic Frost',
    description: 'Bright whites with champagne gold',
    background: 'linear-gradient(135deg, #f4f4f7 0%, #e4e4ed 100%)',
    accent: '#c9a260',
    textColor: '#333333',
    secondaryColor: '#e7cfa4',
    cardBg: '#ffffff'
  }
];

const CardCustomization = () => {
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }, []);

  const [activeTab, setActiveTab] = useState('personal');
  const [selectedTheme, setSelectedTheme] = useState(premiumThemes[0].id);
  const [customColors, setCustomColors] = useState({
    primary: '#E3BB6B',
    secondary: '#E8C987',
    text: '#ffffff',
    background: '#0A0A10'
  });
  const [customUrlEnabled, setCustomUrlEnabled] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    designation: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    website: '',
    tagline: '',
    about: '',
    aboutCompany: '',
    ctaButton: '',
    logo: ''
  });
  const [socialForm, setSocialForm] = useState({ platform: '', link: '' });
  const [socialLinks, setSocialLinks] = useState([]);
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [emails, setEmails] = useState(['']);
  const [logoSize, setLogoSize] = useState(100);
  const [images, setImages] = useState({
    coverImage: '',
    profileImage: '',
    companyLogo: '',
    backgroundImage: ''
  });
  const [imageToggles, setImageToggles] = useState({
    profileImage: true,
    companyLogo: true
  });
  const [contactDetails, setContactDetails] = useState([
    { label: "Address", value: "" },
    { label: "State", value: "" },
    { label: "Country", value: "" },
  ]);
  const [accordionOpen, setAccordionOpen] = useState({
    phones: true,
    emails: false,
    contact: false,
    imageandlogos: false,
    themes: true,
    customizeColour: false,
    imagesLogosAppearance: false
  });

  const generatedSlug = useMemo(() => Math.random().toString(36).substring(2, 12), []);
  const finalSlug = customUrlEnabled && customSlug ? customSlug : generatedSlug;
  const finalUrl = `${baseUrl}${finalSlug}`;

  const theme = premiumThemes.find((t) => t.id === selectedTheme) ?? premiumThemes[0];

  const handleInputChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (imageType, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => ({ ...prev, [imageType]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageToggle = (imageType) => {
    setImageToggles((prev) => ({ ...prev, [imageType]: !prev[imageType] }));
  };

  const handleContactDetailChange = (index, field, value) => {
    const updated = [...contactDetails];
    updated[index][field] = value;
    setContactDetails(updated);
  };

  const handleSocialFormChange = (field, value) => {
    setSocialForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSocialLink = () => {
    if (!socialForm.platform || !socialForm.link) return;
    setSocialLinks((prev) => [...prev, { ...socialForm }]);
    setSocialForm({ platform: '', link: '' });
  };

  const handleRemoveSocial = (index) => {
    setSocialLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const toggleAccordion = (section) => {
    setAccordionOpen((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handlePhoneChange = (index, value) => {
    setPhoneNumbers((prev) => prev.map((phone, idx) => (idx === index ? value : phone)));
  };

  const handleEmailChange = (index, value) => {
    setEmails((prev) => prev.map((email, idx) => (idx === index ? value : email)));
  };

  const addPhoneField = () => setPhoneNumbers((prev) => [...prev, '']);
  const removePhoneField = (index) =>
    setPhoneNumbers((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [''];
    });

  const addEmailField = () => setEmails((prev) => [...prev, '']);
  const removeEmailField = (index) =>
    setEmails((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [''];
    });

  const addContactDetailField = () => setContactDetails((prev) => [...prev, { label: '', value: '' }]);
  const removeContactDetailField = (index) =>
    setContactDetails((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [{ label: '', value: '' }];
    });

  const handleThemeSelect = (themeId) => {
    setSelectedTheme(themeId);
    const selected = premiumThemes.find(t => t.id === themeId);
    if (selected) {
      setCustomColors({
        primary: selected.accent,
        secondary: selected.secondaryColor,
        text: selected.textColor,
        background: selected.cardBg
      });
    }
  };

  const handleColorChange = (colorType, value) => {
    setCustomColors(prev => ({ ...prev, [colorType]: value }));
  };

  const renderPersonalTab = () => (
    <>
      <div style={styles.formGridTwo}>
        <div style={styles.formField}>
          <label>Full Name</label>
          <input
            style={styles.textInput}
            placeholder="Full Name"
            value={personalInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>
        <div style={styles.formField}>
          <label>Company Designation</label>
          <input
            style={styles.textInput}
            placeholder="Company Designation"
            value={personalInfo.designation}
            onChange={(e) => handleInputChange('designation', e.target.value)}
          />
        </div>
        <div style={styles.formField}>
          <label>Company Name</label>
          <input
            style={styles.textInput}
            placeholder="Company Name"
            value={personalInfo.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
          />
        </div>
      </div>

      <div style={styles.accordionSection}>
        <button style={styles.accordionHeader} onClick={() => toggleAccordion('phones')}>
          <span>Phone Numbers</span>
          <span>{accordionOpen.phones ? '−' : '+'}</span>
        </button>
        {accordionOpen.phones && (
          <div style={styles.accordionBody}>
            {phoneNumbers.map((phone, idx) => (
              <div key={`phone-${idx}`} style={styles.listRow}>
                <input
                  style={styles.textInput}
                  placeholder="+971 000 000 000"
                  value={phone}
                  onChange={(e) => handlePhoneChange(idx, e.target.value)}
                />
                <button style={styles.removeRowBtn} onClick={() => removePhoneField(idx)}>
                  ×
                </button>
              </div>
            ))}
            <button style={styles.addRowBtn} onClick={addPhoneField}>
              + Add Phone
            </button>
          </div>
        )}
      </div>

      <div style={styles.accordionSection}>
        <button
          style={styles.accordionHeader}
          onClick={() => toggleAccordion("imageandlogos")}
        >
          <span>Images and Logos</span>
          <span>{accordionOpen.imageandlogos ? "−" : "+"}</span>
        </button>
        {accordionOpen.imageandlogos && (
          <div style={styles.accordionBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.imageUploadSection}>
                <label style={styles.imageLabel}>Cover Image</label>
                <div style={styles.imageUploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('coverImage', e)}
                    style={styles.fileInput}
                    id="coverImage"
                  />
                  <label htmlFor="coverImage" style={styles.uploadLabel}>
                    {images.coverImage ? (
                      <img src={images.coverImage} alt="Cover" style={styles.uploadedImage} />
                    ) : (
                      <div style={styles.uploadPlaceholder}>
                        <span style={{ fontSize: 32 }}>+</span>
                        <span>Upload</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>No file uploaded</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div style={styles.imageUploadSection}>
                <div style={styles.imageLabelRow}>
                  <label style={styles.imageLabel}>Profile Image</label>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={imageToggles.profileImage}
                      onChange={() => handleImageToggle('profileImage')}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      ...styles.toggleSlider,
                      background: imageToggles.profileImage ? '#0066ff' : '#666'
                    }}>
                      <span style={{
                        ...styles.toggleDot,
                        transform: imageToggles.profileImage ? 'translateX(20px)' : 'translateX(0)'
                      }} />
                    </span>
                  </label>
                </div>
                <div style={styles.imageUploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('profileImage', e)}
                    style={styles.fileInput}
                    id="profileImage"
                  />
                  <label htmlFor="profileImage" style={styles.uploadLabel}>
                    {images.profileImage ? (
                      <img src={images.profileImage} alt="Profile" style={styles.uploadedImage} />
                    ) : (
                      <div style={styles.uploadPlaceholder}>
                        <span style={{ fontSize: 32 }}>+</span>
                        <span>Upload</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>No file uploaded</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div style={styles.imageUploadSection}>
                <div style={styles.imageLabelRow}>
                  <label style={styles.imageLabel}>Company Logo</label>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={imageToggles.companyLogo}
                      onChange={() => handleImageToggle('companyLogo')}
                      style={{ display: 'none' }}
                    />
                    <span style={{
                      ...styles.toggleSlider,
                      background: imageToggles.companyLogo ? '#0066ff' : '#666'
                    }}>
                      <span style={{
                        ...styles.toggleDot,
                        transform: imageToggles.companyLogo ? 'translateX(20px)' : 'translateX(0)'
                      }} />
                    </span>
                  </label>
                </div>
                <div style={styles.imageUploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('companyLogo', e)}
                    style={styles.fileInput}
                    id="companyLogo"
                  />
                  <label htmlFor="companyLogo" style={styles.uploadLabel}>
                    {images.companyLogo ? (
                      <img src={images.companyLogo} alt="Company Logo" style={styles.uploadedImage} />
                    ) : (
                      <div style={styles.uploadPlaceholder}>
                        <span style={{ fontSize: 32 }}>+</span>
                        <span>Upload</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>No file uploaded</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div style={styles.imageUploadSection}>
                <label style={styles.imageLabel}>Background Image</label>
                <div style={styles.imageUploadBox}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload('backgroundImage', e)}
                    style={styles.fileInput}
                    id="backgroundImage"
                  />
                  <label htmlFor="backgroundImage" style={styles.uploadLabel}>
                    {images.backgroundImage ? (
                      <img src={images.backgroundImage} alt="Background" style={styles.uploadedImage} />
                    ) : (
                      <div style={styles.uploadPlaceholder}>
                        <span style={{ fontSize: 32 }}>+</span>
                        <span>Upload</span>
                        <span style={{ fontSize: 12, opacity: 0.7 }}>No file uploaded</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={styles.accordionSection}>
        <button
          style={styles.accordionHeader}
          onClick={() => toggleAccordion("contact")}
        >
          <span>Contact Details</span>
          <span>{accordionOpen.contact ? "−" : "+"}</span>
        </button>

        {accordionOpen.contact && (
          <div style={styles.accordionBody}>
            {contactDetails.map((detail, idx) => (
              <div key={`contact-${idx}`} style={{ marginBottom: "12px" }}>
                <label style={{ color: "#aaa", fontSize: "14px", marginBottom: "4px", display: "block" }}>
                  {detail.label}
                </label>
                <input
                  style={styles.textInput}
                  placeholder={detail.label}
                  value={detail.value}
                  onChange={(e) =>
                    handleContactDetailChange(idx, "value", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.accordionSection}>
        <button style={styles.accordionHeader} onClick={() => toggleAccordion('emails')}>
          <span>Emails</span>
          <span>{accordionOpen.emails ? '−' : '+'}</span>
        </button>
        {accordionOpen.emails && (
          <div style={styles.accordionBody}>
            {emails.map((email, idx) => (
              <div key={`email-${idx}`} style={styles.listRow}>
                <input
                  style={styles.textInput}
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => handleEmailChange(idx, e.target.value)}
                />
                <button style={styles.removeRowBtn} onClick={() => removeEmailField(idx)}>
                  ×
                </button>
              </div>
            ))}
            <button style={styles.addRowBtn} onClick={addEmailField}>
              + Add Email
            </button>
          </div>
        )}
      </div>

      <div style={styles.section}>
        <span style={styles.accordionHeader}>Social Media</span>
        <div style={styles.socialRow}>
          <select
            style={styles.select}
            value={socialForm.platform}
            onChange={(e) => handleSocialFormChange('platform', e.target.value)}
          >
            <option value="">Select Platform</option>
            {socialPlatforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
          <input
            style={styles.textInput}
            placeholder="Enter a valid link"
            value={socialForm.link}
            onChange={(e) => handleSocialFormChange('link', e.target.value)}
          />
          <button style={styles.addIconBtn} onClick={handleAddSocialLink}>
            +
          </button>
        </div>
        {socialLinks.length > 0 && (
          <div style={styles.socialChips}>
            {socialLinks.map((item, idx) => (
              <div key={`${item.platform}-${idx}`} style={styles.socialChip}>
                <span>{item.platform}</span>
                <a href={item.link} target="_blank" rel="noreferrer">
                  {item.link}
                </a>
                <button onClick={() => handleRemoveSocial(idx)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderAppearanceTab = () => (
    <>
      {/* THEMES SECTION */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Select Your Theme</h3>
        <div style={styles.themesGrid}>
          {premiumThemes.map((themeOption) => (
            <div
              key={themeOption.id}
              onClick={() => handleThemeSelect(themeOption.id)}
              style={{
                ...styles.themeTile,
                ...(selectedTheme === themeOption.id ? styles.themeTileActive : {})
              }}
            >
              <div style={{ ...styles.themePreview, background: themeOption.background }}>
                <div style={styles.themePreviewContent}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: themeOption.textColor }}>
                    {themeOption.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, color: themeOption.secondaryColor, marginTop: 8 }}>
                    Sample Text
                  </div>
                </div>
              </div>
              <div style={{ padding: '8px 0' }}>
                <p style={styles.themeName}>{themeOption.name}</p>
                <small style={styles.themeDesc}>{themeOption.description}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLOR CUSTOMIZATION */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Customize Colors</h3>
        <div style={styles.colorGrid}>
          <div style={styles.colorField}>
            <label>Primary Color</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                style={styles.colorInput}
              />
              <input
                type="text"
                value={customColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                style={styles.colorTextInput}
              />
            </div>
          </div>

          <div style={styles.colorField}>
            <label>Secondary Color</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                style={styles.colorInput}
              />
              <input
                type="text"
                value={customColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                style={styles.colorTextInput}
              />
            </div>
          </div>

          <div style={styles.colorField}>
            <label>Text Color</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                style={styles.colorInput}
              />
              <input
                type="text"
                value={customColors.text}
                onChange={(e) => handleColorChange('text', e.target.value)}
                style={styles.colorTextInput}
              />
            </div>
          </div>

          <div style={styles.colorField}>
            <label>Background Color</label>
            <div style={styles.colorInputWrapper}>
              <input
                type="color"
                value={customColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                style={styles.colorInput}
              />
              <input
                type="text"
                value={customColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                style={styles.colorTextInput}
              />
            </div>
          </div>
        </div>
      </div>

      {/* PREVIEW SECTION */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Live Preview</h3>
        <div style={{ ...styles.previewPhone, background: theme.background }}>
          <div style={{ ...styles.previewScreen, background: customColors.background }}>
            {/* Cover Image */}
            {images.coverImage && (
              <div style={styles.previewCover}>
                <img src={images.coverImage} alt="Cover" style={styles.previewCoverImg} />
              </div>
            )}

            {/* Profile Section */}
            <div style={styles.previewProfileSection}>
              {images.profileImage && imageToggles.profileImage && (
                <img src={images.profileImage} alt="Profile" style={styles.previewAvatar} />
              )}
              {images.companyLogo && imageToggles.companyLogo && (
                <img src={images.companyLogo} alt="Logo" style={styles.previewLogo} />
              )}
            </div>

            {/* Personal Info */}
            <div style={{ ...styles.previewInfoCard, borderColor: customColors.primary }}>
              <h3 style={{ ...styles.previewName, color: customColors.text }}>
                {personalInfo.name || 'Your Name'}
              </h3>
              <p style={{ ...styles.previewDesignation, color: customColors.secondary }}>
                {personalInfo.designation || 'Your Designation'}
              </p>
              <p style={{ ...styles.previewCompany, color: customColors.text, opacity: 0.8 }}>
                {personalInfo.company || 'Company Name'}
              </p>
            </div>

            {/* Contact Info */}
            {(phoneNumbers.filter(Boolean).length > 0 || emails.filter(Boolean).length > 0) && (
              <div style={styles.previewContactSection}>
                <h4 style={{ ...styles.previewSectionTitle, color: customColors.text }}>Contact Info</h4>
                {phoneNumbers.filter(Boolean).map((phone, i) => (
                  <div key={i} style={{ ...styles.previewContactItem, color: customColors.text }}>
                    <span>📞</span>
                    <span>{phone}</span>
                  </div>
                ))}
                {emails.filter(Boolean).map((email, i) => (
                  <div key={i} style={{ ...styles.previewContactItem, color: customColors.text }}>
                    <span>📧</span>
                    <span>{email}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div style={styles.previewContactSection}>
                <h4 style={{ ...styles.previewSectionTitle, color: customColors.text }}>Social Media</h4>
                <div style={styles.previewSocialIcons}>
                  {socialLinks.map((social, i) => (
                    <div key={i} style={{ ...styles.previewSocialIcon, borderColor: customColors.primary, color: customColors.primary }}>
                      {social.platform.substring(0, 2)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button style={{ ...styles.previewCtaBtn, background: customColors.primary, color: customColors.background }}>
              Add to Contacts
            </button>
          </div>
        </div>
      </div>

      {/* DATA SUMMARY */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Stored Personal Info</h3>
        <div style={styles.dataSummary}>
          <p><strong>Full Name:</strong> {personalInfo.name || "Not provided"}</p>
          <p><strong>Designation:</strong> {personalInfo.designation || "Not provided"}</p>
          <p><strong>Company:</strong> {personalInfo.company || "Not provided"}</p>
          
          <hr style={{ opacity: 0.1, margin: "14px 0" }} />
          
          <p><strong>Phone Numbers:</strong></p>
          {phoneNumbers.filter(Boolean).length > 0 ? (
            phoneNumbers.filter(Boolean).map((p, i) => <div key={i}>📞 {p}</div>)
          ) : (
            <div>None added</div>
          )}
          
          <hr style={{ opacity: 0.1, margin: "14px 0" }} />
          
          <p><strong>Emails:</strong></p>
          {emails.filter(Boolean).length > 0 ? (
            emails.filter(Boolean).map((e, i) => <div key={i}>📧 {e}</div>)
          ) : (
            <div>None added</div>
          )}
          
          <hr style={{ opacity: 0.1, margin: "14px 0" }} />
          
          <p><strong>Contact Details:</strong></p>
          {contactDetails.filter(c => c.value).length > 0 ? (
            contactDetails.filter(c => c.value).map((c, i) => <div key={i}>📍 {c.label}: {c.value}</div>)
          ) : (
            <div>None added</div>
          )}
        </div>
      </div>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalTab();
      case 'appearance':
        return renderAppearanceTab();
      default:
        return null;
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div className="logo-section">
          <PGCardsLogo size={logoSize} />
        </div>
        <div style={styles.headerButtons}>
          <button style={{ ...styles.headerBtn, ...styles.btnGhost }}>Cancel</button>
          <button style={{ ...styles.headerBtn, ...styles.btnGhost }}>Clear All</button>
          <button style={{ ...styles.headerBtn, ...styles.btnSolid }}>Buy Now</button>
        </div>
      </header>

      <div style={styles.wrapper}>
        <div style={styles.panel}>
          <div style={styles.tabsRow}>
            {[
              { id: 'personal', label: 'Personal Info' },
              { id: 'appearance', label: 'Appearance' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tabButton,
                  ...(activeTab === tab.id ? styles.tabButtonActive : {})
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={styles.tabCard}>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #080808 0%, #150b1f 100%)',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
    paddingBottom: 60,
    overflowX: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 4vw',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12
  },
  headerButtons: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end'
  },
  headerBtn: {
    borderRadius: 22,
    padding: '8px 16px',
    fontWeight: 600,
    border: '1px solid transparent',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  btnGhost: {
    borderColor: 'rgba(255,255,255,0.2)'
  },
  btnSolid: {
    background: 'linear-gradient(135deg,#f7d27c,#ba8c38)',
    color: '#050505'
  },
  wrapper: {
    display: 'flex',
    gap: 24,
    padding: '0 4vw 60px',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  panel: {
    flex: 1,
    minWidth: 280,
    width: '100%',
    maxWidth: '100%'
  },
  tabsRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 20,
    flexWrap: 'wrap'
  },
  tabButton: {
    padding: '10px 18px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#d9d9d9',
    fontWeight: 600,
    cursor: 'pointer'
  },
  tabButtonActive: {
    background: 'linear-gradient(135deg,#f7d27c,#ba8c38)',
    color: '#050505',
    borderColor: 'transparent'
  },
  tabCard: {
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)',
    overflowX: 'hidden'
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: 0.2
  },
  formGridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 13
  },
  accordionSection: {
    borderBottom: '1px solid rgba(255,255,255,0.08)'
  },
  accordionHeader: {
    width: '100%',
    padding: '14px 0',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'space-between',
    cursor: 'pointer',
    fontSize: 14
  },
  accordionBody: {
    paddingBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  listRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center'
  },
  addRowBtn: {
    alignSelf: 'flex-start',
    padding: '8px 14px',
    borderRadius: 10,
    border: '1px dashed rgba(255,255,255,0.3)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600
  },
  removeRowBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: 18
  },
  textInput: {
    borderRadius: 12,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box'
  },
  socialRow: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap'
  },
  select: {
    flex: 1,
    minWidth: 180,
    borderRadius: 12,
    padding: '10px 40px 10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff'
  },
  addIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    fontSize: 20,
    cursor: 'pointer'
  },
  socialChips: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  socialChip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: 12,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    gap: 12,
    flexWrap: 'wrap',
    wordBreak: 'break-all'
  },
  imageUploadSection: {
    marginBottom: 20
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 8,
    display: 'block',
    color: '#fff'
  },
  imageLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: 44,
    height: 24,
    cursor: 'pointer'
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    transition: '0.3s',
    display: 'block'
  },
  toggleDot: {
    position: 'absolute',
    content: '""',
    height: 18,
    width: 18,
    left: 3,
    bottom: 3,
    backgroundColor: 'white',
    borderRadius: '50%',
    transition: '0.3s',
    display: 'block'
  },
  imageUploadBox: {
    width: '100%',
    minHeight: 120,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)'
  },
  uploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 120,
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  uploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    color: '#aaa'
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    minHeight: 120
  },
  fileInput: {
    display: 'none'
  },
  themesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 18
  },
  themeTile: {
    borderRadius: 18,
    padding: 14,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.01)'
  },
  themeTileActive: {
    borderColor: '#f7d27c',
    boxShadow: '0 0 20px rgba(247,210,124,0.3)'
  },
  themePreview: {
    borderRadius: 14,
    padding: '28px 20px',
    marginBottom: 10,
    minHeight: 100,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)'
  },
  themePreviewContent: {
    textAlign: 'center'
  },
  themeName: {
    margin: 0,
    fontWeight: 600,
    letterSpacing: 0.2,
    fontSize: 14
  },
  themeDesc: {
    fontSize: 11,
    opacity: 0.7,
    color: '#aaa'
  },
  colorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 16
  },
  colorField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  colorInputWrapper: {
    display: 'flex',
    gap: 10,
    alignItems: 'center'
  },
  colorInput: {
    width: 50,
    height: 40,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    cursor: 'pointer',
    background: 'transparent'
  },
  colorTextInput: {
    flex: 1,
    borderRadius: 12,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14
  },
  previewPhone: {
    width: '100%',
    maxWidth: 360,
    margin: '0 auto',
    borderRadius: 40,
    padding: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },
  previewScreen: {
    borderRadius: 32,
    padding: 20,
    minHeight: 500,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    position: 'relative',
    overflow: 'hidden'
  },
  previewCover: {
    width: 'calc(100% + 40px)',
    height: 120,
    margin: '-20px -20px 0',
    overflow: 'hidden'
  },
  previewCoverImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  previewProfileSection: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30,
    position: 'relative',
    zIndex: 1
  },
  previewAvatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  previewLogo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    borderRadius: 12,
    padding: 8,
    background: 'rgba(255,255,255,0.9)'
  },
  previewInfoCard: {
    textAlign: 'center',
    padding: 16,
    borderRadius: 16,
    border: '1px solid',
    marginTop: 8
  },
  previewName: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700
  },
  previewDesignation: {
    margin: '6px 0',
    fontSize: 14,
    fontWeight: 600
  },
  previewCompany: {
    margin: 0,
    fontSize: 13
  },
  previewContactSection: {
    padding: 12,
    borderRadius: 12,
    background: 'rgba(255,255,255,0.05)'
  },
  previewSectionTitle: {
    margin: '0 0 12px 0',
    fontSize: 14,
    fontWeight: 600
  },
  previewContactItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    fontSize: 13,
    marginBottom: 6
  },
  previewSocialIcons: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap'
  },
  previewSocialIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700
  },
  previewCtaBtn: {
    width: '100%',
    padding: '12px 20px',
    borderRadius: 12,
    border: 'none',
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    marginTop: 8
  },
  dataSummary: {
    background: '#111',
    padding: 20,
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff'
  }
};

export default CardCustomization;