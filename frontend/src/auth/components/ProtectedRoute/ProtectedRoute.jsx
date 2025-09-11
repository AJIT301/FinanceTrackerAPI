// src/auth/components/ProtectedRoute/ProtectedRoute.jsx
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};