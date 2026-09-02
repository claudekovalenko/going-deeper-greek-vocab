# Mnemonics endpoint (Supabase Edge Function)

`functions/greek-mnemonics` is what the app talks to when it rewrites the
mnemonics you marked Replace. It holds the Anthropic key server-side, so the
key never reaches the phone.

Already deployed to the `house-finder` project as `greek-mnemonics`. Its URL:

    https://dmiysgmhwpkrunmswtrn.supabase.co/functions/v1/greek-mnemonics

## One thing left to do

Supabase Dashboard → **Edge Functions → Secrets**, add:

| Name | Value |
|---|---|
| `ANTHROPIC_API_KEY` | your key from console.anthropic.com |
| `APP_TOKEN` | any long random string you invent |

Then in the app: **Settings → Rewriting with Claude** → paste the URL above and
the same `APP_TOKEN`.

Until the key is set the function answers with exactly that complaint, so a
missing secret is never a silent failure.

## Notes

`verify_jwt` is off deliberately: the app is a static page with no Supabase
session, so the function does its own auth with `APP_TOKEN` and only answers
requests from the app's origin (`ALLOWED_ORIGIN`, defaulting to the GitHub
Pages domain). Those two are what stop a stranger who finds the URL from
spending your API credit — set `APP_TOKEN`.

It touches no table in the project; it only forwards a prompt and returns text.

Redeploy after editing `functions/greek-mnemonics/index.ts`:

```bash
npx supabase functions deploy greek-mnemonics --no-verify-jwt
```

The Cloudflare version in `worker/` still works and is kept as an alternative.
Only one endpoint is needed.
