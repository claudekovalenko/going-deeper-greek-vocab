/* Greek Vocab PWA — flashcards, quizzes, and spaced repetition */
"use strict";

// ---------------- storage ----------------
const LS_PROGRESS = "gv-progress-v1"; // per-word SRS state
const LS_SETTINGS = "gv-settings-v1";
const LS_CUSTOM = "gv-custom-sets-v1"; // user-added sets

const store = {
  load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

let progress = store.load(LS_PROGRESS, {});
let settings = store.load(LS_SETTINGS, {
  direction: "g2e",          // g2e | e2g | mixed
  tiers: { memorize: true, recognize: true },
  enabledSets: {},           // setId -> bool (default true)
  quizSize: 10,
  pron: "koine"              // koine | erasmian | modern
});
let customSets = store.load(LS_CUSTOM, []);

function saveProgress() { store.save(LS_PROGRESS, progress); }

// Which tiers are being studied, as a single choice rather than two checkboxes.
const TIER_MODES = [
  { id: "both", label: "Both", tiers: { memorize: true, recognize: true } },
  { id: "memorize", label: "Memorize only", tiers: { memorize: true, recognize: false } },
  { id: "recognize", label: "Recognize only", tiers: { memorize: false, recognize: true } }
];
function tierMode() {
  const t = settings.tiers || {};
  return TIER_MODES.find(m => m.tiers.memorize === !!t.memorize && m.tiers.recognize === !!t.recognize)?.id || "both";
}
function setTierMode(id) {
  const m = TIER_MODES.find(x => x.id === id) || TIER_MODES[0];
  settings.tiers = { ...m.tiers };
  saveSettings();
  session = null; deck = null; quiz = null;   // the pool changed, so start clean
}
function tierModeMarkup() {
  const cur = tierMode();
  return `<div class="pill-row tier-modes" id="tier-modes">
      ${TIER_MODES.map(m => `<button class="pill ${m.id === cur ? "on" : ""}" data-mode="${m.id}">${m.label}</button>`).join("")}
    </div>`;
}
function mountTierMode(after) {
  view.querySelectorAll("#tier-modes .pill").forEach(b => b.onclick = () => {
    setTierMode(b.dataset.mode);
    after();
  });
}
function saveSettings() { store.save(LS_SETTINGS, settings); }

// ---------------- pronunciation ----------------
// Text-to-speech voices cannot read polytonic Greek, and none of them speak
// Erasmian at all. So instead of handing the voice Greek letters, we hand it a
// respelling in the voice's own alphabet that it pronounces close to correctly.

// Split a word into letters carrying their own diacritics.
function greekLetters(word) {
  const out = [];
  for (const ch of word.normalize("NFD")) {
    const code = ch.codePointAt(0);
    if (code >= 0x0300 && code <= 0x036f) {          // a combining mark
      if (out.length) out[out.length - 1].marks.push(code);
    } else {
      out.push({ base: ch.toLowerCase(), marks: [] });
    }
  }
  return out;
}

const ROUGH = 0x0314;     // ῾ rough breathing — adds an h
const DIAERESIS = 0x0308; // ¨ marks the vowel as its OWN syllable, not a diphthong
const VOWELS = "αεηιουω";

const ERASMIAN = {
  single: { α:"ah", ε:"eh", η:"ay", ι:"ee", ο:"o", υ:"ew", ω:"oh",
            β:"b", γ:"g", δ:"d", ζ:"z", θ:"th", κ:"k", λ:"l", μ:"m", ν:"n",
            ξ:"x", π:"p", ρ:"r", σ:"s", ς:"s", τ:"t", φ:"f", χ:"k", ψ:"ps" },
  digraph: { αι:"eye", ει:"ay", οι:"oy", υι:"wee", αυ:"ow", ευ:"eh-oo", ηυ:"ay-oo", ου:"oo" }
};

// Reconstructed first-century Koine, along the lines of Randall Buth's system:
// β/γ/δ already fricatives, αι levelled with ε, ει with ι, υ and οι still the
// front-rounded /y/, but η not yet collapsed into /i/.
const KOINE = {
  single: { α:"ah", ε:"eh", η:"ay", ι:"ee", ο:"o", υ:"ew", ω:"o",
            β:"v", γ:"gh", δ:"th", ζ:"z", θ:"th", κ:"k", λ:"l", μ:"m", ν:"n",
            ξ:"x", π:"p", ρ:"r", σ:"s", ς:"s", τ:"t", φ:"f", χ:"kh", ψ:"ps" },
  digraph: { αι:"eh", ει:"ee", οι:"ew", υι:"ew", αυ:"av", ευ:"ev", ηυ:"ev", ου:"oo" }
};

const MODERN = {
  single: { α:"ah", ε:"eh", η:"ee", ι:"ee", ο:"o", υ:"ee", ω:"o",
            β:"v", γ:"gh", δ:"th", ζ:"z", θ:"th", κ:"k", λ:"l", μ:"m", ν:"n",
            ξ:"x", π:"p", ρ:"r", σ:"s", ς:"s", τ:"t", φ:"f", χ:"h", ψ:"ps" },
  digraph: { αι:"eh", ει:"ee", οι:"ee", υι:"ee", αυ:"av", ευ:"ev", ηυ:"ev", ου:"oo" }
};

// Two chunks that would collide into an unreadable run ("eh-oo"+"o" = "ehooo",
// "h"+"hree") get a separator so the voice keeps them apart.
function join(out, chunk) {
  const a = out[out.length - 1], b = chunk[0];
  if (!a) return chunk;
  // Same letter twice, or a vowel right after the h of "ah"/"eh"/"oh" — which
  // the voice would otherwise read as an intrusive h ("ah"+"ee" = "a-hee").
  // ...but only when that h ends a vowel sound ("ah"), never a consonant
  // digraph like "th" or "gh", where "thay" is exactly what we want.
  const vowelH = a === "h" && "aeiou".includes(out[out.length - 2] || "");
  if ((a === b && a !== "-") || (vowelH && "aeiou".includes(b))) return out + "-" + chunk;
  return out + chunk;
}

const SCHEMES = { koine: KOINE, modern: MODERN, erasmian: ERASMIAN };

function translit(word, scheme) {
  const map = SCHEMES[scheme] || KOINE;
  const L = greekLetters(word);
  let out = "", i = 0;

  while (i < L.length) {
    const cur = L[i], next = L[i + 1];

    // γ before a velar is a nasal: ἄγγελος = ang-, not ag-g-
    if (cur.base === "γ" && next && "γκχξ".includes(next.base)) {
      out += "ng";
      i++;
      continue;
    }

    // Diphthongs: the breathing sits on the second vowel.
    if (next && VOWELS.includes(cur.base)) {
      const pair = cur.base + next.base;
      if (map.digraph[pair] && !next.marks.includes(DIAERESIS)) {
        const h = next.marks.includes(ROUGH) ? "h" : "";
        out += h + map.digraph[pair];
        i += 2;
        continue;
      }
    }

    const h = cur.marks.includes(ROUGH) ? "h" : "";
    const sound = map.single[cur.base] ?? cur.base;
    // ῥ is "rh"; every other letter takes its h in front.
    out = join(out, cur.base === "ρ" ? sound + h : h + sound);
    i++;
  }
  return out.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

// ---------------- speech (hear the Greek) ----------------
const SPEAKER_ICON = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path d="M15.4 8.6a5 5 0 0 1 0 6.8"/><path d="M18.4 5.6a9 9 0 0 1 0 12.8"/></svg>`;

function speechReady() { return typeof speechSynthesis !== "undefined"; }

function greekVoice() {
  if (!speechReady()) return null;
  return (speechSynthesis.getVoices() || []).find(v => /^el/i.test(v.lang)) || null;
}

// What the voice is actually given depends on the scheme:
//   erasmian — always a respelling, since no voice on earth speaks Erasmian
//   modern   — real Greek if a Greek voice exists, else a respelling
function speechPlan(greek) {
  const scheme = settings.pron || "koine";
  const gv = scheme === "modern" ? greekVoice() : null;
  return gv
    ? { text: greek, voice: gv, lang: gv.lang }
    : { text: translit(greek, scheme), voice: null, lang: navigator.language || "en-US" };
}

function speakGreek(greek) {
  if (!speechReady() || !greek) return;
  speechSynthesis.cancel();          // stop whatever is still playing
  const plan = speechPlan(greek);
  const u = new SpeechSynthesisUtterance(plan.text);
  if (plan.voice) u.voice = plan.voice;
  u.lang = plan.lang;
  u.rate = 0.75;                     // slow enough to follow syllable by syllable
  speechSynthesis.speak(u);
}

// The hooks are English, so they are read plainly rather than respelled.
function speakEnglish(text) {
  if (!speechReady() || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = navigator.language || "en-US";
  u.rate = 0.95;
  speechSynthesis.speak(u);
}

// The lexical entry carries parsing info ("θρίξ, τριχός, ἡ"); say the word itself.
// untilRevealed: on an English-prompt card, hearing the Greek would give the
// answer away, so the button waits for the flip.
function speakMarkup(w, extraClass = "", untilRevealed = false) {
  if (!speechReady()) return "";
  const say = headword(w.g);
  return `<button class="speak-btn ${extraClass}" data-say="${esc(say)}" ${untilRevealed ? "hidden" : ""}
      aria-label="Hear ${esc(say)} pronounced" title="Hear it">${SPEAKER_ICON}</button>`;
}

function mountSpeak() {
  view.querySelectorAll(".speak-btn").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();           // never flip the card when tapping the speaker
      e.preventDefault();
      speakGreek(btn.dataset.say);
    };
  });
}

// ---------------- hints (picture + note per word) ----------------
// Photos are far too large for localStorage, so hints live in IndexedDB.
// Everything is mirrored into `hints` at boot so rendering stays synchronous.
const HINT_DB = "gv-hints-v1", HINT_STORE = "hints";
let hints = {};            // wordId -> { buf?: ArrayBuffer, type?: string, note?: string }
const hintUrls = {};       // wordId -> object URL, made on first use

function openHintDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(HINT_DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(HINT_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function hintTx(mode, fn) {
  return openHintDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(HINT_STORE, mode);
    const req = fn(tx.objectStore(HINT_STORE));
    tx.oncomplete = () => resolve(req && req.result);
    tx.onerror = () => reject(tx.error);
  }));
}

async function loadHints() {
  try {
    const db = await openHintDb();
    hints = await new Promise((resolve, reject) => {
      const tx = db.transaction(HINT_STORE, "readonly");
      const st = tx.objectStore(HINT_STORE);
      const keys = st.getAllKeys(), vals = st.getAll();
      tx.oncomplete = () => {
        const out = {};
        keys.result.forEach((k, i) => { out[k] = vals.result[i]; });
        resolve(out);
      };
      tx.onabort = () => reject(tx.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    hints = {}; // private browsing or no IndexedDB — hints just stay unavailable
    return;
  }
  // Pictures saved by an older version are Blobs; convert them once so they
  // survive future reloads.
  for (const [id, h] of Object.entries(hints)) {
    if (h && h.blob && !h.buf) {
      try {
        const buf = await h.blob.arrayBuffer();
        await putHint(id, { buf, type: h.blob.type || "image/jpeg", note: h.note });
      } catch {
        delete hints[id];          // the blob is already dead; drop the corpse
        await removeHint(id).catch(() => {});
      }
    }
  }
}

async function putHint(id, val) {
  hints[id] = val;
  if (hintUrls[id]) { URL.revokeObjectURL(hintUrls[id]); delete hintUrls[id]; }
  await hintTx("readwrite", st => st.put(val, id));
}

async function removeHint(id) {
  delete hints[id];
  if (hintUrls[id]) { URL.revokeObjectURL(hintUrls[id]); delete hintUrls[id]; }
  await hintTx("readwrite", st => st.delete(id));
}

function hasHint(id) {
  const h = hints[id];
  return !!(h && (h.buf || h.note));
}

function hintUrl(id) {
  const h = hints[id];
  if (!h || !h.buf) return null;
  if (!hintUrls[id]) {
    const blob = new Blob([h.buf], { type: h.type || "image/jpeg" });
    hintUrls[id] = URL.createObjectURL(blob);
  }
  return hintUrls[id];
}

// Photos straight from a phone camera are many megabytes; store a small copy.
function shrinkImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(src);
      c.toBlob(b => b ? resolve(b) : reject(new Error("that image could not be read")), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error("that image could not be read")); };
    img.src = src;
  });
}

// Shared hint strip for the study screens. Every word ships with a built-in
// memory hook, so there is always something to reveal; a picture and a note of
// your own layer on top of it.
function hasOwnHint(id) {
  const h = hints[id];
  return !!(h && (h.buf || h.mn || h.note));
}

// Your edited hook wins; an older personal note counts as one; else the
// built-in text shipped with the word.
function hookText(w) {
  const h = hints[w.id] || {};
  return h.mn ?? h.note ?? w.mn ?? "";
}
// Each line of the hook text is its own mnemonic, so extras are just new lines.
function hookLines(w) {
  return hookText(w).split("\n").map(t => t.trim()).filter(Boolean);
}

// A ready-made prompt to paste into Claude when a word will not stick.
function hintPrompt(w) {
  const lines = hookLines(w);
  return `I am learning New Testament Greek. Help me remember this word:\n\n` +
    `Greek: ${w.g}\nMeaning: ${w.gloss}\n` +
    `Pronounced (Koine): ${translit(headword(w.g), settings.pron || "koine")}\n` +
    (lines.length ? `\nMnemonics I already have:\n${lines.map(l => "- " + l).join("\n")}\n` : "") +
    `\nGive me 3 more memory hooks. Base each one on how the word SOUNDS when said aloud: ` +
    `English words that sound like those syllables, worked into a vivid image that carries the meaning. ` +
    `Keep each to one or two sentences, and put each on its own line with no numbering.`;
}
// A verdict on the hook: 1 keep it, -1 replace it, 0/absent no opinion.
function hookVote(id) { return (hints[id] || {}).vote || 0; }
async function setHookVote(id, v, w) {
  const h = hints[id] || {};
  const next = h.vote === v ? 0 : v;
  // Keeping a hook freezes its current wording as yours, so a later update to
  // the built-in text cannot quietly take it away.
  const pin = next === 1 && !h.mn && w ? hookText(w) : h.mn;
  await putHint(id, { buf: h.buf, type: h.type, mn: pin, wish: h.wish, vote: next });
}
async function setWish(id, text) {
  const h = hints[id] || {};
  await putHint(id, { buf: h.buf, type: h.type, mn: h.mn, vote: h.vote, wish: text.trim() || undefined });
}
function wishOf(id) { return (hints[id] || {}).wish || ""; }

function dislikedWords() {
  return activeWords().filter(w => hookVote(w.id) === -1);
}

function hookIsMine(w) {
  const h = hints[w.id] || {};
  return h.mn != null || h.note != null;
}

function hintMarkup(w, allowAdd = true) {
  if (!w.mn && !hasOwnHint(w.id) && !allowAdd) return "";
  return `<div class="hint-zone">
      <input type="file" id="hint-pic" accept="image/*" hidden>
      <button class="btn secondary hint-toggle" id="hint-btn">Show hint</button>
      <div class="hint-body" id="hint-body" hidden></div>
    </div>`;
}

function mountHint(w, allowAdd = true) {
  const btn = view.querySelector("#hint-btn");
  if (!btn) return;
  const body = view.querySelector("#hint-body");
  const picker = view.querySelector("#hint-pic");

  const savePicture = async () => {
    const f = picker.files[0];
    if (!f) return;
    try {
      const blob = await shrinkImage(f);
      const prev = hints[w.id] || {};
      await putHint(w.id, {
        buf: await blob.arrayBuffer(), type: blob.type,
        mn: prev.mn, vote: prev.vote, wish: prev.wish, note: prev.note
      });
      show(currentView);                 // redraw this same card, hint included
    } catch (e) {
      body.insertAdjacentHTML("beforeend", `<div class="feedback no">${esc(e.message)}</div>`);
    }
  };

  const saveHook = async text => {
    const h = hints[w.id] || {};
    // storing under mn retires any older note field for this word
    await putHint(w.id, { buf: h.buf, type: h.type, vote: h.vote, wish: h.wish, mn: text.trim() || undefined });
  };

  const resetHook = async () => {
    const h = hints[w.id] || {};
    if (!h.buf && !h.vote) await removeHint(w.id);
    else await putHint(w.id, { buf: h.buf, type: h.type, vote: h.vote, wish: h.wish });
  };

  const draw = () => {
    const h = hints[w.id] || {};
    const url = hintUrl(w.id);
    const mine = hookIsMine(w);
    const lines = hookLines(w);
    body.innerHTML = `
      ${url ? `<img class="hint-img" alt="Your picture for ${esc(w.g)}" src="${url}">` : ""}
      ${lines.map((line, i) => `
        <p class="hint-note">
          ${i === 0 && w.icon && !mine ? `<span class="hint-icon">${w.icon}</span>` : ""}
          <span class="hook-text">${esc(line)}</span>
          <button class="speak-btn speak-sm hook-say" data-line="${i}"
            aria-label="Hear this mnemonic read aloud" title="Hear this hint">${SPEAKER_ICON}</button>
        </p>`).join("")}
      ${allowAdd && lines.length ? `
        <div class="vote-row">
          <button class="vote ${hookVote(w.id) === 1 ? "on up" : ""}" id="vote-up"
            aria-label="Keep this mnemonic">\u25b3 Keep</button>
          <button class="vote ${hookVote(w.id) === -1 ? "on down" : ""}" id="vote-down"
            aria-label="Ask for a different mnemonic">\u25bd Replace</button>
        </div>
        ${hookVote(w.id) === -1 ? `
          <div class="wish-box">
            <label class="tool-label" for="wish">What would work better? (optional)</label>
            <textarea id="wish" class="hook-input" rows="2"
              placeholder="Say or type it \u2014 e.g. tie it to basketball, or use a name I know">${esc(wishOf(w.id))}</textarea>
          </div>` : ""}` : ""}
      ${allowAdd ? `
        <div class="hint-tools">
          <label class="tool-label" for="my-note">Mnemonics — one per line, edit or add your own</label>
          <textarea id="my-note" class="hook-input" rows="4"
            placeholder="Sounds like\u2026">${esc(hookText(w))}</textarea>
          <div class="hint-tool-row">
            <button class="btn secondary btn-inline" id="save-note">Save</button>
            <button class="btn secondary btn-inline" id="pick-pic">${url ? "Change picture" : "Add a picture"}</button>
          </div>
          <button class="btn secondary btn-inline wide" id="ask-claude">Copy a prompt to ask Claude for more</button>
          ${mine && w.mn ? `<button class="btn secondary btn-inline wide" id="reset-hook">Restore the original</button>` : ""}
          <div id="note-fb"></div>
        </div>` : ""}`;

    body.querySelectorAll(".hook-say").forEach(btn => btn.onclick = e => {
      e.stopPropagation();
      speakEnglish(lines[+btn.dataset.line]);
    });

    if (!allowAdd) return;
    const up = body.querySelector("#vote-up"), down = body.querySelector("#vote-down");
    const wish = body.querySelector("#wish");
    if (wish) wish.onchange = () => setWish(w.id, wish.value);   // fires on blur, dictation included
    if (up) up.onclick = async () => { await setHookVote(w.id, 1, w); draw(); };
    if (down) down.onclick = async () => { await setHookVote(w.id, -1); draw(); };
    body.querySelector("#pick-pic").onclick = () => picker.click();
    const noteInput = body.querySelector("#my-note");
    const fb = body.querySelector("#note-fb");
    body.querySelector("#save-note").onclick = async () => {
      await saveHook(noteInput.value);
      draw();
      body.querySelector("#note-fb").innerHTML = `<div class="feedback ok">Saved.</div>`;
    };
    body.querySelector("#ask-claude").onclick = async () => {
      const text = hintPrompt(w);
      try {
        await navigator.clipboard.writeText(text);
        fb.innerHTML = `<div class="feedback ok">Prompt copied. Paste it into Claude, then paste
          the mnemonics it gives you into the box above \u2014 one per line.</div>`;
      } catch {
        fb.innerHTML = `<div class="feedback ok">Copy this into Claude:</div>
          <textarea class="hook-input" rows="6" readonly>${esc(text)}</textarea>`;
      }
    };
    const reset = body.querySelector("#reset-hook");
    if (reset) reset.onclick = async () => { await resetHook(); draw(); };
  };

  picker.onchange = savePicture;
  btn.onclick = () => {
    if (!body.hidden) { body.hidden = true; body.innerHTML = ""; btn.textContent = "Show hint"; return; }
    draw();
    body.hidden = false;
    btn.textContent = "Hide hint";
  };
}

// ---------------- data ----------------
function allSets() { return [...VOCAB_SETS, ...customSets]; }

function wordId(setId, w) { return setId + "::" + w.g; }

function activeWords() {
  const out = [];
  for (const set of allSets()) {
    if (settings.enabledSets[set.id] === false) continue;
    for (const w of set.words) {
      if (!settings.tiers[w.tier ?? "memorize"]) continue;
      out.push({ ...w, setId: set.id, setTitle: set.title, id: wordId(set.id, w) });
    }
  }
  return out;
}

// ---------------- SRS (SM-2 style) ----------------
function getState(id) {
  return progress[id] ?? { reps: 0, interval: 0, ease: 2.5, due: 0, seen: 0, correct: 0 };
}

function grade(id, q) { // q: 0 again, 3 hard, 4 good, 5 easy
  const s = getState(id);
  const now = Date.now();
  s.seen++;
  if (q >= 3) s.correct++;
  if (q < 3) {
    s.reps = 0;
    s.interval = 0;
    s.due = now + 60 * 1000; // retry within the session
  } else {
    s.reps++;
    if (s.reps === 1) s.interval = 1;
    else if (s.reps === 2) s.interval = q === 5 ? 4 : 3;
    else s.interval = Math.round(s.interval * s.ease * (q === 3 ? 0.8 : q === 5 ? 1.3 : 1));
    s.ease = Math.max(1.3, s.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    s.due = now + s.interval * 24 * 60 * 60 * 1000;
  }
  progress[id] = s;
  saveProgress();
}

// Passing is not a claim to know the word — it only means "not now". No
// interval, no ease, no grade: the word keeps whatever standing it had, and
// stays unlearned if it was unlearned.
function skipWord(id) {
  const s = getState(id);
  s.skips = (s.skips || 0) + 1;
  progress[id] = s;
  saveProgress();
}

function wordStatus(id) {
  const s = progress[id];
  if (!s || s.seen === 0) return "new";
  if (s.interval >= 7) return "known";
  return "learning";
}

function dueWords() {
  const now = Date.now();
  return activeWords().filter(w => {
    const s = progress[w.id];
    return s && s.seen > 0 && s.due <= now;
  });
}
function newWords() {
  return activeWords().filter(w => !progress[w.id] || progress[w.id].seen === 0);
}

// ---------------- utils ----------------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
// strip accents/breathings for forgiving Greek/English comparison
function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ς/g, "σ").replace(/[^a-zα-ω0-9 ]/g, "").replace(/\s+/g, " ").trim();
}
function headword(g) { return g.split(",")[0].trim(); }

function pickDirection() {
  if (settings.direction === "mixed") return Math.random() < 0.5 ? "g2e" : "e2g";
  return settings.direction;
}

// ---------------- views ----------------
const view = document.getElementById("view");
let currentView = "home";

function show(name) {
  currentView = name;
  document.querySelectorAll("#tabbar .tab").forEach(t =>
    t.classList.toggle("active", t.dataset.view === name));
  ({ home: renderHome, review: renderReview, flash: renderFlash,
     quiz: renderQuiz, browse: renderBrowse, settings: renderSettings,
     redo: renderRedo }[name])();
  window.scrollTo(0, 0);
}

document.querySelectorAll("#tabbar .tab").forEach(t =>
  t.addEventListener("click", () => show(t.dataset.view)));
document.getElementById("btn-settings").addEventListener("click", () => show("settings"));

// ---------------- HOME ----------------
function renderHome() {
  const words = activeWords();
  const due = dueWords().length;
  const nw = newWords().length;
  const known = words.filter(w => wordStatus(w.id) === "known").length;
  const learning = words.filter(w => wordStatus(w.id) === "learning").length;

  view.innerHTML = `
    <div class="card-panel">
      <h2>Studying</h2>
      ${tierModeMarkup()}
      <p class="muted">${
        tierMode() === "both" ? "Both tiers are in the deck."
        : tierMode() === "memorize" ? "Only words to memorize. The recognize list is set aside."
        : "Only words to recognize."}</p>
    </div>
    <div class="card-panel">
      <h2>Today</h2>
      <div class="stat-row">
        <div class="stat"><div class="num">${due}</div><div class="lbl">Due</div></div>
        <div class="stat"><div class="num">${nw}</div><div class="lbl">New</div></div>
        <div class="stat"><div class="num">${learning}</div><div class="lbl">Learning</div></div>
        <div class="stat"><div class="num">${known}</div><div class="lbl">Known</div></div>
      </div>
      <button class="btn" id="go-review">${due + Math.min(nw, 10) > 0 ? "Start Review Session" : "All caught up"}</button>
    </div>
    <div class="card-panel">
      <h2>Study Modes</h2>
      <button class="btn secondary" id="go-flash">Flashcards — flip through the deck</button>
      <button class="btn secondary" id="go-quiz">Quiz — multiple choice & typing</button>
      <button class="btn secondary" id="go-browse">Word List — browse & search</button>
    </div>
    <div class="card-panel">
      <h2>Vocabulary Sets</h2>
      ${allSets().map(s => {
        const on = settings.enabledSets[s.id] !== false;
        return `<label class="row"><span>${esc(s.title)} <span class="muted">(${s.words.length})</span></span>
          <input type="checkbox" data-set="${esc(s.id)}" ${on ? "checked" : ""}></label>`;
      }).join("")}
      <p class="muted">Upload more workbook pages to Claude and new sets are added here. You can also paste a set in Settings.</p>
    </div>`;

  mountTierMode(renderHome);
  view.querySelector("#go-review").onclick = () => show("review");
  view.querySelector("#go-flash").onclick = () => show("flash");
  view.querySelector("#go-quiz").onclick = () => show("quiz");
  view.querySelector("#go-browse").onclick = () => show("browse");
  view.querySelectorAll("input[data-set]").forEach(cb => cb.onchange = () => {
    settings.enabledSets[cb.dataset.set] = cb.checked;
    saveSettings(); renderHome();
  });
}

// ---------------- REVIEW (SRS) ----------------
let session = null;

function buildSession() {
  const due = shuffle(dueWords());
  const fresh = shuffle(newWords()).slice(0, 10);
  return { queue: [...due, ...fresh], done: 0, total: due.length + fresh.length };
}

function renderReview() {
  if (!session || session.queue.length === 0) session = buildSession();
  if (session.queue.length === 0) {
    view.innerHTML = `<div class="card-panel" style="text-align:center">
      <h3>Nothing due right now</h3>
      <p class="muted">Come back later, or drill with Flashcards / Quiz any time.</p>
      <button class="btn secondary" id="again">Study new words anyway</button></div>`;
    view.querySelector("#again").onclick = () => {
      session = { queue: shuffle(activeWords()).slice(0, 15), done: 0, total: 15 };
      renderReview();
    };
    return;
  }
  const w = session.queue[0];
  const dir = pickDirection();
  const front = dir === "g2e" ? `<div class="fc-word greek">${esc(w.g)}</div>` : `<div class="fc-gloss">${esc(w.gloss)}</div>`;
  const back = dir === "g2e" ? `<div class="fc-gloss">${esc(w.gloss)}</div>` : `<div class="fc-word greek">${esc(w.g)}</div>`;
  const pct = Math.round(session.done / session.total * 100);

  const canPass = w.tier === "recognize";
  view.innerHTML = `
    <div class="review-head">
      <span class="muted">Review ${session.done + 1} / ${session.total}</span>
      ${canPass ? `<button class="pass-chip" id="pass" title="Skip this one \u2014 nothing is recorded">Pass \u203a</button>` : ""}
    </div>
    <div class="progress-line"><div style="width:${pct}%"></div></div>
    <div class="flashcard-wrap"><div class="flashcard" id="fc">
      <div class="fc-face">
        <span class="tier-badge ${w.tier}">${w.tier}</span>${front}
        <div class="fc-meta">tap to reveal</div>
      </div>
      <div class="fc-face fc-back">
        ${back}${front}
        <div class="fc-meta">${esc(w.setTitle)} · NT freq ${w.freq ?? "?"}</div>
      </div>
    </div>${speakMarkup(w, "card-speak", dir === "e2g")}</div>
    ${hintMarkup(w)}
    <div class="grade-row" id="grades" style="visibility:hidden">
      <button class="btn g-again">Again</button>
      <button class="btn g-hard">Hard</button>
      <button class="btn g-good">Good</button>
      <button class="btn g-easy">Easy</button>
    </div>`;

  mountHint(w);
  mountSpeak();
  const fc = view.querySelector("#fc");
  const cardSpeak = view.querySelector(".card-speak");
  fc.onclick = () => {
    fc.classList.toggle("flipped");
    if (cardSpeak) cardSpeak.hidden = false;
    view.querySelector("#grades").style.visibility = "visible";
  };
  const gradeAndNext = q => {
    grade(w.id, q);
    session.queue.shift();
    if (q === 0) { session.queue.push(w); } // failed cards come back this session
    else session.done++;
    if (session.done >= session.total && session.queue.length === 0) {
      session = null;
      view.innerHTML = `<div class="card-panel" style="text-align:center">
        <h3>Session complete</h3>
        <button class="btn" id="home">Back to Home</button></div>`;
      view.querySelector("#home").onclick = () => show("home");
      return;
    }
    renderReview();
  };
  const passBtn = view.querySelector("#pass");
  if (passBtn) passBtn.onclick = () => {
    skipWord(w.id);
    session.queue.shift();
    session.done++;
    if (session.done >= session.total && session.queue.length === 0) { session = null; show("home"); return; }
    renderReview();
  };
  view.querySelector(".g-again").onclick = () => gradeAndNext(0);
  view.querySelector(".g-hard").onclick = () => gradeAndNext(3);
  view.querySelector(".g-good").onclick = () => gradeAndNext(4);
  view.querySelector(".g-easy").onclick = () => gradeAndNext(5);
}

// ---------------- FLASHCARDS ----------------
let deck = null, deckPos = 0;

function renderFlash() {
  if (!deck) { deck = shuffle(activeWords()); deckPos = 0; }
  if (deck.length === 0) {
    view.innerHTML = `<div class="card-panel"><p class="muted">No words match your filters — check Settings.</p></div>`;
    return;
  }
  const w = deck[deckPos % deck.length];
  const dir = pickDirection();
  const front = dir === "g2e" ? `<div class="fc-word greek">${esc(w.g)}</div>` : `<div class="fc-gloss">${esc(w.gloss)}</div>`;
  const back = dir === "g2e" ? `<div class="fc-gloss">${esc(w.gloss)}</div>` : `<div class="fc-word greek">${esc(w.g)}</div>`;

  view.innerHTML = `
    <div class="muted">Card ${deckPos % deck.length + 1} / ${deck.length}</div>
    <div class="flashcard-wrap"><div class="flashcard" id="fc">
      <div class="fc-face"><span class="tier-badge ${w.tier}">${w.tier}</span>${front}<div class="fc-meta">tap to flip</div></div>
      <div class="fc-face fc-back">${back}${front}<div class="fc-meta">${esc(w.setTitle)} · NT freq ${w.freq ?? "?"}</div></div>
    </div>${speakMarkup(w, "card-speak", dir === "e2g")}</div>
    ${hintMarkup(w)}
    <div class="grade-row">
      <button class="btn secondary" id="prev">← Prev</button>
      <button class="btn secondary" id="shuf">Shuffle</button>
      <button class="btn" id="next">Next →</button>
    </div>`;

  mountHint(w);
  mountSpeak();
  const flashSpeak = view.querySelector(".card-speak");
  view.querySelector("#fc").onclick = e => {
    e.currentTarget.classList.toggle("flipped");
    if (flashSpeak) flashSpeak.hidden = false;
  };
  view.querySelector("#next").onclick = () => { deckPos++; renderFlash(); };
  view.querySelector("#prev").onclick = () => { deckPos = (deckPos - 1 + deck.length) % deck.length; renderFlash(); };
  view.querySelector("#shuf").onclick = () => { deck = shuffle(deck); deckPos = 0; renderFlash(); };
}

// ---------------- QUIZ ----------------
let quiz = null;

function renderQuiz() {
  if (!quiz) {
    view.innerHTML = `
      <div class="card-panel">
        <h2>Quiz Setup</h2>
        <div class="pill-row" id="qtype">
          <button class="pill on" data-t="mc">Multiple choice</button>
          <button class="pill" data-t="type">Type the answer</button>
        </div>
        <label class="row"><span>Questions</span>
          <select id="qsize" style="width:auto">
            ${[5, 10, 20, 40].map(n => `<option ${n === settings.quizSize ? "selected" : ""}>${n}</option>`).join("")}
          </select></label>
        <button class="btn" id="start">Start Quiz</button>
      </div>`;
    let qt = "mc";
    view.querySelectorAll("#qtype .pill").forEach(p => p.onclick = () => {
      view.querySelectorAll("#qtype .pill").forEach(x => x.classList.remove("on"));
      p.classList.add("on"); qt = p.dataset.t;
    });
    view.querySelector("#start").onclick = () => {
      settings.quizSize = +view.querySelector("#qsize").value; saveSettings();
      const pool = shuffle(activeWords());
      quiz = { type: qt, items: pool.slice(0, settings.quizSize), pos: 0, right: 0, pool };
      renderQuiz();
    };
    return;
  }

  if (quiz.pos >= quiz.items.length) {
    const { right, items } = quiz;
    view.innerHTML = `<div class="card-panel" style="text-align:center">
      <h3>Score: ${right} / ${items.length} (${Math.round(right / items.length * 100)}%)</h3>
      <button class="btn" id="again">New Quiz</button>
      <button class="btn secondary" id="home">Home</button></div>`;
    view.querySelector("#again").onclick = () => { quiz = null; renderQuiz(); };
    view.querySelector("#home").onclick = () => { quiz = null; show("home"); };
    return;
  }

  const w = quiz.items[quiz.pos];
  const dir = pickDirection();
  const prompt = dir === "g2e"
    ? `<div class="fc-word greek" style="margin:14px 0">${esc(w.g)}</div>
       <div class="speak-inline">${speakMarkup(w)}</div>`
    : `<div class="fc-gloss" style="margin:14px 0">${esc(w.gloss)}</div>`;

  if (quiz.type === "mc") {
    const key = dir === "g2e" ? "gloss" : "g";
    const distractors = shuffle(quiz.pool.filter(x => x.id !== w.id)).slice(0, 3).map(x => x[key]);
    const choices = shuffle([w[key], ...distractors]);
    view.innerHTML = `
      <div class="muted">Question ${quiz.pos + 1} / ${quiz.items.length} · ${quiz.right} correct</div>
      <div class="card-panel" style="text-align:center">${prompt}</div>
      ${hintMarkup(w, false)}
      ${choices.map(c => `<button class="choice ${dir === "g2e" ? "" : "greek"}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}`;
    mountHint(w, false);
    mountSpeak();
    view.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
      const ok = btn.dataset.v === w[key];
      view.querySelectorAll(".choice").forEach(b => {
        b.disabled = true;
        if (b.dataset.v === w[key]) b.classList.add("correct");
      });
      if (!ok) btn.classList.add("wrong");
      if (ok) quiz.right++;
      grade(w.id, ok ? 4 : 0);
      setTimeout(() => {
        if (currentView !== "quiz" || !quiz) return; // user navigated away
        quiz.pos++; renderQuiz();
      }, ok ? 650 : 1600);
    });
  } else {
    view.innerHTML = `
      <div class="muted">Question ${quiz.pos + 1} / ${quiz.items.length} · ${quiz.right} correct</div>
      <div class="card-panel" style="text-align:center">${prompt}
        <p class="muted">${dir === "g2e" ? "Type an English meaning" : "Type the Greek word (accents optional)"}</p>
        <input type="text" id="ans" autocomplete="off" autocapitalize="off" class="${dir === "e2g" ? "greek" : ""}">
        <button class="btn" id="check">Check</button>
        <div id="fb"></div>
      </div>
      ${hintMarkup(w, false)}`;
    mountHint(w, false);
    mountSpeak();
    const input = view.querySelector("#ans");
    input.focus();
    const check = () => {
      const guess = norm(input.value);
      if (!guess) return;
      let ok;
      if (dir === "g2e") {
        // accept any comma-separated gloss keyword (ignoring leading "I ")
        ok = w.gloss.split(/[,;()]/).map(p => norm(p.replace(/^i /i, ""))).filter(Boolean)
          .some(p => guess === p || guess === "i " + p || p.includes(guess) && guess.length >= 3);
      } else {
        ok = guess === norm(headword(w.g));
      }
      if (ok) quiz.right++;
      grade(w.id, ok ? 4 : 0);
      view.querySelector("#fb").innerHTML = ok
        ? `<div class="feedback ok">✓ Correct — <span class="greek">${esc(w.g)}</span> = ${esc(w.gloss)} ${speakMarkup(w, "speak-sm")}</div>`
        : `<div class="feedback no">✗ Answer: <span class="greek">${esc(w.g)}</span> = ${esc(w.gloss)} ${speakMarkup(w, "speak-sm")}</div>`;
      mountSpeak();
      view.querySelector("#check").textContent = "Next →";
      view.querySelector("#check").onclick = () => { quiz.pos++; renderQuiz(); };
      input.onkeydown = e => { if (e.key === "Enter") { quiz.pos++; renderQuiz(); } };
    };
    view.querySelector("#check").onclick = check;
    input.onkeydown = e => { if (e.key === "Enter") check(); };
  }
}

