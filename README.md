# Greek Vocab — Flashcard PWA

A standalone, installable Progressive Web App for learning Biblical Greek vocabulary from *Going Deeper with New Testament Greek*.

## Features

- **Spaced repetition review** (SM-2 style) — grade each card Again / Hard / Good / Easy; the app schedules it back at the right time. Failed cards repeat within the session.
- **Flashcards** — free browsing with flip, shuffle, Greek→English, English→Greek, or mixed.
- **Quizzes** — multiple choice and type-the-answer (accents/breathings optional, any listed gloss keyword accepted).
- **Word list** — searchable (accent-insensitive), filterable by tier and learning status.
- **Tiers** — study "Vocabulary to Memorize" and "Vocabulary to Recognize" together or separately.
- **Offline-first PWA** — install to the home screen; everything works with no connection.
- **Memory hints** — attach a picture (or a note/mnemonic) to any word from the word list. It stays hidden while you study until you tap "Show hint". Photos are downscaled and kept in IndexedDB on the device.
- **Hear the word** — a speaker button in the corner of every card pronounces the Greek offline. Because no TTS voice reads polytonic Greek (and none speaks Erasmian at all), each word is respelled phonetically for the voice: `ἀπαγγέλλω` → `ahpahng-gehl-loh`. Choose Erasmian or Modern in Settings; with Modern plus an installed Greek voice it reads the real Greek instead.
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
