// Generates seed.json: sample data for the Second Harvest prototype.
const fs = require('fs');
const geo = JSON.parse(fs.readFileSync(__dirname + '/geo.json'));
let s = 20261011; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = a => a[Math.floor(rnd() * a.length)];
const NOW = Date.now(); const H = 3.6e6, D = 24 * H;
const r1 = x => Math.round(x * 10) / 10;

// point-in-land check against SG regions
function parsePolys(d){return d.split('Z').filter(Boolean).map(r=>r.replace('M','').split('L').map(p=>p.trim().split(' ').map(Number)));}
const landPolys = Object.values(geo.sg.regions).flatMap(parsePolys);
const proj = (lat, lon) => [(lon - geo.sg.W0) * geo.sg.K, (geo.sg.N0 - lat) * geo.sg.K];
function inPoly(pt, poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>pt[1])!=(yj>pt[1]))&&(pt[0]<(xj-xi)*(pt[1]-yi)/(yj-yi)+xi))c=!c;}return c;}
const onLand = (lat, lon) => landPolys.some(p => inPoly(proj(lat, lon), p));

const B = (id, name, kind, zone, lat, lon, cap, rate, extra = {}) => ({ id, name, kind, zone, lat, lon, capacityKg: cap, ratePerHr: rate, ...extra });
const bins = [
  B('ntu-ns', 'North Spine Food Court', 'canteen', 'NTU', 1.3474, 103.6803, 320, 6.5),
  B('ntu-ss', 'South Spine Food Court', 'canteen', 'NTU', 1.3425, 103.6826, 300, 5.8),
  B('ntu-c2', 'Canteen 2', 'canteen', 'NTU', 1.3487, 103.6856, 240, 4.2),
  B('ntu-c9', 'Canteen 9', 'canteen', 'NTU', 1.3523, 103.6854, 240, 3.6),
  B('ntu-c11', 'Canteen 11', 'canteen', 'NTU', 1.3547, 103.6865, 240, 3.9),
  B('ntu-c13', 'Canteen 13', 'canteen', 'NTU', 1.3512, 103.6905, 200, 3.1),
  B('ntu-c14', 'Canteen 14', 'canteen', 'NTU', 1.3527, 103.6820, 220, 3.4),
  B('ntu-c16', 'Canteen 16', 'canteen', 'NTU', 1.3500, 103.6810, 220, 3.0),
  B('maxwell', 'Maxwell Food Centre', 'hawker', 'Central', 1.2803, 103.8448, 400, 8.5),
  B('amoy', 'Amoy Street Food Centre', 'hawker', 'Central', 1.2793, 103.8467, 360, 7.2),
  B('laupasat', 'Lau Pa Sat', 'hawker', 'Central', 1.2807, 103.8504, 400, 9.0),
  B('chinatown', 'Chinatown Complex Food Centre', 'hawker', 'Central', 1.2823, 103.8431, 420, 8.8),
  B('tiongbahru', 'Tiong Bahru Market', 'hawker', 'Central', 1.2852, 103.8326, 360, 6.9),
  B('honglim', 'Hong Lim Market & Food Centre', 'hawker', 'Central', 1.2856, 103.8458, 320, 6.1),
  B('tekka', 'Tekka Centre', 'hawker', 'Central', 1.3062, 103.8508, 380, 7.6),
  B('newton', 'Newton Food Centre', 'hawker', 'Central', 1.3120, 103.8396, 340, 6.4),
  B('adamroad', 'Adam Road Food Centre', 'hawker', 'Central', 1.3241, 103.8140, 260, 4.8),
  B('oldairport', 'Old Airport Road Food Centre', 'hawker', 'Central', 1.3080, 103.8857, 400, 8.1),
  B('ghimmoh', 'Ghim Moh Market & Food Centre', 'hawker', 'Central', 1.3110, 103.7880, 300, 5.2),
  B('bedok85', 'Bedok 85 Fengshan Food Centre', 'hawker', 'East', 1.3317, 103.9387, 320, 6.6),
  B('tampinesrd', 'Tampines Round Market', 'hawker', 'East', 1.3466, 103.9530, 340, 6.2),
  B('eclagoon', 'East Coast Lagoon Food Village', 'hawker', 'East', 1.3069, 103.9346, 300, 5.4),
  B('clementi448', 'Clementi 448 Market & Food Centre', 'hawker', 'West', 1.3121, 103.7650, 320, 5.9),
  B('jw505', 'Jurong West 505 Market & Food Centre', 'hawker', 'West', 1.3502, 103.7186, 320, 5.6),
  B('boonlay', 'Boon Lay Place Food Village', 'hawker', 'West', 1.3465, 103.7120, 300, 5.3),
  B('yishunpark', 'Yishun Park Hawker Centre', 'hawker', 'North', 1.4268, 103.8370, 300, 5.5),
  B('woodlands', 'Woodlands Street 12 Market', 'hawker', 'North', 1.4340, 103.7745, 280, 4.9),
  B('chompchomp', 'Chomp Chomp Food Centre', 'hawker', 'North-East', 1.3644, 103.8665, 280, 5.0),
  B('amk628', 'Ang Mo Kio 628 Market', 'hawker', 'North-East', 1.3800, 103.8410, 300, 5.1),
  B('kovan209', 'Kovan 209 Market & Food Centre', 'hawker', 'North-East', 1.3594, 103.8853, 300, 5.2),
  B('hdb-tengah', 'HDB collection point · Tengah', 'hdb', 'West', 1.3560, 103.7350, 200, 2.6),
  B('hdb-bidadari', 'HDB collection point · Bidadari', 'hdb', 'Central', 1.3370, 103.8700, 200, 2.4),
  B('hdb-punggol', 'HDB collection point · Punggol', 'hdb', 'North-East', 1.4040, 103.9050, 220, 2.9),
  B('hdb-tampines', 'HDB collection point · Tampines North', 'hdb', 'East', 1.3700, 103.9400, 200, 2.5),
];
// fills at seed time: ~10 ready, 2 overflowing, rest spread
const readySet = new Set(['maxwell','chinatown','laupasat','tekka','oldairport','ntu-ns','ntu-c2','bedok85','jw505','chompchomp','tiongbahru']);
const overflow = new Set(['laupasat','ntu-ns']);
const contam = { 'boonlay': 19, 'newton': 23 };
bins.forEach(b => {
  if (!onLand(b.lat, b.lon)) console.warn('OFF LAND', b.id);
  let pct = readySet.has(b.id) ? 0.81 + rnd() * 0.14 : 0.18 + rnd() * 0.55;
  if (overflow.has(b.id)) pct = 0.99;
  if (contam[b.id]) pct = 0.86;
  b.fillKg = Math.round(b.capacityKg * pct);
  b.contamPct = contam[b.id] || Math.round((1.5 + rnd() * 6) * 10) / 10;
  b.tempC = r1(29 + rnd() * 4.5); if (b.id === 'tekka') b.tempC = 37.8;
  b.sensor = b.kind === 'hdb' ? 'Ultrasonic fill sensor' : 'Compacting smart bin';
  b.updatedAt = NOW; b.lastEmptiedAt = NOW - (6 + rnd() * 18) * H;
});

