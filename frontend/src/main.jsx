import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/context/AuthContext.jsx';
import App from './App.jsx';
import './main.scss';

// COMPREHENSIVE theme setting to prevent ANY flicker
function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const isDark = savedTheme === 'dark';

  // Set the background colors immediately on html AND body
  const lightBg = '#ffffff';
  const darkBg = '#324775';
  const bgColor = isDark ? darkBg : lightBg;

  // Apply to html element (this prevents the flicker you're seeing)
  document.documentElement.style.backgroundColor = bgColor;
  document.documentElement.className = savedTheme;

  // Apply to body
  document.body.style.backgroundColor = bgColor;
  document.body.className = savedTheme;
  document.body.style.visibility = 'visible';

  console.log('Theme set to:', savedTheme, 'with bg:', bgColor);
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