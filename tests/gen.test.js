import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import * as G from '../gen.js';

const CSS = readFileSync(new URL('../site.css', import.meta.url), 'utf8');

test('a seed always builds the same directory', () => {
  for (const seed of [0, 7, 42, 4294967295]) {
    assert.deepEqual(G.generate(seed, { niche: 'dev' }), G.generate(seed, { niche: 'dev' }));
  }
  assert.notEqual(G.generate(1).name, G.generate(2).name);
});

test('the name depends on the seed alone, so options never rename a badge', () => {
  for (const niche of G.NICHE_IDS) {
    for (const vibe of G.VIBE_IDS) {
      assert.equal(G.generate(99, { niche, vibe, tiers: 4 }).name, G.directoryName(99));
    }
  }
});

// If one of these fails, someone edited a FROZEN list in gen.js and every
// pasted badge just got renamed. Put the list back. If the only change was
// appending to a blocklist, the new fingerprint is fine to paste in.
test('frozen word lists still produce the same names', () => {
  assert.deepEqual([0, 1, 42, 99, 123456, 4294967295].map(G.directoryName),
    ['HypeDroppr', 'SeedBin', 'Upvoteverse', 'PromoHQ', 'BadgeHQ', 'MakerPile']);
  const names = [];
  for (let i = 0; i < 5000; i++) names.push(G.directoryName(i));
  assert.equal(G.hashString(names.join()), 3038681800, 'directory names changed');
  const tags = [];
  for (let i = 0; i < 500; i++) tags.push(G.directoryTagline(i));
  assert.equal(G.hashString(tags.join()), 3702631742, 'taglines changed');
  const tools = [];
  for (let i = 0; i < 300; i++) {
    const niche = G.NICHE_IDS[i % G.NICHE_IDS.length];
    tools.push(G.generate(i, { niche }).tools.map((t) => t.name + t.pitch + t.price + t.tag + t.upvotes).join());
  }
  assert.equal(G.hashString(tools.join()), 2055043243, 'tool listings changed');
});

test('normalizing catches case, spaces, punctuation and a TLD', () => {
  for (const n of ['Product Hunt', 'producthunt', 'PRODUCT HUNT.com', ' Product-Hunt ', 'Toolify.ai',
    "theres an ai for that", 'AppSumo.io', 'Calendly']) {
    assert.ok(G.isBlockedDirectory(n) || G.isBlockedTool(n), n);
  }
  assert.ok(G.isBlockedDirectory('BetaListr'), 'contains a long real name');
  assert.ok(!G.isBlockedDirectory('LaunchPile'));
});

test('no generated directory lands on a real one', () => {
  for (let i = 0; i < 40000; i++) {
    const name = G.directoryName(Math.imul(i, 2654435761) >>> 0);
    assert.ok(!G.isBlockedDirectory(name), name);
    assert.match(name, /^[A-Za-z]{4,20}$/);
  }
});

test('every tool ends in -ly, is unique in its directory, and is never a real one', () => {
  for (let i = 0; i < 3000; i++) {
    const dir = G.generate(i, { niche: G.NICHE_IDS[i % G.NICHE_IDS.length], tiers: 2 + (i % 4) });
    assert.equal(dir.tools.length, G.TOOL_COUNT);
    assert.equal(new Set(dir.tools.map((t) => t.name)).size, G.TOOL_COUNT);
    for (const t of dir.tools) {
      assert.match(t.name, /ly$/);
      assert.ok(!G.isBlockedTool(t.name), t.name);
    }
  }
  for (const real of ['Calendly', 'Grammarly', 'Bitly', 'Feedly', 'Invoicely', 'Shiply', 'Rebrandly']) {
    assert.ok(G.isBlockedTool(real), real);
  }
});

test('Featured is $49 and Super Featured is $199 at every tier count', () => {
  for (let tiers = G.MIN_TIERS; tiers <= G.MAX_TIERS; tiers++) {
    const dir = G.generate(5, { tiers });
    assert.equal(dir.plans.length, tiers);
    assert.deepEqual(dir.plans.slice(0, 2).map((p) => [p.name, p.price]), [['Featured', 49], ['Super Featured', 199]]);
    assert.ok(dir.tools.slice(0, Math.min(3, tiers)).every((t) => t.paid), 'paid listings are pinned on top');
  }
  assert.equal(G.cleanOptions({ tiers: 99 }).tiers, G.DEFAULTS.tiers);
  assert.equal(G.cleanOptions({ niche: '<script>' }).niche, G.DEFAULTS.niche);
});

test('seed codes round trip and junk is rejected', () => {
  for (const seed of [0, 1, 35, 36, 123456789, 4294967295]) {
    assert.equal(G.codeToSeed(G.seedToCode(seed)), seed);
  }
  for (const junk of ['', 'ABC', '../x', 'zzzzzzzz', '1z141z4', null, undefined, '1.5']) {
    assert.equal(G.codeToSeed(junk), null, String(junk));
  }
});

