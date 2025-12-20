import React, { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * PublicProfile Component
 * 
 * Displays user profile based on theme from getUser API
 * 
 * THEME SYSTEM:
 * - Fetches theme from getUser API: POST /userProfile/getUser { userId }
 * - Theme values: 'standard', 'modern', 'epic'
 * - Theme priority:
 *   1. getUser API response (data.theme) - PRIMARY SOURCE
 *   2. Profile data (profile.theme)
 *   3. Profile data (profile.selectedTemplate) - backward compatibility
 *   4. Default: 'standard'
 * 
 * THEME DESIGNS:
 * - 'standard': White background, green borders, clean design
 * - 'modern': Purple gradient background, white text, modern design
 * - 'epic': Black background, yellow borders, bold design
 */

// Template rendering function - matches CheckoutPage templates exactly
// Supports three themes: 'standard', 'modern', 'epic'
// Theme is determined by getUser API response
const renderProfileTemplate = (templateId, profile) => {
  const fullName = profile?.fullName || 'John Doe';
  const designation = profile?.companyDesignation || 'Software Engineer';
  const company = profile?.companyName || 'Tech Company Inc.';
  
  // Get all phone numbers
  const allPhones = (profile?.phoneNumbers || []).map(phoneObj => {
    if (phoneObj.number && phoneObj.number.startsWith('+') && !phoneObj.countryCode) {
      return phoneObj.number;
    }
    return phoneObj.countryCode 
      ? `${phoneObj.countryCode} ${phoneObj.number || ''}`.trim()
      : phoneObj.number || '';
  }).filter(p => p);
  
  const phone = allPhones[0] || '+971 50 000 0000';
  
  // Get all emails
  const allEmails = (profile?.emails || []).map(e => e.emailAddress).filter(e => e);
  const email = allEmails[0] || 'john.doe@company.com';
  
  const about = profile?.about || '';
  const contactDetails = profile?.contactDetails || {};
  const address = contactDetails.address || '';
  const emirates = contactDetails.state || '';
  const country = contactDetails.country || '';
  const googleMapLink = contactDetails.googleMapLink || '';
  const profilePic = profile?.profilePicture || profile?.profileImage || '';
  const coverImage = profile?.coverImage || '';
  const companyLogo = profile?.companyLogo || '';
  const socialMedia = profile?.socialMedia || [];

  // Standard Template - White background with green borders
  if (templateId === 'standard') {
    const socialLabels = socialMedia.length >= 3 
      ? [socialMedia[0]?.platform?.substring(0, 2) || 'Li', socialMedia[1]?.platform?.substring(0, 2) || 'In', socialMedia[2]?.platform?.substring(0, 2) || 'Tw']
      : ['Li', 'In', 'Tw'];
    
    return (
      <div
        className="public-profile-template"
        style={{
          borderRadius: 0,
          padding: '40px 20px',
          background: coverImage ? `url(${coverImage}) center/cover no-repeat` : '#ffffff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {coverImage && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            zIndex: 0,
          }} />
        )}
        <div
          style={{
            border: '3px solid #81C784',
            borderRadius: '12px',
            padding: '40px 24px',
            backgroundColor: '#ffffff',
            marginBottom: '40px',
            maxWidth: '800px',
            margin: '0 auto 40px',
            width: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Company Logo */}
          {companyLogo && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '20px' 
            }}>
              <img
                src={companyLogo}
                alt={company}
                style={{
                  maxWidth: 'clamp(120px, 20vw, 200px)',
                  maxHeight: '80px',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Profile Picture */}
          {profilePic && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '24px' 
            }}>
              <img
                src={profilePic}
                alt={fullName}
                style={{
                  width: 'clamp(120px, 20vw, 180px)',
                  height: 'clamp(120px, 20vw, 180px)',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #81C784',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <h1 style={{ 
            color: '#000', 
            fontSize: 'clamp(28px, 5vw, 42px)', 
            fontWeight: 700, 
            margin: '0 0 16px 0', 
            textAlign: 'center' 
          }}>
            {fullName}
          </h1>
          <p style={{ 
            color: '#666', 
            fontSize: 'clamp(18px, 3vw, 28px)', 
            margin: '0 0 16px 0', 
            textAlign: 'center' 
          }}>
            {designation}
          </p>
          <p style={{ 
            color: '#000', 
            fontSize: 'clamp(16px, 2.5vw, 24px)', 
            margin: 0, 
            textAlign: 'center',
            fontWeight: 600
          }}>
            {company}
          </p>
        </div>

        {/* About Section */}
        {about && (
          <div style={{ 
            marginBottom: '40px', 
            maxWidth: '800px', 
            margin: '0 auto 40px',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}>
            <h3 style={{ 
              color: '#000', 
              fontSize: 'clamp(20px, 3.5vw, 32px)', 
              fontWeight: 700, 
              margin: '0 0 16px 0', 
              textAlign: 'left' 
            }}>
              About
            </h3>
            <p style={{ 
              color: '#666', 
              fontSize: 'clamp(14px, 2vw, 20px)', 
              lineHeight: '1.6',
              margin: 0
            }}>
              {about}
            </p>
          </div>
        )}

        <div style={{ 
          marginBottom: '40px', 
          maxWidth: '800px', 
          margin: '0 auto 40px',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}>
          <h3 style={{ 
            color: '#000', 
            fontSize: 'clamp(20px, 3.5vw, 32px)', 
            fontWeight: 700, 
            margin: '0 0 24px 0', 
            textAlign: 'left' 
          }}>
            Contact Info
          </h3>
          {allPhones.map((phoneNum, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px', 
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📞</span>
              <span style={{ color: '#000', wordBreak: 'break-word' }}>{phoneNum}</span>
            </div>
          ))}
          {allEmails.map((emailAddr, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '16px', 
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📧</span>
              <span style={{ color: '#000', wordBreak: 'break-word' }}>{emailAddr}</span>
            </div>
          ))}
          {address && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              marginBottom: '16px', 
              fontSize: 'clamp(16px, 2.5vw, 24px)',
              flexWrap: 'wrap',
            }}>
              <span style={{ fontSize: 'clamp(20px, 3vw, 32px)' }}>📍</span>
              <span style={{ color: '#000', wordBreak: 'break-word' }}>
                {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}
              </span>
            </div>
          )}
          {googleMapLink && (
            <div style={{ marginTop: '12px' }}>
              <a 
                href={googleMapLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#4CAF50', 
                  fontSize: 'clamp(14px, 2vw, 18px)', 
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                📍 View on Map
              </a>
            </div>
          )}
        </div>

        {socialMedia.length > 0 && (
          <div style={{ 
            marginBottom: '40px', 
            maxWidth: '800px', 
            margin: '0 auto 40px',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}>
            <h3 style={{ 
              color: '#000', 
              fontSize: 'clamp(20px, 3.5vw, 32px)', 
              fontWeight: 700, 
              margin: '0 0 24px 0', 
              textAlign: 'left' 
            }}>
              Social Media
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {socialMedia.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 'clamp(60px, 12vw, 80px)',
                    height: 'clamp(60px, 12vw, 80px)',
                    border: '2px solid #81C784',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'clamp(14px, 2vw, 20px)',
                    fontWeight: 600,
                    color: '#000',
                    backgroundColor: '#fff',
                    textDecoration: 'none',
                  }}
                  title={social.platform}
                >
                  {social.platform?.substring(0, 2).toUpperCase() || socialLabels[idx] || 'Li'}
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}>
          <button
            style={{
              width: '100%',
              padding: 'clamp(16px, 3vw, 24px)',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={() => {
              // Add to contacts functionality - include all phones and emails
              // Use proper vCard format with N: field for name parsing on mobile devices
              // N: format is LastName;FirstName;MiddleName;Prefix;Suffix
              // For full name, we'll split it or use it as first name
              const nameParts = fullName.trim().split(/\s+/);
              const firstName = nameParts[0] || '';
              const lastName = nameParts.slice(1).join(' ') || '';
              
              let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
              
              // N: field is required for proper name parsing on mobile devices
              vcard += `N:${lastName};${firstName};;;\n`;
              
              // FN: (Full Name) - display name
              vcard += `FN:${fullName}\n`;
              
              // ORG: (Organization/Company) - this is critical for company name
              if (company && company.trim()) {
                vcard += `ORG:${company.trim()}\n`;
              }
              
              // TITLE: (Job Title/Designation)
              if (designation && designation.trim()) {
                vcard += `TITLE:${designation.trim()}\n`;
              }
              
              // Add all phone numbers
              allPhones.forEach((phoneNum, idx) => {
                // Keep the + sign and just remove spaces for proper formatting
                const cleanPhone = phoneNum.replace(/\s+/g, ' ').trim();
                const phoneType = idx === 0 ? 'TEL;TYPE=CELL' : `TEL;TYPE=OTHER`;
                vcard += `${phoneType}:${cleanPhone}\n`;
              });
              
              // Add all emails
              allEmails.forEach((emailAddr, idx) => {
                const emailType = idx === 0 ? 'EMAIL;TYPE=WORK' : `EMAIL;TYPE=OTHER`;
                vcard += `${emailType}:${emailAddr}\n`;
              });
              
              // Add address if available
              if (address) {
                vcard += `ADR;TYPE=WORK:;;${address};${emirates || ''};${country || ''};;\n`;
              }
              
              // Add note (about) if available
              if (about) {
                vcard += `NOTE:${about}\n`;
              }
              
              vcard += `END:VCARD`;
              
              const blob = new Blob([vcard], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `${fullName.replace(/\s+/g, '_')}.vcf`;
              link.click();
              
              // Clean up the URL after a delay
              setTimeout(() => URL.revokeObjectURL(url), 100);
            }}
          >
            Add to Contacts
          </button>
        </div>
      </div>
    );
  }

  // Modern Template - Purple gradient background
  if (templateId === 'modern') {
    const socialLabels = socialMedia.length >= 3 
      ? ['Linkedin', 'Instagram', 'Twitter']
      : socialMedia.slice(0, 3).map(s => s.platform);
    
    return (
      <div
        className="public-profile-template"
        style={{
          borderRadius: 0,
          padding: '60px 20px',
          background: 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)',
          color: '#ffffff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '60px', 
            maxWidth: '1000px', 
            margin: '0 auto 60px',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}>
            {/* Company Logo */}
            {companyLogo && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '24px' 
              }}>
                <img
                  src={companyLogo}
                  alt={company}
                  style={{
                    maxWidth: 'clamp(120px, 20vw, 200px)',
                    maxHeight: '80px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Profile Picture */}
            {profilePic && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '24px' 
              }}>
                <img
                  src={profilePic}
                  alt={fullName}
                  style={{
                    width: 'clamp(120px, 20vw, 180px)',
                    height: 'clamp(120px, 20vw, 180px)',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <h1 style={{ 
              color: '#fff', 
              fontSize: 'clamp(32px, 6vw, 48px)', 
              fontWeight: 700, 
              margin: '0 0 16px 0' 
            }}>
              {fullName}
            </h1>
            <p style={{ 
              color: '#fff', 
              fontSize: 'clamp(20px, 3.5vw, 32px)', 
              margin: '0 0 16px 0' 
            }}>
              {designation}
            </p>
            <p style={{ 
              color: '#fff', 
              fontSize: 'clamp(18px, 3vw, 28px)', 
              margin: 0 
            }}>
              {company}
            </p>
          </div>

          {/* About Section */}
          {about && (
            <div style={{ 
              marginBottom: '40px', 
              maxWidth: '1000px', 
              margin: '0 auto 40px',
              width: '100%',
              padding: '0 20px',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}>
              <p style={{ 
                color: '#fff', 
                fontSize: 'clamp(16px, 2.5vw, 24px)', 
                lineHeight: '1.6',
                margin: 0,
                opacity: 0.95
              }}>
                {about}
              </p>
            </div>
          )}

          <div style={{ 
            marginBottom: '60px', 
            maxWidth: '1000px', 
            margin: '0 auto 60px',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box',
          }}>
            <h3 style={{ 
              color: '#fff', 
              fontSize: 'clamp(22px, 4vw, 36px)', 
              fontWeight: 700, 
              margin: '0 0 24px 0', 
              textAlign: 'left' 
            }}>
              Contact Information
            </h3>
            {allPhones.map((phoneNum, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px', 
                fontSize: 'clamp(18px, 3vw, 28px)',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📞</span>
                <span style={{ color: '#fff', wordBreak: 'break-word' }}>{phoneNum}</span>
              </div>
            ))}
            {allEmails.map((emailAddr, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginBottom: '20px', 
                fontSize: 'clamp(18px, 3vw, 28px)',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📧</span>
                <span style={{ color: '#fff', wordBreak: 'break-word' }}>{emailAddr}</span>
              </div>
            ))}
            {address && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '12px', 
                marginBottom: '20px', 
                fontSize: 'clamp(18px, 3vw, 28px)',
                flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 'clamp(24px, 4vw, 36px)', opacity: 0.9 }}>📍</span>
                <span style={{ color: '#fff', wordBreak: 'break-word' }}>
                  {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}
                </span>
              </div>
            )}
            {googleMapLink && (
              <div style={{ marginTop: '16px' }}>
                <a 
                  href={googleMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#fff', 
                    fontSize: 'clamp(16px, 2.5vw, 22px)', 
                    textDecoration: 'none',
                    fontWeight: 600,
                    opacity: 0.95
                  }}
                >
                  📍 View on Map
                </a>
              </div>
            )}
          </div>

          {socialMedia.length > 0 && (
            <div style={{ 
              maxWidth: '1000px', 
              margin: '0 auto',
              width: '100%',
              padding: '0 20px',
              boxSizing: 'border-box',
            }}>
              <h3 style={{ 
                color: '#fff', 
                fontSize: 'clamp(22px, 4vw, 36px)', 
                fontWeight: 700, 
                margin: '0 0 24px 0', 
                textAlign: 'left' 
              }}>
                Social Media
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {socialMedia.map((social, idx) => (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: 'clamp(14px, 2.5vw, 20px) clamp(20px, 4vw, 32px)',
                      backgroundColor: '#0077b5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: 'clamp(16px, 2.5vw, 24px)',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    {social.platform || 'Link'}
                  </a>
                ))}
              </div>
            </div>
          )}
      </div>
    );
  }

  // Epic Template - Exact match from CheckoutPage: Black card with bright yellow border, yellow accents, horizontal separator
  if (templateId === 'epic') {
    const socialLabels = socialMedia.length >= 3 
      ? socialMedia.slice(0, 3).map(s => s.platform)
      : ['Linkedin', 'Instagram', 'Twitter'];
    
    return (
      <div
        className="public-profile-template"
        style={{
          borderRadius: 0,
          padding: '40px 20px',
          background: coverImage 
            ? `linear-gradient(rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.95)), url(${coverImage}) center/cover no-repeat`
            : '#000000',
          border: '4px solid #ffeb3b',
          color: '#fff',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: '100%',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}>
          {/* Company Logo */}
          {companyLogo && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '20px' 
            }}>
              <img
                src={companyLogo}
                alt={company}
                style={{
                  maxWidth: 'clamp(120px, 20vw, 200px)',
                  maxHeight: '80px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 8px rgba(255, 235, 59, 0.3))',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Profile Picture */}
          {profilePic && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '20px' 
            }}>
              <img
                src={profilePic}
                alt={fullName}
                style={{
                  width: 'clamp(120px, 20vw, 180px)',
                  height: 'clamp(120px, 20vw, 180px)',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #ffeb3b',
                  boxShadow: '0 4px 12px rgba(255, 235, 59, 0.3)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Personal Information - Centered (Exact match from CheckoutPage) */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: '#fff', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 700, margin: '0 0 6px 0' }}>
              {fullName}
            </h3>
            <p style={{ color: '#ffeb3b', fontSize: 'clamp(15px, 2.5vw, 20px)', fontWeight: 700, margin: '0 0 6px 0' }}>
              {designation}
            </p>
            <p style={{ color: '#fff', fontSize: 'clamp(13px, 2vw, 16px)', opacity: 0.9, margin: 0, fontStyle: 'italic', fontWeight: 600 }}>
              {company}
            </p>
          </div>

          {/* About Section */}
          {about && (
            <div style={{ marginBottom: '12px', textAlign: 'center' }}>
              <p style={{ color: '#fff', fontSize: 'clamp(10px, 1.5vw, 14px)', margin: 0, opacity: 0.7, lineHeight: '1.3' }}>
                {about}
              </p>
            </div>
          )}

          {/* Yellow separator line */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#ffeb3b',
              margin: '0 auto 16px',
            }}
          />

          {/* Contact Info - All phones and emails (Exact match from CheckoutPage) */}
          <div style={{ 
            marginBottom: '20px', 
            fontSize: 'clamp(11px, 1.8vw, 16px)',
          }}>
            {allPhones.map((phoneNum, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: 'clamp(12px, 2vw, 16px)', opacity: 0.7, flexShrink: 0 }}>📞</span>
                <span style={{ color: '#fff', wordBreak: 'break-word' }}>{phoneNum}</span>
              </div>
            ))}
            {allEmails.map((emailAddr, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: 'clamp(12px, 2vw, 16px)', opacity: 0.7, flexShrink: 0 }}>📧</span>
                <span style={{ color: '#fff', wordBreak: 'break-word' }}>{emailAddr}</span>
              </div>
            ))}
            {address && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '6px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: 'clamp(12px, 2vw, 16px)', opacity: 0.7, flexShrink: 0 }}>📍</span>
                <span style={{ color: '#fff', wordBreak: 'break-word', fontSize: 'clamp(11px, 1.5vw, 14px)' }}>
                  {address}{emirates ? `, ${emirates}` : ''}{country ? `, ${country}` : ''}
                </span>
              </div>
            )}
            {googleMapLink && (
              <div style={{ marginTop: '8px' }}>
                <a 
                  href={googleMapLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#ffeb3b', 
                    fontSize: 'clamp(10px, 1.5vw, 14px)', 
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  📍 View on Map
                </a>
              </div>
            )}
          </div>

          {/* Social Media Buttons (Exact match from CheckoutPage) */}
          {socialMedia.length > 0 && (
            <div style={{ 
              marginTop: 'auto', 
              display: 'flex', 
              gap: '8px',
              width: '100%',
              flexWrap: 'wrap'
            }}>
              {socialMedia.slice(0, 3).map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: 'clamp(8px, 1.5vw, 12px) clamp(12px, 2vw, 16px)',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '1px solid #ffeb3b',
                    borderRadius: '8px',
                    fontSize: 'clamp(11px, 1.8vw, 14px)',
                    fontWeight: 600,
                    textAlign: 'center',
                    minWidth: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  {social.platform || socialLabels[idx] || 'Link'}
                </a>
              ))}
            </div>
          )}

          {/* Add to Contacts Button */}
          <div style={{ marginTop: '24px' }}>
            <button
              style={{
                width: '100%',
                padding: 'clamp(16px, 3vw, 24px)',
                backgroundColor: '#ffeb3b',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(18px, 2.5vw, 24px)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => {
                // Add to contacts functionality - include all phones and emails
                // Use proper vCard format with N: field for name parsing on mobile devices
                // N: format is LastName;FirstName;MiddleName;Prefix;Suffix
                // For full name, we'll split it or use it as first name
                const nameParts = fullName.trim().split(/\s+/);
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';
                
                let vcard = `BEGIN:VCARD\nVERSION:3.0\n`;
                
                // N: field is required for proper name parsing on mobile devices
                vcard += `N:${lastName};${firstName};;;\n`;
                
                // FN: (Full Name) - display name
                vcard += `FN:${fullName}\n`;
                
                // ORG: (Organization/Company) - this is critical for company name
                if (company && company.trim()) {
                  vcard += `ORG:${company.trim()}\n`;
                }
                
                // TITLE: (Job Title/Designation)
                if (designation && designation.trim()) {
                  vcard += `TITLE:${designation.trim()}\n`;
                }
                
                // Add all phone numbers
                allPhones.forEach((phoneNum, idx) => {
                  // Keep the + sign and just remove spaces for proper formatting
                  const cleanPhone = phoneNum.replace(/\s+/g, ' ').trim();
                  const phoneType = idx === 0 ? 'TEL;TYPE=CELL' : `TEL;TYPE=OTHER`;
                  vcard += `${phoneType}:${cleanPhone}\n`;
                });
                
                // Add all emails
                allEmails.forEach((emailAddr, idx) => {
                  const emailType = idx === 0 ? 'EMAIL;TYPE=WORK' : `EMAIL;TYPE=OTHER`;
                  vcard += `${emailType}:${emailAddr}\n`;
                });
                
                // Add address if available
                if (address) {
                  vcard += `ADR;TYPE=WORK:;;${address};${emirates || ''};${country || ''};;\n`;
                }
                
                // Add note (about) if available
                if (about) {
                  vcard += `NOTE:${about}\n`;
                }
                
                vcard += `END:VCARD`;
                
                const blob = new Blob([vcard], { type: 'text/vcard' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${fullName.replace(/\s+/g, '_')}.vcf`;
                link.click();
                
                // Clean up the URL after a delay
                setTimeout(() => URL.revokeObjectURL(url), 100);
              }}
            >
              Add to Contacts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback - if theme doesn't match any of the above, show standard
  console.warn('Unknown theme:', templateId, '- falling back to standard');
  return renderProfileTemplate('standard', profile);
};

const PublicProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let theme = 'standard'; // default theme
        let profileData = null;
        let actualUserId = userId; // Track the actual userId for getUser API

        // Step 1: FIRST, try to get theme from getUser API (PRIMARY SOURCE)
        // The URL parameter might be a profileId, so we need to handle both cases
        try {
          const userRes = await axios.post(
            'https://pg-cards.vercel.app/userProfile/getUser',
            { userId },
            { headers: { 'Content-Type': 'application/json' } }
          );
          
          console.log('📡 getUser API Response (Step 1):', userRes.data);
          
          if (userRes.data?.code === 200 && userRes.data.data) {
            // Get theme from getUser response - this is the PRIMARY source
            const userTheme = userRes.data.data.theme || userRes.data.data.selectedTemplate;
            if (userTheme) {
              theme = userTheme.toLowerCase().trim(); // Normalize theme value
              console.log('✅ Theme from getUser API (PRIMARY):', theme);
              console.log('📋 Full getUser data:', userRes.data.data);
              
              // Also get the actual userId and profileId if available
              actualUserId = userRes.data.data._id || userRes.data.data.id || userId;
              const profileId = userRes.data.data.profileId || userId;
              
              // Step 2: Get profile data using profileId from getUser response
              try {
                const profileRes = await axios.get(
                  `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
                );

                if (profileRes.data?.status === true && profileRes.data?.data) {
                  profileData = profileRes.data.data;
                } else if (profileRes.data?.code === 200 && profileRes.data?.data) {
                  profileData = profileRes.data.data;
                }
              } catch (profileErr) {
                console.warn('Could not fetch from getUserProfile:', profileErr);
              }
            } else {
              console.warn('⚠️ No theme found in getUser response:', userRes.data.data);
            }
          } else {
            console.warn('⚠️ getUser API response format unexpected:', userRes.data);
          }
        } catch (getUserErr) {
          console.warn('Could not fetch theme from getUser API with userId:', getUserErr);
          
          // Fallback: Try to get profile data first, then get userId from profile
          try {
            const profileRes = await axios.get(
              `https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`
            );

            if (profileRes.data?.status === true && profileRes.data?.data) {
              profileData = profileRes.data.data;
            } else if (profileRes.data?.code === 200 && profileRes.data?.data) {
              profileData = profileRes.data.data;
            }
            
            // If we got profile data, try to get theme using profile.userId
            if (profileData?.userId) {
              try {
                const userRes2 = await axios.post(
                  'https://pg-cards.vercel.app/userProfile/getUser',
                  { userId: profileData.userId },
                  { headers: { 'Content-Type': 'application/json' } }
                );
                
                if (userRes2.data?.code === 200 && userRes2.data.data) {
                  const userTheme = userRes2.data.data.theme || userRes2.data.data.selectedTemplate;
                  if (userTheme) {
                    theme = userTheme.toLowerCase().trim(); // Normalize theme value
                    console.log('✅ Theme from getUser API (using profile.userId):', theme);
                  }
                }
              } catch (getUserErr2) {
                console.warn('Could not fetch theme from getUser API with profile.userId:', getUserErr2);
              }
            }
          } catch (profileErr) {
            console.warn('Could not fetch from getUserProfile:', profileErr);
          }
        }

        // Step 3: Use profile data if we have it, otherwise try fallback
        if (profileData) {
          // Prioritize theme from getUser API, then profile theme, then selectedTemplate
          // IMPORTANT: Theme from getUser API is the PRIMARY source
          const finalTheme = theme || profileData.theme || profileData.selectedTemplate || 'standard';
          const normalizedTheme = finalTheme.toLowerCase().trim();
          
          // Normalize theme values: handle variations and typos
          let validatedTheme = normalizedTheme;
          if (validatedTheme === 'epic') validatedTheme = 'epic';
          
          // Validate theme - only allow: 'standard', 'modern', 'epic'
          const validThemes = ['standard', 'modern', 'epic'];
          if (!validThemes.includes(validatedTheme)) {
            console.warn('⚠️ Invalid theme detected:', validatedTheme, '- defaulting to standard');
            validatedTheme = 'standard';
          }
          
          // CRITICAL: Set the theme on profileData to ensure it's used for rendering
          profileData.theme = validatedTheme;
          
          console.log('🎨 Final theme applied to profile:', validatedTheme);
          console.log('📊 Profile data with theme:', { 
            fullName: profileData.fullName, 
            theme: profileData.theme,
            company: profileData.companyName,
            themeSource: theme ? 'getUser API' : 'profile data'
          });
          setProfile(profileData);
        } else {
          // Fallback: try getUser endpoint to get profileId
          try {
            const userRes = await axios.post(
              'https://pg-cards.vercel.app/userProfile/getUser',
              { userId },
              { headers: { 'Content-Type': 'application/json' } }
            );
            
            if (userRes.data?.code === 200 && userRes.data.data) {
              const userData = userRes.data.data;
              const profileId = userData.profileId || userData._id;
              const userTheme = userData.theme || userData.selectedTemplate || 'standard';
              theme = userTheme.toLowerCase().trim();
              
              // Normalize and validate theme
              if (theme === 'epi') theme = 'epic';
              const validThemes = ['standard', 'modern', 'epic'];
              if (!validThemes.includes(theme)) {
                console.warn('⚠️ Invalid theme in fallback:', theme, '- defaulting to standard');
                theme = 'standard';
              }
              
              if (profileId) {
                const profileRes = await axios.get(
                  `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
                );
                
                if (profileRes.data?.data || profileRes.data?.status === true) {
                  profileData = profileRes.data.data || profileRes.data.data;
                  // CRITICAL: Use theme from getUser API (PRIMARY SOURCE)
                  profileData.theme = theme;
                  console.log('🎨 Final theme applied (fallback):', profileData.theme);
                  console.log('📋 Theme source: getUser API fallback');
                  setProfile(profileData);
                  return;
                }
              }
            }
          } catch (fallbackErr) {
            console.error('Fallback fetch error:', fallbackErr);
          }
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Public profile fetch error:', err);
        setError('Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ width: '50px', height: '50px', border: '3px solid #ddd', borderTop: '3px solid #ff6b35', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', color: '#666' }}>Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <h2 style={{ color: '#000', marginBottom: '10px' }}>Profile not available</h2>
        <p style={{ color: '#666' }}>{error || 'This profile could not be found.'}</p>
      </div>
    );
  }

  // Get theme from profile (from getUser API), default to 'standard'
  // Support both 'theme' and 'selectedTemplate' for backward compatibility
  let theme = (profile?.theme || profile?.selectedTemplate || 'standard').toLowerCase().trim();
  
  // Normalize theme values: handle variations and typos
  if (theme === 'epi') theme = 'epic';
  
  // Validate theme - only allow: 'standard', 'modern', 'epic'
  const validThemes = ['standard', 'modern', 'epic'];
  if (!validThemes.includes(theme)) {
    console.warn('⚠️ Invalid theme detected:', theme, '- defaulting to standard');
    theme = 'standard';
  }
  
  const normalizedTheme = theme;
  
  console.log('🎨 Rendering PublicProfile with theme:', normalizedTheme, {
    availableThemes: validThemes,
    selectedTheme: normalizedTheme,
    profileTheme: profile?.theme,
    profileSelectedTemplate: profile?.selectedTemplate,
    profileId: profile?._id || profile?.id
  });
  
  // Log if theme is epic to confirm it's working
  if (normalizedTheme === 'epic') {
    console.log('🔥 EPIC THEME CONFIRMED - Rendering epic template');
  }

  // Set background color based on theme
  const getBackgroundColor = (theme) => {
    switch(theme) {
      case 'modern':
        return 'linear-gradient(180deg, #f0ebff 0%, #e8e0f5 100%)';
      case 'epic':
        return '#1a1a1a';
      default:
        return '#f5f5f5';
    }
  };

  // Debug: Log theme information
  console.log('🎨 PublicProfile Render:', {
    theme: normalizedTheme,
    profileTheme: profile?.theme,
    profileSelectedTemplate: profile?.selectedTemplate,
    profileId: profile?._id || profile?.id
  });

  return (
    <div style={{
      width: '100%',
      margin: 0,
      padding: 0,
    }}>
      {renderProfileTemplate(normalizedTheme, profile)}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        html {
          margin: 0;
          padding: 0;
        }
        @media (max-width: 768px) {
          .public-profile-template > div {
            padding: 20px !important;
          }
          .public-profile-template h1 {
            font-size: 32px !important;
          }
          .public-profile-template h3 {
            font-size: 24px !important;
          }
          .public-profile-template p {
            font-size: 18px !important;
          }
        }
        @media (max-width: 480px) {
          .public-profile-template > div {
            padding: 16px !important;
          }
          .public-profile-template h1 {
            font-size: 28px !important;
          }
          .public-profile-template h3 {
            font-size: 20px !important;
          }
          .public-profile-template p {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PublicProfile;



