/* ===== Market ===== */
const unitKg = p => { const m = /([\d.]+)\s*(kg|g)/i.exec(p.unit || ''); if (!m) return p.art === 'kit' ? 2 : 1; return m[2].toLowerCase() === 'g' ? +m[1] / 1000 : +m[1]; };
function specChips(p) {
  const s = [];
  if (p.n != null) s.push(`N-P-K ${fmt(p.n, 1)}-${fmt(p.p, 1)}-${fmt(p.k, 1)}`);
  if (p.protein != null) s.push(`${p.protein}% protein`);
  if (p.fat != null) s.push(`${p.fat}% fat`);
  if (p.chitin != null) s.push(`${p.chitin}% chitin`);
  return s;
}
function ProductCard({ c, p, compact }) {
  const { D } = c; const f = D.facById[p.facilityId]; const r = D.ratings[p.id];
  const mine = c.role === 'facility' && c.persona.id === p.facilityId;
  const inCart = c.cart.find(x => x.id === p.id);
  return html`<article class="prod">
    <button class="prod-art" onClick=${() => c.open('product', { id: p.id })} aria-label=${'View ' + p.name}><${ProductArt} art=${p.art} hue=${p.hue}/>
      ${p.tags?.[0] ? html`<span class="pill brand">${Ic.sparkle()} ${p.tags[0]}</span>` : p.stock < 40 ? html`<span class="pill warn">Only ${p.stock} left</span>` : ''}</button>
    <div class="prod-b"><div class="tiny faint">${f?.name || ''}</div><h3><button onClick=${() => c.open('product', { id: p.id })}>${p.name}</button></h3>
      ${!compact && html`<div class="specs">${specChips(p).map(s => html`<span class="spec">${s}</span>`)}</div>`}
      ${r ? html`<${Stars} v=${r.overall} n=${r.n}/>` : html`<span class="tiny faint">No reviews yet</span>`}
      <div class="row between" style="margin-top:auto;padding-top:4px"><div class="price">${money(p.price)}<small>${p.unit}</small></div>
        ${mine ? html`<button class="btn sm" onClick=${() => c.open('editProduct', { id: p.id })}>${Ic.edit()}</button>`
          : html`<button class=${'btn sm ' + (inCart ? '' : 'primary')} disabled=${!p.stock || !p.active} onClick=${() => c.addToCart(p.id)} aria-label=${'Add ' + p.name + ' to cart'}>${inCart ? html`${Ic.check()} ${inCart.qty}` : Ic.plus()}</button>`}</div></div></article>`;
}

function Market({ c, params }) {
  const { D, role, persona } = c;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [fac, setFac] = useState(params?.facility || 'All');
  const [sort, setSort] = useState('rec');
  const [tab, setTab] = useState(params?.tab || 'shop');
  useEffect(() => { if (params?.tab) setTab(params.tab); if (params?.facility) setFac(params.facility); }, [params]);
  const seg = role === 'buyer' ? persona.segment : null;
  const recs = role === 'buyer' ? D.recsFor(persona.id) : [];
  const recScore = Object.fromEntries(recs.map((p, i) => [p.id, recs.length - i]));
  let list = D.products.filter(p => p.active !== false && (cat === 'All' || p.category === cat) && (fac === 'All' || p.facilityId === fac) && (!q || (p.name + ' ' + p.desc + ' ' + p.category).toLowerCase().includes(q.toLowerCase())));
  list = list.slice().sort((a, b) => sort === 'price' ? a.price - b.price : sort === 'rating' ? (D.ratings[b.id]?.overall || 0) - (D.ratings[a.id]?.overall || 0) : (recScore[b.id] || 0) - (recScore[a.id] || 0) || (D.ratings[b.id]?.overall || 0) - (D.ratings[a.id]?.overall || 0));
  const cats = ['All', ...['Fertiliser', 'Animal feed', 'Live larvae', 'Biomaterials', 'Starter kits'].filter(k => D.products.some(p => p.category === k))];
  const isFac = role === 'facility';
  return html`
    ${isFac && html`<${Seg} label="Market view" value=${tab} onChange=${setTab} options=${[['shop', 'Storefront'], ['listings', 'My listings'], ['orders', 'Orders received']]}/>`}
    ${role === 'buyer' && html`<div class="perk kaya slim"><div class="perk-ico">${Ic.gift()}</div><div class="grow"><b>1% back in Harvest points on every order</b><span class="small"> · 10% off when you buy 10+ packs</span></div><span class="points"><${Coin}/>${fmt(D.balance(persona.id))}</span></div>`}
    ${isFac && tab === 'listings' ? html`<${Listings} c=${c}/>` : isFac && tab === 'orders' ? html`<${FacOrders} c=${c}/>` : html`
    ${role === 'buyer' && recs.gap && recs.gap.length > 0 && html`<div class="repair"><div class="row between wrap"><div class="row"><${RTag} r="Repair"/><b>Your last soil test (${dateLabel(recs.test.at)}) is low in ${recs.gap.map(g => nName(g)).join(', ')}.</b></div>
      <button class="btn sm" onClick=${() => c.go('insights', { tab: 'soil' })}>${Ic.flask()} See soil match</button></div><span class="small muted">Products that close those gaps are sorted to the top.</span></div>`}
    <div class="shop-bar"><div class="search"><span>${Ic.search()}</span><input class="input" type="search" placeholder="Search frass, fish feed, larvae…" value=${q} onInput=${e => setQ(e.target.value)} aria-label="Search products"/></div>
      <select class="input" style="width:auto" value=${fac} onChange=${e => setFac(e.target.value)} aria-label="Facility"><option value="All">All facilities</option>${D.facilities.map(f => html`<option value=${f.id}>${f.name}</option>`)}</select>
      <select class="input" style="width:auto" value=${sort} onChange=${e => setSort(e.target.value)} aria-label="Sort"><option value="rec">${seg ? 'Best for you' : 'Recommended'}</option><option value="rating">Top rated</option><option value="price">Lowest price</option></select></div>
    <div class="chips scroll">${cats.map(k => html`<button class="chip" aria-pressed=${cat === k} onClick=${() => setCat(k)}>${k}</button>`)}</div>
    ${list.length ? html`<div class="products">${list.map(p => html`<${ProductCard} c=${c} p=${p}/>`)}</div>` : html`<${Empty} title="No products match">Try another category or clear the search.</${Empty}>`}
    <p class="tiny faint"><${RTag} r="Remanufacture"/> Every product is made from food waste collected through Second Harvest. Prices are sample prices for this prototype.</p>`}`;
}

