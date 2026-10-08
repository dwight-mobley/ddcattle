import { useState } from 'react';
import { useGetTrainingProgressQuery, useGetTrainingSkillsQuery, useSaveTrainingRecordMutation, useDeleteTrainingRecordMutation } from '../../features/api/trainingApi';
import { Field, ErrorNotice, Empty } from './TrainingUI';
import { rows, label } from './trainingUtils';

const levels = ['needs_work', 'introduced', 'learning', 'improving', 'reliable', 'mastered'];
export default function SessionProgress({ session, canManage }) {
  const { data, isLoading, error } = useGetTrainingProgressQuery({ session });
  const { data: skills, error: skillError } = useGetTrainingSkillsQuery();
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [remove, { error: deleteError, isLoading: deleting }] = useDeleteTrainingRecordMutation();
  return <section className="space-y-4"><h3 className="text-xl font-serif text-saddle-brown">Skills and accomplishments</h3><ErrorNotice error={error || skillError || deleteError} />
    {isLoading ? <p role="status">Loading skills…</p> : !rows(data).length && <Empty>No skills recorded for this session yet.</Empty>}
    {rows(data).map(item => <div key={item.id} className="rounded-lg bg-desert-sand/50 p-4"><div className="flex flex-wrap justify-between gap-3"><h4 className="font-semibold">{rows(skills).find(s => s.id === item.skill)?.name || 'Training skill'}{item.context && ` · ${item.context}`}</h4><span className="text-sm capitalize">{item.accomplished ? '✓ Accomplished' : item.proficiency ? label(item.proficiency) : 'Practiced, unassessed'}</span></div>{item.accomplishment && <p className="mt-2">Milestone: {item.accomplishment}</p>}{item.evidence && <p className="mt-2 text-sm whitespace-pre-wrap">{item.evidence}</p>}{canManage && <div className="mt-3 flex gap-4 text-sm"><button className="text-rust underline" onClick={() => setEditing(item)}>Edit assessment</button><button disabled={deleting} className="text-rust underline" onClick={async () => { if (confirm !== item.id) { setConfirm(item.id); return; } try { await remove({ kind: 'progress', id: item.id }).unwrap(); setConfirm(null); } catch { /* Display mutation error. */ } }}>{confirm === item.id ? 'Confirm removal' : 'Remove assessment'}</button>{confirm === item.id && <button onClick={() => setConfirm(null)}>Keep assessment</button>}</div>}</div>)}
    {canManage && !editing && <button className="text-rust underline" onClick={() => setEditing({ skill: '', proficiency: '', accomplished: false, context: '', accomplishment: '', evidence: '' })}>Record skill progress</button>}
    {editing && <ProgressForm key={editing.id || 'new'} initial={editing} skills={rows(skills)} session={session} onDone={() => setEditing(null)} />}
  </section>;
}

function ProgressForm({ initial, skills, session, onDone }) {
  const [form, setForm] = useState(initial);
  const [save, { isLoading, error }] = useSaveTrainingRecordMutation();
  const change = e => setForm(previous => ({ ...previous, [e.target.name]: e.target.value }));
  async function submit(e) { e.preventDefault(); try { await save({ kind: 'progress', id: initial.id, body: { session, skill: Number(form.skill), proficiency: form.proficiency, accomplished: !!form.accomplished, context: form.context.trim(), accomplishment: form.accomplishment, evidence: form.evidence } }).unwrap(); onDone(); } catch { /* Preserve form and render error. */ } }
  return <form onSubmit={submit} className="activity-form border border-sage/30 rounded-lg p-5 space-y-4"><h4 className="font-semibold">{initial.id ? 'Edit assessment' : 'New assessment'}</h4><ErrorNotice error={error} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Skill"><select required name="skill" value={form.skill} onChange={change}><option value="">Choose a skill</option>{skills.filter(s => s.active || s.id === Number(form.skill)).map(s => <option key={s.id} value={s.id}>{s.category} · {s.name}</option>)}</select></Field><Field label="Proficiency"><select name="proficiency" value={form.proficiency} onChange={change}><option value="">Practiced without assessment</option>{levels.map(level => <option key={level} value={level}>{label(level)}</option>)}</select></Field></div>
    {skills.find(s => s.id === Number(form.skill))?.assessment_criteria && <p className="text-sm text-charcoal/70">{skills.find(s => s.id === Number(form.skill)).assessment_criteria}</p>}
    <label className="flex gap-3 items-center text-sm font-semibold"><input type="checkbox" checked={!!form.accomplished} onChange={e => setForm(previous => ({ ...previous, accomplished: e.target.checked }))} />Skill accomplished</label><p className="text-xs text-charcoal/65">Check this skill when the evidence supports accomplishment. For context-specific work, describe the context below.</p><Field label="Context (optional, for example left side)"><input name="context" value={form.context} onChange={change} maxLength="100" /></Field><Field label="Accomplishment / milestone"><input name="accomplishment" value={form.accomplishment} onChange={change} maxLength="250" /></Field><Field label="Evidence / observations"><textarea name="evidence" required={!!form.proficiency || !!form.accomplished} value={form.evidence} onChange={change} rows="3" /></Field><p className="text-xs text-charcoal/65">One successful attempt can be a milestone without establishing mastery. Context-specific assessments remain separate from the general accomplishment checklist.</p><div className="flex gap-4"><button className="activity-button" disabled={isLoading}>{isLoading ? 'Saving…' : 'Save assessment'}</button><button type="button" disabled={isLoading} onClick={onDone}>Cancel</button></div></form>;
}
