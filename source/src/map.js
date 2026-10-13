/* ===== Map (Singapore + Seoul preview) ===== */
const projSeoul = (lat, lon) => [(lon - GEO.seoul.W0) * GEO.seoul.K * GEO.seoul.cos, (GEO.seoul.N0 - lat) * GEO.seoul.K];
const ISLAND = [40, 28, 940, 568];
const NTU_BOX = (() => { const a = projSG(1.3575, 103.676), b = projSG(1.3395, 103.6935); return [a[0], a[1], b[0], b[1]]; })();
const SEOUL_BOX = (() => { const a = projSeoul(37.70, 126.77), b = projSeoul(37.43, 127.18); return [a[0], a[1], b[0], b[1]]; })();
const CITY_GEO = {
  sg: { proj: projSG, regions: () => Object.values(GEO.sg.regions), outline: () => GEO.sg.outline, context: () => GEO.sg.context, box: ISLAND, zoom2: ['NTU', NTU_BOX],
    labels: [['West', 1.378, 103.712, 'region'], ['North', 1.427, 103.808, 'region'], ['North-East', 1.393, 103.888, 'region'], ['East', 1.352, 103.958, 'region'], ['Central', 1.338, 103.826, 'region'], ['Johor, Malaysia', 1.468, 103.745, 'ctx'], ['Singapore Strait', 1.205, 103.80, 'water'], ['NTU', 1.3585, 103.683, 'brand']] },
  seoul: { proj: projSeoul, regions: () => Object.values(GEO.seoul.regions), outline: () => null, context: () => GEO.seoul.context, river: () => GEO.seoul.river, box: SEOUL_BOX, zoom2: null,
    labels: [['Gangnam', 37.497, 127.045, 'region'], ['Mapo', 37.560, 126.905, 'region'], ['Nowon', 37.650, 127.070, 'region'], ['Jongno', 37.592, 126.985, 'region'], ['Gangseo', 37.558, 126.835, 'region'], ['Songpa', 37.503, 127.115, 'region'], ['Han River', 37.522, 126.958, 'water'], ['Gyeonggi-do', 37.705, 126.80, 'ctx']] },
};