// ---------------- BROWSE ----------------
function renderBrowse() {
  const words = activeWords();
  view.innerHTML = `
    <input type="text" id="search" placeholder="Search Greek or English… (accents optional)">
    <p class="muted" style="margin-top:8px">Tap any word to add a picture or note you\u2019ll see as a hint while studying.</p>
    <div class="pill-row" id="tierf">
      <button class="pill on" data-f="all">All</button>
      <button class="pill" data-f="memorize">Memorize</button>
      <button class="pill" data-f="recognize">Recognize</button>
      <button class="pill" data-f="new">Unseen</button>
      <button class="pill" data-f="known">Known</button>
    </div>
    <div id="list"></div>`;

  let filter = "all";
  const draw = () => {
    const q = norm(view.querySelector("#search").value || "");
    const rows = words.filter(w => {
      if (filter === "memorize" || filter === "recognize") { if (w.tier !== filter) return false; }
      else if (filter === "new" || filter === "known") { if (wordStatus(w.id) !== filter) return false; }
      if (q && !norm(w.g).includes(q) && !norm(w.gloss).includes(q)) return false;
      return true;
    });
    view.querySelector("#list").innerHTML =
      `<p class="muted" style="margin:8px 0">${rows.length} words</p>` +
      rows.map(w => `<button class="word-row" data-id="${esc(w.id)}">
        <span class="dot ${wordStatus(w.id)}"></span>
        <span class="g greek">${esc(w.g)}</span>
        <span class="e">${esc(w.gloss)} <span style="opacity:.6">(${w.freq ?? "?"})</span></span>
        <span class="hint-mark">${hasOwnHint(w.id) ? "\u25c9" : ""}</span>
      </button>`).join("");
    view.querySelectorAll(".word-row").forEach(row => row.onclick = () => {
      const w = words.find(x => x.id === row.dataset.id);
      if (w) openWordEditor(w);
    });
  };
  view.querySelector("#search").oninput = draw;
  view.querySelectorAll("#tierf .pill").forEach(p => p.onclick = () => {
    view.querySelectorAll("#tierf .pill").forEach(x => x.classList.remove("on"));
    p.classList.add("on"); filter = p.dataset.f; draw();
  });
  draw();
}

