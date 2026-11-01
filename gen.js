// The Directory Generator. One seed in, one SaaS directory that doesn't exist out.
//
// The page, the badge build script and the daily workflow all import this file,
// so a seed means the same directory everywhere.
//
// FROZEN: every list marked FROZEN is read by index. Editing, reordering or
// appending to one renames directories that people have already pasted badges
// for. To stop a name from being generated, append it to BLOCKED_DIRECTORIES
// or BLOCKED_TOOLS instead. `npm test` fails if a frozen list changes.

// John is still buying domains. Change this one line when he does, with no
// trailing slash. GitHub Pages serves the repo under /dirgen until then.
export const SITE_URL = 'https://mergetel.github.io/dirgen';
export const SITE_LABEL = SITE_URL.replace(/^https?:\/\//, '');

export const SMALL_PRINT = "a directory that doesn't exist";

// ---------------------------------------------------------------- randomness

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// FNV-1a, 32 bit. Used to turn a date into a seed.
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export const seedToCode = (seed) => (seed >>> 0).toString(36);

export function codeToSeed(code) {
  if (typeof code !== 'string' || !/^[0-9a-z]{1,7}$/.test(code)) return null;
  const n = parseInt(code, 36);
  return n <= 0xffffffff ? n >>> 0 : null;
}

export const randomSeed = () => Math.floor(Math.random() * 4294967296) >>> 0;

const pick = (list, rnd) => list[Math.floor(rnd() * list.length)];

function shuffled(list, rnd) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------- blocklists

// Real directories and launch sites. A generated name never normalizes to one
// of these, and never contains one that is 7 or more letters long.
// Append freely. Appending only renames a directory that was landing on a real one.
export const BLOCKED_DIRECTORIES = [
  'Product Hunt', 'BetaList', 'SaaSHub', 'AlternativeTo', 'Futurepedia',
  "There's An AI For That", 'Toolify', 'Uneed', 'Microlaunch', 'Peerlist', 'DevHunt',
  'AppSumo', 'Indie Hackers', 'Hacker News', 'G2', 'Capterra', 'GetApp', 'StackShare',
  'Launching Next', 'BetaPage', 'StartupBase', 'SideProjectors', 'Fazier', 'TinyLaunch',
  'Tiny Startups', 'OpenAlternative', 'SaaSworthy', 'Startup Stash', 'Crunchbase',
  'TrustRadius', 'Software Advice', 'Slant', 'Toolfolio', 'Toolpilot', 'AI Tool Hunt',
  'TopAI.tools', 'Insidr', 'Future Tools', 'Hunted.space', 'Startups.fyi', 'Launched',
  'Listly', 'Rankly', 'Boostly', 'Launchly', 'Promoly', 'Pitchly', 'ToolHunt',
  'Launchpedia', 'SaaS Pirate', 'Indie Deals', 'Dang.ai', 'AIcyclopedia', 'Toolscout',
  'Listverse', 'Listopia', 'Badgeville', 'LaunchHQ', 'Promoster', 'Makerpad', 'Launchpad',
  'Shipyard', 'StackSpot', 'SeedSpot',
];

// Real products whose names end in -ly. A generated tool never lands on one.
export const BLOCKED_TOOLS = [
  'Calendly', 'Grammarly', 'Bitly', 'Feedly', 'Invoicely', 'Shiply', 'Rebrandly', 'Weebly',
  'Optimizely', 'Contently', 'Visually', 'Storyly', 'Tally', 'Swiftly', 'Directly', 'Hourly',
  'Zenly', 'Buildly', 'Taskly', 'Promptly', 'Deckly', 'Leadly', 'Pitchly', 'Churnly', 'Botly',
  'Flowly', 'Formly', 'Boardly', 'Habitly', 'Notely', 'Focusly', 'Mately', 'Gumly',
  'Sparkly', 'Pally', 'Wavely', 'Brandly', 'Hooksly', 'Leadsly', 'Zapply', 'Chatly',
];

export function normalizeName(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/\.[a-z]{2,12}$/, '') // a trailing TLD: "Toolify.ai" is Toolify
    .replace(/[^a-z0-9]/g, '');
}

