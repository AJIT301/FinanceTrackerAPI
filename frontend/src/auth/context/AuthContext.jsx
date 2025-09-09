// src/auth/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/authAPI';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const data = await authAPI.getCurrentUser();
                    setUser(data);
                    setIsAuthenticated(true);
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                localStorage.removeItem('authToken'); // Clear invalid token
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // ADD THE MISSING LOGIN FUNCTION
    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authAPI.login(credentials);
            
            // Get user data after successful login
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            
            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,    // ← This was missing!
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};