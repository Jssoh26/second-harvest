/* ===== Icons & illustrations (all hand-drawn SVG) ===== */
const { html, render, useState, useEffect, useMemo, useRef, useCallback } = htmPreact;

const svgI = (children, sw = 1.9) => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width=${sw} stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${children}</svg>`;
const Ic = {
  home: () => svgI(html`<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>`),
  map: () => svgI(html`<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>`),
  gauge: () => svgI(html`<path d="M4.5 17a8 8 0 1 1 15 0"/><path d="m12 13 3.5-4"/><circle cx="12" cy="13.5" r="1.3" fill="currentColor"/>`),
  bag: () => svgI(html`<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>`),
  gift: () => svgI(html`<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3 9h18M12 9v11M12 9c-1.5-3.5-6-4-6-1.5S10 9 12 9c2 0 6-.5 6-2.5S13.5 5.5 12 9"/>`),
  chart: () => svgI(html`<path d="M4 20V5M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>`),
  leaf: () => svgI(html`<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-5 6-8 10-10"/>`),
  plus: () => svgI(html`<path d="M12 5v14M5 12h14"/>`),
  minus: () => svgI(html`<path d="M5 12h14"/>`),
  close: () => svgI(html`<path d="M6 6l12 12M18 6 6 18"/>`),
  search: () => svgI(html`<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>`),
  cart: () => svgI(html`<path d="M3 4h2.5l2 11h10l2-8H7"/><circle cx="9.5" cy="19" r="1.3"/><circle cx="16.5" cy="19" r="1.3"/>`),
  route: () => svgI(html`<circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="6" r="2.2"/><path d="M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"/>`),
  check: () => svgI(html`<path d="m5 12.5 4.5 4.5L19 7.5"/>`, 2.4),
  pin: () => svgI(html`<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>`),
  bin: () => svgI(html`<path d="M5 7h14M9 7V5h6v2M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/>`),
  truck: () => svgI(html`<path d="M3 6h11v10H3zM14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>`),
  star: () => html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/></svg>`,
  layers: () => svgI(html`<path d="m12 4 9 5-9 5-9-5z"/><path d="m3 14 9 5 9-5"/>`),
  target: () => svgI(html`<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>`),
  chev: () => svgI(html`<path d="m9 6 6 6-6 6"/>`),
  chevDown: () => svgI(html`<path d="m6 9 6 6 6-6"/>`),
  refresh: () => svgI(html`<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>`),
  clock: () => svgI(html`<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`),
  alert: () => svgI(html`<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.2v.1"/>`),
  info: () => svgI(html`<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5M12 7.8v.1"/>`),
  swap: () => svgI(html`<path d="M7 4 4 7l3 3M4 7h12M17 20l3-3-3-3M20 17H8"/>`),
  arrow: () => svgI(html`<path d="M5 12h14M13 6l6 6-6 6"/>`),
  edit: () => svgI(html`<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>`),
  ff: () => svgI(html`<path d="M4 6l7 6-7 6zM13 6l7 6-7 6z"/>`),
  bolt: () => svgI(html`<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>`),
  sparkle: () => svgI(html`<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>`),
  scan: () => svgI(html`<path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M4 12h16"/>`),
  flask: () => svgI(html`<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>`),
  thermo: () => svgI(html`<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/>`),
  user: () => svgI(html`<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-5.5 7-5.5s6 1.5 7 5.5"/>`),
  dots: () => svgI(html`<circle cx="5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="19" cy="12" r="1.2" fill="currentColor"/>`),
  trash: () => svgI(html`<path d="M5 7h14M10 4h4M7 7l1 13h8l1-13"/>`),
  comment: () => svgI(html`<path d="M5 5h14v10H10l-5 4z"/>`),
};

const MARK_SVG = `__MARK__`;
let markSeq = 0;
const markHtml = () => { const u = ++markSeq; return MARK_SVG.replaceAll('sh-bg', 'sh-bg' + u).replaceAll('sh-bowl', 'sh-bowl' + u); };
function Mark({ size = 42, cls = '' }) {
  const inner = useMemo(markHtml, []);
  return html`<svg class=${cls} width=${size} height=${size} viewBox="0 0 120 120" role="img" aria-label="Second Harvest" dangerouslySetInnerHTML=${{ __html: inner }}></svg>`;
}

