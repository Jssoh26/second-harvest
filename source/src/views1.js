/* ===== Home ===== */
function LoopStrip({ c }) {
  const { D } = c;
  const steps = [
    ['stall', REG === 'kr' ? 'Markets & cafeterias' : 'Hawkers & canteens', 'Sort food waste', fmt(D.dropsKg30) + ' kg logged'],
    ['bin', 'Smart bins', 'Alert at 80% full', D.readyBins.length + ' ready now'],
    ['van', 'Collectors', 'Routed pickups', fmt(D.kmSaved, 0) + ' km saved'],
    ['factory', 'BSF facilities', 'Larvae eat the waste', fmt(D.deliveredKg7 / 1000, 1) + ' t this week'],
    ['farm', 'Farms & fish farms', 'Frass & feed', fmt(D.unitsSold) + ' packs sold'],
    ['plate', 'Back to the plate', 'Food grows again', fmt(D.nutrientsKg, 0) + ' kg NPK returned'],
  ];
  return html`<div class="card"><div class="card-h"><div><div class="eyebrow">The loop, live</div><h2>How one bowl of leftovers comes back</h2></div></div>
    <div class="loop">${steps.map(([a, t, s, v]) => html`<div class="loop-step"><div class="ico">${a === 'bin' ? Art.bin(0.86) : Art[a]()}</div><b>${t}</b><span>${s}</span><span class="lv">${v}</span></div>`)}</div></div>`;
}

function Home({ c }) {
  const { role, persona, D } = c;
  const greet = (() => { const h = sgParts(c.now).h; return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; })();
  const heroStats = [
    [fmt(D.readyBins.length), 'bins ready for pickup'],
    [fmt(D.openCapacity) + ' kg', 'BSF capacity open today'],
    [fmt(D.deliveredToday) + ' kg', 'diverted from incineration today'],
  ];
  return html`
    <section class="hero grow-in">
      <div><div class="eyebrow" style="color:#9FD3AE">${greet}, ${persona.name}</div>
        <h2 style="margin-top:6px">Giving food a second life, one bin at a time.</h2>
        <p style="margin-top:8px">Smart bins call collectors only when they are 80% full. Collectors deliver to the BSF facility with room to spare, and the larvae turn it into fertiliser and fish feed that you can buy back with points.</p>
        <div class="hero-stats">${heroStats.map(([v, k]) => html`<div><div class="hv">${v}</div><div class="hk">${k}</div></div>`)}</div></div>
      <${HeroArt}/>
    </section>
    <div class="row wrap between"><${Seg} label="View as" value=${role} onChange=${r => c.setRole(r)} options=${Object.entries(ROLE_LABEL)}/>
      <button class="btn sm ghost" onClick=${() => c.open('role')}>${Ic.swap()} Switch account</button></div>
    ${role === 'contributor' && html`<${HomeContributor} c=${c}/><${ContributorExtras} c=${c}/><${HarvestShop} c=${c} compact/>`}
    ${role === 'collector' && html`<${HomeCollector} c=${c}/>`}
    ${role === 'facility' && html`<${HomeFacility} c=${c}/>`}
    ${role === 'buyer' && html`<${HomeBuyer} c=${c}/>`}
    ${REG === 'kr' && html`<${SeoulCard}/>`}
    <${LiveImpact} c=${c}/>
    <${LoopStrip} c=${c}/>`;
}

