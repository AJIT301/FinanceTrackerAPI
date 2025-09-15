import { useState, useCallback } from 'react';
import { authAPI } from '../services/authAPI';
import { createDebugger } from '../utils/debug';

const debug = createDebugger('hooks:theme');

export const useTheme = () => {
    const [theme, setTheme] = useState('light');
    debug.log('useTheme hook initialized', { initialTheme: 'light' });

    const applyTheme = useCallback((selectedTheme) => {
        const currentTheme = document.documentElement.className;
        if (currentTheme === selectedTheme) {
            debug.log('Theme already applied, skipping', { theme: selectedTheme });
            return;
        }

        debug.log('Applying theme', {
            oldTheme: currentTheme,
            newTheme: selectedTheme
        });

        const isDark = selectedTheme === 'dark';
        const lightBg = '#ffffff';
        const darkBg = '#324775';
        const bgColor = isDark ? darkBg : lightBg;

        document.body.classList.remove('light', 'dark');
        document.body.classList.add(selectedTheme);
        document.documentElement.style.backgroundColor = bgColor;
        document.documentElement.className = selectedTheme;
        document.body.style.backgroundColor = bgColor;

        debug.log('Theme applied successfully', { theme: selectedTheme, bgColor });
    }, []);

    const fetchUserTheme = useCallback(async (userPublicId) => {
        debug.log('Fetching user theme from server', { userPublicId });
        debug.time(`fetch-theme-${userPublicId}`);

        try {
            const response = await authAPI.getUserSettings();
            const serverTheme = response.theme || 'light';
            debug.log('User theme fetched from server', {
                serverTheme,
                userPublicId
            });

            setTheme(serverTheme);
            applyTheme(serverTheme);

            localStorage.setItem(`theme_${userPublicId}`, serverTheme);
            debug.log('User theme saved to localStorage', {
                key: `theme_${userPublicId}`,
                theme: serverTheme
            });

            debug.timeEnd(`fetch-theme-${userPublicId}`);
        } catch (err) {
            debug.timeEnd(`fetch-theme-${userPublicId}`);
            debug.error('Failed to fetch user theme, using fallback', {
                error: err.message,
                userPublicId
            });

            const fallbackTheme = 'light';
            setTheme(fallbackTheme);
            applyTheme(fallbackTheme);
        }
    }, [applyTheme]);

    const updateTheme = async (newTheme, user) => {
        debug.log('Updating theme', {
            newTheme,
            userId: user?.public_id
        });
        debug.time('update-theme');

        try {
            setTheme(newTheme);
            applyTheme(newTheme);

            if (user) {
                localStorage.setItem(`theme_${user.public_id}`, newTheme);
                debug.log('Theme saved to localStorage', {
                    key: `theme_${user.public_id}`,
                    theme: newTheme
                });

                await authAPI.updateUserSettings({ theme: newTheme });
                debug.log('Theme updated on server', { theme: newTheme });
            }

            debug.timeEnd('update-theme');
        } catch (err) {
            debug.timeEnd('update-theme');
            debug.error('Failed to update theme', {
                error: err.message,
                theme: newTheme
            });
            throw err;
        }
    };

    debug.log('useTheme hook returning values', { theme });

    return {
        theme,
        setTheme,
        applyTheme,
        fetchUserTheme,
        updateTheme
    };
};