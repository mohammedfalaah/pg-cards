import React, { useState, useEffect } from 'react';
import PGCardsLogo from './PGCardsLogo';
import './Login.css';
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pg-cards.vercel.app';
// const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '340844493737-ldev50489jene365c0smg0ttgm2siba5.apps.googleusercontent.com';

const Login = ({ onClose, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [extraData, setExtraData] = useState({ name: '', confirmPassword: '', phone: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

 
  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    if (!credentialResponse?.credential) return;

    setIsLoading(true);
    setApiError("");

    const token = credentialResponse.credential;

    const decoded = jwtDecode(token);
    console.log("Decoded Google user:", decoded);

    const res = await fetch(`${API_BASE_URL}/user/googleAuth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const result = await res.json();
    if (!res.ok)
      throw new Error(result?.message || result?.msg || "Google sign-in failed");

    const userData = result?.data?.data || result?.data?.user || result?.user;
    const appToken = result?.data?.token || result?.token;
    if (!userData || !appToken)
      throw new Error("Invalid response from server.");

    onLogin && onLogin({ user: userData, token: appToken });
  } catch (err) {
    console.error("Google auth error:", err);
    setApiError(err.message || "Google sign-in failed.");
  } finally {
    setIsLoading(false);
  }
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in extraData) {
      setExtraData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!extraData.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!extraData.confirmPassword) {
        newErrors.confirmPassword = 'Confirm your password';
      } else if (extraData.confirmPassword !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (extraData.phone && !/^\+?\d{7,15}$/.test(extraData.phone.replace(/\s|-/g, ''))) {
        newErrors.phone = 'Enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setApiError('');
    setForgotSuccess(false);

    if (!forgotEmail.trim()) {
      setApiError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setApiError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: forgotEmail.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.msg || 'Unable to send reset link. Please try again.');
      }

      setForgotSuccess(true);
      setApiError('');
    } catch (error) {
      console.error('Forgot password error:', error);
      setApiError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setApiError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        // LOGIN
        const response = await fetch(`${API_BASE_URL}/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
        });
        const result = await response.json();
        if (!response.ok) {
          toast.success('Unable to login. Please try again.',false) 
        }
        const userData = result?.data?.data;
        const token = result?.data?.token;
        if (!userData || !token) throw new Error('Invalid response from server.');
        onLogin && onLogin({ user: userData, token });
      } else {
        // REGISTER
        const registerRes = await fetch(`${API_BASE_URL}/user/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: extraData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            confirmPassword: extraData.confirmPassword,
            phone: extraData.phone.trim(),
          }),
        });
        const registerResult = await registerRes.json();
        if (!registerRes.ok) {
          throw new Error(registerResult?.message || registerResult?.msg || 'Registration failed.');
        }
        // Auto login after successful registration
        const loginRes = await fetch(`${API_BASE_URL}/user/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
        });
        const loginResult = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginResult?.msg || 'Login after registration failed.');
        const userData = loginResult?.data?.data;
        const token = loginResult?.data?.token;
        if (!userData || !token) throw new Error('Invalid response from server.');
        onLogin && onLogin({ user: userData, token });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setApiError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-overlay" onClick={onClose}>
      <div  className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="login-header">
          <h2 className="login-title">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create your account' : 'Reset Password'}
          </h2>
          {/* <p className="login-subtitle">
            {mode === 'login' ? 'Sign in to your PG CARDS account' : 
             mode === 'register' ? 'Register to get your dashboard and insights' : 
             'Enter your email and we\'ll send you a reset link'}
          </p> */}
        </div>

        {mode === 'forgot' ? (
          <form className="login-form" onSubmit={handleForgotPassword}>
            {forgotSuccess ? (
              <div className="forgot-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3>Check your email</h3>
                <p>We've sent a password reset link to <strong>{forgotEmail}</strong></p>
                <button 
                  type="button" 
                  className="login-submit" 
                  onClick={() => {
                    setMode('login');
                    setForgotEmail('');
                    setForgotSuccess(false);
                    setApiError('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="forgot-email">Email Address</label>
                  <input
                    type="email"
                    id="forgot-email"
                    name="forgot-email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                  />
                </div>

                {apiError && <div className="api-error">{apiError}</div>}

                <button type="submit" className="login-submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <div className="login-footer">
                  <p>
                    Remember your password?{' '}
                    <button 
                      type="button" 
                      className="link-button" 
                      onClick={() => {
                        setMode('login');
                        setForgotEmail('');
                        setApiError('');
                      }}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </>
            )}
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={extraData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter your name"
                autoComplete="name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={extraData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={extraData.phone}
                  onChange={handleChange}
                  className={errors.phone ? 'error' : ''}
                  placeholder="e.g. +971000000000"
                  autoComplete="tel"
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-link" 
                onClick={() => {
                  setMode('forgot');
                  setApiError('');
                  setForgotEmail(formData.email);
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button type="submit" className="login-submit" disabled={isLoading}>
            {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>

          {apiError && <div className="api-error">{apiError}</div>}

          <div className="login-divider">
            <span>or</span>
          </div>

          {/* <div className="social-login">
            <button type="button" className="social-btn google" onClick={handleGoogleClick}>
            
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
           
          </div> */}

          <div className="social-login">
          <GoogleLogin
           onSuccess={handleGoogleSuccess}
          onError={() => setApiError("Google Sign-In Failed")}
         />
          </div>


          <div className="login-footer">
            {mode === 'login' ? (
              <p>Don't have an account? <button type="button" className="link-button" onClick={() => setMode('register')}>Sign up</button></p>
            ) : (
              <p>Already have an account? <button type="button" className="link-button" onClick={() => setMode('login')}>Sign in</button></p>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default Login;