function HomeContributor({ c }) {
  const { persona, D } = c; const myBin = D.binById[persona.binId];
  const mine = D.drops.filter(d => d.who === persona.id).sort((a, b) => b.at - a.at);
  const kg30 = sum(mine.filter(d => d.at > c.now - 30 * DAY), d => d.kg);
  const rank = D.leaderboard.findIndex(r => r.binId === persona.binId) + 1;
  return html`<div class="split">
    <div class="card"><div class="card-h"><div><div class="eyebrow">Log a drop-off</div><h2>Sort it, scan it, earn points</h2></div><${RTag} r="Redesign"/></div>
      <${DropForm} c=${c} binId=${persona.binId}/></div>
    <div class="stack">
      ${myBin && html`<div class="card"><div class="binmini">${Art.bin(myBin.p)}<div class="grow stack" style="gap:6px">
        <div class="eyebrow">Your collection point</div><h3>${myBin.name}</h3>
        <div class="row wrap"><span class="num" style="font-size:22px;font-weight:600">${pct(myBin.p)}</span><${StatusPill} status=${myBin.status}/></div>
        <div class="small muted">${myBin.p >= READY ? 'A collector can see this bin on the map now.' : `Collectors will be alerted in about ${fmt(myBin.toReady, 1)} h at the current rate.`}</div>
        <button class="btn sm" style="align-self:flex-start" onClick=${() => c.go('map', { select: myBin.id })}>${Ic.map()} See on map</button></div></div></div>`}
      <div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">
        <${Stat} v=${fmt(kg30)} unit="kg" k="Sorted in 30 days"/>
        <${Stat} v=${rank ? '#' + rank : '–'} k="Collection point rank" d=${'of ' + D.leaderboard.length + ' points'}/>
      </div>
      <div class="card"><div class="card-h"><h3>Recent drop-offs</h3></div>
        ${mine.length ? html`<div class="list">${mine.slice(0, 5).map(d => html`<div class="li"><div class="grow"><b class="small">${fmt(d.kg)} kg · ${WASTE_TYPES[d.type]?.label}</b><div class="tiny faint">${D.binById[d.binId]?.name} · ${ago(d.at, c.now)}</div></div>${WASTE_TYPES[d.type]?.bsf ? (d.clean ? html`<span class="pill good">Clean</span>` : html`<span class="pill warn">Mixed</span>`) : html`<span class="pill info">Recover</span>`}</div>`)}</div>` : html`<${Empty} title="No drop-offs yet">Log your first one on the left.</${Empty}>`}
      </div></div></div>`;
}

function DropForm({ c, binId, onDone }) {
  const { D } = c;
  const [bin, setBin] = useState(binId || D.bins[0]?.id);
  const [kg, setKg] = useState(12);
  const [type, setType] = useState('cooked');
  const [checks, setChecks] = useState([true, true, false]);
  const [scan, setScan] = useState(null);
  const [busy, setBusy] = useState(false);
  const wt = WASTE_TYPES[type];
  const items = ['No plastic, packaging or cutlery', 'No tissue, chopsticks or skewers', 'Soup and liquids drained'];
  const doScan = () => { setScan('scanning'); setTimeout(() => { const ok = checks.every(Boolean); setScan({ contam: ok ? +(0.6 + Math.random() * 2.4).toFixed(1) : +(6 + Math.random() * 9).toFixed(1) }); }, 2600); };
  const clean = scan && scan !== 'scanning' && scan.contam < 5;
  const pts = wt.bsf ? Math.round(kg * 2) + (clean ? 10 : 0) : 5;
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    await c.act.logDrop({ binId: bin, kg, type, clean: !!clean, contam: scan && scan !== 'scanning' ? scan.contam : (checks.every(Boolean) ? 2 : 9) });
    setBusy(false); setScan(null); onDone && onDone();
  };
  return html`<form class="stack" style="gap:16px" onSubmit=${submit}>
    <div class="field"><label for="drop-bin">Collection point</label>
      <select id="drop-bin" class="input" value=${bin} onChange=${e => setBin(e.target.value)}>
        ${zonesOf().map(z => html`<optgroup label=${z}>${D.bins.filter(b => b.zone === z).map(b => html`<option value=${b.id}>${b.name}</option>`)}</optgroup>`)}</select></div>
    <div class="field"><span class="label">What are you dropping off?</span>
      <div class="chips">${Object.entries(WASTE_TYPES).map(([k, v]) => html`<button type="button" class="chip" aria-pressed=${type === k} onClick=${() => setType(k)}>${v.label}</button>`)}</div></div>
    ${!wt.bsf && html`<div class="row" style="align-items:flex-start;padding:12px;border-radius:12px;background:var(--info-soft);color:var(--info)"><span style="width:20px;flex:none">${Ic.info()}</span><div class="small"><b>Recover, not BSF.</b> ${wt.recover}</div><${RTag} r="Recover"/></div>`}
    <div class="row wrap" style="gap:18px;align-items:flex-end"><div class="field"><label for="drop-kg">Weight (kg)</label><${Stepper} id="drop-kg" value=${kg} step=${1} min=${1} max=${200} onChange=${setKg}/></div>
      <div class="small muted" style="padding-bottom:10px">Smart-bin scale confirms the weight on drop.</div></div>
    ${wt.bsf && html`<div class="field"><span class="label">Segregation check</span>
      <div class="stack" style="gap:6px">${items.map((t, i) => html`<label class="check"><input type="checkbox" checked=${checks[i]} onChange=${e => { const n = checks.slice(); n[i] = e.target.checked; setChecks(n); setScan(null); }}/>${t}</label>`)}</div></div>
    ${scan && html`<${ScanView} state=${scan === 'scanning' ? 'scanning' : 'done'} dirty=${!checks.every(Boolean)} contam=${scan.contam}/>`}
    <div class="row wrap" style="padding:12px;border-radius:14px;background:var(--surface-2)">
      <button type="button" class="btn sm" onClick=${doScan} disabled=${scan === 'scanning'}>${Ic.scan()} ${scan === 'scanning' ? 'Scanning…' : 'Scan with bin camera'}</button>
      <div class="grow small">${!scan ? html`<span class="muted">The lid camera checks for plastics before the waste goes in.</span>` : scan === 'scanning' ? html`<span class="muted">Checking for plastics and packaging…</span>` :
        html`<span><b style=${clean ? 'color:var(--good)' : 'color:var(--warn)'}>${clean ? 'Clean' : 'Contaminants spotted'}</b> · ${scan.contam}% non-food detected${!clean ? '. Pick out the packaging to earn the clean bonus.' : ''}</span>`}</div>
      <${RTag} r="Reject"/></div>`}
    <div class="row between wrap"><span class="points"><${Coin}/>+${pts} points</span>
      <button class="btn primary" type="submit" disabled=${busy}>${busy ? 'Saving…' : 'Log drop-off'}</button></div>
  </form>`;
}

