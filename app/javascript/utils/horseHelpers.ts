import { Horse } from '@/types';

/**
 * Checks if a horse is actively available for purchase
 */
export const isForSale = (horse: Horse): boolean => {
  return horse.price !== null && horse.price > 0;
};

/**
 * Formats the stored integer cents into a clean human-readable USD string.
 * Example: 350000 -> "$3,500.00"
 */
export const formatHorsePrice = (price: number | null): string => {
  if (price === null || price <= 0) {
    return 'Private Treaty / Not for Sale';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price / 100);
};