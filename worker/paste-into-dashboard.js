/*
 * The same worker as src/index.ts, in one file with no imports, so it can be
 * pasted straight into the Cloudflare dashboard editor — no npm, no CLI, no
 * build step. It calls the Claude API over plain HTTP for that reason; the
 * SDK version in src/index.ts is the one to use if you deploy with wrangler.
 *
 * Set these on the worker (Settings -> Variables):
 *   ANTHROPIC_API_KEY   secret, required
 *   APP_TOKEN           secret, recommended — the app sends it as x-app-token
 *   ALLOWED_ORIGIN      plain text, e.g. https://claudekovalenko.github.io
 */

const MODEL = "claude-opus-5";
const SYSTEM =
  "You write memory hooks for a student learning New Testament Greek. " +
  "Follow the requested format exactly and reply with nothing else.";

function corsHeaders(env, origin) {
  const allowed = (env.ALLOWED_ORIGIN ?? "*").split(",").map(s => s.trim());
  const allow = allowed.includes("*") || (origin && allowed.includes(origin)) ? (origin ?? "*") : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-app-token",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

const json = (body, status, headers) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json" } });

export default {
  async fetch(request, env) {
    const cors = corsHeaders(env, request.headers.get("Origin"));
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST a { prompt } body." }, 405, cors);

    if (env.APP_TOKEN && request.headers.get("x-app-token") !== env.APP_TOKEN) {
      return json({ error: "Bad or missing app token." }, 401, cors);
    }

    let prompt;
    try {
      ({ prompt } = await request.json());
    } catch {
      return json({ error: "Body must be JSON." }, 400, cors);
    }
    if (typeof prompt !== "string" || !prompt.trim()) return json({ error: "Missing prompt." }, 400, cors);
    if (prompt.length > 20000) return json({ error: "Prompt too long." }, 413, cors);

    let res;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          // If a safety classifier declines, the API retries on a fallback
          // model inside the same call rather than returning nothing.
          "anthropic-beta": "server-side-fallback-2026-07-01"
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 8000,
          fallbacks: "default",
          system: SYSTEM,
          messages: [{ role: "user", content: prompt }]
        })
      });
    } catch {
      return json({ error: "Could not reach the Claude API." }, 502, cors);
    }

    let body;
    try { body = await res.json(); } catch { body = {}; }

    if (!res.ok) {
      // Say which of the three things is wrong, since the fix differs for each.
      if (res.status === 401) return json({ error: "The worker's API key was rejected." }, 500, cors);
      if (res.status === 429) return json({ error: "Rate limited — try again in a moment." }, 429, cors);
      return json({ error: `Claude API error ${res.status}.` }, 502, cors);
    }
    if (body.stop_reason === "refusal") return json({ error: "Claude declined this request." }, 422, cors);

    const text = (body.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("\n")
      .trim();

    if (!text) return json({ error: "Empty reply." }, 502, cors);
    return json({ text }, 200, cors);
  }
};
