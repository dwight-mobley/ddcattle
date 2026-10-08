import { useState } from 'react';
import { useGetActivityMediaQuery, useUploadActivityMediaMutation } from '../../features/api/trainingApi';
import { useDeleteMediaMutation } from '../../features/api/mediaApiSlice';
import { Field, ErrorNotice } from './TrainingUI';
import { rows } from './trainingUtils';

export default function ActivityMedia({ kind, record, horses, canEdit = false }) {
  const { data, isLoading, error } = useGetActivityMediaQuery({ kind, id: record.id });
  const [upload, { isLoading: uploading, error: uploadError }] = useUploadActivityMediaMutation();
  const [remove, { isLoading: removing, error: deleteError }] = useDeleteMediaMutation();
  const [file, setFile] = useState(null);
  const [animal, setAnimal] = useState('');
  const [caption, setCaption] = useState('');
  const [isPublic, setPublic] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [inputKey, setInputKey] = useState(0);
  const eligible = canEdit ? horses.filter(h => h.can_upload_media && (kind === 'rides' ? record.participants.some(p => p.animal === h.id) : record.animal === h.id)) : [];
  const selectedAnimal = animal || String(eligible[0]?.id || '');
  async function submit(e) {
    e.preventDefault(); if (!file) return;
    const body = new FormData(); body.append('animal', selectedAnimal); body.append('file', file); body.append('media_type', file.type.startsWith('video/') ? 'video' : 'image'); body.append('caption', caption); body.append('public', String(isPublic));
    try { await upload({ kind, id: record.id, body }).unwrap(); setFile(null); setCaption(''); setInputKey(key => key + 1); } catch { /* Keep the selected file on failure. */ }
  }
  return <section className="space-y-4"><h3 className="font-serif text-xl text-saddle-brown">Photos and videos</h3><ErrorNotice error={error || uploadError || deleteError} />{isLoading && <p role="status">Loading media…</p>}
    {!isLoading && !rows(data).length && <p className="text-sm text-charcoal/65">No photos or videos attached yet.</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows(data).map(item => <figure key={item.id} className="overflow-hidden rounded-lg border border-sage/20 bg-white">{item.media_type === 'video' ? <video controls preload="metadata" src={item.url} className="aspect-video w-full object-contain bg-charcoal" /> : <a href={item.url} target="_blank" rel="noreferrer"><img loading="lazy" src={item.url} alt={item.caption || 'Activity photo'} className="aspect-video w-full object-cover" /></a>}<figcaption className="p-3 text-sm">{item.caption || 'Activity media'} · {item.public ? 'Public' : 'Private'}{eligible.some(h => h.id === item.animal) && <div className="mt-2 flex gap-3"><button disabled={removing} className="text-rust underline" onClick={async () => { if (confirm !== item.id) { setConfirm(item.id); return; } try { await remove(item.id).unwrap(); setConfirm(null); } catch { /* Render the error. */ } }}>{confirm === item.id ? 'Confirm delete' : 'Delete media'}</button>{confirm === item.id && <button onClick={() => setConfirm(null)}>Keep</button>}</div>}</figcaption></figure>)}</div>
    {eligible.length > 0 && <form onSubmit={submit} className="activity-form space-y-4 rounded-lg bg-desert-sand/50 p-4"><h4 className="font-semibold">Attach a photo or video</h4><div className="grid gap-4 sm:grid-cols-2"><Field label="Horse gallery"><select value={selectedAnimal} onChange={e => setAnimal(e.target.value)}>{eligible.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field><Field label="Photo or video"><input key={inputKey} required type="file" accept="image/*,video/*" onChange={e => setFile(e.target.files?.[0] || null)} /></Field></div><Field label="Caption"><input maxLength="250" value={caption} onChange={e => setCaption(e.target.value)} /></Field><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={isPublic} onChange={e => setPublic(e.target.checked)} />Make this media public</label><p className="text-xs text-charcoal/65">Media is added to the selected horse’s gallery and this activity. Private is the default.</p><button className="activity-button" disabled={uploading || !file || !selectedAnimal}>{uploading ? 'Uploading…' : 'Upload media'}</button></form>}
  </section>;
}
