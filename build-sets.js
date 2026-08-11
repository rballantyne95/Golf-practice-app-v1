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
const focusErrorEl = document.getElementById("focusError");
const nextSetBtn = document.getElementById("nextSetBtn");
const builtSetsSectionEl = document.getElementById("builtSetsSection");
const builtSetsListEl = document.getElementById("builtSetsList");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

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

function renderStep() {
  const remaining = draft.totalBalls - allocatedSoFar();
  const last = isLastSet();
  const setsAfterThis = draft.numberOfSets - draft.buildIndex - 1;

  setProgressEl.textContent = `SET ${draft.buildIndex + 1} OF ${draft.numberOfSets}`;

  decSetBallsBtn.classList.toggle("hidden", last);
  incSetBallsBtn.classList.toggle("hidden", last);

  if (last) {
    currentBalls = remaining;
    remainingHintEl.textContent = `${remaining} balls remaining — this set uses them all`;
  } else {
    const max = maxForCurrentSet();
    currentBalls = Math.min(10, max);
    remainingHintEl.textContent =
      max < remaining
        ? `Up to ${max} balls — ${setsAfterThis} set${setsAfterThis === 1 ? "" : "s"} still to come need at least 5 each`
        : "";
    updateStepperButtons();
  }

  setBallsValueEl.textContent = currentBalls;
  focusInput.value = "";
  focusErrorEl.classList.add("hidden");
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
      focusErrorEl.classList.add("hidden");
    });
    recentNamesEl.appendChild(chip);
  });
}

function renderBuiltSets() {
  builtSetsSectionEl.classList.toggle("hidden", draft.sets.length === 0);
  builtSetsListEl.innerHTML = "";
  draft.sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="set-label">Set ${index + 1}: ${set.balls} balls &mdash; ${escapeHtml(set.focus)}</span>
      <span class="edit-hint">Edit &rsaquo;</span>
    `;
    li.addEventListener("click", () => editSet(index));
    builtSetsListEl.appendChild(li);
  });
}

function editSet(index) {
  const setToEdit = draft.sets[index];
  draft.sets = draft.sets.slice(0, index);
  draft.buildIndex = index;
  saveDraft(draft);

  renderStep();
  renderBuiltSets();

  focusInput.value = setToEdit.focus;
  if (!isLastSet()) {
    currentBalls = Math.min(setToEdit.balls, maxForCurrentSet());
    setBallsValueEl.textContent = currentBalls;
    updateStepperButtons();
  }
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

focusInput.addEventListener("input", () => {
  if (focusInput.value.trim().length > 0) {
    focusErrorEl.classList.add("hidden");
  }
});

nextSetBtn.addEventListener("click", () => {
  const focus = focusInput.value.trim();
  if (!focus) {
    focusErrorEl.classList.remove("hidden");
    focusInput.focus();
    return;
  }

  draft.sets.push({ balls: currentBalls, focus, rating: null, note: "" });
  rememberSetName(focus);
  draft.buildIndex += 1;
  saveDraft(draft);
  renderRecentNames();
  renderBuiltSets();

  if (draft.buildIndex >= draft.numberOfSets) {
    window.location.href = "review.html";
  } else {
    renderStep();
  }
});

if (draft && draft.totalBalls && draft.numberOfSets) {
  renderStep();
  renderRecentNames();
  renderBuiltSets();
}
