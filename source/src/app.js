/* ===== App shell, derived data and actions ===== */
const NAV = [
  ['home', 'Home', Ic.home, 'Home'], ['map', 'Smart bin map', Ic.map, 'Map'], ['quotas', 'BSF intake quotas', Ic.gauge, 'Quotas'],
  ['market', 'Marketplace', Ic.bag, 'Market'], ['rewards', 'Harvest points', Ic.gift, 'Rewards'], ['insights', 'Feedback & soil match', Ic.chart, 'Insights'], ['impact', 'Impact & 9Rs', Ic.leaf, 'Impact'],
];
const SUBS = { home: '', map: 'Live fill levels · bins appear once they are 80% full', quotas: 'How much food waste each BSF facility needs today', market: 'Frass fertiliser and BSF feed from local facilities', rewards: 'Earn for sorting, collecting and buying back', insights: 'Does each product fit what buyers need?', impact: 'What the loop changes, and how it scales' };

function useToasts() {
  const [list, setList] = useState([]);
  const push = useCallback((text, o = {}) => { const id = Math.random(); setList(l => [...l.slice(-2), { id, text, ...o }]); setTimeout(() => setList(l => l.filter(t => t.id !== id)), o.ms || 3600); }, []);
  return [list, push];
}

function derive(data, now, roleState) {
  const bins = data.bins.map(b => binState(b, now));
  const binById = Object.fromEntries(bins.map(b => [b.id, b]));
  const facilities = data.facilities.slice().sort((a, b) => b.dailyQuotaKg - a.dailyQuotaKg);
  const facById = Object.fromEntries(facilities.map(f => [f.id, f]));
  const products = data.products.slice().sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const prodById = Object.fromEntries(products.map(p => [p.id, p]));
  const sod = startOfDaySG(now);
  const intake = {}; data.deliveries.filter(d => d.at >= sod).forEach(d => intake[d.facilityId] = (intake[d.facilityId] || 0) + d.kg);
  const openCapacity = sum(facilities, f => Math.max(0, f.dailyQuotaKg - (intake[f.id] || 0)));
  const readyBins = bins.filter(b => b.p >= READY);
  const ratings = {}; Object.entries(groupBy(data.feedback, f => f.productId)).forEach(([pid, a]) => { ratings[pid] = { n: a.length, fit: avg(a.map(x => x.fit)), overall: avg(a.map(x => avg(CRITERIA.map(([k]) => x[k] || x.fit)))) }; });
  const bal = {}, life = {}; data.ledger.forEach(l => { bal[l.who] = (bal[l.who] || 0) + l.delta; if (l.delta > 0) life[l.who] = (life[l.who] || 0) + l.delta; });
  const lbMap = {}; data.drops.filter(d => d.at > now - 30 * DAY && WASTE_TYPES[d.type]?.bsf).forEach(d => lbMap[d.binId] = (lbMap[d.binId] || 0) + d.kg);
  const leaderboard = Object.entries(lbMap).map(([binId, kg]) => ({ binId, kg, name: binById[binId]?.name || binId, zone: binById[binId]?.zone || '' })).sort((a, b) => b.kg - a.kg);
  const facDays = fid => Array.from({ length: 7 }, (_, i) => { const s = sod - (6 - i) * DAY; return { label: dayLabel(s + 12 * H), v: sum(data.deliveries.filter(d => d.facilityId === fid && d.at >= s && d.at < s + DAY), d => d.kg), today: i === 6 }; });
  const gapsOf = t => { const band = CROPS[t.crop] || CROPS['Leafy greens']; return ['n', 'p', 'k', 'ph', 'om'].filter(k => t[k] != null && t[k] < band[k][0]); };
  const rankFor = (gaps, seg) => products.filter(p => p.active !== false && p.stock > 0).map(p => {
    let s = (p.segments || []).includes(seg) ? 3 : 0; const why = [];
    if (p.n != null) { if (gaps.includes('k')) { s += p.k * 2.2; if (p.k >= 3) why.push('High potassium (' + p.k + '% K)'); } if (gaps.includes('n')) { s += p.n * 1.6; if (p.n >= 3) why.push('Nitrogen-rich'); } if (gaps.includes('p')) { s += p.p * 1.6; if (p.p >= 2.4) why.push('Good phosphorus'); } if (gaps.includes('om')) { s += 2; why.push('Adds organic matter'); } if (gaps.includes('ph')) { s += 1; } }
    else if (gaps.length && seg !== 'aquaculture') s -= 3;
    s += (ratings[p.id]?.overall || 3) * 0.6;
    return { ...p, score: s, why: why[0] || ((p.segments || []).includes(seg) ? 'Popular with ' + SEGMENTS[seg].toLowerCase() + 's' : 'Well rated') };
  }).sort((a, b) => b.score - a.score);
  const buyerSegs = { ...Object.fromEntries(PERSONAS_R[REG].buyer.map(p => [p.id, p.segment])) }; data.feedback.forEach(f => { if (!buyerSegs[f.buyerId]) buyerSegs[f.buyerId] = f.segment; });
  const recsFor = buyerId => { const tests = data.soiltests.filter(t => t.buyerId === buyerId).sort((a, b) => b.at - a.at); const seg = buyerSegs[buyerId] || 'farm'; const gaps = tests[0] ? gapsOf(tests[0]) : []; const r = rankFor(gaps, seg); r.gap = gaps; r.test = tests[0]; return r; };
  const pickupsAll = data.pickups;
  const activePickup = roleState.role === 'collector' ? pickupsAll.find(p => p.status === 'Active' && p.collectorId === roleState.personaId) : pickupsAll.find(p => p.status === 'Active');
  const kmSaved = sum(pickupsAll.filter(p => p.status === 'Delivered'), p => Math.max(0, p.baselineKm - p.km));
  const nutrientsKg = sum(data.orders.flatMap(o => o.items), i => { const p = prodById[i.productId]; return p && p.n != null ? i.qty * unitKg(p) * (p.n + p.p + p.k) / 100 : 0; });
  return {
    ...data, bins, binById, facilities, facById, products, prodById, intake, openCapacity, readyBins, overflowing: bins.filter(b => b.status === 'overflow').length,
    ratings, balance: w => Math.round(bal[w] || 0), lifetime: w => Math.round(life[w] || 0), leaderboard, facDays, gapsOf, rankFor, recsFor,
    buyerSeg: id => buyerSegs[id], activePickup, kmSaved, nutrientsKg,
    deliveredToday: sum(Object.values(intake)), deliveredKg7: sum(data.deliveries.filter(d => d.at >= sod - 6 * DAY), d => d.kg),
    dropsKg30: sum(data.drops.filter(d => d.at > now - 30 * DAY), d => d.kg), unitsSold: sum(data.orders.flatMap(o => o.items), i => i.qty),
    pointsIssued: sum(data.ledger.filter(l => l.delta > 0), l => l.delta), depotFor: id => depots().find(d => d.id === id) || depots()[0],
  };
}