const Coin = ({ cls = 'coin', size }) => html`<svg class=${cls} viewBox="0 0 32 32" aria-hidden="true" style=${size ? `width:${size}px;height:${size}px` : ''}>
  <circle cx="16" cy="16" r="15" fill="#E9A92A"/><circle cx="16" cy="16" r="11.5" fill="#F6C657"/>
  <path d="M16 23v-8.5c0-3 2-5 5.5-5-.2 3.2-2.4 5-5.5 5M16 17.5c0-2.3-1.6-3.8-4.3-3.8.2 2.4 1.9 3.8 4.3 3.8" fill="none" stroke="#9A5E08" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* --- Loop illustrations (64x64) --- */
const Art = {
  stall: () => html`<svg viewBox="0 0 64 64" aria-hidden="true">
    <rect x="12" y="22" width="3" height="32" fill="#7A5230"/><rect x="49" y="22" width="3" height="32" fill="#7A5230"/>
    <path d="M7 11h50l-2 11H9z" fill="#1C6B43"/>
    <path d="M17 11h10l-1 11h-8zM37 11h10l1 11h-10z" fill="#F4EBD3"/>
    <path d="M9 22a4.6 4.6 0 0 0 9.2 0 4.6 4.6 0 0 0 9.2 0 4.6 4.6 0 0 0 9.2 0 4.6 4.6 0 0 0 9.2 0 4.6 4.6 0 0 0 9.2 0z" fill="#145234"/>
    <rect x="8" y="39" width="48" height="16" rx="2.5" fill="#F2B13B"/><rect x="8" y="39" width="48" height="4.5" rx="2" fill="#D48C1C"/>
    <path d="M23 35h18a9 6.5 0 0 1-18 0z" fill="#FFFFFF" stroke="#24352A" stroke-width="1.4"/>
    <path d="M28 31c-1.6-1.6 1.6-3.2 0-5M32 31c-1.6-1.6 1.6-3.2 0-5M36 31c-1.6-1.6 1.6-3.2 0-5" stroke="#8FA394" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <circle cx="16" cy="48" r="2" fill="#D48C1C"/><circle cx="48" cy="48" r="2" fill="#D48C1C"/></svg>`,
  bin: (p = 0.85) => {
    const lvl = Math.max(0, Math.min(1, p)); const h = 34 * lvl; const col = lvl >= 1 ? '#D9452B' : lvl >= 0.8 ? '#E58A1F' : '#6BC04A';
    return html`<svg viewBox="0 0 64 80" aria-hidden="true">
    <path d="M24 9a8 8 0 0 1 16 0" fill="none" stroke="#F2B13B" stroke-width="2" stroke-linecap="round"/>
    <path d="M20 5a13 13 0 0 1 24 0" fill="none" stroke="#F2B13B" stroke-width="2" stroke-linecap="round" opacity=".55"/>
    <path d="M27 13a5 4.5 0 0 1 10 0z" fill="#F2B13B"/>
    <rect x="9" y="13" width="46" height="9" rx="3.5" fill="#145234"/>
    <path d="M12 22h40l-3 50a4 4 0 0 1-4 3.8H19a4 4 0 0 1-4-3.8z" fill="#1C6B43"/>
    <rect x="21" y="30" width="22" height="38" rx="4" fill="#0D3A24"/>
    <rect x="22.5" y=${30 + 36.5 - h} width="19" height=${h} rx="2.6" fill=${col}/>
    <path d="M22.5 ${30 + 36.5 - 34 * 0.8}h19" stroke="#F4EBD3" stroke-width="1" stroke-dasharray="2 2" opacity=".8"/>
    </svg>`;
  },
  van: () => html`<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M5 22a4 4 0 0 1 4-4h30v26H5z" fill="#1C6B43"/>
    <path d="M39 26h10.5a3 3 0 0 1 2.6 1.5L58 37v7H39z" fill="#2A8455"/>
    <path d="M42 29h7.5l4.5 7H42z" fill="#CFE6F2"/>
    <rect x="5" y="41" width="53" height="5" rx="2" fill="#145234"/>
    <circle cx="16" cy="47" r="5.5" fill="#24352A"/><circle cx="16" cy="47" r="2.2" fill="#BFCBC2"/>
    <circle cx="48" cy="47" r="5.5" fill="#24352A"/><circle cx="48" cy="47" r="2.2" fill="#BFCBC2"/>
    <path d="M14 36c0-6 4-10 11-10 0 6.5-4 10-11 10zM14 36c2.5-3.2 5-5.2 8.5-6.6" fill="#9EDB6B" stroke="#145234" stroke-width="1.2" stroke-linejoin="round"/>
    <path d="M31 24l-3 5h3l-2 5" fill="none" stroke="#F2B13B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  factory: () => html`<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M6 30l12-8v8l12-8v8l12-8v8h16v26H6z" fill="#E9DFC6"/>
    <path d="M6 30l12-8v8l12-8v8l12-8v8h16" fill="none" stroke="#1C6B43" stroke-width="3" stroke-linejoin="round"/>
    <rect x="6" y="52" width="52" height="4" fill="#C9B88F"/>
    <circle cx="23" cy="42" r="8" fill="#145234"/>
    <g transform="translate(23 42) rotate(-20)"><rect x="-6" y="-2.6" width="12" height="5.2" rx="2.6" fill="#F4E6B8"/><path d="M-3 -2.4v4.8M0 -2.6v5.2M3 -2.4v4.8" stroke="#C9B27A" stroke-width=".9"/><circle cx="5.2" cy="0" r="1.2" fill="#3A2A12"/></g>
    <rect x="37" y="37" width="14" height="15" rx="1.5" fill="#1C6B43"/><rect x="40" y="40" width="8" height="4" rx="1" fill="#F2B13B"/>
    <g transform="translate(49 13)"><ellipse cx="0" cy="0" rx="3.5" ry="1.7" fill="#24352A"/><path d="M-1 -1c-2-4 -6-4 -6-1s4 2 6 1M1 -1c1-4 5-5 6-2s-3 3-6 2" fill="#CFE6F2" stroke="#24352A" stroke-width=".7" opacity=".9"/></g>
    </svg>`,
  farm: () => html`<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="47" cy="17" r="7" fill="#F2B13B"/>
    <path d="M2 42c12-10 30-12 60-4v20H2z" fill="#6BC04A"/>
    <path d="M2 50c18-6 36-6 60-2v10H2z" fill="#3E8E4F"/>
    <path d="M8 56l8-12M20 57l5-13M33 57l2-13M46 57l-2-13M58 56l-6-12" stroke="#2F7140" stroke-width="2" stroke-linecap="round"/>
    <g fill="#9EDB6B" stroke="#145234" stroke-width="1"><path d="M17 38c-4 0-6-3-6-6 4 0 6 3 6 6zM17 38c0-4 3-6 6-6 0 4-3 6-6 6z"/><path d="M34 35c-4 0-6-3-6-6 4 0 6 3 6 6zM34 35c0-4 3-6 6-6 0 4-3 6-6 6z"/></g>
    <path d="M17 38v5M34 35v6" stroke="#145234" stroke-width="1.4"/></svg>`,
  plate: () => html`<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M14 33c3-9 11-12 16-8-2-6 4-11 9-8 4-4 12 0 11 7" fill="#6BC04A" stroke="#145234" stroke-width="1.2"/>
    <path d="M30 25c4 0 6 3 6 8M39 17c-1 5-1 9 1 16" stroke="#145234" stroke-width="1.2" fill="none"/>
    <ellipse cx="45" cy="29" rx="7" ry="3.6" fill="#E0704F"/><path d="M51 29l5-3v6z" fill="#E0704F"/><circle cx="41" cy="28.4" r=".9" fill="#24352A"/>
    <path d="M8 33h48a24 20 0 0 1-48 0z" fill="#F2B13B"/><rect x="6" y="30.5" width="52" height="5" rx="2.5" fill="#FCDD82"/>
    <path d="M14 44h36" stroke="#C97A1E" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>`,
  larva: () => html`<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(32 34) rotate(-18)">
    <rect x="-22" y="-8" width="44" height="16" rx="8" fill="#F4E6B8" stroke="#B89A55" stroke-width="1.4"/>
    <path d="M-13 -7.6v15.2M-5 -8v16M3 -8v16M11 -7.6v15.2" stroke="#C9B27A" stroke-width="1.3"/>
    <circle cx="18" cy="0" r="3.2" fill="#3A2A12"/></g></svg>`,
  sprout: () => html`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 54V30" stroke="#145234" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 36c-10 0-15-7-15-14 10 0 15 7 15 14z" fill="#9EDB6B" stroke="#145234" stroke-width="1.3"/>
    <path d="M32 30c0-10 7-16 16-16 0 10-7 16-16 16z" fill="#6BC04A" stroke="#145234" stroke-width="1.3"/>
    <path d="M14 54h36" stroke="#8A5A35" stroke-width="4" stroke-linecap="round"/></svg>`,
  ticket: () => html`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 20h48v8a4 4 0 0 0 0 8v8H8v-8a4 4 0 0 0 0-8z" fill="#F2B13B"/><path d="M40 20v24" stroke="#9A5E08" stroke-width="1.6" stroke-dasharray="3 3"/><text x="24" y="37" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="13" fill="#5A3604">$</text></svg>`,
  tour: () => html`<svg viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(32 32)"><ellipse rx="9" ry="4.5" fill="#24352A"/><circle cx="9" cy="0" r="3.4" fill="#24352A"/><path d="M-3 -3c-6-12-20-12-19-3s13 6 19 3M2 -3c4-12 18-14 19-6s-12 9-19 6" fill="#CFE6F2" stroke="#24352A" stroke-width="1.3" opacity=".95"/><path d="M-6 4l-4 7M0 4v8M5 4l3 7" stroke="#24352A" stroke-width="1.4" stroke-linecap="round"/></g></svg>`,
  caddy: () => html`<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 24h36l-3 28H17z" fill="#2A8455"/><rect x="11" y="18" width="42" height="7" rx="3" fill="#145234"/><path d="M24 18c0-6 16-6 16 0" fill="none" stroke="#145234" stroke-width="3"/><path d="M26 38c0-5 4-8 9-8 0 5-4 8-9 8z" fill="#9EDB6B"/></svg>`,
};

