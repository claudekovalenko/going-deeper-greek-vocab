# Mnemonics worker

A small Cloudflare Worker so the vocabulary app can ask Claude for replacement
mnemonics directly, instead of copying a prompt out and pasting the reply back.

The Anthropic API key lives here, in Cloudflare, and never reaches the phone.

## Deploy

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