const BLOCKED_DIR_SET = new Set(BLOCKED_DIRECTORIES.map(normalizeName));
const BLOCKED_DIR_LONG = [...BLOCKED_DIR_SET].filter((n) => n.length >= 7);
const BLOCKED_TOOL_SET = new Set(BLOCKED_TOOLS.map(normalizeName));

export function isBlockedDirectory(name) {
  const n = normalizeName(name);
  return BLOCKED_DIR_SET.has(n) || BLOCKED_DIR_LONG.some((b) => n.includes(b));
}

export function isBlockedTool(name) {
  return BLOCKED_TOOL_SET.has(normalizeName(name)) || isBlockedDirectory(name);
}

// ---------------------------------------------------------------- names

// FROZEN
const DIR_PREFIX = [
  'Launch', 'Tool', 'Submit', 'Stack', 'Ship', 'Maker', 'Indie', 'Saas', 'Hype', 'Boot',
  'Side', 'Vibe', 'Founder', 'Prompt', 'Upvote', 'Hustle', 'Growth', 'Seed', 'Pivot',
  'Niche', 'Promo', 'Backlink', 'Waitlist', 'Unicorn',
];
// FROZEN
const DIR_SUFFIX = [
  'Pile', 'Heap', 'Stash', 'Drop', 'Pit', 'Shelf', 'Bin', 'Dump', 'Hoard', 'Crate', 'Rack',
  'Vault', 'Pad', 'Spot', 'Nest', 'Yard', 'Den', 'Barn', 'Bucket', 'Jar',
];
// FROZEN
const DIR_AGENT = ['Huntr', 'Listr', 'Rankr', 'Findr', 'Postr', 'Spottr', 'Droppr', 'Scoutr'];
// FROZEN
const DIR_VERB = [
  'Submit', 'Upvote', 'Launch', 'Feature', 'List', 'Rank', 'Badge', 'Promo', 'Backlink',
  'Hype', 'Boost', 'Pitch',
];
// FROZEN
const DIR_TAIL = ['ly', 'opia', 'verse', 'palooza', 'orama', 'HQ', 'ster', 'ville', 'zilla', 'ium'];

// FROZEN
export const TAGLINES = [
  'The #1 place to find the #1 tools',
  'Where tools go to be listed',
  'Every tool, ranked by how much it paid',
  'Hand-picked by an algorithm we wrote yesterday',
  'Discover tools before they discover pricing',
  'The only directory you need until the next one',
  'Find tools. Submit tools. Mostly submit tools.',
  'Backlinks for the people',
  'Launch here, then launch everywhere else',
  'Curated by vibes, sorted by checkout',
  'Your tool deserves to be listed somewhere',
  'Tomorrow\'s unicorns, today\'s $49',
  'Built in a weekend. Listing since Sunday.',
  'Trusted by founders who submitted their own tool',
];

// The name has its own PRNG stream, so a blocklist retry never changes the
// rest of the directory.
export function directoryName(seed) {
  const rnd = mulberry32((seed ^ 0x5bd1e995) >>> 0);
  for (let i = 0; i < 64; i++) {
    const roll = rnd();
    let name;
    if (roll < 0.45) name = pick(DIR_PREFIX, rnd) + pick(DIR_SUFFIX, rnd);
    else if (roll < 0.7) name = pick(DIR_PREFIX, rnd) + pick(DIR_AGENT, rnd);
    else name = pick(DIR_VERB, rnd) + pick(DIR_TAIL, rnd);
    if (!isBlockedDirectory(name)) return name;
  }
  return 'Directoryopia';
}

// Every name directoryName() can return. There are only a few hundred, which
// is why the badges can be static files on GitHub Pages.
export function allDirectoryNames() {
  const names = new Set(['Directoryopia']);
  for (const p of DIR_PREFIX) {
    for (const s of DIR_SUFFIX.concat(DIR_AGENT)) names.add(p + s);
  }
  for (const v of DIR_VERB) {
    for (const t of DIR_TAIL) names.add(v + t);
  }
  return [...names].filter((n) => !isBlockedDirectory(n)).sort();
}

