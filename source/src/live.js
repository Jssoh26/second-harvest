/* ===== Upgrades: role rules, scan effect, live impact, capacity view, Seoul preview ===== */
const ROLE_NAV = {
  contributor: ['home', 'map', 'rewards', 'impact'],
  collector: ['home', 'map', 'quotas', 'rewards', 'impact'],
  facility: ['home', 'map', 'quotas', 'market', 'insights', 'impact'],
  buyer: ['home', 'market', 'rewards', 'insights', 'impact'],
};
const ROLE_CAN = {
  contributor: 'Log drop-offs, scan for plastics and earn points',
  collector: 'See full bins, plan routes and deliver to BSF facilities',
  facility: 'Set your daily quota, list products and read buyer feedback',
  buyer: 'Shop frass and feed, match your soil test, redeem points',
};
const ROLE_MAP_NOTE = {
  contributor: 'You can log drop-offs at any bin. Routes are planned by collectors.',
  facility: 'View only. Collectors plan the routes that end at your facility.',
  buyer: 'View only. See where the waste behind your frass and feed comes from.',
};

/* Animated number */
function CountUp({ value, d = 0 }) {
  const [shown, setShown] = useState(value); const prev = useRef(value);
  useEffect(() => {
    const from = prev.current, to = value; prev.current = value; if (from === to) return;
    const t0 = performance.now(), dur = 900; let raf;
    const step = t => { const k = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - k, 3); setShown(from + (to - from) * e); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [value]);
  return html`<span class="num">${fmt(shown, d)}</span>`;
}

/* Role switch notification */
function RoleNote({ note }) {
  if (!note) return null;
  return html`<div class="rolenote" key=${note.id} role="status"><${Avatar} role=${note.role}/>
    <div style="min-width:0"><div class="eyebrow" style="color:var(--brand)">${REGIONS[note.region || 'sg'].flag} ${REGIONS[note.region || 'sg'].name} · ${ROLE_LABEL[note.role]}</div><b>${note.name}</b><div class="tiny muted">${ROLE_CAN[note.role]}</div></div></div>`;
}

/* Lid-camera scan animation */
function ScanView({ state, dirty, contam }) {
  const done = state === 'done'; const clean = done && contam < 5;
  const boxes = [
    { x: 30, y: 58, w: 70, h: 42, l: 'Rice 0.97', ok: true, d: 0.5 },
    { x: 104, y: 44, w: 62, h: 40, l: 'Noodles 0.94', ok: true, d: 0.9 },
    { x: 176, y: 62, w: 58, h: 44, l: 'Veg peel 0.91', ok: true, d: 1.3 },
    ...(dirty ? [{ x: 238, y: 50, w: 52, h: 56, l: 'Plastic 0.88', ok: false, d: 1.6 }, { x: 96, y: 96, w: 92, h: 22, l: 'Chopsticks 0.81', ok: false, d: 1.9 }] : []),
  ];
  return html`<div class=${'scanview' + (done ? ' done' : '')} aria-live="polite">
    <svg viewBox="0 0 320 150" role="img" aria-label=${done ? (clean ? 'Scan complete: clean' : 'Scan complete: contaminants found') : 'Scanning bin contents'}>
      <defs><radialGradient id="vign" cx="50%" cy="50%" r="70%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".55"/></radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CFFB0" stop-opacity="0"/><stop offset=".85" stop-color="#7CFFB0" stop-opacity=".35"/><stop offset="1" stop-color="#7CFFB0" stop-opacity=".95"/></linearGradient></defs>
      <rect width="320" height="150" fill="#1A2A1F"/>
      <ellipse cx="160" cy="88" rx="150" ry="58" fill="#2B3B2E"/>
      <ellipse cx="66" cy="80" rx="34" ry="18" fill="#F4ECD6"/><g fill="#EADFC2">${[0, 1, 2, 3, 4, 5, 6].map(i => html`<ellipse cx=${44 + i * 7} cy=${76 + (i % 3) * 4} rx="3" ry="1.6"/>`)}</g>
      <path d="M110 66c8-10 14 6 22-4s14 6 22-4M112 74c8-10 14 6 22-4s14 6 22-4" stroke="#F2C14E" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M182 92c4-16 22-24 46-18-6 16-24 24-46 18z" fill="#7BC24F"/><path d="M190 80c10 4 20 2 30-4" stroke="#3E7A2B" stroke-width="1.4" fill="none"/>
      <path d="M200 70c8-6 18-6 26 0" stroke="#E9A23B" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${dirty && html`<g><path d="M246 42h36l-5 56h-26z" fill="#CFE6F2" opacity=".85" stroke="#9CC5DA"/><rect x="244" y="38" width="40" height="7" rx="2" fill="#E8F4FA"/><path d="M100 108l84-6M100 114l84-4" stroke="#B88A55" stroke-width="3" stroke-linecap="round"/></g>`}
      <rect width="320" height="150" fill="url(#vign)"/>
      <g class="scanbeam"><rect x="0" y="-40" width="320" height="40" fill="url(#beam)"/><rect x="0" y="-1" width="320" height="2" fill="#B9FFD4"/></g>
      ${boxes.map(b => html`<g class="detbox" style=${`animation-delay:${b.d}s`}><rect x=${b.x} y=${b.y} width=${b.w} height=${b.h} rx="4" fill="none" stroke=${b.ok ? '#7CFFB0' : '#FF7A62'} stroke-width="1.8"/>
        <rect x=${b.x} y=${b.y - 13} width=${b.l.length * 5.6 + 8} height="12" rx="3" fill=${b.ok ? '#7CFFB0' : '#FF7A62'}/><text x=${b.x + 4} y=${b.y - 4} style="font:700 9px var(--f-mono);fill:#0B1510">${b.l}</text></g>`)}
      <path d="M10 22V10h12M298 10h12v12M310 128v12h-12M22 140H10v-12" stroke="#E6F0E7" stroke-width="2" fill="none" opacity=".8"/>
      <circle cx="22" cy="24" r="3.5" fill="#FF5A47" class="recdot"/><text x="30" y="27.5" style="font:600 9px var(--f-mono);fill:#E6F0E7">LID CAM 02</text>
      <text x="300" y="27.5" text-anchor="end" style="font:600 9px var(--f-mono);fill:#E6F0E7">${done ? 'ANALYSED' : 'SCANNING…'}</text>
      ${done && html`<g class="verdict"><rect x="90" y="110" width="140" height="32" rx="10" fill=${clean ? '#1C6B43' : '#C93C25'} opacity=".94"/>
        <text x="160" y="124" text-anchor="middle" style="font:800 12.5px var(--f-display);fill:#fff">${clean ? '✓ CLEAN' : '! SORT AGAIN'}</text>
        <text x="160" y="137" text-anchor="middle" style="font:600 9.5px var(--f-mono);fill:#fff">${contam}% non-food</text></g>`}
    </svg>
    ${!done && html`<div class="scanprog"><i></i></div>`}
  </div>`;
}

/* Impact burst shown after a drop-off or delivery */
function impactBurst(kg, pts, label) {
  const parts = [['Larvae', kg * BSF.larvae, 'var(--kaya)'], ['Frass', kg * BSF.frass, 'var(--leaf)']];
  const mx = Math.max(...parts.map(p => p[1]), 0.01);
  return html`<div class="burst"><div class="row" style="gap:8px"><${Coin}/><b>+${pts} points</b><span class="tiny" style="opacity:.75">· ${label}</span></div>
    <div class="tiny" style="opacity:.85;margin-top:4px">${fmt(kg)} kg kept out of the incinerator becomes about</div>
    ${parts.map(([n, v, c]) => html`<div class="burst-row"><span>${n}</span><div class="burst-bar"><i style=${`width:${v / mx * 100}%;background:${c}`}></i></div><b class="num">${fmt(v, 1)} kg</b></div>`)}</div>`;
}

/* ---- Live impact (charts) ---- */
function AreaChart({ pts, h = 74, w = 260, label }) {
  if (!pts.length) return null;
  const mx = Math.max(...pts.map(p => p.v), 1); const x = i => (i / (pts.length - 1)) * w; const y = v => 6 + (h - 12) * (1 - v / mx);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.v).toFixed(1)).join('');
  const last = pts[pts.length - 1];
  return html`<div class="chart"><svg viewBox=${`0 0 ${w} ${h}`} preserveAspectRatio="none" style=${`height:${h}px`} role="img" aria-label=${label}>
    <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--brand)" stop-opacity=".35"/><stop offset="1" stop-color="var(--brand)" stop-opacity="0"/></linearGradient></defs>
    <line x1="0" x2=${w} y1=${h - 6} y2=${h - 6} stroke="var(--line)"/>
    <path d=${line + `L${w} ${h - 6}L0 ${h - 6}Z`} fill="url(#areaG)"/>
    <path d=${line} fill="none" stroke="var(--brand)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    ${pts.map((p, i) => html`<rect x=${x(i) - w / pts.length / 2} y="0" width=${w / pts.length} height=${h} fill="transparent" onMouseEnter=${tipOn(`${p.label}: ${fmt(p.v)} kg`)} onMouseLeave=${tipOff}/>`)}
  </svg><div class="row between tiny faint" style="margin-top:2px"><span>${pts[0].label}</span><span>${last.label}</span></div></div>`;
}
function MiniBars({ pts, h = 74, unit, color = 'var(--brand)' }) {
  const mx = Math.max(...pts.map(p => p.v), 0.1); const w = 260; const bw = w / pts.length;
  return html`<div class="chart"><svg viewBox=${`0 0 ${w} ${h}`} style=${`height:${h}px`} preserveAspectRatio="none" role="img" aria-label="Daily values, last 7 days">
    <line x1="0" x2=${w} y1=${h - 1} y2=${h - 1} stroke="var(--line)"/>
    ${pts.map((p, i) => { const bh = Math.max(p.v > 0 ? 3 : 0, (h - 6) * p.v / mx); return html`<g onMouseEnter=${tipOn(`${p.label}: ${fmt(p.v, 1)} ${unit}`)} onMouseLeave=${tipOff}><rect x=${i * bw} y="0" width=${bw} height=${h} fill="transparent"/>
      <rect x=${i * bw + bw * 0.2} y=${h - 1 - bh} width=${bw * 0.6} height=${bh} rx="3" fill=${i === pts.length - 1 ? 'var(--kaya)' : color}/></g>`; })}
  </svg><div class="row between tiny faint" style="margin-top:2px"><span>${pts[0].label}</span><span>Today</span></div></div>`;
}
function SegBar({ parts, h = 14 }) {
  const tot = sum(parts, p => p[1]) || 1;
  return html`<div class="segbar" style=${`height:${h}px`}>${parts.filter(p => p[1] > 0).map(([l, v, c]) => html`<i style=${`flex:${v / tot};background:${c}`} onMouseEnter=${tipOn(`${l}: ${fmt(v)}`)} onMouseLeave=${tipOff}></i>`)}</div>
    <div class="seglegend">${parts.map(([l, v, c]) => html`<span><i style=${`background:${c}`}></i>${l} <b class="num">${fmt(v)}</b></span>`)}</div>`;
}
function liveSeries(D, now) {
  const hours = Array.from({ length: 24 }, (_, i) => now - (23 - i) * H);
  const recent = D.deliveries.filter(d => d.at > now - 24 * H).sort((a, b) => a.at - b.at);
  let acc = 0, j = 0; const area = hours.map(t => { while (j < recent.length && recent[j].at <= t) acc += recent[j++].kg; return { v: acc, label: timeLabel(t) }; });
  const total24 = sum(recent, d => d.kg);
  const sod = startOfDaySG(now);
  const days = Array.from({ length: 7 }, (_, i) => { const s = sod - (6 - i) * DAY; const ps = D.pickups.filter(p => p.status === 'Delivered' && p.at >= s && p.at < s + DAY); return { v: sum(ps, p => Math.max(0, p.baselineKm - p.km)), label: dayLabel(s + 12 * H) }; });
  const week = sum(D.deliveries.filter(d => d.at > now - 7 * DAY), d => d.kg);
  const feed = [
    ...D.drops.map(d => ({ id: 'd' + d.id, at: d.at, kind: 'drop', t: `${fmt(d.kg)} kg ${WASTE_TYPES[d.type]?.bsf ? 'sorted' : 'sent to recovery'}`, s: D.binById[d.binId]?.name || '' })),
    ...D.deliveries.map(d => ({ id: 'v' + d.id, at: d.at, kind: 'deliver', t: `${fmt(d.kg)} kg delivered`, s: D.facById[d.facilityId]?.name || '' })),
    ...D.orders.map(o => ({ id: 'o' + o.id, at: o.at, kind: 'order', t: `${sum(o.items, i => i.qty)} packs bought back`, s: o.items[0]?.name || '' })),
  ].sort((a, b) => b.at - a.at).slice(0, 5);
  return { area, total24, days, kmWeek: sum(days, d => d.v), week, feed };
}
function LiveImpact({ c }) {
  const { D, now } = c; const L = useMemo(() => liveSeries(D, now), [D, now]);
  const st = ['overflow', 'ready', 'filling', 'held'].map(s => [STATUS[s].label.replace(' ≥80%', ''), D.bins.filter(b => b.status === s).length, STATUS[s].color]);
  const FI = { drop: Ic.bin, deliver: Ic.truck, order: Ic.bag };
  return html`<section class="card live"><div class="card-h"><div><div class="eyebrow row" style="gap:6px"><span class="dot live" style="margin:0"></span>Live impact</div><h2>What the loop did, as it happens</h2></div><button class="btn sm ghost" onClick=${() => c.go('impact')}>All impact ${Ic.chev()}</button></div>
    <div class="live-grid">
      <div class="lt"><div class="lt-k">Diverted to BSF · last 24 h</div><div class="lt-v"><${CountUp} value=${L.total24}/><small>kg</small></div><${AreaChart} pts=${L.area} label="Cumulative kilograms delivered to BSF facilities over the last 24 hours"/></div>
      <div class="lt"><div class="lt-k">What 7 days of waste became</div><div class="lt-v"><${CountUp} value=${L.week * BSF.larvae}/><small>kg larvae</small></div>
        <${SegBar} parts=${[['Larvae protein', L.week * BSF.larvae, 'var(--kaya)'], ['Frass fertiliser', L.week * BSF.frass, 'var(--leaf)'], ['Water & CO₂ released', L.week * (1 - BSF.larvae - BSF.frass), 'var(--line-2)']]}/></div>
      <div class="lt"><div class="lt-k">Km saved by smart routes · 7 days</div><div class="lt-v"><${CountUp} value=${L.kmWeek} d=${1}/><small>km · ${fmt(L.kmWeek * VAN_CO2_PER_KM, 1)} kg CO₂e</small></div><${MiniBars} pts=${L.days} unit="km"/></div>
      <div class="lt"><div class="lt-k">Bin network right now</div><div class="lt-v"><${CountUp} value=${D.bins.length}/><small>smart bins</small></div><${SegBar} parts=${st}/></div>
    </div>
    <div class="feed">${L.feed.map(f => html`<div class="feed-i" key=${f.id}><span class=${'fi ' + f.kind}>${FI[f.kind]()}</span><div style="min-width:0"><b class="small">${f.t}</b><div class="tiny faint" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.s}</div></div><span class="tiny faint">${ago(f.at, now)}</span></div>`)}</div>
  </section>`;
}

