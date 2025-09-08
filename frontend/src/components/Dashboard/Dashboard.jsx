// src/components/Dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { apiRequest } from '../../auth/services/authAPI';
import styles from './Dashboard.module.scss';


export default function Dashboard() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch recent transactions
            const transactionsResponse = await apiRequest('/api/transactions?limit=5');
            const transactionsData = await transactionsResponse.json();
            setTransactions(transactionsData.transactions || []);

            // Fetch financial stats
            const statsResponse = await apiRequest('/api/dashboard/summary');
            const statsData = await statsResponse.json();

            setStats({
                totalIncome: statsData.overall_summary.total_income || 0,
                totalExpenses: statsData.overall_summary.total_expenses || 0,
                balance: statsData.monthly_summary.balance || 0
            });

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading your finances...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {/* Welcome Header */}
            <div className={styles.welcomeSection}>
                <h1>Welcome back, {user?.full_name}!</h1>
                <p>Here's your financial overview</p>
            </div>

            {/* Financial Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={`${styles.summaryCard} ${styles.income}`}>
                    <h3>Income</h3>
                    <div className={styles.amount}>${stats.totalIncome.toFixed(2)}</div>
                    <p>This month</p>
                </div>

                <div className={`${styles.summaryCard} ${styles.expenses}`}>
                    <h3>Expenses</h3>
                    <div className={styles.amount}>${stats.totalExpenses.toFixed(2)}</div>
                    <p>This month</p>
                </div>

                <div className={`${styles.summaryCard} ${styles.balance}`}>
                    <h3>Balance</h3>
                    <div className={styles.amount}>${stats.balance.toFixed(2)}</div>
                    <p>Current</p>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className={styles.recentTransactions}>
                <div className={styles.sectionHeader}>
                    <h2>Recent Transactions</h2>
                    <button className={styles.viewAllBtn}>View All</button>
                </div>

                {transactions.length > 0 ? (
                    <div className={styles.transactionsList}>
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className={styles.transactionItem}>
                                <div className={styles.transactionInfo}>
                                    <span className={styles.category}>{transaction.category}</span>
                                    <span className={styles.description}>{transaction.description}</span>
                                </div>
                                <div className={`${styles.amount} ${transaction.type === 'income' ? styles.income : styles.expense
                                    }`}>
                                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>No transactions yet</p>
                        <button className={styles.addTransactionBtn}>Add Your First Transaction</button>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2>Quick Actions</h2>
                <div className={styles.actionButtons}>
                    <button className={styles.actionBtn}>
                        <span>➕</span>
                        Add Transaction
                    </button>
                    <button className={styles.actionBtn}>
                        <span>📊</span>
                        View Reports
                    </button>
                    <button className={styles.actionBtn}>
                        <span>⚙️</span>
                        Settings
                    </button>
                </div>
            </div>
        </div>
    );
}