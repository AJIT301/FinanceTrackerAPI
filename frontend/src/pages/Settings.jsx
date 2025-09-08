import { useEffect, useState } from 'react';
import { useAuth } from '../auth/context/AuthContext';

export default function Settings() {
    const { token } = useAuth();
    const [theme, setTheme] = useState('light');
    const [loading, setLoading] = useState(true);

    // Fetch user settings on mount
    useEffect(() => {
        fetch('/api/settings', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setTheme(data.theme || 'light');
                setLoading(false);
            });
    }, [token]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        fetch('/api/settings', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ theme: newTheme })
        });
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className={`settings-page ${theme}`}>
            <h1>Settings</h1>
            <div>
                <span>Theme: {theme}</span>
                <button onClick={toggleTheme}>
                    Switch to {theme === 'light' ? 'dark' : 'light'}
                </button>
            </div>
        </div>
    );
}