const container = document.getElementById("savedSessionsContainer");
const savedSessions = getSavedSessions();

if (savedSessions.length === 0) {
  container.innerHTML = '<div class="empty-state">No saved sessions yet</div>';
} else {
  const list = document.createElement("ul");
  list.className = "sessions-list";

  savedSessions.forEach((session) => {
    const item = document.createElement("li");
    const focuses = session.sets.map((s) => escapeHtml(s.focus)).join(", ");

    item.innerHTML = `
      <a href="saved-session-detail.html?id=${encodeURIComponent(session.id)}" class="session-link">
        <div class="session-date">${escapeHtml(session.name)}</div>
        <div class="session-meta">${escapeHtml(formatFocusList(session.focus))} &middot; ${session.totalBalls} balls · ${session.sets.length} sets</div>
        <div class="session-meta">${focuses}</div>
      </a>
    `;

    list.appendChild(item);
  });

  container.appendChild(list);
}
