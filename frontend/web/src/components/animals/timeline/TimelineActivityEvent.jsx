import { Link } from 'react-router-dom';

export default function TimelineActivityEvent({ event, slug }) {
  const ride = event.type === 'ride';
  const data = event.data;
  return <article className="rounded-xl border border-sage/20 bg-white p-5 sm:p-6"><p className="text-xs uppercase tracking-widest font-bold text-sage">{ride ? 'Ride' : 'Training'} · {(data.ride_type || data.session_type || '').replaceAll('_', ' ')}</p><h3 className="mt-2 text-xl font-serif text-saddle-brown">{event.title}</h3><p className="mt-2 text-sm text-charcoal/65">{data.location_name}{data.duration_minutes != null && ` · ${data.duration_minutes} min`}{data.distance_miles != null && ` · ${data.distance_miles} mi`}</p>{event.description && <p className="mt-3 text-sm whitespace-pre-wrap text-charcoal/75">{event.description}</p>}<Link to={`/animals/${slug}/${ride ? 'rides' : 'training'}`} className="mt-4 inline-block text-sm text-rust underline">View {ride ? 'rides' : 'training sessions'}</Link></article>;
}
