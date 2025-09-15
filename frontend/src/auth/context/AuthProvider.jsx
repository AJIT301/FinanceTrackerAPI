import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authAPI } from '../services/authAPI';
import { tokenService } from '../services/tokenService';
import { useTheme } from '../hooks/useTheme';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('auth:provider');

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Use the theme hook
    const { theme, setTheme, applyTheme, fetchUserTheme, updateTheme } = useTheme();
    debug.log('AuthProvider initialized with theme hook');

    // Initialize auth and theme
    useEffect(() => {
        debug.log('AuthProvider useEffect running - initializing auth and theme');
        const startTime = Date.now();

        const initAuthAndTheme = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('authToken');
                debug.log('Token check', { hasToken: !!token });

                if (token) {
                    debug.log('Token found, fetching current user');
                    const userData = await authAPI.getCurrentUser();
                    debug.log('Current user fetched', {
                        userId: userData?.public_id,
                        userEmail: userData?.email
                    });

                    setUser(userData);
                    setIsAuthenticated(true);

                    const userTheme = localStorage.getItem(`theme_${userData.public_id}`);
                    debug.log('Checking localStorage for user theme', {
                        key: `theme_${userData.public_id}`,
                        hasTheme: !!userTheme
                    });

                    if (userTheme) {
                        setTheme(userTheme);
                        applyTheme(userTheme);
                        debug.log('Applied theme from localStorage', { theme: userTheme });
                    } else {
                        debug.log('No theme in localStorage, fetching from server');
                        await fetchUserTheme(userData.public_id);
                    }
                } else {
                    debug.log('No token found, applying default light theme');
                    applyTheme('light');
                }
            } catch (err) {
                debug.error('Auth initialization failed', { error: err.message });
                localStorage.removeItem('authToken');
                setUser(null);
                setIsAuthenticated(false);
                setError('Authentication failed');
                applyTheme('light');
            } finally {
                setLoading(false);
                debug.log('Auth initialization completed', { 
                    duration: `${Date.now() - startTime}ms` 
                });
                debug.log('==========================================')
            }
        };

        initAuthAndTheme();
    }, []);

    const login = async (credentials) => {
        debug.log('Login attempt started', { email: credentials.email });
        const startTime = Date.now();

        try {
            setLoading(true);
            setError(null);

            const response = await authAPI.login(credentials);
            debug.log('Login API call successful', {
                hasToken: !!response.access_token
            });

            tokenService.setToken(response.access_token);

            const userData = await authAPI.getCurrentUser();
            debug.log('User data fetched after login', {
                userId: userData?.public_id
            });

            setUser(userData);
            setIsAuthenticated(true);

            await fetchUserTheme(userData.public_id);
            debug.log('Login process completed successfully', { 
                duration: `${Date.now() - startTime}ms` 
            });

            return response;
        } catch (error) {
            debug.error('Login failed', {
                error: error.message,
                email: credentials.email
            });

            const errorMessage = error.message || 'Login failed';
            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        debug.log('Logout initiated', { userId: user?.public_id });

        tokenService.removeToken();
        localStorage.removeItem('currentUserPublicId');

        if (user) {
            localStorage.removeItem(`theme_${user.public_id}`);
            debug.log('User-specific data cleared', {
                themeKey: `theme_${user.public_id}`
            });
        }

        setUser(null);
        setIsAuthenticated(false);
        setError(null);
        setTheme('light');

        debug.log('Logout completed');
    };

    const handleUpdateTheme = async (newTheme) => {
        debug.log('Theme update requested', {
            newTheme,
            userId: user?.public_id
        });

        try {
            await updateTheme(newTheme, user);
            debug.log('Theme update completed', { theme: newTheme });
        } catch (err) {
            debug.error('Theme update failed', { error: err.message });
            setError('Failed to update theme');
            throw err;
        }
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        theme,
        login,
        logout,
        updateTheme: handleUpdateTheme,
        setError
    };

    debug.log('AuthProvider context value updated', {
        isAuthenticated,
        hasUser: !!user,
        theme,
        loading
    });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};