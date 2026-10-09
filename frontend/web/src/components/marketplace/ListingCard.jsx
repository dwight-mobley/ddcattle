import { Link } from 'react-router-dom';
import ImageWithLoader from '../ImageWithLoader';
import { askingPrice, SPECIES_LABELS, STATUS_LABELS } from './listingUtils';

export default function ListingCard({ listing }) {
  const cover = listing.gallery.find(item => item.media_type === 'image');
  return (
    <article className="overflow-hidden rounded-xl border border-saddle-brown/15 bg-white shadow-sm">
      <Link to={`/marketplace/${listing.id}`} className="block focus-visible:outline-2 focus-visible:outline-rust">
        <div className="relative aspect-[4/3] bg-sage/15">
          {cover ? <ImageWithLoader src={cover.url} alt={cover.caption || listing.animal.name} size="card" className="h-full w-full" /> :
            <div className="flex h-full items-center justify-center px-6 text-center text-saddle-brown">{listing.gallery.length ? 'Video in listing' : 'Photos coming soon'}</div>}
          <span className="absolute left-4 top-4 rounded-full bg-desert-sand px-3 py-1 text-xs font-semibold text-saddle-brown">{STATUS_LABELS[listing.status]}</span>
        </div>
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-rust">{SPECIES_LABELS[listing.animal.species] || 'Animal'}{listing.featured ? ' · Featured' : ''}</p>
          <h2 className="mt-2 font-serif text-2xl text-saddle-brown">{listing.title}</h2>
          <p className="mt-2 text-sm text-charcoal/70">{listing.animal.name}{listing.animal.color ? ` · ${listing.animal.color}` : ''}</p>
          <p className="mt-4 font-semibold text-saddle-brown">{askingPrice(listing)}</p>
          <span className="mt-4 inline-block text-sm font-semibold text-rust">Meet {listing.animal.name} →</span>
        </div>
      </Link>
    </article>
  );
}
