const params = new URLSearchParams(window.location.search);
const gameId = params.get("id");
const game = getSkillGame(gameId);

if (!game) {
  window.location.href = "skill-zone.html";
}

const gameNameEl = document.getElementById("gameName");
const gameTotalsEl = document.getElementById("gameTotals");
const gameStatsEl = document.getElementById("gameStats");
const startBtn = document.getElementById("startBtn");
const gameSetsEl = document.getElementById("gameSets");
const historyListEl = document.getElementById("historyList");
const editLink = document.getElementById("editLink");
const deleteBtn = document.getElementById("deleteBtn");
const deleteConfirmEl = document.getElementById("deleteConfirm");
const deleteWarningEl = document.getElementById("deleteWarning");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

function render() {
  const stats = skillGameStats(game.id);
  const totalBalls = skillTotalBalls(game.sets);

  gameNameEl.textContent = game.name;
  gameTotalsEl.textContent = `${totalBalls} balls · ${game.sets.length} set${game.sets.length === 1 ? "" : "s"}`;

  if (stats.count === 0) {
    gameStatsEl.innerHTML = '<div class="hint-text">Not attempted yet — play it to set your first score.</div>';
  } else {
    gameStatsEl.innerHTML = `
      <div class="score-stats">
        <div class="score-stat">
          <span class="score-stat-value">${formatScore(stats.best.totalScore, stats.best.totalBalls)}</span>
          <span class="score-stat-label">Best</span>
        </div>
        <div class="score-stat">
          <span class="score-stat-value">${formatScore(stats.last.totalScore, stats.last.totalBalls)}</span>
          <span class="score-stat-label">Last</span>
        </div>
        <div class="score-stat">
          <span class="score-stat-value">${stats.averagePercent}%</span>
          <span class="score-stat-label">Average</span>
        </div>
        <div class="score-stat">
          <span class="score-stat-value">${stats.count}</span>
          <span class="score-stat-label">Attempt${stats.count === 1 ? "" : "s"}</span>
        </div>
      </div>
    `;
  }

  gameSetsEl.innerHTML = "";
  game.sets.forEach((set, index) => {
    const li = document.createElement("li");
    const clubLabel = set.club ? `${escapeHtml(set.club)} · ` : "";
    li.innerHTML = `
      <div class="summary-set-title">Set ${index + 1}: ${clubLabel}${set.balls} balls</div>
      <div class="summary-set-note">${escapeHtml(set.game)}</div>
    `;
    gameSetsEl.appendChild(li);
  });

  const attempts = getAttemptsForGame(game.id);
  historyListEl.innerHTML = "";
  if (attempts.length === 0) {
    historyListEl.innerHTML = '<div class="empty-state">No attempts recorded yet</div>';
  } else {
    const list = document.createElement("ul");
    list.className = "summary-sets";
    attempts.forEach((attempt) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="summary-set-title">${escapeHtml(formatRelativeDate(attempt.date))}</div>
        <div class="attempt-score">${formatScore(attempt.totalScore, attempt.totalBalls)} &middot; ${attempt.percent}%</div>
      `;
      list.appendChild(li);
    });
    historyListEl.appendChild(list);
  }

  editLink.href = `skill-game-form.html?id=${encodeURIComponent(game.id)}`;

  const attemptCount = attempts.length;
  deleteWarningEl.textContent =
    attemptCount === 0
      ? "This will permanently delete this skill game. Your practice data is not affected."
      : `This will permanently delete this skill game and its ${attemptCount} recorded attempt${attemptCount === 1 ? "" : "s"}. Your practice data is not affected.`;
}

startBtn.addEventListener("click", () => {
  // An attempt is a snapshot: it plays the sets as they are right now, so
  // editing the template later never changes what was already recorded.
  saveSkillDraft({
    gameId: game.id,
    gameName: game.name,
    startedAt: new Date().toISOString(),
    currentSetIndex: 0,
    sets: game.sets.map((s) => ({ balls: s.balls, club: s.club || "", game: s.game, score: null })),
  });
  window.location.href = "skill-play.html";
});

deleteBtn.addEventListener("click", () => {
  deleteConfirmEl.classList.remove("hidden");
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteConfirmEl.classList.add("hidden");
});

confirmDeleteBtn.addEventListener("click", () => {
  deleteSkillGame(game.id);
  window.location.href = "skill-zone.html";
});

if (game) {
  render();
}