export function directoryTagline(seed) {
  return pick(TAGLINES, mulberry32((seed ^ 0x2c1b3c6d) >>> 0));
}

// ---------------------------------------------------------------- niches

// FROZEN (the order of keys and every list inside them)
export const NICHES = {
  ai: {
    label: 'AI tools',
    noun: 'AI tools',
    categories: ['Agents', 'Chatbots', 'Copywriting', 'Image', 'Wrappers', 'Vibes'],
    stems: ['Prompt', 'Agent', 'Neural', 'Vector', 'Token', 'Wrapper', 'Embed', 'Infer', 'Model', 'Auto', 'Synth', 'Cortex', 'Brain'],
    pitches: [
      'AI that writes the prompts for your other AI',
      'An agent that books meetings with other agents',
      'Turns one sentence into a 40 slide deck',
      'Hallucinations, but on brand',
      'The model, but with a waitlist',
      'Fine-tuned on vibes',
      'Autonomous agents for tasks that take a minute',
      'Chat with your PDF. It has opinions.',
      'An AI co-founder. Takes 50% equity.',
      'Replaces your whole team, including you',
      'Rates every other AI tool 10/10',
      'Embeddings for your feelings',
    ],
  },
  nocode: {
    label: 'No-code',
    noun: 'no-code tools',
    categories: ['Builders', 'Forms', 'Automation', 'Databases', 'Templates', 'Glue'],
    stems: ['Drag', 'Click', 'Block', 'Form', 'Table', 'Glue', 'Widget', 'Canvas', 'Button', 'Template', 'Builder', 'Snap', 'Plug'],
    pitches: [
      'Build a SaaS without code, customers or a plan',
      'Drag and drop your way to a revenue screenshot',
      'A spreadsheet that thinks it is an app',
      'Ship an MVP in 5 minutes, debug it for 5 months',
      'No code. No backend. No refunds.',
      'Connects 4,000 apps to each other and watches',
      'Templates for your templates',
      'Turns a bookmarks folder into a startup',
      'Forms that ask how you heard about us, twice',
      'Like coding, but slower and with more clicks',
    ],
  },
  dev: {
    label: 'Dev tools',
    noun: 'developer tools',
    categories: ['CI/CD', 'Monitoring', 'APIs', 'Databases', 'Testing', 'YAML'],
    stems: ['Cron', 'Commit', 'Deploy', 'Merge', 'Lint', 'Bug', 'Patch', 'Fork', 'Shell', 'Query', 'Cache', 'Ping', 'Log'],
    pitches: [
      'Container orchestration for your todo list',
      'Deploy on Friday with confidence (not included)',
      'A linter that reviews your commit messages emotionally',
      'Monitoring for your monitoring',
      'The YAML is the product',
      'Rewrites your app in a new language every weekend',
      'Cron jobs as a service, as a service',
      'Blazingly fast. Measured once.',
      'Merge conflicts, resolved by vibes',
      'An API for calling other APIs',
    ],
  },
  marketing: {
    label: 'Marketing',
    noun: 'marketing tools',
    categories: ['Social', 'SEO', 'Cold email', 'Funnels', 'Analytics', 'Hype'],
    stems: ['Funnel', 'Lead', 'Hype', 'Growth', 'Viral', 'Thread', 'Hook', 'Upsell', 'Brand', 'Pitch', 'Inbox', 'Meme', 'Buzz'],
    pitches: [
      'Turns one post into a 30 part thread',
      'Cold emails, but somehow colder',
      'Testimonials from customers you will have',
      'A/B tests your A/B tests',
      'Growth hacks, hacked',
      'Posts to 14 networks nobody reads',
      'A waitlist with a fake counter (like this page)',
      'SEO for keywords nobody searches',
      'Engagement bait, ethically sourced',
      'Your funnel, but wider',
    ],
  },
  productivity: {
    label: 'Productivity',
    noun: 'productivity apps',
    categories: ['Todo', 'Calendar', 'Focus', 'Notes', 'Habits', 'Meetings'],
    stems: ['Focus', 'Task', 'Habit', 'Calendar', 'Todo', 'Sprint', 'Deep', 'Note', 'Ritual', 'Grind', 'Streak', 'Zen', 'Meeting'],
    pitches: [
      'A todo app for your other todo apps',
      'Time blocking for the time you spend time blocking',
      'A focus mode that emails you about focus',
      'Turns meetings into shorter meetings about meetings',
      'A habit tracker that tracks your habit tracker',
      'Inbox zero by deleting your inbox',
      'A pomodoro timer, but the tomato judges you',
      'Second brain. First one sold separately.',
      'Gamifies your calendar into a loss',
      'Deep work, shallow pricing',
    ],
  },
  wrappers: {
    label: 'AI wrappers',
    noun: 'AI wrappers',
    categories: ['Writing', 'Email', 'Social', 'Resumes', 'Chat', 'Same model'],
    stems: ['Chat', 'Wrap', 'Reply', 'Summar', 'Rewrite', 'Caption', 'Essay', 'Tweet', 'Resume', 'Email', 'Answer', 'Bio', 'Ghost'],
    pitches: [
      "A text box that sends your text to someone else's API",
      'A chatbot with a purple gradient',
      'Rewrites your email so it sounds like you meant it',
      'One prompt, a landing page and a checkout link',
      "Writes your bio in a voice you'll regret",
      'Summarizes articles you were never going to read',
      'Captions for photos of your coffee',
      'Turns your resume into a different resume',
      'The same model as everyone else, with a logo',
      'Answers questions. Sometimes yours.',
    ],
  },
};
export const NICHE_IDS = Object.keys(NICHES);