function HomeCollector({ c }) {
  const { D, persona } = c; const active = D.activePickup;
  const loadKg = sum(D.readyBins.filter(b => !b.held), b => b.kg);
  const mine = D.pickups.filter(p => p.collectorId === persona.id && p.status === 'Delivered').sort((a, b) => b.at - a.at);
  const saved = sum(mine, p => p.baselineKm - p.km);
  return html`<div class="stats">
      <${Stat} v=${D.readyBins.filter(b => !b.held).length} k="Bins ready to collect" d=${D.overflowing + ' overflowing'} tone=${D.overflowing ? 'var(--crit)' : ''}/>
      <${Stat} v=${fmt(loadKg)} unit="kg" k="Waiting in ready bins"/>
      <${Stat} v=${fmt(D.openCapacity)} unit="kg" k="BSF capacity open today"/>
      <${Stat} v=${fmt(saved, 1)} unit="km" k="Saved by smart routing" d=${fmt(saved * VAN_CO2_PER_KM, 1) + ' kg CO₂e avoided'}/></div>
    <div class="split"><div class="card"><div class="card-h"><div><div class="eyebrow">${active ? 'Route in progress' : 'Next run'}</div><h2>${active ? `${active.stops.filter(s => s.done).length} of ${active.stops.length} stops collected` : 'Plan a route from live bin levels'}</h2></div><${RTag} r="Reduce"/></div>
      ${active ? html`<${ActiveRoute} c=${c} p=${active}/>` : html`<p class="muted">The planner skips bins under 80%, holds bins with too much plastic, fills your van up to capacity and ends at the facility that still needs waste today.</p>
        <div class="row wrap" style="margin-top:16px"><button class="btn primary" onClick=${() => c.go('map', { tab: 'route' })}>${Ic.route()} Open route planner</button><button class="btn" onClick=${() => c.go('quotas')}>${Ic.gauge()} Facility quotas</button></div>`}</div>
      <div class="card"><div class="card-h"><h3>Recent routes</h3></div><div class="list">${mine.slice(0, 5).map(p => html`<div class="li"><div class="grow"><b class="small">${fmt(p.loadKg)} kg → ${D.facById[p.facilityId]?.name || 'Facility'}</b><div class="tiny faint">${p.zone || ''} · ${p.stops} stops · ${ago(p.at, c.now)}</div></div><span class="pill good">−${fmt(p.baselineKm - p.km, 1)} km</span></div>`)}</div></div></div>`;
}