const F = (id, name, area, zone, lat, lon, quota, cap, accepts, extra = {}) => ({ id, name, area, zone, lat, lon, dailyQuotaKg: quota, maxCapacityKg: cap, accepts, window: '08:00 – 18:00', urgent: false, note: '', updatedAt: NOW, ...extra });
const ALL = ['cooked', 'produce', 'grains', 'okara'];
const facilities = [
  F('f-tuas', 'Tuas Larva Works', 'Tuas', 'West', 1.3200, 103.6450, 1800, 2600, ALL, { note: 'Main larvae colony. Prefers cooked food & rice for fat content.' }),
  F('f-kranji', 'Kranji Larvae Collective', 'Kranji', 'North', 1.4300, 103.7230, 700, 1000, ['produce', 'grains', 'okara'], { note: 'Feeds frass straight to partner farms next door.', window: '07:00 – 15:00' }),
  F('f-senoko', 'Senoko Circular Hub', 'Senoko', 'North', 1.4600, 103.8020, 1200, 1700, ALL, { urgent: true, note: 'New colony batch hatching — need extra feed this week.' }),
  F('f-loyang', 'Loyang Grub Co-op', 'Loyang', 'East', 1.3720, 103.9700, 650, 900, ['cooked', 'produce', 'grains'], { window: '09:00 – 19:00' }),
  F('f-ntu', 'NTU Pilot BSF Unit', 'NTU campus', 'NTU', 1.3445, 103.6885, 150, 220, ['produce', 'grains', 'okara'], { note: 'Student-run pilot. Small batches only, max 60 kg per drop.', window: '10:00 – 17:00' }),
];
facilities.forEach(f => { if (!onLand(f.lat, f.lon)) console.warn('OFF LAND', f.id); });