function ProductSheet({ c, id, onClose }) {
  const { D } = c; const p = D.prodById[id]; if (!p) return null;
  const f = D.facById[p.facilityId]; const r = D.ratings[p.id];
  const fb = D.feedback.filter(x => x.productId === id).sort((a, b) => b.at - a.at);
  const [qty, setQty] = useState(1);
  const npk = p.n != null ? [['N', p.n, 'Nitrogen'], ['P', p.p, 'Phosphorus'], ['K', p.k, 'Potassium']] : null;
  const wasteKg = unitKg(p) / (p.category === 'Fertiliser' || p.art === 'kit' ? BSF.frass : BSF.dried);
  return html`<${Sheet} title=${p.name} sub=${f?.name + ' · ' + p.unit} onClose=${onClose}
    footer=${c.role === 'facility' && c.persona.id === p.facilityId ? html`<button class="btn primary grow" onClick=${() => c.open('editProduct', { id })}>${Ic.edit()} Edit listing</button>` :
      html`<${Stepper} value=${qty} min=${1} max=${p.stock || 1} onChange=${setQty}/><button class="btn primary grow" disabled=${!p.stock} onClick=${() => { c.addToCart(p.id, qty); onClose(); }}>Add · ${money(p.price * qty)}</button>`}>
    <div class="prod-art" style="border-radius:18px;aspect-ratio:16/10"><${ProductArt} art=${p.art} hue=${p.hue}/></div>
    <div class="row between wrap"><div class="price" style="font-size:26px">${money(p.price)}<small>${p.unit}</small></div>${r && html`<${Stars} v=${r.overall} n=${r.n}/>`}</div>
    <p>${p.desc}</p>
    <div class="specs">${specChips(p).map(s => html`<span class="spec">${s}</span>`)}<span class="spec">${fmt(p.stock)} in stock</span></div>
    ${npk && html`<div class="stack" style="gap:8px"><div class="eyebrow">Nutrients (% by weight)</div>${npk.map(([k, v, n]) => html`<div class="nutri"><b>${k}</b><${Bar} p=${v / 4} cls=${k === 'K' ? 'kaya' : ''} label=${n}/><span class="num">${fmt(v, 1)}%</span></div>`)}</div>`}
    <div class="row small" style="padding:12px;border-radius:12px;background:var(--brand-soft)"><span style="width:20px;flex:none;color:var(--brand)">${Ic.leaf()}</span><span>One ${p.unit.replace(/^[\d.]+\s*\w+\s*/, '') || 'pack'} keeps roughly <b>${fmt(wasteKg)} kg</b> of hawker food waste out of the incinerator.</span></div>
    <div><div class="card-h" style="margin-bottom:4px"><h3>Buyer feedback</h3>${r && html`<span class="pill brand">Fit ${fmt(r.fit, 1)} / 5</span>`}</div>
      ${fb.length ? fb.slice(0, 6).map(x => html`<div class="comment"><div class="row between"><${Stars} v=${x.fit}/><span class="tiny faint">${SEGMENTS[x.segment]} · ${ago(x.at, c.now)}</span></div>${x.comment && html`<p class="small">${x.comment}</p>`}${x.tags?.length > 0 && html`<div class="chips">${x.tags.map(t => html`<span class=${'pill ' + (BAD_TAGS.includes(t) ? 'warn' : 'neutral')}>${t}</span>`)}</div>`}</div>`) : html`<p class="small muted">No feedback yet.</p>`}
      <button class="btn sm" style="margin-top:8px" onClick=${() => c.go('insights', { tab: 'give', product: p.id })}>${Ic.comment()} Leave feedback</button></div>
  </${Sheet}>`;
}

