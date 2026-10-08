import { useState } from 'react';
import SkillChecks from './SkillChecks';
import { useGetTrainingLocationsQuery, useGetTrainingRecordsQuery, useSaveTrainingRecordMutation } from '../../features/api/trainingApi';
import { Field, ErrorNotice } from './TrainingUI';
import { today, rows, label, activityPayload } from './trainingUtils';

const rideTypes = ['trail', 'arena', 'road', 'lesson', 'conditioning', 'event', 'other'];
const sessionTypes = ['groundwork', 'round_pen', 'desensitization', 'mounted', 'trailer', 'handling', 'obstacles', 'conditioning', 'journal', 'other'];
export default function ActivityForm({ kind, animal, initial, horses, onDone, onCancel }) {
  const [form, setForm] = useState(() => ({ title: '', date: today(), location_name: '', notes: '', ride_type: 'trail', route: '', terrain: '', weather: '', session_type: 'groundwork', trainer_name: '', goals: '', successes: '', next_steps: '', ...initial, location: initial?.location ?? '', duration_minutes: initial?.duration_minutes ?? '', distance_miles: initial?.distance_miles ?? '', participants: initial?.participants?.map(p => ({ ...p, duration_minutes: p.duration_minutes ?? '', distance_miles: p.distance_miles ?? '' })) || [{ animal: animal.id, rider_name: '', notes: '', duration_minutes: '', distance_miles: '' }] }));
  const [checks, setChecks] = useState(initial?.skill_checks || []);
  const [skillEvidence, setSkillEvidence] = useState('');
  const [save, { isLoading, error }] = useSaveTrainingRecordMutation();
  const { data: locations, error: locationError } = useGetTrainingLocationsQuery();
  const { data: rides, error: rideError } = useGetTrainingRecordsQuery({ kind: 'rides', animal: animal.id }, { skip: kind !== 'sessions' });
  const [locationForm, setLocationForm] = useState(null);
  const [saveLocation, { isLoading: savingLocation, error: saveLocationError }] = useSaveTrainingRecordMutation();
  const change = event => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  const participantChange = (index, key, value) => setForm(previous => ({ ...previous, participants: previous.participants.map((p, i) => i === index ? { ...p, [key]: value } : p) }));
  async function submit(event) {
    event.preventDefault();
    try { const result = await save({ kind, id: initial?.id, body: { ...activityPayload(form, kind, animal.id), skill_checks: checks.filter(item => kind !== 'rides' || form.participants.some(p => Number(p.animal) === item.animal)).map(item => ({ ...item, evidence: skillEvidence.trim() || item.evidence || form.notes.trim() })) } }).unwrap(); onDone(result); } catch { /* Mutation error is rendered below. */ }
  }
  async function addLocation() {
    if (!locationForm.name.trim()) return;
    try { const result = await saveLocation({ kind: 'locations', body: locationForm }).unwrap(); setForm(previous => ({ ...previous, location: result.id })); setLocationForm(null); } catch { /* Preserve entered location on failure. */ }
  }
  const input = (name, caption, type = 'text', extra = {}) => <Field label={caption}><input name={name} type={type} value={form[name]} onChange={change} {...extra} /></Field>;
  const text = (name, caption) => <Field label={caption}><textarea name={name} value={form[name]} onChange={change} rows="3" /></Field>;
  return <form className="activity-form rounded-xl border border-sage/30 bg-white p-5 sm:p-8 space-y-6" onSubmit={submit}>
    <h2 className="text-2xl font-serif text-saddle-brown">{initial ? 'Edit' : 'Record'} {kind === 'rides' ? 'ride' : 'training session'}</h2>
    <ErrorNotice error={error} />
    <div className="grid gap-5 sm:grid-cols-2">
      {input('title', 'Title', 'text', { required: true, maxLength: 200 })}{input('date', 'Date', 'date', { required: true })}
      <Field label={kind === 'rides' ? 'Ride type' : 'Session type'}><select name={kind === 'rides' ? 'ride_type' : 'session_type'} value={kind === 'rides' ? form.ride_type : form.session_type} onChange={change}>{(kind === 'rides' ? rideTypes : sessionTypes).map(type => <option key={type} value={type}>{label(type)}</option>)}</select></Field>
      {input('duration_minutes', 'Duration (minutes)', 'number', { min: 1, step: 1 })}
      <Field label="Saved location"><select name="location" value={form.location} onChange={change}><option value="">No saved location</option>{rows(locations).filter(l => l.active || l.id === Number(form.location)).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
      {input('location_name', 'One-off or historical location', 'text', { maxLength: 200 })}
    </div>
    <ErrorNotice error={locationError} />
    {kind === 'sessions' && <><ErrorNotice error={rideError} /><Field label="Linked ride (optional)"><select name="ride" value={form.ride || ''} onChange={change}><option value="">Not part of a ride</option>{rows(rides).map(ride => <option key={ride.id} value={ride.id}>{ride.date} · {ride.title}</option>)}</select></Field></>}
    <button type="button" className="text-rust underline text-sm" onClick={() => setLocationForm({ name: '', city: '', state: '' })}>Save a new reusable location</button>
    {locationForm && <div className="rounded-lg border border-sage/30 p-4 space-y-3"><h3 className="font-semibold">New location</h3><ErrorNotice error={saveLocationError} />{['name', 'city', 'state'].map(key => <Field key={key} label={label(key)}><input value={locationForm[key]} maxLength={key === 'name' ? 200 : key === 'city' ? 100 : 50} onChange={e => setLocationForm(previous => ({ ...previous, [key]: e.target.value }))} /></Field>)}<div className="flex gap-4"><button type="button" className="activity-button" disabled={savingLocation || !locationForm.name.trim()} onClick={addLocation}>{savingLocation ? 'Saving…' : 'Save location'}</button><button type="button" onClick={() => setLocationForm(null)}>Cancel location</button></div></div>}
    {kind === 'rides' ? <>
      {input('distance_miles', 'Distance (miles)', 'number', { min: 0, step: 0.01 })}
      <details><summary className="text-sm cursor-pointer text-rust">Route, terrain and weather (optional)</summary><div className="mt-4 space-y-4"><div className="grid gap-5 sm:grid-cols-2">{input('terrain', 'Terrain', 'text', { maxLength: 250 })}{input('weather', 'Weather', 'text', { maxLength: 250 })}</div>{text('route', 'Route / trails')}</div></details>
      <fieldset className="space-y-4"><legend className="font-serif text-xl text-saddle-brown">Horses and riders</legend>{form.participants.map((p, index) => <div key={index} className="rounded-lg bg-desert-sand/50 p-4 space-y-3">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Horse"><select required value={p.animal} onChange={e => participantChange(index, 'animal', e.target.value)}>{horses.filter(h => !form.participants.some((other, i) => i !== index && Number(other.animal) === h.id)).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}</select></Field><Field label="Rider name"><input value={p.rider_name} maxLength="150" onChange={e => participantChange(index, 'rider_name', e.target.value)} /></Field></div>
        <Field label="Notes for this horse"><textarea value={p.notes} onChange={e => participantChange(index, 'notes', e.target.value)} rows="2" /></Field>
        <details><summary className="text-sm cursor-pointer">Different duration or distance for this horse</summary><div className="grid gap-4 sm:grid-cols-2 mt-3"><Field label="Minutes (leave blank to use ride duration)"><input type="number" min="1" step="1" value={p.duration_minutes} onChange={e => participantChange(index, 'duration_minutes', e.target.value)} /></Field><Field label="Miles (leave blank to use ride distance)"><input type="number" min="0" step="0.01" value={p.distance_miles} onChange={e => participantChange(index, 'distance_miles', e.target.value)} /></Field></div></details>
        {form.participants.length > 1 && Number(p.animal) !== animal.id && <button type="button" className="text-rust text-sm underline" onClick={() => setForm(previous => ({ ...previous, participants: previous.participants.filter((_, i) => i !== index) }))}>Remove horse</button>}
      </div>)}<button type="button" className="text-rust underline text-sm" disabled={form.participants.length >= horses.length} onClick={() => { const horse = horses.find(h => !form.participants.some(p => Number(p.animal) === h.id)); if (horse) setForm(previous => ({ ...previous, participants: [...previous.participants, { animal: horse.id, rider_name: '', notes: '', duration_minutes: '', distance_miles: '' }] })); }}>Add another horse</button></fieldset>
    </> : <>{input('trainer_name', 'Trainer name', 'text', { maxLength: 150 })}<details><summary className="text-sm cursor-pointer text-rust">Goals and follow-up (optional)</summary><div className="mt-4 space-y-4">{text('goals', 'Goals / exercises')}{text('successes', 'What went well')}{text('next_steps', 'What to work on next')}</div></details><p className="text-sm text-charcoal/60">Check skills below while saving. Add photos, videos, or detailed assessments afterward.</p></>}
    {text('notes', 'Notes')}
    {kind === 'rides' ? form.participants.map(p => <SkillChecks key={p.animal} horseName={horses.find(h => h.id === Number(p.animal))?.name} value={checks.filter(item => item.animal === Number(p.animal))} onChange={items => setChecks(previous => [...previous.filter(item => item.animal !== Number(p.animal)), ...items.map(item => ({ ...item, animal: Number(p.animal) }))])} />) : <SkillChecks value={checks} onChange={setChecks} />}
    {checks.length > 0 && <Field label="What did the horse(s) demonstrate? (applies to checked skills)"><textarea value={skillEvidence} onChange={event => setSkillEvidence(event.target.value)} rows="3" required={checks.some(item => !item.evidence) && !form.notes.trim()} placeholder="For example: loaded calmly, stood tied, and crossed water and the bridge willingly." /></Field>}
    <p className="text-xs text-charcoal/65">One description can support several checks. Existing evidence stays intact unless you enter a new description. Use individual assessments in session details for different proficiency levels or left/right context.</p>
    <div className="flex gap-4"><button className="activity-button" disabled={isLoading || savingLocation || !!locationForm}>{isLoading ? 'Saving…' : 'Save record'}</button><button type="button" disabled={isLoading} onClick={onCancel}>Cancel</button></div>
  </form>;
}
