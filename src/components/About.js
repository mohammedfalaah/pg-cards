import React from 'react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <h2 className="about-title">ABOUT US</h2>
        
        <div className="about-content">
          <div className="about-subtitle">
            Making Life Easier with Smart Technology Together, We Make a Difference
          </div>
          
          <div className="about-text">
            <p>
              At PG CARDS, our goal is to help individuals and businesses harness the power of innovative technology to make everyday interactions effortless and impactful. Our NFC-enabled products allow you to share your contact information, social media links, and website instantly — all in a fast, seamless, and contactless way.
            </p>
            
            <p>
              Designed with flexibility in mind, PG CARDS offers fully customizable solutions in a variety of styles, so you can showcase your brand identity and values with ease. We are dedicated to supporting businesses and individuals in the digital age, helping them connect, engage, and grow more effectively.
            </p>
          </div>
          
          <div className="about-section-divider"></div>
          
          <div className="about-mission">
            <h3 className="mission-title">Empowering Connections with Smart Technology</h3>
            
            <p className="mission-text">
              PG CARDS is committed to delivering innovative NFC solutions designed to simplify and enhance everyday interactions for both individuals and businesses. Our mission is to empower people with smart technology that makes networking seamless, fast, and completely contactless. By combining cutting-edge design with user-friendly functionality, our products allow you to share contact details, social media profiles, websites, and other essential information effortlessly. At PG CARDS, we believe in creating tools that not only streamline communication but also help individuals and businesses leave a lasting impression. Our fully customizable solutions are built to reflect your brand identity, foster meaningful connections, and help you thrive in today's fast-paced digital world.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

