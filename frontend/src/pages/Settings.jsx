// settings.jsx
import { useAuth } from '../auth/context/AuthContext';
import { useState } from 'react';
import { apiRequest } from '../auth/services/authAPI';
export default function Settings() {
    const { user, theme, updateTheme } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleThemeChange = async () => {
        setLoading(true);
        try {
            const newTheme = theme === 'light' ? 'dark' : 'light';
            await updateTheme(newTheme);
        } catch (err) {
            setError('Failed to update theme');
        } finally {
            setLoading(false);
        }
    };

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
                        disabled={loading}
                    >
                        {loading ? 'Switching...' : `Switch to ${theme === 'light' ? 'dark' : 'light'}`}
                    </button>
                </div>
            </div>
        </div>
    );
}