function HomeFacility({ c }) {
  const { D, persona } = c; const f = D.facById[persona.id]; if (!f) return null;
  const got = D.intake[f.id] || 0; const p = got / f.dailyQuotaKg;
  const incoming = D.pickups.filter(x => x.status === 'Active' && x.facilityId === f.id);
  const prods = D.products.filter(x => x.facilityId === f.id);
  const fb = D.feedback.filter(x => x.facilityId === f.id);
  return html`<div class="split"><div class="card"><div class="card-h"><div><div class="eyebrow">Today's intake</div><h2>${f.name}</h2></div><button class="btn sm" onClick=${() => c.open('quota', { id: f.id })}>${Ic.edit()} Update quota</button></div>
      <div class="gaugebox"><${Ring} p=${p} color=${p >= 1 ? 'var(--good)' : 'var(--brand)'}><text x="52" y="50" text-anchor="middle" style="font:700 20px var(--f-display);fill:var(--ink)">${pct(p)}</text><text x="52" y="66" text-anchor="middle" style="font:600 11px var(--f-ui);fill:var(--ink-3)">of quota</text></${Ring}>
        <div class="stack" style="gap:4px"><div><span class="num" style="font-size:22px;font-weight:600">${fmt(got)}</span> <span class="muted">/ ${fmt(f.dailyQuotaKg)} kg</span></div>
          <div class="small muted">${fmt(Math.max(0, f.dailyQuotaKg - got))} kg still needed · window ${f.window}</div>
          <div class="small">Expected output: <b>${fmt(got * BSF.larvae)} kg</b> larvae, <b>${fmt(got * BSF.frass)} kg</b> frass <${RTag} r="Recycle"/></div>
          ${incoming.length ? html`<span class="pill info" style="align-self:flex-start">${Ic.truck()} ${incoming.length} van on the way · ${fmt(sum(incoming, x => x.loadKg))} kg</span>` : ''}</div></div>
      <div style="margin-top:18px"><div class="eyebrow" style="margin-bottom:6px">Last 7 days</div><${DayBars} days=${D.facDays(f.id)} quota=${f.dailyQuotaKg}/></div></div>
    <div class="stack"><div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr))">
        <${Stat} v=${fmt(avg(fb.map(x => x.fit)), 1)} unit="/ 5" k="Buyer fit score" d=${fb.length + ' responses'}/>
        <${Stat} v=${prods.length} k="Products listed" d=${prods.filter(x => x.stock < 40).length + ' low on stock'}/></div>
      <div class="card"><div class="card-h"><h3>Your listings</h3><button class="btn sm" onClick=${() => c.go('market', { tab: 'listings' })}>Manage</button></div>
        <div class="list">${prods.map(x => html`<div class="li"><div class="avatar" style="width:44px;height:44px">${html`<${ProductArt} art=${x.art} hue=${x.hue}/>`}</div><div class="grow"><b class="small">${x.name}</b><div class="tiny faint">${money(x.price)} · ${x.unit}</div></div><span class=${'pill ' + (x.stock < 40 ? 'warn' : 'neutral')}>${fmt(x.stock)} left</span></div>`)}</div></div>
      <button class="btn" onClick=${() => c.go('insights')}>${Ic.chart()} Open feedback analytics</button></div></div>`;
}

function HomeBuyer({ c }) {
  const { D, persona } = c;
  const all = D.recsFor(persona.id); const recs = all.slice(0, 3);
  const orders = D.orders.filter(o => o.buyerId === persona.id).sort((a, b) => b.at - a.at);
  const vouchers = D.vouchers.filter(v => v.who === persona.id && !v.used);
  return html`<${BuyerPerks} c=${c}/><div class="split"><div class="card"><div class="card-h"><div><div class="eyebrow">Picked for ${SEGMENTS[persona.segment].toLowerCase()}</div><h2>${all.gap && all.gap.length ? 'Matches your last soil test' : 'Recommended for you'}</h2></div><${RTag} r="Repair"/></div>
      <div class="products recs">${recs.map(p => html`<${ProductCard} c=${c} p=${p} compact/>`)}</div>
      <div class="row wrap" style="margin-top:14px"><button class="btn primary" onClick=${() => c.go('market')}>${Ic.bag()} Browse marketplace</button><button class="btn" onClick=${() => c.go('insights', { tab: 'soil' })}>${Ic.flask()} Submit a soil test</button></div></div>
    <div class="stack"><div class="card"><div class="card-h"><h3>Your orders</h3></div>${orders.length ? html`<div class="list">${orders.slice(0, 4).map(o => html`<div class="li"><div class="grow"><b class="small">${o.items.map(i => i.qty + '× ' + i.name).join(', ')}</b><div class="tiny faint">${money(o.total)} · ${ago(o.at, c.now)}</div></div><span class=${'pill ' + (o.status === 'Delivered' ? 'good' : 'info')}>${o.status}</span></div>`)}</div>` : html`<${Empty} title="No orders yet">Your first order earns 1 point per dollar.</${Empty}>`}</div></div></div>`;
}

