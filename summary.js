const draft = getDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "index.html";
}

const nowIso = new Date().toISOString();

const summaryDateEl = document.getElementById("summaryDate");
const summaryTotalBallsEl = document.getElementById("summaryTotalBalls");
const summarySetsEl = document.getElementById("summarySets");
const summaryThoughtsEl = document.getElementById("summaryThoughts");
const saveSessionBtn = document.getElementById("saveSessionBtn");

function render() {
  summaryDateEl.textContent = formatDate(nowIso);
  summaryTotalBallsEl.textContent = `${draft.totalBalls} balls hit`;

  summarySetsEl.innerHTML = "";
  draft.sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="summary-set-title">Set ${index + 1}: ${set.balls} balls &mdash; ${set.focus}</div>
      <div class="summary-set-rating">${set.rating}</div>
      ${set.note ? `<div class="summary-set-note">${set.note}</div>` : ""}
    `;
    summarySetsEl.appendChild(li);
  });

  if (draft.swingThoughts.length === 0) {
    summaryThoughtsEl.innerHTML = '<div class="empty-state">No swing thoughts recorded</div>';
  } else {
    const list = document.createElement("ul");
    list.className = "thoughts-list";
    draft.swingThoughts.forEach((thought) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="set-label">${thought}</span>`;
      list.appendChild(li);
    });
    summaryThoughtsEl.appendChild(list);
  }
}

saveSessionBtn.addEventListener("click", () => {
  const session = {
    id: Date.now().toString(),
    date: nowIso,
    totalBalls: draft.totalBalls,
    sets: draft.sets.map((s) => ({
      balls: s.balls,
      focus: s.focus,
      rating: s.rating,
      note: s.note,
    })),
    swingThoughts: draft.swingThoughts,
  };

  const sessions = getSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  clearDraft();

  window.location.href = "index.html";
});

if (draft && draft.sets && draft.sets.length > 0) {
  render();
}
