import React, { useEffect } from 'react';
import axios from 'axios';

/**
 * ThemeRouter Component
 * Checks backend theme from getUser API and redirects to appropriate theme page
 * Routes: /epic/:userId, /modern/:userId, /standard/:userId
 * This component only redirects - it doesn't render the profile pages
 */
const ThemeRouter = ({ userId }) => {
  useEffect(() => {
    const fetchThemeAndRedirect = async () => {
      try {
        console.log('🔍 ThemeRouter: Fetching theme for userId:', userId);
        
        // Get theme from getUser API
        const userRes = await axios.post(
          'https://pg-cards.vercel.app/userProfile/getUser',
          { userId },
          { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('📡 ThemeRouter: getUser API Response:', userRes.data);

        if (userRes.data?.code === 200 && userRes.data.data) {
          // Get theme from response
          const userTheme = userRes.data.data.theme || userRes.data.data.selectedTemplate;
          
          if (userTheme) {
            // Normalize theme
            let normalizedTheme = String(userTheme).toLowerCase().trim();
            if (normalizedTheme === 'epi') normalizedTheme = 'epic';
            
            // Validate theme
            const validThemes = ['standard', 'modern', 'epic'];
            if (validThemes.includes(normalizedTheme)) {
              console.log('✅ ThemeRouter: Theme detected:', normalizedTheme);
              
              // Redirect to theme-specific route
              const themeRoute = `/${normalizedTheme}/${userId}`;
              console.log('🔄 ThemeRouter: Redirecting to:', themeRoute);
              
              // Update URL and trigger navigation
              window.history.replaceState({}, '', themeRoute);
              window.dispatchEvent(new Event('popstate'));
              return;
            } else {
              console.warn('⚠️ ThemeRouter: Invalid theme:', normalizedTheme, '- defaulting to standard');
            }
          } else {
            console.warn('⚠️ ThemeRouter: No theme found, defaulting to standard');
          }
        } else {
          console.warn('⚠️ ThemeRouter: getUser API response format unexpected');
        }
        
        // Default fallback to standard
        const defaultRoute = `/standard/${userId}`;
        console.log('🔄 ThemeRouter: Redirecting to default:', defaultRoute);
        window.history.replaceState({}, '', defaultRoute);
        window.dispatchEvent(new Event('popstate'));
      } catch (err) {
        console.error('❌ ThemeRouter: Error fetching theme:', err);
        // Default fallback to standard on error
        const defaultRoute = `/standard/${userId}`;
        console.log('🔄 ThemeRouter: Error - Redirecting to default:', defaultRoute);
        window.history.replaceState({}, '', defaultRoute);
        window.dispatchEvent(new Event('popstate'));
      }
    };

    if (userId) {
      fetchThemeAndRedirect();
    }
  }, [userId]);

  // Show loading while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ width: '50px', height: '50px', border: '3px solid #ddd', borderTop: '3px solid #0066ff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '20px', color: '#666' }}>Loading theme...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ThemeRouter;