const P = (id, facilityId, name, category, unit, price, stock, art, spec, desc, segments, extra = {}) => ({ id, facilityId, name, category, unit, price, stock, art, ...spec, desc, segments, active: true, createdAt: NOW - (20 + rnd() * 60) * D, ...extra });
const products = [
  P('p-frassgold', 'f-tuas', 'Frass Gold Organic Fertiliser', 'Fertiliser', '5 kg bag', 14.9, 180, 'frass', { n: 3.2, p: 2.4, k: 1.6 }, 'Sieved, heat-treated BSF frass from hawker food waste. Slow-release nitrogen with chitin that helps roots resist pests.', ['farm', 'student', 'agri'], { hue: 'green' }),
  P('p-meal', 'f-tuas', 'Larvae Protein Meal', 'Animal feed', '10 kg sack', 68, 64, 'meal', { protein: 52, fat: 10 }, 'Defatted BSF larvae meal. A drop-in replacement for part of the fishmeal in aquafeed formulations.', ['aquaculture', 'agri'], { hue: 'blue' }),
  P('p-dried', 'f-tuas', 'Dried BSF Larvae', 'Animal feed', '1 kg pouch', 16, 120, 'larvae', { protein: 42, fat: 32 }, 'Whole sun-and-oven dried larvae. Treats for poultry, koi and arowana.', ['aquaculture', 'farm', 'student'], { hue: 'amber' }),
  P('p-kranjiblend', 'f-kranji', 'Kranji Frass Compost Blend', 'Fertiliser', '10 kg bag', 19.5, 90, 'frass', { n: 2.6, p: 2.0, k: 1.4 }, 'Frass blended with composted leaf litter for raised beds and potting mixes.', ['farm', 'student'], { hue: 'leaf' }),
  P('p-pellets', 'f-kranji', 'Floating Fish Pellets (30% BSF)', 'Animal feed', '5 kg tub', 24, 75, 'pellet', { protein: 38, fat: 9 }, 'Extruded floating pellets for tilapia and barramundi grow-out. 30% of the protein comes from BSF meal.', ['aquaculture'], { hue: 'teal' }),
  P('p-highk', 'f-senoko', 'Senoko High-K Frass', 'Fertiliser', '5 kg bag', 16.5, 140, 'frass', { n: 2.8, p: 1.9, k: 3.4 }, 'Reformulated after buyer soil tests showed potassium gaps: larvae are fed a higher share of fruit peels, and the frass is blended with banana-stem ash.', ['farm', 'agri'], { hue: 'gold', tags: ['Reformulated from soil tests'] }),
  P('p-chitin', 'f-senoko', 'BSF Chitin Flakes', 'Biomaterials', '250 g jar', 22, 40, 'chitin', { chitin: 18 }, 'Chitin-rich flakes from shed larval skins and pupal cases. Mix into potting soil as a plant-health amendment.', ['agri', 'farm'], { hue: 'rose' }),
  P('p-live', 'f-senoko', 'Live Larvae for Poultry', 'Live larvae', '2 kg tray', 18, 30, 'live', { protein: 40, fat: 30 }, 'Fresh 5th-instar larvae, delivered within 24 hours. Chickens love them.', ['farm'], { hue: 'cream' }),
  P('p-coastal', 'f-loyang', 'Coastal Frass Pellets', 'Fertiliser', '5 kg bag', 13.5, 110, 'frass', { n: 3.0, p: 2.6, k: 1.8 }, 'Pelletised frass that spreads evenly with a hand spreader. Low dust.', ['farm', 'agri'], { hue: 'brown' }),
  P('p-shrimp', 'f-loyang', 'Shrimp Starter Crumble', 'Animal feed', '2 kg bag', 21, 50, 'meal', { protein: 45, fat: 11 }, 'Fine crumble for post-larval shrimp and fry nurseries.', ['aquaculture'], { hue: 'coral' }),
  P('p-kit', 'f-ntu', 'Campus Grow Kit', 'Starter kits', 'Kit', 9.9, 60, 'kit', { n: 3.0, p: 2.2, k: 1.7 }, '2 kg of frass, a seed pack (kangkong, bayam, chilli) and a planting guide. Made by the NTU pilot.', ['student'], { hue: 'green' }),
  P('p-studentfrass', 'f-ntu', 'Student Starter Frass', 'Fertiliser', '1 kg pouch', 4.5, 85, 'frass', { n: 3.1, p: 2.3, k: 1.6 }, 'Small pouch for balcony and hall-room planters.', ['student'], { hue: 'leaf' }),
];

// Buyers: personas + background buyers
const buyers = [
  { id: 'b-kampong', seg: 'farm' }, { id: 'b-seletar', seg: 'aquaculture' }, { id: 'b-ntugarden', seg: 'student' },
  { id: 'b-agri1', seg: 'agri' }, { id: 'b-agri2', seg: 'agri' }, { id: 'b-farm2', seg: 'farm' }, { id: 'b-farm3', seg: 'farm' }, { id: 'b-farm4', seg: 'farm' },
  { id: 'b-aqua2', seg: 'aquaculture' }, { id: 'b-aqua3', seg: 'aquaculture' }, { id: 'b-stu2', seg: 'student' }, { id: 'b-stu3', seg: 'student' },
];
const TAGS = {
  good: ['Great plant growth', 'Consistent quality', 'Fast delivery', 'Fair price', 'No odour', 'Fish took it well', 'Easy to apply'],
  bad: ['Low potassium', 'Bag arrived damp', 'Strong smell', 'Uneven particle size', 'Delivery delayed', 'Pricey for small farms'],
};
const comments = {
  'p-frassgold': [['farm', 4, 'Kailan beds greener within two weeks. Soil test still shows low K though.', ['Great plant growth', 'Low potassium']], ['farm', 3, 'Works, but we had to top up potassium separately.', ['Low potassium']], ['student', 5, 'Hall plants are thriving and no smell at all.', ['No odour', 'Easy to apply']], ['agri', 4, 'Good base fertiliser. Would like a K-enriched version.', ['Consistent quality', 'Low potassium']], ['farm', 4, '', ['Great plant growth']], ['farm', 3, 'One bag was clumpy and damp.', ['Bag arrived damp']]],
  'p-meal': [['aquaculture', 5, 'Replaced 25% of fishmeal and growth rate held steady.', ['Fish took it well', 'Consistent quality']], ['aquaculture', 4, 'Good protein. Price is close to fishmeal now.', ['Fish took it well']], ['agri', 5, 'Lab results matched the label.', ['Consistent quality']], ['aquaculture', 4, '', ['Fast delivery']]],
  'p-dried': [['farm', 5, 'Hens go crazy for these.', ['Easy to apply']], ['aquaculture', 4, 'Arowana accepted them after a few days.', ['Fish took it well']], ['student', 4, 'Used for our pond project.', []]],
  'p-kranjiblend': [['farm', 4, 'Nice texture for raised beds.', ['Easy to apply']], ['student', 5, 'Our community garden loves it.', ['Great plant growth']], ['farm', 3, 'Smelled earthy-strong for a few days after opening.', ['Strong smell']]],
  'p-pellets': [['aquaculture', 4, 'Pellets float well; tilapia feed actively.', ['Fish took it well']], ['aquaculture', 3, 'Some batches had uneven pellet size.', ['Uneven particle size']], ['aquaculture', 4, '', ['Consistent quality']]],
  'p-highk': [['farm', 5, 'Finally fixed our potassium gap. Leaf tip burn gone.', ['Great plant growth']], ['farm', 5, 'Soil K went from low to optimal in two months.', ['Great plant growth', 'Consistent quality']], ['agri', 4, 'Good, slightly pricier than standard frass.', ['Pricey for small farms']], ['farm', 4, '', ['Easy to apply']]],
  'p-chitin': [['agri', 4, 'Seeing fewer root problems in seedlings.', ['Great plant growth']], ['farm', 3, 'Hard to judge results yet. Small jar for the price.', ['Pricey for small farms']]],
  'p-live': [['farm', 5, 'Fresh and lively on arrival.', ['Fast delivery']], ['farm', 4, 'One tray delayed a day.', ['Delivery delayed']]],
  'p-coastal': [['farm', 4, 'Pellets spread evenly with our spreader.', ['Easy to apply']], ['agri', 4, '', ['Fair price']], ['farm', 3, 'Delivery to Lim Chu Kang took a week.', ['Delivery delayed']]],
  'p-shrimp': [['aquaculture', 4, 'Good for our nursery tanks.', ['Fish took it well']], ['aquaculture', 5, '', ['Consistent quality']]],
  'p-kit': [['student', 5, 'Best $10 I spent this semester. Chilli plant is fruiting!', ['Great plant growth', 'Fair price']], ['student', 5, 'Fun hall activity.', ['Easy to apply']], ['student', 4, 'Guide could explain watering better.', []]],
  'p-studentfrass': [['student', 4, 'Small and handy.', ['No odour']], ['student', 4, '', ['Fair price']]],
};
const feedback = []; let fi = 0;
for (const [pid, list] of Object.entries(comments)) {
  const prod = products.find(p => p.id === pid);
  for (const [seg, fit, comment, tags] of list) {
    const jitter = () => Math.max(1, Math.min(5, fit + (rnd() < 0.3 ? -1 : rnd() < 0.2 ? 1 : 0)));
    const buyer = pick(buyers.filter(b => b.seg === seg));
    feedback.push({ id: 'fb-' + (++fi), productId: pid, facilityId: prod.facilityId, buyerId: buyer.id, segment: seg, fit, quality: jitter(), consistency: jitter(), delivery: tags.includes('Delivery delayed') ? 2 : jitter(), value: tags.includes('Pricey for small farms') ? 3 : jitter(), tags, comment, at: NOW - (1 + rnd() * 50) * D });
  }
}

