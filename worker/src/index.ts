// A tiny Cloudflare Worker that lets the vocabulary app ask Claude for new
// mnemonics without a copy-paste round trip. It holds the API key server-side
// so the key is never shipped to the phone.
import Anthropic from "@anthropic-ai/sdk";

export interface Env {
  ANTHROPIC_API_KEY: string;
  /** Optional shared secret. When set, requests must send it as x-app-token. */
  APP_TOKEN?: string;
  /** Optional origin allow-list, comma separated. Defaults to "*". */
  ALLOWED_ORIGIN?: string;
}

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
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

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "content-type": "application/json" }
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env, request.headers.get("Origin"));
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "POST a { prompt } body." }, 405, cors);

    if (env.APP_TOKEN && request.headers.get("x-app-token") !== env.APP_TOKEN) {
      return json({ error: "Bad or missing app token." }, 401, cors);
    }

    let prompt: unknown;
    try {
      ({ prompt } = (await request.json()) as { prompt?: unknown });
    } catch {
      return json({ error: "Body must be JSON." }, 400, cors);
    }
    if (typeof prompt !== "string" || !prompt.trim()) {
      return json({ error: "Missing prompt." }, 400, cors);
    }
    if (prompt.length > 20000) {
      return json({ error: "Prompt too long." }, 413, cors);
    }

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.beta.messages.create({
        model: "claude-opus-5",
        max_tokens: 8000,
        // If a safety classifier declines, the API retries on a fallback model
        // inside the same call rather than returning nothing.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system:
          "You write memory hooks for a student learning New Testament Greek. " +
          "Follow the requested format exactly and reply with nothing else.",
        messages: [{ role: "user", content: prompt }]
      });

      if (response.stop_reason === "refusal") {
        return json({ error: "Claude declined this request." }, 422, cors);
      }

      const text = response.content
        .filter(block => block.type === "text")
        .map(block => (block as { text: string }).text)
        .join("\n")
        .trim();

      if (!text) return json({ error: "Empty reply." }, 502, cors);
      return json({ text }, 200, cors);
    } catch (error) {
      // Most specific first, so the app can tell "wait and retry" from "broken".
      if (error instanceof Anthropic.AuthenticationError) {
        return json({ error: "The worker's API key was rejected." }, 500, cors);
      }
      if (error instanceof Anthropic.RateLimitError) {
        return json({ error: "Rate limited — try again in a moment." }, 429, cors);
      }
      if (error instanceof Anthropic.APIError) {
        return json({ error: `Claude API error ${error.status}.` }, 502, cors);
      }
      return json({ error: "Unexpected worker error." }, 500, cors);
    }
  }
};
