import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/context/AuthProvider.jsx';
import { useAuth } from './auth/context/AuthContext';
import Header from './components/Header/Header';
import LoginForm from './auth/components/LoginForm/LoginForm';
import RegisterForm from './auth/components/RegisterForm/RegisterForm';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './pages/Settings';

// Protect routes without touching CSS
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="loading">
      <div className="spinner-circle"></div>
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
}

// Main App component
function AppContent() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

// Root App component (this provides the context)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}