// Soil tests: Kampong Greens progression (Repair tracking) + others
const soiltests = [];
const kg = [[85, 18, 31, 5.6, 2.1, 92], [98, 24, 33, 5.9, 2.6, 64], [118, 27, 34, 6.1, 3.0, 36], [134, 30, 35, 6.3, 3.4, 8]];
kg.forEach(([k, n, p, ph, om, ago], i) => soiltests.push({ id: 'st-kg' + i, buyerId: 'b-kampong', crop: 'Leafy greens', n, p, k, ph, om, at: NOW - ago * D }));
[['b-ntugarden', 'Herbs & chilli', 22, 28, 96, 6.4, 2.8, 40], ['b-ntugarden', 'Herbs & chilli', 26, 30, 108, 6.5, 3.1, 10],
 ['b-farm2', 'Leafy greens', 15, 24, 88, 5.7, 2.2, 21], ['b-farm3', 'Fruiting vegetables', 28, 38, 102, 6.2, 3.3, 15], ['b-farm4', 'Leafy greens', 19, 26, 79, 5.5, 1.9, 6],
 ['b-agri1', 'Fruiting vegetables', 31, 41, 118, 6.6, 3.9, 12], ['b-agri2', 'Leafy greens', 25, 22, 140, 6.0, 2.7, 3]]
  .forEach(([buyerId, crop, n, p, k, ph, om, ago], i) => soiltests.push({ id: 'st-o' + i, buyerId, crop, n, p, k, ph, om, at: NOW - ago * D }));

// Waste drop-offs (last 14 days)
const TYPES = ['cooked', 'cooked', 'produce', 'grains', 'cooked', 'produce', 'okara', 'bones', 'oil'];
const drops = []; let di = 0;
const persBins = { 'u-hawker': 'tiongbahru', 'u-ntu': 'ntu-ns' };
for (let i = 0; i < 46; i++) {
  const who = i % 5 === 0 ? 'u-hawker' : i % 5 === 1 ? 'u-ntu' : 'guest';
  const bin = who === 'guest' ? pick(bins).id : persBins[who];
  const type = pick(TYPES); const kgv = Math.round((type === 'oil' ? 3 + rnd() * 6 : 6 + rnd() * 30));
  drops.push({ id: 'dr-' + (++di), binId: bin, who, kg: kgv, type, clean: rnd() > 0.12, at: NOW - rnd() * 14 * D });
}

// Deliveries: last 7 days per facility + some today
const deliveries = []; let dv = 0;
for (const f of facilities) for (let d = 1; d <= 7; d++) {
  const share = 0.55 + rnd() * 0.4; const kgv = Math.round(f.dailyQuotaKg * share);
  deliveries.push({ id: 'dv-' + (++dv), facilityId: f.id, collectorId: pick(['u-van07', 'van-12', 'van-03']), kg: kgv, stops: 3 + Math.floor(rnd() * 6), at: NOW - d * D + (rnd() - 0.5) * 6 * H });
}
const todayShare = { 'f-tuas': 0.42, 'f-kranji': 0.71, 'f-senoko': 0.18, 'f-loyang': 0.55, 'f-ntu': 0.3 };
for (const f of facilities) deliveries.push({ id: 'dv-' + (++dv), facilityId: f.id, collectorId: 'van-12', kg: Math.round(f.dailyQuotaKg * todayShare[f.id]), stops: 4, at: NOW - 1.5 * H });

