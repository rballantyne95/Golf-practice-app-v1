const draft = getDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "index.html";
}

const nowIso = new Date().toISOString();

const summaryDateEl = document.getElementById("summaryDate");
const summaryFocusEl = document.getElementById("summaryFocus");
const summaryTotalBallsEl = document.getElementById("summaryTotalBalls");
const summaryCommitmentEl = document.getElementById("summaryCommitment");
const summaryStrikeQualityEl = document.getElementById("summaryStrikeQuality");
const summaryBallFlightEl = document.getElementById("summaryBallFlight");
const summarySetsEl = document.getElementById("summarySets");
const summaryThoughtsEl = document.getElementById("summaryThoughts");
const saveSessionBtn = document.getElementById("saveSessionBtn");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

function render() {
  summaryDateEl.textContent = formatDate(nowIso);
  summaryFocusEl.textContent = formatFocusList(draft.focus);
  summaryTotalBallsEl.textContent = `${draft.totalBalls} balls hit`;
  summaryCommitmentEl.innerHTML = `<strong>Commitment to Drills:</strong> ${draft.commitmentRating != null ? draft.commitmentRating + "/5" : "Not rated"}`;
  summaryStrikeQualityEl.innerHTML = `<strong>Strike Quality:</strong> ${draft.strikeQuality != null ? draft.strikeQuality + "/5" : "Not rated"}`;
  summaryBallFlightEl.innerHTML = `<strong>Ball Flight:</strong> ${escapeHtml(formatBallFlight(draft.ballFlight))}`;

  summarySetsEl.innerHTML = "";
  draft.sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="summary-set-title">Set ${index + 1}: ${ballsAndClubLabel(set)} &mdash; ${escapeHtml(set.focus)}</div>
      <div class="summary-set-rating">${set.rating}</div>
      ${set.note ? `<div class="summary-set-note">${escapeHtml(set.note)}</div>` : ""}
    `;
    summarySetsEl.appendChild(li);
  });

  summaryThoughtsEl.innerHTML = "";
  const rendered = renderTriedThoughtsList(summaryThoughtsEl, draft.sets);
  if (!rendered && draft.swingThoughts.length === 0) {
    summaryThoughtsEl.innerHTML = '<div class="empty-state">No swing thoughts recorded</div>';
  } else if (!rendered) {
    const list = document.createElement("ul");
    list.className = "thoughts-list";
    draft.swingThoughts.forEach((thought) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="set-label">${escapeHtml(thought)}</span>`;
      list.appendChild(li);
    });
    summaryThoughtsEl.appendChild(list);
  }
}

saveSessionBtn.addEventListener("click", () => {
  const sessionId = Date.now().toString();
  const session = {
    id: sessionId,
    date: nowIso,
    focus: normalizeFocusList(draft.focus),
    totalBalls: draft.totalBalls,
    commitmentRating: draft.commitmentRating != null ? draft.commitmentRating : null,
    strikeQuality: draft.strikeQuality != null ? draft.strikeQuality : null,
    ballFlight: draft.ballFlight || {},
    sets: draft.sets.map((s) => ({
      balls: s.balls,
      focus: s.focus,
      club: s.club || "",
      rating: s.rating,
      note: s.note,
      swingThoughtIds: s.swingThoughtIds || [],
      swingThoughtResults: s.swingThoughtResults || {},
    })),
    swingThoughts: draft.swingThoughts,
  };

  // Only now that the session has a real id can each reviewed swing
  // thought's result be written into its own history.
  session.sets.forEach((set) => {
    Object.keys(set.swingThoughtResults).forEach((thoughtId) => {
      const r = set.swingThoughtResults[thoughtId];
      recordSwingThoughtResult(thoughtId, set, {
        sessionId,
        date: nowIso,
        result: r.result,
        achieved: r.achieved,
        note: r.note,
      });
    });
  });

  const sessions = getSessions();
  sessions.unshift(session);
  saveSessions(sessions);
  clearDraft();

  window.location.href = "index.html";
});

if (draft && draft.sets && draft.sets.length > 0) {
  render();
}