// FROZEN
const TOOL_TAIL = [
  'Pilot', 'Stack', 'Forge', 'Bot', 'Flow', 'Grid', 'Base', 'Dash', 'Loop', 'Craft', 'Kit', 'Nest',
  'Board', 'Sync', 'Spark', 'Pal', 'Mate', 'GPT', 'Mind', 'Wave', 'Pulse', 'Deck', 'Box', 'Lab',
];
// FROZEN
const GENERIC_PITCHES = [
  'Like the other tool, but with dark mode',
  'Built in a weekend. Priced like a decade.',
  'Now with AI (a button was added)',
  'Lifetime deal, lifetime of regret',
  'Featured in this directory',
  'Trusted by 3 teams and one guy',
  'Free forever* (*for 7 days)',
  'The last tool you will ever need, this week',
];
// FROZEN
const TOOL_PRICES = [
  'Free forever*', 'Freemium', '$9/mo', '$29/mo', '$99/mo', 'Lifetime deal', 'Waitlist only',
  'Contact sales', 'Free trial, card required', 'Pay what they want',
];
// FROZEN
const TOOL_TAGS = ['New', 'Trending', "Editor's pick*", 'Hot', 'Verified*', 'Rising', '', ''];

// ---------------------------------------------------------------- vibes and tiers

// FROZEN
export const VIBES = {
  hustle: { label: 'Growth thread', kicker: '🚀 10x your discovery' },
  minimal: { label: 'Clean SaaS', kicker: 'Discover. Curated. Minimal.' },
  brutalist: { label: 'Brutalist', kicker: 'TOOLS. LISTED. NOW.' },
  cozy: { label: 'Cozy indie', kicker: 'a little corner of the internet for tools ☕' },
};
export const VIBE_IDS = Object.keys(VIBES);