/* --- Product packaging art (160x120) --- */
const HUES = { green: '#3E8E4F', leaf: '#5DAE45', blue: '#2E6FA8', teal: '#1F8A8A', gold: '#D9961F', rose: '#C2577A', cream: '#C9A74E', brown: '#8A5A35', coral: '#E0704F', amber: '#E39A2D' };
function ProductArt({ art = 'frass', hue = 'green', label = '' }) {
  const c = HUES[hue] || HUES.green; const ink = '#24352A';
  const shadow = html`<ellipse cx="80" cy="110" rx="46" ry="5.5" fill="#000" opacity=".1"/>`;
  const leaf = (x, y, s = 1) => html`<g transform=${`translate(${x} ${y}) scale(${s})`}><path d="M-8 6c0-9 6-14 16-14 0 10-6 14-16 14z" fill="#fff"/><path d="M-8 6c3-5 6-8 11-10" stroke=${c} stroke-width="1.4" fill="none"/></g>`;
  const fish = (x, y) => html`<g transform=${`translate(${x} ${y})`} fill="#fff"><ellipse rx="10" ry="5.5"/><path d="M8 0l8-6v12z"/><circle cx="-5" cy="-1" r="1.3" fill=${c}/></g>`;
  const larva = (x, y, r = 0, s = 1) => html`<g transform=${`translate(${x} ${y}) rotate(${r}) scale(${s})`}><rect x="-10" y="-3.8" width="20" height="7.6" rx="3.8" fill="#F4E6B8" stroke="#B89A55" stroke-width=".9"/><path d="M-5 -3.6v7.2M0 -3.8v7.6M5 -3.6v7.2" stroke="#C9B27A" stroke-width=".8"/><circle cx="8" cy="0" r="1.6" fill="#3A2A12"/></g>`;
  const word = (t, x, y, size = 9) => html`<text x=${x} y=${y} text-anchor="middle" font-family="Bricolage Grotesque,Figtree,sans-serif" font-weight="800" font-size=${size} fill="#fff" letter-spacing=".08em">${t}</text>`;
  let body;
  if (art === 'frass') body = html`
    <path d="M50 24h60l6 80a5 5 0 0 1-5 5H49a5 5 0 0 1-5-5z" fill="#CFA676"/>
    <path d="M50 24h60l1.2 16H48.8z" fill="#B98D5C"/>
    <path d="M48 18h64v8H48z" fill="#A87C4C"/><path d="M48 18l4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4 4 4 4-4" fill="none" stroke="#8C643A" stroke-width="1"/>
    <rect x="56" y="48" width="48" height="42" rx="7" fill=${c}/>
    ${leaf(80, 64, 1.15)} ${word(label || 'FRASS', 80, 84, 8.5)}
    <g fill="#5A3A22"><circle cx="38" cy="106" r="2.2"/><circle cx="31" cy="108" r="1.6"/><circle cx="43" cy="109" r="1.4"/><circle cx="122" cy="107" r="1.8"/><circle cx="128" cy="109" r="1.3"/></g>`;
  else if (art === 'meal') body = html`
    <path d="M52 30c-3-8 2-14 8-12 6-5 34-5 40 0 6-2 11 4 8 12l6 72a6 6 0 0 1-6 7H52a6 6 0 0 1-6-7z" fill="#F3EFE4" stroke="#D8D0BC" stroke-width="1.2"/>
    <path d="M66 22c4 6 24 6 28 0" fill="none" stroke=${ink} stroke-width="2" stroke-linecap="round"/>
    <path d="M48.5 56h63l1.8 26H46.7z" fill=${c}/>
    ${fish(80, 66)} ${word(label || 'BSF MEAL', 80, 78.5, 7.5)}
    <g fill="#B98D5C"><circle cx="40" cy="106" r="1.8"/><circle cx="35" cy="108.5" r="1.4"/><circle cx="124" cy="107" r="1.6"/></g>`;
  else if (art === 'pellet') body = html`
    <path d="M50 38h60v62a8 6 0 0 1-60 0z" fill="#FFFFFF" stroke="#D8D0BC" stroke-width="1.2"/>
    <rect x="50" y="56" width="60" height="28" fill=${c}/>
    ${fish(80, 66)} ${word(label || 'PELLETS', 80, 80, 7)}
    <ellipse cx="80" cy="38" rx="31" ry="8" fill=${c} stroke="#00000022"/><ellipse cx="80" cy="35" rx="31" ry="8" fill=${c}/><ellipse cx="80" cy="35" rx="22" ry="4.5" fill="#ffffff" opacity=".25"/>
    <g fill="#8A5A35"><circle cx="122" cy="104" r="3"/><circle cx="130" cy="108" r="2.6"/><circle cx="116" cy="109" r="2.4"/><circle cx="36" cy="107" r="2.6"/><circle cx="29" cy="109" r="2.2"/></g>`;
  else if (art === 'larvae') body = html`
    <path d="M52 22h56a4 4 0 0 1 4 4v76a6 6 0 0 1-6 6H54a6 6 0 0 1-6-6V26a4 4 0 0 1 4-4z" fill="#FFF6E2" stroke="#E2CF9E" stroke-width="1.2"/>
    <rect x="48" y="22" width="64" height="9" rx="3" fill=${c}/>
    <rect x="58" y="42" width="44" height="34" rx="8" fill="#ffffff" stroke="#E2CF9E"/>
    ${larva(73, 52, -10, 0.9)} ${larva(86, 60, 15, 0.9)} ${larva(76, 67, -4, 0.85)}
    <rect x="58" y="82" width="44" height="14" rx="4" fill=${c}/>${word(label || 'LARVAE', 80, 92, 7.5)}`;
  else if (art === 'live') body = html`
    <path d="M28 70h104l-8 32a6 6 0 0 1-6 5H42a6 6 0 0 1-6-5z" fill=${c}/>
    <path d="M28 70h104" stroke="#00000030" stroke-width="2"/>
    <ellipse cx="80" cy="70" rx="50" ry="8" fill="#6B4A2A"/>
    ${larva(56, 64, -20)} ${larva(78, 60, 10)} ${larva(100, 64, -8)} ${larva(68, 70, 18, 0.9)} ${larva(92, 71, -15, 0.9)} ${larva(80, 52, 70, 0.85)}
    ${word(label || 'LIVE', 80, 92, 9)}`;
  else if (art === 'chitin') body = html`
    <rect x="56" y="26" width="48" height="12" rx="3" fill=${c}/>
    <path d="M54 40h52a4 4 0 0 1 4 4v56a8 8 0 0 1-8 8H58a8 8 0 0 1-8-8V44a4 4 0 0 1 4-4z" fill="#DDEFF3" stroke="#A9CCD4" stroke-width="1.4" opacity=".95"/>
    <g fill="#D9961F" stroke="#9A5E08" stroke-width=".6"><path d="M60 98l8-6 5 7z"/><path d="M72 100l9-8 4 9z"/><path d="M86 99l6-9 8 8z"/><path d="M62 86l7-5 3 7z"/><path d="M78 88l7-7 5 6z"/><path d="M92 86l5-6 4 7z"/><path d="M68 76l7-4 2 6z"/><path d="M84 77l6-5 3 6z"/></g>
    <rect x="62" y="52" width="36" height="14" rx="4" fill="#fff" stroke="#A9CCD4"/>
    <text x="80" y="62" text-anchor="middle" font-family="Bricolage Grotesque,sans-serif" font-weight="800" font-size="8" fill=${c} letter-spacing=".08em">${label || 'CHITIN'}</text>
    <path d="M58 46v48" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`;
  else body = html`
    <path d="M44 50l36-14 36 14-36 14z" fill="#E8D7B0"/>
    <path d="M44 50v44l36 14V64z" fill=${c}/><path d="M116 50v44l-36 14V64z" fill=${c} opacity=".78"/>
    <path d="M80 64v44" stroke="#00000025"/>
    <path d="M80 50V30" stroke="#145234" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M80 38c-9 0-13-6-13-12 9 0 13 6 13 12z" fill="#9EDB6B" stroke="#145234"/><path d="M80 33c0-9 6-14 14-14 0 9-6 14-14 14z" fill="#6BC04A" stroke="#145234"/>
    ${word(label || 'GROW', 62, 84, 7)}
    <rect x="88" y="74" width="20" height="24" rx="2" fill="#fff" transform="rotate(-8 98 86)"/><circle cx="98" cy="84" r="5" fill="#E0704F" transform="rotate(-8 98 86)"/>`;
  return html`<svg viewBox="0 0 160 120" aria-hidden="true">${shadow}${body}</svg>`;
}

