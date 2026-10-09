import ImageWithLoader from '../ImageWithLoader';
import { askingPrice, STATUS_LABELS, SPECIES_LABELS } from './listingUtils';

export default function ListingPreview({ listing }) {
  return <section aria-labelledby="public-preview-heading" className="rounded-xl border-2 border-sage bg-white p-6">
    <h2 id="public-preview-heading" className="font-serif text-2xl text-saddle-brown">Public preview</h2>
    <p className="mt-2 text-sm text-charcoal/65">Preview of your unsaved listing. Saving and publishing are separate choices.</p>
    {!listing ? <p className="mt-4">Select an animal to preview.</p> : <div className="mt-6 space-y-4">
      <p className="text-sm text-rust">{SPECIES_LABELS[listing.animal.species]} · {STATUS_LABELS[listing.status]}{listing.featured ? ' · Featured' : ''}</p>
      <h3 className="font-serif text-3xl text-saddle-brown">{listing.title}</h3>
      <p>{listing.animal.name}{listing.animal.color ? ` · ${listing.animal.color}` : ''}</p>
      <p className="font-semibold">{askingPrice(listing)}</p>
      <p className="whitespace-pre-wrap leading-7">{listing.description}</p>
      <div className="grid gap-4 sm:grid-cols-2">{listing.gallery.map(media => <figure key={media.id}>{media.media_type === 'image' ? <ImageWithLoader src={media.url} alt={media.caption || listing.animal.name} className="aspect-[4/3] rounded-lg" /> : <video controls preload="metadata" playsInline src={media.url} aria-label={media.caption || 'Listing video'} className="aspect-video w-full rounded-lg" />}{media.caption && <figcaption className="mt-2 text-sm">{media.caption}</figcaption>}</figure>)}</div>
      {!listing.gallery.length && <p className="text-sm text-charcoal/65">No photos or videos selected.</p>}
    </div>}
  </section>;
}
