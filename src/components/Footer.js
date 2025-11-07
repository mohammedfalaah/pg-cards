import React from 'react';
import PGCardsLogo from './PGCardsLogo';
import './Footer.css';

const Footer = () => {
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
              <li><a href="#home" onClick={(e) => handleSmoothScroll(e, '#home')}>Home</a></li>
              <li><a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>About Us</a></li>
              <li><a href="#shop" onClick={(e) => handleSmoothScroll(e, '#shop')}>Shop</a></li>
              <li><a href="#blog" onClick={(e) => handleSmoothScroll(e, '#blog')}>Blog</a></li>
              <li><a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>Contact Us</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Products</h3>
            <ul>
              <li><a href="#nfc-cards">NFC Business Cards</a></li>
              <li><a href="#qr-codes">QR Code Solutions</a></li>
              <li><a href="#digital-cards">Digital Cards</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <ul>
              <li>Email: info@pgcards.com</li>
              <li>Phone: +971 000 000 000</li>
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

