import React, { useState, useEffect } from 'react';

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

  const [activeTab, setActiveTab] = useState('personal-info');
  const [selectedTheme, setSelectedTheme] = useState('classic-custom');
  const [colors, setColors] = useState({
    primary: '#FFFFFF',
    background: '#8B0000',
    icon: '#000000',
    iconText: '#FFFFFF',
    text: '#FFFFFF'
  });
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    designation: '',
    phone: '',
    email: ''
  });

  const themes = [
    { id: 'standard', name: 'Standard' },
    { id: 'classic-custom', name: 'Classic Custom' },
    { id: 'modern', name: 'Modern' }
  ];

  const handleColorChange = (colorType, value) => {
    setColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div style={styles.customizationPage}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>PG Cards</div>
          <div style={styles.headerActions}>
            <button style={{...styles.btn, ...styles.btnCancel}}>Cancel</button>
            <button style={{...styles.btn, ...styles.btnClear}}>Clear All</button>
            <button style={{...styles.btn, ...styles.btnTrial}}>Free Trial</button>
            <button style={{...styles.btn, ...styles.btnBuy}}>Buy Now</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Tabs */}
        <div style={styles.tabs}>
           <button 
            style={{...styles.tab, ...(activeTab === 'personal-info' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('personal-info')}
          >
            PERSONAL INFO
          </button>
          <button 
            style={{...styles.tab, ...(activeTab === 'appearance' ? styles.tabActive : {})}}
            onClick={() => setActiveTab('appearance')}
          >
            APPEARANCE
          </button>
         
          
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {activeTab === 'appearance' && (
            <>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Select your theme</h3>
                <div style={styles.themesGrid}>
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      style={{
                        ...styles.themeCard,
                        ...(selectedTheme === theme.id ? styles.themeCardSelected : {})
                      }}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div style={styles.themePreview}>
                        {theme.id === 'standard' && (
                          <>
                            <div style={styles.themeHeaderStandard}>INNOVATIVE</div>
                            <div style={styles.themeAvatar}></div>
                          </>
                        )}
                        {theme.id === 'classic-custom' && (
                          <>
                            <div style={styles.themeHeaderClassic}>LOGO</div>
                            <div style={styles.themeAvatar}></div>
                            <div style={styles.themeName}>Samuel</div>
                            <div style={styles.themeButton}>Contact</div>
                          </>
                        )}
                        {theme.id === 'modern' && (
                          <>
                            <div style={styles.themeHeaderModern}></div>
                            <div style={styles.themeAvatar}></div>
                            <div style={styles.themeSocialIcons}>
                              <span>📧</span>
                              <span>📞</span>
                            </div>
                          </>
                        )}
                      </div>
                      <p style={styles.themeLabel}>{theme.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>CUSTOMIZE COLOUR</h3>
                <div style={styles.colorControls}>
                  {[
                    { key: 'primary', label: 'Primary Color' },
                    { key: 'background', label: 'Background Color' },
                    { key: 'icon', label: 'Icon Color' },
                    { key: 'iconText', label: 'Icon Text Color' },
                    { key: 'text', label: 'Text Color' }
                  ].map(({ key, label }) => (
                    <div key={key} style={styles.colorControl}>
                      <label style={styles.label}>{label}</label>
                      <div style={styles.colorInputGroup}>
                        <input
                          type="color"
                          value={colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          style={styles.colorPicker}
                        />
                        <input
                          type="text"
                          value={colors[key]}
                          onChange={(e) => handleColorChange(key, e.target.value)}
                          style={styles.colorInput}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'personal-info' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  value={personalInfo.name}
                  onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Designation</label>
                <input 
                  type="text" 
                  placeholder="Enter your designation" 
                  value={personalInfo.designation}
                  onChange={(e) => handlePersonalInfoChange('designation', e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input 
                  type="tel" 
                  placeholder="+971 000 000 000" 
                  value={personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  style={styles.input}
                />
              </div>

              <h3 style={{...styles.sectionTitle, marginTop: '32px'}}>Social Links</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Website</label>
                <input type="url" placeholder="https://yourwebsite.com" style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>LinkedIn</label>
                <input type="url" placeholder="https://linkedin.com/in/yourprofile" style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Twitter</label>
                <input type="url" placeholder="https://twitter.com/yourhandle" style={styles.input} />
              </div>

              <h3 style={{...styles.sectionTitle, marginTop: '32px'}}>Additional Data</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Company</label>
                <input type="text" placeholder="Your company name" style={styles.input} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Address</label>
                <textarea placeholder="Enter your address" rows="3" style={{...styles.input, minHeight: '80px'}}></textarea>
              </div>
            </div>
          )}

          

         
        </div>

        {/* Preview Card */}
        <div style={styles.previewContainer}>
          <div style={styles.phoneFrame}>
            <div 
              style={{
                ...styles.cardPreview,
                backgroundColor: colors.background,
                color: colors.text
              }}
            >
              {selectedTheme === 'standard' && (
                <>
                  <div style={{...styles.previewHeader, color: colors.primary}}>INNOVATIVE</div>
                  <div style={styles.previewAvatar}></div>
                  <div style={{...styles.previewName, color: colors.text}}>
                    {personalInfo.name || 'Your Name'}
                  </div>
                  <div style={{...styles.previewDesignation, color: colors.text}}>
                    {personalInfo.designation || 'Your Designation'}
                  </div>
                </>
              )}

              {selectedTheme === 'classic-custom' && (
                <>
                  <div style={{...styles.previewHeader, color: colors.primary}}>LOGO</div>
                  <div style={styles.previewAvatar}></div>
                  <div style={{...styles.previewName, color: colors.text}}>
                    {personalInfo.name || 'Your Name'}
                  </div>
                  <div style={{...styles.previewDesignation, color: colors.text}}>
                    {personalInfo.designation || 'Your Designation'}
                  </div>
                  <div style={styles.previewIcons}>
                    <span style={{color: colors.iconText}}>📧</span>
                    <span style={{color: colors.iconText}}>📅</span>
                    <span style={{color: colors.iconText}}>📞</span>
                    <span style={{color: colors.iconText}}>💬</span>
                  </div>
                  <button style={{
                    ...styles.previewButton,
                    backgroundColor: colors.primary,
                    color: colors.background
                  }}>
                    Contact Me
                  </button>
                  <div style={styles.previewContact}>
                    <div style={{color: colors.text, fontSize: '11px'}}>
                      Phone: {personalInfo.phone || '+123 456 7890'}
                    </div>
                    <div style={{color: colors.text, fontSize: '11px'}}>
                      Email: {personalInfo.email || 'your@email.com'}
                    </div>
                  </div>
                </>
              )}

              {selectedTheme === 'modern' && (
                <>
                  <div style={{
                    ...styles.previewHeaderModernFull,
                    backgroundColor: colors.primary
                  }}></div>
                  <div style={styles.previewAvatar}></div>
                  <div style={{...styles.previewName, color: colors.text}}>
                    {personalInfo.name || 'Your Name'}
                  </div>
                  <div style={{...styles.previewDesignation, color: colors.text}}>
                    {personalInfo.designation || 'Your Designation'}
                  </div>
                  <div style={styles.previewIconsModern}>
                    <span style={{color: colors.icon}}>📧</span>
                    <span style={{color: colors.icon}}>📅</span>
                    <span style={{color: colors.icon}}>📞</span>
                    <span style={{color: colors.icon}}>💬</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  customizationPage: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    overflow: 'auto',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: '12px 16px',
    borderBottom: '1px solid #333',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  logo: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  btn: {
    padding: '6px 12px',
    fontSize: '12px',
    border: '1px solid',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderColor: '#666',
    color: '#fff',
  },
  btnClear: {
    backgroundColor: 'transparent',
    borderColor: '#666',
    color: '#fff',
  },
  btnTrial: {
    backgroundColor: 'transparent',
    borderColor: '#FFD700',
    color: '#FFD700',
  },
  btnBuy: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    color: '#000',
  },
  content: {
    padding: '16px',
    maxWidth: '100%',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  tab: {
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    color: '#fff',
    borderBottom: '2px solid #FFD700',
  },
  tabContent: {
    marginBottom: '20px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#fff',
  },
  themesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  themeCard: {
    cursor: 'pointer',
    border: '2px solid #333',
    borderRadius: '8px',
    padding: '8px',
    transition: 'all 0.3s',
    backgroundColor: '#1a1a1a',
  },
  themeCardSelected: {
    borderColor: '#FFD700',
    backgroundColor: '#2a2a2a',
  },
  themePreview: {
    backgroundColor: '#8B0000',
    borderRadius: '6px',
    height: '100px',
    marginBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  themeHeaderStandard: {
    fontSize: '8px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '4px',
  },
  themeHeaderClassic: {
    fontSize: '8px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '4px',
  },
  themeHeaderModern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '20px',
    backgroundColor: '#fff',
  },
  themeAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    marginBottom: '4px',
  },
  themeName: {
    fontSize: '7px',
    color: '#fff',
    marginBottom: '2px',
  },
  themeButton: {
    fontSize: '6px',
    padding: '2px 6px',
    backgroundColor: '#fff',
    color: '#8B0000',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  themeSocialIcons: {
    display: 'flex',
    gap: '6px',
    fontSize: '10px',
    marginTop: '4px',
  },
  themeLabel: {
    fontSize: '11px',
    textAlign: 'center',
    color: '#ccc',
    margin: 0,
  },
  colorControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  colorControl: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    color: '#ccc',
    fontWeight: '500',
  },
  colorInputGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  colorPicker: {
    width: '50px',
    height: '40px',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  colorInput: {
    flex: 1,
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
  },
  formGroup: {
    marginBottom: '16px',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#1a1a1a',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
    marginTop: '6px',
    boxSizing: 'border-box',
  },
  previewContainer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: '280px',
    backgroundColor: '#222',
    borderRadius: '20px',
    padding: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
  },
  cardPreview: {
    borderRadius: '12px',
    padding: '24px 16px',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
  },
  previewHeader: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  previewHeaderModernFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    borderTopLeftRadius: '12px',
    borderTopRightRadius: '12px',
  },
  previewAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    marginTop: '40px',
    marginBottom: '8px',
  },
  previewName: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  previewDesignation: {
    fontSize: '12px',
    opacity: 0.8,
  },
  previewIcons: {
    display: 'flex',
    gap: '16px',
    fontSize: '20px',
    margin: '12px 0',
  },
  previewIconsModern: {
    display: 'flex',
    gap: '20px',
    fontSize: '24px',
    margin: '16px 0',
  },
  previewButton: {
    padding: '10px 24px',
    borderRadius: '20px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '12px 0',
  },
  previewContact: {
    marginTop: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
};

export default CardCustomization;