/* ---- Read-only capacity view for non-collectors ---- */
function LiveCapacity({ c, bins, city }) {
  const { D, role, persona } = c;
  const st = ['overflow', 'ready', 'filling', 'held'].map(s => [STATUS[s].label.replace(' ≥80%', ''), bins.filter(b => b.status === s).length, STATUS[s].color]);
  const facs = city.facilities;
  const myBin = role === 'contributor' && city.id === 'sg' ? D.binById[persona.binId] : null;
  const space = myBin ? bins.filter(b => b.p < 0.7 && !b.held).sort((a, b) => roadKm(myBin, a) - roadKm(myBin, b)).slice(0, 4) : [];
  return html`<div class="card"><div class="card-h"><div><div class="eyebrow">Live capacity</div><h3>How full is the network?</h3></div><span class="pill neutral">${Ic.info()} View only</span></div>
    <p class="tiny muted" style="margin:-6px 0 12px">${ROLE_MAP_NOTE[role] || ''}</p>
    <${SegBar} parts=${st}/>
    <div class="eyebrow" style="margin:16px 0 8px">BSF facilities · room left today</div>
    ${facs.map(f => { const got = city.intake[f.id] || 0; const room = clamp(1 - got / f.dailyQuotaKg, 0, 1); return html`<div class="hbar" style="grid-template-columns:minmax(100px,150px) minmax(0,1fr) 64px"><span class="small" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${f.name}</span><${Bar} p=${room} cls="kaya" label=${'Room left at ' + f.name}/><span class="num small" style="text-align:right">${fmt(Math.max(0, f.dailyQuotaKg - got))} kg</span></div>`; })}
    ${space.length > 0 && html`<div class="eyebrow" style="margin:16px 0 4px">Bins near you with space</div>${space.map(b => html`<div class="li"><${Ring} p=${b.p} size=${34} stroke=${4} color=${STATUS[b.status].color}/><div class="grow"><b class="small">${b.name}</b><div class="tiny faint">${fmt(roadKm(myBin, b), 1)} km · ${pct(1 - b.p)} space left</div></div></div>`)}`}
  </div>`;
}

