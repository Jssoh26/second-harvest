/* ===== Shared UI pieces ===== */
function Stat({ v, unit, k, d, tone }) {
  return html`<div class="stat"><div class="v" style=${tone ? `color:${tone}` : ''}>${v}${unit && html`<small>${unit}</small>`}</div><div class="k">${k}</div>${d && html`<div class="d">${d}</div>`}</div>`;
}
function Bar({ p, cls = '', label }) {
  return html`<div class=${'bar ' + cls} role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow=${Math.round(clamp(p, 0, 1) * 100)} aria-label=${label || ''}><i style=${`width:${clamp(p, 0, 1) * 100}%`}></i></div>`;
}
function Ring({ p, size = 104, stroke = 10, color = 'var(--brand)', children, track = 'var(--surface-3)' }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = clamp(p, 0, 1);
  return html`<svg class="gauge" width=${size} height=${size} viewBox=${`0 0 ${size} ${size}`} role="img" aria-label=${Math.round(v * 100) + '%'}>
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke=${track} stroke-width=${stroke}/>
    <circle cx=${size / 2} cy=${size / 2} r=${r} fill="none" stroke=${color} stroke-width=${stroke} stroke-linecap="round" stroke-dasharray=${`${c * v} ${c}`} transform=${`rotate(-90 ${size / 2} ${size / 2})`} style="transition:stroke-dasharray .6s cubic-bezier(.2,.8,.2,1)"/>
    ${children}</svg>`;
}
function Stars({ v, n }) {
  const full = Math.round(v * 2) / 2;
  return html`<span class="row" style="gap:6px"><span class="stars" aria-label=${fmt(v, 1) + ' out of 5'}>${[1, 2, 3, 4, 5].map(i => html`<span style=${i - 0.5 > full ? 'color:var(--line-2)' : ''}>${Ic.star()}</span>`)}</span>${n != null && html`<span class="tiny faint">${fmt(v, 1)} · ${n}</span>`}</span>`;
}
function StatusPill({ status }) { const s = STATUS[status]; return html`<span class=${'pill ' + s.cls}>${s.label}</span>`; }
function RTag({ r }) { return html`<span class="r-tag" title=${r}>${r}</span>`; }
const SDG_COLORS = { 2: '#DDA63A', 8: '#A21942', 9: '#FD6925', 11: '#FD9D24', 12: '#BF8B2E', 14: '#0A97D9', 15: '#56C02B', 17: '#19486A' };
function Sdg({ t }) { const g = parseInt(t); return html`<span class="sdg" style=${`background:${SDG_COLORS[g] || '#555'}`}>SDG ${t}</span>`; }
function Empty({ title, children }) { return html`<div class="empty"><${EmptyArt}/><b>${title}</b><div class="small">${children}</div></div>`; }
function Seg({ value, options, onChange, label }) {
  return html`<div class="seg" role="group" aria-label=${label || ''}>${options.map(([v, l]) => html`<button type="button" aria-pressed=${value === v} onClick=${() => onChange(v)}>${l}</button>`)}</div>`;
}
function Stepper({ value, onChange, step = 1, min = 0, max = 9999, id }) {
  return html`<div class="stepper"><button type="button" aria-label="Decrease" onClick=${() => onChange(clamp(value - step, min, max))}>−</button>
    <input id=${id} inputmode="decimal" value=${value} onInput=${e => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(clamp(v, min, max)); }}/>
    <button type="button" aria-label="Increase" onClick=${() => onChange(clamp(value + step, min, max))}>+</button></div>`;
}

/* Tooltip */
let setTipGlobal = () => { };
function TipLayer() { const [t, setT] = useState(null); setTipGlobal = setT; return t && html`<div class="tip" style=${`left:${t.x}px;top:${t.y}px`}>${t.text}</div>`; }
const tipOn = text => e => { const r = e.currentTarget.getBoundingClientRect(); setTipGlobal({ text, x: r.left + r.width / 2, y: r.top }); };
const tipOff = () => setTipGlobal(null);

