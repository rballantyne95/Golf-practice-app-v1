const draft = getDraft();

if (!draft || !draft.sets || draft.sets.length === 0) {
  window.location.href = "index.html";
}

let selectedRating = null;

const setProgressEl = document.getElementById("setProgress");
const setBallsEl = document.getElementById("setBalls");
const setFocusEl = document.getElementById("setFocus");
const completeSetBtn = document.getElementById("completeSetBtn");
const ratingSection = document.getElementById("ratingSection");
const ratingBtns = document.querySelectorAll(".rating-buttons button");
const setNoteEl = document.getElementById("setNote");
const nextSetBtn = document.getElementById("nextSetBtn");
const thoughtCountEl = document.getElementById("thoughtCount");
const thoughtsListEl = document.getElementById("thoughtsList");
const newThoughtInput = document.getElementById("newThought");
const addThoughtBtn = document.getElementById("addThoughtBtn");

function renderCurrentSet() {
  const set = draft.sets[draft.currentSetIndex];
  setProgressEl.textContent = `SET ${draft.currentSetIndex + 1} OF ${draft.sets.length}`;
  setBallsEl.textContent = `${set.balls} BALLS`;
  setFocusEl.textContent = set.focus;

  selectedRating = null;
  setNoteEl.value = "";
  ratingBtns.forEach((b) => b.classList.remove("selected"));
  nextSetBtn.disabled = true;

  ratingSection.classList.add("hidden");
  completeSetBtn.classList.remove("hidden");
}

function renderThoughts() {
  thoughtCountEl.textContent = draft.swingThoughts.length;
  thoughtsListEl.innerHTML = "";
  draft.swingThoughts.forEach((thought) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="set-label">${escapeHtml(thought)}</span>`;
    thoughtsListEl.appendChild(li);
  });
}

completeSetBtn.addEventListener("click", () => {
  completeSetBtn.classList.add("hidden");
  ratingSection.classList.remove("hidden");
});

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

  const set = draft.sets[draft.currentSetIndex];
  set.rating = selectedRating;
  set.note = setNoteEl.value.trim();

  draft.currentSetIndex += 1;
  saveDraft(draft);

  if (draft.currentSetIndex >= draft.sets.length) {
    window.location.href = "summary.html";
  } else {
    renderCurrentSet();
  }
});

addThoughtBtn.addEventListener("click", () => {
  const text = newThoughtInput.value.trim();
  if (!text) return;

  draft.swingThoughts.push(text);
  saveDraft(draft);
  newThoughtInput.value = "";
  renderThoughts();
});

if (draft && draft.sets && draft.sets.length > 0) {
  renderCurrentSet();
  renderThoughts();
}
