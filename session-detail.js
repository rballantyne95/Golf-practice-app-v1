const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");
const sessions = getSessions();
const session = sessions.find((s) => s.id === sessionId);

if (!session) {
  window.location.href = "index.html";
}

const summaryDateEl = document.getElementById("summaryDate");
const summaryFocusEl = document.getElementById("summaryFocus");
const summaryTotalBallsEl = document.getElementById("summaryTotalBalls");
const summarySetsEl = document.getElementById("summarySets");
const summaryThoughtsEl = document.getElementById("summaryThoughts");
const repeatSessionBtn = document.getElementById("repeatSessionBtn");
const deleteBtn = document.getElementById("deleteBtn");

function render() {
  summaryDateEl.textContent = formatDate(session.date);
  summaryFocusEl.textContent = session.focus || "No focus set";
  summaryTotalBallsEl.textContent = `${session.totalBalls} balls hit`;

  summarySetsEl.innerHTML = "";
  session.sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="summary-set-title">Set ${index + 1}: ${ballsAndClubLabel(set)} &mdash; ${escapeHtml(set.focus)}</div>
      <div class="summary-set-rating">${set.rating}</div>
      ${set.note ? `<div class="summary-set-note">${escapeHtml(set.note)}</div>` : ""}
    `;
    summarySetsEl.appendChild(li);
  });

  if (session.swingThoughts.length === 0) {
    summaryThoughtsEl.innerHTML = '<div class="empty-state">No swing thoughts recorded</div>';
  } else {
    const list = document.createElement("ul");
    list.className = "thoughts-list";
    session.swingThoughts.forEach((thought) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="set-label">${escapeHtml(thought)}</span>`;
      list.appendChild(li);
    });
    summaryThoughtsEl.appendChild(list);
  }
}

repeatSessionBtn.addEventListener("click", () => {
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
  const remaining = sessions.filter((s) => s.id !== sessionId);
  saveSessions(remaining);
  window.location.href = "index.html";
});

if (session) {
  render();
}
