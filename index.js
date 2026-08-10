const container = document.getElementById("sessionsContainer");
const sessions = getSessions();

if (sessions.length === 0) {
  container.innerHTML = '<div class="empty-state">No sessions yet</div>';
} else {
  const list = document.createElement("ul");
  list.className = "sessions-list";

  sessions.forEach((session) => {
    const item = document.createElement("li");
    const focuses = session.sets.map((s) => s.focus).join(", ");

    item.innerHTML = `
      <div class="session-date">${formatDate(session.date)}</div>
      <div class="session-meta">${session.totalBalls} balls · ${session.sets.length} sets</div>
      <div class="session-meta">${focuses}</div>
    `;

    list.appendChild(item);
  });

  container.appendChild(list);
}
