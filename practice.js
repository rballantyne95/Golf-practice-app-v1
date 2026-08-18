const draft = getDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "index.html";
}

let selectedRating = null;

const closeBtn = document.getElementById("closeBtn");
const sessionFocusBannerEl = document.getElementById("sessionFocusBanner");
const setProgressEl = document.getElementById("setProgress");
const setBallsEl = document.getElementById("setBalls");
const clubPickerEl = document.getElementById("clubPicker");
const setFocusEl = document.getElementById("setFocus");
const completeSetBtn = document.getElementById("completeSetBtn");
const ratingSection = document.getElementById("ratingSection");
const ratingBtns = document.querySelectorAll(".rating-buttons button");
const thoughtReviewListEl = document.getElementById("thoughtReviewList");
const setNoteEl = document.getElementById("setNote");
const nextSetBtn = document.getElementById("nextSetBtn");
const thoughtCountEl = document.getElementById("thoughtCount");
const thoughtsEmptyLibraryEl = document.getElementById("thoughtsEmptyLibrary");
const thoughtsPickerEl = document.getElementById("thoughtsPicker");
const newThoughtInput = document.getElementById("newThought");
const addThoughtBtn = document.getElementById("addThoughtBtn");

// thoughtId -> { result, achieved: Set, note } for the review blocks shown
// after rating the current set. Rebuilt each time the rating section opens.
let reviewState = {};

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

function currentSet() {
  const set = draft.sets[draft.currentSetIndex];
  if (!set.swingThoughtIds) set.swingThoughtIds = [];
  return set;
}

function renderClubForCurrentSet() {
  const set = currentSet();
  renderClubPicker(clubPickerEl, set.club || "", (value) => {
    set.club = value;
    saveDraft(draft);
    renderClubForCurrentSet();
  });
}

function renderCurrentSet() {
  const set = currentSet();
  setProgressEl.textContent = `SET ${draft.currentSetIndex + 1} OF ${draft.sets.length}`;
  setBallsEl.innerHTML = `<span class="metric-value">${set.balls}</span><span class="metric-unit">BALLS</span>`;
  setFocusEl.textContent = set.focus;
  renderClubForCurrentSet();

  selectedRating = null;
  setNoteEl.value = "";
  ratingBtns.forEach((b) => b.classList.remove("selected"));
  nextSetBtn.disabled = true;
  thoughtReviewListEl.innerHTML = "";
  reviewState = {};

  ratingSection.classList.add("hidden");
  completeSetBtn.classList.remove("hidden");

  renderThoughtsPicker();
}

// The per-set swing-thought library picker: every saved thought, toggleable
// on/off for the set currently being hit, plus a quick "add new" row.
function renderThoughtsPicker() {
  const set = currentSet();
  const thoughts = getSwingThoughts();

  thoughtCountEl.textContent = set.swingThoughtIds.length;
  thoughtsEmptyLibraryEl.classList.toggle("hidden", thoughts.length > 0);
  thoughtsPickerEl.innerHTML = "";

  thoughts.forEach((thought) => {
    const stats = swingThoughtStats(thought);
    const isSelected = set.swingThoughtIds.includes(thought.id);

    const row = document.createElement("button");
    row.type = "button";
    row.className = "thought-pick-row" + (isSelected ? " selected" : "");

    const statLine =
      stats.timesUsed === 0
        ? "Not used yet"
        : `${stats.positive} positive &middot; ${stats.negative} negative`;

    row.innerHTML = `
      <span class="thought-pick-name">${escapeHtml(thought.name)}</span>
      <span class="thought-pick-meta">
        ${renderStatusBadge(thought.status)}
        <span class="thought-pick-stat">${statLine}</span>
      </span>
    `;

    row.addEventListener("click", () => {
      const idx = set.swingThoughtIds.indexOf(thought.id);
      if (idx >= 0) {
        set.swingThoughtIds.splice(idx, 1);
      } else {
        set.swingThoughtIds.push(thought.id);
      }
      saveDraft(draft);
      renderThoughtsPicker();
    });

    thoughtsPickerEl.appendChild(row);
  });
}

addThoughtBtn.addEventListener("click", () => {
  const text = newThoughtInput.value.trim();
  if (!text) return;

  const thought = createSwingThought({ name: text, status: "unsure" });
  const set = currentSet();
  set.swingThoughtIds.push(thought.id);
  saveDraft(draft);

  newThoughtInput.value = "";
  renderThoughtsPicker();
});