function ActiveRoute({ c, p }) {
  const { D } = c; const fac = D.facById[p.facilityId]; const done = p.stops.filter(s => s.done);
  const kg = sum(done, s => s.kg);
  const [busy, setBusy] = useState(false);
  const go = async f => { setBusy(true); try { await f(); } finally { setBusy(false); } };
  return html`<div class="stack" style="gap:12px"><${Bar} p=${done.length / p.stops.length}/>
    <div class="stops">${p.stops.map((s, i) => { const b = D.binById[s.binId]; return html`<div class=${'stop' + (s.done ? ' done' : '')}><span class="n">${s.done ? Ic.check() : i + 1}</span>
      <div style="min-width:0"><b class="small nm">${b?.name || s.binId}</b><div class="tiny faint">${s.done ? `${fmt(s.kg)} kg collected · caddy swapped` : `${b ? pct(b.p) + ' · ' + fmt(b.kg) + ' kg' : ''}`}</div></div>
      ${s.done ? html`<span class="pill good">Done</span>` : html`<button class="btn sm" disabled=${busy || c.role !== 'collector'} onClick=${() => go(() => c.act.collectStop(p, i))}>Collected</button>`}</div>`; })}
      ${fac && html`<div class="stop fac"><span class="n">${Ic.check()}</span><div><b class="small">${fac.name}</b><div class="tiny faint">${fmt(Math.max(0, fac.dailyQuotaKg - (D.intake[fac.id] || 0)))} kg open · ${fac.window}</div></div><span></span></div>`}</div>
    <div class="row wrap"><button class="btn primary grow" disabled=${busy || !done.length || c.role !== 'collector'} onClick=${() => go(() => c.act.deliverRoute(p))}>${Ic.check()} Deliver ${fmt(kg)} kg${fac ? ' to ' + fac.name.split(' ')[0] : ''}</button>
      <button class="btn ghost" disabled=${busy || c.role !== 'collector'} onClick=${() => go(() => c.act.cancelRoute(p))}>Cancel</button></div>
    <div class="tiny faint"><${RTag} r="Reuse"/> Each stop swaps a full sealed caddy for a washed one, so no plastic liners are used.</div></div>`;
}

/* ===== Quotas ===== */
function Quotas({ c }) {
  const { D, role, persona } = c;
  const supply = sum(D.readyBins.filter(b => !b.held), b => b.kg);
  const demand = D.openCapacity;
  return html`<div class="card"><div class="card-h"><div><div class="eyebrow">Today across Singapore</div><h2>Waste waiting vs. larvae still hungry</h2></div><${RTag} r="Recycle"/></div>
      <div class="balance"><div class="row between small"><span><b class="num">${fmt(supply)} kg</b> waiting in ready bins</span><span><b class="num">${fmt(demand)} kg</b> open at BSF facilities</span></div>
        <${Bar} p=${demand ? supply / (supply + demand) : 1} cls="kaya"/>
        <div class="small muted">${supply > demand ? 'More waste than open capacity: facilities can raise quotas or collectors hold low-priority bins.' : 'Facilities can take everything that is ready. Routes will prioritise urgent facilities.'}</div></div></div>
    <div class="grid g3">${D.facilities.map(f => { const got = D.intake[f.id] || 0; const p = got / f.dailyQuotaKg; const rem = Math.max(0, f.dailyQuotaKg - got); const mine = role === 'facility' && persona.id === f.id;
      const status = p >= 1 ? ['Full today', 'neutral'] : f.urgent ? ['Urgent need', 'crit'] : p < 0.5 ? ['Hungry', 'warn'] : ['Steady', 'good'];
      return html`<div class=${'card fac-card' + (mine ? ' lift' : '')} style=${mine ? 'outline:2px solid var(--brand)' : ''}>
        <div class="fac-top"><div class="fac-art">${Art.factory()}</div><div class="grow" style="min-width:0"><h3>${f.name}</h3><div class="small muted">${f.area} · ${f.window}</div></div><span class=${'pill ' + status[1]}>${status[0]}</span></div>
        <div class="gaugebox"><${Ring} p=${p} size=${92} stroke=${9} color=${p >= 1 ? 'var(--ink-3)' : 'var(--brand)'}><text x="46" y="44" text-anchor="middle" style="font:700 17px var(--f-display);fill:var(--ink)">${fmt(rem)}</text><text x="46" y="60" text-anchor="middle" style="font:600 10.5px var(--f-ui);fill:var(--ink-3)">kg open</text></${Ring}>
          <div class="stack" style="gap:3px"><div class="small"><b class="num">${fmt(got)}</b> <span class="muted">of ${fmt(f.dailyQuotaKg)} kg/day received</span></div><div class="tiny faint">Max capacity ${fmt(f.maxCapacityKg)} kg</div>
            <div class="tiny faint">Today → ~${fmt(got * BSF.larvae)} kg larvae, ${fmt(got * BSF.frass)} kg frass</div></div></div>
        <div class="chips">${f.accepts.map(a => html`<span class="pill neutral">${ACCEPT_LABEL[a]}</span>`)}</div>
        ${f.note && html`<p class="small muted">${f.note}</p>`}
        <${DayBars} days=${D.facDays(f.id)} quota=${f.dailyQuotaKg} height=${110}/>
        <div class="row wrap" style="margin-top:auto">${mine ? html`<button class="btn primary sm" onClick=${() => c.open('quota', { id: f.id })}>${Ic.edit()} Update quota</button>` : role === 'facility' ? '' : html`<button class="btn sm" onClick=${() => c.go('map', { select: f.id })}>${Ic.map()} On map</button>`}
          ${role === 'collector' && html`<button class="btn sm" onClick=${() => c.go('map', { tab: 'route' })}>${Ic.route()} Plan route</button>`}</div></div>`; })}</div>
    <p class="tiny faint">Expected output uses typical published BSF yields: about ${pct(BSF.larvae)} of input weight as fresh larvae and ${pct(BSF.frass)} as frass. Real yields depend on the feed mix.</p>`;
}

