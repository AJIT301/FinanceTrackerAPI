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
    const initAuthAndSyncTheme = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const userData = await authAPI.getCurrentUser();
                setUser(userData);
                setIsAuthenticated(true);

                // ✅ Sync theme AFTER user is authenticated
                try {
                    const response = await authAPI.getSettings(); // ← You need this API method
                    const data = await response.json();
                    const backendTheme = data.theme || 'light';

                    if (backendTheme !== localStorage.getItem('theme')) {
                        localStorage.setItem('theme', backendTheme);
                        document.body.className = backendTheme;
                    }
                } catch (err) {
                    console.warn('Failed to sync theme with backend');
                }
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    initAuthAndSyncTheme();
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