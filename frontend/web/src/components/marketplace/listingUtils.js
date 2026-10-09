export const STATUS_LABELS = { available: 'Available', pending: 'Sale pending', sold: 'Sold' };
export const SPECIES_LABELS = { horse: 'Horse', cattle: 'Cattle', dog: 'Dog', other: 'Other animal' };

export function askingPrice(listing) {
  if (!listing.show_price || listing.price == null) return 'Contact for price';
  const price = Number(listing.price);
  if (!Number.isFinite(price) || price < 0) return 'Contact for price';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(price);
}

export function listingFilters(params) {
  const statuses = ['available', 'pending', 'sold', 'all'];
  const species = Object.keys(SPECIES_LABELS);
  const pageText = params.get('page') || '1';
  const page = Number(pageText);
  return {
    page: /^\d+$/.test(pageText) && Number.isSafeInteger(page) && page > 0 ? page : 1,
    status: statuses.includes(params.get('status')) ? params.get('status') : '',
    species: species.includes(params.get('species')) ? params.get('species') : '',
    search: (params.get('search') || '').slice(0, 100),
  };
}
