// Serves /badge/<seed>.svg, the hotlinkable "Featured on" badge, from the same
// gen.js the page uses, so a pasted badge always matches its permalink.
import { codeToSeed, directoryName, badgeSvg } from '../../gen.js';

export default async (request) => {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/^\/badge\/([0-9a-z]{1,7})\.svg$/);
  const seed = match ? codeToSeed(match[1]) : null;
  if (seed === null) {
    return new Response('No badge here. Badges live at /badge/<seed>.svg.\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  return new Response(badgeSvg(directoryName(seed)), {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400',
      'access-control-allow-origin': '*',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
};

export const config = { path: '/badge/*' };
