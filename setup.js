clearDraft();

let totalBalls = 25;
let selectedSetBalls = 5;
const sets = [];

const totalBallsValueEl = document.getElementById("totalBallsValue");
const decBallsBtn = document.getElementById("decBalls");
const incBallsBtn = document.getElementById("incBalls");
const allocatedTrackerEl = document.getElementById("allocatedTracker");
const setBallsValueEl = document.getElementById("setBallsValue");
const decSetBallsBtn = document.getElementById("decSetBalls");
const incSetBallsBtn = document.getElementById("incSetBalls");
const recentNamesEl = document.getElementById("recentNames");
const focusInput = document.getElementById("focusInput");
const addSetBtn = document.getElementById("addSetBtn");
const setsListEl = document.getElementById("setsList");
const beginSessionBtn = document.getElementById("beginSessionBtn");

function allocatedBalls() {
  return sets.reduce((sum, s) => sum + s.balls, 0);
}

function remainingBalls() {
  return Math.max(0, totalBalls - allocatedBalls());
}

function renderTotalBalls() {
  totalBallsValueEl.textContent = totalBalls;
  decBallsBtn.disabled = totalBalls <= 5;
  renderAllocatedTracker();
}

function renderAllocatedTracker() {
  const allocated = allocatedBalls();
  allocatedTrackerEl.textContent = `${allocated} / ${totalBalls} balls allocated`;

  allocatedTrackerEl.classList.remove("matched", "over");
  if (allocated === totalBalls) {
    allocatedTrackerEl.classList.add("matched");
  } else if (allocated > totalBalls) {
    allocatedTrackerEl.classList.add("over");
  }

  beginSessionBtn.disabled = !(allocated === totalBalls && sets.length > 0);
  renderSetBallsStepper();
}

function renderSetBallsStepper() {
  const remaining = remainingBalls();
  selectedSetBalls = Math.min(selectedSetBalls, remaining);
  if (selectedSetBalls < 5) {
    selectedSetBalls = remaining >= 5 ? 5 : 0;
  }

  setBallsValueEl.textContent = selectedSetBalls;
  decSetBallsBtn.disabled = selectedSetBalls <= 5;
  incSetBallsBtn.disabled = selectedSetBalls >= remaining;

  const canAddMore = remaining >= 5;
  focusInput.disabled = !canAddMore;
  updateAddSetBtnState();
}

function renderSetsList() {
  setsListEl.innerHTML = "";
  sets.forEach((set, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="set-label">${set.balls} balls &mdash; ${set.focus}</span>
      <button type="button" class="remove-btn" data-index="${index}">&times;</button>
    `;
    setsListEl.appendChild(li);
  });
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
      updateAddSetBtnState();
    });
    recentNamesEl.appendChild(chip);
  });
}

function updateAddSetBtnState() {
  addSetBtn.disabled = focusInput.disabled || focusInput.value.trim().length === 0;
}

decBallsBtn.addEventListener("click", () => {
  if (totalBalls > 5) {
    totalBalls -= 5;
    renderTotalBalls();
  }
});

incBallsBtn.addEventListener("click", () => {
  totalBalls += 5;
  renderTotalBalls();
});

decSetBallsBtn.addEventListener("click", () => {
  if (selectedSetBalls > 5) {
    selectedSetBalls -= 5;
    renderSetBallsStepper();
  }
});

incSetBallsBtn.addEventListener("click", () => {
  if (selectedSetBalls < remainingBalls()) {
    selectedSetBalls += 5;
    renderSetBallsStepper();
  }
});

focusInput.addEventListener("input", updateAddSetBtnState);

addSetBtn.addEventListener("click", () => {
  const focus = focusInput.value.trim();
  if (!focus || selectedSetBalls < 5) return;

  sets.push({ balls: selectedSetBalls, focus });
  rememberSetName(focus);
  focusInput.value = "";
  renderSetsList();
  renderAllocatedTracker();
  renderRecentNames();
});

setsListEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".remove-btn");
  if (!btn) return;
  const index = Number(btn.dataset.index);
  sets.splice(index, 1);
  renderSetsList();
  renderAllocatedTracker();
});

beginSessionBtn.addEventListener("click", () => {
  if (allocatedBalls() !== totalBalls || sets.length === 0) return;

  const draft = {
    totalBalls,
    sets: sets.map((s) => ({ balls: s.balls, focus: s.focus, rating: null, note: "" })),
    currentSetIndex: 0,
    swingThoughts: [],
  };
  saveDraft(draft);
  window.location.href = "practice.html";
});

renderTotalBalls();
renderSetsList();
renderRecentNames();
