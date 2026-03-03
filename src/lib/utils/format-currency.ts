/**
 * Format a number as USD currency.
 * @example formatUSD(1234567.89) → "$1,234,567.89"
 */
export function formatUSD(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a number in compact notation.
 * @example formatCompact(1234567) → "$1.2M"
 */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Format a congress trade amount range for display.
 * @example formatAmountRange("$1,001 - $15,000") → "$1K - $15K"
 */
export function formatAmountRange(range: string | null): string {
  if (!range) return "N/A";
  return range;
}

/**
 * Format a percentage with sign.
 * @example formatPercent(12.5) → "+12.5%"
 */
export function formatPercent(value: number, decimals = 1): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a large number for display.
 * @example formatNumber(1234567) → "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}
