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
const MAX_SET_NAMES = 8;

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

function getSetNames() {
  const raw = localStorage.getItem(SET_NAMES_KEY);
  return raw ? JSON.parse(raw) : [];
}

function rememberSetName(name) {
  const names = getSetNames().filter((n) => n.toLowerCase() !== name.toLowerCase());
  names.unshift(name);
  localStorage.setItem(SET_NAMES_KEY, JSON.stringify(names.slice(0, MAX_SET_NAMES)));
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