function CartSheet({ c, onClose }) {
  const { D, persona } = c;
  const lines = c.cart.map(x => ({ ...x, p: D.prodById[x.id] })).filter(x => x.p);
  const subtotal = sum(lines, l => l.qty * l.p.price);
  const vouchers = D.vouchers.filter(v => v.who === persona.id && !v.used && v.value);
  const [vid, setVid] = useState(''); const v = vouchers.find(x => x.id === vid);
  const vOk = v && (!v.min || subtotal >= v.min); const vVal = vOk ? Math.min(v.value, subtotal) : 0;
  const bal = D.balance(persona.id);
  const maxPts = Math.max(0, Math.min(bal, Math.floor((subtotal - vVal) * 0.3 / R_().unit) * 100));
  const [pts, setPts] = useState(0); const usePts = Math.min(pts, maxPts);
  const bulk = lines.some(l => l.qty >= 10) ? sum(lines.filter(l => l.qty >= 10), l => l.qty * l.p.price) * 0.1 : 0;
  const total = Math.max(0, subtotal - vVal - bulk - ptsValue(usePts));
  const [busy, setBusy] = useState(false);
  const isBuyer = c.role === 'buyer';
  const place = async () => { setBusy(true); const ok = await c.act.placeOrder({ lines, voucher: vOk ? v : null, points: usePts, subtotal, total }); setBusy(false); if (ok) onClose(); };
  return html`<${Sheet} title="Your cart" sub=${isBuyer ? 'Ordering as ' + persona.name : ''} onClose=${onClose}
    footer=${lines.length ? (isBuyer ? html`<button class="btn primary grow" disabled=${busy} onClick=${place}>${busy ? 'Placing order…' : 'Place order · ' + money(total)}</button>` : html`<button class="btn grow" onClick=${() => c.setRole('buyer')}>${Ic.swap()} Switch to a buyer account to check out</button>`) : null}>
    ${lines.length ? html`<div>${lines.map(l => html`<div class="cart-line"><div class="thumb"><${ProductArt} art=${l.p.art} hue=${l.p.hue}/></div>
        <div style="min-width:0"><b class="small" style="display:block">${l.p.name}</b><span class="tiny faint">${money(l.p.price)} · ${l.p.unit}</span>
          <div style="margin-top:6px"><${Stepper} value=${l.qty} min=${0} max=${l.p.stock} onChange=${n => c.setQty(l.id, n)}/></div></div>
        <b class="num">${money(l.qty * l.p.price)}</b></div>`)}</div>
      <div class="stack" style="gap:10px;padding:14px;border-radius:16px;background:var(--kaya-soft)">
        <div class="row between"><b style="color:var(--kaya-ink)">Pay with Harvest points</b><span class="points" style="padding:4px 10px 4px 4px;background:var(--surface)"><${Coin}/>${fmt(bal)}</span></div>
        ${vouchers.length > 0 && html`<div class="field"><label for="cart-v">Voucher</label><select id="cart-v" class="input" value=${vid} onChange=${e => setVid(e.target.value)}><option value="">No voucher</option>${vouchers.map(x => html`<option value=${x.id}>${x.title}${x.min && subtotal < x.min ? ' (needs $' + x.min + ')' : ''}</option>`)}</select></div>`}
        <div class="field"><label for="cart-pts">Use points: <span class="num">${fmt(usePts)}</span> pts = ${money(ptsValue(usePts))} off</label>
          <input id="cart-pts" type="range" min="0" max=${maxPts} step="50" value=${usePts} disabled=${!maxPts} onInput=${e => setPts(+e.target.value)}/>
          <span class="tiny" style="color:var(--kaya-ink)">100 points = ${money0(R_().unit)}. Points can cover up to 30% of an order.</span></div></div>
      <div class="totals"><div class="row"><span>Subtotal</span><span class="num">${money(subtotal)}</span></div>
        ${vVal > 0 && html`<div class="row" style="color:var(--good)"><span>Voucher</span><span class="num">−${money(vVal)}</span></div>`}
        ${usePts > 0 && html`<div class="row" style="color:var(--good)"><span>Points</span><span class="num">−${money(ptsValue(usePts))}</span></div>`}
        ${bulk > 0 && html`<div class="row" style="color:var(--good)"><span>Bulk deal (10% off 10+ packs)</span><span class="num">−${money(bulk)}</span></div>`}
        <div class="row grand"><span>Total</span><span class="num">${money(total)}</span></div>
        <div class="tiny faint">You'll earn ${fmt(Math.floor(total / R_().unit))} points (1% back) on this order. Delivery is arranged by each facility.</div></div>`
      : html`<${Empty} title="Your cart is empty">Add frass or BSF feed from the marketplace.</${Empty}>`}
  </${Sheet}>`;
}

function Listings({ c }) {
  const { D, persona } = c; const mine = D.products.filter(p => p.facilityId === persona.id);
  return html`<div class="card"><div class="card-h"><div><div class="eyebrow">${D.facById[persona.id]?.name}</div><h2>Your products</h2></div><button class="btn primary" onClick=${() => c.open('editProduct', { id: null })}>${Ic.plus()} Add product</button></div>
    ${mine.length ? html`<div class="table-wrap"><table class="t"><thead><tr><th>Product</th><th>Category</th><th class="r">Price</th><th class="r">Stock</th><th class="r">Rating</th><th></th></tr></thead><tbody>
      ${mine.map(p => { const r = D.ratings[p.id]; return html`<tr><td><div class="row"><div class="avatar" style="width:40px;height:40px">${html`<${ProductArt} art=${p.art} hue=${p.hue}/>`}</div><div><b class="small">${p.name}</b><div class="tiny faint">${p.unit}${p.active === false ? ' · hidden' : ''}</div></div></div></td>
        <td class="small">${p.category}</td><td class="r num">${money(p.price)}</td><td class="r"><span class=${'pill ' + (p.stock < 40 ? 'warn' : 'neutral')}>${fmt(p.stock)}</span></td><td class="r small">${r ? fmt(r.overall, 1) + ' (' + r.n + ')' : '–'}</td>
        <td class="r"><button class="btn sm" onClick=${() => c.open('editProduct', { id: p.id })}>${Ic.edit()} Edit</button></td></tr>`; })}</tbody></table></div>` : html`<${Empty} title="Nothing listed yet">Add your first frass or feed product.</${Empty}>`}</div>`;
}

function FacOrders({ c }) {
  const { D, persona } = c;
  const orders = D.orders.filter(o => o.items.some(i => (i.facilityId || D.prodById[i.productId]?.facilityId) === persona.id)).sort((a, b) => b.at - a.at);
  return html`<div class="card"><div class="card-h"><h2>Orders received</h2><span class="pill neutral">${orders.length}</span></div>
    ${orders.length ? html`<div class="list">${orders.map(o => { const its = o.items.filter(i => (i.facilityId || D.prodById[i.productId]?.facilityId) === persona.id); return html`<div class="li"><div class="grow"><b class="small">${its.map(i => i.qty + '× ' + i.name).join(', ')}</b><div class="tiny faint">${SEGMENTS[c.D.buyerSeg(o.buyerId)] || 'Buyer'} · ${ago(o.at, c.now)}</div></div><b class="num small">${money(sum(its, i => i.qty * i.price))}</b><span class=${'pill ' + (o.status === 'Delivered' ? 'good' : 'info')}>${o.status}</span></div>`; })}</div>` : html`<${Empty} title="No orders yet">Orders for your products show up here.</${Empty}>`}</div>`;
}

function ProductEditSheet({ c, id, onClose }) {
  const p0 = id ? c.D.prodById[id] : { name: '', category: 'Fertiliser', unit: '5 kg bag', price: 12, stock: 50, art: 'frass', hue: 'green', n: 3, p: 2, k: 2, desc: '', segments: ['farm'], active: true };
  const [p, setP] = useState({ ...p0 }); const set = (k, v) => setP({ ...p, [k]: v });
  const fert = p.category === 'Fertiliser' || p.category === 'Starter kits';
  const [busy, setBusy] = useState(false);
  const save = async () => { if (!p.name.trim()) return; setBusy(true); const { id: _, ...body } = p; const clean = { ...body, price: +p.price, stock: Math.round(+p.stock) };
    if (fert) { delete clean.protein; delete clean.fat; } else { delete clean.n; delete clean.p; delete clean.k; }
    await c.act.saveProduct(id, { ...clean, facilityId: c.persona.id, createdAt: p0.createdAt || Date.now() }); setBusy(false); onClose(); };
  const num = (k, label, step = 0.1) => html`<div class="field"><label for=${'pe-' + k}>${label}</label><input id=${'pe-' + k} class="input" type="number" step=${step} value=${p[k] ?? ''} onInput=${e => set(k, e.target.value === '' ? null : +e.target.value)}/></div>`;
  return html`<${Sheet} title=${id ? 'Edit product' : 'New product'} sub=${c.D.facById[c.persona.id]?.name} onClose=${onClose}
    footer=${html`<button class="btn ghost" onClick=${onClose}>Cancel</button><button class="btn primary grow" disabled=${busy || !p.name.trim()} onClick=${save}>${busy ? 'Saving…' : id ? 'Save changes' : 'List product'}</button>`}>
    <div class="prod-art" style="border-radius:18px;aspect-ratio:16/9"><${ProductArt} art=${p.art} hue=${p.hue}/></div>
    <div class="field"><label for="pe-name">Name</label><input id="pe-name" class="input" value=${p.name} onInput=${e => set('name', e.target.value)} placeholder="e.g. Frass Gold 5 kg"/></div>
    <div class="grid g2" style="gap:12px"><div class="field"><label for="pe-cat">Category</label><select id="pe-cat" class="input" value=${p.category} onChange=${e => set('category', e.target.value)}>${['Fertiliser', 'Animal feed', 'Live larvae', 'Biomaterials', 'Starter kits'].map(x => html`<option>${x}</option>`)}</select></div>
      <div class="field"><label for="pe-unit">Pack size</label><input id="pe-unit" class="input" value=${p.unit} onInput=${e => set('unit', e.target.value)}/></div>
      ${num('price', 'Price (S$)', 0.1)}${num('stock', 'Stock (packs)', 1)}</div>
    ${fert ? html`<div class="grid g3" style="gap:10px">${num('n', 'N %')}${num('p', 'P %')}${num('k', 'K %')}</div>` : html`<div class="grid g2" style="gap:10px">${num('protein', 'Protein %', 1)}${num('fat', 'Fat %', 1)}</div>`}
    <div class="field"><span class="label">Packaging art</span><div class="chips">${['frass', 'meal', 'pellet', 'larvae', 'live', 'chitin', 'kit'].map(a => html`<button type="button" class="chip" aria-pressed=${p.art === a} onClick=${() => set('art', a)}>${a}</button>`)}</div>
      <div class="chips" style="margin-top:6px">${Object.entries(HUES).map(([h, col]) => html`<button type="button" class="chip" aria-pressed=${p.hue === h} onClick=${() => set('hue', h)} aria-label=${h} style=${`padding:4px`}><span style=${`display:block;width:18px;height:18px;border-radius:50%;background:${col}`}></span></button>`)}</div></div>
    <div class="field"><span class="label">Best for</span><div class="chips">${Object.entries(SEGMENTS).map(([k, l]) => html`<button type="button" class="chip" aria-pressed=${(p.segments || []).includes(k)} onClick=${() => set('segments', (p.segments || []).includes(k) ? p.segments.filter(x => x !== k) : [...(p.segments || []), k])}>${l}</button>`)}</div></div>
    <div class="field"><label for="pe-desc">Description</label><textarea id="pe-desc" class="input" onInput=${e => set('desc', e.target.value)}>${p.desc}</textarea></div>
    <label class="check"><input type="checkbox" checked=${p.active !== false} onChange=${e => set('active', e.target.checked)}/>Visible in the marketplace</label>
  </${Sheet}>`;
}

/* ===== Rewards ===== */
function Rewards({ c }) {
  const { D, persona, role } = c;
  const bal = D.balance(persona.id), life = D.lifetime(persona.id);
  const ti = TIERS.reduce((a, t, i) => (life >= t[1] ? i : a), 0); const next = TIERS[ti + 1];
  const mine = D.ledger.filter(l => l.who === persona.id && l.delta !== 0).sort((a, b) => b.at - a.at);
  const vouchers = D.vouchers.filter(v => v.who === persona.id).sort((a, b) => b.at - a.at);
  const [busy, setBusy] = useState(null);
  const redeem = async r => { setBusy(r.id); await c.act.redeem(r); setBusy(null); };
  return html`<div class="split"><div class="stack">
      <div class="wallet grow-in"><div class="row between"><div><div class="eyebrow" style="color:#5A3604">Harvest points · ${persona.name}</div><div class="bal">${fmt(bal)}</div></div><${Coin} size=${56}/></div>
        <div class="row between small" style="font-weight:700"><span>${TIERS[ti][0]}</span><span>${next ? `${fmt(next[1] - life)} to ${next[0]}` : 'Top tier reached'}</span></div>
        <${Bar} p=${next ? (life - TIERS[ti][1]) / (next[1] - TIERS[ti][1]) : 1}/>
        <div class="small" style="color:#5A3604">${fmt(life)} points earned in total · 1% back on purchases · 100 points = ${money0(R_().unit)}</div></div>
      ${role === 'facility' && html`<div class="card small muted">Facilities fund rewards rather than earn them. Switch to a food business, collector or buyer account to see a wallet in action.</div>`}
      <div class="card"><div class="card-h"><h2>Redeem</h2><span class="tiny faint">Vouchers appear below and at checkout</span></div>
        <div class="grid g2">${rewardsFor().map(r => html`<div class="reward card flat" style="padding:16px"><div class="row"><div class="ico">${Art[r.art]()}</div><div class="grow"><b class="small" style="display:block">${r.title}</b><span class="tiny faint">${r.desc}</span></div></div>
          <div class="row between"><span class="points" style="padding:3px 10px 3px 3px"><${Coin}/>${fmt(r.cost)}</span><button class="btn sm kaya" disabled=${bal < r.cost || busy} onClick=${() => redeem(r)}>${busy === r.id ? 'Redeeming…' : 'Redeem'}</button></div></div>`)}</div></div>
      ${role !== 'facility' && html`<${HarvestShop} c=${c}/>`}
      ${vouchers.length > 0 && html`<div class="card"><div class="card-h"><h3>My vouchers</h3></div><div class="stack" style="gap:10px">${vouchers.map(v => html`<div class="voucher" style=${v.used ? 'opacity:.55' : ''}><div style="width:40px;flex:none">${Art.ticket()}</div><div class="grow"><b class="small">${v.title}</b><div class="tiny" style="color:var(--kaya-ink)">${v.used ? 'Used' : 'Show this code or apply at checkout'} · ${dateLabel(v.at)}</div></div><code>${v.code}</code></div>`)}</div></div>`}
    </div>
    <div class="stack"><div class="card"><div class="card-h"><h3>Ways to earn</h3></div><div class="list">${EARN.map(([t, p, r]) => html`<div class="li"><div class="grow small">${t}<div class="tiny faint">${ROLE_LABEL[r]}</div></div><span class="pill kaya">${p}</span></div>`)}</div></div>
      <div class="card"><div class="card-h"><h3>Top collection points</h3><span class="tiny faint">Clean kg sorted, 30 days</span></div>
        ${D.leaderboard.slice(0, 8).map((r, i) => html`<div class="lb"><span class="rk">${i + 1}</span><div style="min-width:0"><b class="small" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${r.name}</b><span class="tiny faint">${r.zone}</span></div><span class="num small">${fmt(r.kg)} kg</span></div>`)}</div>
      <div class="card"><div class="card-h"><h3>Activity</h3></div>${mine.length ? html`<div class="list">${mine.slice(0, 10).map(l => html`<div class="li"><div class="grow"><span class="small">${l.reason}</span><div class="tiny faint">${ago(l.at, c.now)}</div></div><b class="num small" style=${l.delta > 0 ? 'color:var(--good)' : 'color:var(--crit)'}>${l.delta > 0 ? '+' : ''}${fmt(l.delta)}</b></div>`)}</div>` : html`<p class="small muted">No points yet.</p>`}</div></div></div>`;
}

/* ===== Insights ===== */
function Insights({ c, params }) {
  const { role } = c;
  const [tab, setTab] = useState(params?.tab || (role === 'buyer' ? 'soil' : 'analytics'));
  useEffect(() => { if (params?.tab) setTab(params.tab); }, [params]);
  return html`<${Seg} label="Insights" value=${tab} onChange=${setTab} options=${[['analytics', 'Feedback analytics'], ['soil', 'Soil match'], ['give', 'Give feedback']]}/>
    ${tab === 'analytics' && html`<${Analytics} c=${c}/>`}${tab === 'soil' && html`<${SoilMatch} c=${c}/>`}${tab === 'give' && html`<${GiveFeedback} c=${c} productId=${params?.product}/>`}`;
}

function heatBg(v) { const x = clamp((v - 1) / 4, 0, 1); return `background:color-mix(in srgb,var(--brand) ${Math.round(8 + x * 72)}%,var(--surface));color:${x > 0.55 ? 'var(--brand-ink)' : 'var(--ink)'}`; }
function Analytics({ c }) {
  const { D, role, persona } = c;
  const [fid, setFid] = useState(role === 'facility' ? persona.id : 'All');
  const fb = D.feedback.filter(x => fid === 'All' || x.facilityId === fid);
  const crit = CRITERIA.map(([k, l]) => [k, l, avg(fb.map(x => x[k]))]);
  const fitPct = fb.length ? fb.filter(x => x.fit >= 4).length / fb.length : 0;
  const tags = {}; fb.forEach(x => (x.tags || []).forEach(t => tags[t] = (tags[t] || 0) + 1));
  const issues = Object.entries(tags).filter(([t]) => BAD_TAGS.includes(t)).sort((a, b) => b[1] - a[1]);
  const praise = Object.entries(tags).filter(([t]) => !BAD_TAGS.includes(t)).sort((a, b) => b[1] - a[1]);
  const maxTag = Math.max(1, ...Object.values(tags));
  const segs = Object.keys(SEGMENTS).map(s => [s, fb.filter(x => x.segment === s)]).filter(([, a]) => a.length);
  const prods = D.products.filter(p => fid === 'All' || p.facilityId === fid).map(p => { const a = fb.filter(x => x.productId === p.id); const it = {}; a.forEach(x => (x.tags || []).filter(t => BAD_TAGS.includes(t)).forEach(t => it[t] = (it[t] || 0) + 1)); return { p, n: a.length, fit: avg(a.map(x => x.fit)), issue: Object.entries(it).sort((x, y) => y[1] - x[1])[0] }; }).sort((a, b) => b.n - a.n);
  // nutrient gaps from latest soil test per buyer
  const latest = Object.values(groupBy(D.soiltests, t => t.buyerId)).map(a => a.sort((x, y) => y.at - x.at)[0]);
  const gapCount = { n: 0, p: 0, k: 0, ph: 0, om: 0 }; latest.forEach(t => D.gapsOf(t).forEach(g => gapCount[g]++));
  const topGap = Object.entries(gapCount).sort((a, b) => b[1] - a[1])[0];
  const RECIPE = { k: 'Raise potassium: feed the larvae a higher share of fruit peels (banana, papaya, melon rind) and blend the frass with a potassium-rich amendment. Re-test each batch before listing.', n: 'Raise nitrogen: shorten curing time and feed more protein-rich cooked waste so less nitrogen is lost before bagging.', p: 'Raise phosphorus: add more grain and okara to the feed mix; bone meal stays out because bones slow the larvae.', ph: 'Buffer acidity: frass is near-neutral, so recommend a higher application rate on acidic soils.', om: 'Add organic matter: sell a coarser frass-compost blend for soils low in organic matter.' };
  const recent = fb.filter(x => x.comment).sort((a, b) => b.at - a.at).slice(0, 6);
  return html`<div class="row wrap between"><div class="field" style="min-width:240px"><label for="an-f">Facility</label><select id="an-f" class="input" value=${fid} onChange=${e => setFid(e.target.value)}><option value="All">All facilities</option>${D.facilities.map(f => html`<option value=${f.id}>${f.name}</option>`)}</select></div>
      <span class="small muted">${fb.length} responses from ${new Set(fb.map(x => x.buyerId)).size} buyers</span></div>
    ${!fb.length ? html`<div class="card"><${Empty} title="No feedback yet">Feedback from buyers will be analysed here.</${Empty}></div>` : html`
    <div class="stats"><${Stat} v=${fmt(crit[0][2], 1)} unit="/ 5" k="Fits buyers' needs" d="Average of the fit question"/><${Stat} v=${pct(fitPct)} k="Rated fit 4 or 5" tone=${fitPct >= 0.7 ? 'var(--good)' : 'var(--warn)'}/>
      <${Stat} v=${fmt(avg(crit.map(x => x[2])), 1)} unit="/ 5" k="Overall satisfaction" d="Mean of 5 criteria"/><${Stat} v=${issues[0] ? issues[0][1] : 0} k=${issues[0] ? 'Mentions of “' + issues[0][0].toLowerCase() + '”' : 'Issues reported'} d="Most common issue" tone=${issues[0] ? 'var(--warn)' : ''}/></div>
    <div class="split"><div class="card"><div class="card-h"><h3>Fit by buyer segment</h3><span class="tiny faint">Average score, 1–5</span></div>
        <div class="table-wrap"><table class="heat"><thead><tr><th>Segment</th>${CRITERIA.map(([, l]) => html`<th>${l.replace('Fits our needs', 'Fit').replace('Value for money', 'Value')}</th>`)}<th>n</th></tr></thead>
          <tbody>${segs.map(([s, a]) => html`<tr><td>${SEGMENTS[s]}</td>${CRITERIA.map(([k]) => { const v = avg(a.map(x => x[k])); return html`<td style=${heatBg(v)} onMouseEnter=${tipOn(`${SEGMENTS[s]} · ${fmt(v, 2)} from ${a.length} responses`)} onMouseLeave=${tipOff}>${fmt(v, 1)}</td>`; })}<td class="faint" style="background:none">${a.length}</td></tr>`)}</tbody></table></div>
        <div style="margin-top:16px">${crit.map(([k, l, v]) => html`<div class="hbar"><span class="small">${l}</span><${Bar} p=${(v - 1) / 4}/><span class="num small">${fmt(v, 1)}</span></div>`)}</div></div>
      <div class="stack"><div class="repair"><div class="row between"><div class="row"><${RTag} r="Repair"/><b>Formulation signal</b></div><span class="pill brand">${latest.length} soil tests</span></div>
          ${topGap && topGap[1] > 0 ? html`<p class="small"><b>${topGap[1]} of ${latest.length}</b> buyers' latest soil tests are low in <b>${nName(topGap[0])}</b>.</p><p class="small">${RECIPE[topGap[0]]}</p>` : html`<p class="small">No common nutrient gap right now.</p>`}
          <div class="chips">${Object.entries(gapCount).map(([k, n]) => html`<span class=${'pill ' + (n ? 'warn' : 'neutral')}>Low ${nName(k)}: ${n}</span>`)}</div></div>
        <div class="card"><div class="card-h"><h3>What buyers mention</h3></div>
          ${issues.map(([t, n]) => html`<div class="hbar"><span class="small">${t}</span><${Bar} p=${n / maxTag} cls="warn"/><span class="num small">${n}</span></div>`)}
          ${praise.slice(0, 5).map(([t, n]) => html`<div class="hbar"><span class="small">${t}</span><${Bar} p=${n / maxTag}/><span class="num small">${n}</span></div>`)}</div></div></div>
    <div class="card"><div class="card-h"><h3>Product fit</h3><span class="tiny faint">Does each product fit what buyers need?</span></div>
      <div class="table-wrap"><table class="t"><thead><tr><th>Product</th><th class="r">Responses</th><th>Fit score</th><th>Top issue</th></tr></thead><tbody>
        ${prods.map(({ p, n, fit, issue }) => html`<tr><td><b class="small">${p.name}</b><div class="tiny faint">${D.facById[p.facilityId]?.name}</div></td><td class="r num">${n}</td>
          <td style="min-width:150px">${n ? html`<div class="row"><div class="grow"><${Bar} p=${(fit - 1) / 4} cls=${fit < 3.5 ? 'warn' : ''}/></div><span class="num small">${fmt(fit, 1)}</span></div>` : html`<span class="faint small">–</span>`}</td>
          <td>${issue ? html`<span class="pill warn">${issue[0]}</span>` : html`<span class="faint small">None</span>`}</td></tr>`)}</tbody></table></div></div>
    <div class="card"><div class="card-h"><h3>Latest comments</h3></div>${recent.map(x => html`<div class="comment"><div class="row between wrap"><span class="small"><b>${D.prodById[x.productId]?.name}</b> · <span class="muted">${SEGMENTS[x.segment]}</span></span><${Stars} v=${x.fit}/></div><p class="small">“${x.comment}”</p><span class="tiny faint">${ago(x.at, c.now)}</span></div>`)}</div>`}`;
}

