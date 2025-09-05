// src/auth/components/LoginForm/LoginForm.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginForm.module.scss';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
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
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className={styles.loginForm}>
            <div className={styles.header}>
                <h2>Welcome Back</h2>
                <p>Sign in to manage your finances</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        disabled={loading}
                        className={styles.input}
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        disabled={loading}
                        className={styles.input}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitButton}
                >
                    {loading ? (
                        <>Logging in<span className={styles.loadingDots}></span></>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className={styles.signupLink}>
                <p>New to FinanceTracker? <a href="/register">Create an account</a></p>
            </div>
        </div>
    );
}