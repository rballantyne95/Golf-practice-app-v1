clearDraft();

let totalBalls = 25;
let selectedSetBalls = 5;
const sets = [];

const totalBallsValueEl = document.getElementById("totalBallsValue");
const decBallsBtn = document.getElementById("decBalls");
const incBallsBtn = document.getElementById("incBalls");
const allocatedTrackerEl = document.getElementById("allocatedTracker");
const ballOptionBtns = document.querySelectorAll(".ball-option");
const focusInput = document.getElementById("focusInput");
const addSetBtn = document.getElementById("addSetBtn");
const setsListEl = document.getElementById("setsList");
const beginSessionBtn = document.getElementById("beginSessionBtn");

function allocatedBalls() {
  return sets.reduce((sum, s) => sum + s.balls, 0);
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

function updateAddSetBtnState() {
  addSetBtn.disabled = focusInput.value.trim().length === 0;
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

ballOptionBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    ballOptionBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedSetBalls = Number(btn.dataset.balls);
  });
});

focusInput.addEventListener("input", updateAddSetBtnState);

addSetBtn.addEventListener("click", () => {
  const focus = focusInput.value.trim();
  if (!focus) return;

  sets.push({ balls: selectedSetBalls, focus });
  focusInput.value = "";
  updateAddSetBtnState();
  renderSetsList();
  renderAllocatedTracker();
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
