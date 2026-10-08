import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';
import { useGetTrainingAccessQuery, useGetTrainingRecordsQuery, useGetTrainingLocationsQuery, useDeleteTrainingRecordMutation } from '../../features/api/trainingApi';
import ActivityForm from '../../components/training/ActivityForm';
import ActivityMedia from '../../components/training/ActivityMedia';
import SessionProgress from '../../components/training/SessionProgress';
import TrainingChecklist from '../../components/training/TrainingChecklist';
import { Empty, ErrorNotice } from '../../components/training/TrainingUI';
import { rows, label, displayDate } from '../../components/training/trainingUtils';
import '../../components/training/training.css';

export default function AnimalActivitiesPage({ kind }) {
  const { animal } = useOutletContext();
  const { slug } = useParams();
  const auth = useAuth();
  return <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8"><header><p className="text-xs font-bold uppercase tracking-widest text-sage">{kind === 'rides' ? 'Time in the saddle' : 'Every step forward'}</p><h1 className="mt-2 text-3xl sm:text-4xl font-serif text-saddle-brown">{animal.name}’s {kind === 'rides' ? 'Rides' : 'Training'}</h1><p className="mt-3 max-w-2xl text-charcoal/65">{kind === 'rides' ? 'Keep the route, the riders, and the moments worth remembering together.' : 'Record the work, celebrate accomplishments, and see the evidence behind progress.'}</p></header>
    {animal.species !== 'horse' ? <Empty>Training and riding records are available for horses.</Empty> : auth.isLoading ? <p role="status">Checking access…</p> : !auth.isAuthenticated ? <Empty><Link to="/login" className="text-rust underline">Sign in</Link> to view training and riding records.</Empty> : <Activities key={`${kind}-${animal.id}`} kind={kind} animal={animal} slug={slug} />}
  </main>;
}

function Activities({ kind, animal, slug }) {
  const { data: access, isLoading: accessLoading, error: accessError } = useGetTrainingAccessQuery(slug);
  if (accessLoading) return <p role="status">Loading your horse records…</p>;
  if (accessError) return <ErrorNotice error={accessError} />;
  return <ActivityRecords kind={kind} animal={animal} slug={slug} access={access} />;
}

