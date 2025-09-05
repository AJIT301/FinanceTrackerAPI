// src/components/Header/Header.jsx
import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import styles from './Header.module.scss';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                {/* Logo/Brand */}
                <div className={styles.brand}>
                    <h2 className={styles.title}>FinanceTracker</h2>
                    <span className={styles.subtitle}>API</span>
                </div>

                {/* Desktop Navigation */}
                <nav className={styles.nav}>
                    {isAuthenticated ? (
                        <>
                            <a href="/dashboard" className={styles.navLink}>Dashboard</a>
                            <a href="/transactions" className={styles.navLink}>Transactions</a>
                            <a href="/reports" className={styles.navLink}>Reports</a>

                            {/* User Menu */}
                            <div className={styles.userMenu}>
                                <span className={styles.userName}>Hi, {user?.full_name}</span>
                                <button onClick={logout} className={styles.logoutBtn}>
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.authLinks}>
                            <a href="/login" className={styles.navLink}>Login</a>
                            <a href="/register" className={`${styles.navLink} ${styles.primary}`}>Sign Up</a>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className={styles.menuButton}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className={styles.mobileNav}>
                        {isAuthenticated ? (
                            <>
                                <a href="/dashboard" className={styles.mobileNavLink}>Dashboard</a>
                                <a href="/transactions" className={styles.mobileNavLink}>Transactions</a>
                                <a href="/reports" className={styles.mobileNavLink}>Reports</a>
                                <button onClick={logout} className={styles.mobileLogoutBtn}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <a href="/login" className={styles.mobileNavLink}>Login</a>
                                <a href="/register" className={styles.mobileNavLink}>Sign Up</a>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}