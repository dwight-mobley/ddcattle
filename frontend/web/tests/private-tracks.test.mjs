import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeTrack, mapCoordinates, miles, feet, movingMph } from '../src/components/tracks/trackGeometry.js';
const point = (clock, changes = {}) => ({ accepted: true, segment: 0, monotonic_ns: String(clock), latitude: 34, longitude: -83, rejection: null, ...changes });
test('gaps, rejected clocks and reboot segments never bridge route legs', () => {
  const route = analyzeTrack([point(1000000000n), point(6000000000n), point(1n, { accepted: false, rejection: 'out of order' }), point(40000000000n), point(1n, { segment: 1 }), point(2n, { segment: 1, latitude: null })]);
  assert.equal(route.legs.length, 3); assert.equal(route.gaps, 1); assert.equal(route.breaks, 1);
  assert.equal(route.rejectedCount, 1); assert.equal(route.reasons['out of order'], 1); assert.equal(route.invalid, 1);
});
test('large integer precision and exact millisecond gap threshold match the recorder', () => {
  const start = 9100000000000000000n;
  assert.equal(analyzeTrack([point(start), point(start + 30000000001n)]).legs.length, 1);
  const route = analyzeTrack([point(start), point(start + 30001000000n)]);
  assert.equal(route.legs.length, 2); assert.equal(route.longestSeconds, 30.001);
});
test('dateline wrapping, rejection toggle and missing/invalid points', () => {
  const route = analyzeTrack([point(1n, { longitude: 179 }), point(5000000001n, { longitude: -179 }), point(2n, { accepted: false, latitude: 90, rejection: '__proto__' })]);
  const projected = mapCoordinates(route, false);
  assert.equal(projected.legs[0][1][1] - projected.legs[0][0][1], 2); assert.equal(projected.rejected.length, 0);
  assert.equal(mapCoordinates(route, true).rejected[0][0], 85.05112878); assert.equal(route.reasons.__proto__, 1);
  assert.equal(analyzeTrack([]).legs.length, 0);
});
test('SI display conversion and stationary moving average', () => {
  assert.equal(miles(1609.344), '1.00'); assert.equal(feet(0.3048), '1');
  assert.equal(movingMph({ distance_m: 1609.344, moving_ms: 3600000 }), '1.0');
  assert.equal(movingMph({ distance_m: 0, moving_ms: 0 }), '0.0');
});
