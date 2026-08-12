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
let setClubs = [];
let setFocuses = [];

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
  renderRatingSlider(commitmentScaleEl, commitmentRating, (value) => {
    commitmentRating = value;
    renderCommitment();
  });
}

function renderStrike() {
  renderRatingSlider(strikeScaleEl, strikeQuality, (value) => {
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
    title.textContent = `Set ${index + 1}: ${set.balls} balls`;
    block.appendChild(title);

    const clubLabel = document.createElement("div");
    clubLabel.className = "section-label";
    clubLabel.textContent = "Club";
    block.appendChild(clubLabel);

    const clubPicker = document.createElement("div");
    clubPicker.className = "club-grid";
    block.appendChild(clubPicker);

    function renderClub() {
      renderClubPicker(clubPicker, setClubs[index], (value) => {
        setClubs[index] = value;
        renderClub();
      });
    }
    renderClub();

    const focusLabel = document.createElement("div");
    focusLabel.className = "section-label";
    focusLabel.textContent = "Drill/Activity";
    block.appendChild(focusLabel);

    const focusInput = document.createElement("input");
    focusInput.type = "text";
    focusInput.value = setFocuses[index];
    focusInput.addEventListener("input", () => {
      setFocuses[index] = focusInput.value;
    });
    block.appendChild(focusInput);

    const ratingLabel = document.createElement("div");
    ratingLabel.className = "section-label";
    ratingLabel.textContent = "Rating";
    block.appendChild(ratingLabel);

    const ratingRow = document.createElement("div");
    ratingRow.className = "rating-buttons";
    block.appendChild(ratingRow);

    function renderRow() {
      renderGroup(ratingRow, ["Poor", "OK", "Good"], setRatings[index], (value) => {
        setRatings[index] = value;
        renderRow();
      });
    }
    renderRow();

    setRatingsListEl.appendChild(block);
  });
}

saveBtn.addEventListener("click", () => {
  session.commitmentRating = commitmentRating;
  session.strikeQuality = strikeQuality;
  session.ballFlight = { ...ballFlight };
  session.sets.forEach((set, index) => {
    set.rating = setRatings[index];
    set.club = setClubs[index];
    set.focus = setFocuses[index];
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
  setClubs = session.sets.map((s) => s.club || "");
  setFocuses = session.sets.map((s) => s.focus || "");

  renderCommitment();
  renderStrike();
  renderBallFlightGroups();
  renderSetRatings();
}
