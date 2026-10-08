export const FREE_DELIVERY_THRESHOLD = 1999;
export const STANDARD_DELIVERY_FEE = 99;

/**
 * Formats a numeric price into Indian Rupee format with ₹ and Indian numbering system (en-IN).
 * e.g. 1999 -> ₹1,999, 125000 -> ₹1,25,000, 199.5 -> ₹199.50
 */
export function formatPrice(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  const formatted = amount % 1 === 0
    ? amount.toLocaleString('en-IN')
    : amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `₹${formatted}`;
}
