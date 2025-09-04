import styles from './Header.module.scss';

export default function Header() {
    return (
        <header className={styles.header}>
            <h2 className={styles.title}>FinanceTracker API</h2>
            <div className={styles.subtitle}>
                <p>App based on React and Vite</p>
                <p>with backend server based on FastAPI and PostgreSQL</p>
            </div>
        </header>
    )
}