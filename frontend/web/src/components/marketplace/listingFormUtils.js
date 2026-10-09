const TEXT_FIELDS = ['title', 'description', 'buyer_name', 'buyer_email', 'buyer_phone', 'internal_notes'];
const BOOLEAN_FIELDS = ['show_price', 'active', 'published', 'featured'];

export function listingForm(initial = {}) {
  const form = { animal: initial.animal || '', status: initial.status || 'available', gallery: initial.gallery || [],
    price: initial.price ?? '', actual_sale_price: initial.actual_sale_price ?? '', sale_date: initial.sale_date || '' };
  for (const field of TEXT_FIELDS) form[field] = initial[field] || '';
  for (const field of BOOLEAN_FIELDS) form[field] = initial[field] ?? (field === 'show_price' || field === 'active');
  return form;
}

export function listingPayload(form) {
  // Explicit write fields: server summaries/preview/contact never round-trip.
  const data = { animal: Number(form.animal), status: form.status, gallery: form.gallery,
    price: form.price === '' ? null : form.price,
    actual_sale_price: form.actual_sale_price === '' ? null : form.actual_sale_price,
    sale_date: form.sale_date || null };
  for (const field of TEXT_FIELDS) data[field] = form[field];
  for (const field of BOOLEAN_FIELDS) data[field] = form[field];
  return data;
}

export function listingPreview(form, animal, media) {
  if (!animal) return null;
  const publicAnimal = {};
  for (const key of ['id', 'slug', 'name', 'species', 'sex', 'birth_date', 'color']) publicAnimal[key] = animal[key];
  const preview = { title: form.title || 'Untitled listing', description: form.description, animal: publicAnimal,
    status: form.status, featured: form.featured, show_price: form.show_price,
    gallery: form.gallery.map(id => media[id]).filter(Boolean).map(item => ({ id: item.id, media_type: item.media_type, url: item.url, caption: item.caption, sort_order: item.sort_order }))
      .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id) };
  if (form.show_price) preview.price = form.price === '' ? null : form.price;
  return preview;
}

export function listingError(error) {
  if (error.status === 403) return 'You do not have permission to manage this listing.';
  if (error.status === 404) return 'This listing or animal is unavailable to your account.';
  if (error.data && typeof error.data === 'object') return Object.entries(error.data).map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(' ') : String(value)}`).join(' · ');
  return 'Unable to save the listing. Please try again.';
}
