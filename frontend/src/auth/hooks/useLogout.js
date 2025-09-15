// src/auth/hooks/useLogout.js
import { useAuth } from '../context/AuthContext';

export const useLogout = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        // You could add additional cleanup here if needed
        console.log('User logged out successfully');
    };

    return {
        logout: handleLogout
    };
};