function QuotaSheet({ c, id, onClose }) {
  const f = c.D.facById[id];
  const [q, setQ] = useState(f.dailyQuotaKg), [mx, setMx] = useState(f.maxCapacityKg), [acc, setAcc] = useState(f.accepts), [win, setWin] = useState(f.window), [urg, setUrg] = useState(!!f.urgent), [note, setNote] = useState(f.note || '');
  const [busy, setBusy] = useState(false);
  const save = async () => { setBusy(true); await c.act.saveFacility(id, { dailyQuotaKg: q, maxCapacityKg: Math.max(mx, q), accepts: acc, window: win, urgent: urg, note, updatedAt: Date.now() }); setBusy(false); onClose(); };
  return html`<${Sheet} title="Update intake quota" sub=${f.name} onClose=${onClose} icon=${html`<div class="fac-art" style="width:44px;height:44px;border-radius:12px">${Art.factory()}</div>`}
    footer=${html`<button class="btn ghost" onClick=${onClose}>Cancel</button><button class="btn primary grow" disabled=${busy} onClick=${save}>${busy ? 'Saving…' : 'Save quota'}</button>`}>
    <div class="field"><label for="q-daily">Food waste needed per day (kg)</label><${Stepper} id="q-daily" value=${q} step=${50} min=${50} max=${20000} onChange=${setQ}/></div>
    <div class="field"><label for="q-max">Maximum you can take in a day (kg)</label><${Stepper} id="q-max" value=${mx} step=${50} min=${50} max=${30000} onChange=${setMx}/></div>
    <div class="field"><span class="label">Accepted waste</span><div class="chips">${Object.entries(ACCEPT_LABEL).map(([k, l]) => html`<button type="button" class="chip" aria-pressed=${acc.includes(k)} onClick=${() => setAcc(acc.includes(k) ? acc.filter(x => x !== k) : [...acc, k])}>${l}</button>`)}</div>
      <span class="tiny faint">Bones, shells and oil are always routed to recovery instead.</span></div>
    <div class="field"><label for="q-win">Delivery window</label><input id="q-win" class="input" value=${win} onInput=${e => setWin(e.target.value)}/></div>
    <label class="check"><input type="checkbox" checked=${urg} onChange=${e => setUrg(e.target.checked)}/><span><b>Flag as urgent</b><br/><span class="small muted">Route planner prefers your facility when distances are close.</span></span></label>
    <div class="field"><label for="q-note">Note for collectors</label><textarea id="q-note" class="input" onInput=${e => setNote(e.target.value)}>${note}</textarea></div>
  </${Sheet}>`;
}
