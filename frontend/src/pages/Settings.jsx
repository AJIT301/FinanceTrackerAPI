import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/context/AuthContext';
import { apiRequest } from '../auth/services/authAPI';

export default function Settings() {
    const { user } = useAuth();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const applyTheme = useCallback((selectedTheme) => {
        const isDark = selectedTheme === 'dark';
        const lightBg = '#ffffff';
        const darkBg = '#324775';
        const bgColor = isDark ? darkBg : lightBg;
        
        // Remove old classes and add new ones
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(selectedTheme);
        
        // IMPORTANT: Also update html element background (like in main.jsx)
        document.documentElement.style.backgroundColor = bgColor;
        document.documentElement.className = selectedTheme;
        document.body.style.backgroundColor = bgColor;
        
        console.log('Theme applied:', selectedTheme, 'with background:', bgColor);
    }, []);

    useEffect(() => {
        setLoading(true);

        const fetchSettings = async () => {
            try {
                setError(null);
                const response = await apiRequest('/api/settings');
                const data = await response.json();

                const serverTheme = data.theme || 'light';
                setTheme(serverTheme);
                applyTheme(serverTheme);
                
                // Ensure localStorage is in sync
                localStorage.setItem('theme', serverTheme);
            } catch (err) {
                console.error('Failed to fetch settings:', err);
                setError('Failed to load settings');
                
                // Fallback to localStorage theme
                const fallbackTheme = localStorage.getItem('theme') || 'light';
                setTheme(fallbackTheme);
                applyTheme(fallbackTheme);
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
            // Apply theme changes immediately for better UX
            setTheme(newTheme);
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);

            // Then save to server
            await apiRequest('/api/settings', {
                method: 'PATCH',
                body: JSON.stringify({ theme: newTheme })
            });
            
            console.log('Theme saved to server:', newTheme);
        } catch (err) {
            console.error('Failed to save theme to server:', err);
            // Revert on server error
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