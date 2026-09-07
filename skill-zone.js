const gamesContainer = document.getElementById("gamesContainer");

function render() {
  const games = getSkillGames();

  if (games.length === 0) {
    gamesContainer.innerHTML =
      '<div class="empty-state">No skill games yet. Create one to start testing yourself.</div>';
    return;
  }

  const list = document.createElement("ul");
  list.className = "sessions-list";

  games.forEach((game) => {
    const stats = skillGameStats(game.id);
    const totalBalls = skillTotalBalls(game.sets);

    const scoreLine =
      stats.count === 0
        ? '<div class="session-meta">Not attempted yet</div>'
        : `<div class="score-stats">
             <div class="score-stat">
               <span class="score-stat-value">${formatScore(stats.best.totalScore, stats.best.totalBalls)}</span>
               <span class="score-stat-label">Best</span>
             </div>
             <div class="score-stat">
               <span class="score-stat-value">${formatScore(stats.last.totalScore, stats.last.totalBalls)}</span>
               <span class="score-stat-label">Last</span>
             </div>
             <div class="score-stat">
               <span class="score-stat-value">${stats.count}</span>
               <span class="score-stat-label">Attempt${stats.count === 1 ? "" : "s"}</span>
             </div>
           </div>`;

    const li = document.createElement("li");
    li.innerHTML = `
      <a href="skill-game-detail.html?id=${encodeURIComponent(game.id)}" class="session-link">
        <div class="session-date">${escapeHtml(game.name)}</div>
        <div class="session-meta">${totalBalls} balls &middot; ${game.sets.length} set${game.sets.length === 1 ? "" : "s"}</div>
        ${scoreLine}
      </a>
    `;
    list.appendChild(li);
  });

  gamesContainer.innerHTML = "";
  gamesContainer.appendChild(list);
}

render();
