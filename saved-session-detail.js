const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");
const savedSessions = getSavedSessions();
const session = savedSessions.find((s) => s.id === sessionId);

if (!session) {
  window.location.href = "saved-sessions.html";
}

const sessionNameEl = document.getElementById("sessionName");
const summaryFocusEl = document.getElementById("summaryFocus");
const summaryTotalBallsEl = document.getElementById("summaryTotalBalls");
const summarySetsEl = document.getElementById("summarySets");
const startBtn = document.getElementById("startBtn");
const deleteBtn = document.getElementById("deleteBtn");

function render() {
  sessionNameEl.textContent = session.name;
  summaryFocusEl.textContent = session.focus || "No focus set";
  summaryTotalBallsEl.textContent = `${session.totalBalls} balls`;

  summarySetsEl.innerHTML = "";
  session.sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<div class="summary-set-title">Set ${index + 1}: ${ballsAndClubLabel(set)} &mdash; ${escapeHtml(set.focus)}</div>`;
    summarySetsEl.appendChild(li);
  });
}

startBtn.addEventListener("click", () => {
  const draft = {
    focus: session.focus || "",
    totalBalls: session.totalBalls,
    sets: session.sets.map((s) => ({ balls: s.balls, focus: s.focus, club: s.club || "", rating: null, note: "" })),
    currentSetIndex: 0,
    swingThoughts: [],
  };
  saveDraft(draft);
  window.location.href = "practice.html";
});

deleteBtn.addEventListener("click", () => {
  const remaining = savedSessions.filter((s) => s.id !== sessionId);
  saveSavedSessions(remaining);
  window.location.href = "saved-sessions.html";
});

if (session) {
  render();
}