export function ActivityRecords({ kind, animal, slug, access, allowEditing = false }) {
  const { isAdmin } = useAuth();
  allowEditing = allowEditing && isAdmin;
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { data, isLoading, isFetching, error } = useGetTrainingRecordsQuery({ kind, animal: animal.id, ...(dateFrom ? { date_from: dateFrom } : {}), ...(dateTo ? { date_to: dateTo } : {}) });
  const { data: locations } = useGetTrainingLocationsQuery();
  const [remove, { isLoading: deleting, error: deleteError }] = useDeleteTrainingRecordMutation();
  const horses = access?.horses || [];
  const current = horses.find(h => h.id === animal.id);
  const manageable = horses.filter(h => h.can_manage_training);
  const records = rows(data);
  const canEdit = record => allowEditing && (kind === 'sessions' ? current?.can_manage_training : record.participants.every(p => manageable.some(h => h.id === p.animal)));
  const totalMiles = records.reduce((sum, record) => { const p = record.participants?.find(p => p.animal === animal.id); return sum + Number(p?.distance_miles ?? record.distance_miles ?? 0); }, 0);
  const totalMinutes = records.filter(r => r.session_type !== 'journal').reduce((sum, record) => { const p = record.participants?.find(p => p.animal === animal.id); return sum + Number(p?.duration_minutes ?? record.duration_minutes ?? 0); }, 0);
  if (!current) return <Empty>You do not have access to this horse’s records.</Empty>;
  return <>
    {kind === 'sessions' && <TrainingChecklist slug={slug} />}
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-charcoal/65">{records.length} {kind === 'rides' ? 'rides' : 'sessions'} in this view · {kind === 'rides' && `${totalMiles.toFixed(2)} recorded miles · `}{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m recorded</p>{allowEditing && current.can_manage_training && !editing && <button className="activity-button" onClick={() => setEditing({})}>Record {kind === 'rides' ? 'a ride' : 'a session'}</button>}</div>
    <p className="text-xs text-charcoal/60">Totals use recorded values only. Blank distance or duration is unknown.</p>
    {allowEditing && editing && <ActivityForm key={editing.id || 'new'} kind={kind} animal={animal} initial={editing.id ? editing : undefined} horses={manageable} onDone={record => { setEditing(null); setExpanded(record.id); }} onCancel={() => setEditing(null)} />}
    <div className="activity-form flex flex-wrap gap-4 items-end"><label className="text-sm">From<input aria-label="From date" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></label><label className="text-sm">Through<input aria-label="Through date" type="date" min={dateFrom || undefined} value={dateTo} onChange={e => setDateTo(e.target.value)} /></label>{(dateFrom || dateTo) && <button className="text-rust underline text-sm py-3" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear dates</button>}</div>
    <ErrorNotice error={error || deleteError} />
    {(isLoading || isFetching) && <p role="status">Loading records…</p>}
    {!isLoading && !error && !records.length && <Empty>No {kind === 'rides' ? 'rides' : 'training sessions'} in this date range. {allowEditing && current.can_manage_training ? 'Record one to start the history.' : ''}</Empty>}
    <div className="space-y-5">{records.map(record => {
      const location = rows(locations).find(l => l.id === record.location)?.name || record.location_name;
      const open = expanded === record.id;
      return <article key={record.id} className="rounded-xl bg-white border border-sage/20 p-5 sm:p-7 space-y-4"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs text-sage font-bold uppercase tracking-widest">{displayDate(record.date)} · {label(record.ride_type || record.session_type)}</p><h2 className="mt-2 font-serif text-2xl text-saddle-brown">{record.title}</h2><p className="mt-2 text-sm text-charcoal/65">{location || 'Location not recorded'}{record.duration_minutes != null && ` · ${record.duration_minutes} min`}{record.distance_miles != null && ` · ${record.distance_miles} mi`}</p></div><button aria-expanded={open} className="text-rust underline text-sm" onClick={() => setExpanded(open ? null : record.id)}>{open ? 'Close details' : 'View details'}</button></div>
        {kind === 'rides' && <div className="flex flex-wrap gap-2">{record.participants.map(p => <span className="rounded-full bg-sage/10 px-3 py-1 text-sm" key={p.id}>{horses.find(h => h.id === p.animal)?.name || 'Horse'}{p.rider_name && ` · ${p.rider_name}`}</span>)}</div>}
        {record.notes && <p className="whitespace-pre-wrap text-sm text-charcoal/80">{record.notes}</p>}
        {open && <div className="border-t border-sage/20 pt-5 space-y-7">
          {['route', 'terrain', 'weather', 'trainer_name', 'goals', 'successes', 'next_steps'].filter(key => record[key]).map(key => <div key={key}><h3 className="text-sm capitalize font-semibold">{label(key)}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-charcoal/75">{record[key]}</p></div>)}
          {kind === 'rides' && record.participants.map(p => <div key={p.id}><h3 className="font-semibold">{horses.find(h => h.id === p.animal)?.name || 'Horse'}{p.rider_name && ` — ${p.rider_name}`}</h3>{p.notes && <p className="whitespace-pre-wrap text-sm mt-1">{p.notes}</p>}{(p.duration_minutes != null || p.distance_miles != null) && <p className="text-sm text-charcoal/60">{p.duration_minutes != null && `${p.duration_minutes} min`}{p.distance_miles != null && ` · ${p.distance_miles} mi`}</p>}</div>)}
          {canEdit(record) && <div className="flex flex-wrap gap-4 text-sm"><button className="text-rust underline" disabled={!!editing} onClick={() => setEditing(record)}>Edit record</button><button className="text-rust underline" disabled={deleting} onClick={async () => { if (confirm !== record.id) { setConfirm(record.id); return; } try { await remove({ kind, id: record.id }).unwrap(); setConfirm(null); } catch { /* Render server deletion guards. */ } }}>{confirm === record.id ? 'Confirm delete record' : 'Delete record'}</button>{confirm === record.id && <button onClick={() => setConfirm(null)}>Keep record</button>}</div>}
          {kind === 'sessions' && <SessionProgress session={record.id} canManage={allowEditing && current.can_manage_training} />}
          <ActivityMedia kind={kind} record={record} horses={horses} canEdit={allowEditing} />
        </div>}
      </article>;
    })}</div>
  </>;
}
