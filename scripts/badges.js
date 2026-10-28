// Writes badge/<name>.svg for every name the generator can produce, so badges
// hotlink from GitHub Pages with no server. Run it after appending to the
// blocklist (it deletes badges for names that are now blocked).
//   node scripts/badges.js
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { allDirectoryNames, badgePath, badgeSvg } from '../gen.js';

const root = new URL('../', import.meta.url);
mkdirSync(new URL('badge/', root), { recursive: true });
const names = allDirectoryNames();
const keep = new Set(names.map((n) => badgePath(n).slice('badge/'.length)));
let removed = 0;
for (const file of readdirSync(new URL('badge/', root))) {
  if (!keep.has(file)) { rmSync(new URL(`badge/${file}`, root)); removed++; }
}
for (const name of names) writeFileSync(new URL(badgePath(name), root), badgeSvg(name));
console.log(`badges: wrote ${names.length}, removed ${removed}`);
