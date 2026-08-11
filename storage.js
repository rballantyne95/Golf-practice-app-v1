// Shared localStorage helpers used by every page.

// If the browser restores this page from its back/forward cache (a frozen
// snapshot from before the latest update), force a fresh load instead of
// running stale JavaScript.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

const SESSIONS_KEY = "golfSessions";
const DRAFT_KEY = "golfDraftSession";
const SET_NAMES_KEY = "golfSetNames";
const SAVED_SESSIONS_KEY = "golfSavedSessions";
const CUSTOM_FOCUS_AREAS_KEY = "golfCustomFocusAreas";
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
