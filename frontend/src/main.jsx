import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './auth/context/AuthContext.jsx';
import App from './App.jsx';
import './main.scss';

// Enhanced theme setting to prevent FOUC
function setInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  // Set on both html and body for maximum coverage
  document.documentElement.className = theme;
  document.body.className = theme;

  // Set CSS custom property as backup
  document.documentElement.style.setProperty('--initial-theme', theme);

  // Ensure body is visible
  document.body.style.visibility = 'visible';

  return theme;
}

// Set theme immediately
const currentTheme = setInitialTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);