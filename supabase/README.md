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

---

# Sync (`functions/vocab-sync`)

What ends the copy-and-paste loop. The app pushes up which mnemonics are
marked Keep or Replace — with each word's gloss, chapter, pronunciation, the
hook in use and any note about it — and pulls down rewritten ones, applying
them and clearing the Replace mark.

Nothing to configure: the URL is built into the app, and the function uses the
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` that Supabase gives its own
functions. No API key is involved; this endpoint never calls Claude.

A phone identifies itself by a 144-bit id it generates on first run and keeps
in local storage. Both tables have RLS enabled with no policies, so they are
unreachable with the anon key — only this function can touch them.

**Pictures are never synced.** They are large, and they stay on the device.

## Reading the marks, and answering them

```sql
-- what is marked Replace
select k as word_id, v->>'greek' as greek, v->>'gloss' as gloss,
       v->>'say' as say, v->>'mn' as current_hook, v->>'wish' as wish
from public.vocab_devices d, jsonb_each(d.hooks) as e(k, v)
where (v->>'vote')::int = -1;

-- hand back a rewrite; the app applies it on next open
insert into public.vocab_replacements (device_id, word_id, mn)
values ('<device>', '<word_id>', '<new mnemonic>');
```
