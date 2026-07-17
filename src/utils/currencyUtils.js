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
    return '$' + numericAmount.toFixed(2);
  } else if (currency === 'EUR') {
    return '€' + numericAmount.toFixed(2);
  } else if (currency === 'GBP') {
    return '£' + numericAmount.toFixed(2);
  } else if (currency === 'IDR') {
    return 'Rp ' + Math.round(numericAmount).toLocaleString('en-IN');
  }

  return 'Rp ' + Math.round(numericAmount).toLocaleString('en-IN');
};
