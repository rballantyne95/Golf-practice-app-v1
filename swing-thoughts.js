const filterToggle = document.getElementById("filterToggle");
const thoughtsContainer = document.getElementById("thoughtsContainer");

let currentFilter = "all";

function render() {
  const thoughts = getSwingThoughts();
  const filtered = currentFilter === "all" ? thoughts : thoughts.filter((t) => t.status === currentFilter);

  if (thoughts.length === 0) {
    thoughtsContainer.innerHTML =
      '<div class="empty-state">No swing thoughts yet. Add one to start your library.</div>';
    return;
  }

  if (filtered.length === 0) {
    thoughtsContainer.innerHTML = '<div class="empty-state">No swing thoughts in this filter yet.</div>';
    return;
  }

  const list = document.createElement("ul");
  list.className = "sessions-list";
  filtered.forEach((thought) => {
    const stats = swingThoughtStats(thought);
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="swing-thought-detail.html?id=${encodeURIComponent(thought.id)}" class="session-link">
        <div class="thought-card-header">
          <span class="session-date">${escapeHtml(thought.name)}</span>
          ${renderStatusBadge(thought.status)}
        </div>
        ${thought.notes ? `<div class="session-meta">${escapeHtml(thought.notes)}</div>` : ""}
        <div class="session-meta">Used ${stats.timesUsed} time${stats.timesUsed === 1 ? "" : "s"}</div>
      </a>
    `;
    list.appendChild(li);
  });

  thoughtsContainer.innerHTML = "";
  thoughtsContainer.appendChild(list);
}

filterToggle.querySelectorAll(".step-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    filterToggle.querySelectorAll(".step-option").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