function SgMap({ cityId = 'sg', bins, facilities, intake, selected, onSelect, route, depot, focus, children }) {
  const G = CITY_GEO[cityId]; const P = G.proj;
  const wrap = useRef(); const svgRef = useRef(); const lastSize = useRef(null);
  const [size, setSize] = useState(null); const [vb, setVb] = useState(null);
  const ptrs = useRef(new Map()); const g = useRef(null); const [drag, setDrag] = useState(false);
  const fitBox = (box, sz) => { const pad = 0.05; let w = (box[2] - box[0]) * (1 + pad * 2), h = (box[3] - box[1]) * (1 + pad * 2); const ar = sz.w / sz.h; if (w / h < ar) w = h * ar; else h = w / ar; const cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2; return { x: cx - w / 2, y: cy - h / 2, w, h }; };
  useEffect(() => { const ro = new ResizeObserver(([e]) => { const r = e.contentRect; if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height }); }); ro.observe(wrap.current); return () => ro.disconnect(); }, []);
  useEffect(() => { if (!size) return; const prev = lastSize.current; lastSize.current = size;
    setVb(v => { if (!v || !prev) return fitBox(G.box, size); const k = prev.w / v.w; const cx = v.x + v.w / 2, cy = v.y + v.h / 2; const w = size.w / k, h = size.h / k; return { x: cx - w / 2, y: cy - h / 2, w, h }; }); }, [size && size.w, size && size.h]);
  useEffect(() => { if (size) setVb(fitBox(G.box, size)); }, [cityId]);
  useEffect(() => { if (!size || !focus) return;
    if (focus.box) setVb(fitBox(focus.box, size));
    else if (focus.lat) { const [x, y] = P(focus.lat, focus.lon); setVb(v => { const w = Math.min(v ? v.w : 400, focus.w || 220); const h = w * size.h / size.w; return { x: x - w / 2, y: y - h / 2, w, h }; }); } }, [focus && focus.key, size && size.w > 0]);
  const zoomAt = (factor, cx, cy) => setVb(v => { const nw = clamp(v.w / factor, 26, 1600); const f = nw / v.w; const px = v.x + cx * v.w, py = v.y + cy * v.h; return { x: px - cx * nw, y: py - cy * v.h * f, w: nw, h: v.h * f }; });
  const local = e => { const r = svgRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, rw: r.width, rh: r.height }; };
  const onDown = e => { if (e.button && e.button !== 0) return; ptrs.current.set(e.pointerId, local(e)); const pts = [...ptrs.current.values()];
    if (pts.length === 1) g.current = { t: 'pan', s: pts[0], v: vb, moved: false };
    else if (pts.length === 2) { const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); g.current = { t: 'pinch', d, v: vb, c: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } }; } };
  const onMove = e => { if (!ptrs.current.has(e.pointerId) || !g.current) return; const p = local(e); ptrs.current.set(e.pointerId, p); const Gs = g.current;
    if (Gs.t === 'pan') { const dx = p.x - Gs.s.x, dy = p.y - Gs.s.y; if (!Gs.moved && Math.hypot(dx, dy) > 5) { Gs.moved = true; setDrag(true); try { svgRef.current.setPointerCapture(e.pointerId); } catch { } }
      if (Gs.moved) setVb({ ...Gs.v, x: Gs.v.x - dx * Gs.v.w / p.rw, y: Gs.v.y - dy * Gs.v.h / p.rh }); }
    else { const pts = [...ptrs.current.values()]; if (pts.length < 2) return; const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); const nw = clamp(Gs.v.w / (d / Gs.d), 26, 1600); const s = nw / Gs.v.w;
      const cx = Gs.c.x / p.rw, cy = Gs.c.y / p.rh; const px = Gs.v.x + cx * Gs.v.w, py = Gs.v.y + cy * Gs.v.h; setVb({ x: px - cx * nw, y: py - cy * Gs.v.h * s, w: nw, h: Gs.v.h * s }); } };
  const onUp = e => { ptrs.current.delete(e.pointerId); if (ptrs.current.size === 0) { g.current = null; setDrag(false); } else if (g.current?.t === 'pinch') { const p = [...ptrs.current.values()][0]; g.current = { t: 'pan', s: p, v: vb, moved: true }; } };
  const onWheel = e => { e.preventDefault(); const p = local(e); zoomAt(e.deltaY < 0 ? 1.25 : 0.8, p.x / p.rw, p.y / p.rh); };
  useEffect(() => { const el = svgRef.current; if (!el) return; el.addEventListener('wheel', onWheel, { passive: false }); return () => el.removeEventListener('wheel', onWheel); });
  const k = size && vb ? size.w / vb.w : 1; const showLabels = k > 3.2;
  const routePts = route && route.length > 1 ? route.map(p => P(p.lat, p.lon)) : null;
  const LS = { region: n => `fill:var(--ink-3);opacity:.55;font:700 ${13 / k}px var(--f-display);letter-spacing:${2.4 / k}px;text-transform:uppercase`, ctx: () => `fill:var(--ink-3);font-style:italic;font-size:${12 / k}px`, water: () => `fill:var(--info);opacity:.65;font-style:italic;font-size:${12 / k}px`, brand: () => `fill:var(--brand);font-weight:800;font-size:${12 / k}px;letter-spacing:${1.5 / k}px` };
  return html`<div class="mapcard" ref=${wrap}>
    ${vb && html`<svg ref=${svgRef} class=${'map' + (drag ? ' dragging' : '')} viewBox=${`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid meet"
      onPointerDown=${onDown} onPointerMove=${onMove} onPointerUp=${onUp} onPointerCancel=${onUp} role="img" aria-label=${cityId === 'sg' ? 'Map of Singapore collection points and BSF facilities' : 'Map of Seoul collection points (preview)'}>
      <defs><pattern id="ctxhatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="var(--land-ctx)"/><path d="M0 0v8" stroke="var(--land-line)" stroke-width="1" opacity=".35"/></pattern></defs>
      <rect x=${vb.x - 3000} y=${vb.y - 3000} width=${vb.w + 6000} height=${vb.h + 6000} fill="var(--water)"/>
      <path d=${G.context()} fill="url(#ctxhatch)" stroke="var(--land-line)" stroke-width="1" vector-effect="non-scaling-stroke" opacity=".9"/>
      ${G.regions().map(d => html`<path d=${d} fill="var(--land)" stroke="var(--land-line)" stroke-width="1" vector-effect="non-scaling-stroke" stroke-dasharray="4 4" opacity=".95"/>`)}
      ${G.outline() && html`<path d=${G.outline()} fill="none" stroke="var(--land-line)" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>`}
      ${G.river && html`<path d=${G.river()} fill="none" stroke="var(--water-2)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d=${G.river()} fill="none" stroke="var(--water)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>`}
      <g>${G.labels.filter(l => l[3] !== 'brand' || k > 1.4).map(([n, la, lo, t]) => { const [x, y] = P(la, lo); return html`<text x=${x} y=${y} text-anchor="middle" style=${LS[t]()} pointer-events="none">${n}</text>`; })}</g>
      ${routePts && html`<g><polyline points=${routePts.map(p => p.join(',')).join(' ')} fill="none" stroke="var(--brand)" stroke-opacity=".22" stroke-width=${9 / k} stroke-linecap="round" stroke-linejoin="round"/>
        <polyline class="route-line" points=${routePts.map(p => p.join(',')).join(' ')} stroke-width=${3.2 / k} style=${`stroke-dasharray:${10 / k} ${7 / k};--dash:${17 / k}`}/></g>`}
      ${depot && (() => { const [x, y] = P(depot.lat, depot.lon); return html`<g transform=${`translate(${x} ${y}) scale(${1 / k})`}><rect x="-9" y="-9" width="18" height="18" rx="5" fill="var(--ink)"/><path d="M-4 1l4-4 4 4M0-3v7" stroke="var(--bg)" stroke-width="2" fill="none" stroke-linecap="round"/><text class="pin-label" x="13" y="4" style="font-size:12px">${depot.name}</text></g>`; })()}
      ${facilities.map(f => { const [x, y] = P(f.lat, f.lon); const rem = Math.max(0, f.dailyQuotaKg - (intake[f.id] || 0)); const sel = selected === f.id; const pr = clamp(1 - rem / f.dailyQuotaKg, 0, 1);
        return html`<g class="pin" transform=${`translate(${x} ${y}) scale(${1 / k})`} onClick=${() => onSelect(f.id)} onMouseEnter=${tipOn(`${f.name} · ${fmt(rem)} kg open`)} onMouseLeave=${tipOff}>
          ${sel && html`<circle r="24" fill="var(--kaya)" opacity=".25"/>`}
          <rect x="-15" y="-15" width="30" height="30" rx="9" fill="#F2B13B" stroke="#7A4A06" stroke-width="1.5"/>
          <g transform="rotate(-18)"><rect x="-8.5" y="-3.6" width="17" height="7.2" rx="3.6" fill="#FFF3D1" stroke="#7A4A06" stroke-width="1"/><path d="M-4 -3.4v6.8M0 -3.6v7.2M4 -3.4v6.8" stroke="#B8893A" stroke-width=".9"/><circle cx="6.4" cy="0" r="1.5" fill="#3A2A12"/></g>
          <rect x="-15" y="19" width="30" height="5" rx="2.5" fill="var(--surface)" stroke="var(--line-2)" stroke-width=".8"/><rect x="-15" y="19" width=${30 * pr} height="5" rx="2.5" fill=${pr >= 1 ? 'var(--ink-3)' : 'var(--brand)'}/>
          ${(k > 1.6 || sel) && html`<text class="pin-label" x="20" y="-4" style="font-size:12.5px">${f.name}</text><text class="pin-label" x="20" y="11" style="font-size:11px;font-weight:600;fill:var(--ink-2)">${rem > 0 ? fmt(rem) + ' kg open' : 'Full today'}</text>`}</g>`; })}
      ${bins.map(b => { const [x, y] = P(b.lat, b.lon); const st = STATUS[b.status]; const sel = selected === b.id; const r = 10, C = 2 * Math.PI * r; const dim = b.p < READY;
        return html`<g class="pin" transform=${`translate(${x} ${y}) scale(${1 / k})`} onClick=${() => onSelect(b.id)} onMouseEnter=${tipOn(`${b.name} · ${pct(b.p)} full`)} onMouseLeave=${tipOff} opacity=${dim && !sel ? 0.75 : 1}>
          ${b.status === 'overflow' && html`<circle class="overflow-ring" r="13" fill="none" stroke="var(--crit)" stroke-width="2"/>`}
          ${sel && html`<circle r="21" fill=${st.color} opacity=".2"/>`}
          <circle r="13.5" fill="var(--surface)" stroke=${sel ? 'var(--ink)' : 'var(--line-2)'} stroke-width=${sel ? 2 : 1}/>
          <circle r=${r} fill="none" stroke="var(--surface-3)" stroke-width="3.6"/>
          <circle r=${r} fill="none" stroke=${st.color} stroke-width="3.6" stroke-dasharray=${`${C * clamp(b.p, 0, 1)} ${C}`} transform="rotate(-90)" stroke-linecap="round"/>
          <circle r="4.2" fill=${st.color}/>
          ${(showLabels || sel) && html`<text class="pin-label" x="18" y="4.5" style="font-size:12.5px">${b.name.replace(' Food Centre', '').replace(' Market & Food Centre', '').replace(' RFID bins', '')} · ${pct(b.p)}</text>`}</g>`; })}
      ${routePts && route.slice(1, -1).map((s, i) => { const [x, y] = P(s.lat, s.lon); return html`<g transform=${`translate(${x} ${y}) scale(${1 / k})`} style="pointer-events:none"><circle cx="11" cy="-11" r="9" fill="var(--brand)" stroke="var(--surface)" stroke-width="2"/><text x="11" y="-7.2" text-anchor="middle" style="font:800 11px var(--f-display);fill:var(--brand-ink)">${i + 1}</text></g>`; })}
    </svg>`}
    ${children}
    <div class="map-ui br"><div class="zoom">
      <button aria-label="Zoom in" onClick=${() => zoomAt(1.5, 0.5, 0.5)}>${Ic.plus()}</button>
      <button aria-label="Zoom out" onClick=${() => zoomAt(1 / 1.5, 0.5, 0.5)}>${Ic.minus()}</button>
      <button aria-label="Show the whole city" title="Whole city" onClick=${() => size && setVb(fitBox(G.box, size))}>${Ic.target()}</button>
      ${G.zoom2 && html`<button aria-label="Zoom to NTU" title="NTU campus" onClick=${() => size && setVb(fitBox(G.zoom2[1], size))} style="font:800 10px var(--f-display)">NTU</button>`}</div></div>
  </div>`;
}

function useCity(c) {
  const { D } = c;
  return useMemo(() => ({ id: REGIONS[REG].city, bins: D.bins, facilities: D.facilities, intake: D.intake, depots: depots(), zones: zonesOf(), byId: id => D.binById[id] || D.facById[id] }), [D, REG]);
}

function MapView({ c, params }) {
  const { D, role } = c;
  const canRoute = role === 'collector';
  const city = useCity(c); const cityId = city.id;
  const [showAll, setShowAll] = useState(role === 'contributor');
  const [zone, setZone] = useState('All');
  const [showFac, setShowFac] = useState(true);
  const [tab, setTab] = useState(params?.tab === 'route' && canRoute ? 'route' : canRoute ? 'route' : 'capacity');
  const [sel, setSel] = useState(params?.select || null);
  const [focus, setFocus] = useState(null);
  const [plan, setPlan] = useState(null);
  useEffect(() => { if (params?.tab && (params.tab !== 'route' || canRoute)) setTab(params.tab); if (params?.select) { setSel(params.select); const b = D.binById[params.select] || D.facById[params.select]; if (b) setFocus({ lat: b.lat, lon: b.lon, w: 160, key: 'p' + Date.now() }); } }, [params]);
  useEffect(() => { setTab(canRoute ? 'route' : 'capacity'); setShowAll(role === 'contributor'); }, [role]);
  useEffect(() => { setSel(null); setPlan(null); setZone('All'); setFocus(null); }, [cityId]);
  const active = D.activePickup;
  const zoneBins = city.bins.filter(b => zone === 'All' || b.zone === zone);
  const visible = zoneBins.filter(b => showAll || b.p >= READY || b.id === sel);
  const listBins = zoneBins.filter(b => showAll || b.p >= READY).sort((a, b) => b.p - a.p);
  const ready = city.bins.filter(b => b.p >= READY).length;
  const routePts = active ? [D.depotFor(active.depot), ...active.stops.map(s => D.binById[s.binId]).filter(Boolean), D.facById[active.facilityId]].filter(Boolean)
    : plan && !plan.empty && plan.city === cityId ? [plan.depot, ...plan.seq, plan.fac] : null;
  const depot = active ? D.depotFor(active.depot) : plan && !plan.empty && plan.city === cityId ? plan.depot : null;
  const selItem = sel && city.byId(sel); const selIsFac = selItem && city.facilities.some(f => f.id === sel);
  const P = CITY_GEO[cityId].proj;
  const focusZone = z => { setZone(z); if (z === 'All') return setFocus({ box: CITY_GEO[cityId].box, key: 'z' + Date.now() }); if (z === 'NTU') return setFocus({ box: NTU_BOX, key: 'z' + Date.now() });
    const zb = city.bins.filter(b => b.zone === z); if (zb.length) { const ps = zb.map(b => P(b.lat, b.lon)); const xs = ps.map(p => p[0]), ys = ps.map(p => p[1]); setFocus({ box: [Math.min(...xs) - 40, Math.min(...ys) - 40, Math.max(...xs) + 40, Math.max(...ys) + 40], key: 'z' + Date.now() }); } };
  const tabs = canRoute ? [['route', active ? 'Active route' : 'Route planner'], ['bins', 'Collection points']] : [['capacity', 'Live capacity'], ['bins', 'Collection points']];
  return html`<div class="mapwrap">
    <${SgMap} cityId=${cityId} bins=${visible} facilities=${showFac ? city.facilities : []} intake=${city.intake} selected=${sel} onSelect=${id => { setSel(id); if (tab !== 'bins' && !(canRoute && (plan || active))) setTab('bins'); }} route=${routePts} depot=${depot} focus=${focus}>
      <div class="map-ui tl">
        <span class="chip" style="pointer-events:none">${R_().flag} ${R_().name}</span>
        <${Seg} label="Bins shown" value=${showAll ? 'all' : 'ready'} onChange=${v => setShowAll(v === 'all')} options=${[['ready', `≥80% (${ready})`], ['all', 'All']]}/>
        <button class="chip" aria-pressed=${showFac} onClick=${() => setShowFac(!showFac)}>${Ic.layers()} <span class="hide-xs">BSF facilities</span></button>
      </div>
      <div class="map-ui bl"><div class="legend"><span><i style="background:var(--crit)"></i>Overflowing</span><span><i style="background:var(--warn)"></i>Ready ≥80%</span>${showAll && html`<span><i style="background:var(--good)"></i>Filling</span>`}<span><i style="background:var(--kaya);border-radius:3px"></i>BSF facility</span></div></div>
    </${SgMap}>
    <div class="panel">
      <div class="chips scroll">${['All', ...city.zones].map(z => html`<button class="chip" aria-pressed=${zone === z} onClick=${() => focusZone(z)}>${z === 'All' ? 'All ' + R_().name : z}</button>`)}</div>
      ${selItem && !selIsFac && html`<${BinDetail} c=${c} b=${selItem} preview=${false} onClose=${() => setSel(null)}/>`}
      ${selItem && selIsFac && html`<${FacDetail} c=${c} f=${selItem} intake=${city.intake} preview=${false} onClose=${() => setSel(null)}/>`}
      <${Seg} label="Panel" value=${tab} onChange=${setTab} options=${tabs}/>
      ${tab === 'capacity' && html`<${LiveCapacity} c=${c} bins=${city.bins} city=${city}/>`}
      ${tab === 'bins' && html`<div class="card" style="padding:14px 16px">
          <div class="row wrap" style="gap:6px;margin-bottom:6px"><span class="pill crit">${zoneBins.filter(b => b.status === 'overflow').length} overflowing</span><span class="pill warn">${zoneBins.filter(b => b.status === 'ready').length} ready</span><span class="pill neutral">${zoneBins.filter(b => b.status === 'held').length} held</span>${showAll && html`<span class="pill good">${zoneBins.filter(b => b.status === 'filling').length} filling</span>`}</div>
          ${!showAll && html`<p class="tiny faint" style="margin:4px 0 6px">Bins appear here once their sensor reads 80% full. Switch to “All” to see every monitored point.</p>`}
          ${listBins.length ? listBins.map(b => html`<button class="binrow" aria-selected=${sel === b.id} onClick=${() => { setSel(b.id); setFocus({ lat: b.lat, lon: b.lon, w: 160, key: b.id + Date.now() }); }}>
            <${Ring} p=${b.p} size=${42} stroke=${5} color=${STATUS[b.status].color}><text x="21" y="25" text-anchor="middle" style="font:700 10.5px var(--f-mono);fill:var(--ink)">${Math.round(b.p * 100)}</text></${Ring}>
            <div style="min-width:0"><b class="small" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.name}</b><span class="tiny faint">${KIND_LABEL[b.kind] || b.kind} · ${b.zone} · ${fmt(b.kg)} kg</span></div>
            <${StatusPill} status=${b.status}/></button>`) : html`<${Empty} title="No bins at 80% here">Nothing needs collecting in this area right now.</${Empty}>`}</div>`}
      ${tab === 'route' && html`<${RoutePlanner} c=${c} zone=${zone} plan=${plan} setPlan=${setPlan} city=${city}/>`}
      ${canRoute && tab === 'bins' && html`<${SimPanel} c=${c}/>`}
    </div></div>`;
}

function SeoulCard() {
  return html`<div class="card seoulcard"><div class="row between"><div><div class="eyebrow">Why Seoul</div><h3>Seoul, South Korea</h3></div><span style="font-size:26px">🇰🇷</span></div>
    <p class="tiny muted" style="margin-top:4px">Seoul already runs smart weighing bins at scale. Adding BSF facilities turns that collected food waste into feed and fertiliser.</p>
    <div class="seoul-facts">${SEOUL_FACTS.map(([v, t]) => html`<div><b>${v}</b><span>${t}</span></div>`)}</div>
    <a class="tiny" href="https://www.weforum.org/stories/2019/04/south-korea-recycling-food-waste/" target="_blank" rel="noopener" style="color:var(--ink-3)">Source: World Economic Forum</a></div>`;
}

function BinDetail({ c, b, onClose, preview }) {
  const st = STATUS[b.status]; const role = c.role;
  const friendly = b.held ? 'Held until the stall re-sorts it. No pickup yet.' : b.p >= READY ? 'Full enough for pickup. A collector has been alerted.' : `About ${fmt(b.toReady || 0, 1)} h until it needs collecting.`;
  return html`<div class="card lift grow-in" style="padding:16px"><div class="row" style="align-items:flex-start">
      <div style="width:56px;flex:none">${Art.bin(b.p)}</div>
      <div class="grow stack" style="gap:4px"><div class="row between" style="align-items:flex-start"><div><div class="eyebrow">${KIND_LABEL[b.kind] || (b.kind === 'rfid' ? 'RFID apartment bins' : b.kind)} · ${b.zone}</div><h3>${b.name}</h3></div><button class="icon-btn" style="width:32px;height:32px" aria-label="Close details" onClick=${onClose}>${Ic.close()}</button></div>
        <div class="row wrap"><span class="num" style="font-size:24px;font-weight:600">${pct(b.p)}</span><span class=${'pill ' + st.cls}>${st.label}</span></div>
        <${Bar} p=${b.p} cls=${b.p >= 0.98 ? 'crit' : b.p >= READY ? 'warn' : ''}/></div></div>
    ${role === 'collector' || role === 'contributor' ? html`<table class="t" style="margin-top:10px;font-size:13.5px"><tbody>
      <tr><td class="muted">Waste in bin</td><td class="r num">${fmt(b.kg)} / ${fmt(b.capacityKg)} kg</td></tr>
      ${!preview && html`<tr><td class="muted">Fill rate</td><td class="r num">${fmt(b.ratePerHr, 1)} kg/h${b.p < READY ? ` · ready in ${fmt(b.toReady, 1)} h` : ''}</td></tr>`}
      <tr><td class="muted">Contamination (lid camera)</td><td class="r num" style=${b.held ? 'color:var(--crit)' : ''}>${fmt(b.contamPct, 1)}%</td></tr>
      ${!preview && html`<tr><td class="muted">Bin temperature</td><td class="r num" style=${b.tempC > 36 ? 'color:var(--warn)' : ''}>${fmt(b.tempC, 1)} °C</td></tr><tr><td class="muted">Last emptied</td><td class="r">${ago(b.lastEmptiedAt, c.now)}</td></tr>`}
      <tr><td class="muted">Sensor</td><td class="r">${b.sensor}</td></tr></tbody></table>`
      : html`<div class="friendly"><span>${Ic.info()}</span><div><b class="small">${fmt(b.kg)} of ${fmt(b.capacityKg)} kg</b><div class="tiny muted">${friendly}</div></div></div>`}
    ${b.held && role !== 'buyer' && html`<div class="row small" style="margin-top:10px;padding:10px;border-radius:12px;background:var(--crit-soft);color:var(--crit)"><span style="width:18px;flex:none">${Ic.alert()}</span><span><b>Held from routes.</b> Over ${CONTAM_LIMIT}% non-food.</span><${RTag} r="Reject"/></div>`}
    ${!preview && role === 'contributor' && html`<div class="row wrap" style="margin-top:12px"><button class="btn sm primary" onClick=${() => c.open('drop', { binId: b.id })}>${Ic.plus()} Log drop-off here</button></div>`}
    ${!preview && role === 'collector' && b.p >= READY && !b.held && html`<div class="tiny faint" style="margin-top:10px">Included automatically when you plan a route.</div>`}
    ${preview && html`<div class="tiny faint" style="margin-top:10px">Preview data for the Seoul expansion. Actions are only available in Singapore.</div>`}</div>`;
}

function FacDetail({ c, f, onClose, intake, preview }) {
  const got = (intake || c.D.intake)[f.id] || 0; const rem = Math.max(0, f.dailyQuotaKg - got);
  return html`<div class="card lift grow-in" style="padding:16px"><div class="row" style="align-items:flex-start"><div class="fac-art">${Art.factory()}</div>
    <div class="grow"><div class="eyebrow">BSF facility · ${f.area}</div><h3>${f.name}</h3><div class="small muted">${fmt(rem)} kg still needed today · ${f.window}</div></div>
    <button class="icon-btn" style="width:32px;height:32px" aria-label="Close details" onClick=${onClose}>${Ic.close()}</button></div>
    <div style="margin-top:10px"><${Bar} p=${got / f.dailyQuotaKg}/></div>
    <div class="chips" style="margin-top:10px">${f.accepts.map(a => html`<span class="pill neutral">${ACCEPT_LABEL[a]}</span>`)}${f.urgent && html`<span class="pill crit">Urgent need</span>`}</div>
    ${!preview && html`<div class="row wrap" style="margin-top:12px">${ROLE_NAV[c.role].includes('quotas') && html`<button class="btn sm" onClick=${() => c.go('quotas')}>${Ic.gauge()} Quota details</button>`}${ROLE_NAV[c.role].includes('market') && html`<button class="btn sm" onClick=${() => c.go('market', { facility: f.id })}>${Ic.bag()} Their products</button>`}</div>`}
    ${preview && html`<div class="tiny faint" style="margin-top:10px">Proposed facility for the Seoul preview.</div>`}</div>`;
}

function SimPanel({ c }) {
  const [busy, setBusy] = useState(false);
  const run = async k => { setBusy(true); await c.act.simulate(k); setBusy(false); };
  return html`<div class="card" style="padding:14px 16px;background:var(--surface-2)"><div class="row between"><div><div class="eyebrow">Sensor simulator</div><div class="small muted">Prototype only: move the clock to see bins cross 80%.</div></div><${RTag} r="Redesign"/></div>
    <div class="row wrap" style="margin-top:10px"><button class="btn sm" disabled=${busy} onClick=${() => run('hour')}>${Ic.ff()} +1 hour</button><button class="btn sm" disabled=${busy} onClick=${() => run('lunch')}>${Ic.clock()} Lunch rush</button><button class="btn sm ghost" disabled=${busy} onClick=${() => run('morning')}>${Ic.refresh()} Reset to morning</button></div></div>`;
}

function RoutePlanner({ c, zone, plan, setPlan, city }) {
  const { D, role, persona } = c; const isSG = true;
  const active = D.activePickup;
  const defDepot = () => (zone !== 'All' ? city.depots.find(d => d.zone === zone)?.id : null) || persona.depot || city.depots[0].id;
  const [depot, setDepot] = useState(defDepot());
  const [area, setArea] = useState(zone);
  const [cap, setCap] = useState(1000);
  useEffect(() => { setDepot(defDepot()); setArea('All'); }, [city.id]);
  useEffect(() => { setArea(zone); if (zone !== 'All') { const d = city.depots.find(x => x.zone === zone); if (d) setDepot(d.id); } }, [zone]);
  if (active) return html`<div class="card"><div class="card-h"><div><div class="eyebrow">Active route</div><h3>${active.stops.filter(s => s.done).length} of ${active.stops.length} collected</h3></div><${RTag} r="Reduce"/></div><${ActiveRoute} c=${c} p=${active}/></div>`;
  const dep = city.depots.find(d => d.id === depot) || city.depots[0];
  const run = () => setPlan({ ...planRoute({ depot: dep, capacity: cap, zone: area, bins: city.bins, facilities: city.facilities, intake: city.intake }), depot: dep, area, cap, city: city.id, at: Date.now() });
  const p = plan && plan.city === city.id ? plan : null;
  const savedKm = p && !p.empty ? p.baselineKm - p.km : 0;
  return html`<div class="card"><div class="card-h"><div><div class="eyebrow">Smart route${isSG ? '' : ' · Seoul preview'}</div><h3>Plan from live bin levels</h3></div><${RTag} r="Reduce"/></div>
    <div class="grid g2" style="gap:12px">
      <div class="field"><label for="rp-depot">Start from</label><select id="rp-depot" class="input" value=${depot} onChange=${e => { setDepot(e.target.value); setPlan(null); }}>${city.depots.map(d => html`<option value=${d.id}>${d.name}</option>`)}</select></div>
      <div class="field"><label for="rp-area">Service area</label><select id="rp-area" class="input" value=${area} onChange=${e => { setArea(e.target.value); setPlan(null); }}>${['All', ...city.zones].map(z => html`<option value=${z}>${z === 'All' ? 'Whole city' : z}</option>`)}</select></div></div>
    <div class="field" style="margin-top:12px"><label for="rp-cap">Van capacity: <span class="num">${fmt(cap)} kg</span></label><input id="rp-cap" type="range" min="200" max="2500" step="50" value=${cap} onInput=${e => { setCap(+e.target.value); setPlan(null); }}/></div>
    <button class="btn primary block" style="margin-top:14px" onClick=${run}>${Ic.route()} Plan route</button>
    ${p && p.empty && html`<div style="margin-top:12px"><${Empty} title="Nothing to collect yet">No bin in this area is at 80% and clean enough to collect. Try another area${isSG ? ' or use the sensor simulator' : ''}.</${Empty}></div>`}
    ${p && !p.empty && html`<div class="stack grow-in" style="margin-top:16px;gap:14px">
      <div class="savings"><div><b>${p.seq.length}</b><span>stops</span></div><div><b>${fmt(p.load)} kg</b><span>load · ${pct(p.load / p.cap)} of van</span></div><div><b>${fmt(p.km, 1)} km</b><span>~${fmt(p.minutes)} min</span></div></div>
      <div class="compare"><div class="row between"><span>Smart route</span><b class="num">${fmt(p.km, 1)} km</b></div><${Bar} p=${p.km / p.baselineKm}/>
        <div class="row between"><span>Fixed daily round (all ${p.baselineStops} bins)</span><b class="num">${fmt(p.baselineKm, 1)} km</b></div><${Bar} p=${1} cls="warn"/>
        <div class="small" style="color:var(--good);font-weight:700">${fmt(savedKm, 1)} km shorter · ${fmt(savedKm * VAN_CO2_PER_KM, 1)} kg CO₂e avoided</div></div>
      <div class="stops">
        <div class="stop"><span class="n" style="background:var(--ink);color:var(--bg)">${Ic.truck()}</span><div><b class="small">${p.depot.name}</b></div><span></span></div>
        ${p.seq.map((b, i) => html`<div class="stop"><span class="n">${i + 1}</span><div style="min-width:0"><b class="small nm">${b.name}</b><div class="tiny faint">${pct(b.p)} · ${fmt(b.kg)} kg</div></div><${StatusPill} status=${b.status}/></div>`)}
        <div class="stop fac"><span class="n">${Ic.check()}</span><div><b class="small">${p.fac.name}</b><div class="tiny faint">${fmt(p.fac.remaining)} kg open today${p.fac.urgent ? ' · urgent need' : ''}</div></div><span class="pill kaya">Drop-off</span></div></div>
      ${p.split && html`<div class="small" style="color:var(--warn)">No facility can take the full load today. Ending at the one with the most room.</div>`}
      ${p.leftover.length > 0 && html`<div class="small muted">${p.leftover.length} more ready bin${p.leftover.length > 1 ? 's' : ''} won't fit in this van. Plan a second run after drop-off.</div>`}
      ${p.heldBins.length > 0 && html`<div class="small muted"><${RTag} r="Reject"/> Skipped ${p.heldBins.map(b => b.name).join(', ')}: too much plastic.</div>`}
      ${isSG ? html`<button class="btn primary block" onClick=${() => c.act.startRoute(p).then(() => setPlan(null))}>${Ic.truck()} Start this route</button>` : html`<div class="tiny faint">Preview only. Routes can be started in Singapore.</div>`}
    </div>`}</div>`;
}
