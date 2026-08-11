clearDraft();

let totalBalls = 25;
let numberOfSets = 3;
let ballStep = 25;

const totalBallsValueEl = document.getElementById("totalBallsValue");
const decBallsBtn = document.getElementById("decBalls");
const incBallsBtn = document.getElementById("incBalls");
const stepOptionBtns = document.querySelectorAll(".step-option");
const numSetsValueEl = document.getElementById("numSetsValue");
const decSetsBtn = document.getElementById("decSets");
const incSetsBtn = document.getElementById("incSets");
const continueBtn = document.getElementById("continueBtn");

function maxSets() {
  return Math.floor(totalBalls / 5);
}

function renderTotalBalls() {
  totalBallsValueEl.textContent = totalBalls;
  decBallsBtn.disabled = totalBalls <= 5;

  if (numberOfSets > maxSets()) {
    numberOfSets = maxSets();
  }
  renderNumSets();
}

function renderNumSets() {
  numSetsValueEl.textContent = numberOfSets;
  decSetsBtn.disabled = numberOfSets <= 1;
  incSetsBtn.disabled = numberOfSets >= maxSets();
}

decBallsBtn.addEventListener("click", () => {
  if (totalBalls > 5) {
    totalBalls = Math.max(5, totalBalls - ballStep);
    renderTotalBalls();
  }
});

incBallsBtn.addEventListener("click", () => {
  totalBalls += ballStep;
  renderTotalBalls();
});

stepOptionBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    stepOptionBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    ballStep = Number(btn.dataset.step);
  });
});

decSetsBtn.addEventListener("click", () => {
  if (numberOfSets > 1) {
    numberOfSets -= 1;
    renderNumSets();
  }
});

incSetsBtn.addEventListener("click", () => {
  if (numberOfSets < maxSets()) {
    numberOfSets += 1;
    renderNumSets();
  }
});

continueBtn.addEventListener("click", () => {
  const draft = {
    totalBalls,
    numberOfSets,
    sets: [],
    buildIndex: 0,
  };
  saveDraft(draft);
  window.location.href = "build-sets.html";
});

renderTotalBalls();
renderNumSets();