// Past pickups (routes)
const pickups = [];
[[6, 'f-tuas', 'West', 642, 38.4, 71.2], [5, 'f-tuas', 'NTU', 418, 12.1, 26.5], [4, 'f-senoko', 'North', 520, 31.9, 58.0], [3, 'f-tuas', 'Central', 905, 44.7, 96.3], [2, 'f-loyang', 'East', 470, 29.3, 61.8], [1, 'f-ntu', 'NTU', 120, 4.2, 9.6]]
  .forEach(([ago, fac, zone, load, km, base], i) => pickups.push({ id: 'pk-' + i, collectorId: 'u-van07', facilityId: fac, zone, loadKg: load, km, baselineKm: base, stops: 4 + (i % 4), caddies: 4 + (i % 4), status: 'Delivered', at: NOW - ago * D }));

// Orders
const orders = [];
[['b-kampong', [['p-frassgold', 4]], 0, 70], ['b-kampong', [['p-highk', 6]], 500, 30], ['b-kampong', [['p-highk', 4], ['p-chitin', 1]], 0, 9],
 ['b-seletar', [['p-meal', 3]], 0, 26], ['b-seletar', [['p-pellets', 4]], 300, 12], ['b-ntugarden', [['p-kit', 5]], 200, 18], ['b-agri1', [['p-coastal', 10]], 0, 7], ['b-farm2', [['p-kranjiblend', 3]], 0, 5]]
  .forEach(([buyerId, items, pts, ago], i) => {
    const its = items.map(([pid, qty]) => { const p = products.find(x => x.id === pid); return { productId: pid, name: p.name, qty, price: p.price, facilityId: p.facilityId }; });
    const subtotal = its.reduce((a, b) => a + b.qty * b.price, 0); const discount = pts / 100;
    orders.push({ id: 'or-' + i, buyerId, items: its, subtotal: +subtotal.toFixed(2), pointsUsed: pts, voucherValue: 0, discount, total: +(subtotal - discount).toFixed(2), status: ago > 3 ? 'Delivered' : 'Packed', at: NOW - ago * D });
  });

// Points ledger
const ledger = []; let li = 0;
const L = (who, delta, reason, ago) => ledger.push({ id: 'lg-' + (++li), who, delta, reason, at: NOW - ago * D });
drops.filter(d => d.who !== 'guest').forEach(d => { const bsf = !['bones', 'oil'].includes(d.type); const pts = bsf ? d.kg * 2 + (d.clean ? 10 : 0) : 5; L(d.who, pts, bsf ? `Logged ${d.kg} kg ${d.clean ? 'clean ' : ''}food waste` : `Sorted ${d.kg} kg ${d.type === 'oil' ? 'cooking oil' : 'bones & shells'} for recovery`, (NOW - d.at) / D); });
L('u-hawker', 300, 'Green Stall of the Month bonus', 9); L('u-ntu', 500, 'Canteen pilot sign-up bonus', 40);
pickups.forEach(p => L('u-van07', Math.round(p.loadKg / 10) + 25, `Route delivered · ${p.loadKg} kg to BSF`, (NOW - p.at) / D));
L('u-van07', 150, 'Zero-rejection week bonus', 8);
L('b-kampong', 400, 'Welcome bonus', 100); L('b-kampong', 60, 'Purchase reward', 70); L('b-kampong', 20, 'Soil test submitted', 92); L('b-kampong', 20, 'Soil test submitted', 64); L('b-kampong', 20, 'Soil test submitted', 36); L('b-kampong', 20, 'Soil test submitted', 8);
L('b-kampong', -500, 'Used at checkout', 30); L('b-kampong', 98, 'Purchase reward', 30); L('b-kampong', 15, 'Product feedback', 28); L('b-kampong', 15, 'Product feedback', 12); L('b-kampong', 1000, 'Supplied 1 t of trimmings to Kranji collective', 20); L('b-kampong', 88, 'Purchase reward', 9); L('b-kampong', -500, 'Redeemed: $5 off any BSF product', 4);
L('b-seletar', 400, 'Welcome bonus', 60); L('b-seletar', 204, 'Purchase reward', 26); L('b-seletar', -300, 'Used at checkout', 12); L('b-seletar', 93, 'Purchase reward', 12); L('b-seletar', 15, 'Product feedback', 10);
L('b-ntugarden', 400, 'Welcome bonus', 45); L('b-ntugarden', -200, 'Used at checkout', 18); L('b-ntugarden', 47, 'Purchase reward', 18); L('b-ntugarden', 20, 'Soil test submitted', 40); L('b-ntugarden', 20, 'Soil test submitted', 10); L('b-ntugarden', 30, 'Hall recycling drive', 6);
L('f-tuas', 0, 'Facility account opened', 120);