function SoilMatch({ c }) {
  const { D, role, persona } = c;
  const buyerId = role === 'buyer' ? persona.id : 'b-kampong';
  const hist = D.soiltests.filter(t => t.buyerId === buyerId).sort((a, b) => a.at - b.at);
  const last = hist[hist.length - 1];
  const [f, setF] = useState(last ? { crop: last.crop, n: last.n, p: last.p, k: last.k, ph: last.ph, om: last.om } : { crop: 'Leafy greens', n: 22, p: 30, k: 100, ph: 6.0, om: 2.5 });
  const [busy, setBusy] = useState(false);
  const band = CROPS[f.crop];
  const gaps = D.gapsOf(f);
  const recs = D.rankFor(gaps, role === 'buyer' ? persona.segment : 'farm').slice(0, 3);
  const save = async () => { setBusy(true); await c.act.submitSoil({ ...f, buyerId }); setBusy(false); };
  const SPAN = { n: [0, 80], p: [0, 100], k: [0, 300], ph: [4, 9], om: [0, 10] };
  const range = k => SPAN[k];
  return html`<div class="split"><div class="card"><div class="card-h"><div><div class="eyebrow">${role === 'buyer' ? persona.name : 'Example: Kampong Greens'}</div><h2>Enter soil-test results</h2></div><${RTag} r="Repair"/></div>
      <div class="field"><label for="soil-crop">Main crop</label><select id="soil-crop" class="input" value=${f.crop} onChange=${e => setF({ ...f, crop: e.target.value })}>${Object.keys(CROPS).map(k => html`<option value=${k}>${k}</option>`)}</select></div>
      <div class="stack" style="margin-top:14px;gap:14px">${NUTRIENTS.map(([k, l, u]) => { const b = band[k]; const [lo, hi] = range(k); const x = v => clamp((v - lo) / (hi - lo), 0, 1) * 100; const status = f[k] < b[0] ? ['Low', 'warn'] : f[k] > b[1] ? ['High', 'info'] : ['Optimal', 'good'];
        return html`<div class="stack" style="gap:6px"><div class="row between"><label for=${'soil-' + k} class="small" style="font-weight:650">${l}${u && html` <span class="faint">(${u})</span>`}</label><div class="row" style="gap:8px"><span class=${'pill ' + status[1]}>${status[0]}</span><input id=${'soil-' + k} class="input num" style="width:92px;min-height:36px;padding:5px 10px;text-align:right" type="number" step=${k === 'ph' || k === 'om' ? 0.1 : 1} value=${f[k]} onInput=${e => setF({ ...f, [k]: +e.target.value })}/></div></div>
          <div class="soilrange"><div class="band"><div class="ok" style=${`left:${x(b[0])}%;width:${x(b[1]) - x(b[0])}%`}></div></div>
            <input type="range" aria-label=${l + ' slider'} min=${lo} max=${hi} step=${k === 'ph' || k === 'om' ? 0.1 : 1} value=${f[k]} onInput=${e => setF({ ...f, [k]: +e.target.value })}/></div>
          <div class="row between tiny faint"><span>Target ${b[0]}–${b[1]}${u === '%' ? '%' : ''}</span></div></div>`; })}</div>
      <div class="row wrap between" style="margin-top:16px"><span class="tiny faint">Indicative target ranges for this prototype.</span>
        ${role === 'buyer' ? html`<button class="btn primary" disabled=${busy} onClick=${save}>${busy ? 'Saving…' : 'Save test · +20 pts'}</button>` : html`<button class="btn" onClick=${() => c.setRole('buyer')}>${Ic.swap()} Switch to a buyer to save</button>`}</div></div>
    <div class="stack"><div class="card"><div class="card-h"><h3>${gaps.length ? 'Closes your gaps' : 'Soil is in range'}</h3>${gaps.length > 0 && html`<span class="pill warn">Low ${gaps.map(g => nName(g)).join(', ')}</span>`}</div>
        ${recs.map(p => { const fm = D.facById[p.facilityId]; return html`<div class="li"><div class="avatar" style="width:52px;height:52px">${html`<${ProductArt} art=${p.art} hue=${p.hue}/>`}</div><div class="grow"><b class="small">${p.name}</b><div class="tiny faint">${fm?.name} · ${specChips(p)[0] || ''}</div>
          <div class="tiny" style="color:var(--brand);font-weight:650">${p.why}</div></div><button class="btn sm primary" onClick=${() => c.addToCart(p.id)} aria-label=${'Add ' + p.name}>${Ic.plus()}</button></div>`; })}</div>
      ${hist.length > 1 && html`<div class="card"><div class="card-h"><h3>Tracking the repair</h3><span class="tiny faint">${hist.length} tests</span></div>
        <div class="grid g2" style="gap:18px">${[['k', 'Potassium', 'mg/kg'], ['n', 'Nitrogen', 'mg/kg'], ['ph', 'pH', ''], ['om', 'Organic matter', '%']].map(([k, l, u]) => html`<${Spark} label=${l} unit=${u} band=${CROPS[hist[hist.length - 1].crop][k]} pts=${hist.map(t => ({ t: t.at, v: t[k] }))}/>`)}</div>
        <p class="tiny faint" style="margin-top:10px">Green band is the target range. ${hist[0].k < CROPS[hist[0].crop].k[0] && last.k >= CROPS[last.crop].k[0] ? 'Potassium moved from low to optimal after switching to a K-boosted frass.' : ''}</p></div>`}</div></div>`;
}

