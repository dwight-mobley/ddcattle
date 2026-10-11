export const kindLabel = kind => ({ HORSE: 'Horse ride', FOUR_WHEELER_TEST: '4-wheeler test', VEHICLE_TEST: 'Vehicle test' }[kind] || kind);
export const miles = value => (Number(value || 0) / 1609.344).toFixed(2);
export const feet = value => (Number(value || 0) / 0.3048).toFixed(0);
export const movingMph = manifest => manifest.moving_ms > 0 ? (manifest.distance_m / (manifest.moving_ms / 1000) * 3600 / 1609.344).toFixed(1) : '0.0';

export function analyzeTrack(points) {
  const legs = []; const rejected = []; const reasons = Object.create(null);
  let previous = null; let longest = 0n; let gaps = 0; let breaks = 0; let invalid = 0;
  const valid = p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
  for (const p of points) {
    if (!p.accepted) {
      reasons[p.rejection || 'unspecified'] = (reasons[p.rejection || 'unspecified'] || 0) + 1;
      if (valid(p)) rejected.push(p);
      continue;
    }
    if (!valid(p) || !/^[0-9]{1,19}$/.test(p.monotonic_ns)) { invalid++; previous = null; continue; }
    const delta = previous && previous.segment === p.segment ? (BigInt(p.monotonic_ns) - BigInt(previous.monotonic_ns)) / 1000000n : null;
    if (delta !== null && delta > 0n && delta > longest) longest = delta;
    if (previous && previous.segment !== p.segment) breaks++;
    if (delta !== null && delta > 30000n) gaps++;
    if (!previous || previous.segment !== p.segment || delta === null || delta <= 0n || delta > 30000n) legs.push([]);
    legs.at(-1).push(p); previous = p;
  }
  const accepted = points.filter(p => p.accepted).length;
  return { legs, rejected, reasons, accepted, rejectedCount: points.length - accepted, longestSeconds: Number(longest) / 1000, gaps, breaks, invalid };
}

export function mapCoordinates(route, showRejected) {
  const accepted = route.legs.flat();
  const anchor = (accepted[0] || route.rejected[0])?.longitude || 0;
  const project = p => [Math.max(-85.05112878, Math.min(85.05112878, p.latitude)), anchor + ((((p.longitude - anchor) % 360) + 540) % 360) - 180];
  return { legs: route.legs.map(leg => leg.map(project)), rejected: showRejected ? route.rejected.map(project) : [] };
}
