import React from 'react';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const features = [
    {
      title: 'Customizable for Every Brand',
      description: 'Your digital business card should represent your unique identity. With PG CARDS, you get full customization options — from colors and designs to splash screens and auto-generated QR codes. Whether you\'re an entrepreneur, freelancer, or part of a corporate team, your card is designed to reflect your brand personality and values.'
    },
    {
      title: 'Eco-Friendly Networking',
      description: 'Make a positive impact while networking. PG CARDS are completely tree-free, water-free, and reusable. Reduce waste while maintaining a professional, high-quality experience. Every digital card you use contributes to a sustainable future.'
    },
    {
      title: 'Cost-Effective and Time-Saving',
      description: 'Save time and money with digital cards. No need to reprint outdated cards or worry about running out of stock. Update your details instantly, manage your connections, and give your team a powerful, reusable tool for networking success.'
    },
    {
      title: 'Corporate-Friendly Dashboard & App',
      description: 'For businesses, PG CARDS offers a dedicated mobile app and dashboard to manage team cards, track connections, update information, and provide employees with a consistent, branded networking experience. Perfect for modern companies looking to enhance efficiency and professionalism.'
    }
  ];

  return (
    <section id="why-choose-us" className="why-choose-us-section">
      <div className="container">
        <div className="why-choose-us-header">
          <h2 className="section-title">Why Choose Us</h2>
          <h3 className="section-subtitle">Why PG CARDS is the Future of Networking</h3>
        </div>

        <div className="why-choose-us-intro">
          <p>
            PG CARDS is more than just a business card — it's a tool that empowers professionals, enhances brand visibility, and creates lasting digital impressions. By combining <strong>smart technology, elegant design, and environmental responsibility</strong>, PG CARDS makes networking faster, easier, and more meaningful.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <h4 className="feature-title">{feature.title}</h4>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="why-choose-us-cta">
          <p>
            <strong>Step into the future of networking.</strong> Choose PG CARDS and simplify the way you connect, share, and grow in the digital era.
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;

