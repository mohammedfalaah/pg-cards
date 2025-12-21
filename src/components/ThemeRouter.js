import React, { useEffect } from 'react';
import axios from 'axios';

/**
 * ThemeRouter Component
 * Checks backend theme from getUser API and redirects to appropriate theme page
 * Routes: /epic/:userId, /modern/:userId, /standard/:userId
 * This component only redirects - it doesn't render the profile pages
 */
const ThemeRouter = ({ userId }) => {
  // Accept either a userId or a profileId in the URL.
  // Strategy:
  // 1) Try getUser(userId) to get theme.
  // 2) If that fails, try getUserProfile(userId) -> get profile.userId -> then getUser(userId) for theme.
  // 3) Fallback theme: standard.
  useEffect(() => {
    const fetchThemeAndRedirect = async () => {
      try {
        console.log('🔍 ThemeRouter: Fetching theme for userId:', userId);
        
        let theme = null;
        let themeSourceId = userId; // the id we used to retrieve theme
        let resolvedProfileId = null; // prefer profileId for final route so profile fetch works

        // Step 1: Try getUser with the provided id (could be userId)
        try {
          const userRes = await axios.post(
            'https://pg-cards.vercel.app/userProfile/getUser',
            { userId },
            { headers: { 'Content-Type': 'application/json' } }
          );

          console.log('📡 ThemeRouter: getUser API Response (step1):', userRes.data);

          if (userRes.data?.code === 200 && userRes.data.data) {
            theme = userRes.data.data.theme || userRes.data.data.selectedTemplate;
            resolvedProfileId = userRes.data.data.profileId || null;
          }
        } catch (err) {
          console.warn('ThemeRouter: getUser step1 failed, will try profile->userId', err);
        }

        // Step 2: If no theme yet, try getUserProfile with provided id, then getUser using profile.userId
        if (!theme) {
          try {
            const profileRes = await axios.get(
              `https://pg-cards.vercel.app/userProfile/getUserProfile/${userId}`
            );
            console.log('📡 ThemeRouter: getUserProfile Response (step2):', profileRes.data);

            if ((profileRes.data?.status === true || profileRes.data?.code === 200) && profileRes.data?.data) {
              const profileData = profileRes.data.data;
              resolvedProfileId = profileData._id || resolvedProfileId;
              // Try theme from profile as a fallback
              theme = profileData.theme || profileData.selectedTemplate;
              // If still no theme, fetch getUser using profile.userId
              if (!theme && profileData.userId) {
                const userRes2 = await axios.post(
                  'https://pg-cards.vercel.app/userProfile/getUser',
                  { userId: profileData.userId },
                  { headers: { 'Content-Type': 'application/json' } }
                );
                console.log('📡 ThemeRouter: getUser API Response (step2-userId):', userRes2.data);
                if (userRes2.data?.code === 200 && userRes2.data.data) {
                  theme = userRes2.data.data.theme || userRes2.data.data.selectedTemplate;
                  themeSourceId = profileData.userId; // theme came from userId now
                  resolvedProfileId = userRes2.data.data.profileId || resolvedProfileId;
                }
              }
            }
          } catch (err) {
            console.warn('ThemeRouter: profile->userId step failed', err);
          }
        }

        // Normalize/validate theme
        let normalizedTheme = 'standard';
        if (theme) {
          normalizedTheme = String(theme).toLowerCase().trim();
          if (normalizedTheme === 'epi') normalizedTheme = 'epic';
          const validThemes = ['standard', 'modern', 'epic'];
          if (!validThemes.includes(normalizedTheme)) {
            normalizedTheme = 'standard';
          }
        }

        console.log('✅ ThemeRouter: Final theme resolved:', normalizedTheme, 'sourceId:', themeSourceId);

        const finalId = resolvedProfileId || userId;
        const themeRoute = `/${normalizedTheme}/${finalId}`;
        console.log('🔄 ThemeRouter: Redirecting to:', themeRoute);
        window.history.replaceState({}, '', themeRoute);
        window.dispatchEvent(new Event('popstate'));
      } catch (err) {
        console.error('❌ ThemeRouter: Error fetching theme:', err);
        const defaultRoute = `/standard/${userId}`;
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
