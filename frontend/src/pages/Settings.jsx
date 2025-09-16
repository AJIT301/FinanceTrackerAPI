// settings.jsx
import { useAuth } from '../auth/context/AuthContext';
import { useState, useEffect } from 'react';
import { apiRequest } from '../auth/services/authAPI';
import { formatCurrency } from '../components/Currency/currencyUtils'; // ← USE YOUR EXISTING FILE

// Use the same currency data from your utils
const CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' }
];
export default function Settings() {
    const { user, theme, updateTheme } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currency, setCurrency] = useState('USD'); // ← ADD THIS

    // Fetch current currency setting
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await apiRequest('/api/settings/');
                const settings = await response.json();
                setCurrency(settings.currency_code || 'USD');
            } catch (err) {
                console.error('Failed to fetch currency settings');
            }
        };
        fetchSettings();
    }, []);

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

    // ADD THIS FUNCTION
    const handleCurrencyChange = async (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        
        try {
            await apiRequest('/api/settings/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currency_code: newCurrency })
            });
        } catch (err) {
            setError('Failed to update currency');
            // Revert on error
            const response = await apiRequest('/api/settings/');
            const settings = await response.json();
            setCurrency(settings.currency_code || 'USD');
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

            {/* ADD THIS SECTION */}
            <div className="settings-section">
                <h2 className="section-title">Currency</h2>
                <div className="form-group">
                    <label htmlFor="currency-select">Preferred Currency:</label>
                    <select
                        id="currency-select"
                        value={currency}
                        onChange={handleCurrencyChange}
                        className="form-control"
                    >
                        {CURRENCIES.map(currencyOption => (
                            <option key={currencyOption.code} value={currencyOption.code}>
                                {currencyOption.symbol} {currencyOption.name} ({currencyOption.code})
                            </option>
                        ))}
                    </select>
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