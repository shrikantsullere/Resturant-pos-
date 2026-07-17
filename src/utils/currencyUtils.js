export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'Rp 0';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : Number(amount);
  if (isNaN(numericAmount)) return 'Rp 0';

  let currency = 'USD';
  try {
    const savedSettings = localStorage.getItem('resto-customer-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      if (parsed.currency) {
        currency = parsed.currency;
      }
    }
  } catch (e) {}

  if (currency === 'USD') {
    // 1 USD = 96 units
    const converted = numericAmount / 96;
    return '$' + converted.toFixed(2);
  } else if (currency === 'EUR') {
    // 1 EUR = 104 units
    const converted = numericAmount / 104;
    return '€' + converted.toFixed(2);
  } else if (currency === 'GBP') {
    // 1 GBP = 123 units
    const converted = numericAmount / 123;
    return '£' + converted.toFixed(2);
  } else if (currency === 'IDR') {
    // Base database currency
    return 'Rp ' + Math.round(numericAmount).toLocaleString('en-IN');
  }

  return 'Rp ' + Math.round(numericAmount).toLocaleString('en-IN');
};
