// Fails when a directory stored in data/generated.json no longer matches its
// seed. That happens when someone edits a FROZEN word list in gen.js, which
// renames directories whose badges are already pasted on real sites.
import { readFileSync } from 'node:fs';
import { dailyEntry, generate, codeToSeed, isBlockedDirectory, isBlockedTool } from '../gen.js';

const list = JSON.parse(readFileSync(new URL('../data/generated.json', import.meta.url), 'utf8'));
const problems = [];
if (!Array.isArray(list)) problems.push('data/generated.json should be an array');

const dates = new Set();
let previous = '';
for (const e of Array.isArray(list) ? list : []) {
  const where = `${e.date} (${e.name})`;
  if (dates.has(e.date)) problems.push(`${where}: date appears twice`);
  if (e.date <= previous) problems.push(`${where}: entries are out of date order`);
  dates.add(e.date);
  previous = e.date;

  const expected = dailyEntry(e.date);
  for (const key of Object.keys(expected)) {
    if (expected[key] !== e[key]) {
      problems.push(`${where}: stored ${key} is ${JSON.stringify(e[key])} but the seed now gives ${JSON.stringify(expected[key])}`);
    }
  }
  const seed = codeToSeed(e.seed);
  if (seed === null) { problems.push(`${where}: seed "${e.seed}" isn't a valid code`); continue; }
  const dir = generate(seed, e);
  if (dir.name !== e.name) problems.push(`${where}: generate() names it ${dir.name}`);
  if (isBlockedDirectory(e.name)) problems.push(`${where}: name is on the blocklist`);
  for (const t of dir.tools) {
    if (!t.name.endsWith('ly')) problems.push(`${where}: tool ${t.name} doesn't end in -ly`);
    if (isBlockedTool(t.name)) problems.push(`${where}: tool ${t.name} is on the blocklist`);
  }
}

if (problems.length) {
  console.error('data/generated.json no longer matches gen.js:\n  ' + problems.join('\n  '));
  console.error('\nThe word lists in gen.js are frozen. Put them back and append to the blocklist instead.');
  process.exit(1);
}
console.log(`check: ${list.length} stored ${list.length === 1 ? 'directory matches its seed' : 'directories match their seeds'}`);
