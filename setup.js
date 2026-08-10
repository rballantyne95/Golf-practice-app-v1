clearDraft();

let totalBalls = 25;
let numberOfSets = 3;

const totalBallsValueEl = document.getElementById("totalBallsValue");
const decBallsBtn = document.getElementById("decBalls");
const incBallsBtn = document.getElementById("incBalls");
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
    totalBalls -= 5;
    renderTotalBalls();
  }
});

incBallsBtn.addEventListener("click", () => {
  totalBalls += 5;
  renderTotalBalls();
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
