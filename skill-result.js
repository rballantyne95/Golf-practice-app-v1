const params = new URLSearchParams(window.location.search);
const attemptId = params.get("attempt");
const attempt = attemptId ? getSkillAttempt(attemptId) : null;

if (!attempt) {
  window.location.href = "skill-zone.html";
}

const gameNameEl = document.getElementById("gameName");
const totalScoreEl = document.getElementById("totalScore");
const totalPercentEl = document.getElementById("totalPercent");
const setResultsEl = document.getElementById("setResults");
const doneBtn = document.getElementById("doneBtn");

function render() {
  gameNameEl.textContent = attempt.gameName;
  totalScoreEl.textContent = formatScore(attempt.totalScore, attempt.totalBalls);
  totalPercentEl.textContent = `${attempt.percent}%`;

  setResultsEl.innerHTML = "";
  attempt.sets.forEach((set) => {
    const li = document.createElement("li");
    const clubLabel = set.club ? `${escapeHtml(set.club)} · ` : "";
    li.innerHTML = `
      <div class="summary-set-title">${formatScore(set.score, set.balls)}</div>
      <div class="summary-set-note">${clubLabel}${escapeHtml(set.game)}</div>
    `;
    setResultsEl.appendChild(li);
  });

  // Back to the game itself when it still exists, so the updated best/last
  // and history are right there; otherwise fall back to the list.
  doneBtn.href = getSkillGame(attempt.gameId)
    ? `skill-game-detail.html?id=${encodeURIComponent(attempt.gameId)}`
    : "skill-zone.html";
}

if (attempt) {
  render();
}
