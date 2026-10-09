import { useSearchParams } from 'react-router-dom';
import { useGetListingsQuery } from '../../features/api/marketplaceApi';
import ListingCard from '../../components/marketplace/ListingCard';
import EngravingShop from '../../components/marketplace/EngravingShop';
import { listingFilters, SPECIES_LABELS } from '../../components/marketplace/listingUtils';

export default function Storefront() {
  const [params, setParams] = useSearchParams();
  const filters = listingFilters(params);
  const { currentData: data, isFetching, error, refetch } = useGetListingsQuery({
    page: filters.page,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.species ? { species: filters.species } : {}),
    ...(filters.search ? { search: filters.search } : {}),
  }, { refetchOnMountOrArgChange: true });
  function update(values) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, String(value)); else next.delete(key);
    }
    setParams(next);
  }
  function search(event) {
    event.preventDefault();
    update({ search: new FormData(event.currentTarget).get('search').trim(), page: '' });
  }
  const button = 'rounded-lg border border-saddle-brown/30 px-5 py-3 text-sm font-semibold text-saddle-brown hover:bg-saddle-brown hover:text-white disabled:opacity-40 disabled:cursor-not-allowed';
  const field = 'mt-2 block w-full rounded-lg border border-saddle-brown/25 bg-white px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-rust';
  return (
    <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
      <header className="mb-12 max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">DD Cattle Company</p><h1 className="mt-4 font-serif text-5xl text-saddle-brown sm:text-6xl">The storefront</h1><p className="mt-6 text-lg leading-8 text-charcoal/75">Find your next ranch companion, explore their story, or visit our engraving shop for something made with care.</p></header>
      <section aria-labelledby="animals-heading" aria-busy={isFetching}>
        <h2 id="animals-heading" className="font-serif text-3xl text-saddle-brown">Animals in the marketplace</h2>
        <p className="mt-3 text-charcoal/70">Available and pending animals are shown by default. Sales begin with a conversation with the ranch.</p>
        <div className="my-8 grid gap-5 rounded-xl border border-saddle-brown/15 bg-white p-6 md:grid-cols-[1fr_1fr_2fr]">
          <label className="text-sm font-semibold text-saddle-brown">Availability<select value={filters.status} onChange={event => update({ status: event.target.value, page: '' })} className={field}><option value="">Available & pending</option><option value="available">Available</option><option value="pending">Sale pending</option><option value="sold">Sold history</option><option value="all">All published listings</option></select></label>
          <label className="text-sm font-semibold text-saddle-brown">Animal type<select value={filters.species} onChange={event => update({ species: event.target.value, page: '' })} className={field}><option value="">All animals</option>{Object.entries(SPECIES_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <form onSubmit={search} className="flex items-end gap-3"><label className="min-w-0 flex-1 text-sm font-semibold text-saddle-brown">Search animals<input key={filters.search} name="search" defaultValue={filters.search} maxLength={100} placeholder="Name or listing title" className={field} /></label><button className={button}>Search</button></form>
        </div>
        {isFetching && <p role="status" className="mb-6">Loading listings…</p>}
        {error ? <div role="alert" className="rounded-xl bg-white p-8"><p>We couldn’t load the marketplace. Please try again.</p><button onClick={refetch} className={`${button} mt-4`}>Try again</button>{filters.page > 1 && <button onClick={() => update({ page: '' })} className={`${button} ml-3 mt-4`}>First page</button>}</div> : data && <>
          <p role="status" className="mb-6 text-sm text-charcoal/70">{data.count} {data.count === 1 ? 'listing' : 'listings'} · Page {filters.page}</p>
          {data.results.length ? <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{data.results.map(listing => <ListingCard key={listing.id} listing={listing} />)}</div> : <div className="rounded-xl bg-white p-10 text-center"><p className="font-serif text-2xl text-saddle-brown">No matching animals right now.</p><p className="mt-3 text-charcoal/70">Try another filter or check back for new listings.</p><button onClick={() => setParams({})} className={`${button} mt-6`}>Clear filters</button></div>}
          {(data.previous || data.next) && <nav aria-label="Marketplace pages" className="mt-10 flex items-center justify-center gap-4"><button disabled={!data.previous || isFetching} onClick={() => update({ page: filters.page - 1 })} className={button}>Previous</button><span>Page {filters.page}</span><button disabled={!data.next || isFetching} onClick={() => update({ page: filters.page + 1 })} className={button}>Next</button></nav>}
        </>}
      </section>
      <div className="mt-20"><EngravingShop /></div>
    </div>
  );
}
