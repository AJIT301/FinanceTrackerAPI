import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/context/AuthProvider.jsx';
import App from './App.jsx';
import './main.scss';
import { createDebugger } from './auth/utils/debug';

// Create debugger for main initialization
const debug = createDebugger('app:init');

// COMPREHENSIVE theme setting to prevent ANY flicker
function setInitialTheme() {
  debug.log('Starting setInitialTheme');

  // Get the auth token to check if user is logged in
  const token = localStorage.getItem('authToken');
  debug.log('Token check', { hasToken: !!token });

  let initialTheme = 'light'; // default theme

  if (token) {
    debug.log('User is logged in, checking for user theme');
    try {
      // Try to get user data from token to access public_id
      const userPublicId = localStorage.getItem('currentUserPublicId');
      debug.log('currentUserPublicId check', { userPublicId });

      if (userPublicId) {
        const themeKey = `theme_${userPublicId}`;
        const userTheme = localStorage.getItem(themeKey);
        debug.log('User theme lookup', { themeKey, userTheme });

        if (userTheme) {
          initialTheme = userTheme;
          debug.log('User theme applied', { theme: initialTheme });
        }
      } else {
        // Fallback: look for any theme_ key in localStorage
        debug.log('No currentUserPublicId, searching localStorage for themes');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('theme_')) {
            const userTheme = localStorage.getItem(key);
            if (userTheme) {
              initialTheme = userTheme;
              // Extract and store the public ID for future use
              const extractedPublicId = key.replace('theme_', '');
              localStorage.setItem('currentUserPublicId', extractedPublicId);
              debug.log('Found and stored user theme', {
                publicId: extractedPublicId,
                theme: initialTheme
              });
              break;
            }
          }
        }
      }

    } catch (err) {
      debug.warn('Theme resolution failed, using default', { error: err.message });
    }
  } else {
    debug.log('User not logged in, checking general theme');
    // Fallback for non-logged-in users
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      initialTheme = savedTheme;
      debug.log('General theme applied', { theme: initialTheme });
    }
  }

  const isDark = initialTheme === 'dark';
  debug.log('Final theme decision', { theme: initialTheme, isDark });

  // Set the background colors immediately on html AND body
  const lightBg = '#ffffff';
  const darkBg = '#324775';
  const bgColor = isDark ? darkBg : lightBg;

  // Apply to html element (this prevents the flicker you're seeing)
  document.documentElement.style.backgroundColor = bgColor;
  document.documentElement.className = initialTheme;

  // Apply to body
  document.body.style.backgroundColor = bgColor;
  document.body.className = initialTheme;
  document.body.style.visibility = 'visible';

  debug.log('Theme initialization complete', { theme: initialTheme, bgColor });
}

// Execute IMMEDIATELY - before React renders
setInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);