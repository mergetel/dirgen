# Directory Generator

Every indie hacker builds a SaaS directory eventually. This one builds it for you in one click: a made-up name, a tagline, twelve fake tools whose names end in -ly, a listing count that ticks up all day, a $49 Featured tier and a $199 Super Featured tier that nobody can buy, a newsletter box that forgets you, and a "Featured on" badge for your real site. None of it exists, and every page and image says so.

It's a static site on GitHub Pages. There's no build step, no server and no database.

## How it works

`gen.js` is the whole generator. The page, the badge script and the daily workflow all import it, so a seed means the same directory everywhere. It uses mulberry32 as the PRNG. Each directory is a permalink: the seed and the options live in the URL hash, like `/#s=2a9x&niche=dev&vibe=cozy&tiers=3`. The name depends on the seed alone, so changing the niche or vibe never renames a badge someone already pasted.

| File | What it does |
|---|---|
| `index.html`, `app.js`, `style.css` | The generator page |
| `site.css` | Styles for the generated directory, in the preview and in the export |
| `gen.js` | Names, tools, tiers, the badge SVG, the export, the daily pick |
| `badge/` | One static SVG per possible directory name, so badges can be hotlinked |
| `scripts/badges.js` | Rewrites `badge/` from `gen.js` |
| `data/generated.json` | One entry per day, written by the daily workflow |
| `scripts/daily.js` | Adds today's directory to `data/generated.json` |
| `scripts/check.js` | Fails if a stored directory no longer matches its seed |
| `scripts/serve.js` | Local static server |
| `.github/workflows/pages.yml` | Deploys to GitHub Pages |

Generated names are checked against a blocklist of real directories, after lowercasing, dropping spaces and punctuation, and stripping a TLD. "Product Hunt.com" and "producthunt" are the same name to it. A name that contains a real directory name of seven or more letters is blocked too. Tool names get the same check against a list of real products ending in -ly, like Calendly and Grammarly.

A name is always a word from one frozen list glued to a word from another, so there are only 773 possible names. `scripts/badges.js` writes every one of them to `badge/<name>.svg`, which is how a badge hotlinks from GitHub Pages without a server. The snippet points at `badge/<name>.svg` and links to the directory's permalink. The tests fail if a badge file is missing, stale, or left over for a name that can't be generated anymore.

The Export button downloads the whole directory as one HTML file. The red "doesn't exist" banner, a corner ribbon, the page title and the footer are all baked in, along with a comment that links back to the permalink. The badge SVG has "a directory that doesn't exist" drawn into it.

The newsletter box and the Buy buttons have no form and make no request. Pressing them only changes text on the page.

## Run it

You need Node 20 or newer. There are no dependencies to install.

```bash
npm run dev
```

That serves the site on http://localhost:8080.

```bash
npm test
```

That runs the unit tests and `scripts/check.js`.

## Never edit the word lists

Names are picked by index, so editing, reordering or even appending to a word list renames directories whose badges are already on people's sites. Every list marked `FROZEN` in `gen.js` stays exactly as it is. To stop a name from being generated, append it to `BLOCKED_DIRECTORIES` or `BLOCKED_TOOLS`. Appending to a blocklist only renames the directories that were landing on a real name. Run `npm run badges` afterwards so `badge/` drops the blocked names.

Two checks enforce this. `tests/gen.test.js` fingerprints the names for the first few thousand seeds, and `scripts/check.js` regenerates every directory stored in `data/generated.json` and compares it. If a blocklist addition changes the fingerprint, paste in the new number. If it renames a stored daily directory, that directory was a real name, so fix its entry by hand.

## Deploy

The site deploys to GitHub Pages from `.github/workflows/pages.yml` on every push to `main`. It runs the tests, copies the site files into an artifact and publishes it. Tests, scripts and workflows don't get published.

1. Settings, Pages, Build and deployment: set Source to "GitHub Actions".
2. Push to `main`, or run "Deploy to GitHub Pages" from the Actions tab.
3. Check that https://mergetel.github.io/dirgen/ loads and https://mergetel.github.io/dirgen/badge/nichehuntr.svg returns a badge.

## Set the domain

The site's address lives in one constant, `SITE_URL` at the top of `gen.js`. It's `https://mergetel.github.io/dirgen` until the real domain is bought. The snippets, the permalinks, the export and the "doesn't exist" banner all read it.

When the domain is ready:

1. Change `SITE_URL` to `https://<domain>` with no trailing slash.
2. Add the domain under Settings, Pages, Custom domain, and point DNS at GitHub Pages as that screen says. Turn on Enforce HTTPS once the certificate is issued.
3. Push. GitHub redirects the old `mergetel.github.io/dirgen` addresses to the custom domain, so badges pasted before the switch keep working.

## The daily directory

`.github/workflows/daily.yml` runs every day at 13:17 UTC. It seeds a directory from a hash of the date, appends it to `data/generated.json`, runs the tests, opens a pull request titled like "Generated: NicheHuntr (the 214th this year)", merges it, and then redeploys Pages. The home page shows the newest one under "Today's directory".

Running it twice on the same day changes nothing, because the date gives the same seed and the entry is already there. If yesterday's PR got stuck, a rerun force-pushes the same branch and reuses the open PR.

The repo needs two settings for this:

- Settings, Actions, General, Workflow permissions: turn on "Allow GitHub Actions to create and approve pull requests".
- Don't require status checks on `main`. A PR opened with `GITHUB_TOKEN` doesn't trigger other workflows, so a required check would never report. The daily workflow runs `npm test` itself before it pushes.

The same rule means the bot's merge doesn't fire the Pages workflow's push trigger, so the daily workflow calls `pages.yml` itself once the merge is done.

Auto-merge is optional. The workflow tries `gh pr merge --auto` first and falls back to merging straight away.

You can also run it by hand from the Actions tab with "Run workflow".
