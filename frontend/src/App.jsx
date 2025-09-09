import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/context/AuthContext';
import Header from './components/Header/Header';
import LoginForm from './auth/components/LoginForm/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import Settings from './pages/Settings';
import './styles/App.scss'; // <-- keep global styles

// Protect routes without touching CSS
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;      // show loading while auth state is unknown
  if (!isAuthenticated) return <Navigate to="/login" />; // redirect if not logged in
  return children;                                 // render children if authenticated
}

export default function App() {
  return (
    <Router>
      <Header /> {/* Your global header */}
      <Routes>
        <Route path="/login" element={<LoginForm />} />
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