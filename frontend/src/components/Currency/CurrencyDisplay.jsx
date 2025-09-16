// src/components/Currency/CurrencyDisplay.jsx
import { formatCurrency } from './currencyUtils'; // We'll create this

export const CurrencyDisplay = ({ amount }) => {
    // For now, hardcode to USD - you can make this dynamic later
    return (
        <span className="currency-display">
            {formatCurrency(amount, 'USD')} {/* ← Hardcode for now */}
        </span>
    );
};