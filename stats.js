const totalBallsStatEl = document.getElementById("totalBallsStat");
const sessionCountStatEl = document.getElementById("sessionCountStat");
const viewToggle = document.getElementById("viewToggle");
const statsContainer = document.getElementById("statsContainer");

const sessions = getSessions();
let currentView = "sessionFocus";

function sortedEntries(totals) {
  return Array.from(totals.entries())
    .map(([label, balls]) => ({ label, balls }))
    .sort((a, b) => b.balls - a.balls);
}

function aggregateBySessionFocus() {
  const totals = new Map();
  sessions.forEach((session) => {
    const key = session.focus || "No Focus Set";
    const balls = session.sets.reduce((sum, s) => sum + s.balls, 0);
    totals.set(key, (totals.get(key) || 0) + balls);
  });
  return sortedEntries(totals);
}

function aggregateBySet(view) {
  const totals = new Map();
  sessions.forEach((session) => {
    session.sets.forEach((set) => {
      const key = view === "drill" ? set.focus : set.club || "No Club";
      totals.set(key, (totals.get(key) || 0) + set.balls);
    });
  });
  return sortedEntries(totals);
}

function aggregate(view) {
  return view === "sessionFocus" ? aggregateBySessionFocus() : aggregateBySet(view);
}

function render() {
  const totalBalls = sessions.reduce((sum, s) => sum + s.totalBalls, 0);
  totalBallsStatEl.textContent = `${totalBalls} balls hit`;
  sessionCountStatEl.textContent = `across ${sessions.length} session${sessions.length === 1 ? "" : "s"}`;

  if (sessions.length === 0) {
    viewToggle.classList.add("hidden");
    statsContainer.innerHTML =
      '<div class="empty-state">No completed sessions yet. Your stats will show up here once you finish a practice session.</div>';
    return;
  }

  const data = aggregate(currentView);
  const maxBalls = data[0].balls;

  statsContainer.innerHTML = "";
  data.forEach((row) => {
    const percent = Math.max((row.balls / maxBalls) * 100, 3);
    const rowEl = document.createElement("div");
    rowEl.className = "stat-row";
    rowEl.innerHTML = `
      <div class="stat-row-header">
        <span class="stat-row-label">${escapeHtml(row.label)}</span>
        <span class="stat-row-value">${row.balls} balls</span>
      </div>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width: ${percent}%"></div></div>
    `;
    statsContainer.appendChild(rowEl);
  });
}

viewToggle.querySelectorAll(".step-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    viewToggle.querySelectorAll(".step-option").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentView = btn.dataset.view;
    render();
  });
});

render();
