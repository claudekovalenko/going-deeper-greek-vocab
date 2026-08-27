"use strict";

const view = document.getElementById("view");
let currentView = "learn";
const byId = id => CONCEPTS.find(c => c.id === id);
const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const shuffle = a => { a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a; };

function show(name) {
  currentView = name;
  document.querySelectorAll("#tabbar .tab").forEach(t => t.classList.toggle("active", t.dataset.view === name));
  ({ learn: renderLearn, rule: renderRule, identify: renderIdentify, compare: renderCompare }[name])();
  window.scrollTo(0, 0);
}
document.querySelectorAll("#tabbar .tab").forEach(t => t.onclick = () => show(t.dataset.view));

// ---------------- LEARN ----------------
let openId = null, learnFilter = "All";

function conceptBody(c) {
  return `<div class="c-body">
    <p class="c-def">${esc(c.def)}</p>
    <div class="c-tell"><b>How to spot it</b>${esc(c.tell)}</div>
    ${c.examples.map(e => `<div class="ex">
        ${e.gk ? `<div class="ex-gk greek">${esc(e.gk)}</div>` : ""}
        <div class="ex-t">${esc(e.t)}</div>
        ${e.n ? `<div class="ex-n">${esc(e.n)}</div>` : ""}
      </div>`).join("")}
  </div>`;
}

function renderLearn() {
  const cases = ["All", "Nominative", "Accusative"];
  const list = CONCEPTS.filter(c => learnFilter === "All" || c.case === learnFilter);
  const groups = [];
  for (const c of list) {
    const key = c.case + " · " + c.group;
    let g = groups.find(x => x.key === key);
    if (!g) groups.push(g = { key, items: [] });
    g.items.push(c);
  }

  view.innerHTML = `
    <div class="pill-row">
      ${cases.map(k => `<button class="pill ${k === learnFilter ? "on" : ""}" data-f="${k}">${k}</button>`).join("")}
    </div>
    <p class="muted" style="margin-bottom:16px">Tap a use to open its definition, the test for spotting it, and its examples.</p>
    ${groups.map(g => `<h2>${esc(g.key)}</h2>
      ${g.items.map(c => `
        <button class="panel ${c.case === "Accusative" ? "accus" : ""}" data-id="${c.id}">
          <span class="c-head">
            <span class="c-name">${esc(c.name)}</span>
            <span class="c-tag">${esc(c.tag)}</span>
          </span>
          ${openId === c.id ? conceptBody(c) : ""}
        </button>`).join("")}`).join("")}`;

  view.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { learnFilter = b.dataset.f; openId = null; renderLearn(); });
  view.querySelectorAll("[data-id]").forEach(b => b.onclick = () => {
    openId = openId === b.dataset.id ? null : b.dataset.id;
    renderLearn();
  });
}

// ---------------- THE RULE ----------------
function renderRule() {
  const p = PECKING_ORDER;
  view.innerHTML = `
    <div class="panel">
      <h3>${esc(p.title)}</h3>
      <p class="muted" style="margin:8px 0 4px">${esc(p.intro)}</p>
      <div class="steps">
        ${p.steps.map(s => `<div class="step">
          <span class="step-n">${esc(s.n)}</span>
          <span><span class="step-l">${esc(s.label)}</span><br>
          <span class="step-b">${esc(s.body)}</span></span>
        </div>`).join("")}
      </div>
    </div>
    <div class="panel accus">
      <h2 style="margin-top:0">Worked example</h2>
      <p class="c-def greek" style="font-size:1.15rem">${esc(p.application.ref)}</p>
      <p style="margin-top:10px;font-size:.95rem;line-height:1.55">${esc(p.application.body)}</p>
      <div class="caution">${esc(p.application.caution)}</div>
    </div>`;
}

// ---------------- IDENTIFY ----------------
let quiz = null;

