import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAnimalsQuery } from '../../features/api/animalApi';
import { useGetMediaQuery, useDeleteMediaMutation } from '../../features/api/mediaApiSlice';

const input = 'w-full rounded-lg border border-saddle-brown/20 bg-white px-3 py-2 text-charcoal focus:outline-none focus:ring-2 focus:ring-sage';
const button = 'rounded-lg border border-saddle-brown/20 bg-white px-4 py-2 text-sm font-medium text-saddle-brown hover:bg-sage/10 focus-visible:outline focus-visible:outline-2 disabled:opacity-50';
const rowsOf = data => Array.isArray(data) ? data : data?.results || [];
const animalId = item => String(item.animal?.id ?? item.animal ?? '');
function errorText(error) {
    if (error?.status === 403) return 'You do not have permission to perform this action.';
    if (error?.status === 401) return 'Please sign in again to continue.';
    if (error?.status === 404) return 'This media item could not be found. Close this dialog and refresh the library.';
    return error?.data?.detail || error?.error || 'The request failed. Please try again.';
}
function safeUrl(value) {
    if (!value) return null;
    try { const url = new URL(value, window.location.origin); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
    catch { return null; }
}
function Thumbnail({ item, contain = false }) {
    const [failed, setFailed] = useState(false);
    const url = safeUrl(item.url);
    if (item.media_type === 'image' && url && !failed) return <img src={url} alt={item.caption || 'Animal media'} loading="lazy" onError={() => setFailed(true)} className={`h-full w-full ${contain ? 'object-contain' : 'object-cover'}`} />;
    return <div className="flex h-full items-center justify-center bg-sage/10 text-sm font-medium text-saddle-brown">{item.media_type === 'image' ? 'Image unavailable' : item.media_type === 'video' ? 'Video' : 'Document'}</div>;
}
function MediaDialog({ item, mode, animalName, onClose, onDeleted }) {
    const ref = useRef(null);
    const locked = useRef(false);
    const [remove, { isLoading }] = useDeleteMediaMutation();
    const [error, setError] = useState('');
    const url = safeUrl(item.url);
    useEffect(() => {
        const element = ref.current;
        const previous = document.activeElement;
        element.showModal();
        return () => { element.close(); if (previous?.isConnected) previous.focus(); };
    }, []);
    async function confirm() {
        if (locked.current) return;
        locked.current = true; setError('');
        try { await remove(item.id).unwrap(); onDeleted(item); }
        catch (err) { setError(errorText(err)); }
        finally { locked.current = false; }
    }
    return <dialog ref={ref} aria-labelledby="media-dialog-title" onCancel={event => { event.preventDefault(); if (!locked.current) onClose(); }} className="m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-[var(--radius-xl)] border border-saddle-brown/20 bg-desert-sand p-6 text-charcoal shadow-xl backdrop:bg-charcoal/50">
        <h2 id="media-dialog-title" className="font-serif text-xl font-bold text-saddle-brown">{mode === 'delete' ? 'Delete this media?' : item.caption || 'Media preview'}</h2>
        <p className="mt-1 mb-4 text-sm text-charcoal/70">{animalName} · {item.caption || `Media #${item.id}`}</p>
        {item.media_type === 'image' ? <div className="h-64 overflow-hidden rounded-lg"><Thumbnail key={item.url} item={item} contain /></div> : item.media_type === 'video' && mode === 'view' && url ? <video src={url} controls preload="metadata" className="max-h-96 w-full rounded-lg">Your browser cannot play this video.</video> : <div className="h-32"><Thumbnail item={item} /></div>}
        {mode === 'view' && <div className="mt-4 space-y-3 text-sm"><p className="whitespace-pre-wrap">{item.description || 'No description.'}</p><p>{item.public ? 'Public' : 'Private'}{item.uploaded_at ? ` · Uploaded ${new Date(item.uploaded_at).toLocaleString()}` : ''}</p>{url ? <a href={url} target="_blank" rel="noopener noreferrer" className="underline text-saddle-brown">Open original in a new tab</a> : <p>There is no usable file URL for this item.</p>}</div>}
        {mode === 'delete' && <p className="mt-4 text-sm">This removes the item from the media library. This action cannot be undone here.</p>}
        {error && <p role="alert" className="mt-4 rounded-lg bg-rust/10 p-3 text-sm text-rust">{error}</p>}
        <div className="mt-6 flex justify-end gap-3"><button autoFocus disabled={isLoading} onClick={onClose} className={button}>{mode === 'delete' ? 'Cancel' : 'Close'}</button>{mode === 'delete' && <button disabled={isLoading} onClick={confirm} className="rounded-lg bg-rust px-4 py-2 text-sm font-medium text-white hover:bg-rust/90 disabled:opacity-50">{isLoading ? 'Deleting…' : 'Delete media'}</button>}</div>
    </dialog>;
}
export default function MediaAdmin() {
    const [page, setPage] = useState(1);
    const [animal, setAnimal] = useState('');
    const [type, setType] = useState('');
    const [visibility, setVisibility] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [dialog, setDialog] = useState(null);
    const [notice, setNotice] = useState('');
    const heading = useRef(null);
    // Local filtering avoids relying on unconfirmed backend filter configuration.
    const ordering = {
    newest: '-uploaded_at,-id',
    oldest: 'uploaded_at,id',
    order: 'sort_order,id',
}[sort];

const {
    currentData: data,
    isFetching,
    error,
    refetch,
} = useGetMediaQuery({
    page,
    ordering,
    ...(animal ? { animal } : {}),
    ...(type ? { media_type: type } : {}),
    ...(visibility
        ? { public: visibility === 'public' ? 'true' : 'false' }
        : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
});
    const { data: animalsData, isError: animalsError } = useGetAnimalsQuery();
    const animals = rowsOf(animalsData);
    const media = rowsOf(data);
    const paginated = data && !Array.isArray(data) && Boolean(data.next || data.previous || page > 1);
    const names = new Map(animals.map(item => [String(item.id), item.name]));
    media.forEach(item => { if (item.animal && !names.has(animalId(item))) names.set(animalId(item), item.animal_name || item.animal?.name || `Animal #${animalId(item)}`); });
    const nameOf = item => names.get(animalId(item)) || 'Unassigned';
    const filtered = media;
    function reset() {
    setAnimal('');
    setType('');
    setVisibility('');
    setSearch('');
    setSort('newest');
    setPage(1);
}
    function deleted(item) {
        setDialog(null); setNotice(`${item.caption || 'Media item'} deleted.`);
        if (media.length === 1 && page > 1) setPage(value => value - 1);
        heading.current?.focus();
    }

    function changeFilter(setter) {
    return (event) => {
        setter(event.target.value);
        setPage(1);
    };
}
    
    return <div className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4"><div><h2 ref={heading} tabIndex={-1} className="font-serif text-2xl font-bold text-saddle-brown">Media Library</h2><p className="mt-1 text-sm text-charcoal/70">Browse and manage photos, videos, and documents.</p></div><Link to="/admin/media/upload" className="rounded-lg bg-saddle-brown px-4 py-2 text-sm font-medium text-desert-sand hover:bg-saddle-brown/90">+ Upload Media</Link></header>
        {notice && <p role="status" className="rounded-lg bg-sage/20 p-3 text-sm text-saddle-brown">{notice}</p>}
        {animalsError && <p className="text-sm text-rust">Animal names could not be loaded. Available media can still be managed using animal IDs.</p>}
        <div className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm text-saddle-brown">Animal<select className={input} value={animal} onChange={changeFilter(setAnimal)}><option value="">All animals</option>{[...names].sort((a, b) => a[1].localeCompare(b[1])).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
                <label className="text-sm text-saddle-brown">Media type<select className={input} value={type} onChange={changeFilter(setType)}><option value="">All media types</option><option value="image">Images</option><option value="video">Videos</option><option value="document">Documents</option></select></label>
                <label className="text-sm text-saddle-brown">Visibility<select className={input} value={visibility} onChange={changeFilter(setVisibility)}><option value="">All visibility</option><option value="public">Public</option><option value="private">Private</option></select></label>
                <label className="text-sm text-saddle-brown">Search<input type="search" className={input} placeholder="Caption, description, or animal" value={search} onChange={changeFilter(setSearch)} /></label>
                <label className="text-sm text-saddle-brown">Sort<select className={input} value={sort} onChange={changeFilter(setSort)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="order">Display order</option></select></label>
                <div className="flex items-end gap-2"><button className={button} onClick={reset}>Clear filters</button><button className={button} onClick={refetch} disabled={isFetching}>Refresh</button></div>
            </div>
            {paginated && <p className="text-sm text-charcoal/70">
    Filters and search cover the entire library.
    Results are shown {media.length} at a time.
</p>}
        </div>
        {error && <div role="alert" className="rounded-lg bg-rust/10 p-4 text-rust"><p>{errorText(error)}</p><button onClick={refetch} className={`${button} mt-3`}>Try again</button></div>}
        {isFetching && <p role="status" className="text-saddle-brown">Loading media…</p>}
        {data && <><p className="text-sm text-charcoal/70">
    Showing {media.length} of {data.count ?? media.length} matching
    items · Page {page}
</p>
            {!filtered.length ?
                <div className="rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white p-10 text-center">
                    <h3 className="font-serif text-lg font-bold text-saddle-brown">{media.length ? 'No matching media' : 'No media on this page'}</h3>
                    <p className="mt-2 text-sm text-charcoal/70">{media.length ? 'Try clearing your filters.' : 'Upload files to add them to the library.'}</p>
                </div>
                :
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(item => <article key={item.id} className="overflow-hidden rounded-[var(--radius-xl)] border border-saddle-brown/10 bg-white shadow-sm">
                        <button className="block h-44 w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-saddle-brown" aria-label={`Preview ${item.caption || `media ${item.id}`}`} onClick={() => setDialog({ item, mode: 'view' })}>
                            <Thumbnail key={item.url} item={item} />
                        </button>
                        <div className="space-y-2 p-4">
                            <h3 className="font-serif font-bold text-saddle-brown">{nameOf(item)}</h3>
                            <p className="truncate text-sm text-charcoal" title={item.caption || ''}>{item.caption || 'No caption'}</p>
                            <p className="text-xs text-charcoal/70">{item.public ? 'Public' : 'Private'} · {item.media_type || 'Media'}</p>
                            <div className="flex justify-between border-t border-saddle-brown/10 pt-3">
                                <button onClick={() => setDialog({ item, mode: 'view' })} className="text-sm font-medium text-saddle-brown underline" aria-label={`View ${item.caption || `media ${item.id}`}`}>View</button>
                                <button onClick={() => { setNotice(''); setDialog({ item, mode: 'delete' }); }} className="text-sm font-medium text-rust hover:underline" aria-label={`Delete ${item.caption || `media ${item.id}`}`}>Delete</button>
                            </div>
                        </div>
                    </article>
                    )}
                </div>}
            {paginated && <nav aria-label="Media pages" className="flex items-center justify-center gap-4"><button className={button} disabled={!data.previous || isFetching} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</button><span className="text-sm">Page {page}</span><button className={button} disabled={!data.next || isFetching} onClick={() => setPage(value => value + 1)}>Next</button></nav>}
        </>}
        {dialog && <MediaDialog key={`${dialog.mode}-${dialog.item.id}`} {...dialog} animalName={nameOf(dialog.item)} onClose={() => setDialog(null)} onDeleted={deleted} />}
    </div>;
}

