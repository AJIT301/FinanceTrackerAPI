import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('components:login');

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    debug.log('LoginForm rendered', { isAuthenticated, loading });

    if (isAuthenticated) {
        debug.log('User already authenticated, redirecting to dashboard');
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        debug.log('Login form submitted', { email });

        setError('');

        // Validation
        if (!email || !password) {
            const validationError = 'Please fill in all fields';
            debug.warn('Validation failed', { error: validationError });
            setError(validationError);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            const validationError = 'Please enter a valid email address';
            debug.warn('Email validation failed', { email });
            setError(validationError);
            return;
        }

        try {
            debug.time('login-attempt');
            debug.log('Attempting login with credentials', { email });

            await login({ email, password });

            debug.timeEnd('login-attempt');
            debug.log('Login successful, navigating to dashboard');
            navigate('/dashboard', { replace: true });
        } catch (err) {
            debug.timeEnd('login-attempt');
            debug.error('Login failed', { error: err.message, email });
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    debug.log('Rendering login form', { loading, hasError: !!error });

    return (
        <div className="login-form">
            <div className="login-header">
                <h2>Welcome Back</h2>
                <p>Sign in to manage your finances</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="alert alert-danger">
                        {debug.log('Displaying error message', { error })}
                        {error}
                    </div>
                )}

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                            debug.log('Email input changed', { value: e.target.value });
                            setEmail(e.target.value);
                        }}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                        className="input-field"
                        autoComplete="on"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => {
                            debug.log('Password input changed', { length: e.target.value.length });
                            setPassword(e.target.value);
                        }}
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
                        <>
                            <span className="spinner-inline"></span>
                            Loading<span className="loading-dots"></span>
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="signup-link">
                <p>New to FinanceTracker? <Link to="/register">Create an account</Link></p>
            </div>
        </div>
    );
}