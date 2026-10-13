/* ===== Core: constants, data store, routing ===== */
const COLS = ['bins', 'facilities', 'products', 'orders', 'feedback', 'soiltests', 'ledger', 'vouchers', 'drops', 'deliveries', 'pickups'];
const H = 3.6e6, DAY = 24 * H;
const VAN_CO2_PER_KM = 0.25;      // kg CO2e per km, diesel light van (assumption)
const ROAD_FACTOR = 1.35;         // straight-line → road distance
const READY = 0.8;                // bins appear for collection at 80% full
const CONTAM_LIMIT = 15;          // % contamination above which a bin is held (Reject)
const BSF = { larvae: 0.18, dried: 0.06, frass: 0.25 }; // per kg food waste (typical published ranges)

const WASTE_TYPES = {
  cooked: { label: 'Cooked leftovers', bsf: true },
  produce: { label: 'Fruit & veg trimmings', bsf: true },
  grains: { label: 'Rice, noodles & bread', bsf: true },
  okara: { label: 'Okara & spent grain', bsf: true },
  bones: { label: 'Bones & shells', bsf: false, recover: 'Bones and shells slow larvae down. Bag them for energy recovery at the incineration plant.' },
  oil: { label: 'Used cooking oil', bsf: false, recover: 'Oil goes to a licensed used-cooking-oil collector for biodiesel, not to the larvae.' },
};
const ACCEPT_LABEL = { cooked: 'Cooked food', produce: 'Fruit & veg', grains: 'Rice & bread', okara: 'Okara' };
let REG = 'sg';
const REGIONS = {
  sg: { id: 'sg', name: 'Singapore', flag: '🇸🇬', cur: '$', dec: 2, unit: 1, city: 'sg',
    zones: ['NTU', 'West', 'Central', 'North', 'North-East', 'East'],
    depots: [
      { id: 'ntu', name: 'NTU loading bay', lat: 1.3455, lon: 103.6830, zone: 'NTU' }, { id: 'jurong', name: 'Jurong West depot', lat: 1.3395, lon: 103.7060, zone: 'West' },
      { id: 'outram', name: 'Outram depot', lat: 1.2850, lon: 103.8370, zone: 'Central' }, { id: 'amk', name: 'Ang Mo Kio depot', lat: 1.3740, lon: 103.8480, zone: 'North-East' },
      { id: 'woodlands', name: 'Woodlands depot', lat: 1.4380, lon: 103.7880, zone: 'North' }, { id: 'bedok', name: 'Bedok depot', lat: 1.3300, lon: 103.9270, zone: 'East' }] },
  kr: { id: 'kr', name: 'Seoul', flag: '🇰🇷', cur: '₩', dec: 0, unit: 1000, city: 'seoul',
    zones: ['Jongno', 'Jung', 'Mapo', 'Seodaemun', 'Dongdaemun', 'Seongbuk', 'Seongdong', 'Dongjak', 'Gwanak', 'Yangcheon', 'Gangseo', 'Eunpyeong', 'Nowon', 'Seocho', 'Songpa', 'Gangdong'],
    depots: [{ id: 'kr-d1', name: 'Mapo depot', lat: 37.5550, lon: 126.9300, zone: 'Mapo' }, { id: 'kr-d2', name: 'Seongdong depot', lat: 37.5450, lon: 127.0450, zone: 'Seongdong' }, { id: 'kr-d3', name: 'Songpa depot', lat: 37.5000, lon: 127.1000, zone: 'Songpa' }] },
};
const R_ = () => REGIONS[REG];
const zonesOf = () => R_().zones;
const depots = () => R_().depots;
const KIND_LABEL = { canteen: 'NTU canteen', hawker: 'Hawker centre', hdb: 'HDB estate', foodcourt: 'Food court', market: 'Traditional market', campus: 'University cafeteria', rfid: 'RFID apartment bins' };
const SEGMENTS = { farm: 'Local farm', aquaculture: 'Aquaculture', student: 'Student / community', agri: 'Agri company' };
const CRITERIA = [['fit', 'Fits our needs'], ['quality', 'Quality'], ['consistency', 'Consistency'], ['delivery', 'Delivery'], ['value', 'Value for money']];
const GOOD_TAGS = ['Great plant growth', 'Consistent quality', 'Fast delivery', 'Fair price', 'No odour', 'Fish took it well', 'Easy to apply'];
const BAD_TAGS = ['Low potassium', 'Bag arrived damp', 'Strong smell', 'Uneven particle size', 'Delivery delayed', 'Pricey for small farms'];
const CROPS = {
  'Leafy greens': { n: [20, 40], p: [25, 50], k: [120, 200], ph: [6.0, 7.0], om: [3, 6] },
  'Fruiting vegetables': { n: [25, 45], p: [30, 60], k: [150, 250], ph: [6.0, 6.8], om: [3, 6] },
  'Herbs & chilli': { n: [15, 35], p: [20, 45], k: [100, 180], ph: [6.0, 7.0], om: [2.5, 5] },
};
const NUTRIENTS = [['n', 'Nitrogen', 'mg/kg'], ['p', 'Phosphorus', 'mg/kg'], ['k', 'Potassium', 'mg/kg'], ['ph', 'pH', ''], ['om', 'Organic matter', '%']];
const rewardsFor = () => { const u = R_().unit; return [
  { id: 'r-5off', title: `${money0(5 * u)} off any BSF product`, cost: 500, value: 5 * u, art: 'ticket', desc: 'Use at checkout in the marketplace.' },
  { id: 'r-12off', title: `${money0(12 * u)} off orders over ${money0(60 * u)}`, cost: 1000, value: 12 * u, min: 60 * u, art: 'ticket', desc: 'Best for farms buying in bulk.' },
  { id: 'r-meal', title: `${money0(3 * u)} ${REG === 'kr' ? 'market' : 'hawker'} meal voucher`, cost: 400, art: 'plate', desc: 'Spend at any participating stall.' },
  { id: 'r-caddy', title: 'Sealed food-waste caddy', cost: 600, art: 'caddy', desc: 'Reusable 10 L caddy, swapped clean at every pickup.' },
  { id: 'r-tour', title: 'BSF facility tour & workshop', cost: 800, art: 'tour', desc: 'See the larvae at work. 2 hours, Saturdays.' },
  { id: 'r-sample', title: 'Free 1 kg frass sample', cost: 300, value: 4.5 * u, art: 'sprout', desc: 'Try frass on your own plants.' },
]; };
/* Harvest Shop: fresh food grown by farms that use Second Harvest frass and feed */
const PRODUCE = {
  sg: [
    { id: 'pr-kailan', name: 'Kailan, 1 kg', from: 'Kampong Greens', cost: 250, was: 6.5, art: 'greens', tag: 'Grown with Senoko High-K Frass' },
    { id: 'pr-tilapia', name: 'Tilapia fillet, 500 g', from: 'Bluewater Fish Farm', cost: 450, was: 9.9, art: 'fish', tag: 'Fed with BSF pellets' },
    { id: 'pr-eggs', name: 'Free-range eggs, 10', from: 'Kampong Greens', cost: 300, was: 6.8, art: 'eggs', tag: 'Hens eat BSF larvae' },
    { id: 'pr-chilli', name: 'Chilli & herb seedlings', from: 'NTU Garden Club', cost: 150, was: 4.0, art: 'seedling', tag: 'Potted in campus frass' },
  ],
  kr: [
    { id: 'pr-cabbage', name: 'Napa cabbage, 1 head', from: 'Namyangju Greens', cost: 300, was: 4500, art: 'cabbage', tag: 'Grown with Nowon High-K Frass' },
    { id: 'pr-perilla', name: 'Perilla leaves, 300 g', from: 'Namyangju Greens', cost: 200, was: 3500, art: 'greens', tag: 'Greenhouse-grown with frass' },
    { id: 'pr-eel', name: 'Freshwater eel, 300 g', from: 'Hangang Aquafarm', cost: 900, was: 18000, art: 'fish', tag: 'Fed with BSF pellets' },
    { id: 'pr-eggs', name: 'Free-range eggs, 10', from: 'Namyangju Greens', cost: 350, was: 5900, art: 'eggs', tag: 'Hens eat BSF larvae' },
  ],
};
const TIERS = [['Seedling', 0], ['Sprout', 500], ['Sapling', 1500], ['Harvest Hero', 4000]];
const EARN = [
  ['Log segregated food waste', '2 pts / kg', 'contributor'], ['Clean drop (no contaminants)', '+10 bonus', 'contributor'],
  ['Sort bones, shells or oil for recovery', '+5', 'contributor'], ['Deliver a route to a BSF facility', '1 pt / 10 kg +25', 'collector'],
  ['Buy BSF products', '1% back in points', 'buyer'], ['Product feedback', '+15', 'buyer'], ['Soil test', '+20', 'buyer'],
];

