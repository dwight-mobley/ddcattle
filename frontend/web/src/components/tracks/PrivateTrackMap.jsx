import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { analyzeTrack, mapCoordinates } from './trackGeometry';

export default function PrivateTrackMap({ points }) {
  const container = useRef(null);
  const [layer, setLayer] = useState('topo');
  const [showRejected, setShowRejected] = useState(false);
  const [fit, setFit] = useState(0);
  const [tileError, setTileError] = useState(false);
  const route = useMemo(() => analyzeTrack(points), [points]);
  useEffect(() => {
    const map = L.map(container.current, { preferCanvas: true, maxZoom: 19, scrollWheelZoom: false });
    L.control.scale({ metric: false, imperial: true }).addTo(map);
    const coordinates = mapCoordinates(route, showRejected);
    let tiles;
    if (layer !== 'outline') {
      tiles = L.tileLayer(layer === 'topo'
        ? 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'
        : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, keepBuffer: 0, updateWhenIdle: true,
        attribution: layer === 'topo' ? 'USGS The National Map' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
      tiles.on('tileerror', () => setTileError(true));
      tiles.addTo(map);
    }
    coordinates.legs.forEach(leg => {
      if (leg.length > 1) L.polyline(leg, { color: '#245c7d', weight: 3 }).addTo(map);
      else if (leg.length) L.circleMarker(leg[0], { radius: 3, color: '#245c7d' }).addTo(map);
    });
    coordinates.rejected.forEach((point, index) => {
      const text = document.createElement('span'); text.textContent = `Rejected: ${route.rejected[index].rejection || 'unspecified'}`;
      L.circleMarker(point, { radius: 3, color: '#b56208', fillOpacity: 0.7 }).bindTooltip(text).addTo(map);
    });
    const accepted = coordinates.legs.flat();
    if (accepted.length) {
      L.circleMarker(accepted[0], { radius: 6, color: '#14733d', fillOpacity: 1 }).bindTooltip('Start').addTo(map);
      L.circleMarker(accepted.at(-1), { radius: 6, color: '#b72d2d', fillOpacity: 1 }).bindTooltip('End').addTo(map);
    }
    const visible = [...accepted, ...coordinates.rejected];
    if (visible.length) map.fitBounds(L.latLngBounds(visible), { padding: [25, 25], maxZoom: 18 });
    else map.setView([0, 0], 1);
    const observer = new ResizeObserver(() => map.invalidateSize()); observer.observe(container.current);
    return () => { observer.disconnect(); tiles?.off(); map.remove(); };
  }, [route, layer, showRejected, fit]);
  return <section className="space-y-3">
    <div className="flex flex-wrap gap-3 items-center">
      <label>Map <select className="border rounded p-2" value={layer} onChange={event => { setLayer(event.target.value); setTileError(false); }}><option value="topo">USGS Topo</option><option value="osm">OpenStreetMap</option><option value="outline">Route only (no basemap)</option></select></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={showRejected} onChange={event => setShowRejected(event.target.checked)} />Show rejected fixes</label>
      <button className="border rounded px-3 py-2" onClick={() => { setFit(value => value + 1); setTileError(false); }}>Fit visible points / retry map</button>
    </div>
    <p className="text-sm">Green: start · Red: end · Orange: rejected. Recording pauses and GPS gaps are not connected.</p>
    {tileError && <p role="status">Basemap unavailable. Your route remains visible; use Route only or retry.</p>}
    {!route.legs.length && <p>No accepted route points. Rejected fixes can still be inspected if coordinates are available.</p>}
    <div ref={container} role="region" aria-label="Private recorded ride map" className="h-[420px] w-full rounded border bg-slate-100" style={{ zIndex: 0 }} />
    <p className="text-xs text-charcoal/70">Basemaps send viewed-area tile requests to USGS or OpenStreetMap. Notes and the GPS upload payload are not sent to those providers. No offline map download. Trail access must be checked with the park.</p>
    <p>{points.length} samples · {route.accepted} accepted · {route.rejectedCount} rejected · {route.legs.length} route sections</p>
    <p>{route.gaps} gaps over 30 seconds · {route.breaks} pause/recovery breaks · Longest accepted gap: {route.longestSeconds.toFixed(1)} seconds</p>
    <p>Rejected: {Object.entries(route.reasons).map(([reason, count]) => `${reason}: ${count}`).join(', ') || 'None'}</p>
    {route.invalid > 0 && <p>{route.invalid} invalid accepted points omitted.</p>}
  </section>;
}
