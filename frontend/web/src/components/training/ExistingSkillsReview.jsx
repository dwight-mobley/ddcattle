import { useState } from 'react';
import { useGetTrainingChecklistQuery, useSaveTrainingRecordMutation } from '../../features/api/trainingApi';
import SkillChecks from './SkillChecks';
import { Field, ErrorNotice } from './TrainingUI';
import { today } from './trainingUtils';

export default function ExistingSkillsReview({ animal, slug, onDone }) {
  const { data, isLoading, error } = useGetTrainingChecklistQuery(slug);
  if (isLoading) return <p role="status">Loading known skills…</p>;
  if (error) return <ErrorNotice error={error} />;
  if (!data) return null;
  return <ReviewForm animal={animal} checklist={data} onDone={onDone} />;
}

function ReviewForm({ animal, checklist, onDone }) {
  const [checks, setChecks] = useState(() => checklist.categories.flatMap(category => category.skills.filter(skill => skill.accomplished).map(skill => ({ skill: skill.id, evidence: skill.latest?.evidence || '' }))));
  const [date, setDate] = useState(today());
  const [evidence, setEvidence] = useState('');
  const [save, { isLoading, error }] = useSaveTrainingRecordMutation();
  async function submit(event) {
    event.preventDefault();
    try {
      await save({ kind: 'sessions', body: { animal: animal.id, title: 'Existing skills review', date, session_type: 'journal', notes: evidence, skill_checks: checks.map(item => ({ skill: item.skill, evidence })) } }).unwrap();
      onDone();
    } catch { /* Retain checks and description on failure. */ }
  }
  return <form onSubmit={submit} className="activity-form rounded-xl border border-sage/30 bg-white p-5 space-y-5"><h3 className="text-xl font-serif text-saddle-brown">Confirm {animal.name}’s existing skills</h3><p className="text-sm text-charcoal/65">Record what you know now. You do not need to reconstruct old rides. The date is when you confirm these skills, rather than a guessed date of first accomplishment. Unchecked skills keep their earlier history.</p><ErrorNotice error={error} /><Field label="Review date"><input required type="date" max={today()} value={date} onChange={event => setDate(event.target.value)} /></Field><SkillChecks value={checks} onChange={setChecks} horseName={animal.name} /><Field label="How do you know these skills are accomplished?"><textarea required value={evidence} onChange={event => setEvidence(event.target.value)} rows="3" placeholder="Describe your experience handling and riding this horse." /></Field><div className="flex gap-4"><button className="activity-button" disabled={isLoading || !checks.length || !evidence.trim()}>{isLoading ? 'Saving…' : 'Save existing skills'}</button><button type="button" disabled={isLoading} onClick={onDone}>Cancel</button></div></form>;
}