function GiveFeedback({ c, productId }) {
  const { D, role, persona } = c;
  const bought = role === 'buyer' ? [...new Set(D.orders.filter(o => o.buyerId === persona.id).flatMap(o => o.items.map(i => i.productId)))] : [];
  const [pid, setPid] = useState(productId || bought[0] || D.products[0]?.id);
  const [sc, setSc] = useState({ fit: 0, quality: 0, consistency: 0, delivery: 0, value: 0 });
  const [tags, setTags] = useState([]); const [txt, setTxt] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { if (productId) setPid(productId); }, [productId]);
  const ok = Object.values(sc).every(v => v > 0);
  const submit = async e => { e.preventDefault(); if (!ok) return; setBusy(true); const p = D.prodById[pid];
    await c.act.submitFeedback({ productId: pid, facilityId: p.facilityId, buyerId: persona.id, segment: persona.segment || 'farm', ...sc, tags, comment: txt.trim() });
    setBusy(false); setSc({ fit: 0, quality: 0, consistency: 0, delivery: 0, value: 0 }); setTags([]); setTxt(''); };
  if (role !== 'buyer') return html`<div class="card"><${Empty} title="Feedback comes from buyers">Switch to a buyer account to rate a product. Facilities see the results in Feedback analytics.</${Empty}><div class="row" style="justify-content:center"><button class="btn primary" onClick=${() => c.setRole('buyer')}>${Ic.swap()} Switch to buyer</button></div></div>`;
  return html`<form class="card stack" style="gap:16px;max-width:760px" onSubmit=${submit}><div class="card-h" style="margin:0"><div><div class="eyebrow">Feedback channel</div><h2>How well does it fit your needs?</h2></div><span class="pill kaya">+15 pts</span></div>
    <div class="field"><label for="fb-p">Product</label><select id="fb-p" class="input" value=${pid} onChange=${e => setPid(e.target.value)}>${bought.length > 0 && html`<optgroup label="You bought">${bought.map(id => html`<option value=${id}>${D.prodById[id]?.name}</option>`)}</optgroup>`}<optgroup label="All products">${D.products.filter(p => !bought.includes(p.id)).map(p => html`<option value=${p.id}>${p.name}</option>`)}</optgroup></select></div>
    <div class="stack" style="gap:10px">${CRITERIA.map(([k, l]) => html`<div class="row between wrap"><span class="small" style="font-weight:650">${l}</span><div class="rate-in" role="radiogroup" aria-label=${l}>${[1, 2, 3, 4, 5].map(i => html`<button type="button" role="radio" aria-checked=${sc[k] === i} aria-label=${i + ' stars'} class=${sc[k] >= i ? 'on' : ''} onClick=${() => setSc({ ...sc, [k]: i })}>${Ic.star()}</button>`)}</div></div>`)}</div>
    <div class="field"><span class="label">Anything to flag?</span><div class="chips">${[...GOOD_TAGS, ...BAD_TAGS].map(t => html`<button type="button" class="chip" aria-pressed=${tags.includes(t)} onClick=${() => setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])}>${t}</button>`)}</div></div>
    <div class="field"><label for="fb-c">Comment (optional)</label><textarea id="fb-c" class="input" value=${txt} onInput=${e => setTxt(e.target.value)} placeholder="What should the facility change?"></textarea></div>
    <div class="row between wrap"><span class="tiny faint">Your segment (${SEGMENTS[persona.segment]}) is shared with the facility, not your name.</span><button class="btn primary" type="submit" disabled=${!ok || busy}>${busy ? 'Sending…' : 'Send feedback'}</button></div></form>`;
}

