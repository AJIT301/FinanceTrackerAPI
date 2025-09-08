import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <h2 className={styles.title}>FinanceTracker</h2>
                    <span className={styles.subtitle}>API</span>
                </div>

                <nav className={styles.nav}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
                            <Link to="/settings" className={styles.navLink}>Settings</Link>
                            <span className={styles.userName}>Hi, {user?.full_name}</span>
                            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={styles.navLink}>Login</Link>
                        </>
                    )}
                </nav>

                <button className={styles.menuButton} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span></span><span></span><span></span>
                </button>

                {isMenuOpen && (
                    <div className={styles.mobileNav}>
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className={styles.mobileNavLink}>Dashboard</Link>
                                <Link to="/settings" className={styles.mobileNavLink}>Settings</Link>
                                <button onClick={logout} className={styles.mobileLogoutBtn}>Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className={styles.mobileNavLink}>Login</Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}