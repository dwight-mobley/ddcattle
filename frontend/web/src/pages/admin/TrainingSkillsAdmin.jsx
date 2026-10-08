import { useState } from 'react';
import { useGetTrainingSkillsQuery, useSaveTrainingRecordMutation } from '../../features/api/trainingApi';
import { Field, ErrorNotice, Empty } from '../../components/training/TrainingUI';
import { rows } from '../../components/training/trainingUtils';
import '../../components/training/training.css';

export default function TrainingSkillsAdmin() {
  const { data, isLoading, error } = useGetTrainingSkillsQuery();
  const [editing, setEditing] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const skills = rows(data);
  const visible = skills.filter(skill => (showArchived || skill.active) && `${skill.name} ${skill.category}`.toLowerCase().includes(search.toLowerCase()));
  const categories = [...new Set(skills.map(skill => skill.category))].sort();
  return <div className="space-y-6"><header><h2 className="text-2xl font-serif text-saddle-brown">Training skills</h2><p className="mt-2 text-sm text-charcoal/70">Build your own skill list. New active skills appear automatically on ride forms, session forms, and horse checklists.</p></header>
    {notice && <p role="status" className="rounded-lg bg-sage/10 p-3">{notice}</p>}<ErrorNotice error={error} />
    {!editing && <button className="activity-button" onClick={() => { setNotice(''); setEditing({ name: '', category: '', assessment_criteria: '', active: true }); }}>Add a skill</button>}
    {editing && <SkillForm key={editing.id || 'new'} initial={editing} categories={categories} onCancel={() => setEditing(null)} onDone={skill => { setEditing(null); setNotice(`${skill.name} saved${skill.active ? '.' : ' and archived. Its recorded history is preserved.'}`); }} />}
    <div className="activity-form flex flex-wrap items-end gap-4"><Field label="Find a skill"><input type="search" value={search} onChange={event => setSearch(event.target.value)} /></Field><label className="flex gap-2 items-center py-3 text-sm"><input type="checkbox" checked={showArchived} onChange={event => setShowArchived(event.target.checked)} />Include archived skills</label></div>
    {isLoading && <p role="status">Loading skills…</p>}
    {!isLoading && !error && !visible.length && <Empty>No skills match this view.</Empty>}
    <div className="space-y-3">{visible.map(skill => <article key={skill.id} className="rounded-xl border border-sage/20 bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{skill.name}</h3><p className="mt-1 text-sm text-charcoal/65">{skill.category}{!skill.active && ' · Archived'}</p></div><button className="text-rust underline text-sm" disabled={!!editing} onClick={() => { setNotice(''); setEditing(skill); }}>Edit {skill.name}</button></div>{skill.assessment_criteria && <p className="mt-3 text-sm whitespace-pre-wrap text-charcoal/75">{skill.assessment_criteria}</p>}</article>)}</div>
  </div>;
}

function SkillForm({ initial, categories, onCancel, onDone }) {
  const [form, setForm] = useState(initial);
  const [save, { isLoading, error }] = useSaveTrainingRecordMutation();
  const change = event => setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    try { const result = await save({ kind: 'skills', id: initial.id, body: { name: form.name.trim(), category: form.category.trim(), assessment_criteria: form.assessment_criteria.trim(), active: form.active } }).unwrap(); onDone(result); } catch { /* Retain entered fields when saving fails. */ }
  }
  return <form className="activity-form rounded-xl border border-sage/30 bg-white p-5 space-y-4" onSubmit={submit}><h3 className="font-serif text-xl">{initial.id ? 'Edit skill' : 'New skill'}</h3><ErrorNotice error={error} /><div className="grid gap-4 sm:grid-cols-2"><Field label="Skill name"><input required maxLength="150" name="name" value={form.name} onChange={change} placeholder="For example: Shooting" /></Field><Field label="Category"><input required maxLength="100" list="skill-categories" name="category" value={form.category} onChange={change} placeholder="Choose an existing category or type a new one" /></Field><datalist id="skill-categories">{categories.map(category => <option key={category} value={category} />)}</datalist></div><Field label="What does accomplishment look like? (optional)"><textarea name="assessment_criteria" value={form.assessment_criteria} onChange={change} rows="3" placeholder="Describe what you want the horse to demonstrate." /></Field><label className="flex gap-3 items-center text-sm"><input type="checkbox" checked={form.active} onChange={event => setForm(previous => ({ ...previous, active: event.target.checked }))} />Available for new records</label><p className="text-xs text-charcoal/65">Turn off availability to archive a skill. Earlier accomplishments and evidence stay in the horse’s history. Rename a skill to clarify its wording; add a new skill if its meaning changes.</p><div className="flex gap-4"><button className="activity-button" disabled={isLoading || !form.name.trim() || !form.category.trim()}>{isLoading ? 'Saving…' : 'Save skill'}</button><button type="button" disabled={isLoading} onClick={onCancel}>Cancel</button></div></form>;
}