/* ---- Seoul preview city (simulated, read-only) ---- */
const SEOUL_BINS = [
  ['gwangjang', 'Gwangjang Market', 'market', 'Jongno', 37.5701, 126.9996], ['namdaemun', 'Namdaemun Market', 'market', 'Jung', 37.5592, 126.9775],
  ['noryangjin', 'Noryangjin Fish Market', 'market', 'Dongjak', 37.5133, 126.9406], ['mangwon', 'Mangwon Market', 'market', 'Mapo', 37.5560, 126.9060],
  ['tongin', 'Tongin Market', 'market', 'Jongno', 37.5806, 126.9701], ['garak', 'Garak Market', 'market', 'Songpa', 37.4930, 127.1106],
  ['gyeongdong', 'Gyeongdong Market', 'market', 'Dongdaemun', 37.5795, 127.0393], ['snu', 'Seoul National University', 'campus', 'Gwanak', 37.4600, 126.9520],
  ['yonsei', 'Yonsei University', 'campus', 'Seodaemun', 37.5658, 126.9386], ['korea-u', 'Korea University', 'campus', 'Seongbuk', 37.5895, 127.0323],
  ['jamsil', 'Jamsil apartments RFID bins', 'rfid', 'Songpa', 37.5110, 127.0860], ['mokdong', 'Mok-dong apartments RFID bins', 'rfid', 'Yangcheon', 37.5300, 126.8750],
  ['sanggye', 'Sanggye apartments RFID bins', 'rfid', 'Nowon', 37.6560, 127.0650], ['banpo', 'Banpo apartments RFID bins', 'rfid', 'Seocho', 37.5050, 126.9950],
  ['eunpyeong', 'Eunpyeong New Town RFID bins', 'rfid', 'Eunpyeong', 37.6370, 126.9180], ['magok', 'Magok apartments RFID bins', 'rfid', 'Gangseo', 37.5600, 126.8300],
  ['wangsimni', 'Wangsimni apartments RFID bins', 'rfid', 'Seongdong', 37.5610, 127.0370], ['godeok', 'Godeok apartments RFID bins', 'rfid', 'Gangdong', 37.5550, 127.1550],
].map(([id, name, kind, zone, lat, lon], i) => ({ id: 'kr-' + id, name, kind, zone, lat, lon, capacityKg: kind === 'rfid' ? 220 : 380, contamPct: 2 + (i * 7) % 6, sensor: 'RFID weighing bin', seed: (i * 0.137) % 1 }));
const SEOUL_FACS = [
  { id: 'kr-f1', name: 'Gangseo Larva Center', area: 'Gangseo-gu', lat: 37.5760, lon: 126.8150, dailyQuotaKg: 2400, accepts: ['cooked', 'produce', 'grains'], window: '07:00 – 19:00' },
  { id: 'kr-f2', name: 'Nowon BioLoop', area: 'Nowon-gu', lat: 37.6650, lon: 127.0800, dailyQuotaKg: 1600, accepts: ['cooked', 'produce'], window: '08:00 – 18:00' },
  { id: 'kr-f3', name: 'Songpa Insect Works', area: 'Songpa-gu', lat: 37.4850, lon: 127.1300, dailyQuotaKg: 2000, accepts: ['cooked', 'produce', 'grains', 'okara'], window: '08:00 – 18:00' },
];
const SEOUL_DEPOTS = [{ id: 'kr-d1', name: 'Mapo depot', lat: 37.5550, lon: 126.9300, zone: 'Mapo' }, { id: 'kr-d2', name: 'Seongdong depot', lat: 37.5450, lon: 127.0450, zone: 'Seongdong' }];
function seoulBins(now) {
  const kst = sgParts(now + H); const hr = kst.h + kst.mi / 60;
  const day = clamp((hr - 6) / 15, 0, 1);
  return SEOUL_BINS.map(b => { const p = clamp(0.12 + day * (0.55 + b.seed * 0.5) + Math.sin(now / 9e5 + b.seed * 9) * 0.04, 0.05, 1); const kg = Math.round(p * b.capacityKg); const held = b.contamPct > CONTAM_LIMIT; return { ...b, kg, p, ratePerHr: 8, held, status: held ? 'held' : p >= 0.98 ? 'overflow' : p >= READY ? 'ready' : 'filling', updatedAt: now, lastEmptiedAt: now - 6 * H, tempC: 18 }; });
}
const SEOUL_FACTS = [['6,000', 'RFID smart bins in Seoul weigh food waste and bill each household'], ['95%', 'of South Korea\'s food waste is recycled today, up from about 2% in 1995'], ['47,000 t', 'less food waste in Seoul over six years after RFID bins arrived']];


