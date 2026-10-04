/**
 * Money utilities:
 * All internal monetary calculations are performed in paise (1 INR = 100 paise)
 * to prevent floating point inaccuracies.
 */

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Format paise integer into standard Indian Currency string
 * e.g., 15000 paise -> "₹150" (or "₹150.00")
 */
export function formatINR(paise: number, includeDecimals = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: includeDecimals || paise % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Format paise for plain display without currency symbol
 * e.g., 15000 paise -> "150"
 */
export function formatRupeeAmount(paise: number, includeDecimals = false): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: includeDecimals || paise % 100 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}
