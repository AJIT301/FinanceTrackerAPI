import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/context/AuthContext.jsx';
import App from './App.jsx';
import './main.scss';

// COMPREHENSIVE theme setting to prevent ANY flicker
function setInitialTheme() {
  // Get the auth token to check if user is logged in
  const token = localStorage.getItem('authToken');

  let initialTheme = 'light'; // default theme

  if (token) {
    try {
      // Try to get user data from token to access public_id
      // Note: This assumes your token contains user info or you have a way to get public_id
      // If not, we'll need to use a different approach

      // Option 1: If you store user public_id in localStorage after login
      const userPublicId = localStorage.getItem('currentUserPublicId');
      if (userPublicId) {
        const userTheme = localStorage.getItem(`theme_${userPublicId}`);
        if (userTheme) {
          initialTheme = userTheme;
        }
      }

      // Option 2: If you can decode user info from token (if it's a JWT)
      // const decodedToken = JSON.parse(atob(token.split('.')[1]));
      // const userPublicId = decodedToken.public_id;
      // const userTheme = localStorage.getItem(`theme_${userPublicId}`);
      // if (userTheme) initialTheme = userTheme;

    } catch (err) {
      console.warn('Could not get user-specific theme, using default:', err);
    }
  } else {
    // Fallback for non-logged-in users
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      initialTheme = savedTheme;
    }
  }

  const isDark = initialTheme === 'dark';

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

  console.log('Theme set to:', initialTheme, 'with bg:', bgColor);
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