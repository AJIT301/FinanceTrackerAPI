// src/pages/Settings.jsx
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { apiRequest } from '../auth/services/authAPI';
import styles from './Settings.module.scss';

export default function Settings() {
    const { user } = useAuth();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Apply theme class to the body element
    const applyTheme = useCallback((selectedTheme) => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(selectedTheme);
    }, []);

    useEffect(() => {
        // Set initial loading to true only when fetching
        setLoading(true);

        const fetchSettings = async () => {
            try {
                setError(null);

                const response = await apiRequest('/api/settings');
                const data = await response.json();

                setTheme(data.theme || 'light');
                applyTheme(data.theme || 'light');
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError('Failed to load settings');
                setTheme('light'); // Fallback theme
                applyTheme('light');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [applyTheme]);

    const handleThemeChange = async () => {
        const currentTheme = theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        try {
            setError(null);
            setTheme(newTheme);
            applyTheme(newTheme);

            await apiRequest('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (err) {
            // Revert on failure
            console.error('Failed to update theme:', err);
            setTheme(currentTheme);
            applyTheme(currentTheme);
            setError('Failed to update theme');
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className={styles.settingsContainer}>
            <h1 className={styles.title}>Settings</h1>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>User Information</h2>
                <div className={styles.userInfo}>
                    <p><strong>Name:</strong> {user?.full_name || 'Loading...'}</p>
                    <p><strong>Email:</strong> {user?.email || 'Loading...'}</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <div className={styles.themeControl}>
                    <span>Current theme: <strong>{theme}</strong></span>
                    <button
                        onClick={handleThemeChange}
                        className={styles.themeButton}
                    >
                        Switch to {theme === 'light' ? 'dark' : 'light'}
                    </button>
                </div>
            </div>
        </div>
    );
}