// ===================== KOREA (Seoul) =====================
const projKR = (lat, lon) => [(lon - geo.seoul.W0) * geo.seoul.K * geo.seoul.cos, (geo.seoul.N0 - lat) * geo.seoul.K];
const krLand = Object.values(geo.seoul.regions).flatMap(parsePolys);
const onSeoul = (lat, lon) => krLand.some(p => inPoly(projKR(lat, lon), p));
const KB = [
  ['gwangjang', 'Gwangjang Market', 'market', 'Jongno', 37.5701, 126.9996, 420, 9.5], ['namdaemun', 'Namdaemun Market', 'market', 'Jung', 37.5592, 126.9775, 400, 8.4],
  ['noryangjin', 'Noryangjin Fish Market', 'market', 'Dongjak', 37.5133, 126.9406, 460, 9.8], ['mangwon', 'Mangwon Market', 'market', 'Mapo', 37.5560, 126.9060, 340, 6.8],
  ['tongin', 'Tongin Market', 'market', 'Jongno', 37.5806, 126.9701, 300, 5.6], ['garak', 'Garak Market', 'market', 'Songpa', 37.4930, 127.1106, 480, 10.2],
  ['gyeongdong', 'Gyeongdong Market', 'market', 'Dongdaemun', 37.5795, 127.0393, 380, 7.4], ['snu', 'Seoul National University cafeterias', 'campus', 'Gwanak', 37.4600, 126.9520, 300, 5.9],
  ['yonsei', 'Yonsei University cafeteria', 'campus', 'Seodaemun', 37.5658, 126.9386, 280, 5.2], ['korea-u', 'Korea University cafeteria', 'campus', 'Seongbuk', 37.5895, 127.0323, 260, 4.9],
  ['jamsil', 'Jamsil apartments', 'rfid', 'Songpa', 37.5110, 127.0860, 240, 3.4], ['mokdong', 'Mok-dong apartments', 'rfid', 'Yangcheon', 37.5300, 126.8750, 240, 3.2],
  ['sanggye', 'Sanggye apartments', 'rfid', 'Nowon', 37.6560, 127.0650, 240, 3.3], ['banpo', 'Banpo apartments', 'rfid', 'Seocho', 37.5050, 126.9950, 220, 3.0],
  ['eunpyeong', 'Eunpyeong New Town', 'rfid', 'Eunpyeong', 37.6370, 126.9180, 220, 2.9], ['magok', 'Magok apartments', 'rfid', 'Gangseo', 37.5600, 126.8300, 240, 3.1],
  ['wangsimni', 'Wangsimni apartments', 'rfid', 'Seongdong', 37.5610, 127.0370, 220, 2.8], ['godeok', 'Godeok apartments', 'rfid', 'Gangdong', 37.5550, 127.1550, 220, 2.7],
];
const krReady = new Set(['gwangjang', 'noryangjin', 'garak', 'namdaemun', 'mangwon', 'snu', 'jamsil', 'yonsei']);
const krBins = KB.map(([id, name, kind, zone, lat, lon, cap, rate], i) => { if (!onSeoul(lat, lon)) console.warn('KR OFF', id);
  let p = krReady.has(id) ? 0.81 + rnd() * 0.15 : 0.2 + rnd() * 0.5; if (id === 'garak') p = 0.99; const contam = id === 'tongin' ? 21 : r1(1.2 + rnd() * 5);
  return { id: 'kr-' + id, region: 'kr', name, kind, zone, lat, lon, capacityKg: cap, ratePerHr: rate, fillKg: Math.round(cap * p), contamPct: contam, tempC: r1(17 + rnd() * 5), sensor: 'RFID weighing bin', updatedAt: NOW, lastEmptiedAt: NOW - (6 + rnd() * 18) * H }; });