completeSetBtn.addEventListener("click", () => {
  completeSetBtn.classList.add("hidden");
  ratingSection.classList.remove("hidden");
  renderThoughtReviewBlocks();
});

// One block per swing thought attached to this set, shown once rating
// begins: how it went, what it helped with, and an optional note. Entirely
// optional — leaving a block untouched simply records no result this time.
function renderThoughtReviewBlocks() {
  const set = currentSet();
  reviewState = {};
  thoughtReviewListEl.innerHTML = "";

  set.swingThoughtIds.forEach((thoughtId) => {
    const thought = getSwingThought(thoughtId);
    if (!thought) return;

    reviewState[thoughtId] = { result: null, achieved: [], note: "" };

    const block = document.createElement("div");
    block.className = "set-rating-block thought-review-block";

    const title = document.createElement("div");
    title.className = "section-label";
    title.textContent = `How did "${thought.name}" work?`;
    block.appendChild(title);

    const resultRow = document.createElement("div");
    resultRow.className = "rating-buttons";
    block.appendChild(resultRow);

    function renderResultRow() {
      resultRow.innerHTML = "";
      [
        { value: "worked", label: "Worked" },
        { value: "didnt_work", label: "Didn't Work" },
        { value: "unsure", label: "Not Sure" },
      ].forEach(({ value, label }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = label;
        if (reviewState[thoughtId].result === value) btn.classList.add("selected");
        btn.addEventListener("click", () => {
          reviewState[thoughtId].result = reviewState[thoughtId].result === value ? null : value;
          renderResultRow();
        });
        resultRow.appendChild(btn);
      });
    }
    renderResultRow();

    const achievedLabel = document.createElement("div");
    achievedLabel.className = "section-label";
    achievedLabel.textContent = "What did it achieve?";
    block.appendChild(achievedLabel);

    const achievedRow = document.createElement("div");
    achievedRow.className = "chip-row";
    block.appendChild(achievedRow);

    function renderAchievedRow() {
      achievedRow.innerHTML = "";
      SWING_THOUGHT_ACHIEVED_TAGS.forEach((tag) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chip" + (reviewState[thoughtId].achieved.includes(tag) ? " selected" : "");
        chip.textContent = tag;
        chip.addEventListener("click", () => {
          const list = reviewState[thoughtId].achieved;
          const idx = list.indexOf(tag);
          if (idx >= 0) list.splice(idx, 1);
          else list.push(tag);
          renderAchievedRow();
        });
        achievedRow.appendChild(chip);
      });
    }
    renderAchievedRow();

    const noteInput = document.createElement("textarea");
    noteInput.placeholder = "What happened? (optional)";
    noteInput.addEventListener("input", () => {
      reviewState[thoughtId].note = noteInput.value;
    });
    block.appendChild(noteInput);

    thoughtReviewListEl.appendChild(block);
  });
}

ratingBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    ratingBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedRating = btn.dataset.rating;
    nextSetBtn.disabled = false;
  });
});

nextSetBtn.addEventListener("click", () => {
  if (!selectedRating) return;

  const set = currentSet();
  set.rating = selectedRating;
  set.note = setNoteEl.value.trim();

  // Stash each reviewed thought's result on the set itself. The result is
  // only written into the swing thought's own history once the session is
  // actually saved (in summary.js), since only then does it have a real
  // session id to record the use against.
  set.swingThoughtResults = set.swingThoughtResults || {};
  Object.keys(reviewState).forEach((thoughtId) => {
    const r = reviewState[thoughtId];
    if (r.result || r.achieved.length > 0 || r.note.trim()) {
      set.swingThoughtResults[thoughtId] = { result: r.result, achieved: r.achieved.slice(), note: r.note.trim() };
    }
  });

  draft.currentSetIndex += 1;
  saveDraft(draft);

  if (draft.currentSetIndex >= draft.sets.length) {
    window.location.href = "session-rating.html";
  } else {
    renderCurrentSet();
  }
});

if (draft && draft.sets && draft.sets.length > 0) {
  const focuses = normalizeFocusList(draft.focus);
  const focusLabels = focuses.length ? focuses : ["No focus set"];
  sessionFocusBannerEl.innerHTML = focusLabels
    .map((f) => `<span class="focus-pill">${escapeHtml(f)}</span>`)
    .join("");
  renderCurrentSet();
}
