import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetManagedListingsQuery, useUpdateListingMutation } from '../../features/api/marketplaceApi';
import { STATUS_LABELS } from '../../components/marketplace/listingUtils';
import { listingError } from '../../components/marketplace/listingFormUtils';

export default function MarketplaceAdmin() {
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const { currentData: data, isFetching, error, refetch } = useGetManagedListingsQuery({ page }, { refetchOnMountOrArgChange: true });
  const [updateListing, { isLoading: saving }] = useUpdateListingMutation();
  async function unpublish(id) {
    try { await updateListing({ id, data: { published: false } }).unwrap(); setMessage('Listing unpublished. It remains available here for editing.'); }
    catch (failure) { setMessage(listingError(failure)); }
  }
  const button = 'rounded-lg border border-saddle-brown/25 px-4 py-3 text-sm font-semibold text-saddle-brown disabled:opacity-40';
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-serif text-3xl text-saddle-brown">Storefront listings</h2><p className="mt-2 text-sm text-charcoal/70">Manage your animal listings and homepage features.</p></div><Link to="/admin/marketplace/new" className="rounded-lg bg-rust px-5 py-3 font-semibold text-white">Add listing</Link></header>
    <Link to="/marketplace" className="inline-block text-sm font-semibold text-rust">View public storefront →</Link>
    {message && <p role="status" className="rounded-lg bg-white p-4">{message}</p>}
    {isFetching && <p role="status">Loading listings…</p>}
    {error ? <div role="alert"><p>{listingError(error)}</p><button onClick={refetch} className={`${button} mt-4`}>Try again</button>{page > 1 && <button onClick={() => setPage(1)} className={`${button} ml-3`}>First page</button>}</div> : data && <>
      {!data.results.length && <p className="rounded-xl bg-white p-8">No listings here yet. Add a listing for an animal you manage.</p>}
      <div className="space-y-4">{data.results.map(listing => <article key={listing.id} className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-saddle-brown/15 bg-white p-5"><div className="min-w-0"><h3 className="break-words font-serif text-xl text-saddle-brown">{listing.title}</h3><p className="mt-2 text-sm text-charcoal/70">{listing.animal_summary.name} · {STATUS_LABELS[listing.status]} · {listing.published ? listing.active && listing.animal_summary.public ? 'Published' : 'Published flag set; currently hidden' : 'Draft'}{listing.featured ? ' · Featured' : ''}</p></div><div className="flex flex-wrap gap-3"><Link to={`/admin/marketplace/${listing.id}/edit`} className={button}>Edit listing</Link>{listing.published && <button onClick={() => unpublish(listing.id)} disabled={saving} className={button}>Unpublish</button>}{listing.published && listing.active && listing.animal_summary.public && <Link to={`/marketplace/${listing.id}`} className={button}>View listing</Link>}</div></article>)}</div>
      {(data.next || data.previous) && <nav aria-label="Staff listing pages" className="flex justify-center gap-4"><button onClick={() => setPage(page - 1)} disabled={!data.previous || isFetching} className={button}>Previous</button><span className="py-3">Page {page}</span><button onClick={() => setPage(page + 1)} disabled={!data.next || isFetching} className={button}>Next</button></nav>}
    </>}
  </div>;
}
