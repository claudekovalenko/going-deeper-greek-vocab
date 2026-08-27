# Greek Vocab — Flashcard PWA

A standalone, installable Progressive Web App for learning Biblical Greek vocabulary from *Going Deeper with New Testament Greek*.

## Features

- **Spaced repetition review** (SM-2 style) — grade each card Again / Hard / Good / Easy; the app schedules it back at the right time. Failed cards repeat within the session.
- **Flashcards** — free browsing with flip, shuffle, Greek→English, English→Greek, or mixed.
- **Quizzes** — multiple choice and type-the-answer (accents/breathings optional, any listed gloss keyword accepted).
- **Word list** — searchable (accent-insensitive), filterable by tier and learning status.
- **Tiers** — a Both / Memorize only / Recognize only toggle sits at the top of the Home screen (and in Settings), so you can set aside the recognize list before a session rather than passing through it card by card.
- **Offline-first PWA** — install to the home screen; everything works with no connection.
- **Memory hints** — every word ships with a built-in sound-alike hook — the Koine pronunciation followed by English words that sound like it, tied to the meaning (STAV-ro-o → "STAB a ROW") — and a symbol, so "Show hint" always has something to reveal. Each mnemonic has its own play button that reads it aloud, a word can carry several (one per line), and "Copy a prompt to ask Claude for more" puts a filled-in prompt on the clipboard — the word, its meaning, its Koine pronunciation and the hooks you already have — to paste into Claude and paste the answers back. Every hook is editable: the field is seeded with the built-in text, you rewrite it into whatever makes it stick, and "Restore the original hook" brings mine back. You can attach a picture too, either from the word list or straight from the card mid-session. It stays hidden while you study until you tap "Show hint". Photos are downscaled and kept in IndexedDB on the device.
- **Hear the word** — a speaker button in the corner of every card pronounces the Greek offline. Because no TTS voice reads polytonic Greek (and none speaks Erasmian at all), each word is respelled phonetically for the voice: `ἀπαγγέλλω` → `ahpahng-gehl-loh`. Choose Koine (reconstructed 1st century, the default), Erasmian, or Modern in Settings; with Modern plus an installed Greek voice it reads the real Greek instead.
- **Pass** — recognize-tier cards carry a small Pass chip in the header, far from the grading row so it cannot be hit by accident. It means "not now", nothing more: no grade, no interval, no claim that the word is known — a passed word stays exactly as unlearned as it was. Memorize cards never show it.
- **Growing database** — new workbook pages become new sets in `js/data.js`; sets can be toggled on/off. You can also paste a set as JSON under Settings, and export/import a full backup (progress + custom sets).

## Running it

It's a static site — no build step. Serve the folder over HTTPS (or localhost):

```bash
npx serve .          # or python3 -m http.server
```

Deploy anywhere static (GitHub Pages, Netlify, Cloudflare Pages). Open it on your phone and use "Add to Home Screen" to install.

## Adding vocabulary

Upload workbook photos to Claude and ask for them to be added — each page's words are appended as a new set in `js/data.js`:

```js
{
  id: "gd-set-02",
  source: "Going Deeper with New Testament Greek",
  title: "Set 2 — …",
  words: [
    { g: "λόγος, ὁ", gloss: "word", freq: 330, tier: "memorize" },
    ...
  ]
}
```

`tier` is `"memorize"` or `"recognize"`. A future section for Mounce's *Basics of Biblical Greek* can be added the same way as its own sets (a `source` field already distinguishes books).
