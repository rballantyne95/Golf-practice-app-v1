const draft = getSkillDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "skill-zone.html";
}

const closeBtn = document.getElementById("closeBtn");
const clubBannerEl = document.getElementById("clubBanner");
const setProgressEl = document.getElementById("setProgress");
const setBallsEl = document.getElementById("setBalls");
const setGameEl = document.getElementById("setGame");
const scoreEntryEl = document.getElementById("scoreEntry");
const decScoreBtn = document.getElementById("decScore");
const incScoreBtn = document.getElementById("incScore");
const scoreValueEl = document.getElementById("scoreValue");
const scoreTotalEl = document.getElementById("scoreTotal");
const scoreQuickPickEl = document.getElementById("scoreQuickPick");
const saveScoreBtn = document.getElementById("saveScoreBtn");
const setCompleteEl = document.getElementById("setComplete");
const completeLabelEl = document.getElementById("completeLabel");
const completeScoreEl = document.getElementById("completeScore");
const nextSetBtn = document.getElementById("nextSetBtn");

let currentScore = 0;

closeBtn.addEventListener("click", () => {
  clearSkillDraft();
  window.location.href = "skill-zone.html";
});

function currentSet() {
  return draft.sets[draft.currentSetIndex];
}

function isLastSet() {
  return draft.currentSetIndex === draft.sets.length - 1;
}

function renderScoreControls() {
  const set = currentSet();
  scoreValueEl.textContent = currentScore;
  decScoreBtn.disabled = currentScore <= 0;
  incScoreBtn.disabled = currentScore >= set.balls;

  scoreQuickPickEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("selected", Number(btn.dataset.score) === currentScore);
  });
}

function renderQuickPick() {
  const set = currentSet();
  scoreQuickPickEl.innerHTML = "";
  for (let n = 0; n <= set.balls; n++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "club-btn";
    btn.dataset.score = n;
    btn.textContent = n;
    btn.addEventListener("click", () => {
      currentScore = n;
      renderScoreControls();
    });
    scoreQuickPickEl.appendChild(btn);
  }
}

function renderCurrentSet() {
  const set = currentSet();

  clubBannerEl.innerHTML = set.club
    ? `<span class="focus-pill">${escapeHtml(set.club)}</span>`
    : "";
  setProgressEl.textContent = `SET ${draft.currentSetIndex + 1} OF ${draft.sets.length}`;
  setBallsEl.innerHTML = `<span class="metric-value">${set.balls}</span><span class="metric-unit">BALLS</span>`;
  setGameEl.textContent = set.game;
  scoreTotalEl.textContent = `out of ${set.balls}`;

  // Resume with whatever was already entered for this set, so reloading
  // mid-game never loses a score.
  currentScore = set.score == null ? 0 : set.score;

  renderQuickPick();
  renderScoreControls();

  scoreEntryEl.classList.remove("hidden");
  setCompleteEl.classList.add("hidden");
}

decScoreBtn.addEventListener("click", () => {
  if (currentScore > 0) {
    currentScore -= 1;
    renderScoreControls();
  }
});

incScoreBtn.addEventListener("click", () => {
  if (currentScore < currentSet().balls) {
    currentScore += 1;
    renderScoreControls();
  }
});

saveScoreBtn.addEventListener("click", () => {
  const set = currentSet();
  set.score = currentScore;
  saveSkillDraft(draft);

  completeLabelEl.textContent = `Set ${draft.currentSetIndex + 1} complete`;
  completeScoreEl.textContent = formatScore(set.score, set.balls);
  nextSetBtn.textContent = isLastSet() ? "See Result" : "Next Set";

  scoreEntryEl.classList.add("hidden");
  setCompleteEl.classList.remove("hidden");
});

nextSetBtn.addEventListener("click", () => {
  if (!isLastSet()) {
    draft.currentSetIndex += 1;
    saveSkillDraft(draft);
    renderCurrentSet();
    return;
  }

  // Last set scored — record the attempt, then hand off to the result
  // screen by id so it stays viewable if the page is reloaded.
  const totalBalls = skillTotalBalls(draft.sets);
  const totalScore = draft.sets.reduce((sum, s) => sum + (s.score || 0), 0);

  const attempt = saveSkillAttempt({
    id: "sa_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    gameId: draft.gameId,
    gameName: draft.gameName,
    date: new Date().toISOString(),
    totalBalls,
    totalScore,
    percent: skillPercent(totalScore, totalBalls),
    sets: draft.sets.map((s) => ({ balls: s.balls, club: s.club || "", game: s.game, score: s.score || 0 })),
  });

  clearSkillDraft();
  window.location.href = `skill-result.html?attempt=${encodeURIComponent(attempt.id)}`;
});

if (draft && draft.sets && draft.sets.length > 0) {
  renderCurrentSet();
}
