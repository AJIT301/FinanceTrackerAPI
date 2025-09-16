// components/Transaction/AddTransactionModal.jsx
import { useState } from 'react';
import { apiRequest } from '../../auth/services/authAPI.js';
import Modal from './Modal.jsx'

export default function AddTransactionModal({ isOpen, onClose, onTransactionAdded }) {
    const [formData, setFormData] = useState({
        amount: '',
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = {
        expense: ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Other'],
        income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other']
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiRequest('/api/transactions/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const newTransaction = await response.json();
                onTransactionAdded(newTransaction);
                onClose();
                // Reset form
                setFormData({
                    amount: '',
                    type: 'expense',
                    category: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0]
                });
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to add transaction');
            }
        } catch (err) {
            setError('Network error. Please try again.');
            console.error('Error adding transaction:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Transaction"
            size="medium"
            closeOnOverlayClick={false}
        >
            <form onSubmit={handleSubmit} className="transaction-form">
                {/* Use the alert class for error display */}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Form fields */}
                <div className="form-group">
                    <label>Amount</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                    >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Category</option>
                        {categories[formData.type].map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What was this for?"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Transaction'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}