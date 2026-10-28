// Local dev server: static files plus /badge/<seed>.svg through the real edge
// function, so you can test a hotlinked badge without the Netlify CLI.
//   node scripts/serve.js [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import badge from '../netlify/edge-functions/badge.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 8080);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/badge/')) {
      const r = await badge(new Request(url));
      res.writeHead(r.status, Object.fromEntries(r.headers));
      res.end(await r.text());
      return;
    }
    const rel = normalize(decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    const file = join(ROOT, rel);
    if (!file.startsWith(ROOT) || rel.split(sep).some((p) => p.startsWith('.') && p !== '.')) throw Object.assign(new Error('nope'), { code: 'ENOENT' });
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    res.writeHead(err.code === 'ENOENT' || err.code === 'EISDIR' ? 404 : 500, { 'content-type': 'text/plain' });
    res.end(err.code === 'ENOENT' || err.code === 'EISDIR' ? 'Not found\n' : `Error: ${err.message}\n`);
  }
}).listen(PORT, () => console.log(`Directory Generator on http://localhost:${PORT}`));