function renderIdentify() {
  if (!quiz) {
    view.innerHTML = `
      <div class="panel">
        <h3>Name the use</h3>
        <p class="muted" style="margin-top:8px">You get a phrase; you pick which use it is. This is the skill the exam
          actually tests — recognising a use in the wild, not reciting its definition.</p>
        <button class="btn" id="go">Start — ${IDENTIFY.length} phrases</button>
      </div>`;
    view.querySelector("#go").onclick = () => {
      quiz = { items: shuffle(IDENTIFY), pos: 0, right: 0, wrong: [] };
      renderIdentify();
    };
    return;
  }

  if (quiz.pos >= quiz.items.length) {
    const { right, items, wrong } = quiz;
    view.innerHTML = `
      <div class="panel">
        <h3>${right} of ${items.length}</h3>
        <p class="muted" style="margin-top:6px">${Math.round(right / items.length * 100)}% named correctly.</p>
        ${wrong.length ? `<h2>Worth another look</h2>
          ${wrong.map(w => `<div class="ex">
            <div class="ex-t">${esc(w.q)}</div>
            <div class="ex-n">${esc(byId(w.a).name)} — ${esc(w.why)}</div>
          </div>`).join("")}` : `<p style="margin-top:10px">Nothing missed.</p>`}
        <button class="btn" id="again">Run it again</button>
        <button class="btn secondary" id="back">Back to Learn</button>
      </div>`;
    view.querySelector("#again").onclick = () => { quiz = null; renderIdentify(); };
    view.querySelector("#back").onclick = () => { quiz = null; show("learn"); };
    return;
  }

  const item = quiz.items[quiz.pos];
  const answer = byId(item.a);
  // Distractors come from the same case, where the real confusion lives.
  const pool = CONCEPTS.filter(c => c.case === answer.case && c.id !== answer.id);
  const choices = shuffle([answer, ...shuffle(pool).slice(0, 3)]);
  const pct = Math.round(quiz.pos / quiz.items.length * 100);

  view.innerHTML = `
    <div class="score">Phrase ${quiz.pos + 1} of ${quiz.items.length} · ${quiz.right} correct</div>
    <div class="progress-line"><div style="width:${pct}%"></div></div>
    <div class="panel"><div class="q-prompt">${esc(item.q)}</div></div>
    <div id="choices">
      ${choices.map(c => `<button class="choice" data-id="${c.id}">${esc(c.name)}
        <small>${esc(c.tag)}</small></button>`).join("")}
    </div>
    <div id="verdict"></div>`;

  view.querySelectorAll(".choice").forEach(btn => btn.onclick = () => {
    const ok = btn.dataset.id === answer.id;
    view.querySelectorAll(".choice").forEach(b => {
      b.disabled = true;
      if (b.dataset.id === answer.id) b.classList.add("correct");
    });
    if (!ok) { btn.classList.add("wrong"); quiz.wrong.push(item); } else quiz.right++;
    view.querySelector("#verdict").innerHTML = `
      <div class="verdict ${ok ? "ok" : "no"}">${ok ? "Yes — " : `It is ${esc(answer.name)}. `}${esc(item.why)}</div>
      <button class="btn" id="next">${quiz.pos + 1 < quiz.items.length ? "Next phrase" : "See the score"}</button>`;
    view.querySelector("#next").onclick = () => { quiz.pos++; renderIdentify(); };
  });
}

// ---------------- COMPARE ----------------
function renderCompare() {
  view.innerHTML = `
    <p class="muted" style="margin-bottom:16px">The pairs that actually get mixed up, and the one question that separates each.</p>
    ${CONTRASTS.map(x => {
      const a = byId(x.a), b = byId(x.b);
      return `<div class="panel">
        <div class="vs-key">${esc(x.key)}</div>
        <div class="vs">
          <div class="vs-col"><div class="vs-name">${esc(a.name)}</div><div class="vs-b">${esc(x.left)}</div></div>
          <div class="vs-col"><div class="vs-name">${esc(b.name)}</div><div class="vs-b">${esc(x.right)}</div></div>
        </div>
      </div>`;
    }).join("")}`;
}

show("learn");
