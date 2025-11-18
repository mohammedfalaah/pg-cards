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
    id: 'obsidian',
    name: 'Black Obsidian',
    description: 'Matte black with premium gold accents',
    background: 'linear-gradient(135deg, #050505 0%, #0A0A10 100%)',
    accent: '#E3BB6B',
    qrAccent: '#E8C987'
  },
  {
    id: 'midnight',
    name: 'Midnight Violet',
    description: 'Deep violet gradient for luxury brands',
    background: 'linear-gradient(135deg, #1c1b33 0%, #21102E 100%)',
    accent: '#D4B27B',
    qrAccent: '#e3c59b'
  },
  {
    id: 'polar',
    name: 'Arctic Frost',
    description: 'Bright whites with champagne gold',
    background: 'linear-gradient(135deg, #f4f4f7 0%, #e4e4ed 100%)',
    accent: '#c9a260',
    qrAccent: '#e7cfa4'
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
    imageandlogos: false
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
      <div className='col-lg-6'>
<div  style={styles.accordionSection}>
        <button
          style={styles.accordionHeader}
          onClick={() => toggleAccordion("imageandlogos")}
        >
          <span>Images and Logos</span>
          <span>{accordionOpen.imageandlogos ? "−" : "+"}</span>
        </button>
        {accordionOpen.imageandlogos && (
          <div style={styles.accordionBody}>
            {/* Cover Image */}
 
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
  {/* Cover Image */}
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

  {/* Profile Image */}
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

  {/* Company Logo */}
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

  {/* Background Image */}
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
      {/* PERSONAL INFO PREVIEW SECTION */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Stored Personal Info</h3>

        <div
          style={{
            background: "#111",
            padding: 20,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          }}
        >
          {/* NAME */}
          <p><strong>Full Name:</strong> {personalInfo.name || "Not provided"}</p>

          {/* DESIGNATION */}
          <p><strong>Designation:</strong> {personalInfo.designation || "Not provided"}</p>

          {/* COMPANY */}
          <p><strong>Company:</strong> {personalInfo.company || "Not provided"}</p>

          <hr style={{ opacity: 0.1, margin: "14px 0" }} />

          {/* PHONES */}
          <p><strong>Phone Numbers:</strong></p>
          {phoneNumbers.filter(Boolean).length > 0 ? (
            phoneNumbers.map((p, i) => (
              <div key={i}>📞 {p}</div>
            ))
          ) : (
            <div>None added</div>
          )}

          <hr style={{ opacity: 0.1, margin: "14px 0" }} />

          {/* EMAILS */}
          <p><strong>Emails:</strong></p>
          {emails.filter(Boolean).length > 0 ? (
            emails.map((e, i) => (
              <div key={i}>📧 {e}</div>
            ))
          ) : (
            <div>None added</div>
          )}

          <hr style={{ opacity: 0.1, margin: "14px 0" }} />

          {/* CONTACT DETAILS */}
          <p><strong>Contact Details:</strong></p>
          {contactDetails.filter(c => c.value).length > 0 ? (
            contactDetails.map((c, i) => (
              c.value && (
                <div key={i}>📍 {c.label}: {c.value}</div>
              )
            ))
          ) : (
            <div>None added</div>
          )}

          <hr style={{ opacity: 0.1, margin: "14px 0" }} />

          {/* SOCIAL LINKS */}
          <p><strong>Social Media:</strong></p>
          {socialLinks.length > 0 ? (
            socialLinks.map((s, i) => (
              <div key={i}>🔗 {s.platform}: {s.link}</div>
            ))
          ) : (
            <div>None added</div>
          )}

          <hr style={{ opacity: 0.1, margin: "14px 0" }} />

          {/* IMAGES */}
          <p><strong>Uploaded Images:</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 12 }}>
            {images.coverImage && (
              <div>
                <small>Cover Image</small>
                <img src={images.coverImage} alt="Cover" style={{ width: '100%', borderRadius: 8, marginTop: 4 }} />
              </div>
            )}
            {images.profileImage && imageToggles.profileImage && (
              <div>
                <small>Profile Image</small>
                <img src={images.profileImage} alt="Profile" style={{ width: '100%', borderRadius: 8, marginTop: 4 }} />
              </div>
            )}
            {images.companyLogo && imageToggles.companyLogo && (
              <div>
                <small>Company Logo</small>
                <img src={images.companyLogo} alt="Logo" style={{ width: '100%', borderRadius: 8, marginTop: 4 }} />
              </div>
            )}
            {images.backgroundImage && (
              <div>
                <small>Background Image</small>
                <img src={images.backgroundImage} alt="Background" style={{ width: '100%', borderRadius: 8, marginTop: 4 }} />
              </div>
            )}
          </div>
          {!images.coverImage && !images.profileImage && !images.companyLogo && !images.backgroundImage && (
            <div>None uploaded</div>
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
  logoMark: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #f7d27c, #ba8c38)',
    color: '#050505',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18
  },
  logoTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 16
  },
  logoSubtitle: {
    color: '#c0a870',
    margin: 0,
    fontSize: 12
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
  btnOutline: {
    borderColor: '#d7b05a',
    color: '#d7b05a'
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
  preview: {
    flex: 1,
    minWidth: 280,
    width: '100%',
    maxWidth: '100%',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    padding: 20,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 25px 60px rgba(0,0,0,0.45)'
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
  urlCard: {
    background: '#0d0d12',
    borderRadius: 16,
    padding: 18,
    border: '1px solid rgba(255,255,255,0.05)'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    marginBottom: 14
  },
  urlInputRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 12
  },
  urlInputGroup: {
    display: 'flex',
    flex: 1,
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    minWidth: 0
  },
  urlPrefix: {
    background: 'rgba(255,255,255,0.05)',
    padding: '10px 12px',
    color: '#d2d2d2',
    fontSize: 13,
    whiteSpace: 'nowrap',
    flexShrink: 0
  },
  urlInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    padding: '10px 12px',
    color: '#fff',
    minWidth: 0
  },
  urlInputDisabled: {
    color: '#666'
  },
  finalUrlRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#c7c7c7',
    marginBottom: 6
  },
  urlNote: {
    margin: 0,
    color: '#7b7b85',
    fontSize: 12
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
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.01)'
  },
  themePreview: {
    borderRadius: 14,
    padding: '28px 20px',
    marginBottom: 10,
    minHeight: 120,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.35)'
  },
  themeLogo: {
    fontSize: 32,
    fontWeight: 700
  },
  themeDesc: {
    fontSize: 12,
    opacity: 0.8
  },
  themeName: {
    margin: 0,
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
  accordionWrapper: {
    marginTop: 24,
    borderTop: '1px solid rgba(255,255,255,0.1)'
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
  contactRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr auto',
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
  textarea: {
    borderRadius: 12,
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 14,
    resize: 'vertical',
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
  previewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  previewTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: 18
  },
  previewSubtitle: {
    color: '#b7b7b7'
  },
  cardPreviewWrapper: {
    borderRadius: 32,
    padding: 16,
    background: 'radial-gradient(circle at top, rgba(247,210,124,0.15), transparent 70%)',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  cardSide: {
    width: '100%',
    minHeight: 220,
    borderRadius: 30,
    padding: 20,
    position: 'relative',
    boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
    boxSizing: 'border-box'
  },
  cardBackContent: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap'
  },
  qrPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 20,
    background: 'rgba(0,0,0,0.4)',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0
  },
  qrInner: {
    position: 'absolute',
    inset: 32,
    border: '2px dashed',
    borderRadius: 12
  },
  qrCorner: {
    position: 'absolute',
    width: 28,
    height: 28,
    border: '3px solid',
    borderRadius: 8,
    top: 16,
    left: 16
  },
  cardDetails: {
    flex: 1,
    minWidth: 150,
    color: '#fff'
  },
  cardName: {
    fontSize: 22,
    margin: 0
  },
  cardDesignation: {
    margin: '6px 0 18px',
    letterSpacing: 2
  },
  cardContact: {
    margin: '4px 0',
    color: '#d6af6b'
  },
  cardContactList: {
    marginTop: 4,
    marginBottom: 8
  },
  cardActionBtn: {
    marginTop: 20,
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 16,
    padding: '8px 16px',
    display: 'inline-flex',
    gap: 12
  },
  previewDevice: {
    marginTop: 24
  },
  previewPhone: {
    width: '100%',
    maxWidth: 260,
    margin: '0 auto',
    borderRadius: 50,
    padding: 16,
    background: 'linear-gradient(135deg,#1c1c28,#09090f)'
  },
  previewScreen: {
    borderRadius: 32,
    padding: 18,
    background: '#fff',
    minHeight: 360,
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  },
  previewBrandRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  previewBrandIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    background: '#050505',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewBrandName: {
    margin: 0,
    color: '#050505',
    fontWeight: 700
  },
  previewContactCard: {
    borderRadius: 20,
    border: '1px solid rgba(0,0,0,0.08)',
    padding: 16,
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  },
  previewAvatar: {
    width: 54,
    height: 54,
    borderRadius: 16,
    background: 'rgba(0,0,0,0.1)'
  },
  previewCta: {
    borderRadius: 16,
    border: 'none',
    background: '#050505',
    color: '#fff',
    padding: '12px 20px',
    fontWeight: 600,
    cursor: 'pointer'
  },
  previewInfoBlock: {
    marginTop: 16,
    paddingTop: 12,
    borderTop: '1px solid rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  previewSectionLabel: {
    margin: 0,
    fontWeight: 600,
    color: '#050505',
    fontSize: 14
  },
  previewInfoRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    color: '#1f1f1f',
    fontSize: 13
  },
  previewInfoLabel: {
    fontWeight: 600
  },
  previewParagraph: {
    margin: 0,
    color: '#1f1f1f',
    lineHeight: 1.5,
    fontSize: 13
  },
  logoUploadWrapper: {
    width: '100%',
    marginBottom: 8
  },
  fileInput: {
    display: 'none'
  },
  logoUploadLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 160,
    borderRadius: 16,
    border: '2px dashed rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.03)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden'
  },
  logoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#d9d9d9'
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: 10
  },
  qrLogo: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: 20
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
  }
};

export default CardCustomization;