// ---------------- REDO DISLIKED MNEMONICS ----------------
// Claude cannot be called from inside the page, so the exchange is a prompt out
// and a paste back. The reply format is one word per line, which is easy for
// Claude to produce and unambiguous to parse.
function redoPrompt(words) {
  const scheme = settings.pron || "koine";
  return `I am learning New Testament Greek and these mnemonics are not working for me. ` +
    `Write me a better one for each word.\n\n` +
    `Rules:\n` +
    `- Base it on how the word SOUNDS: English words that reproduce those syllables.\n` +
    `- Keep the format: syllables, then \u2248 "ENGLISH-CHAIN", then a short image carrying the meaning.\n` +
    `- Use the ${scheme} sound values already given below.\n` +
    `- Vary your wording; do not reuse the same phrasing across entries.\n\n` +
    (settings.redoNote ? `What I want overall: ${settings.redoNote}\n\n` : "") +
    `Reply with ONE LINE PER WORD, in exactly this shape, and nothing else:\n` +
    `<greek word> :: <the new mnemonic>\n\n` +
    `Words:\n` +
    words.map(w =>
      `${headword(w.g)} \u2014 "${w.gloss}" \u2014 pronounced ${translit(headword(w.g), scheme)}` +
      `\n   current (rejected): ${hookText(w)}` +
      (wishOf(w.id) ? `\n   what I asked for: ${wishOf(w.id)}` : "")).join("\n");
}

