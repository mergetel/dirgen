import * as G from './gen.js';

const $ = (id) => document.getElementById(id);
const nicheEl = $('niche');
const vibeEl = $('vibe');
const tiersEl = $('tiers');
const preview = $('preview');

for (const id of G.NICHE_IDS) nicheEl.add(new Option(G.NICHES[id].label, id));
for (const id of G.VIBE_IDS) vibeEl.add(new Option(G.VIBES[id].label, id));
for (let n = G.MIN_TIERS; n <= G.MAX_TIERS; n++) {
  const names = G.PLANS.slice(0, n).map((p) => p.name.replace(' Featured', ''));
  tiersEl.add(new Option(`${n} (${names.join(', ')})`, String(n)));
}

function readState() {
  const p = new URLSearchParams(location.hash.slice(1));
  const seed = G.codeToSeed(p.get('s') || '');
  return {
    seed: seed ?? G.randomSeed(),
    ...G.cleanOptions({ niche: p.get('niche'), vibe: p.get('vibe'), tiers: p.get('tiers') }),
  };
}

let state = readState();
let dir = null;
let unwire = () => {};

const svgUrl = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function render() {
  dir = G.generate(state.seed, state);
  nicheEl.value = dir.niche;
  vibeEl.value = dir.vibe;
  tiersEl.value = String(dir.tiers);

  const hash = '#' + new URL(G.permalink(dir)).hash.slice(1);
  if (location.hash !== hash) history.replaceState(null, '', hash);

  unwire();
  preview.innerHTML = G.renderDirectory(dir);
  unwire = G.wireDirectory(preview, G.listingCount);

  $('url').textContent = G.permalink(dir).replace(/^https:\/\//, '');
  document.title = `${dir.name}, a directory that doesn't exist`;

  const badge = $('badge');
  badge.src = svgUrl(G.badgeSvg(dir.name));
  badge.alt = `Featured on ${dir.name}, ${G.SMALL_PRINT}`;
  const snips = G.badgeSnippets(dir);
  $('snip-html').textContent = snips.html;
  $('snip-md').textContent = snips.markdown;
  $('export-status').textContent = '';
}

function download(filename, type, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function copyText(button, text) {
  const before = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch (_err) {
    button.textContent = "Couldn't copy, select it by hand";
  }
  setTimeout(() => { button.textContent = before; }, 1800);
}

$('generate').addEventListener('click', () => { state = { ...state, seed: G.randomSeed() }; render(); });
for (const [el, key] of [[nicheEl, 'niche'], [vibeEl, 'vibe'], [tiersEl, 'tiers']]) {
  el.addEventListener('change', () => { state = { ...state, [key]: el.value }; render(); });
}
window.addEventListener('hashchange', () => { state = readState(); render(); });

$('copy-link').addEventListener('click', (e) => copyText(e.currentTarget, G.permalink(dir)));
for (const btn of document.querySelectorAll('[data-copy]')) {
  btn.addEventListener('click', () => copyText(btn, $(btn.dataset.copy).textContent));
}
$('dl-svg').addEventListener('click', () => {
  download(`featured-on-${slug(dir.name)}.svg`, 'image/svg+xml', G.badgeSvg(dir.name));
});

$('export').addEventListener('click', async () => {
  const status = $('export-status');
  status.className = 'status';
  status.textContent = 'Building the file...';
  try {
    const res = await fetch('site.css');
    if (!res.ok) throw new Error(`site.css answered ${res.status}`);
    const css = await res.text();
    download(`${slug(dir.name)}-doesnt-exist.html`, 'text/html', G.exportHtml(dir, css));
    status.textContent = `Downloaded ${dir.name}. It still doesn't exist.`;
  } catch (err) {
    status.className = 'status err';
    status.textContent = `Couldn't build the export: ${err.message}`;
  }
});

async function loadToday() {
  const box = $('today');
  try {
    const res = await fetch('data/generated.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`data/generated.json answered ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) {
      box.innerHTML = '<p class="status">The first one generates tomorrow morning.</p>';
      return;
    }
    const today = list[list.length - 1];
    const nth = list.filter((e) => e.date.slice(0, 4) === today.date.slice(0, 4)).length;
    box.innerHTML = `<div class="today-card">
      <strong>${G.esc(today.name)}</strong>
      <span>"${G.esc(today.tagline)}" · ${G.esc(G.NICHES[today.niche]?.label ?? today.niche)} · ${G.esc(today.date)}, the ${G.ordinal(nth)} this year</span>
      <img src="${svgUrl(G.badgeSvg(today.name))}" width="250" height="54" alt="Featured on ${G.esc(today.name)}, ${G.esc(G.SMALL_PRINT)}">
      <div><button type="button" id="open-today">Open today's directory</button></div>
    </div>`;
    $('open-today').addEventListener('click', () => {
      state = { seed: G.codeToSeed(today.seed), ...G.cleanOptions(today) };
      render();
      preview.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  } catch (err) {
    box.innerHTML = `<p class="status err">Couldn't load today's directory: ${G.esc(err.message)}</p>`;
  }
}

render();
loadToday();
