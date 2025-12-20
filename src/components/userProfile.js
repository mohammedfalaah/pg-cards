import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import Login from './Login';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrImage, setQrImage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [theme, setTheme] = useState('standard');

  // Get user ID from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch full profile data and theme
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setShowLogin(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch user data from getUser API to get theme
        try {
          const userRes = await axios.post(
            'https://pg-cards.vercel.app/userProfile/getUser',
            { userId },
            { headers: { 'Content-Type': 'application/json' } }
          );

          if (userRes.data?.code === 200 && userRes.data.data) {
            const userTheme = userRes.data.data.theme || userRes.data.data.selectedTemplate || 'standard';
            setTheme(userTheme.toLowerCase().trim());
            
            // Also get profileId if available
            const profileId = userRes.data.data.profileId || userRes.data.data._id;
            
            // Fetch full profile data
            if (profileId) {
              try {
                const profileRes = await axios.get(
                  `https://pg-cards.vercel.app/userProfile/getUserProfile/${profileId}`
                );

                if (profileRes.data?.status === true && profileRes.data?.data) {
                  setProfileData(profileRes.data.data);
                } else if (profileRes.data?.code === 200 && profileRes.data?.data) {
                  setProfileData(profileRes.data.data);
                }
              } catch (profileErr) {
                console.warn('Could not fetch profile data:', profileErr);
              }
            }
          }
        } catch (getUserErr) {
          console.warn('Could not fetch user data:', getUserErr);
        }

        // Also try to get from localStorage
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUserData(JSON.parse(storedUser));
          }
        } catch (e) {
          console.error('Failed to parse user from storage', e);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleLoginSuccess = ({ user, token }) => {
    localStorage.setItem('userId', user._id || user.id);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUserData(user);
    setShowLogin(false);
    setLoading(false);
    toast.success('Login successful!');
  };

  // Call backend to get QR image + redirectUrl for this user
  const generateQRCode = async () => {
    if (!userId) {
      setShowLogin(true);
      return;
    }

    setQrLoading(true);
    try {
      const response = await axios.post(
        'https://pg-cards.vercel.app/userProfile/getUser',
        { userId },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data?.code === 200 && response.data.data) {
        setQrImage(response.data.data.qr || '');
        setRedirectUrl(response.data.data.redirectUrl || '');
      } else {
        toast.error(response.data?.msg || 'Failed to generate QR');
      }
    } catch (error) {
      console.error('Error generating QR:', error);
      toast.error(error.response?.data?.msg || 'Network error');
    } finally {
      setQrLoading(false);
    }
  };

  // Auto-load QR when user opens the QR tab
  useEffect(() => {
    if (userId && activeTab === 'qr' && !qrImage && !redirectUrl && !qrLoading) {
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab]);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  if (loading) {
    return (
      <div className="loadingContainer">
        <div className="loader"></div>
        <p className="loadingText">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profileContainer">
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onLogin={handleLoginSuccess}
        />
      )}

      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="breadcrumbLink" onClick={() => navigateTo('/')}>Home</span>
        <span className="breadcrumbSeparator">/</span>
        <span className="breadcrumbActive">My Profile</span>
      </div>

      <div className="profileWrapper">
        {/* Sidebar */}
        <div className="profileSidebar">
          <div className="userAvatarSection">
            <div className="userAvatar">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <h3 className="userName">{userData?.name || 'User'}</h3>
            <p className="userEmail">{userData?.email || ''}</p>
            <div className="userStats">
              <div className="statItem">
                <span className="statValue">{orders.length}</span>
                <span className="statLabel">Orders</span>
              </div>
            </div>
          </div>

          <div className="sidebarMenu">
            <button 
              className={`menuItem ${activeTab === 'profile' ? 'menuItemActive' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              📋 Profile Details
            </button>
            <button 
              className={`menuItem ${activeTab === 'orders' ? 'menuItemActive' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 My Orders
            </button>
            <button 
              className={`menuItem ${activeTab === 'qr' ? 'menuItemActive' : ''}`}
              onClick={() => setActiveTab('qr')}
            >
              🔳 My QR Code
            </button>
            <button 
              className={`menuItem ${activeTab === 'settings' ? 'menuItemActive' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Settings
            </button>
          </div>

          <button 
            className="logoutButton"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            🚪 Logout
          </button>
        </div>

        {/* Main Content */}
        <div className="profileContent">
          {activeTab === 'profile' && (
            <div className="profileDetails">
              <h2 className="sectionTitle">Profile Information</h2>
              
              {/* Theme Display */}
              <div className="detailField" style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
                <label className="fieldLabel">Selected Theme</label>
                <div className="fieldValue" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px',
                  textTransform: 'capitalize',
                  fontWeight: 700,
                  color: theme === 'epic' ? '#ffeb3b' : theme === 'modern' ? '#9c88ff' : '#4CAF50'
                }}>
                  <span>{theme || 'standard'}</span>
                  {theme === 'epic' && <span>🔥</span>}
                  {theme === 'modern' && <span>✨</span>}
                  {theme === 'standard' && <span>✓</span>}
                </div>
              </div>

              <div className="detailsGrid">
                <div className="detailField">
                  <label className="fieldLabel">Full Name</label>
                  <div className="fieldValue">{profileData?.fullName || userData?.name || 'Not set'}</div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">Designation</label>
                  <div className="fieldValue">{profileData?.companyDesignation || 'Not set'}</div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">Company Name</label>
                  <div className="fieldValue">{profileData?.companyName || 'Not set'}</div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">Email Address</label>
                  <div className="fieldValue">
                    {profileData?.emails?.[0]?.emailAddress || userData?.email || 'Not set'}
                  </div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">Phone Number</label>
                  <div className="fieldValue">
                    {profileData?.phoneNumbers?.[0]?.number || userData?.phone || 'Not set'}
                  </div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">About</label>
                  <div className="fieldValue">{profileData?.about || 'Not set'}</div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">Address</label>
                  <div className="fieldValue">
                    {profileData?.contactDetails?.address 
                      ? `${profileData.contactDetails.address}, ${profileData.contactDetails.state || ''}, ${profileData.contactDetails.country || ''}`
                      : 'Not set'}
                  </div>
                </div>
                <div className="detailField">
                  <label className="fieldLabel">Account Created</label>
                  <div className="fieldValue">
                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Additional Phone Numbers */}
              {profileData?.phoneNumbers && profileData.phoneNumbers.length > 1 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: '#ffffff' }}>
                    Additional Phone Numbers
                  </h3>
                  <div className="detailsGrid">
                    {profileData.phoneNumbers.slice(1).map((phone, idx) => (
                      <div key={idx} className="detailField">
                        <label className="fieldLabel">{phone.label || 'Phone'} {idx + 2}</label>
                        <div className="fieldValue">{phone.number || 'Not set'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Emails */}
              {profileData?.emails && profileData.emails.length > 1 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: '#ffffff' }}>
                    Additional Email Addresses
                  </h3>
                  <div className="detailsGrid">
                    {profileData.emails.slice(1).map((email, idx) => (
                      <div key={idx} className="detailField">
                        <label className="fieldLabel">Email {idx + 2}</label>
                        <div className="fieldValue">{email.emailAddress || 'Not set'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {profileData?.socialMedia && profileData.socialMedia.length > 0 && (
                <div style={{ marginTop: '30px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '15px', color: '#ffffff' }}>
                    Social Media Links
                  </h3>
                  <div className="detailsGrid">
                    {profileData.socialMedia.map((social, idx) => (
                      <div key={idx} className="detailField">
                        <label className="fieldLabel">{social.platform || 'Social Media'}</label>
                        <div className="fieldValue">
                          <a 
                            href={social.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: '#d4af37', textDecoration: 'none' }}
                          >
                            {social.url || 'Not set'}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="ordersSection">
              <h2 className="sectionTitle">My Orders</h2>
              {orders.length === 0 ? (
                <div className="emptyState">
                  <div className="emptyIcon">📦</div>
                  <h3>No Orders Yet</h3>
                  <p>You haven't placed any orders yet.</p>
                  <button 
                    className="shopButton"
                    onClick={() => navigateTo('/shop')}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="ordersList">
                  {orders.map((order, index) => (
                    <div key={index} className="orderCard">
                      <div className="orderHeader">
                        <div>
                          <h4>Order #{order._id?.slice(-8) || index + 1}</h4>
                          <p className="orderDate">
                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`orderStatus ${order.status?.toLowerCase() || 'pending'}`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                      <div className="orderItems">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <div key={i} className="orderItem">
                            <span>{item.name || 'Product'} × {item.quantity || 1}</span>
                            <span>₹{item.price || 0}</span>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className="moreItems">+ {order.items.length - 2} more items</div>
                        )}
                      </div>
                      <div className="orderFooter">
                        <div className="orderTotal">
                          <span>Total:</span>
                          <span className="totalAmount">₹{order.totalAmount || 0}</span>
                        </div>
                        <button 
                          className="viewOrderButton"
                          onClick={() => navigateTo(`/orders/${order._id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="qrSection">
              <h2 className="sectionTitle">My Profile QR Code</h2>
              <p className="sectionSubtitle">Share this QR code to let others view your profile</p>
              
              <div className="qrDisplay">
                {qrImage || redirectUrl ? (
                  <>
                    <div className="qrImageContainer">
                      {qrImage ? (
                        <img
                          src={qrImage}
                          alt="Profile QR Code"
                          className="qrCode"
                        />
                      ) : (
                        <div className="qrCode">
                          <QRCodeSVG value={redirectUrl} size={260} level="H" />
                        </div>
                      )}
                      <p className="qrHint">Scan to open your PG Cards profile</p>
                    </div>

                    <div className="qrActions">
                      <button
                        onClick={() => redirectUrl && window.open(redirectUrl, '_blank')}
                        className="profileButton"
                        disabled={!redirectUrl}
                      >
                        🔗 View My Profile
                      </button>
                      <button
                        onClick={generateQRCode}
                        className="regenerateButton"
                        disabled={qrLoading}
                      >
                        {qrLoading ? 'Refreshing...' : '🔄 Refresh QR'}
                      </button>
                    </div>

                    <div className="profileLink">
                      <p className="linkLabel">Profile URL:</p>
                      <a
                        href={redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="linkUrl"
                      >
                        {redirectUrl}
                      </a>
                    </div>

                    {/* Profile Preview with Theme */}
                    {profileData && theme && (
                      <div style={{ marginTop: '40px' }}>
                        <h3 style={{ 
                          fontSize: '24px', 
                          fontWeight: 700, 
                          marginBottom: '20px',
                          color: '#ffffff',
                          textAlign: 'center'
                        }}>
                          Your Profile Preview ({theme.toUpperCase()} Theme)
                        </h3>
                        <div style={{
                          maxWidth: '400px',
                          margin: '0 auto',
                          padding: '20px',
                          background: theme === 'epic' ? '#000' : theme === 'modern' 
                            ? 'linear-gradient(180deg, #9c88ff 0%, #764ba2 100%)' 
                            : '#fff',
                          borderRadius: '12px',
                          border: theme === 'epic' ? '3px solid #ffeb3b' : theme === 'modern' ? 'none' : '2px solid #81C784',
                          color: theme === 'standard' ? '#000' : '#fff',
                        }}>
                          {profileData.profilePicture && (
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                              <img
                                src={profileData.profilePicture}
                                alt={profileData.fullName}
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: theme === 'epic' ? '3px solid #ffeb3b' : theme === 'modern' ? '3px solid rgba(255,255,255,0.3)' : '3px solid #81C784',
                                }}
                              />
                            </div>
                          )}
                          <h4 style={{ 
                            fontSize: '20px', 
                            fontWeight: 700, 
                            marginBottom: '8px',
                            textAlign: 'center',
                            color: theme === 'standard' ? '#000' : '#fff'
                          }}>
                            {profileData.fullName || 'Your Name'}
                          </h4>
                          <p style={{ 
                            fontSize: '14px', 
                            marginBottom: '8px',
                            textAlign: 'center',
                            color: theme === 'standard' ? '#666' : theme === 'epic' ? '#ffeb3b' : '#fff',
                            fontWeight: theme === 'epic' ? 700 : 400
                          }}>
                            {profileData.companyDesignation || 'Your Designation'}
                          </p>
                          <p style={{ 
                            fontSize: '13px', 
                            marginBottom: '16px',
                            textAlign: 'center',
                            color: theme === 'standard' ? '#000' : '#fff',
                            opacity: theme === 'epic' ? 0.9 : 1
                          }}>
                            {profileData.companyName || 'Your Company'}
                          </p>
                          {profileData.phoneNumbers?.[0]?.number && (
                            <p style={{ 
                              fontSize: '12px', 
                              marginBottom: '8px',
                              textAlign: 'center',
                              color: theme === 'standard' ? '#000' : '#fff'
                            }}>
                              📞 {profileData.phoneNumbers[0].number}
                            </p>
                          )}
                          {profileData.emails?.[0]?.emailAddress && (
                            <p style={{ 
                              fontSize: '12px', 
                              textAlign: 'center',
                              color: theme === 'standard' ? '#000' : '#fff'
                            }}>
                              📧 {profileData.emails[0].emailAddress}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="qrPlaceholder">
                    <div className="qrIcon">🔳</div>
                    <p>Please login to generate your QR profile link.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settingsSection">
              <h2 className="sectionTitle">Account Settings</h2>
              <div className="settingsForm">
                <div className="formGroup">
                  <label className="formLabel">Notification Preferences</label>
                  <div className="checkboxGroup">
                    <label className="checkboxLabel">
                      <input type="checkbox" defaultChecked />
                      Email notifications
                    </label>
                    <label className="checkboxLabel">
                      <input type="checkbox" defaultChecked />
                      Order updates
                    </label>
                    <label className="checkboxLabel">
                      <input type="checkbox" />
                      Promotional offers
                    </label>
                  </div>
                </div>
                
                <div className="formGroup">
                  <label className="formLabel">Privacy Settings</label>
                  <div className="privacyOptions">
                    <label className="radioLabel">
                      <input type="radio" name="privacy" defaultChecked />
                      Public profile
                    </label>
                    <label className="radioLabel">
                      <input type="radio" name="privacy" />
                      Private profile
                    </label>
                  </div>
                </div>
                
                <button className="saveButton">
                  💾 Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Profile Container */
        .profileContainer {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          color: #ffffff;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          padding: 20px 40px;
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
          font-size: 14px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .breadcrumbLink {
          color: #a0a0a0;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .breadcrumbLink:hover {
          color: #d4af37;
        }

        .breadcrumbSeparator {
          margin: 0 12px;
          color: rgba(212, 175, 55, 0.3);
        }

        .breadcrumbActive {
          color: #d4af37;
          font-weight: 600;
        }

        /* Profile Wrapper */
        .profileWrapper {
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 40px;
          min-height: calc(100vh - 80px);
        }

        /* Sidebar */
        .profileSidebar {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 30px;
          border: 1px solid rgba(212, 175, 55, 0.1);
          display: flex;
          flex-direction: column;
        }

        .userAvatarSection {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }

        .userAvatar {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #d4af37 0%, #f0d97a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          color: #0a0a0a;
          margin: 0 auto 20px;
        }

        .userName {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .userEmail {
          color: #a0a0a0;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .userStats {
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .statItem {
          text-align: center;
        }

        .statValue {
          display: block;
          font-size: 24px;
          font-weight: 700;
          color: #d4af37;
        }

        .statLabel {
          font-size: 12px;
          color: #a0a0a0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sidebarMenu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .menuItem {
          padding: 16px 20px;
          background: transparent;
          border: 1px solid rgba(212, 175, 55, 0.1);
          border-radius: 10px;
          color: #a0a0a0;
          font-size: 15px;
          text-align: left;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .menuItem:hover {
          background: rgba(212, 175, 55, 0.1);
          color: #ffffff;
          transform: translateX(5px);
        }

        .menuItemActive {
          background: rgba(212, 175, 55, 0.2);
          color: #d4af37;
          border-color: rgba(212, 175, 55, 0.4);
        }

        .logoutButton {
          padding: 16px;
          background: rgba(255, 59, 48, 0.1);
          border: 1px solid rgba(255, 59, 48, 0.3);
          border-radius: 10px;
          color: #ff3b30;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
        }

        .logoutButton:hover {
          background: rgba(255, 59, 48, 0.2);
          transform: translateY(-2px);
        }

        /* Profile Content */
        .profileContent {
          background: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 40px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .sectionTitle {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 20px;
          color: #ffffff;
          background: linear-gradient(135deg, #ffffff 0%, #d4af37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sectionSubtitle {
          color: #a0a0a0;
          margin-bottom: 30px;
        }

        /* Profile Details */
        .detailsGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
        }

        .detailField {
          padding: 20px;
          background: rgba(10, 10, 10, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .fieldLabel {
          display: block;
          font-size: 12px;
          color: #a0a0a0;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .fieldValue {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
        }

        /* QR Section */
        .qrDisplay {
          text-align: center;
          padding: 40px 20px;
        }

        .qrImageContainer {
          margin-bottom: 30px;
        }

        .qrCode {
          width: 300px;
          height: 300px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 2px solid rgba(212, 175, 55, 0.3);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          transition: all 0.3s ease;
        }

        .qrCode:hover {
          transform: scale(1.03);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
        }

        .qrHint {
          color: #a0a0a0;
          font-size: 14px;
          margin-top: 10px;
        }

        .qrActions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-bottom: 30px;
        }

        .regenerateButton, .downloadButton, .profileButton, .generateButton {
          padding: 12px 24px;
          border: 2px solid;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(26, 26, 26, 0.8);
        }

        .regenerateButton {
          color: #007aff;
          border-color: rgba(0, 122, 255, 0.3);
        }

        .regenerateButton:hover:not(:disabled) {
          background: rgba(0, 122, 255, 0.1);
          transform: translateY(-2px);
        }

        .downloadButton {
          color: #34c759;
          border-color: rgba(52, 199, 89, 0.3);
        }

        .downloadButton:hover {
          background: rgba(52, 199, 89, 0.1);
          transform: translateY(-2px);
        }

        .profileButton {
          color: #d4af37;
          border-color: rgba(212, 175, 55, 0.3);
        }

        .profileButton:hover {
          background: rgba(212, 175, 55, 0.1);
          transform: translateY(-2px);
        }

        .generateButton {
          color: #d4af37;
          border-color: rgba(212, 175, 55, 0.3);
          padding: 15px 30px;
          font-size: 16px;
        }

        .generateButton:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.1);
          transform: translateY(-3px);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .profileLink {
          background: rgba(10, 10, 10, 0.5);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .linkLabel {
          font-size: 14px;
          color: #a0a0a0;
          margin-bottom: 8px;
        }

        .linkUrl {
          color: #007aff;
          word-break: break-all;
          text-decoration: none;
          font-weight: 500;
        }

        .linkUrl:hover {
          text-decoration: underline;
        }

        .qrPlaceholder {
          padding: 60px 40px;
          background: rgba(10, 10, 10, 0.5);
          border-radius: 16px;
          border: 2px dashed rgba(212, 175, 55, 0.3);
        }

        .qrIcon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        /* Orders Section */
        .ordersSection {
          min-height: 400px;
        }

        .emptyState {
          text-align: center;
          padding: 60px 40px;
        }

        .emptyIcon {
          font-size: 80px;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .emptyState h3 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #ffffff;
        }

        .emptyState p {
          color: #a0a0a0;
          margin-bottom: 30px;
        }

        .shopButton {
          padding: 12px 30px;
          background: linear-gradient(135deg, #d4af37 0%, #f0d97a 100%);
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .shopButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
        }

        .ordersList {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .orderCard {
          background: rgba(10, 10, 10, 0.5);
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .orderHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .orderHeader h4 {
          margin: 0 0 8px 0;
          color: #ffffff;
          font-size: 18px;
        }

        .orderDate {
          color: #a0a0a0;
          font-size: 14px;
          margin: 0;
        }

        .orderStatus {
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .orderStatus.delivered {
          background: rgba(52, 199, 89, 0.1);
          color: #34c759;
        }

        .orderStatus.processing {
          background: rgba(255, 204, 0, 0.1);
          color: #ffcc00;
        }

        .orderStatus.pending {
          background: rgba(255, 149, 0, 0.1);
          color: #ff9500;
        }

        .orderItems {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .orderItem {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .moreItems {
          color: #a0a0a0;
          font-size: 14px;
          text-align: center;
          padding: 10px;
        }

        .orderFooter {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 20px;
          border-top: 1px solid rgba(212, 175, 55, 0.1);
        }

        .orderTotal {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .totalAmount {
          font-size: 20px;
          font-weight: 700;
          color: #d4af37;
        }

        .viewOrderButton {
          padding: 10px 20px;
          background: rgba(212, 175, 55, 0.1);
          color: #d4af37;
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .viewOrderButton:hover {
          background: rgba(212, 175, 55, 0.2);
          transform: translateY(-2px);
        }

        /* Settings Section */
        .settingsForm {
          max-width: 600px;
        }

        .formGroup {
          margin-bottom: 30px;
          padding: 25px;
          background: rgba(10, 10, 10, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(212, 175, 55, 0.1);
        }

        .formLabel {
          display: block;
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 15px;
        }

        .checkboxGroup, .privacyOptions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkboxLabel, .radioLabel {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #a0a0a0;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .checkboxLabel:hover, .radioLabel:hover {
          color: #ffffff;
        }

        input[type="checkbox"], input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #d4af37;
        }

        .saveButton {
          padding: 15px 30px;
          background: linear-gradient(135deg, #d4af37 0%, #f0d97a 100%);
          color: #0a0a0a;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .saveButton:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
        }

        /* Loading State */
        .loadingContainer {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
        }

        .loader {
          width: 60px;
          height: 60px;
          border: 3px solid rgba(212, 175, 55, 0.1);
          border-top: 3px solid #d4af37;
          border-radius: 50%;
          animation: spin 1s ease infinite;
        }

        .loadingText {
          margin-top: 20px;
          color: #a0a0a0;
          font-size: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .profileWrapper {
            grid-template-columns: 1fr;
          }
          
          .profileSidebar {
            order: 2;
          }
          
          .profileContent {
            order: 1;
          }
        }

        @media (max-width: 768px) {
          .profileWrapper {
            padding: 20px;
          }
          
          .breadcrumbs {
            padding: 16px 20px;
          }
          
          .profileContent {
            padding: 25px;
          }
          
          .detailsGrid {
            grid-template-columns: 1fr;
          }
          
          .qrActions {
            flex-direction: column;
            align-items: center;
          }
          
          .qrCode {
            width: 250px;
            height: 250px;
          }
        }

        @media (max-width: 480px) {
          .sectionTitle {
            font-size: 24px;
          }
          
          .profileWrapper {
            padding: 16px;
          }
          
          .profileContent {
            padding: 20px;
          }
          
          .qrCode {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;