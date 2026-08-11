const draft = getDraft();

if (!draft || !draft.totalBalls || !draft.numberOfSets) {
  window.location.href = "index.html";
}

let currentBalls = 10;

const setProgressEl = document.getElementById("setProgress");
const decSetBallsBtn = document.getElementById("decSetBalls");
const incSetBallsBtn = document.getElementById("incSetBalls");
const setBallsValueEl = document.getElementById("setBallsValue");
const remainingHintEl = document.getElementById("remainingHint");
const recentNamesEl = document.getElementById("recentNames");
const focusInput = document.getElementById("focusInput");
const nextSetBtn = document.getElementById("nextSetBtn");

function allocatedSoFar() {
  return draft.sets.reduce((sum, s) => sum + s.balls, 0);
}

function isLastSet() {
  return draft.buildIndex === draft.numberOfSets - 1;
}

function maxForCurrentSet() {
  const remaining = draft.totalBalls - allocatedSoFar();
  const setsAfterThis = draft.numberOfSets - draft.buildIndex - 1;
  return Math.max(5, remaining - setsAfterThis * 5);
}

function updateStepperButtons() {
  const max = maxForCurrentSet();
  decSetBallsBtn.disabled = currentBalls <= 5;
  incSetBallsBtn.disabled = currentBalls >= max;
}

function updateNextBtnState() {
  nextSetBtn.disabled = focusInput.value.trim().length === 0;
}

function renderStep() {
  const remaining = draft.totalBalls - allocatedSoFar();
  const last = isLastSet();

  setProgressEl.textContent = `SET ${draft.buildIndex + 1} OF ${draft.numberOfSets}`;

  decSetBallsBtn.classList.toggle("hidden", last);
  incSetBallsBtn.classList.toggle("hidden", last);

  if (last) {
    currentBalls = remaining;
    remainingHintEl.textContent = `${remaining} balls remaining — this set uses them all`;
  } else {
    currentBalls = Math.min(10, maxForCurrentSet());
    remainingHintEl.textContent = "";
    updateStepperButtons();
  }

  setBallsValueEl.textContent = currentBalls;
  focusInput.value = "";
  updateNextBtnState();
  nextSetBtn.textContent = last ? "Review Session" : "Next Set";
}

function renderRecentNames() {
  const names = getSetNames();
  recentNamesEl.innerHTML = "";
  names.forEach((name) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = name;
    chip.addEventListener("click", () => {
      focusInput.value = name;
      updateNextBtnState();
    });
    recentNamesEl.appendChild(chip);
  });
}

decSetBallsBtn.addEventListener("click", () => {
  if (currentBalls > 5) {
    currentBalls -= 5;
    setBallsValueEl.textContent = currentBalls;
    updateStepperButtons();
  }
});

incSetBallsBtn.addEventListener("click", () => {
  if (currentBalls < maxForCurrentSet()) {
    currentBalls += 5;
    setBallsValueEl.textContent = currentBalls;
    updateStepperButtons();
  }
});

focusInput.addEventListener("input", updateNextBtnState);

nextSetBtn.addEventListener("click", () => {
  const focus = focusInput.value.trim();
  if (!focus) return;

  draft.sets.push({ balls: currentBalls, focus, rating: null, note: "" });
  rememberSetName(focus);
  draft.buildIndex += 1;
  saveDraft(draft);
  renderRecentNames();

  if (draft.buildIndex >= draft.numberOfSets) {
    window.location.href = "review.html";
  } else {
    renderStep();
  }
});

if (draft && draft.totalBalls && draft.numberOfSets) {
  renderStep();
  renderRecentNames();
}
