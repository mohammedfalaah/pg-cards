// App.js - Fixed with proper User Profile and Order Success routing
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
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
import CheckoutPage from './CheckoutPage';
import UserProfile from './components/userProfile';
import OrderSuccessPage from './components/OrderSuccessPage';
import ProfilePreview from './components/ProfilePreview';
import Cart from './components/Cart';
import './App.css';

// Helper function to check if token has admin role
const checkAdminFromToken = (token) => {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.role === 'admin';
  } catch (e) {
    return false;
  }
};

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('authToken');
};

function App() {
  const [activeView, setActiveView] = useState('landing');
  const [productId, setProductId] = useState(null);
  const [previewProfileId, setPreviewProfileId] = useState(null);

  const [auth, setAuth] = useState(() => {
    if (typeof window === 'undefined') {
      return { user: null, token: null };
    }

    const token = getToken();
    let user = null;
    
    // Try to get user from token
    if (token) {
      try {
        const decoded = jwtDecode(token);
        user = {
          _id: decoded.id,
          role: decoded.role,
          email: decoded.email,
          name: decoded.name
        };
      } catch (e) {}
    }

    return { user, token };
  });

  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const token = getToken();
      const isAdminUser = checkAdminFromToken(token);

      // Check for admin route
      if (path.startsWith('/admin')) {
        if (token && isAdminUser) {
          setActiveView('admin');
        } else {
          setActiveView('landing');
          window.history.replaceState({}, '', '/');
        }
        return;
      }
      // Check for user profile route (authenticated user dashboard)
      else if ((path.startsWith('/user-profile') && !path.match(/^\/user-profile\/([^/]+)$/)) || 
               (path.startsWith('/profile') && !path.match(/^\/profile\/([^/]+)$/))) {
        setActiveView('user-profile');
      }
      // ✅ NEW: Check for order success route
      else if (path.startsWith('/order-success')) {
        setActiveView('order-success');
      }
      // Profile preview route (QR or direct)
      else if (path.match(/^\/user_profile\/([^/]+)$/)) {
        const match = path.match(/^\/user_profile\/([^/]+)$/);
        if (match && match[1]) {
          setPreviewProfileId(match[1]);
          setActiveView('profile-preview');
        }
      }
      // ✅ NEW: Themed profile routes (/{theme}/{profileId})
      else if (path.match(/^\/(standard|modern|epic)\/([^/]+)$/)) {
        const match = path.match(/^\/(standard|modern|epic)\/([^/]+)$/);
        if (match && match[2]) {
          setPreviewProfileId(match[2]);
          setActiveView('profile-preview');
        }
      }
     
      // Check for product detail route
      else if (path.match(/^\/product\/[^/]+\/([^/]+)$/)) {
        const productMatch = path.match(/^\/product\/[^/]+\/([^/]+)$/);
        setProductId(productMatch[1]);
        setActiveView('product-detail');
      }
      else if (path.startsWith('/customize')) setActiveView('customize');
      else if (path.startsWith('/checkout')) setActiveView('checkout');
      else if (path.startsWith('/cart')) setActiveView('cart');
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
    // Store token in localStorage
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token);
    }
    
    setAuth({ user, token });
    
    // Check if admin from token and redirect
    if (checkAdminFromToken(token)) {
      setActiveView('admin');
      window.history.pushState({}, '', '/admin');
    }
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('pgcards-auth');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    
    setAuth({ user: null, token: null });
    setActiveView('landing');
    window.history.pushState({}, '', '/');
  };

  return (
    <div className="App">
      {/* HEADER (hide on dashboard, admin panel, user profile, order success, public profile, and themed profiles) */}
      {activeView !== 'dashboard' && 
       activeView !== 'admin' && 
       activeView !== 'user-profile' &&
       activeView !== 'order-success' &&
       activeView !== 'profile-preview' &&
      (
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
      {activeView === 'cart' && <Cart />}
      {activeView === 'reset-password' && <ResetPassword />}
      {activeView === 'blog' && <Blog />}
      {activeView === 'contact' && <ContactUs />}
      {activeView === 'create-qr' && <CreateQR />}
      
      {/* User Profile route */}
      {activeView === 'user-profile' && <UserProfile />}

      {/* ✅ NEW: Order Success route */}
      {activeView === 'order-success' && <OrderSuccessPage />}

      {/* Profile preview for QR / user_profile/:id */}
      {activeView === 'profile-preview' && previewProfileId && (
        <ProfilePreview userId={previewProfileId} />
      )}

      {/* Theme Router - checks backend theme and redirects */}
      {/* Public profile view for QR scans */}
     

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

      {/* WHATSAPP → SHOW ON ALL PAGES except admin, user profile, order success, and profile preview */}
      {activeView !== 'admin' && 
       activeView !== 'user-profile' &&
       activeView !== 'order-success' &&
       activeView !== 'profile-preview' &&
       <WhatsappChat />}

      {/* FOOTER → HIDE on dashboard, reset-password, admin, user profile, order success, and profile preview */}
      {activeView !== 'dashboard' && 
       activeView !== 'reset-password' && 
       activeView !== 'admin' && 
       activeView !== 'user-profile' &&
       activeView !== 'order-success' &&
       activeView !== 'profile-preview' &&
       <Footer />}
    </div>
  );
}

export default App;