// The first two always exist. The tiers option says how many paid ones show.
export const PLANS = [
  {
    id: 'featured', name: 'Featured', price: 49, per: 'one time',
    perks: ['A "Featured" badge on your listing', 'Homepage spot for 24 hours, or until someone pays more', 'A dofollow link, probably'],
  },
  {
    id: 'super', name: 'Super Featured', price: 199, per: 'one time',
    perks: ['Everything in Featured, but super', 'Pinned above Featured for 7 days', 'One post about you, to 11 followers'],
  },
  {
    id: 'mega', name: 'Mega Featured', price: 499, per: 'per week',
    perks: ['Your logo in the newsletter (see below)', 'A thread about you, written by a guy', 'Pinned above Super Featured'],
  },
  {
    id: 'hyper', name: 'Hyper Featured', price: 1999, per: 'per month',
    perks: ['Homepage, forever (30 days)', 'A gold border, real gold color', 'Pinned above Mega Featured'],
  },
  {
    id: 'sentient', name: 'Sentient Featured', price: 9999, per: 'per hour',
    perks: ['Your listing becomes self-aware', 'Pinned above the cookie banner', 'Refund policy: lol'],
  },
];
export const MIN_TIERS = 2;
export const MAX_TIERS = PLANS.length;

export const DEFAULTS = { niche: 'ai', vibe: 'hustle', tiers: 2 };

export function cleanOptions(o = {}) {
  const tiers = Number(o.tiers);
  return {
    niche: NICHE_IDS.includes(o.niche) ? o.niche : DEFAULTS.niche,
    vibe: VIBE_IDS.includes(o.vibe) ? o.vibe : DEFAULTS.vibe,
    tiers: Number.isInteger(tiers) && tiers >= MIN_TIERS && tiers <= MAX_TIERS ? tiers : DEFAULTS.tiers,
  };
}

// ---------------------------------------------------------------- the directory

export const TOOL_COUNT = 12;

export function generate(seed, options) {
  seed >>>= 0;
  const opts = cleanOptions(options);
  const niche = NICHES[opts.niche];
  const rnd = mulberry32((seed ^ hashString(opts.niche)) >>> 0);
  const name = directoryName(seed);
  const plans = PLANS.slice(0, opts.tiers);

  const pitches = shuffled(niche.pitches.concat(GENERIC_PITCHES), rnd);
  const seen = new Set();
  const tools = [];
  for (let tries = 0; tools.length < TOOL_COUNT && tries < 500; tries++) {
    const toolName = pick(niche.stems, rnd) + pick(TOOL_TAIL, rnd) + 'ly';
    if (seen.has(toolName) || isBlockedTool(toolName)) continue;
    seen.add(toolName);
    tools.push({
      name: toolName,
      pitch: pitches[tools.length % pitches.length],
      category: pick(niche.categories, rnd),
      price: pick(TOOL_PRICES, rnd),
      tag: pick(TOOL_TAGS, rnd),
      upvotes: Math.round(3 + 4800 * Math.pow(rnd(), 3)),
      hue: Math.floor(rnd() * 360),
      paid: null,
    });
  }
  tools.sort((a, b) => b.upvotes - a.upvotes);
  // The paying customers go on top, whatever their upvotes say. Their upvotes
  // are tiny, because of course they are.
  const sponsored = [...plans].reverse().slice(0, 3);
  sponsored.forEach((plan, i) => {
    const t = tools[tools.length - 1 - i];
    t.paid = plan.name;
    t.upvotes = 1 + Math.floor(rnd() * 9);
  });
  const rank = (t) => (t.paid ? PLANS.findIndex((p) => p.name === t.paid) + 1 : 0);
  tools.sort((a, b) => rank(b) - rank(a) || b.upvotes - a.upvotes);

  return {
    seed,
    code: seedToCode(seed),
    ...opts,
    name,
    tagline: directoryTagline(seed),
    kicker: VIBES[opts.vibe].kicker,
    nicheLabel: niche.label,
    noun: niche.noun,
    categories: niche.categories,
    countBase: 1800 + Math.floor(rnd() * 2800),
    countRate: 9 + Math.floor(rnd() * 23),
    queue: 900 + Math.floor(rnd() * 8000),
    plans,
    tools,
  };
}

// The listing count is a pure function of the clock. Nothing is stored, and it
// resets at midnight UTC like everybody's motivation. The export inlines this
// function's source, so it can't reach anything outside itself.
export function listingCount(base, rate, nowMs) {
  const sinceMidnight = Math.floor((nowMs % 86400000) / 1000);
  return base + Math.floor(sinceMidnight / rate);
}