/* ===== Impact ===== */
const CITIES = [
  { n: 'Singapore', lat: 1.3521, lon: 103.8198, home: true },
  { n: 'Johor Bahru', lat: 1.4927, lon: 103.7414, t: 'Across the Causeway, same hawker culture. Ento Industries is already opening a BSF facility in Malaysia, so a cross-border collection route is the natural first step.' },
  { n: 'Kuala Lumpur', lat: 3.139, lon: 101.6869, t: 'Malaysia throws away about 39,078 tonnes of solid waste a day, and food is the largest share of domestic waste at 30.6%. Mamak and hawker stalls give dense collection points.' },
  { n: 'Bangkok', lat: 13.7563, lon: 100.5018, t: 'About 10,000 tonnes of waste a day, roughly half of it food. The city now charges households less if they sort their waste, so a points app fits an existing incentive.' },
  { n: 'Jakarta', lat: -6.2088, lon: 106.8456, t: 'Tropical climate and a huge street-food economy. City size means many small BSF units near markets instead of one central plant.' },
  { n: 'Ho Chi Minh City', lat: 10.8231, lon: 106.6297, t: 'Wet markets and street food produce steady organic waste; aquaculture in the Mekong Delta is a ready buyer for BSF feed.' },
];
function AseanMap() {
  const A = GEO.asean; const pj = (lat, lon) => [(lon - A.AW) * A.AK, (A.AN - lat) * A.AK];
  const sg = pj(1.3521, 103.8198);
  return html`<div class="asean"><svg viewBox="40 70 470 400" role="img" aria-label="Map of Southeast Asian cities for expansion">
    <path d=${A.context} fill="var(--land-ctx)" stroke="var(--land-line)" stroke-width=".6"/>
    ${Object.entries(A.countries).map(([k, d]) => html`<path d=${d} fill=${k === 'SGP' ? 'var(--brand)' : 'var(--land)'} stroke="var(--land-line)" stroke-width=".8"/>`)}
    ${CITIES.filter(x => !x.home).map(x => { const [cx, cy] = pj(x.lat, x.lon); return html`<path d=${`M${sg[0]} ${sg[1]}Q${(sg[0] + cx) / 2 + 30} ${(sg[1] + cy) / 2} ${cx} ${cy}`} fill="none" stroke="var(--kaya)" stroke-width="1.8" stroke-dasharray="5 5"/>`; })}
    ${CITIES.map(x => { const [cx, cy] = pj(x.lat, x.lon); return html`<g><circle cx=${cx} cy=${cy} r=${x.home ? 7 : 5} fill=${x.home ? 'var(--brand)' : 'var(--kaya)'} stroke="var(--surface)" stroke-width="2.5"/><text x=${cx + (x.n === 'Johor Bahru' ? -12 : 12)} y=${cy + (x.n === 'Johor Bahru' ? -10 : 4)} text-anchor=${x.n === 'Johor Bahru' ? 'end' : 'start'} style="font:700 12px var(--f-ui);fill:var(--ink);paint-order:stroke;stroke:var(--water);stroke-width:3px">${x.n}</text></g>`; })}
  </svg></div>`;
}
function Impact({ c }) {
  const { D } = c;
  const delivered = sum(D.deliveries, d => d.kg);
  const caddies = sum(D.pickups, p => p.caddies || (p.stops || []).length || 0);
  const recovered = sum(D.drops.filter(d => !WASTE_TYPES[d.type]?.bsf), d => d.kg);
  const bsfDrops = D.drops.filter(d => WASTE_TYPES[d.type]?.bsf); const cleanRate = bsfDrops.length ? bsfDrops.filter(d => d.clean).length / bsfDrops.length : 0;
  const held = D.bins.filter(b => b.held).length;
  const R = [
    ['Redesign', 'Smart bins with fill, weight, temperature and camera sensors replace fixed collection rounds.', D.bins.length, 'smart bins online', ['9.4', '11.6'], 'map'],
    ['Reduce', 'Routes only visit bins at 80%+ and end at the facility with room, cutting trips and fuel.', fmt(D.kmSaved, 0), 'km saved', ['11.6', '9.4'], 'map'],
    ['Reuse', 'Sealed caddies are swapped clean at every stop, so no plastic liners go in the waste.', caddies, 'caddies swapped', ['12.5'], 'home'],
    ['Repair', 'Buyer soil tests tell facilities which nutrient is missing, and the frass recipe is adjusted.', D.soiltests.length, 'soil tests matched', ['2.4', '15.5'], 'insights'],
    ['Renew', 'Nutrients from discarded food return to farms as frass instead of being burnt.', fmt(D.nutrientsKg, 0), 'kg N-P-K returned', ['2.4', '15.5'], 'market'],
    ['Recover', 'Bones, shells and oil are sorted out at the stall and sent for energy or biodiesel recovery.', fmt(recovered), 'kg sent to recovery', ['12.5'], 'home'],
    ['Reject', 'Lid cameras flag plastics. Bins over 15% non-food are held until re-sorted.', pct(cleanRate), 'clean drop-off rate', ['12.6'], 'map'],
    ['Remanufacture', 'Larvae and frass become fish feed, poultry treats, chitin and fertiliser for sale.', D.products.length, 'products listed', ['8.4', '14.4'], 'market'],
    ['Recycle', 'Black soldier fly larvae eat the food waste in days, closing the loop biologically.', fmt(delivered / 1000, 1), 'tonnes bioconverted', ['12.2', '12.3'], 'quotas'],
  ];
  const SDGT = [['2.4', 'Sustainable food production'], ['8.4', 'Resource efficiency'], ['9.4', 'Clean, efficient infrastructure'], ['11.6', 'Urban waste management'], ['12.2', 'Efficient use of resources'], ['12.3', 'Halve food waste'], ['12.5', 'Reduce waste through recycling'], ['12.6', 'Sustainable business practices'], ['12.8', 'Public awareness'], ['14.4', 'Sustainable fish feed'], ['15.5', 'Protect biodiversity'], ['17.6', 'Knowledge-sharing partnerships']];
  return html`<div class="stats"><${Stat} v=${fmt(delivered / 1000, 1)} unit="t" k="Food waste bioconverted" d="Logged deliveries to BSF"/><${Stat} v=${fmt(delivered * BSF.larvae / 1000, 2)} unit="t" k="Larvae protein grown" d=${'≈ ' + pct(BSF.larvae) + ' of input'}/>
      <${Stat} v=${fmt(D.kmSaved * VAN_CO2_PER_KM, 0)} unit="kg" k="CO₂e avoided by routing" d=${fmt(D.kmSaved, 0) + ' km not driven'}/><${Stat} v=${fmt(D.pointsIssued)} k="Harvest points earned" d="by stalls, collectors, buyers"/></div>
    <div><div class="card-h"><div><div class="eyebrow">Circular economy</div><h2>The 9Rs, built into the app</h2></div></div>
      <div class="rgrid">${R.map(([r, t, m, u, sdgs, go], i) => html`<div class="rcard"><div class="rh"><span class="r-tag">R${i + 1}</span><span class="rl">${r}</span></div><p class="small muted">${t}</p>
        <div class="metric">${m}<small>${u}</small></div><div class="row between wrap"><div class="chips">${sdgs.map(s => html`<${Sdg} t=${s}/>`)}</div><button class="btn sm ghost" onClick=${() => c.go(go)}>Open ${Ic.chev()}</button></div></div>`)}</div></div>
    <div class="card"><div class="card-h"><div><div class="eyebrow">Sub-SDG targets</div><h2>Social, economic and environmental pillars</h2></div></div>
      <div class="grid g3" style="gap:10px">${SDGT.map(([t, l]) => html`<div class="row small"><${Sdg} t=${t}/><span>${l}</span></div>`)}</div></div>
    <div><div class="card-h"><div><div class="eyebrow">Scalability</div><h2>NTU → Singapore → ASEAN</h2></div></div>
      <div class="phases">
        <div class="phase"><span class="ph">PHASE 1 · PILOT</span><h3>NTU campus</h3><p class="small muted">8 canteens feed the student-run BSF unit (150 kg/day). Cleaners and stall owners learn to sort; the app proves the 80% routing and points loop.</p><span class="pill brand">${D.bins.filter(b => b.zone === 'NTU').length} smart bins</span></div>
        <div class="phase"><span class="ph">PHASE 2 · CITY</span><h3>Singapore</h3><p class="small muted">Hawker centres, food courts and HDB collection points, linked to private BSF facilities. Builds on NEA rules that already require large malls and hotels to segregate food waste.</p><span class="pill brand">${D.bins.filter(b => b.zone !== 'NTU').length} points · ${D.facilities.length - 1} facilities</span></div>
        <div class="phase"><span class="ph">PHASE 3 · REGION</span><h3>ASEAN cities</h3><p class="small muted">Same tropical climate and street-food culture. Many small BSF units near markets instead of one big plant, with Singapore running training and the platform.</p><span class="pill kaya">5 candidate cities</span></div></div></div>
    <div class="split"><${AseanMap}/><div class="card"><div class="card-h"><h3>Cities with a similar SWOT</h3></div>${CITIES.filter(x => !x.home).map(x => html`<div class="city"><span class="pill kaya" style="align-self:start">${x.n}</span><p class="small">${x.t}</p></div>`)}</div></div>
    <div class="grid g2"><div class="card"><div class="card-h"><h3>Who we'd work with</h3></div><div class="grid g2" style="gap:10px">
        <div class="partner"><b>NEA</b><span class="small muted">Regulator. Resource Sustainability Act requires food-waste segregation in large malls and hotels: new buildings since 8 Mar 2024, existing ones phased in.</span></div>
        <div class="partner"><b>Ento Industries</b><span class="small muted">Tuas-based BSF company (founded 2020). With parent Tiong Lam it can process up to 50 t of food waste a day into larvae feed and frass compost.</span></div>
        <div class="partner"><b>Insectta</b><span class="small muted">Singapore BSF biotech that extracts chitosan and melanin from BSF by-products. A buyer for chitin-rich residue.</span></div>
        <div class="partner"><b>SFA</b><span class="small muted">Sets food and animal-feed safety rules, so every bag is traceable to its source bins and batch.</span></div>
        <div class="partner"><b>NTU</b><span class="small muted">Pilot site: canteens, cleaners and the student BSF interest group.</span></div>
        <div class="partner"><b>Licensed waste collectors</b><span class="small muted">Run the vans. The app gives them demand-based routes instead of fixed rounds.</span></div></div>
        <p class="tiny faint" style="margin-top:10px">Facility, farm and stall accounts in this prototype are sample data, not real partners.</p></div>
      <div class="card"><div class="card-h"><h3>Costs and trade-offs</h3></div><div class="list">
        <div class="li"><div class="small"><b>Sensors vs. trips saved.</b> Smart bins pay back where bins fill unevenly, like hawker centres. Steady HDB points may stay on a fixed weekly round.</div></div>
        <div class="li"><div class="small"><b>Gate fees.</b> BSF operators need a service fee as well as product sales; Ento charges one on about 80% of the waste it takes in.</div></div>
        <div class="li"><div class="small"><b>Contamination.</b> Plastics ruin a batch, so sorting education and camera checks come before scale.</div></div>
        <div class="li"><div class="small"><b>Buyer trust.</b> Some farms are wary of insect-based inputs. Lab-tested labels and the feedback channel address this.</div></div>
        <div class="li"><div class="small"><b>Supply swings.</b> Facilities need steady feed. Quotas plus the urgent flag balance waste supply with larvae demand.</div></div></div></div></div>
    <div class="card sources"><b class="small" style="color:var(--ink-2)">Sources</b>
      <span>Singapore generated 790,000 t of food waste in 2025, 18% recycled: <a href="https://www.nea.gov.sg/our-services/waste-management/3r-programmes-and-resources/food-waste-management" target="_blank" rel="noopener">NEA, Food Waste Management</a></span>
      <span>Ento Industries: <a href="https://news.smu.edu.sg/news/2025/08/27/trash-treasure-how-ento-industries-developed-growing-sustainable-food-waste" target="_blank" rel="noopener">SMU News, Aug 2025</a> · Insectta: <a href="https://vulcanpost.com/770243/insectta-black-soldier-flies-food-waste-into-biomaterials-singapore" target="_blank" rel="noopener">Vulcan Post</a></span>
      <span>Malaysia waste: <a href="https://thestar.com.my/news/nation/2024/01/02/39000-tonnes-of-solid-waste-daily" target="_blank" rel="noopener">The Star, Jan 2024</a> · Bangkok: <a href="https://www.khaosodenglish.com/news/bangkok/2025/04/12/bangkok-unveils-new-waste-policy-sort-your-trash-save-your-cash/" target="_blank" rel="noopener">Khaosod English, Apr 2025</a></span>
      <span>Assumptions: BSF yield ${pct(BSF.larvae)} fresh larvae and ${pct(BSF.frass)} frass per kg of waste; ${VAN_CO2_PER_KM} kg CO₂e per van-km; road distance = ${ROAD_FACTOR}× straight line.</span></div>`;
}

