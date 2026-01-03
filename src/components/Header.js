import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import PGCardsLogo from './PGCardsLogo';
import Login from './Login';
import './Header.css';

// Simple admin check from token
const checkIsAdmin = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.role === 'admin';
  } catch (e) {
    return false;
  }
};

const Header = ({ user, onLoginSuccess, onLogout, isDashboard = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [logoSize, setLogoSize] = useState(120);
  const [currentUser, setCurrentUser] = useState(null);

  // Check for user in localStorage on mount
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const storedUser = localStorage.getItem("user");
    
    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setCurrentUser(userData);
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
      } catch (e) {
        console.error("Invalid userData in localStorage");
      }
    } else if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        if (onLoginSuccess) {
          onLoginSuccess(userData);
        }
      } catch (e) {
        console.error("Invalid user in localStorage");
      }
    }
  }, []);

  // Update currentUser when user prop changes
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    const handleResize = () => {
      setLogoSize(window.innerWidth <= 768 ? 80 : 120);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize(); 
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    if (isDashboard) {
      return;
    }
    
    // Handle blog navigation separately
    if (targetId === '#blog') {
      window.history.pushState({}, '', '/blog');
      window.dispatchEvent(new Event('navigate'));
      setIsMenuOpen(false);
      return;
    }

    if (targetId === '#shop') {
      window.history.pushState({}, '', '/shop');
      window.dispatchEvent(new Event('navigate'));
      setIsMenuOpen(false);
      return;
    }
    
    // Handle create QR navigation separately
    if (targetId === '#create') {
      window.history.pushState({}, '', '/create-qrCode');
      window.dispatchEvent(new Event('navigate'));
      setIsMenuOpen(false);
      return;
    }

    if (targetId === '#contact') {
      window.history.pushState({}, '', '/contact');
      window.dispatchEvent(new Event('navigate'));
      setIsMenuOpen(false);
      return;
    }
    
    const target = document.querySelector(targetId);
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleTryDemo = () => {
    window.history.pushState({}, '', '/customize');
    window.dispatchEvent(new Event('navigate'));
  };

  const handleViewSite = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  const handleLoginSuccess = (authData) => {
    const userData = authData.user || authData;
    const token = authData.token;

    // Store in localStorage
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('userId', userData._id || userData.id);
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
    }

    // Update state
    setCurrentUser(userData);
    setShowLogin(false);

    // Call parent callback
    if (onLoginSuccess) {
      onLoginSuccess(authData);
    }
  };

  const handleLogoutClick = () => {
    // Clear localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');

    // Update state
    setCurrentUser(null);

    // Call parent callback
    if (onLogout) {
      onLogout();
    }

    // Redirect to home
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new Event('navigate'));
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${isDashboard ? 'dashboard' : ''}`}>
      <div className="container">
        <nav className="navbar">
          <div className="logo-section">
            <PGCardsLogo size={logoSize} />
          </div>
          
          {!isDashboard && (
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li><a href="/" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About Us</a></li>
              <li><a href="#shop" onClick={(e) => handleSmoothScroll(e, '#shop')}>Shop</a></li>
              <li><a href="#blog" onClick={(e) => handleSmoothScroll(e, '#blog')}>Blog</a></li>
              <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact Us</a></li>
              {currentUser && (
                <li><a href="#dashboard" onClick={(e) => handleSmoothScroll(e, '#dashboard')}>Dashboard</a></li>
              )}
            </ul>
          )}
          
          <div style={{display:'contents'}} className="header-actions">
            {isDashboard ? (
              <button className="btn-secondary" onClick={handleViewSite}>View Website</button>
            ) : (
              <button style={{textWrap:'nowrap'}} className="btn-secondary" onClick={handleTryDemo}>Try Demo Card</button>
            )}
            
           {currentUser ? (
  <>
    {!isDashboard && (
      <button
        className="btn-primary"
        onClick={() => {
          const isAdmin = checkIsAdmin();
          window.history.pushState({}, '', isAdmin ? '/admin' : '/dashboard');
          window.dispatchEvent(new Event('navigate'));
        }}
      >
        My Account
      </button>
    )}
    <div className="profile-section">
      <img
        src={currentUser.profileImage || "/default-profile.png"}
        alt="Profile"
        className="profile-icon"
        title={currentUser.name || currentUser.email}
      />
      <div className="user-dropdown">
        <div className="user-name">{currentUser.name || 'User'}</div>
        <div className="user-email">{currentUser.email}</div>
        {checkIsAdmin() ? (
          <button 
            className="dropdown-item"
            onClick={() => {
              window.history.pushState({}, '', '/admin');
              window.dispatchEvent(new Event('navigate'));
            }}
          >
            <span>⚙️</span> Admin Panel
          </button>
        ) : (
          <button 
            className="dropdown-item"
            onClick={() => {
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new Event('navigate'));
            }}
          >
            <span>📊</span> Dashboard
          </button>
        )}
        <button 
          className="dropdown-item"
          onClick={() => {
            window.history.pushState({}, '', '/profile');
            window.dispatchEvent(new Event('navigate'));
          }}
        >
          <span>👤</span> My Profile
        </button>
        <button 
          className="dropdown-item"
          onClick={() => {
            window.history.pushState({}, '', '/orders');
            window.dispatchEvent(new Event('navigate'));
          }}
        >
          <span>📦</span> Orders
        </button>
        <hr style={{ border: '1px solid rgba(212, 175, 55, 0.2)', margin: '12px 0' }} />
        <button className="logout-btn" onClick={handleLogoutClick}>
          <span>🚪</span> Logout
        </button>
      </div>
    </div>
  </>
) : (
  <button className="btn-primary" onClick={() => setShowLogin(true)}>
    Login
  </button>
)}
          </div>
          
          {!isDashboard && (
            <button 
              className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </nav>
      </div>
      
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onLogin={handleLoginSuccess}
        />
      )}
    </header>
  );
};

export default Header;