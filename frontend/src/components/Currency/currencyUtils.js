// src/components/Currency/currencyUtils.js
const currencyFormats = {
    USD: { symbol: '$', code: 'USD', locale: 'en-US' },
    EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
    UAH: { symbol: '₴', code: 'UAH', locale: 'uk-UA' },
    PLN: { symbol: 'zł', code: 'PLN', locale: 'pl-PL' }
};

export const formatCurrency = (amount, currencyCode = 'USD') => {
    const currency = currencyFormats[currencyCode] || currencyFormats.USD;

    return new Intl.NumberFormat(currency.locale, {
        style: 'currency',
        currency: currency.code,
        minimumFractionDigits: 2
    }).format(amount);
};