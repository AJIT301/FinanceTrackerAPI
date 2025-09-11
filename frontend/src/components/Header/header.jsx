//src\components\Header\Header.jsx
import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="brand">
                    <h2 className="brand-title">FinanceTracker</h2>
                    <span className="brand-subtitle">API</span>
                </div>

                <nav className="header-nav">
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                            <Link to="/settings" className="btn btn-secondary">Settings</Link>
                            <span className="btn btn-ghost" style={{ cursor: 'default' }}>
                                Hi, {user?.full_name}
                            </span>
                            <button onClick={logout} className="btn btn-danger">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
                    )}
                </nav>

                <button
                    className="menu-button"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span><span></span><span></span>
                </button>

                {isMenuOpen && (
                    <div className="mobile-nav">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
                                <Link to="/settings" className="btn btn-secondary">Settings</Link>
                                <button onClick={logout} className="btn btn-danger">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}