export function permalink(dir) {
  const p = new URLSearchParams({ s: dir.code, niche: dir.niche, vibe: dir.vibe, tiers: String(dir.tiers) });
  return `${SITE_URL}/#${p.toString()}`;
}

export const badgePath = (name) => `badge/${name.toLowerCase()}.svg`;
export const badgeUrl = (dir) => `${SITE_URL}/${badgePath(dir.name)}`;

export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ---------------------------------------------------------------- HTML

// Every attribute in this file is double quoted, so apostrophes can stay as they are.
export function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

const fmt = (n) => n.toLocaleString('en-US');

// The whole generated site as an HTML fragment. The page drops it into the
// preview and the export wraps it in a document, so both carry the same tells.
export function renderDirectory(dir, nowMs = Date.now()) {
  const count = listingCount(dir.countBase, dir.countRate, nowMs);
  const initials = (n) => esc(n.replace(/[a-z]/g, '').slice(0, 2) || n.slice(0, 2));
  const topFree = dir.tools.findIndex((t) => !t.paid);

  const tools = dir.tools.map((t, i) => `
      <li class="dg-tool${t.paid ? ' dg-paid' : ''}">
        <div class="dg-tool-top">
          <span class="dg-logo" style="--h:${t.hue}" aria-hidden="true">${initials(t.name)}</span>
          <div class="dg-tool-head">
            <h3>${esc(t.name)}</h3>
            <span class="dg-cat">${esc(t.category)}</span>
          </div>
          <span class="dg-votes" title="Upvotes">▲ ${fmt(t.upvotes)}</span>
        </div>
        <p>${esc(t.pitch)}</p>
        <div class="dg-tool-foot">
          <span class="dg-price">${esc(t.price)}</span>
          ${t.paid ? `<span class="dg-tag dg-tag-paid">${esc(t.paid)}</span>` : i === topFree ? '<span class="dg-tag">#1 tool of the hour</span>' : t.tag ? `<span class="dg-tag">${esc(t.tag)}</span>` : ''}
        </div>
      </li>`).join('');

  const plans = dir.plans.map((p, i) => `
      <li class="dg-plan${i === 1 ? ' dg-plan-pop' : ''}">
        ${i === 1 ? '<span class="dg-pop">Most popular (with us)</span>' : ''}
        <h3>${esc(p.name)}</h3>
        <p class="dg-amount">$${fmt(p.price)} <small>${esc(p.per)}</small></p>
        <ul>${p.perks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
        <button type="button" class="dg-btn" data-buy="${esc(p.name)}" data-price="${p.price}">Buy ${esc(p.name)}</button>
      </li>`).join('');

  return `<div class="dg-site" data-vibe="${esc(dir.vibe)}" data-name="${esc(dir.name)}" data-queue="${dir.queue}">
  <div class="dg-tell" role="note"><strong>This directory doesn't exist.</strong> It was generated in one click at <a href="${esc(SITE_URL)}">${esc(SITE_LABEL)}</a>. Nothing here is for sale.</div>
  <header class="dg-nav">
    <span class="dg-brand">${esc(dir.name)}</span>
    <nav aria-label="${esc(dir.name)}"><span>Browse</span><span>Categories</span><span>Newsletter</span></nav>
    <button type="button" class="dg-btn dg-btn-small" data-scroll="dg-pricing">Submit your tool</button>
  </header>
  <section class="dg-hero">
    <p class="dg-kicker">${esc(dir.kicker)}</p>
    <h2>${esc(dir.tagline)}</h2>
    <p class="dg-sub">Discover <b data-count data-base="${dir.countBase}" data-rate="${dir.countRate}">${fmt(count)}</b> ${esc(dir.noun)}, hand-picked by nobody. A new one every ${dir.countRate} seconds, allegedly.</p>
    <div class="dg-search" aria-hidden="true"><span>Search ${esc(dir.noun)} that don't exist...</span><kbd>⌘K</kbd></div>
    <ul class="dg-chips">${['All'].concat(dir.categories).map((c, i) => `<li${i === 0 ? ' class="dg-on"' : ''}>${esc(c)}</li>`).join('')}</ul>
  </section>
  <section class="dg-grid-wrap" aria-label="Listings">
    <h2 class="dg-h">Trending ${esc(dir.noun)} <small>sorted by who paid</small></h2>
    <ul class="dg-grid">${tools}
    </ul>
  </section>
  <section class="dg-pricing" id="dg-pricing" aria-label="Pricing">
    <h2 class="dg-h">Get your tool in front of <span class="dg-hl">38,000 founders*</span></h2>
    <ul class="dg-plans">
      <li class="dg-plan dg-plan-free">
        <h3>Standard</h3>
        <p class="dg-amount">$0 <small>forever</small></p>
        <ul><li>Reviewed in 6 to 9 business months</li><li>Listed between page 40 and page 41</li><li>A nofollow link, definitely</li></ul>
        <button type="button" class="dg-btn dg-btn-ghost" data-buy="free" data-price="0">Join the queue</button>
      </li>${plans}
    </ul>
    <p class="dg-checkout" data-checkout role="status" hidden></p>
  </section>
  <section class="dg-news" aria-label="Newsletter">
    <div>
      <h2 class="dg-h">The ${esc(dir.name)} Weekly</h2>
      <p>Read by 38,000 founders*. The best new ${esc(dir.noun)}, every Tuesday, forever.</p>
    </div>
    <div class="dg-news-form">
      <input type="email" placeholder="you@startup.ai" autocomplete="off" aria-label="Email (not saved)" data-news-input>
      <button type="button" class="dg-btn" data-news>Subscribe</button>
    </div>
    <p class="dg-fine" data-news-msg role="status">*38,000 is a number somebody typed. Nothing you enter here is saved or sent anywhere.</p>
  </section>
  <footer class="dg-foot">
    <span>© ${esc(dir.name)}. ${esc(SMALL_PRINT[0].toUpperCase() + SMALL_PRINT.slice(1))}.</span>
    <span>No tools were reviewed. The count resets at midnight UTC. Made at <a href="${esc(permalink(dir))}">${esc(SITE_LABEL)}</a>.</span>
  </footer>
</div>`;
}

