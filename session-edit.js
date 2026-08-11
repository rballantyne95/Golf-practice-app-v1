const params = new URLSearchParams(window.location.search);
const sessionId = params.get("id");
const sessions = getSessions();
const session = sessions.find((s) => s.id === sessionId);

if (!session) {
  window.location.href = "index.html";
}

const backLink = document.getElementById("backLink");
const commitmentScaleEl = document.getElementById("commitmentScale");
const strikeScaleEl = document.getElementById("strikeScale");
const setRatingsListEl = document.getElementById("setRatingsList");
const saveBtn = document.getElementById("saveBtn");

const BALL_FLIGHT_GROUPS = [
  { key: "direction", options: ["Push", "Pull", "Straight"], el: document.getElementById("directionGroup") },
  { key: "shape", options: ["Draw", "Slice", "Straight"], el: document.getElementById("shapeGroup") },
  { key: "contact", options: ["Fat", "Thin", "Crisp"], el: document.getElementById("contactGroup") },
];

let commitmentRating = null;
let strikeQuality = null;
const ballFlight = { direction: null, shape: null, contact: null };
let setRatings = [];

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

function renderCommitment() {
  renderScale(commitmentScaleEl, commitmentRating, (value) => {
    commitmentRating = value;
    renderCommitment();
  });
}

function renderStrike() {
  renderScale(strikeScaleEl, strikeQuality, (value) => {
    strikeQuality = value;
    renderStrike();
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

function renderSetRatings() {
  setRatingsListEl.innerHTML = "";
  session.sets.forEach((set, index) => {
    const block = document.createElement("div");
    block.className = "set-rating-block";

    const title = document.createElement("div");
    title.className = "summary-set-title";
    title.innerHTML = `Set ${index + 1}: ${ballsAndClubLabel(set)} &mdash; ${escapeHtml(set.focus)}`;

    const ratingRow = document.createElement("div");
    ratingRow.className = "rating-buttons";

    block.appendChild(title);
    block.appendChild(ratingRow);
    setRatingsListEl.appendChild(block);

    function renderRow() {
      renderGroup(ratingRow, ["Poor", "OK", "Good"], setRatings[index], (value) => {
        setRatings[index] = value;
        renderRow();
      });
    }
    renderRow();
  });
}

saveBtn.addEventListener("click", () => {
  session.commitmentRating = commitmentRating;
  session.strikeQuality = strikeQuality;
  session.ballFlight = { ...ballFlight };
  session.sets.forEach((set, index) => {
    set.rating = setRatings[index];
  });
  saveSessions(sessions);
  window.location.href = `session-detail.html?id=${encodeURIComponent(sessionId)}`;
});

if (session) {
  backLink.href = `session-detail.html?id=${encodeURIComponent(sessionId)}`;
  commitmentRating = session.commitmentRating != null ? session.commitmentRating : null;
  strikeQuality = session.strikeQuality != null ? session.strikeQuality : null;
  ballFlight.direction = (session.ballFlight && session.ballFlight.direction) || null;
  ballFlight.shape = (session.ballFlight && session.ballFlight.shape) || null;
  ballFlight.contact = (session.ballFlight && session.ballFlight.contact) || null;
  setRatings = session.sets.map((s) => s.rating);

  renderCommitment();
  renderStrike();
  renderBallFlightGroups();
  renderSetRatings();
}
