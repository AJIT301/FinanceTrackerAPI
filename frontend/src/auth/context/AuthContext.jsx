// src/auth/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
    const [theme, setTheme] = useState('light');

    // Theme application function
    const applyTheme = useCallback((selectedTheme) => {
        const isDark = selectedTheme === 'dark';
        const lightBg = '#ffffff';
        const darkBg = '#324775';
        const bgColor = isDark ? darkBg : lightBg;

        document.body.classList.remove('light', 'dark');
        document.body.classList.add(selectedTheme);

        document.documentElement.style.backgroundColor = bgColor;
        document.documentElement.className = selectedTheme;
        document.body.style.backgroundColor = bgColor;

        console.log('Theme applied:', selectedTheme);
    }, []);

    // Fetch user theme from server
    const fetchUserTheme = useCallback(async (userPublicId) => {
        try {
            // Assuming you have an API endpoint to get user settings
            const response = await authAPI.getUserSettings();
            const serverTheme = response.theme || 'light';

            setTheme(serverTheme);
            applyTheme(serverTheme);

            // Store theme in localStorage with user-specific key
            localStorage.setItem(`theme_${userPublicId}`, serverTheme);
        } catch (err) {
            console.error('Failed to fetch user theme:', err);
            // Fallback to default theme
            const fallbackTheme = 'light';
            setTheme(fallbackTheme);
            applyTheme(fallbackTheme);
        }
    }, [applyTheme]);

    // Update theme function for other components to use
    const updateTheme = async (newTheme) => {
        try {
            setTheme(newTheme);
            applyTheme(newTheme);

            if (user) {
                localStorage.setItem(`theme_${user.public_id}`, newTheme);

                // Save to server
                await authAPI.updateUserSettings({ theme: newTheme });
            }
        } catch (err) {
            console.error('Failed to update theme:', err);
            throw err;
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    const data = await authAPI.getCurrentUser();
                    setUser(data);
                    setIsAuthenticated(true);

                    // Check for user-specific theme in localStorage
                    const userTheme = localStorage.getItem(`theme_${data.public_id}`);
                    if (userTheme) {
                        setTheme(userTheme);
                        applyTheme(userTheme);
                    } else {
                        // Fetch from server if not in localStorage
                        await fetchUserTheme(data.public_id);
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

        fetchUser();
    }, [applyTheme, fetchUserTheme]);

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await authAPI.login(credentials);

            // Get user data after successful login
            const userData = await authAPI.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);

            // Store public_id for initial theme loading
            localStorage.setItem('currentUserPublicId', userData.public_id);

            // Fetch and apply user theme immediately after login
            await fetchUserTheme(userData.public_id);

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
        localStorage.removeItem('currentUserPublicId'); // Add this
        setUser(null);
        setIsAuthenticated(false);
        setTheme('light');
        applyTheme('light');
    };
    const value = {
        user,
        isAuthenticated,
        loading,
        theme,
        login,
        logout,
        updateTheme
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};