// src/auth/context/AuthProvider.jsx
import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authAPI } from '../services/authAPI';
import { tokenService } from '../services/tokenService';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = tokenService.getToken();
                if (token) {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                tokenService.removeToken();
                setError('Session expired. Please login again.');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.login(credentials);
            tokenService.setToken(response.access_token);
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
            setError(null);
        } catch (error) {
            setError(error.message || 'Login failed');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        tokenService.removeToken();
        setUser(null);
        setError(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        error,
        setError,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};