const krFacs = [
  { id: 'kr-f1', region: 'kr', name: 'Gangseo Larva Center', area: 'Gangseo-gu', zone: 'Gangseo', lat: 37.5760, lon: 126.8150, dailyQuotaKg: 2400, maxCapacityKg: 3200, accepts: ['cooked', 'produce', 'grains'], window: '07:00 – 19:00', urgent: false, note: 'Largest colony in the network. Prefers market produce waste.', updatedAt: NOW },
  { id: 'kr-f2', region: 'kr', name: 'Nowon BioLoop', area: 'Nowon-gu', zone: 'Nowon', lat: 37.6650, lon: 127.0800, dailyQuotaKg: 1500, maxCapacityKg: 2000, accepts: ['cooked', 'produce'], window: '08:00 – 18:00', urgent: true, note: 'New breeding room opened. Extra feed needed this week.', updatedAt: NOW },
  { id: 'kr-f3', region: 'kr', name: 'Songpa Insect Works', area: 'Songpa-gu', zone: 'Songpa', lat: 37.4850, lon: 127.1300, dailyQuotaKg: 2000, maxCapacityKg: 2600, accepts: ['cooked', 'produce', 'grains', 'okara'], window: '08:00 – 18:00', urgent: false, note: 'Next to Garak Market. Takes tofu okara from local factories.', updatedAt: NOW },
];
const KP = (id, f, name, cat, unit, price, stock, art, spec, desc, segs, extra = {}) => ({ id, region: 'kr', facilityId: f, name, category: cat, unit, price, stock, art, ...spec, desc, segments: segs, active: true, createdAt: NOW - (20 + rnd() * 50) * D, ...extra });
const krProducts = [
  KP('kp-compost', 'kr-f1', 'Gangseo Frass Compost', 'Fertiliser', '5 kg bag', 16000, 160, 'frass', { n: 3.1, p: 2.3, k: 1.7 }, 'Heat-treated frass from Seoul market waste. For greenhouse lettuce and perilla.', ['farm', 'student'], { hue: 'green' }),
  KP('kp-meal', 'kr-f1', 'Larvae Protein Meal', 'Animal feed', '10 kg sack', 85000, 50, 'meal', { protein: 51, fat: 11 }, 'Defatted BSF meal for eel and catfish feed mills.', ['aquaculture', 'agri'], { hue: 'blue' }),
  KP('kp-highk', 'kr-f2', 'Nowon High-K Frass', 'Fertiliser', '5 kg bag', 18000, 120, 'frass', { n: 2.8, p: 1.9, k: 3.3 }, 'Potassium-boosted batch made after buyer soil tests showed K gaps in cabbage fields.', ['farm', 'agri'], { hue: 'gold', tags: ['Reformulated from soil tests'] }),
  KP('kp-dried', 'kr-f2', 'Dried BSF Larvae', 'Animal feed', '1 kg pouch', 19000, 90, 'larvae', { protein: 42, fat: 31 }, 'Whole dried larvae for backyard poultry and pond fish.', ['farm', 'student'], { hue: 'amber' }),
  KP('kp-pellets', 'kr-f3', 'Eel & Catfish Pellets (30% BSF)', 'Animal feed', '5 kg tub', 29000, 70, 'pellet', { protein: 40, fat: 10 }, 'Sinking pellets for freshwater eel and catfish farms.', ['aquaculture'], { hue: 'teal' }),
  KP('kp-kit', 'kr-f3', 'Rooftop Garden Kit', 'Starter kits', 'Kit', 12000, 60, 'kit', { n: 3.0, p: 2.2, k: 1.7 }, 'Frass, perilla and lettuce seeds, and a planting card for apartment balconies.', ['student'], { hue: 'green' }),
  KP('kp-chitin', 'kr-f3', 'BSF Chitin Flakes', 'Biomaterials', '250 g jar', 26000, 35, 'chitin', { chitin: 18 }, 'Chitin-rich flakes from shed larval skins. A soil-health amendment.', ['agri'], { hue: 'rose' }),
];
const krBuyers = [{ id: 'kb-namyangju', seg: 'farm' }, { id: 'kb-hangang', seg: 'aquaculture' }, { id: 'kb-snu', seg: 'student' }, { id: 'kb-farm2', seg: 'farm' }, { id: 'kb-agri1', seg: 'agri' }, { id: 'kb-aqua2', seg: 'aquaculture' }];
const krFb = [['kp-compost', 'farm', 4, 'Lettuce beds look healthy. Still low on potassium.', ['Great plant growth', 'Low potassium']], ['kp-compost', 'student', 5, 'No smell on our rooftop at all.', ['No odour']], ['kp-compost', 'farm', 3, 'Needed to add potassium separately for cabbage.', ['Low potassium']],
  ['kp-highk', 'farm', 5, 'Cabbage heads much firmer this season.', ['Great plant growth']], ['kp-highk', 'agri', 4, 'Good, a bit pricey for the bigger fields.', ['Pricey for small farms']], ['kp-meal', 'aquaculture', 5, 'Eels took it well at 20% inclusion.', ['Fish took it well']],
  ['kp-meal', 'agri', 4, '', ['Consistent quality']], ['kp-pellets', 'aquaculture', 4, 'Pellets sink evenly.', ['Fish took it well']], ['kp-pellets', 'aquaculture', 3, 'Delivery to Incheon took 4 days.', ['Delivery delayed']],
  ['kp-dried', 'farm', 5, 'Hens love them.', ['Easy to apply']], ['kp-kit', 'student', 5, 'Perilla is growing on our balcony!', ['Great plant growth', 'Fair price']], ['kp-chitin', 'agri', 4, 'Fewer seedling problems.', ['Great plant growth']]];
krFb.forEach(([pid, seg, fit, comment, tags]) => { const p = krProducts.find(x => x.id === pid); const jit = () => Math.max(1, Math.min(5, fit + (rnd() < 0.3 ? -1 : 0)));
  feedback.push({ id: 'fb-' + (++fi), region: 'kr', productId: pid, facilityId: p.facilityId, buyerId: pick(krBuyers.filter(b => b.seg === seg)).id, segment: seg, fit, quality: jit(), consistency: jit(), delivery: tags.includes('Delivery delayed') ? 2 : jit(), value: tags.includes('Pricey for small farms') ? 3 : jit(), tags, comment, at: NOW - (1 + rnd() * 40) * D }); });
[[78, 17, 29, 5.7, 2.2, 80], [92, 22, 31, 5.9, 2.6, 50], [121, 26, 33, 6.2, 3.1, 22], [138, 29, 35, 6.4, 3.5, 5]].forEach(([k, n, p, ph, om, ago], i) => soiltests.push({ id: 'st-kr' + i, region: 'kr', buyerId: 'kb-namyangju', crop: 'Leafy greens', n, p, k, ph, om, at: NOW - ago * D }));
[['kb-snu', 'Herbs & chilli', 24, 29, 104, 6.4, 3.0, 12], ['kb-farm2', 'Leafy greens', 16, 23, 84, 5.6, 2.1, 9], ['kb-agri1', 'Fruiting vegetables', 30, 40, 115, 6.5, 3.6, 4]].forEach(([b, crop, n, p, k, ph, om, ago], i) => soiltests.push({ id: 'st-kro' + i, region: 'kr', buyerId: b, crop, n, p, k, ph, om, at: NOW - ago * D }));
const krPers = { 'k-gwangjang': 'kr-gwangjang', 'k-yonsei': 'kr-yonsei' };
for (let i = 0; i < 30; i++) { const who = i % 4 === 0 ? 'k-gwangjang' : i % 4 === 1 ? 'k-yonsei' : 'guest'; const bin = who === 'guest' ? pick(krBins).id : krPers[who]; const type = pick(TYPES); const kgv = Math.round(type === 'oil' ? 3 + rnd() * 5 : 8 + rnd() * 30);
  drops.push({ id: 'dr-' + (++di), region: 'kr', binId: bin, who, kg: kgv, type, clean: rnd() > 0.1, at: NOW - rnd() * 14 * D }); }