// Makes the buttons, the newsletter box and the count do their jokes. The export
// inlines this function's source, so it can't reach anything outside itself
// except the listingCount it is handed.
export function wireDirectory(root, countFn) {
  const site = root.querySelector('.dg-site');
  if (!site) return () => {};
  const name = site.getAttribute('data-name');
  const queue = Number(site.getAttribute('data-queue'));
  const out = site.querySelector('[data-checkout]');
  const fmtN = (n) => n.toLocaleString('en-US');

  const onClick = (e) => {
    const el = e.target.closest('button');
    if (!el || !site.contains(el)) return;
    if (el.hasAttribute('data-scroll')) {
      const target = site.querySelector('#' + el.getAttribute('data-scroll'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (el.hasAttribute('data-buy')) {
      const plan = el.getAttribute('data-buy');
      const price = Number(el.getAttribute('data-price'));
      out.textContent = plan === 'free'
        ? `You're #${fmtN(queue)} in line. Estimated review: 6 to 9 business months. Or skip the line for $49, which you also can't do, because ${name} doesn't exist.`
        : `Checkout was never open. ${name} doesn't exist, so there's no ${plan} to buy and nowhere to type a card number. Your $${fmtN(price)} is safe.`;
      out.hidden = false;
    } else if (el.hasAttribute('data-news')) {
      const input = site.querySelector('[data-news-input]');
      if (input) input.value = '';
      const msg = site.querySelector('[data-news-msg]');
      if (msg) msg.textContent = "You're in! You aren't. Nothing was saved, nothing will be sent, and there is no list.";
    }
  };
  site.addEventListener('click', onClick);

  const counter = site.querySelector('[data-count]');
  const base = Number(counter.getAttribute('data-base'));
  const rate = Number(counter.getAttribute('data-rate'));
  const tick = () => { counter.textContent = fmtN(countFn(base, rate, Date.now())); };
  tick();
  const timer = setInterval(tick, 1000);
  return () => { clearInterval(timer); site.removeEventListener('click', onClick); };
}

export function exportHtml(dir, css, nowMs = Date.now()) {
  const title = `${dir.name}, ${SMALL_PRINT}`;
  return `<!doctype html>
<!--
  ${dir.name} doesn't exist. It's a fake SaaS directory made by the Directory Generator.
  Rebuild it: ${permalink(dir)}
-->
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<meta name="description" content="${esc(dir.name)} is a SaaS directory that doesn't exist. Generated at ${esc(SITE_LABEL)}.">
<style>
body { margin: 0; }
.dg-export-ribbon { position: fixed; z-index: 10; right: -52px; bottom: 34px; transform: rotate(-45deg); padding: 6px 60px; background: #e11d48; color: #fff; font: 800 13px/1.2 ui-sans-serif, system-ui, sans-serif; letter-spacing: .08em; pointer-events: none; }
${css}
</style>
</head>
<body>
${renderDirectory(dir, nowMs)}
<div class="dg-export-ribbon" aria-hidden="true">DOESN'T EXIST</div>
<script>
${listingCount.toString()}
(${wireDirectory.toString()})(document, listingCount);
</script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- badge

export const BADGE_W = 250;
export const BADGE_H = 54;

// No text measuring on the server, so the name's size comes from its length.
// 0.66em is a generous average width for a heavy sans with capitals.
export function badgeFontSize(name) {
  return Math.max(10, Math.min(19, Math.floor(180 / (name.length * 0.66))));
}

export function badgeSvg(name) {
  const size = badgeFontSize(name);
  const label = `Featured on ${name}, ${SMALL_PRINT}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${BADGE_W}" height="${BADGE_H}" viewBox="0 0 ${BADGE_W} ${BADGE_H}" role="img" aria-label="${esc(label)}">
  <title>${esc(label)}</title>
  <rect x="0.5" y="0.5" width="${BADGE_W - 1}" height="${BADGE_H - 1}" rx="9" fill="#14121f" stroke="#5b4fe0"/>
  <circle cx="27" cy="27" r="17" fill="#5b4fe0"/>
  <circle cx="27" cy="27" r="13" fill="none" stroke="#c7c2ff" stroke-width="1.5" stroke-dasharray="2 2"/>
  <path d="M27 17.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9z" fill="#fde047"/>
  <g font-family="ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'DejaVu Sans', Arial, sans-serif">
    <text x="54" y="16" font-size="9" font-weight="700" letter-spacing="1.2" fill="#a8a2e8">FEATURED ON</text>
    <text x="54" y="35" font-size="${size}" font-weight="800" fill="#ffffff">${esc(name)}</text>
    <text x="54" y="47.5" font-size="8.5" font-style="italic" fill="#fca5a5">${esc(SMALL_PRINT)}</text>
  </g>
</svg>
`;
}

export function badgeSnippets(dir) {
  const link = permalink(dir);
  const img = badgeUrl(dir);
  const alt = `Featured on ${dir.name}, ${SMALL_PRINT}`;
  return {
    html: `<a href="${esc(link)}"><img src="${esc(img)}" alt="${esc(alt)}" width="${BADGE_W}" height="${BADGE_H}"></a>`,
    markdown: `[![${alt}](${img})](${link})`,
  };
}

// ---------------------------------------------------------------- the daily one

export function dailySeed(date) {
  return hashString(`directory-generator:${date}`);
}

export function dailyEntry(date) {
  const seed = dailySeed(date);
  const rnd = mulberry32((seed ^ 0x9e3779b9) >>> 0);
  const opts = {
    niche: pick(NICHE_IDS, rnd),
    vibe: pick(VIBE_IDS, rnd),
    tiers: MIN_TIERS + Math.floor(rnd() * (MAX_TIERS - MIN_TIERS + 1)),
  };
  const dir = generate(seed, opts);
  return {
    date,
    seed: dir.code,
    niche: dir.niche,
    vibe: dir.vibe,
    tiers: dir.tiers,
    name: dir.name,
    tagline: dir.tagline,
  };
}
