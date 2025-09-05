import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/context/AuthProvider';
import App from './App.jsx'
import './styles/main.scss'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <StrictMode>
      <App />
    </StrictMode>,
  </AuthProvider>
)
