// src/auth/context/AuthContext.jsx
import { createContext, useContext } from 'react';

// Create the context
export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};