// src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { apiRequest } from '../auth/services/authAPI';
import styles from './Settings.module.scss';

export default function Settings() {
    const { user } = useAuth();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await apiRequest('/api/settings');
                const data = await response.json();

                setTheme(data.theme || 'light');
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError('Failed to load settings');
                setTheme('light');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';

        try {
            setTheme(newTheme);

            await apiRequest('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (err) {
            console.error('Failed to update theme:', err);
            setTheme(theme);
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
        <div className={`${styles.settingsContainer} ${theme === 'dark' ? styles.dark : ''}`}>
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
                        onClick={toggleTheme}
                        className={styles.themeButton}
                    >
                        Switch to {theme === 'light' ? 'dark' : 'light'}
                    </button>
                </div>
            </div>

            <div className={styles.note}>
                react is shit library and can go fuck off
            </div>
        </div>
    );
}