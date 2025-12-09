// App.js - Fixed with proper User Profile routing
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
import AdminPanel from './components/AdminPanel';
import ResetPassword from './components/ResetPassword';
import ContactUs from './components/ContactUs';
import WhatsappChat from './components/WhatsappChat';
import ShopPage from './components/ShopPage';
import ProductDetailPage from './components/ProductDetailPage';
import './App.css';
import CheckoutPage from './CheckoutPage';
import UserProfile from './components/userProfile';

function App() {
  const [activeView, setActiveView] = useState('landing');
  const [productId, setProductId] = useState(null);

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

  // Helper function to check if user is admin
  const isAdmin = (user) => {
    if (!user) return false;
    return user.role === 'admin' || user.isAdmin === true;
  };

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;

      // Check for admin route
      if (path.startsWith('/admin')) {
        if (auth?.user && auth?.token && isAdmin(auth.user)) {
          setActiveView('admin');
        } else {
          setActiveView('landing');
          window.history.replaceState({}, '', '/');
        }
      }
      // ✅ FIXED: Check for user profile route
      else if (path.startsWith('/user-profile') || path.startsWith('/profile')) {
        setActiveView('user-profile');
      }
      // Check for product detail route
      else if (path.match(/^\/product\/[^/]+\/([^/]+)$/)) {
        const productMatch = path.match(/^\/product\/[^/]+\/([^/]+)$/);
        setProductId(productMatch[1]);
        setActiveView('product-detail');
      }
      else if (path.startsWith('/customize')) setActiveView('customize');
      else if (path.startsWith('/checkout')) setActiveView('checkout');
      else if (path.startsWith('/dashboard')) {
        if (auth?.user && auth?.token) {
          setActiveView('dashboard');
        } else {
          setActiveView('landing');
          window.history.replaceState({}, '', '/');
        }
      }
      else if (path.startsWith('/reset-password')) setActiveView('reset-password');
      else if (path.startsWith('/blog')) setActiveView('blog');
      else if (path.startsWith('/contact')) setActiveView('contact');
      else if (path.startsWith('/shop')) setActiveView('shop');
      else if (path.startsWith('/create-qrCode') || path.startsWith('/create-qr')) {
        setActiveView('create-qr');
      }
      else setActiveView('landing');
    };

    checkRoute();

    const handleNavigation = () => checkRoute();
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
    
    if (isAdmin(user)) {
      setActiveView('admin');
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleLogout = () => {
    setAuth({ user: null, token: null });
    setActiveView('landing');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="App">
      {/* HEADER (hide on dashboard, admin panel, and user profile) */}
      {activeView !== 'dashboard' && 
       activeView !== 'admin' && 
       activeView !== 'user-profile' && (
        <Header
          user={auth.user}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          isDashboard={false}
        />
      )}

      {/* PAGE CONTENTS */}
      {activeView === 'landing' && (
        <>
          <Hero />
          <About />
          <WhyChooseUs />
          <Sustainability />
        </>
      )}

      {activeView === 'customize' && <CardCustomization />}
      {activeView === 'shop' && <ShopPage />}
      {activeView === 'product-detail' && <ProductDetailPage productId={productId} />}
      {activeView === 'checkout' && <CheckoutPage />}
      {activeView === 'reset-password' && <ResetPassword />}
      {activeView === 'blog' && <Blog />}
      {activeView === 'contact' && <ContactUs />}
      {activeView === 'create-qr' && <CreateQR />}
      
      {/* ✅ FIXED: User Profile route */}
      {activeView === 'user-profile' && <UserProfile />}

      {activeView === 'dashboard' && (
        <Dashboard
          user={auth.user}
          token={auth.token}
          onLogout={handleLogout}
        />
      )}

      {activeView === 'admin' && (
        <AdminPanel
          user={auth.user}
          token={auth.token}
          onLogout={handleLogout}
        />
      )}

      {/* WHATSAPP → SHOW ON ALL PAGES except admin and user profile */}
      {activeView !== 'admin' && 
       activeView !== 'user-profile' && 
       <WhatsappChat />}

      {/* FOOTER → HIDE on dashboard, reset-password, admin, and user profile */}
      {activeView !== 'dashboard' && 
       activeView !== 'reset-password' && 
       activeView !== 'admin' && 
       activeView !== 'user-profile' && 
       <Footer />}
    </div>
  );
}

export default App;