/* Hero illustration: the loop as a ring of moments */
const at = (v, a) => (Object.assign(v.props, a), v);
const HeroArt = () => html`<svg class="hero-art" viewBox="0 0 190 150" aria-hidden="true">
  <circle cx="95" cy="75" r="56" fill="none" stroke="#7FC48F" stroke-width="2" stroke-dasharray="4 7" opacity=".7"/>
  <path d="M146 54l5 8-9 1" fill="none" stroke="#7FC48F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
  <g transform="translate(70 50) scale(.42)" dangerouslySetInnerHTML=${{ __html: markHtml() }}></g>
  <g transform="translate(14 22) scale(.55)"><rect width="64" height="64" rx="20" fill="#0D3A24"/></g>${at(Art.stall(), { x: 18, y: 26, width: 27, height: 27 })}
  <g transform="translate(140 18) scale(.55)"><rect width="64" height="64" rx="20" fill="#0D3A24"/></g>${at(Art.factory(), { x: 144, y: 22, width: 27, height: 27 })}
  <g transform="translate(140 100) scale(.55)"><rect width="64" height="64" rx="20" fill="#0D3A24"/></g>${at(Art.farm(), { x: 144, y: 104, width: 27, height: 27 })}
  <g transform="translate(14 100) scale(.55)"><rect width="64" height="64" rx="20" fill="#0D3A24"/></g>${at(Art.van(), { x: 18, y: 104, width: 27, height: 27 })}
</svg>`;

