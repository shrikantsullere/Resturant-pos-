export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return 'Rp 0';
  const numericAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : Number(amount);
  if (isNaN(numericAmount)) return 'Rp 0';
  return 'Rp ' + Math.round(numericAmount).toLocaleString('en-IN');
};
