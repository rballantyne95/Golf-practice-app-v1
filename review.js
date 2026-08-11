const draft = getDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "index.html";
}

const summaryFocusEl = document.getElementById("summaryFocus");
const summaryTotalBallsEl = document.getElementById("summaryTotalBalls");
const summarySetsEl = document.getElementById("summarySets");
const startNowBtn = document.getElementById("startNowBtn");
const showSaveBtn = document.getElementById("showSaveBtn");
const saveForm = document.getElementById("saveForm");
const sessionNameInput = document.getElementById("sessionNameInput");
const saveSessionBtn = document.getElementById("saveSessionBtn");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

function render() {
  summaryFocusEl.textContent = formatFocusList(draft.focus);
  summaryTotalBallsEl.textContent = `${draft.totalBalls} balls`;

  summarySetsEl.innerHTML = "";
  draft.sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<div class="summary-set-title">Set ${index + 1}: ${ballsAndClubLabel(set)} &mdash; ${escapeHtml(set.focus)}</div>`;
    summarySetsEl.appendChild(li);
  });
}

startNowBtn.addEventListener("click", () => {
  draft.currentSetIndex = 0;
  draft.swingThoughts = [];
  saveDraft(draft);
  window.location.href = "practice.html";
});

showSaveBtn.addEventListener("click", () => {
  saveForm.classList.remove("hidden");
  showSaveBtn.classList.add("hidden");
  sessionNameInput.focus();
});

sessionNameInput.addEventListener("input", () => {
  saveSessionBtn.disabled = sessionNameInput.value.trim().length === 0;
});

saveSessionBtn.addEventListener("click", () => {
  const name = sessionNameInput.value.trim();
  if (!name) return;

  const savedSessions = getSavedSessions();
  savedSessions.unshift({
    id: Date.now().toString(),
    name,
    focus: normalizeFocusList(draft.focus),
    totalBalls: draft.totalBalls,
    sets: draft.sets.map((s) => ({ balls: s.balls, focus: s.focus, club: s.club || "" })),
  });
  saveSavedSessions(savedSessions);
  clearDraft();

  window.location.href = "index.html";
});

if (draft && draft.sets && draft.sets.length > 0) {
  render();
}
