// src/auth/hooks/useRegister.js
import { useState } from 'react';
import { authAPI } from '../services/authAPI';

export const useRegister = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const register = async (userData) => {
        try {
            setIsLoading(true);
            setError(null);
            setSuccess(false);

            const response = await authAPI.register(userData);
            setSuccess(true);

            return response;
        } catch (err) {
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setError(null);
        setSuccess(false);
        setIsLoading(false);
    };

    return {
        register,
        isLoading,
        error,
        success,
        reset,
        clearError: () => setError(null)
    };
};