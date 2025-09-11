import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { apiRequest } from '../auth/services/authAPI';

export default function Settings() {
    const { user } = useAuth();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const applyTheme = useCallback((selectedTheme) => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(selectedTheme);
    }, []);

    useEffect(() => {
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
                setTheme('light');
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
            setTheme(newTheme);
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);

            await apiRequest('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (err) {
            setTheme(currentTheme);
            applyTheme(currentTheme);
            localStorage.setItem('theme', currentTheme);
            setError('Failed to update theme');
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <p>Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <h1 className="settings-title">Settings</h1>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="settings-section">
                <h2 className="section-title">User Information</h2>
                <div className="user-info">
                    <p><strong>Name:</strong> {user?.full_name || 'Loading...'}</p>
                    <p><strong>Email:</strong> {user?.email || 'Loading...'}</p>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="section-title">Appearance</h2>
                <div className="theme-control">
                    <span>Current theme: <strong>{theme}</strong></span>
                    <button
                        onClick={handleThemeChange}
                        className="btn btn-secondary"
                    >
                        Switch to {theme === 'light' ? 'dark' : 'light'}
                    </button>
                </div>
            </div>
        </div>
    );
}