test('the listing count ticks up during the day without storing anything', () => {
  const day = Date.UTC(2026, 9, 28);
  assert.equal(G.listingCount(4000, 10, day), 4000);
  assert.equal(G.listingCount(4000, 10, day + 9_999), 4000);
  assert.equal(G.listingCount(4000, 10, day + 10_000), 4001);
  let last = 0;
  for (let s = 0; s < 86400; s += 997) {
    const n = G.listingCount(4000, 10, day + s * 1000);
    assert.ok(n >= last);
    last = n;
  }
});

test('the badge says the directory does not exist, inside the SVG', () => {
  const svg = G.badgeSvg('UpvoteHQ');
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.ok(svg.includes(`>${G.SMALL_PRINT}</text>`));
  assert.ok(svg.includes('FEATURED ON'));
  assert.ok(G.badgeSvg('<b>&"').includes('&lt;b&gt;&amp;&quot;'));
  assert.ok(G.badgeFontSize('SeedBin') > G.badgeFontSize('BacklinkPalooza'));
  // The longest name still fits in the space beside the medal.
  assert.ok(G.badgeFontSize('BacklinkPalooza') * 15 * 0.66 <= 250 - 54 - 10);
});

test('every name the generator can produce has a static badge, and nothing else does', () => {
  const all = new Set(G.allDirectoryNames());
  for (let i = 0; i < 40000; i++) {
    const name = G.directoryName(Math.imul(i, 2654435761) >>> 0);
    assert.ok(all.has(name), `${name} has no badge`);
  }
  const files = readdirSync(new URL('../badge/', import.meta.url)).sort();
  assert.deepEqual(files, [...all].map((n) => G.badgePath(n).slice(6)).sort(), 'run npm run badges');
  for (const name of all) {
    const svg = readFileSync(new URL('../' + G.badgePath(name), import.meta.url), 'utf8');
    assert.equal(svg, G.badgeSvg(name), `badge/${name.toLowerCase()}.svg is stale, run npm run badges`);
  }
});

test('snippets link to the permalink and hotlink the badge', () => {
  const dir = G.generate(G.codeToSeed('abc'), { niche: 'marketing', vibe: 'cozy', tiers: 3 });
  const { html, markdown } = G.badgeSnippets(dir);
  const link = `${G.SITE_URL}/#s=abc&amp;niche=marketing&amp;vibe=cozy&amp;tiers=3`;
  const img = `${G.SITE_URL}/badge/${dir.name.toLowerCase()}.svg`;
  assert.ok(html.includes(`href="${link}"`));
  assert.ok(html.includes(`src="${img}"`));
  assert.ok(html.includes(G.SMALL_PRINT));
  assert.equal(markdown, `[![Featured on ${dir.name}, ${G.SMALL_PRINT}](${img})](${G.SITE_URL}/#s=abc&niche=marketing&vibe=cozy&tiers=3)`);
});

test('the rendered directory carries its tells and captures nothing', () => {
  for (let i = 0; i < 50; i++) {
    const html = G.renderDirectory(G.generate(i, { niche: G.NICHE_IDS[i % 6], vibe: G.VIBE_IDS[i % 4], tiers: 2 + (i % 4) }));
    assert.ok(html.includes("This directory doesn't exist."));
    assert.ok(html.includes('$49') && html.includes('$199'));
    assert.ok(html.includes('38,000 founders'));
    assert.ok(html.includes('Nothing you enter here is saved or sent anywhere'));
    assert.doesNotMatch(html, /<form|action=|href="#/);
  }
});

test('the export is one file and says it does not exist in the title, banner, ribbon and footer', () => {
  const dir = G.generate(42, { niche: 'ai', vibe: 'brutalist', tiers: 5 });
  const html = G.exportHtml(dir, CSS);
  assert.match(html, /^<!doctype html>/);
  assert.ok(html.includes(`<title>${dir.name}, ${G.SMALL_PRINT}</title>`));
  assert.ok(html.includes("This directory doesn't exist."));
  assert.ok(html.includes("DOESN'T EXIST"));
  assert.ok(html.includes("A directory that doesn't exist."));
  assert.ok(html.includes('<meta name="robots" content="noindex">'));
  assert.ok(html.includes(G.permalink(dir)));
  assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+stylesheet|<form/);
  // The inlined runtime is valid script on its own.
  const script = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
  assert.doesNotThrow(() => new Function('document', 'setInterval', script));
});

test('the daily directory comes from the date, so reruns do nothing', () => {
  assert.deepEqual(G.dailyEntry('2026-10-28'), G.dailyEntry('2026-10-28'));
  assert.notEqual(G.dailySeed('2026-10-28'), G.dailySeed('2026-10-29'));
  const e = G.dailyEntry('2027-01-01');
  assert.equal(G.generate(G.codeToSeed(e.seed), e).name, e.name);
  assert.equal(G.ordinal(1), '1st');
  assert.equal(G.ordinal(12), '12th');
  assert.equal(G.ordinal(214), '214th');
  assert.equal(G.ordinal(223), '223rd');
});
