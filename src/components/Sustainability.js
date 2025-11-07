import React from 'react';
import './Sustainability.css';

const Sustainability = () => {
  const stats = [
    {
      number: '5 Million',
      text: 'trees are cut down each year to produce the Cards',
      icon: 'tree',
      position: 'top-left'
    },
    {
      number: '2,529,821,000',
      text: 'gallons of water is used to create papers used for business cards',
      icon: 'water',
      position: 'top-right'
    },
    {
      number: '88%',
      text: 'of all the paper business cards are thrown away within a week',
      icon: 'trash',
      position: 'middle-left'
    },
    {
      number: '33%',
      text: 'only 1/3 of the cards are made from recycled materials',
      icon: 'recycle',
      position: 'middle-right'
    },
    {
      number: '100 Billion',
      text: 'Business paper cards are printed every year',
      icon: 'cards',
      position: 'bottom-left'
    },
    {
      number: '20,000',
      text: 'Business Cards are made out of 1 tree',
      icon: 'tree-count',
      position: 'bottom-middle'
    }
  ];

  return (
    <section className="sustainability-section">
      <div className="container">
        <h2 className="section-title">Why go digital for the sake of sustainability</h2>
        <h3 className="section-subtitle">The Environmental Impact of Paper Business cards</h3>
        
        <div className="sustainability-grid">
          {stats.map((stat, index) => (
            <div key={index} className={`stat-card stat-${stat.position}`}>
              <div className={`stat-visual stat-visual-${stat.icon}`}>
                {stat.icon === 'tree' && (
                  <div className="visual-tree">
                    <svg viewBox="0 0 100 100" fill="none">
                      <rect x="45" y="60" width="10" height="30" fill="#8B4513"/>
                      <path d="M30 50 Q50 20 70 50 Q50 30 30 50" fill="#2d5016" opacity="0.8"/>
                      <path d="M25 45 Q50 15 75 45 Q50 25 25 45" fill="#2d5016"/>
                    </svg>
                  </div>
                )}
                {stat.icon === 'water' && (
                  <div className="visual-water">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path d="M20 40 Q30 30 50 35 T80 40 L80 80 L20 80 Z" fill="rgba(59, 130, 246, 0.3)"/>
                      <path d="M20 50 Q30 40 50 45 T80 50 L80 80 L20 80 Z" fill="rgba(59, 130, 246, 0.4)"/>
                      <circle cx="30" cy="45" r="2" fill="rgba(59, 130, 246, 0.6)"/>
                      <circle cx="50" cy="48" r="1.5" fill="rgba(59, 130, 246, 0.6)"/>
                      <circle cx="70" cy="46" r="2" fill="rgba(59, 130, 246, 0.6)"/>
                    </svg>
                  </div>
                )}
                {stat.icon === 'trash' && (
                  <div className="visual-trash">
                    <svg viewBox="0 0 100 100" fill="none">
                      <rect x="35" y="25" width="30" height="5" rx="2" fill="#666"/>
                      <path d="M30 35 L30 80 Q30 85 35 85 L65 85 Q70 85 70 80 L70 35 Z" fill="#444"/>
                      <rect x="40" y="40" width="20" height="35" fill="#333"/>
                      <path d="M45 50 L45 70 M55 50 L55 70" stroke="#666" strokeWidth="2"/>
                    </svg>
                  </div>
                )}
                {stat.icon === 'recycle' && (
                  <div className="visual-recycle">
                    <svg viewBox="0 0 100 100" fill="none">
                      <path d="M30 40 L50 30 L50 50 L40 45" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M70 40 L50 30 L50 50 L60 45" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M50 50 L50 70 L30 60 L40 55" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <path d="M50 50 L50 70 L70 60 L60 55" stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round"/>
                      <circle cx="50" cy="50" r="25" stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.3"/>
                    </svg>
                  </div>
                )}
                {stat.icon === 'cards' && (
                  <div className="visual-cards">
                    <svg viewBox="0 0 100 100" fill="none">
                      <rect x="20" y="30" width="60" height="40" rx="2" fill="#333" stroke="#666" strokeWidth="1"/>
                      <rect x="25" y="35" width="50" height="5" fill="#555"/>
                      <rect x="25" y="43" width="40" height="3" fill="#555"/>
                      <rect x="25" y="48" width="35" height="3" fill="#555"/>
                      <rect x="25" y="53" width="30" height="3" fill="#555"/>
                      <rect x="15" y="35" width="60" height="40" rx="2" fill="#222" stroke="#666" strokeWidth="1" opacity="0.8"/>
                      <rect x="10" y="40" width="60" height="40" rx="2" fill="#111" stroke="#666" strokeWidth="1" opacity="0.6"/>
                    </svg>
                  </div>
                )}
                {stat.icon === 'tree-count' && (
                  <div className="visual-tree-count">
                    <svg viewBox="0 0 100 100" fill="none">
                      <rect x="47" y="70" width="6" height="20" fill="#8B4513"/>
                      <path d="M35 60 Q50 30 65 60 Q50 40 35 60" fill="#2d5016" opacity="0.8"/>
                      <path d="M30 55 Q50 20 70 55 Q50 30 30 55" fill="#2d5016"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="stat-content">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-description">{stat.text}</div>
              </div>
            </div>
          ))}
          
          <div className="stat-card stat-qr">
            <div className="qr-code-display">
              <div className="qr-grid-small">
                {Array.from({ length: 25 }).map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const isCorner = (row < 2 && col < 2) || (row < 2 && col > 2) || (row > 2 && col < 2);
                  const shouldFill = isCorner || (row === 2 || col === 2) || (row + col) % 3 === 0;
                  return (
                    <div key={i} className={`qr-cell-small ${shouldFill ? 'filled' : ''}`}></div>
                  );
                })}
              </div>
              <div className="qr-corners-small">
                <div className="qr-corner-small top-left"></div>
                <div className="qr-corner-small top-right"></div>
                <div className="qr-corner-small bottom-left"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Sustainability;

