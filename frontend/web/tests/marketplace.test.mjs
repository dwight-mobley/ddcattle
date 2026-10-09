import test from 'node:test';
import assert from 'node:assert/strict';
import { askingPrice, listingFilters } from '../src/components/marketplace/listingUtils.js';

test('asking price respects visibility, unknown values and zero', () => {
  assert.equal(askingPrice({ show_price: false, price: '7500.00' }), 'Contact for price');
  assert.equal(askingPrice({ show_price: true, price: null }), 'Contact for price');
  assert.equal(askingPrice({ show_price: true }), 'Contact for price');
  assert.equal(askingPrice({ show_price: true, price: 'invalid' }), 'Contact for price');
  assert.equal(askingPrice({ show_price: true, price: '0.00' }), '$0.00');
  assert.equal(askingPrice({ show_price: true, price: '7500.00' }), '$7,500.00');
});

test('URL filters preserve supported shareable state and reject malformed input', () => {
  assert.deepEqual(listingFilters(new URLSearchParams('page=2&species=horse&status=sold&search=Willow')), { page: 2, species: 'horse', status: 'sold', search: 'Willow' });
  for (const page of ['-2', '1.5', '0', 'Infinity', '999999999999999999']) {
    assert.equal(listingFilters(new URLSearchParams({ page })).page, 1);
  }
  assert.deepEqual(listingFilters(new URLSearchParams('species=private&status=draft')), { page: 1, species: '', status: '', search: '' });
  assert.equal(listingFilters(new URLSearchParams({ search: 'x'.repeat(200) })).search.length, 100);
});


import { listingForm, listingPayload, listingPreview } from '../src/components/marketplace/listingFormUtils.js';

test('staff form round-trips only writable fields and null price/date values', () => {
  const form = listingForm({ animal: 7, contact_user: 999, public_preview: { buyer_name: 'PRIVATE' } });
  const payload = listingPayload(form);
  assert.equal(payload.animal, 7);
  assert.equal(payload.price, null);
  assert.equal(payload.actual_sale_price, null);
  assert.equal(payload.sale_date, null);
  assert.equal(payload.published, false);
  assert.equal(payload.active, true);
  assert.ok(!('contact_user' in payload));
  assert.ok(!('public_preview' in payload));
});

test('unsaved public preview cannot include staff fields or hidden price', () => {
  const form = listingForm({ animal: 7, title: 'Public title', description: 'Public story', show_price: false,
    price: '9000.00', gallery: [2, 1, 3], buyer_name: 'PRIVATE BUYER', internal_notes: 'PRIVATE NOTES' });
  const animal = { id: 7, slug: 'horse', name: 'Horse', species: 'horse', sex: 'mare', color: 'Bay', birth_date: null, public: true, notes: 'PRIVATE HISTORY' };
  const media = { 1: { id: 1, media_type: 'image', url: '/photo', caption: 'Selected photo', sort_order: 0, description: 'PRIVATE DESCRIPTION' }, 2: { id: 2, media_type: 'video', url: '/video', caption: '', sort_order: 1 } };
  const preview = listingPreview(form, animal, media);
  assert.ok(!('price' in preview));
  assert.ok(!JSON.stringify(preview).includes('PRIVATE'));
  assert.deepEqual(preview.gallery.map(item => item.id), [1, 2]);
  assert.ok(!('public' in preview.animal));
  assert.equal(listingPreview(form, null, media), null);
});
