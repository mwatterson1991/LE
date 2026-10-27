// LE proxy: keeps the Anthropic key server-side, and stores shared "Ready to post" + projects.
// Deploy: npx wrangler deploy  (first: npx wrangler login; npx wrangler kv namespace create LE → id into wrangler.toml; npx wrangler secret put ANTHROPIC_KEY)
export default {
  async fetch(req, env) {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,PUT,POST,OPTIONS' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const url = new URL(req.url);
    if (url.pathname === '/opus' && req.method === 'POST') {
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' }, body: await req.text() });
      return new Response(await r.text(), { status: r.status, headers: { ...cors, 'content-type': 'application/json' } });
    }
    const m = url.pathname.match(/^\/(projects|queue)$/);
    if (m) {
      if (req.method === 'GET') return new Response((await env.LE.get(m[1])) || '[]', { headers: { ...cors, 'content-type': 'application/json' } });
      if (req.method === 'PUT') { await env.LE.put(m[1], await req.text()); return new Response('ok', { headers: cors }); }
    }
    return new Response('LE proxy', { headers: cors });
  }
};
