import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('components:register');

export default function RegisterForm() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [localError, setLocalError] = useState(''); // For validation errors

    const { register, isLoading, error } = useRegister();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    debug.log('RegisterForm rendered', { isAuthenticated, isLoading });

    if (isAuthenticated) {
        debug.log('User already authenticated, redirecting to dashboard');
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        debug.log('Registration form submitted');
        
        setLocalError(''); // Clear previous validation errors

        // Basic validation
        if (!fullName || !email || !password || !confirmPassword) {
            const validationError = 'Please fill in all fields';
            debug.warn('Validation failed - missing fields');
            setLocalError(validationError);
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            const validationError = 'Please enter a valid email address';
            debug.warn('Email validation failed', { email });
            setLocalError(validationError);
            return;
        }

        if (password.length < 8) {
            const validationError = 'Password must be at least 8 characters long';
            debug.warn('Password length validation failed', { length: password.length });
            setLocalError(validationError);
            return;
        }

        if (password !== confirmPassword) {
            const validationError = 'Passwords do not match';
            debug.warn('Password confirmation failed', { 
                passwordLength: password.length, 
                confirmPasswordLength: confirmPassword.length 
            });
            setLocalError(validationError);
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            const validationError = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
            debug.warn('Password complexity validation failed');
            setLocalError(validationError);
            return;
        }

        debug.log('Validation passed, attempting registration...', { email, fullName });
        debug.time('registration-process');

        try {
            const userData = {
                full_name: fullName,
                email,
                password
            };
            
            debug.log('Calling register API', { userData });
            const response = await register(userData);
            
            debug.timeEnd('registration-process');
            debug.log('Registration successful', { 
                userId: response?.user?.id,
                email: response?.user?.email 
            });
            
            navigate('/login?registered=true');
        } catch (err) {
            debug.timeEnd('registration-process');
            debug.error('Registration failed', { 
                error: err.message, 
                email,
                fullName 
            });
            // Error is handled by useRegister hook, so we don't need to do anything here
        }
    };

    // Toggle functions
    const togglePasswordVisibility = () => {
        debug.log('Toggling password visibility', { showPassword: !showPassword });
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        debug.log('Toggling confirm password visibility', { showConfirmPassword: !showConfirmPassword });
        setShowConfirmPassword(!showConfirmPassword);
    };

    debug.log('Rendering register form', { 
        hasLocalError: !!localError, 
        hasApiError: !!error, 
        isLoading 
    });

    return (
        <div className="login-form">
            <div className="login-header">
                <h2>Create Account</h2>
                <p>Join FinanceTracker to manage your finances</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                {(localError || error) && (
                    <div className="alert alert-danger">
                        {debug.log('Displaying error message', { 
                            localError, 
                            apiError: error 
                        })}
                        {localError || error}
                    </div>
                )}

                <div className="input-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => {
                            debug.log('Full name changed', { length: e.target.value.length });
                            setFullName(e.target.value);
                        }}
                        placeholder="Enter your full name"
                        required
                        disabled={isLoading}
                        className="input-field"
                        autoComplete="name"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                            debug.log('Email changed', { value: e.target.value });
                            setEmail(e.target.value);
                        }}
                        placeholder="Enter your email"
                        required
                        disabled={isLoading}
                        className="input-field"
                        autoComplete="email"
                    />
                </div>

                {/* Password Field */}
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <div className="password-input-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => {
                                debug.log('Password changed', { length: e.target.value.length });
                                setPassword(e.target.value);
                            }}
                            placeholder="Create a password (min. 8 characters)"
                            required
                            disabled={isLoading}
                            className="input-field password-field"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                        >
                            {showPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="input-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="password-input-container">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => {
                                debug.log('Confirm password changed', { length: e.target.value.length });
                                setConfirmPassword(e.target.value);
                            }}
                            placeholder="Confirm your password"
                            required
                            disabled={isLoading}
                            className="input-field password-field"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={toggleConfirmPasswordVisibility}
                            disabled={isLoading}
                        >
                            {showConfirmPassword ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary btn-lg"
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-inline"></span>
                            Creating Account<span className="loading-dots"></span>
                        </>
                    ) : (
                        'Create Account'
                    )}
                </button>
            </form>

            <div className="signup-link">
                <p>Already have an account? <Link to="/login">Sign in here</Link></p>
            </div>
        </div>
    );
}