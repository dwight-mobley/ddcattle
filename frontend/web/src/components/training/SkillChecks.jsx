import { useGetTrainingSkillsQuery } from '../../features/api/trainingApi';
import { rows } from './trainingUtils';
import { ErrorNotice } from './TrainingUI';

export default function SkillChecks({ value, onChange, horseName }) {
  const { data, isLoading, error } = useGetTrainingSkillsQuery();
  const skills = rows(data).filter(skill => skill.active || value.some(item => item.skill === skill.id));
  const categories = [...new Set(skills.map(skill => skill.category))];
  const setChecked = (skill, checked) => onChange(checked ? [...value, { skill, evidence: '' }] : value.filter(item => item.skill !== skill));
  return <fieldset className="space-y-4 rounded-lg border border-sage/30 p-4"><legend className="px-2 font-semibold">{horseName ? `${horseName}: skills accomplished` : 'Skills accomplished'}</legend>
    <p className="text-sm text-charcoal/65">Check the skills this horse demonstrated successfully. These also appear on the horse’s accomplishments checklist.</p>
    <ErrorNotice error={error} />{isLoading && <p role="status">Loading skills…</p>}
    <div className="flex gap-4 text-sm"><button type="button" disabled={isLoading || !!error} className="text-rust underline" onClick={() => onChange(skills.map(skill => value.find(item => item.skill === skill.id) || { skill: skill.id, evidence: '' }))}>Check all skills</button><button type="button" className="text-rust underline" onClick={() => onChange([])}>Clear checks</button></div>
    {categories.map(category => <div key={category}><h4 className="mb-2 font-semibold text-sm">{category}</h4><div className="grid gap-2 sm:grid-cols-2">{skills.filter(skill => skill.category === category).map(skill => <label key={skill.id} className="flex gap-3 items-start rounded bg-desert-sand/40 p-3 text-sm"><input className="mt-1" type="checkbox" checked={value.some(item => item.skill === skill.id)} onChange={event => setChecked(skill.id, event.target.checked)} /><span>{skill.name}{!skill.active && ' (archived)'}</span></label>)}</div></div>)}
    {!isLoading && !error && !skills.length && <p>No skills available.</p>}
  </fieldset>;
}
