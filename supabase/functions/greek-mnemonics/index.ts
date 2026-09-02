// Supabase Edge Function: the vocabulary app posts { prompt } here and gets
// Claude's reply back as { text }. The Anthropic key stays on the server, so
// it is never shipped to the phone.
//
// Secrets (Dashboard -> Edge Functions -> Secrets):
//   ANTHROPIC_API_KEY   required
//   APP_TOKEN           recommended; the app sends it as x-app-token
//   ALLOWED_ORIGIN      optional, defaults to the app's GitHub Pages origin
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const MODEL = "claude-opus-5";
const SYSTEM =
  "You write memory hooks for a student learning New Testament Greek. " +
  "Follow the requested format exactly and reply with nothing else.";
const DEFAULT_ORIGIN = "https://claudekovalenko.github.io";

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (Deno.env.get("ALLOWED_ORIGIN") ?? DEFAULT_ORIGIN)
    .split(",").map((s) => s.trim());
  const allow = allowed.includes("*") || (origin && allowed.includes(origin))
    ? (origin ?? "*")
    : allowed[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-app-token, authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "content-type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  const cors = corsHeaders(req.headers.get("Origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "POST a { prompt } body." }, 405, cors);

  const appToken = Deno.env.get("APP_TOKEN");
  if (appToken && req.headers.get("x-app-token") !== appToken) {
    return json({ error: "Bad or missing app token." }, 401, cors);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json(
      { error: "The function has no ANTHROPIC_API_KEY set. Add it under Edge Functions → Secrets." },
      500,
      cors,
    );
  }

  let prompt: unknown;
  try {
    ({ prompt } = await req.json());
  } catch {
    return json({ error: "Body must be JSON." }, 400, cors);
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return json({ error: "Missing prompt." }, 400, cors);
  }
  if (prompt.length > 20000) return json({ error: "Prompt too long." }, 413, cors);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // If a safety classifier declines, the API retries on a fallback model
        // inside the same call rather than returning nothing.
        "anthropic-beta": "server-side-fallback-2026-07-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        fallbacks: "default",
        system: SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch {
    return json({ error: "Could not reach the Claude API." }, 502, cors);
  }

  let body: Record<string, unknown> = {};
  try { body = await res.json(); } catch { /* handled below */ }

  if (!res.ok) {
    // Name which of the three things is wrong, since the fix differs for each.
    if (res.status === 401) return json({ error: "The function's API key was rejected." }, 500, cors);
    if (res.status === 429) return json({ error: "Rate limited — try again in a moment." }, 429, cors);
    return json({ error: `Claude API error ${res.status}.` }, 502, cors);
  }
  if (body.stop_reason === "refusal") {
    return json({ error: "Claude declined this request." }, 422, cors);
  }

  const text = ((body.content as Array<{ type: string; text?: string }>) ?? [])
    .filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("\n")
    .trim();

  if (!text) return json({ error: "Empty reply." }, 502, cors);
  return json({ text }, 200, cors);
});