/* 7-day bars against a quota line */
function DayBars({ days, quota, height = 150 }) {
  const W = 340, Hh = height, padB = 22, padT = 14, max = Math.max(quota * 1.15, ...days.map(d => d.v), 1);
  const bw = (W - 8) / days.length; const y = v => padT + (Hh - padB - padT) * (1 - v / max);
  const qy = y(quota);
  return html`<div class="chart"><svg viewBox=${`0 0 ${W} ${Hh}`} role="img" aria-label="Food waste received per day, last 7 days">
    ${[0.5, 1].map(f => html`<line x1="0" x2=${W} y1=${y(max * f)} y2=${y(max * f)} stroke="var(--line)" stroke-width="1"/>`)}
    ${days.map((d, i) => { const x = 4 + i * bw + bw * 0.18, w = bw * 0.64, top = y(d.v), h = Math.max(0, Hh - padB - top); return html`<g onMouseEnter=${tipOn(`${d.label}: ${fmt(d.v)} kg of ${fmt(quota)} kg`)} onMouseLeave=${tipOff}>
      <rect x=${4 + i * bw} y=${padT} width=${bw} height=${Hh - padB - padT} fill="transparent"/>
      <path d=${`M${x} ${Hh - padB}V${top + 4}a4 4 0 0 1 4-4h${w - 8}a4 4 0 0 1 4 4V${Hh - padB}z`} fill=${d.today ? 'var(--kaya)' : 'var(--brand)'} opacity=${d.today ? 1 : 0.85}/>
      <text x=${x + w / 2} y=${Hh - 6} text-anchor="middle" style=${d.today ? 'font-weight:700;fill:var(--ink)' : ''}>${d.today ? 'Today' : d.label}</text></g>`; })}
    <line x1="0" x2=${W} y1=${qy} y2=${qy} stroke="var(--ink-2)" stroke-width="1.5" stroke-dasharray="4 4"/>
    <text x=${W} y=${qy - 5} text-anchor="end" style="fill:var(--ink-2);font-weight:600">Quota ${fmt(quota)} kg</text>
  </svg></div>`;
}

/* Small multiple line for soil history */
function Spark({ pts, band, label, unit, w = 320, h = 80 }) {
  if (!pts.length) return null;
  const vals = pts.map(p => p.v); const lo = Math.min(...vals, band ? band[0] : Infinity) * 0.9, hi = Math.max(...vals, band ? band[1] : -Infinity) * 1.05;
  const x = i => 6 + (pts.length === 1 ? (w - 12) / 2 : i * (w - 12) / (pts.length - 1)); const y = v => 6 + (h - 18) * (1 - (v - lo) / (hi - lo || 1));
  const d = pts.map((p, i) => (i ? 'L' : 'M') + x(i) + ' ' + y(p.v)).join('');
  const last = pts[pts.length - 1];
  return html`<div class="stack" style="gap:4px"><div class="row between small"><b>${label}</b><span class="num">${fmt(last.v, last.v < 10 ? 1 : 0)} ${unit}</span></div>
    <div class="chart"><svg viewBox=${`0 0 ${w} ${h}`} role="img" aria-label=${label + ' over time'}>
    ${band && html`<rect x="0" y=${y(band[1])} width=${w} height=${Math.max(0, y(band[0]) - y(band[1]))} fill="var(--good)" opacity=".13" rx="4"/>`}
    <path d=${d} fill="none" stroke="var(--brand)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts.map((p, i) => html`<circle cx=${x(i)} cy=${y(p.v)} r=${i === pts.length - 1 ? 4.5 : 3} fill=${i === pts.length - 1 ? 'var(--brand)' : 'var(--surface)'} stroke="var(--brand)" stroke-width="2" onMouseEnter=${tipOn(`${dateLabel(p.t)}: ${fmt(p.v, p.v < 10 ? 1 : 0)} ${unit}`)} onMouseLeave=${tipOff}/>`)}
    <text x="2" y=${h - 1}>${dateLabel(pts[0].t)}</text><text x=${w - 2} y=${h - 1} text-anchor="end">${dateLabel(last.t)}</text>
    </svg></div></div>`;
}

function Sheet({ title, sub, onClose, children, footer, icon }) {
  useEffect(() => { const k = e => e.key === 'Escape' && onClose(); addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, []);
  return html`<div class="overlay" onClick=${e => e.target === e.currentTarget && onClose()}>
    <div class="sheet" role="dialog" aria-modal="true" aria-label=${title}>
      <div class="sheet-h">${icon}<div class="grow"><h2 style="font-size:19px">${title}</h2>${sub && html`<div class="small muted">${sub}</div>`}</div>
        <button class="icon-btn" aria-label="Close" onClick=${onClose}>${Ic.close()}</button></div>
      <div class="sheet-b">${children}</div>
      ${footer && html`<div class="sheet-f">${footer}</div>`}
    </div></div>`;
}
