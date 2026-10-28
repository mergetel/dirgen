# Directory Generator

Every indie hacker builds a SaaS directory eventually. This one builds it for you in one click: a made-up name, a tagline, twelve fake tools whose names end in -ly, a listing count that ticks up all day, a $49 Featured tier and a $199 Super Featured tier that nobody can buy, a newsletter box that forgets you, and a "Featured on" badge for your real site. None of it exists, and every page and image says so.

It's a static site with no build step and no database. The only server code is a small Netlify edge function that draws the badge.

## How it works

`gen.js` is the whole generator. The page, the badge edge function and the daily workflow all import it, so a seed means the same directory everywhere. It uses mulberry32 as the PRNG. Each directory is a permalink: the seed and the options live in the URL hash, like `/#s=2a9x&niche=dev&vibe=cozy&tiers=3`. The name depends on the seed alone, so changing the niche or vibe never renames a badge someone already pasted.

| File | What it does |
|---|---|
| `index.html`, `app.js`, `style.css` | The generator page |
| `site.css` | Styles for the generated directory, in the preview and in the export |
| `gen.js` | Names, tools, tiers, the badge SVG, the export, the daily pick |
| `netlify/edge-functions/badge.js` | Serves `/badge/<seed>.svg` so badges can be hotlinked |
| `data/generated.json` | One entry per day, written by the daily workflow |
| `scripts/daily.js` | Adds today's directory to `data/generated.json` |
| `scripts/check.js` | Fails if a stored directory no longer matches its seed |
| `scripts/serve.js` | Local server, with the badge route wired to the real edge function |

Generated names are checked against a blocklist of real directories, after lowercasing, dropping spaces and punctuation, and stripping a TLD. "Product Hunt.com" and "producthunt" are the same name to it. A name that contains a real directory name of seven or more letters is blocked too. Tool names get the same check against a list of real products ending in -ly, like Calendly and Grammarly.

The Export button downloads the whole directory as one HTML file. The red "doesn't exist" banner, a corner ribbon, the page title and the footer are all baked in, along with a comment that links back to the permalink. The badge SVG has "a directory that doesn't exist" drawn into it.

The newsletter box and the Buy buttons have no form and make no request. Pressing them only changes text on the page.

## Run it

You need Node 20 or newer. There are no dependencies to install.

```bash
npm run dev
```

That serves the site on http://localhost:8080, including `/badge/<seed>.svg`.

```bash
npm test
```

That runs the unit tests and `scripts/check.js`.

## Never edit the word lists

Names are picked by index, so editing, reordering or even appending to a word list renames directories whose badges are already on people's sites. Every list marked `FROZEN` in `gen.js` stays exactly as it is. To stop a name from being generated, append it to `BLOCKED_DIRECTORIES` or `BLOCKED_TOOLS`. Appending to a blocklist only renames the directories that were landing on a real name.

Two checks enforce this. `tests/gen.test.js` fingerprints the names for the first few thousand seeds, and `scripts/check.js` regenerates every directory stored in `data/generated.json` and compares it. If a blocklist addition changes the fingerprint, paste in the new number. If it renames a stored daily directory, that directory was a real name, so fix its entry by hand.

## Deploy

1. Create a Netlify site from this repo. Leave the build command empty and set the publish directory to `.`. `netlify.toml` already says this.
2. Netlify picks up the edge function from `netlify/edge-functions/` with no extra config.
3. Check `https://<your-site>/badge/2a9x.svg` returns an SVG.

## Set the domain

The domain lives in one constant, `SITE_URL` at the top of `gen.js`. The snippets, the permalinks, the export and the banner all read it. When the real domain is bought, change that line, add the domain in Netlify, and redeploy. Badges already pasted with the old host keep working as long as the old host still points at the site.

## The daily directory

`.github/workflows/daily.yml` runs every day at 13:17 UTC. It seeds a directory from a hash of the date, appends it to `data/generated.json`, runs the tests, opens a pull request titled like "Generated: NicheHuntr (the 214th this year)" and merges it. The home page shows the newest one under "Today's directory".

Running it twice on the same day changes nothing, because the date gives the same seed and the entry is already there. If yesterday's PR got stuck, a rerun force-pushes the same branch and reuses the open PR.

The repo needs two settings for this:

- Settings, Actions, General, Workflow permissions: turn on "Allow GitHub Actions to create and approve pull requests".
- Don't require status checks on `main`. A PR opened with `GITHUB_TOKEN` doesn't trigger other workflows, so a required check would never report. The daily workflow runs `npm test` itself before it pushes.

Auto-merge is optional. The workflow tries `gh pr merge --auto` first and falls back to merging straight away.

You can also run it by hand from the Actions tab with "Run workflow".
