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
const summaryCommitmentEl = document.getElementById("summaryCommitment");
const summaryStrikeQualityEl = document.getElementById("summaryStrikeQuality");
const summaryBallFlightEl = document.getElementById("summaryBallFlight");
const summarySetsEl = document.getElementById("summarySets");
const summaryThoughtsEl = document.getElementById("summaryThoughts");
const repeatSessionBtn = document.getElementById("repeatSessionBtn");
const editSessionLink = document.getElementById("editSessionLink");
const deleteBtn = document.getElementById("deleteBtn");

editSessionLink.href = `session-edit.html?id=${encodeURIComponent(sessionId)}`;

function render() {
  summaryDateEl.textContent = formatDate(session.date);
  summaryFocusEl.textContent = formatFocusList(session.focus);
  summaryTotalBallsEl.textContent = `${session.totalBalls} balls hit`;
  summaryCommitmentEl.innerHTML = `<strong>Commitment to Drills:</strong> ${session.commitmentRating != null ? session.commitmentRating + "/5" : "Not rated"}`;
  summaryStrikeQualityEl.innerHTML = `<strong>Strike Quality:</strong> ${session.strikeQuality != null ? session.strikeQuality + "/5" : "Not rated"}`;
  summaryBallFlightEl.innerHTML = `<strong>Ball Flight:</strong> ${escapeHtml(formatBallFlight(session.ballFlight))}`;

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

  summaryThoughtsEl.innerHTML = "";
  const rendered = renderTriedThoughtsList(summaryThoughtsEl, session.sets);
  if (!rendered && session.swingThoughts.length === 0) {
    summaryThoughtsEl.innerHTML = '<div class="empty-state">No swing thoughts recorded</div>';
  } else if (!rendered) {
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
    focus: normalizeFocusList(session.focus),
    totalBalls: session.totalBalls,
    sets: session.sets.map((s) => ({
      balls: s.balls,
      focus: s.focus,
      club: s.club || "",
      rating: null,
      note: "",
      swingThoughtIds: (s.swingThoughtIds || []).slice(),
    })),
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