// Parse "word :: mnemonic" lines back into hooks, matching accent-insensitively.
function applyRedo(text, words) {
  const applied = [], missed = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || !line.includes("::")) continue;
    const [lhs, ...rest] = line.split("::");
    const hook = rest.join("::").trim();
    if (!hook) continue;
    const key = norm(lhs.replace(/^[-*\d.\s]+/, ""));
    const w = words.find(x => norm(headword(x.g)) === key);
    if (w) applied.push({ w, hook }); else missed.push(lhs.trim());
  }
  return { applied, missed };
}

function renderRedo() {
  const words = dislikedWords();
  if (!words.length) {
    view.innerHTML = `<button class="btn secondary" id="back">\u2190 Back to Settings</button>
      <div class="card-panel" style="margin-top:14px">
        <h3>Nothing marked for replacement</h3>
        <p class="muted">Open a hint while studying and press \u25bd Replace on any mnemonic that is not
          working, and say what would work better. They collect here, and you can have Claude
          rewrite the whole batch at once.
          Ones you press \u25b3 Keep on, and ones you never touch, are left alone.</p>
      </div>`;
    view.querySelector("#back").onclick = () => show("settings");
    return;
  }

  view.innerHTML = `
    <button class="btn secondary" id="back">\u2190 Back to Settings</button>
    <div class="card-panel" style="margin-top:14px">
      <h2>${words.length} marked for replacement</h2>
      ${words.map(w => `<div class="redo-item">
          <div class="ex-row">
            <span class="greek">${esc(headword(w.g))}</span>
            <span class="muted">${esc(w.gloss)}</span>
          </div>
          <p class="redo-current">
            <span class="redo-tag">${hookIsMine(w) ? "your version" : "built in"}</span>
            ${esc(hookText(w)) || "<em>no mnemonic yet</em>"}
          </p>
          <textarea class="hook-input wish-inline" data-wish="${esc(w.id)}" rows="2"
            placeholder="What would work better for this one? (optional)">${esc(wishOf(w.id))}</textarea>
          <button class="btn secondary btn-inline" data-unmark="${esc(w.id)}">Keep this one after all</button>
        </div>`).join("")}
      <label class="tool-label" for="batch-note" style="margin-top:14px">One instruction for the whole batch</label>
      <textarea id="batch-note" class="hook-input" rows="2"
        placeholder="e.g. keep them short, or lean on sports and food">${esc(settings.redoNote || "")}</textarea>
      <button class="btn" id="copy">Copy the prompt for Claude</button>
      <div id="copy-fb"></div>
    </div>
    <div class="card-panel">
      <h2>Paste Claude's reply</h2>
      <p class="muted">One line per word, as <code>word :: mnemonic</code>. Anything it does not
        cover is left as it is.</p>
      <textarea id="reply" class="hook-input" rows="6" placeholder="\u1F00\u03B3\u03C1\u03CC\u03C2 :: ah-GHROS \u2248 \u2026"></textarea>
      <button class="btn" id="apply">Apply the replacements</button>
      <div id="apply-fb"></div>
    </div>`;

  view.querySelector("#back").onclick = () => show("settings");
  view.querySelectorAll("[data-wish]").forEach(t =>
    t.onchange = () => setWish(t.dataset.wish, t.value));
  view.querySelectorAll("[data-unmark]").forEach(btn => btn.onclick = async () => {
    await setHookVote(btn.dataset.unmark, -1);   // toggles the -1 back off
    renderRedo();
  });
  const batch = view.querySelector("#batch-note");
  batch.onchange = () => { settings.redoNote = batch.value.trim() || undefined; saveSettings(); };
  view.querySelector("#copy").onclick = async () => {
    const text = redoPrompt(words);
    const fb = view.querySelector("#copy-fb");
    try {
      await navigator.clipboard.writeText(text);
      fb.innerHTML = `<div class="feedback ok">Copied. Paste it into Claude, then bring the reply back below.</div>`;
    } catch {
      fb.innerHTML = `<textarea class="hook-input" rows="6" readonly>${esc(text)}</textarea>`;
    }
  };
  view.querySelector("#apply").onclick = async () => {
    const { applied, missed } = applyRedo(view.querySelector("#reply").value, words);
    const fb = view.querySelector("#apply-fb");
    if (!applied.length) {
      fb.innerHTML = `<div class="feedback no">No lines matched. Each line needs to be
        <code>word :: mnemonic</code> with the Greek word on the left.</div>`;
      return;
    }
    for (const { w, hook } of applied) {
      const h = hints[w.id] || {};
      // fresh hook: verdict and the suggestion that produced it are both spent
      await putHint(w.id, { buf: h.buf, type: h.type, mn: hook, vote: 0 });
    }
    fb.innerHTML = `<div class="feedback ok">Replaced ${applied.length}
      ${applied.length === 1 ? "mnemonic" : "mnemonics"}.${
      missed.length ? ` Could not match: ${esc(missed.join(", "))}.` : ""}</div>`;
    setTimeout(renderRedo, 900);
  };
}

