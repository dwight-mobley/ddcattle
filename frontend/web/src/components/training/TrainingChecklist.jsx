import { useGetTrainingChecklistQuery } from '../../features/api/trainingApi';
import { ErrorNotice } from './TrainingUI';
import { displayDate, label } from './trainingUtils';

export default function TrainingChecklist({ slug }) {
  const { data, isLoading, error } = useGetTrainingChecklistQuery(slug);
  if (isLoading) return <p role="status">Loading accomplishments…</p>;
  if (error) return <ErrorNotice error={error} />;
  if (!data) return null;
  return <section className="rounded-xl border border-sage/30 bg-white p-5 sm:p-8 space-y-6">
    <header><p className="text-xs uppercase tracking-widest font-bold text-sage">Training accomplishments</p><h2 className="mt-2 text-2xl font-serif text-saddle-brown">Skills, one step at a time</h2><p className="mt-3 text-sm text-charcoal/70">{data.accomplished_count} skills marked accomplished. Explore the work and evidence behind each skill.</p></header>
    {data.categories.length === 0 && <p className="text-charcoal/65">No training skills have been added yet.</p>}
    {data.categories.map(category => <div key={category.name} className="space-y-3"><h3 className="font-serif text-xl text-saddle-brown">{category.name}</h3><ul className="grid gap-3 sm:grid-cols-2">{category.skills.map(skill => <li key={skill.id} className="rounded-lg border border-sage/20 p-4">
      <div className="flex items-start gap-3"><span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border ${skill.accomplished ? 'bg-sage border-sage text-white' : 'border-sage/40 text-charcoal/50'}`} aria-hidden="true">{skill.accomplished ? '✓' : '—'}</span><div><h4 className="font-semibold">{skill.name}{!skill.active && <span className="ml-2 text-xs font-normal text-charcoal/60">Archived skill</span>}</h4><p className="mt-1 text-xs text-charcoal/65">{skill.accomplished ? 'Accomplished' : skill.latest ? 'In progress' : 'Not yet recorded'}</p></div></div>
      {(skill.latest || skill.contexts.length > 0 || skill.milestones.length > 0) && <details className="mt-3 text-sm"><summary className="cursor-pointer text-rust">View evidence and milestones</summary><div className="mt-3 space-y-3">
        {skill.latest && <Observation item={skill.latest} />}
        {skill.contexts.map(item => <div key={item.observation_id} className="border-t border-sage/20 pt-3"><p className="font-semibold">{item.context} · {item.accomplished ? 'Accomplished in this context' : 'In progress'}</p><Observation item={item} /></div>)}
        {skill.milestones.length > 0 && <div className="border-t border-sage/20 pt-3"><p className="font-semibold">Recorded milestones</p><ul className="mt-2 space-y-2">{skill.milestones.map(item => <li key={item.observation_id}>{item.accomplishment}{item.context && ` (${item.context})`}<span className="block text-xs text-charcoal/60">{displayDate(item.date)}</span></li>)}</ul></div>}
      </div></details>}
    </li>)}</ul></div>)}
    <p className="text-xs text-charcoal/60">The latest dated observation determines each checkbox. Left/right or other context-specific accomplishments stay separate. Update accomplishments through a training session in Admin.</p>
  </section>;
}

function Observation({ item }) {
  return <div className="space-y-1 text-charcoal/75">{item.proficiency && <p className="capitalize">{label(item.proficiency)}</p>}{item.evidence && <p className="whitespace-pre-wrap">{item.evidence}</p>}<p className="text-xs text-charcoal/60">Recorded {displayDate(item.date)}</p></div>;
}
