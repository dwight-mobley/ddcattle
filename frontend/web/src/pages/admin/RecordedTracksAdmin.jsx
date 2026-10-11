import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../features/auth/useAuth';
import { useGetPrivateTrackQuery, useGetPrivateTracksQuery } from '../../features/api/privateTracksApi';
import PrivateTrackMap from '../../components/tracks/PrivateTrackMap';
import { feet, kindLabel, miles, movingMph } from '../../components/tracks/trackGeometry';

function ErrorMessage({ error, retry }) {
  if (!error) return null;
  const text = error.status === 503 ? 'Private test sync is disabled on the backend.' : error.status === 401 || error.status === 403 ? 'A signed-in staff account is required.' : error.status === 404 ? 'Track unavailable for this account, or the backend update is not deployed yet.' : error.status === 'CUSTOM_ERROR' ? error.error : 'Could not load private tracks. Check connectivity and try again.';
  return <div role="alert"><p>{text}</p><button className="border rounded px-3 py-2 mt-2" onClick={retry}>Retry</button></div>;
}
export default function RecordedTracksAdmin() {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  if (!isAdmin) return <p>Staff access is required.</p>;
  return <div className="space-y-5"><header><h2 className="font-serif text-2xl text-saddle-brown">Private recorded rides</h2><p className="mt-2">Test tracks uploaded by your account. These do not appear on public pages or horse activity history.</p></header>{id ? <TrackDetail key={`${user.id}:${id}`} id={id} ownerId={user.id} /> : <TrackList key={user.id} ownerId={user.id} />}</div>;
}
function TrackList({ ownerId }) {
  const [page, setPage] = useState(1);
  const { data, error, isFetching, refetch } = useGetPrivateTracksQuery({ page, ownerId });
  return <><button className="border rounded px-3 py-2" onClick={refetch} disabled={isFetching}>Refresh rides</button><ErrorMessage error={error} retry={refetch} />{isFetching ? <p role="status">Loading private rides…</p> : !error && <>
    {data?.results?.length === 0 && <p>No uploaded tracks for this account yet. Upload a finished ride from the Android app.</p>}
    <div className="space-y-3">{data?.results?.map(track => <article key={track.id} className="border rounded-lg bg-white p-4 space-y-2"><Link className="font-semibold text-rust underline" to={`/admin/recorded-tracks/${track.id}`}>{track.title || kindLabel(track.kind)}</Link><p>{kindLabel(track.kind)} · {new Date(track.started_at_ms).toLocaleString()}</p><p>{miles(track.distance_m)} mi · {Math.round(track.active_ms / 60000)} min recorded · {track.expected_samples} samples</p><p>{track.state === 'COMPLETE' ? 'Synced privately' : 'Upload incomplete — resume in the app'}</p></article>)}</div>
    <div className="flex gap-4 items-center"><button className="border rounded px-3 py-2" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Previous</button><span>Page {page}</span><button className="border rounded px-3 py-2" disabled={!data?.next} onClick={() => setPage(value => value + 1)}>Next</button></div>
  </>}</>;
}
function TrackDetail({ id, ownerId }) {
  const { data, error, isFetching, refetch } = useGetPrivateTrackQuery({ id, ownerId });
  const track = data?.track; const manifest = track?.manifest;
  return <><Link className="underline text-rust" to="/admin/recorded-tracks">Back to recorded rides</Link><ErrorMessage error={error} retry={refetch} />{isFetching ? <p role="status">Loading private ride and GPS batches…</p> : !error && manifest && <>
    <h3 className="font-serif text-xl">{manifest.title || kindLabel(manifest.kind)}</h3><p>{kindLabel(manifest.kind)} · {new Date(manifest.started_at_ms).toLocaleString()}</p><p>{track.state === 'COMPLETE' ? 'Synced privately' : 'Upload incomplete — no route shown until finalization'}</p>
    <dl className="grid grid-cols-2 gap-3 rounded-lg border bg-white p-4"><div><dt>Distance</dt><dd>{miles(manifest.distance_m)} mi</dd></div><div><dt>Recorded time</dt><dd>{(manifest.active_ms / 60000).toFixed(1)} min</dd></div><div><dt>Average moving speed</dt><dd>{movingMph(manifest)} mph</dd></div><div><dt>GPS elevation estimate</dt><dd>+{feet(manifest.gain_m)} / −{feet(manifest.loss_m)} ft</dd></div></dl>
    {manifest.horse_name && <p>Horse label: {manifest.horse_name}</p>}{manifest.location_name && <p>Place: {manifest.location_name}</p>}{manifest.notes && <p className="whitespace-pre-wrap break-words">{manifest.notes}</p>}
    <p className="text-sm">Phone-estimated metrics. Horse/place labels are not linked to server animal records.</p>
    {track.state === 'COMPLETE' && <PrivateTrackMap points={data.points} />}
  </>}</>;
}
