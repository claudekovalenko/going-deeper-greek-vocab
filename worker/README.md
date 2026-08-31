# Mnemonics worker

A small Cloudflare Worker so the vocabulary app can ask Claude for replacement
mnemonics directly, instead of copying a prompt out and pasting the reply back.

The Anthropic API key lives here, in Cloudflare, and never reaches the phone.

## Deploy from the Cloudflare dashboard (easiest, no tools to install)

Everything here happens in a browser, including a phone browser.

1. **Get an API key** at [console.anthropic.com](https://console.anthropic.com)
   → API Keys → Create Key. Copy it; it is shown once.
2. At [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
   **Create** → **Start with Hello World** → name it `greek-vocab-mnemonics` →
   **Deploy**.
3. **Edit code**, select everything in the editor, and paste the whole of
   [`paste-into-dashboard.js`](paste-into-dashboard.js) over it. **Deploy**.
4. **Settings → Variables and Secrets**, add three:

   | Name | Type | Value |
   |---|---|---|
   | `ANTHROPIC_API_KEY` | Secret | the key from step 1 |
   | `APP_TOKEN` | Secret | any long random string you invent |
   | `ALLOWED_ORIGIN` | Text | `https://claudekovalenko.github.io` |

   **Deploy** once more so the variables take effect.
5. Copy the worker's URL from its overview page — it looks like
   `https://greek-vocab-mnemonics.<you>.workers.dev`.

`paste-into-dashboard.js` is the same worker as `src/index.ts` with no imports,
so it needs no build step. Use it for this route; use `src/index.ts` below if
you would rather deploy from a terminal.

## Deploy from a terminal instead

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # paste your key from console.anthropic.com
npx wrangler secret put APP_TOKEN           # optional: any random string
npx wrangler deploy
```

`wrangler deploy` prints a URL like `https://greek-vocab-mnemonics.<you>.workers.dev`.

## Connect the app

In the app: **Settings → Rewriting with Claude** → paste that URL (and the same
APP_TOKEN, if you set one). The Replace screen then offers **Rewrite them with
Claude** and applies the result in place.

Leave the URL empty and the app keeps the copy-and-paste flow.

## Cost

Requests are billed to your Anthropic API account, which is separate from a
Claude subscription. Each rewrite is one short request — cents, not dollars, at
current Opus pricing — but it is real money, and `APP_TOKEN` plus
`ALLOWED_ORIGIN` are what stop anyone else spending it.
