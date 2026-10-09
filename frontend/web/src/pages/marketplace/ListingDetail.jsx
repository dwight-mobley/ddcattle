import { useState } from 'react';
import InquiryModal from '../../components/InquiryModal';
import { Link, useParams } from 'react-router-dom';
import { useGetListingQuery } from '../../features/api/marketplaceApi';
import ImageWithLoader from '../../components/ImageWithLoader';
import { askingPrice, SPECIES_LABELS, STATUS_LABELS } from '../../components/marketplace/listingUtils';

export default function ListingDetail() {
  const { id } = useParams();
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const validId = /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0;
  const { currentData: listing, isFetching, error, refetch } = useGetListingQuery(id, { skip: !validId, refetchOnMountOrArgChange: true });
  if (!validId || error) return <div className="mx-auto max-w-7xl px-6 py-20" role="alert"><h1 className="font-serif text-4xl text-saddle-brown">{!validId || error?.status === 404 ? 'Listing unavailable' : 'Unable to load this listing'}</h1><p className="mt-4">{!validId || error?.status === 404 ? 'This listing may no longer be published.' : 'Please try again in a moment.'}</p>{validId && error?.status !== 404 && <button onClick={refetch} className="mt-6 text-rust underline">Try again</button>}<Link to="/marketplace" className="mt-6 block font-semibold text-rust">Back to the storefront →</Link></div>;
  if (isFetching || !listing) return <p role="status" className="mx-auto max-w-7xl px-6 py-20">Loading listing…</p>;
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
      <Link to="/marketplace" className="font-semibold text-rust">← Back to the storefront</Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <section aria-label={`Photos and videos of ${listing.animal.name}`} className="space-y-6">
          {listing.gallery.length ? listing.gallery.map(media => <figure key={media.id} className="overflow-hidden rounded-xl border border-saddle-brown/15 bg-white">
            {media.media_type === 'image' ? <ImageWithLoader src={media.url} alt={media.caption || `Photo of ${listing.animal.name}`} size="gallery" className="aspect-[4/3] w-full" /> : <video controls preload="metadata" playsInline aria-label={media.caption || `Video of ${listing.animal.name}`} className="aspect-video w-full bg-saddle-brown" src={media.url}>Your browser does not support this video.</video>}
            {media.caption && <figcaption className="px-5 py-4 text-sm text-charcoal/75">{media.caption}</figcaption>}
          </figure>) : <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-sage/15 text-saddle-brown">Photos and videos coming soon</div>}
        </section>
        <section aria-labelledby="listing-title">
          <p className="text-xs font-semibold uppercase tracking-widest text-rust">{SPECIES_LABELS[listing.animal.species] || 'Animal'}{listing.featured ? ' · Featured' : ''}</p>
          <h1 id="listing-title" className="mt-4 font-serif text-4xl text-saddle-brown sm:text-5xl">{listing.title}</h1>
          <p className="mt-5 inline-block rounded-full bg-sage/20 px-4 py-2 text-sm font-semibold text-saddle-brown">{STATUS_LABELS[listing.status]}</p>
          <p className="mt-6 text-2xl font-semibold text-saddle-brown">{askingPrice(listing)}</p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-y border-saddle-brown/15 py-6">{[['Name', listing.animal.name], ['Sex', listing.animal.sex.replaceAll('_', ' ')], ['Color', listing.animal.color], ['Born', listing.animal.birth_date]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt className="text-xs uppercase tracking-wider text-charcoal/65">{label}</dt><dd className="mt-2 capitalize text-saddle-brown">{value}</dd></div>)}</dl>
          <h2 className="mt-8 font-serif text-2xl text-saddle-brown">About {listing.animal.name}</h2>
          <p className="mt-4 whitespace-pre-wrap leading-8 text-charcoal/80">{listing.description}</p>
          {listing.status === 'sold' ? <p className="mt-8 rounded-xl bg-sage/15 p-6">This animal has been sold. Browse the storefront for current listings.</p> : <div className="mt-8 rounded-xl bg-sage/15 p-6">{listing.status === 'pending' && <p className="mb-4 text-sm text-saddle-brown">A sale is pending. Contact the ranch to ask about availability.</p>}<p className="text-charcoal/75">Want to learn more about {listing.animal.name}? Send an inquiry to the ranch about this listing.</p><button onClick={() => setInquiryOpen(true)} className="mt-5 inline-flex rounded-xl bg-rust px-6 py-3 font-semibold text-white hover:bg-saddle-brown">Inquire about {listing.animal.name}</button></div>}
        </section>
      </div>
      <InquiryModal isOpen={inquiryOpen && listing.status !== 'sold'} onClose={() => setInquiryOpen(false)} animal={listing.animal} listingId={listing.id} />
    </div>
  );
}