function App() {
  const [boot, setBoot] = useState(null);
  const [data, setData] = useState(() => Object.fromEntries(COLS.map(c => [c, []])));
  const [now, setNow] = useState(Date.now());
  const initialView = (() => { try { const h = location.hash.slice(1); return NAV.some(n => n[0] === h) ? h : 'home'; } catch { return 'home'; } })();
  const [view, setView] = useState(initialView);
  const [params, setParams] = useState(null);
  const [role, setRoleS] = useState(() => lsGet('sh-role', 'contributor'));
  const [region, setRegionS] = useState(() => lsGet('sh-region', 'sg'));
  REG = REGIONS[region] ? region : 'sg';
  const [personaIds, setPersonaIds] = useState(() => lsGet('sh-personas', {}));
  const [cart, setCart] = useState(() => lsGet('sh-cart', []));
  const [sheet, setSheet] = useState(null);
  const [toasts, toast] = useToasts();
  const [scrolled, setScrolled] = useState(false);
  const [roleNote, setRoleNote] = useState(null);
  const storeRef = useRef(null); const dataRef = useRef(data); dataRef.current = data;

  useEffect(() => { initStore().then(b => { storeRef.current = b.store; setBoot(b); }); }, []);
  useEffect(() => {
    if (!boot) return; const st = boot.store;
    const offs = COLS.map(col => st.sub(col, list => setData(d => ({ ...d, [col]: list })), e => {
      if (e && (e.code === 'revoked' || e.code === 'not_granted')) { const local = new LocalStore(toMaps(dataRef.current), null); storeRef.current = local; setBoot({ store: local, mode: 'readonly' }); }
    }));
    return () => offs.forEach(o => o && o());
  }, [boot && boot.store]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 20000); return () => clearInterval(t); }, []);
  useEffect(() => { const f = () => setScrolled(scrollY > 4); addEventListener('scroll', f, { passive: true }); return () => removeEventListener('scroll', f); }, []);
  useEffect(() => lsSet('sh-cart', cart), [cart]);

  const dataR = useMemo(() => Object.fromEntries(COLS.map(c => [c, c === 'ledger' ? data[c] : data[c].filter(x => (x.region || 'sg') === REG)])), [data, region]);
  const personasFor = (r, reg = REG) => r === 'facility' ? (data.facilities.some(f => (f.region || 'sg') === reg) ? data.facilities.filter(f => (f.region || 'sg') === reg).sort((a, b) => b.dailyQuotaKg - a.dailyQuotaKg).map(f => ({ id: f.id, name: f.name, sub: 'BSF facility · ' + f.area })) : [{ id: reg === 'kr' ? 'kr-f1' : 'f-tuas', name: reg === 'kr' ? 'Gangseo Larva Center' : 'Tuas Larva Works', sub: 'BSF facility' }]) : PERSONAS_R[reg][r];
  const plist = personasFor(role);
  const persona = { ...(plist.find(p => p.id === personaIds[REG + ':' + role]) || plist[0]) };
  const D = useMemo(() => derive(dataR, now, { role, personaId: persona.id }), [dataR, now, role, persona.id]);

  const setRole = (r, pid, regArg) => {
    const reg = REGIONS[regArg] ? regArg : REG; if (reg !== REG) { REG = reg; setRegionS(reg); lsSet('sh-region', reg); }
    setRoleS(r); lsSet('sh-role', r); let ids = personaIds; const key = reg + ':' + r; if (pid) { ids = { ...personaIds, [key]: pid }; setPersonaIds(ids); lsSet('sh-personas', ids); }
    const pl = personasFor(r, reg); const p = pl.find(x => x.id === ids[key]) || pl[0];
    const id = Date.now(); setRoleNote({ id, role: r, name: p.name, region: reg }); setTimeout(() => setRoleNote(n => n && n.id === id ? null : n), 3200);
    if (!ROLE_NAV[r].includes(view)) go('home');
  };
  const go = (v, p) => { setView(v); setParams(p ? { ...p, n: Date.now() } : null); setSheet(null); try { history.replaceState(null, '', '#' + v); } catch { } try { scrollTo({ top: 0 }); } catch { } };
  const open = (type, props = {}) => setSheet({ type, props });
  const close = () => setSheet(null);

  /* write helper: falls back to a device-only copy if the viewer can't write shared data */
  async function run(op, ok, opts) {
    try { const r = await op(storeRef.current); if (ok) toast(ok, opts); return r ?? true; }
    catch (e) {
      if (boot?.mode === 'cloud' && ['invalid_argument', 'not_granted', 'revoked'].includes(e?.code)) {
        const local = new LocalStore(toMaps(dataRef.current), null); storeRef.current = local; setBoot({ store: local, mode: 'readonly' });
        toast('You can view the shared data but not edit it, so this change is saved on this device only.', { ms: 5200 });
        try { const r = await op(local); if (ok) toast(ok, opts); return r ?? true; } catch (e2) { toast('That didn\'t save. Try again.', { err: true }); return false; }
      }
      toast(e?.code === 'quota_exceeded' ? 'The database is full. Remove old records to add new ones.' : 'That didn\'t save. Check your connection and try again.', { err: true }); return false;
    }
  }
  const award = (st, who, delta, reason) => st.add('ledger', { who, delta, reason, at: Date.now() });

  const act = {
    logDrop: ({ binId, kg, type, clean, contam }) => run(async st => {
      const who = role === 'contributor' ? persona.id : PERSONAS_R[REG].contributor[0].id; const t = Date.now(); const b = binState(dataRef.current.bins.find(x => x.id === binId), t);
      const bsf = WASTE_TYPES[type].bsf; const p = bsf ? Math.round(kg * 2) + (clean ? 10 : 0) : 5;
      await st.add('drops', { region: REG, binId, who, kg, type, clean, at: t });
      if (bsf) await st.update('bins', binId, { fillKg: Math.min(b.capacityKg, b.kg + kg), updatedAt: t, contamPct: +(((b.contamPct || 0) * Math.max(b.kg, 1) + contam * kg) / (Math.max(b.kg, 1) + kg)).toFixed(1) });
      await award(st, who, p, bsf ? `Logged ${kg} kg ${clean ? 'clean ' : ''}food waste` : `Sorted ${kg} kg ${type === 'oil' ? 'cooking oil' : 'bones & shells'} for recovery`);
      return p;
    }, null).then(p => p && toast(impactBurst(kg, p, 'drop-off logged'), { ms: 4800, burst: true })),
    simulate: kind => run(async st => {
      const t = Date.now(); const bs = dataRef.current.bins.map(b => binState(b, t));
      const ups = bs.map(b => { let kg;
        if (kind === 'hour') kg = Math.min(b.capacityKg, b.kg + b.ratePerHr * (1.6 + Math.random()));
        else if (kind === 'lunch') kg = b.capacityKg * (Math.random() < 0.45 ? 0.8 + Math.random() * 0.22 : 0.35 + Math.random() * 0.4);
        else kg = b.capacityKg * (0.08 + Math.random() * 0.3);
        const patch = { fillKg: Math.round(Math.min(b.capacityKg, kg)), updatedAt: t }; if (kind === 'morning') { patch.lastEmptiedAt = t - 8 * H; if (b.contamPct > CONTAM_LIMIT) patch.contamPct = 4.2; } return [b.id, patch]; });
      for (let i = 0; i < ups.length; i += 6) await Promise.all(ups.slice(i, i + 6).map(([id, p]) => st.update('bins', id, p)));
    }, kind === 'hour' ? 'Sensors moved forward 1 hour' : kind === 'lunch' ? 'Lunch rush simulated: check the ready bins' : 'Bins reset to an early-morning state'),
    startRoute: plan => run(async st => {
      await st.add('pickups', { region: REG, collectorId: persona.id, depot: plan.depot.id, zone: plan.area === 'All' ? 'Island-wide' : plan.area, facilityId: plan.fac.id, stops: plan.seq.map(b => ({ binId: b.id, kg: b.kg, done: false })), loadKg: plan.load, km: +plan.km.toFixed(1), baselineKm: +plan.baselineKm.toFixed(1), status: 'Active', at: Date.now() });
    }, 'Route started. Tick off each stop as you collect.'),
    collectStop: (p, i) => run(async st => {
      const t = Date.now(); const s = p.stops[i]; const b = binState(dataRef.current.bins.find(x => x.id === s.binId), t);
      await st.update('bins', s.binId, { fillKg: 0, updatedAt: t, lastEmptiedAt: t });
      const stops = p.stops.map((x, j) => j === i ? { ...x, done: true, kg: b.kg, at: t } : x);
      await st.update('pickups', p.id, { stops });
    }, 'Collected · caddy swapped'),
    deliverRoute: p => run(async st => {
      const done = p.stops.filter(s => s.done); const kg = sum(done, s => s.kg); const t = Date.now();
      await st.add('deliveries', { region: REG, facilityId: p.facilityId, collectorId: p.collectorId, kg, stops: done.length, km: p.km, at: t });
      await st.update('pickups', p.id, { status: 'Delivered', loadKg: kg, stops: done, caddies: done.length, at: t });
      const ptsN = Math.round(kg / 10) + 25; await award(st, p.collectorId, ptsN, `Route delivered · ${fmt(kg)} kg to BSF`);
      return [ptsN, kg];
    }).then(r => r && toast(impactBurst(r[1], r[0], 'delivered to ' + (D.facById[p.facilityId]?.name || 'BSF')), { ms: 5200, burst: true })),
    cancelRoute: p => run(st => st.del('pickups', p.id), 'Route cancelled'),
    saveFacility: (id, patch) => run(st => st.update('facilities', id, patch), 'Quota updated. Collectors see it now.'),
    saveProduct: (id, body) => run(async st => { if (id) await st.set('products', id, body); else await st.add('products', { ...body, region: REG }); }, id ? 'Listing updated' : 'Product listed in the marketplace'),
    placeOrder: ({ lines, voucher, points, subtotal, total }) => run(async st => {
      const t = Date.now(); const items = lines.map(l => ({ productId: l.id, name: l.p.name, qty: l.qty, price: l.p.price, facilityId: l.p.facilityId }));
      await st.add('orders', { region: REG, buyerId: persona.id, items, subtotal: +subtotal.toFixed(2), pointsUsed: points, voucherValue: voucher ? voucher.value : 0, discount: +(subtotal - total).toFixed(2), total: +total.toFixed(2), status: 'Confirmed', at: t });
      for (const l of lines) await st.update('products', l.id, { stock: Math.max(0, (l.p.stock || 0) - l.qty) });
      if (points > 0) await award(st, persona.id, -points, 'Used at checkout');
      if (voucher) await st.update('vouchers', voucher.id, { used: true });
      const earn = Math.floor(total / R_().unit); if (earn > 0) await award(st, persona.id, earn, 'Purchase reward (1% back)');
      setCart([]); return earn;
    }).then(n => { if (n !== false) toast(html`<span class="row"><${Coin}/>Order placed · +${n} points</span>`); return n !== false; }),
    redeem: r => run(async st => {
      if (D.balance(persona.id) < r.cost) throw { code: 'local', message: 'Not enough points' };
      await award(st, persona.id, -r.cost, 'Redeemed: ' + r.title);
      await st.add('vouchers', { region: REG, who: persona.id, rewardId: r.id, title: r.title, value: r.value || 0, min: r.min || 0, code: code(), used: false, at: Date.now() });
    }, null).then(ok => ok && toast(html`<span class="row">${Ic.gift()} Redeemed: ${r.title}. Voucher added.</span>`)),
    submitFeedback: fb => run(async st => { await st.add('feedback', { region: REG, ...fb, at: Date.now() }); await award(st, fb.buyerId, 15, 'Product feedback'); }, null).then(ok => ok && toast(html`<span class="row"><${Coin}/>+15 points · thanks, the facility sees this now</span>`)),
    submitSoil: t => run(async st => { await st.add('soiltests', { region: REG, ...t, at: Date.now() }); await award(st, t.buyerId, 20, 'Soil test submitted'); }, null).then(ok => ok && toast(html`<span class="row"><${Coin}/>+20 points · soil test saved</span>`)),
    seedCloud: () => run(async st => {
      const seed = await loadSeed(); if (!seed) throw { code: 'local' }; const maps = rebaseSeed(seed);
      for (const col of COLS) { const ents = Object.entries(maps[col]); for (let i = 0; i < ents.length; i += 5) await Promise.all(ents.slice(i, i + 5).map(([id, d]) => st.set(col, id, d))); }
      setBoot(b => ({ ...b, empty: false }));
    }, 'Sample data loaded'),
    resetLocal: async () => { try { localStorage.removeItem('sh-local-v2'); } catch { } const seed = await loadSeed(); if (!seed) return; const local = new LocalStore(rebaseSeed(seed), boot.mode === 'local' ? 'sh-local-v2' : null); storeRef.current = local; setBoot({ store: local, mode: boot.mode }); setSheet(null); toast('Demo data reset'); },
  };
  const addToCart = (id, n = 1) => { setCart(cs => { const f = cs.find(x => x.id === id); return f ? cs.map(x => x.id === id ? { ...x, qty: x.qty + n } : x) : [...cs, { id, qty: n }]; }); toast(html`<span class="row">${Ic.cart()} Added to cart</span>`, { ms: 1500 }); };
  const setQty = (id, n) => setCart(cs => n <= 0 ? cs.filter(x => x.id !== id) : cs.map(x => x.id === id ? { ...x, qty: n } : x));

  const c = { D, now, role, persona, moreItems: [], setRole, personasFor, go, open, close, act, cart, addToCart, setQty, mode: boot?.mode, empty: boot?.empty, toast };
  const cartN = sum(cart, x => x.qty);
  const readyN = D.readyBins.filter(b => !b.held).length;
  const navBadge = k => k === 'map' && readyN ? readyN : null;

  if (!boot) return html`<div class="splash"><div class="in"><${Mark} size=${84}/><div class="brand-name" style="font-size:24px">Second <b>Harvest</b></div><div class="small muted">Giving food a second life!</div></div></div>`;

  const allowed = ROLE_NAV[role]; const navItems = NAV.filter(n => allowed.includes(n[0]));
  const tabItems = navItems.length <= 5 ? navItems.map(n => [n[0], n[3], n[2]]) : [...navItems.slice(0, 4).map(n => [n[0], n[3], n[2]]), ['more', 'More', Ic.dots]];
  const moreItems = navItems.length <= 5 ? [] : navItems.slice(4);
  const V = { home: Home, map: MapView, quotas: Quotas, market: Market, rewards: Rewards, insights: Insights, impact: Impact }[view] || Home;
  const title = view === 'home' ? `Hello, ${persona.name.split(' ')[0]}` : NAV.find(n => n[0] === view)[1];
  const modeLabel = boot.mode === 'cloud' ? 'Live shared database' : boot.mode === 'readonly' ? 'Viewing shared data' : 'Device-only demo';
  const S = sheet && ({ role: RoleSheet, about: AboutSheet, quota: QuotaSheet, product: ProductSheet, cart: CartSheet, editProduct: ProductEditSheet, drop: DropSheet, more: MoreSheet })[sheet.type];
  return html`<div class="shell">
    <aside class="side">
      <div class="brand"><${Mark} cls="brand-mark" size=${42}/><div><div class="brand-name">Second <b>Harvest</b></div><div class="brand-tag">Giving food a second life!</div></div></div>
      <button class="persona-btn" onClick=${() => open('role')} aria-label="Switch account"><${Avatar} role=${role}/><div class="grow" style="min-width:0"><div class="role">${ROLE_LABEL[role]}</div><div class="who">${persona.name}</div></div><span style="width:18px;color:var(--ink-3)" class="swap-ic">${Ic.swap()}</span></button>
      <nav class="nav" aria-label="Main">${NAV.filter(n => ROLE_NAV[role].includes(n[0])).map(([k, l, I, s]) => html`<button aria-current=${view === k ? 'page' : null} onClick=${() => go(k)} title=${l}>${I()}<span class="lbl">${l}</span><span class="lbl-short">${s}</span>${navBadge(k) && html`<span class="badge">${navBadge(k)}</span>`}</button>`)}</nav>
      <div class="side-foot"><button class="mode" onClick=${() => open('about')} title=${modeLabel}><span class=${'dot ' + (boot.mode === 'cloud' ? 'live' : 'local')}></span><span class="mode-txt"><b style="color:var(--ink)">${modeLabel}</b><br/>Prototype · sample data</span></button></div>
    </aside>
    <div class="main">
      <header class=${'top' + (scrolled ? ' scrolled' : '')}>
        <${Mark} cls="top-mark" size=${34}/>
        <div style="min-width:0"><h1>${title}</h1>${SUBS[view] ? html`<div class="sub">${SUBS[view]}</div>` : view === 'home' && html`<div class="sub">${ROLE_LABEL[role]} · ${persona.sub}</div>`}</div>
        <div class="top-actions">
          ${role !== 'facility' && html`<button class="points" onClick=${() => go('rewards')} aria-label="Harvest points"><${Coin}/><span class="num">${fmt(D.balance(persona.id))}</span></button>`}
          ${(role === 'buyer' || cartN > 0) && html`<button class="icon-btn" aria-label="Cart" onClick=${() => open('cart')}>${Ic.cart()}${cartN > 0 && html`<span class="badge">${cartN}</span>`}</button>`}
          <button class="icon-btn phone-only" aria-label="Switch account" onClick=${() => open('role')}>${Ic.user()}</button>
        </div></header>
      <main class="view" key=${view + REG + role + persona.id}><${V} c=${c} params=${params}/></main>
    </div>
    <nav class="tabs" aria-label="Main" style=${`grid-template-columns:repeat(${tabItems.length},1fr)`}>${tabItems.map(([k, l, I]) => html`<button aria-current=${(k === view || (k === 'more' && moreItems.some(m => m[0] === view))) ? 'page' : null} onClick=${() => k === 'more' ? open('more') : go(k)}>${I()}<span>${l}</span>${navBadge(k) && html`<span class="badge">${navBadge(k)}</span>`}</button>`)}</nav>
    ${S && html`<${S} c=${c} ...${sheet.props} onClose=${close}/>`}
    <div class="toasts" aria-live="polite">${toasts.map(t => html`<div class=${'toast' + (t.err ? ' err' : '') + (t.burst ? ' burst-t' : '')}>${t.text}</div>`)}</div>
    <${RoleNote} note=${roleNote}/>
    <${TipLayer}/>
  </div>`;
}

function MoreSheet({ c, onClose }) {
  return html`<${Sheet} title="More" onClose=${onClose}>
    <button class="persona-btn" onClick=${() => c.open('role')}><${Avatar} role=${c.role}/><div class="grow"><div class="role">${ROLE_LABEL[c.role]}</div><div class="who">${c.persona.name}</div></div>${Ic.swap()}</button>
    <div class="list">${(() => { const n = NAV.filter(v => ROLE_NAV[c.role].includes(v[0])); return n.length > 5 ? n.slice(4) : []; })().map(([k, l, I]) => [k, l, I]).map(([k, l, I]) => html`<button class="li" onClick=${() => c.go(k)}><span style="width:22px;color:var(--brand)">${I()}</span><span class="grow" style="font-weight:650">${l}</span><span style="width:18px;color:var(--ink-3)">${Ic.chev()}</span></button>`)}
      <button class="li" onClick=${() => c.open('about')}><span style="width:22px;color:var(--brand)">${Ic.info()}</span><span class="grow" style="font-weight:650">About this prototype</span><span style="width:18px;color:var(--ink-3)">${Ic.chev()}</span></button></div>
  </${Sheet}>`;
}

render(html`<${App}/>`, document.getElementById('app'));
