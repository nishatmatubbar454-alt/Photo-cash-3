/**
 * Format USDT Currency safely with null/undefined fallbacks
 */
export function formatUSDT(amount?: number | null, decimals: number = 3): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$${num.toFixed(decimals)}`;
}

export function formatShortUSDT(amount?: number | null): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$${num.toFixed(2)}`;
}

export function safeNumber(val?: number | null, fallback: number = 0): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  return fallback;
}

export function maskAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
