// Shared localStorage helpers used by every page.

// If the browser restores this page from its back/forward cache (a frozen
// snapshot from before the latest update), force a fresh load instead of
// running stale JavaScript.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

// Registered relative to this page's own URL, so it resolves correctly
// whether the app is hosted at a domain root or a GitHub Pages subfolder.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js");
  });
}

const SESSIONS_KEY = "golfSessions";
const DRAFT_KEY = "golfDraftSession";
const SET_NAMES_KEY = "golfSetNames";
const SAVED_SESSIONS_KEY = "golfSavedSessions";
const CUSTOM_FOCUS_AREAS_KEY = "golfCustomFocusAreas";
const SWING_THOUGHTS_KEY = "golfSwingThoughts";
const SKILL_GAMES_KEY = "golfSkillGames";
const SKILL_ATTEMPTS_KEY = "golfSkillAttempts";
const SKILL_DRAFT_KEY = "golfSkillDraft";
const MAX_SET_NAMES = 8;

const BUILT_IN_FOCUS_AREAS = [
  "Backswing path",
  "Downswing path",
  "Swing length",
  "Club release",
  "Hinging",
  "Rotation backswing",
  "Pushing up downswing",
];

function getSessions() {
  const raw = localStorage.getItem(SESSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

function getDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

function getSavedSessions() {
  const raw = localStorage.getItem(SAVED_SESSIONS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSavedSessions(savedSessions) {
  localStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(savedSessions));
}

function getSetNames() {
  const raw = localStorage.getItem(SET_NAMES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function rememberSetName(name) {
  const names = getSetNames().filter((n) => n.toLowerCase() !== name.toLowerCase());
  names.unshift(name);
  localStorage.setItem(SET_NAMES_KEY, JSON.stringify(names.slice(0, MAX_SET_NAMES)));
}

function getCustomFocusAreas() {
  const raw = localStorage.getItem(CUSTOM_FOCUS_AREAS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function addCustomFocusArea(name) {
  const existing = allFocusAreas();
  if (existing.some((f) => f.toLowerCase() === name.toLowerCase())) return;
  const custom = getCustomFocusAreas();
  custom.push(name);
  localStorage.setItem(CUSTOM_FOCUS_AREAS_KEY, JSON.stringify(custom));
}

function allFocusAreas() {
  return [...BUILT_IN_FOCUS_AREAS, ...getCustomFocusAreas()];
}

// A 5-point scale slider (Commitment to Drills, Strike Quality). `selected`
// may be null (nothing chosen yet) — the thumb sits at the midpoint but
// stays muted until the user drags it, so "not yet rated" stays distinct
// from "rated 3". The input element is built once and updated in place on
// re-render (rather than recreated) so an in-progress drag isn't cancelled
// by the "input" event it fires triggering its own re-render.
function renderRatingSlider(container, selected, onSelect) {
  let input = container.querySelector(".slider-input");
  let valueEl = container.querySelector(".rating-slider-value");

  if (!input) {
    container.innerHTML = "";

    valueEl = document.createElement("div");
    valueEl.className = "rating-slider-value";
    container.appendChild(valueEl);

    input = document.createElement("input");
    input.type = "range";
    input.min = "1";
    input.max = "5";
    input.step = "1";
    input.className = "slider-input";
    container.appendChild(input);

    const ticks = document.createElement("div");
    ticks.className = "slider-ticks";
    for (let i = 0; i < 5; i++) ticks.appendChild(document.createElement("span"));
    container.appendChild(ticks);

    input.addEventListener("input", () => {
      onSelect(Number(input.value));
    });
  }

  const value = selected == null ? 3 : selected;
  input.value = value;
  input.style.setProperty("--slider-percent", ((value - 1) / 4) * 100 + "%");
  valueEl.textContent = selected == null ? "–" : selected;
  container.classList.toggle("untouched", selected == null);
}

const MAX_SESSION_FOCUSES = 3;

function renderFocusAreaPicker(container, selectedFocuses, onToggle) {
  container.innerHTML = "";
  const atMax = selectedFocuses.length >= MAX_SESSION_FOCUSES;
  allFocusAreas().forEach((area) => {
    const isSelected = selectedFocuses.includes(area);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "club-btn" + (isSelected ? " selected" : "");
    btn.disabled = !isSelected && atMax;
    btn.textContent = area;
    btn.addEventListener("click", () => onToggle(area));
    container.appendChild(btn);
  });
}

function normalizeFocusList(focus) {
  if (Array.isArray(focus)) return focus;
  return focus ? [focus] : [];
}

function formatFocusList(focus) {
  const list = normalizeFocusList(focus);
  return list.length ? list.join(", ") : "No focus set";
}

const CLUBS = ["58", "54", "50", "PW", "9i", "8i", "7i", "6i", "5i", "4h", "5w", "Dr"];

function renderClubPicker(container, selectedClub, onSelect) {
  container.innerHTML = "";
  const options = ["No Club", ...CLUBS];
  options.forEach((label) => {
    const value = label === "No Club" ? "" : label;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "club-btn" + (value === selectedClub ? " selected" : "");
    btn.textContent = label;
    btn.addEventListener("click", () => onSelect(value));
    container.appendChild(btn);
  });
}

function ballsAndClubLabel(set) {
  return set.club ? `${set.balls} balls · ${escapeHtml(set.club)}` : `${set.balls} balls`;
}

function formatBallFlight(ballFlight) {
  if (!ballFlight) return "Not recorded";
  const tags = Object.values(ballFlight).filter(Boolean);
  return tags.length ? tags.join(", ") : "Not recorded";
}

// ==========================================================================
// Swing Thoughts library — a personal record of what the user has tried in
// practice and whether it worked, independent of any one session.
// ==========================================================================

const SWING_THOUGHT_STATUSES = ["works", "doesnt_work", "unsure"];

const SWING_THOUGHT_STATUS_LABELS = {
  works: "Works",
  doesnt_work: "Doesn't Work",
  unsure: "Unsure",
};

// Maps a status to the existing flight-badge good/miss/(neutral) treatment
// so status badges reuse the app's one green/amber/neutral signal system
// instead of introducing a new color language.
const SWING_THOUGHT_STATUS_BADGE_CLASS = {
  works: "good",
  doesnt_work: "miss",
  unsure: "",
};

const SWING_THOUGHT_ACHIEVED_TAGS = [
  "Strike",
  "Contact",
  "Path",
  "Face",
  "Speed",
  "Tempo",
  "Balance",
  "Feel",
  "Shorter backswing",
  "Release",
  "Posting up",
];

function getSwingThoughts() {
  const raw = localStorage.getItem(SWING_THOUGHTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSwingThoughts(thoughts) {
  localStorage.setItem(SWING_THOUGHTS_KEY, JSON.stringify(thoughts));
}

function getSwingThought(id) {
  return getSwingThoughts().find((t) => t.id === id) || null;
}

function createSwingThought({ name, goal, notes, status }) {
  const thoughts = getSwingThoughts();
  const thought = {
    id: "st_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name.trim(),
    goal: (goal || "").trim(),
    notes: (notes || "").trim(),
    status: SWING_THOUGHT_STATUSES.includes(status) ? status : "unsure",
    createdAt: new Date().toISOString(),
    history: [],
  };
  thoughts.unshift(thought);
  saveSwingThoughts(thoughts);
  return thought;
}

function updateSwingThought(id, changes) {
  const thoughts = getSwingThoughts();
  const thought = thoughts.find((t) => t.id === id);
  if (!thought) return null;
  Object.assign(thought, changes);
  saveSwingThoughts(thoughts);
  return thought;
}

// Deletes the thought itself but preserves every practice session and set
// it was ever used in — only the now-dangling reference (and any result
// recorded against this specific thought) is removed from those sets.
function deleteSwingThought(id) {
  const thoughts = getSwingThoughts().filter((t) => t.id !== id);
  saveSwingThoughts(thoughts);

  const sessions = getSessions();
  let changed = false;
  sessions.forEach((session) => {
    session.sets.forEach((set) => {
      if (Array.isArray(set.swingThoughtIds) && set.swingThoughtIds.includes(id)) {
        set.swingThoughtIds = set.swingThoughtIds.filter((tId) => tId !== id);
        changed = true;
      }
      if (set.swingThoughtResults && set.swingThoughtResults[id]) {
        delete set.swingThoughtResults[id];
        changed = true;
      }
    });
  });
  if (changed) saveSessions(sessions);
}

// Records one use of a swing thought: appends to the thought's own history
// (persisted immediately, so the detail page's history list is always
// complete) and mutates the passed-in set object with the same result (the
// caller — which owns whether that set lives on a draft or a saved session
// — is responsible for persisting the set's own container afterward).
function recordSwingThoughtResult(thoughtId, set, { sessionId, date, result, achieved, note }) {
  const thoughts = getSwingThoughts();
  const thought = thoughts.find((t) => t.id === thoughtId);
  if (!thought) return;

  const entry = {
    sessionId: sessionId || null,
    date,
    club: set.club || "",
    balls: set.balls,
    focus: set.focus || "",
    result: result || null,
    achieved: Array.isArray(achieved) ? achieved : [],
    note: (note || "").trim(),
  };
  thought.history.unshift(entry);
  saveSwingThoughts(thoughts);

  if (!set.swingThoughtResults) set.swingThoughtResults = {};
  set.swingThoughtResults[thoughtId] = { result: entry.result, achieved: entry.achieved, note: entry.note };
}

function swingThoughtStats(thought) {
  const history = thought.history || [];
  return {
    timesUsed: history.length,
    positive: history.filter((h) => h.result === "worked").length,
    negative: history.filter((h) => h.result === "didnt_work").length,
    unsure: history.filter((h) => h.result === "unsure").length,
  };
}

// Shows the swing thoughts actually attached to a session/draft's sets
// (the new per-set library flow), one row per thought-per-set, with
// whatever result was recorded. Returns false (and renders nothing) when
// there's nothing to show, so the caller can fall back to its own empty
// state or legacy free-text list.
function renderTriedThoughtsList(container, sets) {
  const thoughts = getSwingThoughts();
  const entries = [];

  sets.forEach((set) => {
    (set.swingThoughtIds || []).forEach((id) => {
      const thought = thoughts.find((t) => t.id === id);
      if (!thought) return;
      const result = set.swingThoughtResults && set.swingThoughtResults[id];
      entries.push({
        name: thought.name,
        setLabel: ballsAndClubLabel(set),
        result: result ? result.result : null,
        note: result ? result.note : "",
      });
    });
  });

  if (entries.length === 0) return false;

  const resultStatusMap = { worked: "works", didnt_work: "doesnt_work", unsure: "unsure" };

  const list = document.createElement("ul");
  list.className = "summary-sets";
  entries.forEach((entry) => {
    const li = document.createElement("li");
    const badge = entry.result
      ? renderStatusBadge(resultStatusMap[entry.result])
      : '<span class="thought-pick-stat">Not reviewed</span>';
    li.innerHTML = `
      <div class="summary-set-title">${escapeHtml(entry.name)} &mdash; ${entry.setLabel}</div>
      <div class="thought-history-badge">${badge}</div>
      ${entry.note ? `<div class="summary-set-note">${escapeHtml(entry.note)}</div>` : ""}
    `;
    list.appendChild(li);
  });
  container.appendChild(list);
  return true;
}

function renderStatusBadge(status) {
  const cls = SWING_THOUGHT_STATUS_BADGE_CLASS[status] || "";
  const label = SWING_THOUGHT_STATUS_LABELS[status] || "Unsure";
  return `<span class="flight-badge${cls ? " " + cls : ""}">${escapeHtml(label)}</span>`;
}

// ==========================================================================
// Skill Zone — repeatable skill tests. A game TEMPLATE (the test itself) is
// kept separate from its ATTEMPTS (each time it was played), so editing or
// deleting a template never rewrites history, and every attempt carries its
// own snapshot of what was actually played.
// ==========================================================================

function getSkillGames() {
  const raw = localStorage.getItem(SKILL_GAMES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSkillGames(games) {
  localStorage.setItem(SKILL_GAMES_KEY, JSON.stringify(games));
}

function getSkillGame(id) {
  return getSkillGames().find((g) => g.id === id) || null;
}

function createSkillGame({ name, sets }) {
  const games = getSkillGames();
  const game = {
    id: "sg_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: name.trim(),
    // Records how a set is scored. Only "count" (made X of Y balls) exists
    // today; keeping it explicit leaves room for other scoring methods
    // later without having to guess what old games meant.
    scoring: "count",
    createdAt: new Date().toISOString(),
    sets: sets.map((s) => ({ balls: s.balls, club: s.club || "", game: s.game.trim() })),
  };
  games.unshift(game);
  saveSkillGames(games);
  return game;
}

function updateSkillGame(id, changes) {
  const games = getSkillGames();
  const game = games.find((g) => g.id === id);
  if (!game) return null;
  Object.assign(game, changes);
  saveSkillGames(games);
  return game;
}

// Removes the template and the attempts belonging to it. Attempts live in
// their own key, so this never touches practice sessions or any other data.
function deleteSkillGame(id) {
  saveSkillGames(getSkillGames().filter((g) => g.id !== id));
  saveSkillAttempts(getSkillAttempts().filter((a) => a.gameId !== id));
}

function getSkillAttempts() {
  const raw = localStorage.getItem(SKILL_ATTEMPTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveSkillAttempts(attempts) {
  localStorage.setItem(SKILL_ATTEMPTS_KEY, JSON.stringify(attempts));
}

function getSkillAttempt(id) {
  return getSkillAttempts().find((a) => a.id === id) || null;
}

// Most recent first.
function getAttemptsForGame(gameId) {
  return getSkillAttempts()
    .filter((a) => a.gameId === gameId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function saveSkillAttempt(attempt) {
  const attempts = getSkillAttempts();
  attempts.unshift(attempt);
  saveSkillAttempts(attempts);
  return attempt;
}

function getSkillDraft() {
  const raw = localStorage.getItem(SKILL_DRAFT_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSkillDraft(draft) {
  localStorage.setItem(SKILL_DRAFT_KEY, JSON.stringify(draft));
}

function clearSkillDraft() {
  localStorage.removeItem(SKILL_DRAFT_KEY);
}

function skillTotalBalls(sets) {
  return sets.reduce((sum, s) => sum + s.balls, 0);
}

function skillPercent(score, totalBalls) {
  return totalBalls > 0 ? Math.round((score / totalBalls) * 100) : 0;
}

// Best is ranked by percentage rather than raw score, so a template that
// was edited to a different ball count still compares fairly.
function skillGameStats(gameId) {
  const attempts = getAttemptsForGame(gameId);
  if (attempts.length === 0) {
    return { count: 0, best: null, last: null, averagePercent: null };
  }
  const best = attempts.reduce((a, b) => (b.percent > a.percent ? b : a));
  const averagePercent = Math.round(
    attempts.reduce((sum, a) => sum + a.percent, 0) / attempts.length
  );
  return { count: attempts.length, best, last: attempts[0], averagePercent };
}

function formatScore(score, total) {
  return `${score} / ${total}`;
}

function formatRelativeDate(isoString) {
  const then = new Date(isoString);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(new Date()) - startOfDay(then)) / 86400000);

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(isoString);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
