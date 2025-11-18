import React, { useState, useEffect } from 'react';
import PGCardsLogo from './PGCardsLogo';
import Login from './Login';
import './Header.css';

const Header = ({ user, onLoginSuccess, onLogout, isDashboard = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [logoSize, setLogoSize] = useState(120);
  

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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''} ${isDashboard ? 'dashboard' : ''}`}>
      <div className="container">
        <nav className="navbar">
          <div className="logo-section">
            <PGCardsLogo size={logoSize} />
          </div>
          
          {!isDashboard && (
            <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About Us</a></li>
              <li><a href="#shop" onClick={(e) => handleSmoothScroll(e, '#shop')}>Shop</a></li>
              <li><a href="#blog" onClick={(e) => handleSmoothScroll(e, '#blog')}>Blog</a></li>
              <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact Us</a></li>
              {/* <li><a href="#create" className="create-link" onClick={(e) => handleSmoothScroll(e, '#create')}>Create Free QR</a></li> */}
              {user && (
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
            {user && !isDashboard && (
              <button
                className="btn-primary"
                onClick={() => {
                  window.history.pushState({}, '', '/dashboard');
                  window.dispatchEvent(new Event('navigate'));
                }}
              >
                My Account
              </button>
            )}
            {user ? (
              <div className="user-auth">
                <div className="user-greeting">
                  <span className="user-name">{user.name || 'User'}</span>
                  <span className="user-email">{user.email}</span>
                </div>
                <button className="btn-logout" onClick={onLogout}>Logout</button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setShowLogin(true)}>Login</button>
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
          onLogin={(authData) => {
            setShowLogin(false);
            if (onLoginSuccess) {
              onLoginSuccess(authData);
            }
          }}
        />
      )}
    </header>
  );
};

export default Header;

