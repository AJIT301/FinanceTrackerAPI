// src/auth/hooks/useLogin.js
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (credentials) => {
        try {
            setIsLoading(true);
            setError(null);
            await login(credentials);
        } catch (err) {
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        login: handleLogin,
        isLoading,
        error,
        clearError: () => setError(null)
    };
};