/* ---- Account switcher with country flags ---- */
function RoleSheet({ c, onClose }) {
  const [reg, setReg] = useState(REG);
  return html`<${Sheet} title="Switch account" sub="Pick a country, then the account you want to use." onClose=${onClose}>
    <div class="flags" role="group" aria-label="Country">${Object.values(REGIONS).map(R => html`<button class="flagbtn" aria-pressed=${reg === R.id} onClick=${() => setReg(R.id)}><span class="flag">${R.flag}</span><span><b>${R.name}</b><span class="tiny faint">${R.id === 'sg' ? 'Hawker centres · NTU · HDB' : 'Markets · campuses · RFID apartments'}</span></span></button>`)}</div>
    ${Object.keys(ROLE_LABEL).map(r => html`<div class="stack" style="gap:8px"><div class="row"><${Avatar} role=${r}/><div><b>${ROLE_LABEL[r]}</b><div class="tiny faint">${ROLE_CAN[r]}</div></div></div>
      <div class="stack" style="gap:6px">${c.personasFor(r, reg).map(p => { const on = c.role === r && c.persona.id === p.id && REG === reg; return html`<button class="persona-btn" style=${on ? 'border-color:var(--brand);background:var(--brand-soft)' : ''} onClick=${() => { c.setRole(r, p.id, reg); onClose(); }}>
        <span style="font-size:20px">${REGIONS[reg].flag}</span><div class="grow"><div class="who">${p.name}</div><div class="tiny faint">${p.sub}</div></div>${on && html`<span style="width:20px;color:var(--brand)">${Ic.check()}</span>`}</button>`; })}</div></div>`)}
  </${Sheet}>`;
}

