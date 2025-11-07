import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = () => {
  const nfcCardRef = useRef(null);
  const heroBackgroundRef = useRef(null);
  const statsRef = useRef(null);

  useEffect(() => {
    // NFC Card 3D Effect
    const nfcCard = nfcCardRef.current;
    if (nfcCard) {
      const handleMouseMove = (e) => {
        const rect = nfcCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        nfcCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      };

      const handleMouseLeave = () => {
        nfcCard.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)';
      };

      nfcCard.addEventListener('mousemove', handleMouseMove);
      nfcCard.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        nfcCard.removeEventListener('mousemove', handleMouseMove);
        nfcCard.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, []);

  useEffect(() => {
    // Parallax effect for hero background
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      if (heroBackgroundRef.current) {
        heroBackgroundRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate stats on scroll
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px'
    };

    const animateValue = (element, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue.toLocaleString();
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = end.toLocaleString();
        }
      };
      window.requestAnimationFrame(step);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          statNumbers.forEach(stat => {
            const finalValue = parseInt(stat.textContent.replace(/,/g, ''));
            stat.textContent = '0';
            animateValue(stat, 0, finalValue, 2000);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (statsRef.current) {
      statsObserver.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        statsObserver.unobserve(statsRef.current);
      }
    };
  }, []);

  const handleShopNow = () => {
    console.log('Shop Now clicked');
  };

  return (
    <section id="home" className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <div className="feature-badge">
              <svg className="lightning-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
              <span style={{marginTop:'10px'}}>Best NFC & QR Solutions</span>
            </div>
            
            <h5 className="hero-title">Fast,Simple&Easy
            Way to Share Your info</h5>
            <p className="hero-subtitle">Our Smart NFC business card makes connecting easy and modern. One
            tap is all it takes to share your information instantly and digitally.</p>
            
            <button className="btn-cta" onClick={handleShopNow}>Shop Now</button>
            
            <div className="stats-grid" ref={statsRef}>
              <div className="stat-item">
                <div className="stat-number">90533</div>
                <div className="stat-label">CARD TAPS</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">2223</div>
                <div className="stat-label">Contact Share</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">63400</div>
                <div className="stat-label">Feedbacks</div>
              </div>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="card-container">
              <div className="nfc-card" ref={nfcCardRef}>
                <img 
                  src="/assets/images/golf-front.png" 
                  alt="NFC Business Card" 
                  className="nfc-card-image"
                />
              </div>
              <div className="card-shadow"></div>
            </div>
            <div className="scroll-indicator">
              <svg className="scroll-arrow up" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              <div className="scroll-line"></div>
              <svg className="scroll-arrow down" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-background" ref={heroBackgroundRef}>
        <div className="diagonal-lines"></div>
      </div>
    </section>
  );
};

export default Hero;