const EmptyArt = () => html`<svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" fill="var(--art-bg)"/>${at(Art.sprout(), { x: 16, y: 16, width: 64, height: 64 })}</svg>`;

function Avatar({ role, size }) {
  const a = role === 'contributor' ? Art.stall() : role === 'collector' ? Art.van() : role === 'facility' ? Art.factory() : Art.farm();
  return html`<span class="avatar" style=${size ? `width:${size}px;height:${size}px` : ''}>${a}</span>`;
}

/* Produce art for the Harvest Shop (96x72) */
const ProduceArt = {
  greens: () => html`<svg viewBox="0 0 96 72" aria-hidden="true"><ellipse cx="48" cy="64" rx="30" ry="4" fill="#000" opacity=".1"/>
    <path d="M48 62c-4-14-16-20-24-34 10 2 18 10 24 20 6-10 14-18 24-20-8 14-20 20-24 34z" fill="#3E8E4F"/><path d="M48 62c-2-16 0-30 0-46 6 10 6 28 0 46z" fill="#6BC04A"/>
    <path d="M30 24c6-4 12-2 14 4-6 2-12 0-14-4zM66 24c-6-4-12-2-14 4 6 2 12 0 14-4z" fill="#9EDB6B"/><rect x="40" y="52" width="16" height="6" rx="2" fill="#C97A1E"/></svg>`,
  cabbage: () => html`<svg viewBox="0 0 96 72" aria-hidden="true"><ellipse cx="48" cy="64" rx="28" ry="4" fill="#000" opacity=".1"/>
    <path d="M30 60c-6-18 0-40 18-46 18 6 24 28 18 46z" fill="#DDEFC2"/><path d="M36 60c-4-16 2-34 12-40 10 6 16 24 12 40z" fill="#F4F8E8"/>
    <path d="M30 60c-8-12-6-30 6-38-2 14 0 26 6 38zM66 60c8-12 6-30-6-38 2 14 0 26-6 38z" fill="#8CCB5E"/><path d="M48 22v38" stroke="#B9D99A" stroke-width="2"/></svg>`,
  fish: () => html`<svg viewBox="0 0 96 72" aria-hidden="true"><ellipse cx="48" cy="62" rx="32" ry="4" fill="#000" opacity=".1"/>
    <path d="M14 38c10-14 34-18 52-6l14-10v32l-14-10c-18 12-42 8-52-6z" fill="#7FA9C9"/><path d="M14 38c10 10 30 14 52 4" fill="none" stroke="#5C88AB" stroke-width="2"/>
    <circle cx="26" cy="35" r="2.6" fill="#24352A"/><path d="M40 26c4 4 4 20 0 24M50 26c4 4 4 20 0 24" stroke="#A9C8DE" stroke-width="1.6" fill="none"/></svg>`,
  eggs: () => html`<svg viewBox="0 0 96 72" aria-hidden="true"><rect x="14" y="40" width="68" height="20" rx="6" fill="#C9A57A"/>
    ${[22, 38, 54, 70].map((x, i) => html`<ellipse cx=${x - 0} cy=${36 - (i % 2) * 3} rx="8" ry="10" fill=${i % 2 ? '#F4E3C3' : '#FBF4E6'} stroke="#D9C49C"/>`)}
    <path d="M14 46h68" stroke="#A98458" stroke-width="2"/></svg>`,
  seedling: () => html`<svg viewBox="0 0 96 72" aria-hidden="true"><path d="M32 44h32l-4 22H36z" fill="#C97A1E"/><rect x="30" y="40" width="36" height="7" rx="2" fill="#E39A2D"/>
    <path d="M48 40V22" stroke="#145234" stroke-width="2.4"/><path d="M48 28c-10 0-14-6-14-12 10 0 14 6 14 12zM48 24c0-10 6-14 14-14 0 10-6 14-14 14z" fill="#6BC04A" stroke="#145234"/>
    <circle cx="62" cy="34" r="4" fill="#E0452B"/><path d="M62 30c1-3 3-4 5-4" stroke="#145234" stroke-width="1.4" fill="none"/></svg>`,
};