const PERSONAS_R = {
  sg: {
    contributor: [
      { id: 'u-hawker', name: 'Mei Ling Mee Pok', sub: 'Hawker stall · Tiong Bahru Market', binId: 'tiongbahru' },
      { id: 'u-ntu', name: 'North Spine Food Court', sub: 'NTU canteen operator', binId: 'ntu-ns' }],
    collector: [{ id: 'u-van07', name: 'Van SG-07', sub: 'Electric van · Jurong West depot', depot: 'jurong' }],
    buyer: [
      { id: 'b-kampong', name: 'Kampong Greens', sub: 'Leafy-greens farm · Lim Chu Kang', segment: 'farm' },
      { id: 'b-seletar', name: 'Bluewater Fish Farm', sub: 'Coastal fish farm', segment: 'aquaculture' },
      { id: 'b-ntugarden', name: 'NTU Garden Club', sub: 'Student group', segment: 'student' }],
  },
  kr: {
    contributor: [
      { id: 'k-gwangjang', name: 'Gwangjang Bindaetteok Stall', sub: 'Market stall · Gwangjang Market', binId: 'kr-gwangjang' },
      { id: 'k-yonsei', name: 'Yonsei University Cafeteria', sub: 'Campus cafeteria · Sinchon', binId: 'kr-yonsei' }],
    collector: [{ id: 'k-van12', name: 'Van SEO-12', sub: 'Electric van · Mapo depot', depot: 'kr-d1' }],
    buyer: [
      { id: 'kb-namyangju', name: 'Namyangju Greens', sub: 'Cabbage & perilla farm · Gyeonggi', segment: 'farm' },
      { id: 'kb-hangang', name: 'Hangang Aquafarm', sub: 'Eel & catfish farm', segment: 'aquaculture' },
      { id: 'kb-snu', name: 'SNU Rooftop Garden', sub: 'Student group', segment: 'student' }],
  },
};
const nName = k => k === 'ph' ? 'pH' : NUTRIENTS.find(n => n[0] === k)[1].toLowerCase();
const ROLE_LABEL = { contributor: 'Food business', collector: 'Collector', facility: 'BSF facility', buyer: 'Buyer' };

