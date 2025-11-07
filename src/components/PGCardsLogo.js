import React from 'react';
import './PGCardsLogo.css';

const PGCardsLogo = ({ size = 50, showText = true, variant = 'default' }) => {
  return (
    <div className={`pg-logo ${variant}`}>
      <div className="logo-image-container" style={{ width: size, height: size }}>
        <img 
          src="/assets/images/logo.png" 
          alt="DC CARDS IU Logo" 
          className="logo-image"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    </div>
  );
};

export default PGCardsLogo;
