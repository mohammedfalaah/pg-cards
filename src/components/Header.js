import React, { useState, useEffect } from 'react';
import PGCardsLogo from './PGCardsLogo';
import Login from './Login';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
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

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <nav className="navbar">
          <div className="logo-section">
            <PGCardsLogo size={120} />
          </div>
          
          <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
            <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
            <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About Us</a></li>
            <li><a href="#shop" onClick={(e) => handleSmoothScroll(e, '#shop')}>Shop</a></li>
            <li><a href="#blog" onClick={(e) => handleSmoothScroll(e, '#blog')}>Blog</a></li>
            <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact Us</a></li>
            <li><a href="#create" className="create-link" onClick={(e) => handleSmoothScroll(e, '#create')}>Create Free QR</a></li>
          </ul>
          
          <div className="header-actions">
            <div className="utility-icons">
              <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <div className="flag-icon">🇮🇳</div>
              <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <button className="btn-secondary" onClick={handleTryDemo}>Try Demo Card</button>
            <button className="btn-primary" onClick={() => setShowLogin(true)}>Login</button>
          </div>
          
          <button 
            className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </div>
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onLogin={(data) => {
            console.log('Login successful:', data);
            setShowLogin(false);
            // Add your login logic here
          }}
        />
      )}
    </header>
  );
};

export default Header;

