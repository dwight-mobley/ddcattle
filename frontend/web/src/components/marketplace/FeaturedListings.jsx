import { Link } from 'react-router-dom';
import { useGetListingsQuery } from '../../features/api/marketplaceApi';
import ListingCard from './ListingCard';

export default function FeaturedListings() {
  const { currentData: data, isFetching, error, refetch } = useGetListingsQuery({ featured: 'true' }, { refetchOnMountOrArgChange: true });
  return (
    <section aria-labelledby="featured-listings-heading" aria-busy={isFetching} className="border-y border-sage/30 bg-sage/15 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-rust">The marketplace</p><h2 id="featured-listings-heading" className="mt-3 font-serif text-4xl text-saddle-brown">Featured animals</h2><p className="mt-4 text-charcoal/70">Meet a few of the animals currently available or pending sale.</p></div>
          <Link to="/marketplace" className="font-semibold text-rust underline underline-offset-4">Visit the storefront →</Link>
        </div>
        {isFetching && <p role="status">Loading featured animals…</p>}
        {error ? <div role="alert"><p>Featured animals are unavailable right now.</p><button onClick={refetch} className="mt-3 font-semibold text-rust underline">Try again</button></div> : data && (
          data.results.length ? <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{data.results.slice(0, 3).map(listing => <ListingCard key={listing.id} listing={listing} />)}</div> :
            <p className="rounded-xl bg-white p-6 text-charcoal/70">No featured listings right now. Browse the storefront to see our current animals.</p>
        )}
      </div>
    </section>
  );
}
