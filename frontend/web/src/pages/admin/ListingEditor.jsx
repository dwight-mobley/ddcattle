import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetManagedListingQuery, useGetListingAnimalsQuery, useGetListingMediaQuery, useCreateListingMutation, useUpdateListingMutation } from '../../features/api/marketplaceApi';
import { listingForm, listingPayload, listingPreview, listingError } from '../../components/marketplace/listingFormUtils';
import ListingPreview from '../../components/marketplace/ListingPreview';
import ImageWithLoader from '../../components/ImageWithLoader';

function ListingForm({ initial, created }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => listingForm(initial));
  const [animal, setAnimal] = useState(initial?.animal_summary || null);
  const [selectedMedia, setSelectedMedia] = useState(() => Object.fromEntries((initial?.public_preview.gallery || []).map(item => [item.id, item])));
  const [animalPage, setAnimalPage] = useState(1);
  const [mediaPage, setMediaPage] = useState(1);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(created ? 'Listing created successfully.' : '');
  const savingRequest = useRef(false);
  const animalSearch = useRef(null);
  const { currentData: animals, isFetching: animalsLoading, error: animalsError, refetch: retryAnimals } = useGetListingAnimalsQuery({ page: animalPage, unlisted: 'true', ...(search ? { search } : {}) }, { skip: Boolean(initial) });
  const { currentData: media, isFetching: mediaLoading, error: mediaError, refetch: retryMedia } = useGetListingMediaQuery({ animal: animal?.id, page: mediaPage }, { skip: !animal });
  const [createListing, createState] = useCreateListingMutation();
  const [updateListing, updateState] = useUpdateListingMutation();
  const busy = createState.isLoading || updateState.isLoading;
  const field = 'mt-2 block w-full rounded-lg border border-saddle-brown/25 bg-white p-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-rust';
  const button = 'rounded-lg border border-saddle-brown/25 px-4 py-3 text-sm font-semibold text-saddle-brown disabled:opacity-40';
  const knownMedia = { ...selectedMedia, ...Object.fromEntries((media?.results || []).map(item => [item.id, item])) };
  const missingMedia = form.gallery.filter(id => !knownMedia[id]);
  function change(event) {
    const { name, value, type, checked } = event.target;
    setForm(previous => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    setSaved(''); setError('');
  }
  function chooseAnimal(event) {
    const selected = animals.results.find(item => item.id === Number(event.target.value));
    setAnimal(selected || null); setMediaPage(1); setSelectedMedia({});
    setForm(previous => ({ ...previous, animal: selected?.id || '', gallery: [], published: false }));
    setSaved(''); setError('');
  }
  function toggleMedia(item, checked) {
    setSelectedMedia(previous => ({ ...previous, [item.id]: item }));
    setForm(previous => ({ ...previous, gallery: checked ? [...previous.gallery.filter(id => id !== item.id), item.id] : previous.gallery.filter(id => id !== item.id) }));
    setSaved(''); setError('');
  }
  async function save(event) {
    event.preventDefault();
    if (busy || savingRequest.current || !animal) return;
    savingRequest.current = true;
    setError(''); setSaved('');
    try {
      const data = listingPayload(form);
      const result = initial ? await updateListing({ id: initial.id, data }).unwrap() : await createListing(data).unwrap();
      setForm(listingForm(result));
      setAnimal(result.animal_summary);
      setSelectedMedia(Object.fromEntries(result.public_preview.gallery.map(item => [item.id, item])));
      setSaved(result.published ? 'Listing saved with publication enabled.' : 'Draft saved. It is not visible in the storefront.');
      if (!initial) navigate(`/admin/marketplace/${result.id}/edit`, { replace: true, state: { listingCreated: true } });
    } catch (failure) { setError(listingError(failure)); }
    finally { savingRequest.current = false; }
  }
  return <div className="space-y-6">
    <Link to="/admin/marketplace" className="font-semibold text-rust">← Storefront listings</Link>
    <h2 className="font-serif text-3xl text-saddle-brown">{initial ? 'Edit listing' : 'Add storefront listing'}</h2>
    <form onSubmit={save} className="space-y-6">
      <fieldset disabled={busy} className="space-y-6">
        <section className="rounded-xl border border-saddle-brown/15 bg-white p-5 sm:p-7">
          <h3 className="font-serif text-2xl text-saddle-brown">Animal</h3>
          {initial ? <p className="mt-4">{animal.name} <Link to={`/admin/animals/${animal.slug}/edit`} className="ml-2 text-sm text-rust underline">Edit animal</Link></p> : <>
            <div className="mt-4 flex gap-3"><label className="min-w-0 flex-1 text-sm font-semibold">Find an animal<input ref={animalSearch} name="animal-search" maxLength={100} className={field} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); setSearch(event.target.value.trim()); setAnimalPage(1); } }} /></label><button type="button" onClick={() => { setSearch(animalSearch.current.value.trim()); setAnimalPage(1); }} className={`${button} self-end`}>Search</button></div>
            {animalsLoading && <p role="status" className="mt-4">Loading animals…</p>}
            {animalsError ? <div role="alert" className="mt-4"><p>{listingError(animalsError)}</p><button type="button" onClick={retryAnimals} className={button}>Try again</button></div> : animals && <>
              <label className="mt-4 block text-sm font-semibold">Select animal<select aria-label="Select animal" value={form.animal} onChange={chooseAnimal} required className={field}><option value="">Choose an animal</option>{animal && !animals.results.some(item => item.id === animal.id) && <option value={animal.id}>{animal.name}</option>}{animals.results.map(item => <option key={item.id} value={item.id}>{item.name}{item.public ? '' : ' (private animal)'}</option>)}</select></label>
              {!animals.results.length && <p className="mt-4 text-sm">No unlisted animals match. Animals with existing listings are edited from the listings page.</p>}
              {(animals.previous || animals.next) && <div className="mt-4 flex items-center gap-3"><button type="button" disabled={!animals.previous || animalsLoading} onClick={() => setAnimalPage(animalPage - 1)} className={button}>Previous animals</button><span>{animalPage}</span><button type="button" disabled={!animals.next || animalsLoading} onClick={() => setAnimalPage(animalPage + 1)} className={button}>More animals</button></div>}
            </>}
          </>}
          {animal && !animal.public && <p className="mt-4 rounded-lg bg-rust/10 p-4 text-sm text-rust">This animal is private. You can save a draft; enable Public on the animal before publishing. <Link to={`/admin/animals/${animal.slug}/edit`} className="font-semibold underline">Edit animal</Link></p>}
        </section>
        <section className="space-y-5 rounded-xl border border-saddle-brown/15 bg-white p-5 sm:p-7">
          <h3 className="font-serif text-2xl text-saddle-brown">Public listing</h3>
          <label className="block text-sm font-semibold">Listing title<input name="title" required maxLength={200} value={form.title} onChange={change} className={field} /></label>
          <label className="block text-sm font-semibold">Public description<textarea name="description" required rows={6} value={form.description} onChange={change} className={field} /></label>
          <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold">Asking price (USD)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={change} className={field} /></label><label className="block text-sm font-semibold">Sale status<select name="status" aria-label="Sale status" value={form.status} onChange={change} className={field}><option value="available">Available</option><option value="pending">Pending</option><option value="sold">Sold</option></select></label></div>
          <div className="grid gap-4 sm:grid-cols-2">{[['show_price', 'Display asking price'], ['featured', 'Feature on homepage'], ['active', 'Active listing']].map(([name, label]) => <label key={name} className="flex items-center gap-3 text-sm"><input name={name} type="checkbox" checked={form[name]} onChange={change} className="h-5 w-5 accent-rust" />{label}</label>)}<label className="flex items-center gap-3 text-sm"><input name="published" type="checkbox" checked={form.published} disabled={!animal?.public && !form.published} onChange={change} className="h-5 w-5 accent-rust" />Publish in storefront</label></div>
          <p className="text-sm text-charcoal/65">Publication requires an active listing and public animal. Sold listings remain visible as history but do not accept inquiries or appear in homepage features.</p>
        </section>
        <section className="rounded-xl border border-saddle-brown/15 bg-white p-5 sm:p-7">
          <h3 className="font-serif text-2xl text-saddle-brown">Select photos and videos</h3>
          <p className="mt-2 text-sm text-charcoal/65">Choose existing public photos/videos for this animal. Uploads and public flags are managed in the <Link to="/admin/media" className="text-rust underline">Media Library</Link>.</p>
          {missingMedia.length > 0 && <div className="mt-4 rounded-lg bg-rust/10 p-4"><p>{missingMedia.length} selected items are no longer eligible for public display.</p><button type="button" onClick={() => setForm(previous => ({ ...previous, gallery: previous.gallery.filter(id => knownMedia[id]) }))} className={`${button} mt-3`}>Remove unavailable selections</button></div>}
          {!animal && <p className="mt-4">Select an animal first.</p>}
          {mediaLoading && <p role="status" className="mt-4">Loading media…</p>}
          {mediaError ? <div role="alert" className="mt-4"><p>{listingError(mediaError)}</p><button type="button" onClick={retryMedia} className={button}>Try again</button></div> : media && <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">{media.results.map(item => <label key={item.id} className="overflow-hidden rounded-lg border border-saddle-brown/20 p-3">{item.media_type === 'image' ? <ImageWithLoader src={item.url} alt={item.caption || animal.name} className="aspect-[4/3] rounded-lg" size="thumbnail" /> : <p className="rounded-lg bg-sage/15 p-8 text-center">Video</p>}<span className="mt-3 flex items-center gap-3 text-sm"><input type="checkbox" checked={form.gallery.includes(item.id)} onChange={event => toggleMedia(item, event.target.checked)} className="h-5 w-5 accent-rust" />{item.caption || `${item.media_type === 'image' ? 'Photo' : 'Video'} ${item.id}`}</span></label>)}</div>
            {!media.results.length && <p className="mt-4 text-sm">No eligible public photos/videos. You can save with an empty gallery.</p>}
            {(media.previous || media.next) && <div className="mt-4 flex items-center gap-3"><button type="button" disabled={!media.previous || mediaLoading} onClick={() => setMediaPage(mediaPage - 1)} className={button}>Previous media</button><span>{mediaPage}</span><button type="button" disabled={!media.next || mediaLoading} onClick={() => setMediaPage(mediaPage + 1)} className={button}>More media</button></div>}
          </>}
          {form.gallery.length > 0 && <div className="mt-5"><p className="text-sm font-semibold">Selected: {form.gallery.length}</p><div className="mt-2 flex flex-wrap gap-2">{form.gallery.map(id => <button key={id} type="button" onClick={() => setForm(previous => ({ ...previous, gallery: previous.gallery.filter(value => value !== id) }))} className={button}>Remove {knownMedia[id]?.caption || `item ${id}`}</button>)}</div></div>}
        </section>
        <details className="rounded-xl border border-saddle-brown/15 bg-white p-5 sm:p-7"><summary className="cursor-pointer font-serif text-2xl text-saddle-brown">Private sale records</summary><p className="mt-4 text-sm text-charcoal/65">Restricted to authorized staff. These details are excluded from the public listing and preview.</p><div className="mt-5 grid gap-5 sm:grid-cols-2">{[['buyer_name', 'Buyer name', 'text'], ['buyer_email', 'Buyer email', 'email'], ['buyer_phone', 'Buyer phone', 'tel'], ['actual_sale_price', 'Actual sale price (USD)', 'number'], ['sale_date', 'Sale date', 'date']].map(([name, label, type]) => <label key={name} className="block text-sm font-semibold">{label}<input name={name} type={type} min={type === 'number' ? '0' : undefined} step={type === 'number' ? '0.01' : undefined} maxLength={name === 'buyer_phone' ? 50 : name === 'buyer_name' ? 150 : undefined} value={form[name]} onChange={change} className={field} /></label>)}</div><label className="mt-5 block text-sm font-semibold">Internal notes<textarea name="internal_notes" rows={4} value={form.internal_notes} onChange={change} className={field} /></label></details>
      </fieldset>
      {error && <p role="alert" className="rounded-lg bg-rust/10 p-4 text-rust">{error}</p>}
      {saved && <p role="status" className="rounded-lg bg-sage/15 p-4">{saved}</p>}
      <div className="flex flex-wrap gap-4"><button type="submit" disabled={busy || !animal} className="rounded-lg bg-rust px-6 py-3 font-semibold text-white disabled:opacity-40">{busy ? 'Saving…' : initial ? 'Save listing' : 'Create listing'}</button><button type="button" aria-expanded={preview} onClick={() => setPreview(!preview)} className={button}>{preview ? 'Hide preview' : 'Preview public listing'}</button><Link to="/admin/marketplace" className={button}>Back to listings</Link></div>
    </form>
    {preview && <ListingPreview listing={listingPreview(form, animal, knownMedia)} />}
  </div>;
}

export default function ListingEditor() {
  const { id } = useParams();
  const location = useLocation();
  const { currentData: data, isFetching, error, refetch } = useGetManagedListingQuery(id, { skip: !id, refetchOnMountOrArgChange: true });
  if (id && error) return <div role="alert"><p>{listingError(error)}</p><button onClick={refetch} className="mt-4 text-rust underline">Try again</button><Link to="/admin/marketplace" className="mt-4 block text-rust">Back to listings</Link></div>;
  if (id && !data) return <p role="status">{isFetching ? 'Loading listing…' : 'Listing unavailable.'}</p>;
  return <ListingForm key={id || 'new'} initial={data} created={Boolean(location.state?.listingCreated)} />;
}