/* ===== Sheets: role & about ===== */
function AboutSheet({ c, onClose }) {
  const [busy, setBusy] = useState(false);
  const M = { cloud: ['Live shared database', 'Everything you do here is saved to this page\'s shared database. Anyone you share the page with sees the same bins, routes, orders and points.'], readonly: ['Viewing shared data', 'You can see the live shared data but don\'t have edit access, so changes you make are kept on this device for this visit.'], local: ['Device-only demo', 'This copy is running without the shared database, so changes are saved in this browser only.'] }[c.mode] || ['', ''];
  return html`<${Sheet} title="About this prototype" onClose=${onClose} icon=${html`<${Mark} size=${44}/>`}>
    <div class="row" style="align-items:flex-start;padding:14px;border-radius:14px;background:var(--surface-2)"><span class=${'dot ' + (c.mode === 'cloud' ? 'live' : 'local')}></span><div><b>${M[0]}</b><p class="small muted">${M[1]}</p></div></div>
    <p class="small">Second Harvest connects hawkers and canteens, food-waste collectors, black soldier fly (BSF) facilities and the farms that buy back frass and BSF feed. Built for CC0006 Sustainability by T22 B6.</p>
    <div class="stack small" style="gap:6px"><b>What's simulated</b><span class="muted">Bin sensors, lid-camera checks and fill rates are simulated. Use the sensor simulator on the map to move time forward.</span>
      <span class="muted">Distances are straight-line × ${ROAD_FACTOR}. BSF yields and CO₂ factors are typical published values, listed on the Impact page.</span>
      <span class="muted">Facilities, farms and stall accounts are sample data.</span></div>
    ${c.mode === 'cloud' && c.empty && html`<button class="btn primary" disabled=${busy} onClick=${async () => { setBusy(true); await c.act.seedCloud(); setBusy(false); }}>${busy ? 'Loading…' : 'Load sample data into the database'}</button>`}
    ${c.mode !== 'cloud' && html`<button class="btn" onClick=${() => c.act.resetLocal()}>${Ic.refresh()} Reset demo data on this device</button>`}
  </${Sheet}>`;
}
function DropSheet({ c, binId, onClose }) {
  return html`<${Sheet} title="Log a drop-off" sub=${c.D.binById[binId]?.name} onClose=${onClose}>
    ${c.role !== 'contributor' && html`<div class="small muted">Logging as ${c.personasFor('contributor')[0].name} (food business demo account).</div>`}
    <${DropForm} c=${c} binId=${binId} onDone=${onClose}/></${Sheet}>`;
}