/* ---- Food business: nearest bins + what you recycle ---- */
function ContributorExtras({ c }) {
  const { D, persona, now } = c; const home = D.binById[persona.binId];
  if (!home) return null;
  const near = D.bins.filter(b => !b.held).map(b => ({ ...b, d: roadKm(home, b) })).sort((a, b) => a.d - b.d).slice(0, 4);
  const mine = D.drops.filter(d => d.who === persona.id && d.at > now - 30 * DAY);
  const byType = Object.keys(WASTE_TYPES).map(t => [t, sum(mine.filter(d => d.type === t), d => d.kg)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
  const mx = Math.max(1, ...byType.map(x => x[1]));
  const COL = { cooked: 'var(--brand)', produce: 'var(--leaf)', grains: 'var(--kaya)', okara: '#B98D5C', bones: 'var(--info)', oil: 'var(--ink-3)' };
  return html`<div class="grid g2">
    <div class="card"><div class="card-h"><div><div class="eyebrow">Near your ${persona.sub.split(' · ')[0].toLowerCase()}</div><h3>Closest bins with space</h3></div><button class="btn sm ghost" onClick=${() => c.go('map', { select: home.id })}>${Ic.map()} Map</button></div>
      ${near.map(b => html`<div class="li"><${Ring} p=${b.p} size=${40} stroke=${5} color=${STATUS[b.status].color}><text x="20" y="24" text-anchor="middle" style="font:700 10px var(--f-mono);fill:var(--ink)">${Math.round(b.p * 100)}</text></${Ring}>
        <div class="grow" style="min-width:0"><b class="small" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.name}${b.id === home.id ? ' (yours)' : ''}</b><span class="tiny faint">${b.id === home.id ? 'At your stall' : fmt(b.d, 1) + ' km away'} · ${fmt(Math.max(0, b.capacityKg - b.kg))} kg space</span></div>
        <${StatusPill} status=${b.status}/></div>`)}</div>
    <div class="card"><div class="card-h"><div><div class="eyebrow">Last 30 days</div><h3>What you're recycling</h3></div><b class="num">${fmt(sum(byType, x => x[1]))} kg</b></div>
      ${byType.length ? byType.map(([t, kg]) => html`<div class="hbar" style="grid-template-columns:minmax(110px,160px) minmax(0,1fr) 52px"><span class="small">${WASTE_TYPES[t].label}</span><div class="bar" style="height:12px"><i style=${`width:${kg / mx * 100}%;background:${COL[t]}`}></i></div><span class="num small" style="text-align:right">${fmt(kg)} kg</span></div>`)
        : html`<p class="small muted">Log a drop-off to see your breakdown.</p>`}
      <div class="tiny faint" style="margin-top:8px">Bones, shells and oil go to recovery; everything else feeds the larvae.</div></div></div>`;
}

/* ---- Harvest Shop: spend points on food from the loop ---- */
function HarvestShop({ c, compact }) {
  const { D, persona } = c; const bal = D.balance(persona.id); const items = PRODUCE[REG] || [];
  const [busy, setBusy] = useState(null);
  const redeem = async it => { setBusy(it.id); await c.act.redeem({ id: it.id, title: it.name + ' · ' + it.from, cost: it.cost, art: it.art }); setBusy(null); };
  return html`<div class="card shop"><div class="card-h"><div><div class="eyebrow">Harvest Shop</div><h2>${compact ? 'Spend your points on fresh food' : 'Fresh food grown with your waste'}</h2></div><span class="pill kaya">${Ic.sparkle()} From farms in the loop</span></div>
    ${!compact && html`<p class="small muted" style="margin:-6px 0 14px">These farms use Second Harvest frass and BSF feed. Swap your points for what they grow.</p>`}
    <div class="shop-grid">${items.slice(0, compact ? 3 : 8).map(it => html`<div class="shop-i"><div class="shop-art">${(ProduceArt[it.art] || ProduceArt.greens)()}</div>
      <div class="stack" style="gap:3px;padding:10px 12px 12px"><b class="small">${it.name}</b><span class="tiny faint">${it.from} · ${it.tag}</span>
        <div class="row between" style="margin-top:6px"><span class="points" style="padding:3px 9px 3px 3px;font-size:13px"><${Coin}/>${fmt(it.cost)}</span><span class="tiny faint" style="text-decoration:line-through">${money(it.was)}</span></div>
        <button class="btn sm kaya" disabled=${bal < it.cost || !!busy} onClick=${() => redeem(it)}>${busy === it.id ? 'Swapping…' : bal < it.cost ? `${fmt(it.cost - bal)} more pts` : 'Swap points'}</button></div></div>`)}</div>
    ${compact && html`<button class="btn sm ghost" style="margin-top:10px" onClick=${() => c.go('rewards')}>See all rewards ${Ic.chev()}</button>`}</div>`;
}

/* ---- Buyer perks / call to action ---- */
function BuyerPerks({ c }) {
  const { D, persona } = c; const rec = D.recsFor(persona.id); const gap = rec.gap && rec.gap.length;
  const bal = D.balance(persona.id); const vouchers = D.vouchers.filter(v => v.who === persona.id && !v.used);
  const perks = [
    ['p-gold', Ic.gift, 'Always on', '1% back in Harvest points', `Every ${money0(R_().unit)} you spend earns 1 point. 100 points = ${money0(R_().unit)} off.`, 'Shop now', () => c.go('market')],
    ['p-green', Ic.bag, 'Bulk deal', '10% off 10+ packs', 'Buy 10 or more of any product and the discount is applied at checkout automatically.', 'Browse products', () => c.go('market')],
    ['p-blue', Ic.flask, gap ? 'Soil match' : 'Free soil match', gap ? 'Your soil needs ' + rec.gap.map(nName).join(', ') : 'Find the right frass', gap ? 'Products that close the gap are sorted to the top for you.' : 'Enter a soil test and get matched. +20 points per test.', gap ? 'See matches' : 'Add soil test', () => c.go('insights', { tab: 'soil' })],
  ];
  return html`<section class="bdash">
    <div class="bwallet"><div class="row" style="gap:12px"><${Coin} size=${44}/><div><div class="tiny" style="opacity:.8;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Your Harvest points</div><div class="bw-num"><${CountUp} value=${bal}/></div></div></div>
      <div class="bw-side"><span>Worth <b>${money(ptsValue(bal))}</b> off</span><span>${vouchers.length ? `${vouchers.length} voucher ready` : 'Earn 1% back on every order'}</span></div>
      <button class="bw-btn" onClick=${() => c.go('rewards')}>Use points ${Ic.chev()}</button></div>
    <div class="perks" role="list">${perks.map(([tone, I, k, t, d, cta, fn]) => html`<div class=${'perkc ' + tone} role="listitem">
      <div class="row" style="gap:10px"><span class="perkc-ico">${I()}</span><span class="perkc-k">${k}</span></div>
      <b class="perkc-t">${t}</b><p class="perkc-d">${d}</p>
      <button class="perkc-btn" onClick=${fn}>${cta} ${Ic.arrow()}</button></div>`)}</div>
  </section>`;
}
