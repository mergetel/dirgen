// Adds today's directory to data/generated.json. The seed is a hash of the date,
// so running it twice on the same day changes nothing.
//
//   node scripts/daily.js            # today, UTC
//   DATE=2026-11-02 node scripts/daily.js
//
// In GitHub Actions it also writes step outputs and the PR body.
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { dailyEntry, ordinal, permalink, generate, codeToSeed, NICHES, VIBES } from '../gen.js';

const FILE = new URL('../data/generated.json', import.meta.url);
const date = process.env.DATE || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`DATE should look like 2026-10-28, got "${date}"`);

const list = JSON.parse(readFileSync(FILE, 'utf8'));
const existing = list.find((e) => e.date === date);
const entry = existing ?? dailyEntry(date);
if (!existing) {
  list.push(entry);
  list.sort((a, b) => a.date.localeCompare(b.date));
  writeFileSync(FILE, JSON.stringify(list, null, 2) + '\n');
}

const nth = list.filter((e) => e.date.slice(0, 4) === date.slice(0, 4) && e.date <= date).length;
const title = `Generated: ${entry.name} (the ${ordinal(nth)} this year)`;
const dir = generate(codeToSeed(entry.seed), entry);
const body = [
  `Today's directory is ${entry.name}. Its tagline is "${entry.tagline}".`,
  '',
  `It lists ${NICHES[entry.niche].noun} in the ${VIBES[entry.vibe].label} style, sells ${entry.tiers} paid tiers that nobody can buy, and doesn't exist. That makes it the ${ordinal(nth)} directory this year that doesn't exist.`,
  '',
  `Permalink: ${permalink(dir)}`,
  '',
  'The daily workflow opened this pull request and merges it on its own. The seed is a hash of the date, so a rerun changes nothing.',
].join('\n');

console.log(existing ? `${date} is already in the list: ${entry.name}` : `Added ${date}: ${entry.name}`);
console.log(title);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${!existing}\ndate=${date}\nname=${entry.name}\ntitle=${title}\n`);
}
if (process.env.RUNNER_TEMP) {
  writeFileSync(`${process.env.RUNNER_TEMP}/pr-body.md`, body + '\n');
}
