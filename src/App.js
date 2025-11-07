import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Clients from './components/Clients';
import Sustainability from './components/Sustainability';
import Footer from './components/Footer';
import CardCustomization from './components/CardCustomization';
import './App.css';

function App() {
  const [showCustomization, setShowCustomization] = useState(false);

  useEffect(() => {
    // Check initial route
    const checkRoute = () => {
      const path = window.location.pathname;
      setShowCustomization(path === '/customize' || path === '/customize/');
    };

    checkRoute();

    // Listen for navigation events
    const handleNavigation = () => {
      checkRoute();
    };

    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('navigate', handleNavigation);
    
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('navigate', handleNavigation);
    };
  }, []);

  if (showCustomization) {
    return (
      <div className="App">
        <CardCustomization />
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <Hero />
      <About />
      <Clients />
      <Sustainability />
      <Footer />
    </div>
  );
}

export default App;

