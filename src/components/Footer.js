import React from 'react';
import PGCardsLogo from './PGCardsLogo';
import './Footer.css';

const Footer = () => {
  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    
    // Handle home navigation
    if (path === '/' || path === '#home') {
      navigateTo('/');
      return;
    }
    
    // Handle other page navigations
    if (path === '#about') {
      const currentPath = window.location.pathname;
      if (currentPath !== '/') {
        navigateTo('/');
        setTimeout(() => {
          const target = document.querySelector('#about');
          if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }, 100);
      } else {
        const target = document.querySelector('#about');
        if (target) {
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }
      return;
    }
    
    // Handle shop, blog, contact navigation
    if (path === '#shop') {
      navigateTo('/shop');
    } else if (path === '#blog') {
      navigateTo('/blog');
    } else if (path === '#contact') {
      navigateTo('/contact');
    } else {
      navigateTo(path);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <PGCardsLogo size={40} showText={true} variant="inline" />
            </div>
            <p className="footer-tagline">Premium Digital Business Cards</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/" onClick={(e) => handleLinkClick(e, '/')}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleLinkClick(e, '#about')}>About Us</a></li>
              <li><a href="/shop" onClick={(e) => handleLinkClick(e, '#shop')}>Shop</a></li>
              <li><a href="/blog" onClick={(e) => handleLinkClick(e, '#blog')}>Blog</a></li>
              <li><a href="/contact" onClick={(e) => handleLinkClick(e, '#contact')}>Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Products</h3>
            <ul>
              <li><a href="/shop" onClick={(e) => handleLinkClick(e, '/shop')}>NFC Business Cards</a></li>
              {/* <li><a href="/create-qrCode" onClick={(e) => handleLinkClick(e, '/create-qrCode')}>QR Code Solutions</a></li> */}
              <li><a href="/shop" onClick={(e) => handleLinkClick(e, '/shop')}>Digital Cards</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <ul>
              <li>
                <a href="mailto:sales@pgcards.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Email: sales@pgcards.com
                </a>
              </li>
              <li>
                <a href="tel:+971521041735" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Phone: +971 52 104 1735
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 PG CARDS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

