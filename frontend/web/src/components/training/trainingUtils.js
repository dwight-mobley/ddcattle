export const rows = data => Array.isArray(data) ? data : data?.results || [];
export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function displayDate(value) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
}
export function errorText(error) {
  if (error?.status === 403) return 'You do not have permission to make this change.';
  if (error?.status === 401) return 'Please sign in again to continue.';
  if (error?.data) return flatten(error.data).join(' · ');
  return error?.message || 'Unable to complete this request. Please try again.';
}
function flatten(value, prefix = '') {
  if (typeof value === 'string') return [prefix ? `${prefix}: ${value}` : value];
  if (Array.isArray(value)) return value.flatMap(item => flatten(item, prefix));
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, item]) => flatten(item, key === 'detail' || key === 'non_field_errors' ? prefix : key.replaceAll('_', ' ')));
  return [];
}
export const label = value => value.replaceAll('_', ' ').replaceAll('-', ' ');
export function activityPayload(form, kind, animalId) {
  const common = { title: form.title.trim(), date: form.date, location: form.location ? Number(form.location) : null, location_name: form.location_name.trim(), duration_minutes: form.duration_minutes === '' ? null : Number(form.duration_minutes), notes: form.notes };
  if (kind === 'rides') return { ...common, ride_type: form.ride_type, distance_miles: form.distance_miles === '' ? null : form.distance_miles, route: form.route, terrain: form.terrain, weather: form.weather, participants: form.participants.map(p => ({ animal: Number(p.animal), rider: p.rider || null, rider_name: p.rider_name, notes: p.notes, duration_minutes: p.duration_minutes === '' || p.duration_minutes == null ? null : Number(p.duration_minutes), distance_miles: p.distance_miles === '' || p.distance_miles == null ? null : p.distance_miles })) };
  return { ...common, animal: animalId, session_type: form.session_type, ride: form.ride ? Number(form.ride) : null, trainer: form.trainer || null, trainer_name: form.trainer_name, goals: form.goals, successes: form.successes, next_steps: form.next_steps };
}