/* ---------- utils ---------- */
const fmt = (n, d = 0) => (n == null || isNaN(n) ? '–' : Number(n).toLocaleString('en-SG', { minimumFractionDigits: d, maximumFractionDigits: d }));
const money = n => R_().cur + fmt(n, R_().dec);
const money0 = n => R_().cur + fmt(n, 0);
const ptsValue = p => p / 100 * R_().unit;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pct = x => Math.round(x * 100) + '%';
const sgParts = t => { const d = new Date(t + 8 * H); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), wd: d.getUTCDay() }; };
const startOfDaySG = t => { const p = sgParts(t); return Date.UTC(p.y, p.m, p.d) - 8 * H; };
const ago = (t, now = Date.now()) => { const s = (now - t) / 1000; if (s < 60) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; const d = Math.round(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago'; };
const dayLabel = t => new Date(t + 8 * H).toLocaleDateString('en-SG', { weekday: 'short', timeZone: 'UTC' });
const dateLabel = t => new Date(t + 8 * H).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const timeLabel = t => { const p = sgParts(t); return String(p.h).padStart(2, '0') + ':' + String(p.mi).padStart(2, '0'); };
const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sum = (a, f = x => x) => a.reduce((s, x) => s + (f(x) || 0), 0);
const groupBy = (a, f) => a.reduce((m, x) => { const k = f(x); (m[k] ||= []).push(x); return m; }, {});
const clone = x => JSON.parse(JSON.stringify(x));
const code = () => 'SH-' + Math.random().toString(36).slice(2, 6).toUpperCase();
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

/* ---------- live sensor model ---------- */
function binState(b, now) {
  const hrs = Math.max(0, (now - (b.updatedAt || now)) / H);
  const kg = Math.min(b.capacityKg, (b.fillKg || 0) + hrs * (b.ratePerHr || 0));
  const p = kg / b.capacityKg;
  const toReady = p >= READY ? 0 : ((READY * b.capacityKg - kg) / (b.ratePerHr || 1));
  const held = (b.contamPct || 0) > CONTAM_LIMIT;
  const status = held ? 'held' : p >= 0.98 ? 'overflow' : p >= READY ? 'ready' : 'filling';
  return { ...b, kg: Math.round(kg), p, toReady, status, held };
}
const STATUS = {
  overflow: { label: 'Overflowing', cls: 'crit', color: 'var(--crit)' },
  ready: { label: 'Ready ≥80%', cls: 'warn', color: 'var(--warn)' },
  filling: { label: 'Filling', cls: 'good', color: 'var(--good)' },
  held: { label: 'Held: needs sorting', cls: 'neutral', color: 'var(--ink-3)' },
};

/* ---------- geo & routing ---------- */
const projSG = (lat, lon) => [(lon - GEO.sg.W0) * GEO.sg.K, (GEO.sg.N0 - lat) * GEO.sg.K];
function hav(a, b) { const R = 6371, r = Math.PI / 180; const dLa = (b.lat - a.lat) * r, dLo = (b.lon - a.lon) * r; const s = Math.sin(dLa / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(s)); }
const roadKm = (a, b) => hav(a, b) * ROAD_FACTOR;
function tourKm(start, seq, end) { let d = 0, p = start; for (const s of seq) { d += roadKm(p, s); p = s; } if (end) d += roadKm(p, end); return d; }
function twoOpt(start, seq, end) {
  let best = seq.slice(), bestLen = tourKm(start, best, end), improved = true, guard = 0;
  while (improved && guard++ < 60) {
    improved = false;
    for (let i = 0; i < best.length - 1; i++) for (let j = i + 1; j < best.length; j++) {
      const cand = best.slice(0, i).concat(best.slice(i, j + 1).reverse(), best.slice(j + 1));
      const l = tourKm(start, cand, end); if (l < bestLen - 1e-9) { best = cand; bestLen = l; improved = true; }
    }
  }
  return best;
}
/* Fixed-schedule baseline: visit every monitored bin in the same zones, tipping at the facility whenever the van is full. */
function baselineKm(depot, bins, fac, cap) {
  let left = bins.slice(), pos = depot, load = 0, km = 0;
  while (left.length) {
    let bi = 0, bd = Infinity; left.forEach((b, i) => { const d = roadKm(pos, b); if (d < bd) { bd = d; bi = i; } });
    const b = left.splice(bi, 1)[0];
    if (load + b.kg > cap) { km += roadKm(pos, fac) + roadKm(fac, b); load = 0; } else km += bd;
    load += b.kg; pos = b;
  }
  return km + roadKm(pos, fac);
}
function planRoute({ depot, capacity, zone, bins, facilities, intake }) {
  const pool = bins.filter(b => zone === 'All' || b.zone === zone);
  const eligible = pool.filter(b => b.p >= READY && !b.held);
  const heldBins = pool.filter(b => b.p >= READY && b.held);
  let pos = depot, load = 0, seq = [], left = eligible.slice();
  while (left.length) {
    let best = null, score = Infinity;
    for (const b of left) { if (load + b.kg > capacity) continue; const s = roadKm(pos, b) * (b.status === 'overflow' ? 0.55 : 1); if (s < score) { score = s; best = b; } }
    if (!best) break; seq.push(best); load += best.kg; pos = best; left = left.filter(x => x !== best);
  }
  const leftover = left;
  if (!seq.length) return { empty: true, heldBins, eligible };
  const facs = facilities.map(f => ({ ...f, remaining: Math.max(0, f.dailyQuotaKg - (intake[f.id] || 0)) }));
  let cands = facs.filter(f => f.remaining >= load);
  let split = false;
  if (!cands.length) { cands = facs.slice().sort((a, b) => b.remaining - a.remaining).slice(0, 1); split = true; }
  let best = null;
  for (const f of cands) { const s = twoOpt(depot, seq, f); const km = tourKm(depot, s, f); const sc = km - (f.urgent ? 4 : 0); if (!best || sc < best.sc) best = { seq: s, fac: f, km, sc }; }
  const zones = new Set(best.seq.map(b => b.zone));
  const zoneBins = bins.filter(b => zones.has(b.zone));
  const base = baselineKm(depot, zoneBins, best.fac, capacity);
  const minutes = best.km / 28 * 60 + best.seq.length * 6 + 12;
  return { seq: best.seq, fac: best.fac, km: best.km, load, minutes, baselineKm: Math.max(base, best.km), baselineStops: zoneBins.length, heldBins, leftover, split, eligible };
}

/* ---------- data stores ---------- */
function rebaseSeed(seed) {
  const shift = Date.now() - seed.seededAt; const out = {};
  for (const c of COLS) { out[c] = {}; for (const doc of seed[c] || []) { const d = { ...doc }; for (const k in d) if ((k === 'at' || /At$/.test(k)) && typeof d[k] === 'number') d[k] += shift; const id = d.id; delete d.id; out[c][id] = d; } }
  return out;
}
const toMaps = data => Object.fromEntries(COLS.map(c => [c, Object.fromEntries((data[c] || []).map(({ id, ...d }) => [id, clone(d)]))]));
class LocalStore {
  constructor(maps, key) { this.m = maps; this.key = key; this.l = {}; }
  list(c) { return Object.entries(this.m[c] || {}).map(([id, d]) => ({ id, ...d })); }
  sub(c, cb) { (this.l[c] ||= new Set()).add(cb); cb(this.list(c)); return () => this.l[c].delete(cb); }
  emit(c) { if (this.key) { lsSet(this.key, this.m); lsSet('sh-local-saved', Date.now()); } const v = this.list(c); this.l[c]?.forEach(f => f(v)); }
  async add(c, data) { const id = c.slice(0, 2) + '-' + Math.random().toString(36).slice(2, 10); (this.m[c] ||= {})[id] = clone(data); this.emit(c); return id; }
  async set(c, id, data) { (this.m[c] ||= {})[id] = clone(data); this.emit(c); }
  async update(c, id, patch) { const cur = this.m[c]?.[id]; if (!cur) throw { code: 'invalid_argument', message: 'missing' }; this.m[c][id] = { ...cur, ...clone(patch) }; this.emit(c); }
  async del(c, id) { if (this.m[c]) delete this.m[c][id]; this.emit(c); }
}
class CloudStore {
  constructor(db) { this.db = db; }
  sub(c, cb, onErr) { return this.db.collection(c).onSnapshot(s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), e => onErr && onErr(e)); }
  async add(c, data) { const ref = this.db.collection(c).doc(); await ref.set(data); return ref.id; }
  set(c, id, data) { return this.db.doc(c + '/' + id).set(data); }
  update(c, id, p) { return this.db.doc(c + '/' + id).update(p); }
  del(c, id) { return this.db.doc(c + '/' + id).delete(); }
}
async function loadSeed() {
  try { const r = await fetch('seed.json', { cache: 'no-store' }); if (r.ok) return await r.json(); } catch { }
  return null;
}
async function initStore() {
  let db = null, user = null;
  if (window.claude && typeof window.claude.use === 'function') {
    try { [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user').catch(() => null)]); } catch { db = null; }
  }
  if (db) {
    let canWrite = null; try { canWrite = user ? await user.can('data.write') : null; } catch { }
    let empty = false; try { const s = await db.collection('bins').limit(1).get(); empty = s.empty; } catch { }
    if (canWrite === false) {
      const data = {}; for (const c of COLS) { try { const s = await db.collection(c).get(); data[c] = s.docs.map(d => ({ id: d.id, ...d.data() })); } catch { data[c] = []; } }
      let maps = toMaps(data);
      if (empty) { const seed = await loadSeed(); if (seed) maps = rebaseSeed(seed); }
      return { store: new LocalStore(maps, null), mode: 'readonly' };
    }
    return { store: new CloudStore(db), mode: 'cloud', empty };
  }
  const saved = lsGet('sh-local-v2', null);
  if (saved && saved.bins) { const shift = Date.now() - (lsGet('sh-local-saved', Date.now())); for (const col of COLS) for (const d of Object.values(saved[col] || {})) for (const k in d) if ((k === 'at' || /At$/.test(k)) && typeof d[k] === 'number') d[k] += shift; return { store: new LocalStore(saved, 'sh-local-v2'), mode: 'local' }; }
  const seed = await loadSeed();
  return { store: new LocalStore(seed ? rebaseSeed(seed) : Object.fromEntries(COLS.map(c => [c, {}])), 'sh-local-v2'), mode: 'local' };
}
