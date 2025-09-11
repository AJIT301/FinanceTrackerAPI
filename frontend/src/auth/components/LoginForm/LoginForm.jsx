import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            await login({ email, password });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-form">
            <div className="login-header">
                <h2>Welcome Back</h2>
                <p>Sign in to manage your finances</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                        className="input-field"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        className="input-field"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary btn-lg"
                >
                    {loading ? (
                        <>Logging in<span className="loading-dots">...</span></>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="signup-link">
                <p>New to FinanceTracker? <a href="/register">Create an account</a></p>
            </div>
        </div>
    );
}