// ---------------- WORD EDITOR (attach a hint) ----------------
function openWordEditor(w) {
  const h = hints[w.id] || {};
  const url = hintUrl(w.id);
  view.innerHTML = `
    <button class="btn secondary" id="back">\u2190 Back to word list</button>
    <div class="card-panel" style="text-align:center;margin-top:14px">
      <span class="tier-badge ${w.tier}">${w.tier}</span>
      <div class="fc-word greek" style="margin:10px 0">${esc(w.g)}</div>
      <div class="fc-gloss">${esc(w.gloss)}</div>
      <div class="speak-inline">${speakMarkup(w)}</div>
      <div class="fc-meta" style="margin-top:8px">${esc(w.setTitle)} \u00b7 NT freq ${w.freq ?? "?"}</div>
    </div>
    <div class="card-panel">
      <h2>Memory hint</h2>
      <p class="muted">A picture and a phrase that help the word stick. Both stay hidden while you study until you tap \u201cShow hint\u201d. The hook starts as the one built in \u2014 rewrite it however you like.</p>
      <div id="hint-preview">${url ? `<img class="hint-img" alt="Current hint for ${esc(w.g)}" src="${url}">` : ""}</div>
      <input type="file" id="pic" accept="image/*" hidden>
      <button class="btn secondary" id="pick">${url ? "Replace picture" : "Add a picture"}</button>
      <label class="tool-label" for="note">Memory hook</label>
      <textarea id="note" class="hook-input" rows="3" placeholder="Sounds like\u2026">${esc(hookText(w))}</textarea>
      <button class="btn" id="save">Save hint</button>
      ${hookIsMine(w) && w.mn ? `<button class="btn secondary" id="reset-hook">Restore the original hook</button>` : ""}
      ${hasHint(w.id) ? `<button class="btn secondary" id="clear" style="color:var(--bad)">Remove hint</button>` : ""}
      <div id="hint-fb"></div>
    </div>`;

  mountSpeak();
  let pendingBlob = null;
  const fb = view.querySelector("#hint-fb");
  const fileInput = view.querySelector("#pic");

  view.querySelector("#back").onclick = () => show("browse");
  view.querySelector("#pick").onclick = () => fileInput.click();

  fileInput.onchange = async () => {
    const f = fileInput.files[0];
    if (!f) return;
    fb.innerHTML = `<p class="muted" style="margin-top:10px">Preparing picture\u2026</p>`;
    try {
      pendingBlob = await shrinkImage(f);
      const preview = URL.createObjectURL(pendingBlob);
      view.querySelector("#hint-preview").innerHTML =
        `<img class="hint-img" alt="Picture you just chose" src="${preview}">`;
      view.querySelector("#pick").textContent = "Replace picture";
      fb.innerHTML = `<div class="feedback ok">Picture ready \u2014 press Save hint to keep it.</div>`;
    } catch (e) {
      fb.innerHTML = `<div class="feedback no">${esc(e.message)}</div>`;
    }
  };

  view.querySelector("#save").onclick = async () => {
    const text = view.querySelector("#note").value.trim();
    const existing = hints[w.id] || {};
    const buf = pendingBlob ? await pendingBlob.arrayBuffer() : existing.buf || null;
    const type = pendingBlob ? pendingBlob.type : existing.type;
    if (!buf && !text) {
      fb.innerHTML = `<div class="feedback no">Add a picture or a hook first.</div>`;
      return;
    }
    // Saving text identical to the built-in leaves the word on the original.
    const mn = text && text !== w.mn ? text : undefined;
    try {
      await putHint(w.id, { buf, type, mn });
      fb.innerHTML = `<div class="feedback ok">Hint saved.</div>`;
    } catch {
      fb.innerHTML = `<div class="feedback no">Could not save \u2014 this device may be out of storage.</div>`;
    }
  };

  const resetBtn = view.querySelector("#reset-hook");
  if (resetBtn) resetBtn.onclick = async () => {
    const h = hints[w.id] || {};
    if (!h.buf) await removeHint(w.id);
    else await putHint(w.id, { buf: h.buf, type: h.type });
    openWordEditor(w);
  };

  const clearBtn = view.querySelector("#clear");
  if (clearBtn) clearBtn.onclick = async () => {
    await removeHint(w.id);
    openWordEditor(w);
  };
}

