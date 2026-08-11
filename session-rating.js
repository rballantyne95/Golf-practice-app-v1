const draft = getDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "index.html";
}

const closeBtn = document.getElementById("closeBtn");
const commitmentScaleEl = document.getElementById("commitmentScale");
const strikeScaleEl = document.getElementById("strikeScale");
const continueBtn = document.getElementById("continueBtn");

const BALL_FLIGHT_GROUPS = [
  { key: "direction", options: ["Push", "Pull", "Straight"], el: document.getElementById("directionGroup") },
  { key: "shape", options: ["Draw", "Slice", "Straight"], el: document.getElementById("shapeGroup") },
  { key: "contact", options: ["Fat", "Thin", "Crisp"], el: document.getElementById("contactGroup") },
  { key: "finish", options: ["Right", "Left", "Straight"], el: document.getElementById("finishGroup") },
];

let commitmentRating = null;
let strikeQuality = null;
const ballFlight = { direction: null, shape: null, contact: null, finish: null };

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

function renderScale(container, selected, onSelect) {
  container.innerHTML = "";
  for (let value = 1; value <= 5; value++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = value;
    if (value === selected) btn.classList.add("selected");
    btn.addEventListener("click", () => onSelect(value));
    container.appendChild(btn);
  }
}

function renderGroup(container, options, selected, onSelect) {
  container.innerHTML = "";
  options.forEach((option) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = option;
    if (option === selected) btn.classList.add("selected");
    btn.addEventListener("click", () => onSelect(option));
    container.appendChild(btn);
  });
}

function updateContinueState() {
  continueBtn.disabled = commitmentRating === null || strikeQuality === null;
}

function renderCommitment() {
  renderScale(commitmentScaleEl, commitmentRating, (value) => {
    commitmentRating = value;
    renderCommitment();
    updateContinueState();
  });
}

function renderStrike() {
  renderScale(strikeScaleEl, strikeQuality, (value) => {
    strikeQuality = value;
    renderStrike();
    updateContinueState();
  });
}

function renderBallFlightGroups() {
  BALL_FLIGHT_GROUPS.forEach(({ key, options, el }) => {
    renderGroup(el, options, ballFlight[key], (value) => {
      ballFlight[key] = ballFlight[key] === value ? null : value;
      renderBallFlightGroups();
    });
  });
}

continueBtn.addEventListener("click", () => {
  if (commitmentRating === null || strikeQuality === null) return;

  draft.commitmentRating = commitmentRating;
  draft.strikeQuality = strikeQuality;
  draft.ballFlight = { ...ballFlight };
  saveDraft(draft);
  window.location.href = "summary.html";
});

if (draft && draft.sets && draft.sets.length > 0) {
  renderCommitment();
  renderStrike();
  renderBallFlightGroups();
  updateContinueState();
}
