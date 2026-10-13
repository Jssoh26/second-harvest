const fs = require('fs');
const S = f => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
const mark = fs.readFileSync(__dirname + '/logo/mark.svg', 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '').replace(/`/g, '');
const geo = fs.readFileSync(__dirname + '/geo.json', 'utf8');
const js = [S('art.js').replace('__MARK__', mark), S('core.js'), S('ui.js'), S('live.js'), S('views1.js'), S('map.js'), S('views2.js'), S('app.js')].join('\n');
const page = `<title>Second Harvest</title>
<meta name="description" content="Food waste to black soldier fly circular economy app for Singapore.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap">
<style>
${S('style.css')}
</style>
<div id="app"></div>
<script src="https://unpkg.com/htm@3.1.1/preact/standalone.umd.js"></script>
<script>window.GEO = ${geo};</script>
<script>
${js}
</script>
`;
const head = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><link rel="icon" href="assets/second-harvest-icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="assets/second-harvest-icon.png"><meta name="theme-color" content="#1C6B43"><meta property="og:title" content="Second Harvest"><meta property="og:image" content="assets/second-harvest-logo.png"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>';
fs.writeFileSync(__dirname + '/../index.html', head + page + '</body></html>');
console.log('built', page.length, 'bytes');