const krShare = { 'kr-f1': 0.38, 'kr-f2': 0.21, 'kr-f3': 0.52 };
for (const f of krFacs) { for (let d = 1; d <= 7; d++) deliveries.push({ id: 'dv-' + (++dv), region: 'kr', facilityId: f.id, collectorId: pick(['k-van12', 'kvan-04']), kg: Math.round(f.dailyQuotaKg * (0.55 + rnd() * 0.4)), stops: 4 + Math.floor(rnd() * 5), at: NOW - d * D + (rnd() - 0.5) * 6 * H });
  deliveries.push({ id: 'dv-' + (++dv), region: 'kr', facilityId: f.id, collectorId: 'kvan-04', kg: Math.round(f.dailyQuotaKg * krShare[f.id]), stops: 5, at: NOW - 2 * H }); }
[[5, 'kr-f1', 'Mapo', 980, 21.4, 49.8], [3, 'kr-f3', 'Songpa', 1240, 18.2, 44.1], [2, 'kr-f2', 'Nowon', 610, 15.7, 33.9], [1, 'kr-f1', 'Gangseo', 720, 12.9, 30.2]].forEach(([ago, fac, zone, load, km, base], i) => pickups.push({ id: 'pk-kr' + i, region: 'kr', collectorId: 'k-van12', facilityId: fac, zone, loadKg: load, km, baselineKm: base, stops: 5 + i, caddies: 5 + i, status: 'Delivered', at: NOW - ago * D }));
[['kb-namyangju', [['kp-compost', 6]], 0, 60], ['kb-namyangju', [['kp-highk', 8]], 600, 20], ['kb-hangang', [['kp-pellets', 5]], 0, 14], ['kb-snu', [['kp-kit', 6]], 0, 8], ['kb-agri1', [['kp-chitin', 2], ['kp-meal', 1]], 0, 4]].forEach(([buyerId, items, pts, ago], i) => {
  const its = items.map(([pid, qty]) => { const p = krProducts.find(x => x.id === pid); return { productId: pid, name: p.name, qty, price: p.price, facilityId: p.facilityId }; });
  const subtotal = its.reduce((a, b) => a + b.qty * b.price, 0); const discount = pts * 10;
  orders.push({ id: 'or-kr' + i, region: 'kr', buyerId, items: its, subtotal, pointsUsed: pts, voucherValue: 0, discount, total: subtotal - discount, status: ago > 3 ? 'Delivered' : 'Packed', at: NOW - ago * D }); });
drops.filter(d => d.region === 'kr' && d.who !== 'guest').forEach(d => { const bsf = !['bones', 'oil'].includes(d.type); L(d.who, bsf ? d.kg * 2 + (d.clean ? 10 : 0) : 5, bsf ? `Logged ${d.kg} kg ${d.clean ? 'clean ' : ''}food waste` : `Sorted ${d.kg} kg ${d.type === 'oil' ? 'cooking oil' : 'bones & shells'} for recovery`, (NOW - d.at) / D); });
L('k-gwangjang', 250, 'Market clean-sorting bonus', 6); L('k-yonsei', 400, 'Campus pilot sign-up bonus', 30);
pickups.filter(p => p.region === 'kr').forEach(p => L('k-van12', Math.round(p.loadKg / 10) + 25, `Route delivered · ${p.loadKg} kg to BSF`, (NOW - p.at) / D));
L('kb-namyangju', 400, 'Welcome bonus', 90); L('kb-namyangju', 96, 'Purchase reward', 60); L('kb-namyangju', -600, 'Used at checkout', 20); L('kb-namyangju', 138, 'Purchase reward', 20); L('kb-namyangju', 80, 'Soil tests submitted', 5); L('kb-namyangju', 15, 'Product feedback', 10); L('kb-namyangju', 600, 'Supplied cabbage trimmings to Nowon BioLoop', 12);
L('kb-hangang', 400, 'Welcome bonus', 30); L('kb-hangang', 145, 'Purchase reward', 14); L('kb-snu', 400, 'Welcome bonus', 20); L('kb-snu', 72, 'Purchase reward', 8); L('kb-snu', 20, 'Soil test submitted', 12);

const vouchers = [{ id: 'vc-1', who: 'b-kampong', rewardId: 'r-5off', title: '$5 off any BSF product', value: 5, code: 'SH-5K2Q', used: false, at: NOW - 4 * D }];

vouchers.push({ id: 'vc-kr1', who: 'kb-namyangju', rewardId: 'r-5off', title: '₩5,000 off any BSF product', value: 5000, code: 'SH-K7RM', used: false, at: NOW - 3 * D });
const tag = (a, r) => a.forEach(x => { if (!x.region) x.region = r; });
[bins, facilities, products, feedback, soiltests, drops, deliveries, pickups, orders, vouchers].forEach(a => tag(a, 'sg'));
bins.push(...krBins); facilities.push(...krFacs); products.push(...krProducts);
const seed = { seededAt: NOW, bins, facilities, products, feedback, soiltests, drops, deliveries, pickups, orders, ledger, vouchers };
fs.writeFileSync(__dirname + '/../seed.json', JSON.stringify(seed));
const counts = Object.fromEntries(Object.entries(seed).filter(([k, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));
console.log(counts, 'total', Object.values(counts).reduce((a, b) => a + b, 0), 'bytes', JSON.stringify(seed).length);
