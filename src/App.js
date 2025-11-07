import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import WhyChooseUs from './components/WhyChooseUs';
import Clients from './components/Clients';
import Sustainability from './components/Sustainability';
import Blog from './components/Blog';
import Footer from './components/Footer';
import CardCustomization from './components/CardCustomization';
import CreateQR from './components/CreateQR';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('landing');
  const [auth, setAuth] = useState(() => {
    if (typeof window === 'undefined') {
      return { user: null, token: null };
    }

    try {
      const stored = localStorage.getItem('pgcards-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          user: parsed.user || null,
          token: parsed.token || null,
        };
      }
    } catch (error) {
      console.error('Failed to parse auth from storage:', error);
    }
    return { user: null, token: null };
  });

  useEffect(() => {
    // Check initial route
    const checkRoute = () => {
      const path = window.location.pathname;
      if (path.startsWith('/customize')) {
        setActiveView('customize');
      } else if (path.startsWith('/dashboard')) {
        if (auth?.user && auth?.token) {
          setActiveView('dashboard');
        } else {
          setActiveView('landing');
          window.history.replaceState({}, '', '/');
        }
      } else if (path.startsWith('/reset-password')) {
        setActiveView('reset-password');
      } else if (path.startsWith('/blog')) {
        setActiveView('blog');
      } else if (path.startsWith('/create-qrCode') || path.startsWith('/create-qr')) {
        setActiveView('create-qr');
      } else {
        setActiveView('landing');
      }
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
  }, [auth?.user, auth?.token]);

  useEffect(() => {
    if (auth?.user && auth?.token) {
      localStorage.setItem('pgcards-auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('pgcards-auth');
    }
  }, [auth]);

  const handleLoginSuccess = ({ user, token }) => {
    setAuth({ user, token });
    setActiveView('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
    setActiveView('landing');
    window.history.pushState({}, '', '/');
  };

  if (activeView === 'customize') {
    return (
      <div className="App">
        <CardCustomization />
      </div>
    );
  }

  if (activeView === 'reset-password') {
    return (
      <div className="App">
        <ResetPassword />
      </div>
    );
  }

  if (activeView === 'blog') {
    return (
      <div className="App">
        <Header
          user={auth.user}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          isDashboard={false}
        />
        <Blog />
        <Footer />
      </div>
    );
  }

  if (activeView === 'create-qr') {
    return (
      <div className="App">
        <CreateQR />
      </div>
    );
  }

  return (
    <div className="App">
      {activeView !== 'dashboard' && (
        <Header
          user={auth.user}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          isDashboard={false}
        />
      )}
      {activeView === 'dashboard' ? (
        <Dashboard user={auth.user} token={auth.token} onLogout={handleLogout} />
      ) : (
        <>
          <Hero />
          <About />
          <WhyChooseUs />
          {/* <Clients /> */}
          <Sustainability />
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;

