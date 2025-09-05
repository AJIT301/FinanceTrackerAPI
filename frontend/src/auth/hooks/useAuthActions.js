// src/auth/hooks/useAuthActions.js
import { useAuth } from '../context/AuthContext';

export const useAuthActions = () => {
    const { login, logout, register } = useAuth();

    const handleLogin = async (credentials) => {
        try {
            await login(credentials);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    return { handleLogin, logout, register };
};