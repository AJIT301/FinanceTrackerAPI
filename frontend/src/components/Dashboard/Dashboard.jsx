import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { apiRequest } from '../../auth/services/authAPI';

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

            const transactionsResponse = await apiRequest('/api/transactions?limit=5');
            const transactionsData = await transactionsResponse.json();
            setTransactions(transactionsData.transactions || []);

            const statsResponse = await apiRequest('/api/dashboard/summary');
            const statsData = await statsResponse.json();

            setStats({
                totalIncome: statsData.overall_summary?.total_income || 0,
                totalExpenses: statsData.overall_summary?.total_expenses || 0,
                balance: statsData.monthly_summary?.balance || 0
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading your finances...</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="welcome-section">
                <h1>Welcome back, {user?.full_name}!</h1>
                <p>Here's your financial overview</p>
            </div>

            <div className="summary-grid">
                <div className="summary-card income">
                    <h3>Income</h3>
                    <div className="amount">${stats.totalIncome.toFixed(2)}</div>
                    <p>This month</p>
                </div>

                <div className="summary-card expenses">
                    <h3>Expenses</h3>
                    <div className="amount">${stats.totalExpenses.toFixed(2)}</div>
                    <p>This month</p>
                </div>

                <div className="summary-card balance">
                    <h3>Balance</h3>
                    <div className="amount">${stats.balance.toFixed(2)}</div>
                    <p>Current</p>
                </div>
            </div>

            <div className="recent-transactions">
                <div className="section-header">
                    <h2>Recent Transactions</h2>
                    <button className="btn btn-ghost">View All</button>
                </div>

                {transactions.length > 0 ? (
                    <div className="transactions-list">
                        {transactions.map((transaction) => (
                            <div key={transaction.id} className="transaction-item">
                                <div className="transaction-info">
                                    <span className="category">{transaction.category}</span>
                                    <span className="description">{transaction.description}</span>
                                </div>
                                <div className={`amount ${transaction.type === 'income' ? 'income' : 'expense'}`}>
                                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p>No transactions yet</p>
                        <button className="btn btn-primary">Add Your First Transaction</button>
                    </div>
                )}
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <button className="btn btn-primary">
                        <span>➕</span> Add Transaction
                    </button>
                    <button className="btn btn-secondary">
                        <span>📊</span> View Reports
                    </button>
                    <button className="btn btn-ghost">
                        <span>⚙️</span> Settings
                    </button>
                </div>
            </div>
        </div>
    );
}