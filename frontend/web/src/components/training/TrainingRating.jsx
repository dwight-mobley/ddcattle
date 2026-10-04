import { useGetTrainingRatingQuery } from '../../features/api/trainingApi';
import { ErrorNotice } from './TrainingUI';
import { label, displayDate } from './trainingUtils';

export default function TrainingRating({ slug }) {
  const { data, isLoading, error } = useGetTrainingRatingQuery(slug);
  if (isLoading) return <p role="status">Loading training progress…</p>;
  if (error) return <ErrorNotice error={error} />;
  if (!data) return null;
  return <section className="rounded-xl bg-saddle-brown p-6 text-white sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs uppercase tracking-widest text-white/70">Foundation training</p><h2 className="mt-2 font-serif text-3xl">{data.score == null ? 'Building the picture' : `${Math.round(data.score)} / 100`}</h2></div>
      <p className="text-sm text-white/80">{Math.round(data.coverage * 100)}% of skills assessed</p>
    </div>
    <p className="mt-4 max-w-2xl text-sm text-white/80">{data.score == null ? 'Record assessments for at least half of the foundation skills to see a rating.' : 'This rating reflects the latest recorded assessment for each foundation skill. Skills without an assessment have no demonstrated points.'}</p>
    <details className="mt-5"><summary className="cursor-pointer font-semibold">See skills and evidence</summary>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{data.skills.map(skill => <div key={skill.skill} className="rounded-lg border border-white/20 p-4">
        <div className="flex justify-between gap-3"><h3 className="capitalize">{label(skill.skill)}</h3><span className="text-sm capitalize text-white/80">{skill.proficiency ? label(skill.proficiency) : 'Unassessed'}</span></div>
        <progress aria-label={`${label(skill.skill)} proficiency`} max="100" value={skill.points ?? 0} className="mt-2 w-full accent-sage" />
        {skill.evidence && <p className="mt-2 text-sm text-white/80">{skill.evidence}</p>}
        {skill.accomplishment && <p className="mt-2 text-sm">Milestone: {skill.accomplishment}</p>}
        {skill.date && <p className="mt-2 text-xs text-white/60">Assessed {displayDate(skill.date)} · {skill.contribution.toFixed(1)} points toward the total</p>}
      </div>)}</div>
      <p className="mt-4 text-xs text-white/70">Rubric: {data.rubric}. Side-specific assessments stay in the session history and do not contribute to this general rating.</p>
    </details>
  </section>;
}
