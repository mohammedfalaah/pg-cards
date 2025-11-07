import React, { useState } from 'react';
import PGCardsLogo from './PGCardsLogo';
import './CardCustomization.css';

const CardCustomization = () => {
  const [activeTab, setActiveTab] = useState('appearance');
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
    { id: 'standard', name: 'Standard', preview: 'standard' },
    { id: 'classic-custom', name: 'Classic Custom', preview: 'classic-custom' },
    { id: 'modern', name: 'Modern', preview: 'modern' }
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

  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <div className="customization-page">
      <div className="customization-header">
        <div className="container">
          <div className="header-content">
            <PGCardsLogo size={40} variant="inline" />
            <div className="header-actions-custom">
              <button className="btn-cancel" onClick={handleBack}>Cancel</button>
              <button className="btn-clear">Clear All</button>
              <button className="btn-trial">Free Trial</button>
              <button className="btn-buy">Buy Now</button>
            </div>
          </div>
        </div>
      </div>

      <div className="customization-content">
        <div className="container">
          <div className="customization-layout">
            {/* Left Side - Controls */}
            <div className="customization-controls">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  APPEARANCE
                </button>
                <button 
                  className={`tab ${activeTab === 'personal-info' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personal-info')}
                >
                  PERSONAL INFO
                </button>
                <button 
                  className={`tab ${activeTab === 'links' ? 'active' : ''}`}
                  onClick={() => setActiveTab('links')}
                >
                  LINKS
                </button>
                <button 
                  className={`tab ${activeTab === 'data' ? 'active' : ''}`}
                  onClick={() => setActiveTab('data')}
                >
                  DATA
                </button>
              </div>

              {activeTab === 'appearance' && (
                <div className="tab-content">
                  <div className="section">
                    <h3 className="section-title">Select your theme</h3>
                    <div className="themes-grid">
                      {themes.map(theme => (
                        <div
                          key={theme.id}
                          className={`theme-card ${selectedTheme === theme.id ? 'selected' : ''}`}
                          onClick={() => setSelectedTheme(theme.id)}
                        >
                          <div className={`theme-preview theme-${theme.preview}`}>
                            {theme.preview === 'standard' && (
                              <>
                                <div className="theme-header-standard">INNOVATIVE</div>
                                <div className="theme-avatar"></div>
                              </>
                            )}
                            {theme.preview === 'classic-custom' && (
                              <>
                                <div className="theme-header-classic">LOGO</div>
                                <div className="theme-avatar"></div>
                                <div className="theme-name">Samuel</div>
                                <div className="theme-button">Contact Me</div>
                              </>
                            )}
                            {theme.preview === 'modern' && (
                              <>
                                <div className="theme-header-modern"></div>
                                <div className="theme-avatar"></div>
                                <div className="theme-social-icons">
                                  <span>📧</span>
                                  <span>📅</span>
                                  <span>📞</span>
                                  <span>💬</span>
                                </div>
                              </>
                            )}
                          </div>
                          <p className="theme-name-label">{theme.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section">
                    <h3 className="section-title">CUSTOMIZE COLOUR</h3>
                    <div className="color-controls">
                      <div className="color-control">
                        <label>Primary Color</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            value={colors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={colors.primary}
                            onChange={(e) => handleColorChange('primary', e.target.value)}
                            className="color-input"
                          />
                        </div>
                      </div>

                      <div className="color-control">
                        <label>Background Color</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            value={colors.background}
                            onChange={(e) => handleColorChange('background', e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={colors.background}
                            onChange={(e) => handleColorChange('background', e.target.value)}
                            className="color-input"
                          />
                        </div>
                      </div>

                      <div className="color-control">
                        <label>Icon Color</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            value={colors.icon}
                            onChange={(e) => handleColorChange('icon', e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={colors.icon}
                            onChange={(e) => handleColorChange('icon', e.target.value)}
                            className="color-input"
                          />
                        </div>
                      </div>

                      <div className="color-control">
                        <label>Icon Text Color</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            value={colors.iconText}
                            onChange={(e) => handleColorChange('iconText', e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={colors.iconText}
                            onChange={(e) => handleColorChange('iconText', e.target.value)}
                            className="color-input"
                          />
                        </div>
                      </div>

                      <div className="color-control">
                        <label>Text Color</label>
                        <div className="color-input-group">
                          <input
                            type="color"
                            value={colors.text}
                            onChange={(e) => handleColorChange('text', e.target.value)}
                            className="color-picker"
                          />
                          <input
                            type="text"
                            value={colors.text}
                            onChange={(e) => handleColorChange('text', e.target.value)}
                            className="color-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'personal-info' && (
                <div className="tab-content">
                  <div className="section">
                    <h3 className="section-title">Personal Information</h3>
                    <div className="form-group">
                      <label>Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter your name" 
                        value={personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Designation</label>
                      <input 
                        type="text" 
                        placeholder="Enter your designation" 
                        value={personalInfo.designation}
                        onChange={(e) => handlePersonalInfoChange('designation', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input 
                        type="tel" 
                        placeholder="+971 000 000 000" 
                        value={personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input 
                        type="email" 
                        placeholder="your.email@example.com" 
                        value={personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="tab-content">
                  <div className="section">
                    <h3 className="section-title">Social Links</h3>
                    <div className="form-group">
                      <label>Website</label>
                      <input type="url" placeholder="https://yourwebsite.com" />
                    </div>
                    <div className="form-group">
                      <label>LinkedIn</label>
                      <input type="url" placeholder="https://linkedin.com/in/yourprofile" />
                    </div>
                    <div className="form-group">
                      <label>Twitter</label>
                      <input type="url" placeholder="https://twitter.com/yourhandle" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="tab-content">
                  <div className="section">
                    <h3 className="section-title">Additional Data</h3>
                    <div className="form-group">
                      <label>Company</label>
                      <input type="text" placeholder="Your company name" />
                    </div>
                    <div className="form-group">
                      <label>Address</label>
                      <textarea placeholder="Enter your address" rows="3"></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Preview */}
            <div className="card-preview-container">
              <div className="phone-frame">
                <div className="phone-screen">
                  <div 
                    className={`card-preview theme-${selectedTheme}`}
                    style={{
                      backgroundColor: colors.background,
                      color: colors.text
                }}>
                    {selectedTheme === 'standard' && (
                      <>
                        <div className="preview-header" style={{ color: colors.primary }}>INNOVATIVE</div>
                        <div className="preview-avatar"></div>
                        <div className="preview-name" style={{ color: colors.text }}>
                          {personalInfo.name || 'Name'}
                        </div>
                        <div className="preview-designation" style={{ color: colors.text }}>
                          {personalInfo.designation || 'Designation'}
                        </div>
                      </>
                    )}

                    {selectedTheme === 'classic-custom' && (
                      <>
                        <div className="preview-header-classic" style={{ color: colors.primary }}>LOGO</div>
                        <div className="preview-avatar"></div>
                        <div className="preview-name" style={{ color: colors.text }}>
                          {personalInfo.name || 'Name'}
                        </div>
                        <div className="preview-designation" style={{ color: colors.text }}>
                          {personalInfo.designation || 'Designation'}
                        </div>
                        <div className="preview-icons-row" style={{ backgroundColor: colors.background }}>
                          <span style={{ color: colors.iconText }}>📧</span>
                          <span style={{ color: colors.iconText }}>📅</span>
                          <span style={{ color: colors.iconText }}>📞</span>
                          <span style={{ color: colors.iconText }}>💬</span>
                        </div>
                        <button className="preview-button" style={{ backgroundColor: colors.primary, color: colors.background }}>
                          Contact Me
                        </button>
                        <div className="preview-contact">
                          <div style={{ color: colors.text }}>
                            Phone: {personalInfo.phone || '+123 456 7890'}
                          </div>
                          <div style={{ color: colors.text }}>
                            Email: {personalInfo.email || 'your@email.com'}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedTheme === 'modern' && (
                      <>
                        <div className="preview-header-modern" style={{ backgroundColor: colors.primary }}></div>
                        <div className="preview-avatar"></div>
                        <div className="preview-name" style={{ color: colors.text }}>
                          {personalInfo.name || 'Name'}
                        </div>
                        <div className="preview-designation" style={{ color: colors.text }}>
                          {personalInfo.designation || 'Designation'}
                        </div>
                        <div className="preview-social-icons">
                          <span style={{ color: colors.icon }}>📧</span>
                          <span style={{ color: colors.icon }}>📅</span>
                          <span style={{ color: colors.icon }}>📞</span>
                          <span style={{ color: colors.icon }}>💬</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardCustomization;