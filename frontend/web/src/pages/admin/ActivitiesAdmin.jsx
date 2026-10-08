import { Link, useParams, useNavigate } from 'react-router-dom';
import { useGetAnimalsQuery, useGetAnimalBySlugQuery } from '../../features/api/animalApi';
import { useGetTrainingAccessQuery } from '../../features/api/trainingApi';
import { ActivityRecords } from '../animals/AnimalActivitiesPage';
import { ErrorNotice, Empty } from '../../components/training/TrainingUI';
import { rows } from '../../components/training/trainingUtils';
import '../../components/training/training.css';

export default function ActivitiesAdmin({ kind }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAnimalsQuery();
  const horses = rows(data).filter(animal => animal.species === 'horse');
  return <div className="space-y-6"><header><h2 className="font-serif text-2xl text-saddle-brown">{kind === 'rides' ? 'Rides' : 'Training sessions'}</h2><p className="mt-2 text-sm text-charcoal/70">Choose a horse to manage {kind === 'rides' ? 'rides, riders, photos and videos' : 'sessions, skill accomplishments, photos and videos'}.</p></header><ErrorNotice error={error} />{isLoading && <p role="status">Loading horses…</p>}
    <div className="activity-form"><label className="block text-sm font-semibold" htmlFor="activity-admin-horse">Horse</label><select id="activity-admin-horse" value={slug || ''} onChange={e => navigate(`/admin/${kind === 'rides' ? 'rides' : 'training'}${e.target.value ? `/${e.target.value}` : ''}`)}><option value="">Choose a horse</option>{horses.map(horse => <option key={horse.id} value={horse.slug}>{horse.name}</option>)}</select></div>
    {slug ? <HorseRecords key={`${kind}-${slug}`} kind={kind} slug={slug} /> : !isLoading && !error && <Empty>Select a horse to view and manage its records.</Empty>}
  </div>;
}

function HorseRecords({ kind, slug }) {
  const { data: animal, isLoading, error } = useGetAnimalBySlugQuery(slug);
  const { data: access, isLoading: accessLoading, error: accessError } = useGetTrainingAccessQuery(slug);
  if (isLoading || accessLoading) return <p role="status">Loading records…</p>;
  if (error || accessError) return <ErrorNotice error={error || accessError} />;
  if (!animal || !access) return null;
  if (animal.species !== 'horse') return <Empty>Select a horse.</Empty>;
  return <><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-serif text-xl text-saddle-brown">{animal.name}</h3><Link className="text-sm text-rust underline" to={`/animals/${slug}/${kind === 'rides' ? 'rides' : 'training'}`}>View public horse page</Link></div><ActivityRecords kind={kind} animal={animal} slug={slug} access={access} allowEditing /></>;
}
