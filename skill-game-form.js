const params = new URLSearchParams(window.location.search);
const editId = params.get("id");
const existing = editId ? getSkillGame(editId) : null;

const BALL_STEP = 5;
const MIN_BALLS = 5;
const MAX_BALLS = 100;

const backLink = document.getElementById("backLink");
const formTitle = document.getElementById("formTitle");
const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");
const setsListEl = document.getElementById("setsList");
const addSetBtn = document.getElementById("addSetBtn");
const totalTrackerEl = document.getElementById("totalTracker");
const saveBtn = document.getElementById("saveBtn");

// Working copy. Only written back to storage when Save succeeds, so an
// abandoned edit never changes the saved game.
let sets = [{ balls: 10, club: "", game: "" }];
let showErrors = false;

if (editId && !existing) {
  window.location.href = "skill-zone.html";
}

if (existing) {
  formTitle.textContent = "Edit Skill Game";
  backLink.href = `skill-game-detail.html?id=${encodeURIComponent(existing.id)}`;
  nameInput.value = existing.name;
  sets = existing.sets.map((s) => ({ balls: s.balls, club: s.club || "", game: s.game }));
}

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim()) nameError.classList.add("hidden");
});

function renderTotal() {
  const totalBalls = skillTotalBalls(sets);
  totalTrackerEl.textContent = `${totalBalls} balls · ${sets.length} set${sets.length === 1 ? "" : "s"}`;
}

function renderSets() {
  setsListEl.innerHTML = "";

  sets.forEach((set, index) => {
    const block = document.createElement("div");
    block.className = "set-rating-block";

    const header = document.createElement("div");
    header.className = "skill-set-header";
    const title = document.createElement("span");
    title.className = "summary-set-title";
    title.textContent = `Set ${index + 1}`;
    header.appendChild(title);

    if (sets.length > 1) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-set-btn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        sets.splice(index, 1);
        renderSets();
        renderTotal();
      });
      header.appendChild(removeBtn);
    }
    block.appendChild(header);

    const ballsLabel = document.createElement("div");
    ballsLabel.className = "section-label";
    ballsLabel.textContent = "Balls";
    block.appendChild(ballsLabel);

    const stepper = document.createElement("div");
    stepper.className = "stepper";
    const decBtn = document.createElement("button");
    decBtn.type = "button";
    decBtn.innerHTML = "&minus;";
    const valueEl = document.createElement("span");
    valueEl.className = "stepper-value";
    valueEl.textContent = set.balls;
    const incBtn = document.createElement("button");
    incBtn.type = "button";
    incBtn.textContent = "+";
    stepper.append(decBtn, valueEl, incBtn);
    block.appendChild(stepper);

    function updateBalls(next) {
      set.balls = Math.min(MAX_BALLS, Math.max(MIN_BALLS, next));
      valueEl.textContent = set.balls;
      decBtn.disabled = set.balls <= MIN_BALLS;
      incBtn.disabled = set.balls >= MAX_BALLS;
      renderTotal();
    }
    decBtn.addEventListener("click", () => updateBalls(set.balls - BALL_STEP));
    incBtn.addEventListener("click", () => updateBalls(set.balls + BALL_STEP));
    updateBalls(set.balls);

    const clubLabel = document.createElement("div");
    clubLabel.className = "section-label";
    clubLabel.textContent = "Club";
    block.appendChild(clubLabel);

    const clubPicker = document.createElement("div");
    clubPicker.className = "club-grid";
    block.appendChild(clubPicker);

    function renderClub() {
      renderClubPicker(clubPicker, set.club, (value) => {
        set.club = value;
        renderClub();
      });
    }
    renderClub();

    const gameLabel = document.createElement("div");
    gameLabel.className = "section-label";
    gameLabel.textContent = "Game / Skill";
    block.appendChild(gameLabel);

    const gameInput = document.createElement("input");
    gameInput.type = "text";
    gameInput.placeholder = "e.g. 70 yard dispersion";
    gameInput.value = set.game;
    block.appendChild(gameInput);

    const gameError = document.createElement("div");
    gameError.className = "field-error";
    gameError.textContent = "Describe the game or skill this set tests";
    gameError.classList.toggle("hidden", !showErrors || set.game.trim().length > 0);
    block.appendChild(gameError);

    gameInput.addEventListener("input", () => {
      set.game = gameInput.value;
      gameError.classList.toggle("hidden", set.game.trim().length > 0);
    });

    setsListEl.appendChild(block);
  });
}

addSetBtn.addEventListener("click", () => {
  const previous = sets[sets.length - 1];
  // Carry the previous set's balls and club forward — most skill games
  // repeat the same club and ball count across sets.
  sets.push({ balls: previous ? previous.balls : 10, club: previous ? previous.club : "", game: "" });
  renderSets();
  renderTotal();
});

saveBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  showErrors = true;

  const missingGame = sets.some((s) => !s.game.trim());
  if (!name) nameError.classList.remove("hidden");
  if (missingGame) renderSets();

  if (!name) {
    nameInput.focus();
    return;
  }
  if (missingGame) return;

  if (existing) {
    updateSkillGame(existing.id, {
      name,
      sets: sets.map((s) => ({ balls: s.balls, club: s.club || "", game: s.game.trim() })),
    });
    window.location.href = `skill-game-detail.html?id=${encodeURIComponent(existing.id)}`;
  } else {
    const game = createSkillGame({ name, sets });
    window.location.href = `skill-game-detail.html?id=${encodeURIComponent(game.id)}`;
  }
});

renderSets();
renderTotal();
