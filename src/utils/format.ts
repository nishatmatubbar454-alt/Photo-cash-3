/**
 * Format BDT currency
 */
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format Coins count
 */
export function formatCoins(coins: number): string {
  return coins.toLocaleString('en-US');
}

/**
 * Convert numbers to Bengali digits if needed
 */
export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (w) => bnDigits[+w]);
}

/**
 * Relative time ago in Bengali
 */
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'এইমাত্র';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} মিনিট আগে`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ঘণ্টা আগে`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} দিন আগে`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} সপ্তাহ আগে`;
  }

  return date.toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Mask mobile numbers for privacy (e.g. 01712***456)
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  return phone.substring(0, 5) + '***' + phone.substring(phone.length - 3);
}
