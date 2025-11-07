import React, { useState, useEffect } from 'react';
import PGCardsLogo from './PGCardsLogo';
import './ResetPassword.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://pg-cards.vercel.app';

const ResetPassword = () => {
  const [token, setToken] = useState('');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Extract token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setApiError('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setApiError('Invalid or missing reset token.');
      return;
    }

    if (!validate()) {
      return;
    }

    setApiError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/user/resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || result?.msg || 'Unable to reset password. Please try again.');
      }

      setSuccess(true);
      setApiError('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('navigate'));
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setApiError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-header">
            <PGCardsLogo size={60} variant="inline" />
            <h1>Password Reset Successful</h1>
            <p>Your password has been successfully reset. Redirecting to login...</p>
          </div>
          <div className="reset-success-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <button 
            className="reset-btn-primary" 
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new Event('navigate'));
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <PGCardsLogo size={60} variant="inline" />
          <h1>Reset Your Password</h1>
          <p>Enter your new password below</p>
        </div>

        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={errors.newPassword ? 'error' : ''}
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={!token}
            />
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Confirm new password"
              autoComplete="new-password"
              disabled={!token}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {apiError && <div className="api-error">{apiError}</div>}

          <button 
            type="submit" 
            className="reset-btn-primary" 
            disabled={isLoading || !token}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>

          <div className="reset-password-footer">
            <p>
              Remember your password?{' '}
              <button 
                type="button" 
                className="link-button" 
                onClick={() => {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new Event('navigate'));
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

