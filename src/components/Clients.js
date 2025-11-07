import React from 'react';
import './Clients.css';

const Clients = () => {
  const clients = [
    'SPEEDLINE',
    'DESIGN LIBRARY',
    { name: 'HK ENTERPRISES', special: 'gold-border' },
    'GE VERNOVA',
    'SCENTA BOOK',
    { name: 'SUMMERLAND MEDICAL CENTER', special: 'medical' },
    'DUBAI SPORTS COUNCIL',
    'esaad',
    'TELAL',
    'SPEEDLINE'
  ];

  return (
    <section className="clients-section">
      <div className="container">
        <div className="clients-grid">
          {clients.map((client, index) => {
            if (typeof client === 'object') {
              return (
                <div key={index} className={`client-logo ${client.special}`}>
                  {client.special === 'medical' && <span className="medical-icon">🩺</span>}
                  {client.name}
                </div>
              );
            }
            return (
              <div key={index} className="client-logo">
                {client}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Clients;

