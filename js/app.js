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
  quizSize: 10
});
let customSets = store.load(LS_CUSTOM, []);

function saveProgress() { store.save(LS_PROGRESS, progress); }
function saveSettings() { store.save(LS_SETTINGS, settings); }

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
     quiz: renderQuiz, browse: renderBrowse, settings: renderSettings }[name])();
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
      <h2>Today</h2>
      <div class="stat-row">
        <div class="stat"><div class="num">${due}</div><div class="lbl">Due</div></div>
        <div class="stat"><div class="num">${nw}</div><div class="lbl">New</div></div>
        <div class="stat"><div class="num">${learning}</div><div class="lbl">Learning</div></div>
        <div class="stat"><div class="num">${known}</div><div class="lbl">Known</div></div>
      </div>
      <button class="btn" id="go-review">${due + Math.min(nw, 10) > 0 ? "Start Review Session" : "All caught up 🎉"}</button>
    </div>
    <div class="card-panel">
      <h2>Study Modes</h2>
      <button class="btn secondary" id="go-flash">🃏 Flashcards — flip through the deck</button>
      <button class="btn secondary" id="go-quiz">✅ Quiz — multiple choice & typing</button>
      <button class="btn secondary" id="go-browse">📚 Word List — browse & search</button>
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
      <h3>🎉 Nothing due right now</h3>
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

  view.innerHTML = `
    <div class="muted">Review ${session.done + 1} / ${session.total}</div>
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
    </div></div>
    <div class="grade-row" id="grades" style="visibility:hidden">
      <button class="btn g-again">Again</button>
      <button class="btn g-hard">Hard</button>
      <button class="btn g-good">Good</button>
      <button class="btn g-easy">Easy</button>
    </div>`;

  const fc = view.querySelector("#fc");
  fc.onclick = () => {
    fc.classList.toggle("flipped");
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
        <h3>✅ Session complete!</h3>
        <button class="btn" id="home">Back to Home</button></div>`;
      view.querySelector("#home").onclick = () => show("home");
      return;
    }
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
    </div></div>
    <div class="grade-row">
      <button class="btn secondary" id="prev">← Prev</button>
      <button class="btn secondary" id="shuf">🔀 Shuffle</button>
      <button class="btn" id="next">Next →</button>
    </div>`;

  view.querySelector("#fc").onclick = e => e.currentTarget.classList.toggle("flipped");
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
    ? `<div class="fc-word greek" style="margin:14px 0">${esc(w.g)}</div>`
    : `<div class="fc-gloss" style="margin:14px 0">${esc(w.gloss)}</div>`;

  if (quiz.type === "mc") {
    const key = dir === "g2e" ? "gloss" : "g";
    const distractors = shuffle(quiz.pool.filter(x => x.id !== w.id)).slice(0, 3).map(x => x[key]);
    const choices = shuffle([w[key], ...distractors]);
    view.innerHTML = `
      <div class="muted">Question ${quiz.pos + 1} / ${quiz.items.length} · ${quiz.right} correct</div>
      <div class="card-panel" style="text-align:center">${prompt}</div>
      ${choices.map(c => `<button class="choice ${dir === "g2e" ? "" : "greek"}" data-v="${esc(c)}">${esc(c)}</button>`).join("")}`;
    view.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
      const ok = btn.dataset.v === w[key];
      view.querySelectorAll(".choice").forEach(b => {
        b.disabled = true;
        if (b.dataset.v === w[key]) b.classList.add("correct");
      });
      if (!ok) btn.classList.add("wrong");
      if (ok) quiz.right++;
      grade(w.id, ok ? 4 : 0);
      setTimeout(() => { quiz.pos++; renderQuiz(); }, ok ? 650 : 1600);
    });
  } else {
    view.innerHTML = `
      <div class="muted">Question ${quiz.pos + 1} / ${quiz.items.length} · ${quiz.right} correct</div>
      <div class="card-panel" style="text-align:center">${prompt}
        <p class="muted">${dir === "g2e" ? "Type an English meaning" : "Type the Greek word (accents optional)"}</p>
        <input type="text" id="ans" autocomplete="off" autocapitalize="off" class="${dir === "e2g" ? "greek" : ""}">
        <button class="btn" id="check">Check</button>
        <div id="fb"></div>
      </div>`;
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
        ? `<div class="feedback ok">✓ Correct — <span class="greek">${esc(w.g)}</span> = ${esc(w.gloss)}</div>`
        : `<div class="feedback no">✗ Answer: <span class="greek">${esc(w.g)}</span> = ${esc(w.gloss)}</div>`;
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
      rows.map(w => `<div class="word-row">
        <span class="dot ${wordStatus(w.id)}"></span>
        <span class="g greek">${esc(w.g)}</span>
        <span class="e">${esc(w.gloss)} <span style="opacity:.6">(${w.freq ?? "?"})</span></span>
      </div>`).join("");
  };
  view.querySelector("#search").oninput = draw;
  view.querySelectorAll("#tierf .pill").forEach(p => p.onclick = () => {
    view.querySelectorAll("#tierf .pill").forEach(x => x.classList.remove("on"));
    p.classList.add("on"); filter = p.dataset.f; draw();
  });
  draw();
}

// ---------------- SETTINGS ----------------
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
      <h2>Word Tiers</h2>
      <label class="row"><span>Vocabulary to Memorize</span><input type="checkbox" id="t-mem" ${settings.tiers.memorize ? "checked" : ""}></label>
      <label class="row"><span>Vocabulary to Recognize</span><input type="checkbox" id="t-rec" ${settings.tiers.recognize ? "checked" : ""}></label>
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
      <button class="btn small secondary" id="export">⬇ Export progress & custom sets</button>
      <button class="btn small secondary" id="import">⬆ Import backup</button>
      <button class="btn small secondary" id="reset" style="color:var(--bad)">Reset all progress</button>
    </div>`;

  view.querySelectorAll("#dir .pill").forEach(p => p.onclick = () => {
    settings.direction = p.dataset.d; saveSettings(); renderSettings();
  });
  view.querySelector("#t-mem").onchange = e => { settings.tiers.memorize = e.target.checked; saveSettings(); };
  view.querySelector("#t-rec").onchange = e => { settings.tiers.recognize = e.target.checked; saveSettings(); };

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
    const blob = new Blob([JSON.stringify({ progress, settings, customSets }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "greek-vocab-backup.json";
    a.click();
  };
  view.querySelector("#import").onclick = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,application/json";
    inp.onchange = () => {
      const f = inp.files[0]; if (!f) return;
      f.text().then(t => {
        const d = JSON.parse(t);
        if (d.progress) { progress = d.progress; saveProgress(); }
        if (d.settings) { settings = d.settings; saveSettings(); }
        if (d.customSets) { customSets = d.customSets; store.save(LS_CUSTOM, customSets); }
        alert("Backup imported.");
        show("home");
      }).catch(() => alert("Could not read that file."));
    };
    inp.click();
  };
  view.querySelector("#reset").onclick = () => {
    if (confirm("Erase ALL study progress? This cannot be undone.")) {
      progress = {}; saveProgress(); show("home");
    }
  };
}

// ---------------- boot ----------------
show("home");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
