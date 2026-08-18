const params = new URLSearchParams(window.location.search);
const thoughtId = params.get("id");
let thought = getSwingThought(thoughtId);

if (!thought) {
  window.location.href = "swing-thoughts.html";
}

const thoughtNameEl = document.getElementById("thoughtName");
const statusBadgeRowEl = document.getElementById("statusBadgeRow");
const thoughtGoalEl = document.getElementById("thoughtGoal");
const statusOverrideEl = document.getElementById("statusOverride");
const usageCountEl = document.getElementById("usageCount");
const usageBreakdownEl = document.getElementById("usageBreakdown");
const achievedSectionEl = document.getElementById("achievedSection");
const achievedTagsEl = document.getElementById("achievedTags");
const historyListEl = document.getElementById("historyList");
const editLink = document.getElementById("editLink");
const deleteBtn = document.getElementById("deleteBtn");
const deleteConfirmEl = document.getElementById("deleteConfirm");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

const RESULT_LABELS = { worked: "Worked", didnt_work: "Didn't Work", unsure: "Not Sure" };
const RESULT_STATUS_MAP = { worked: "works", didnt_work: "doesnt_work", unsure: "unsure" };

function render() {
  thoughtNameEl.textContent = thought.name;
  statusBadgeRowEl.innerHTML = renderStatusBadge(thought.status);

  const goalText = [thought.goal, thought.notes].filter(Boolean).join(" — ");
  thoughtGoalEl.textContent = goalText;
  thoughtGoalEl.classList.toggle("hidden", goalText.length === 0);

  statusOverrideEl.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.status === thought.status);
  });

  const stats = swingThoughtStats(thought);
  usageCountEl.textContent = `Used ${stats.timesUsed} time${stats.timesUsed === 1 ? "" : "s"}`;
  usageBreakdownEl.textContent =
    stats.timesUsed === 0
      ? "Not tried yet"
      : `${stats.positive} positive · ${stats.negative} negative · ${stats.unsure} unsure`;

  const achieved = new Map();
  (thought.history || [])
    .filter((h) => h.result === "worked")
    .forEach((h) => (h.achieved || []).forEach((tag) => achieved.set(tag, (achieved.get(tag) || 0) + 1)));
  const achievedTags = Array.from(achieved.entries()).sort((a, b) => b[1] - a[1]);

  achievedSectionEl.classList.toggle("hidden", achievedTags.length === 0);
  achievedTagsEl.innerHTML = achievedTags.map(([tag]) => `<span class="chip">${escapeHtml(tag)}</span>`).join("");

  historyListEl.innerHTML = "";
  const history = thought.history || [];
  if (history.length === 0) {
    historyListEl.innerHTML = '<div class="empty-state">No history yet. Attach this thought to a practice set to start recording results.</div>';
  } else {
    const list = document.createElement("ul");
    list.className = "summary-sets";
    history.forEach((entry) => {
      const li = document.createElement("li");
      const label = entry.club ? `${entry.balls} balls · ${escapeHtml(entry.club)}` : `${entry.balls} balls`;
      const badge = entry.result
        ? renderStatusBadge(RESULT_STATUS_MAP[entry.result])
        : '<span class="thought-pick-stat">Not reviewed</span>';
      li.innerHTML = `
        <div class="summary-set-title">${formatDate(entry.date)} · ${label}</div>
        <div class="thought-history-badge">${badge}</div>
        ${entry.note ? `<div class="summary-set-note">${escapeHtml(entry.note)}</div>` : ""}
      `;
      list.appendChild(li);
    });
    historyListEl.appendChild(list);
  }

  editLink.href = `swing-thought-form.html?id=${encodeURIComponent(thought.id)}`;
}

statusOverrideEl.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    thought = updateSwingThought(thought.id, { status: btn.dataset.status });
    render();
  });
});

deleteBtn.addEventListener("click", () => {
  deleteConfirmEl.classList.remove("hidden");
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteConfirmEl.classList.add("hidden");
});

confirmDeleteBtn.addEventListener("click", () => {
  deleteSwingThought(thought.id);
  window.location.href = "swing-thoughts.html";
});

if (thought) {
  render();
}