// ---------------- SETTINGS ----------------
function applyBackup(d) {
  if (!d || typeof d !== "object") throw new Error("not a backup file");
  if (d.progress) { progress = d.progress; saveProgress(); }
  if (d.settings) { settings = d.settings; saveSettings(); }
  if (d.customSets) { customSets = d.customSets; store.save(LS_CUSTOM, customSets); }
  deck = null; session = null; quiz = null;
}

function renderSettings() {
  view.innerHTML = `
    <div class="card-panel">
      <h2>Study Direction</h2>
      <div class="pill-row" id="dir">
        <button class="pill ${settings.direction === "g2e" ? "on" : ""}" data-d="g2e">Greek → English</button>
        <button class="pill ${settings.direction === "e2g" ? "on" : ""}" data-d="e2g">English → Greek</button>
        <button class="pill ${settings.direction === "mixed" ? "on" : ""}" data-d="mixed">Mixed</button>
      </div>
    </div>
    <div class="card-panel">
      <h2>Pronunciation</h2>
      <div class="pill-row" id="pron">
        <button class="pill ${(settings.pron || "koine") === "koine" ? "on" : ""}" data-p="koine">Koine (1st c.)</button>
        <button class="pill ${settings.pron === "erasmian" ? "on" : ""}" data-p="erasmian">Erasmian</button>
        <button class="pill ${settings.pron === "modern" ? "on" : ""}" data-p="modern">Modern Greek</button>
      </div>
      <p class="muted" id="pron-about"></p>
      <p class="muted" id="voice-note"></p>
      <p class="muted" style="margin-top:8px">Sample: <span class="greek">ἀπαγγέλλω</span> \u2192 <span id="pron-sample"></span></p>
      <button class="btn small secondary" id="pron-try">Hear the sample</button>
    </div>
    <div class="card-panel">
      <h2>Mnemonics</h2>
      <p class="muted">Press \u25b3 Keep or \u25bd Replace on any hint while studying. Ones marked
        Replace collect here so Claude can rewrite them in one go.</p>
      <button class="btn secondary" id="go-redo">Replace the ones I disliked (${dislikedWords().length})</button>
    </div>
    <div class="card-panel">
      <h2>Word Tiers</h2>
      ${tierModeMarkup()}
      <p class="muted">Also on the Home screen, so you can switch before a session.</p>
    </div>
    <div class="card-panel">
      <h2>Add a Vocabulary Set</h2>
      <p class="muted">Paste JSON: {"id":"my-set","title":"…","words":[{"g":"λόγος, ὁ","gloss":"word","freq":330,"tier":"memorize"}]}</p>
      <textarea id="paste" placeholder="Paste set JSON here"></textarea>
      <button class="btn small secondary" id="add-set">Add Set</button>
      <div id="add-fb"></div>
    </div>
    <div class="card-panel">
      <h2>Backup</h2>
      <button class="btn small secondary" id="export">Export progress &amp; custom sets</button>
      <button class="btn small secondary" id="import">Import backup from file</button>
      <button class="btn small secondary" id="import-paste">Import backup from pasted text</button>
      <div id="backup-out"></div>
      <button class="btn small secondary" id="reset" style="color:var(--bad)">Reset all progress</button>
      <p class="muted" style="margin-top:10px">Backups carry your progress, settings and custom sets. Hint pictures stay on this device \u2014 they are too large for a pasted backup, so add them again if you move to a new phone.</p>
    </div>`;

  const voiceNote = view.querySelector("#voice-note");
  const sampleEl = view.querySelector("#pron-sample");
  const ABOUT = {
    koine: "Reconstructed first-century pronunciation \u2014 how the New Testament most likely sounded. β says v and δ says th (as in \"the\"), so διακονία is \"thee-ah-ko-NEE-ah\" even though our DEACON keeps the older d. αι sounds like ε, and ει like ι.",
    erasmian: "The classroom convention used in most seminaries. Not historical, but it keeps every letter distinct, which helps with spelling.",
    modern: "Greek as spoken today. Uses a real Greek voice when your device has one installed."
  };
  const describe = () => {
    view.querySelector("#pron-about").textContent = ABOUT[settings.pron || "koine"];
    if (!speechReady()) {
      voiceNote.textContent = "This browser has no speech support, so the speaker buttons are hidden.";
      sampleEl.textContent = "\u2014";
      return;
    }
    const plan = speechPlan("\u1F00\u03C0\u03B1\u03B3\u03B3\u03AD\u03BB\u03BB\u03C9");
    sampleEl.textContent = plan.text;
    voiceNote.textContent = plan.voice
      ? `Read as real Greek by the voice \u201c${plan.voice.name}\u201d.`
      : "Your device has no Greek voice, so each word is respelled phonetically and read by your normal voice. That is also the only way to get Erasmian, which no voice supports.";
  };
  describe();

  view.querySelectorAll("#pron .pill").forEach(p => p.onclick = () => {
    settings.pron = p.dataset.p;
    saveSettings();
    renderSettings();
  });
  view.querySelector("#pron-try").onclick = () =>
    speakGreek("\u1F00\u03C0\u03B1\u03B3\u03B3\u03AD\u03BB\u03BB\u03C9");

  view.querySelectorAll("#dir .pill").forEach(p => p.onclick = () => {
    settings.direction = p.dataset.d; saveSettings(); renderSettings();
  });
  mountTierMode(renderSettings);
  view.querySelector("#go-redo").onclick = () => show("redo");

  view.querySelector("#add-set").onclick = () => {
    const fb = view.querySelector("#add-fb");
    try {
      const set = JSON.parse(view.querySelector("#paste").value);
      if (!set.id || !set.title || !Array.isArray(set.words)) throw new Error("Needs id, title, words[]");
      customSets = customSets.filter(s => s.id !== set.id).concat([set]);
      store.save(LS_CUSTOM, customSets);
      deck = null;
      fb.innerHTML = `<div class="feedback ok">Added "${esc(set.title)}" (${set.words.length} words)</div>`;
    } catch (e) {
      fb.innerHTML = `<div class="feedback no">Invalid JSON: ${esc(e.message)}</div>`;
    }
  };

  view.querySelector("#export").onclick = () => {
    const json = JSON.stringify({ progress, settings, customSets }, null, 2);
    // Save a file where downloads are allowed (installed app / browser tab)...
    try {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      a.download = "greek-vocab-backup.json";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* downloads blocked — the copyable text below is the fallback */ }
    // ...and always show it as copyable text, so a backup is reachable anywhere.
    navigator.clipboard?.writeText(json).catch(() => {});
    const out = view.querySelector("#backup-out");
    out.innerHTML = `<p class="muted" style="margin-top:10px">Copied to your clipboard. Save this text somewhere safe \u2014 paste it back with Import.</p>
      <textarea readonly id="backup-json"></textarea>`;
    const ta = out.querySelector("#backup-json");
    ta.value = json;
    ta.focus(); ta.select();
  };
  view.querySelector("#import").onclick = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      f.text().then(t => {
        applyBackup(JSON.parse(t));
        show("home");
      }).catch(() => alert("Could not read that file."));
    };
    inp.click();
  };
  view.querySelector("#import-paste").onclick = () => {
    const out = view.querySelector("#backup-out");
    out.innerHTML = `<p class="muted" style="margin-top:10px">Paste a backup below, then press Restore.</p>
      <textarea id="restore-json" placeholder="Paste backup JSON"></textarea>
      <button class="btn small" id="restore-go">Restore</button><div id="restore-fb"></div>`;
    out.querySelector("#restore-go").onclick = () => {
      try {
        applyBackup(JSON.parse(out.querySelector("#restore-json").value));
        show("home");
      } catch (e) {
        out.querySelector("#restore-fb").innerHTML =
          `<div class="feedback no">Could not read that backup: ${esc(e.message)}</div>`;
      }
    };
  };

  view.querySelector("#reset").onclick = () => {
    if (confirm("Erase ALL study progress? This cannot be undone.")) {
      progress = {}; saveProgress(); show("home");
    }
  };
}

// ---------------- boot ----------------
loadHints().then(() => show("home"));
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
