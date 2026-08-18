const container = document.getElementById("sessionsContainer");
const sessions = getSessions();

if (sessions.length === 0) {
  container.innerHTML = '<div class="empty-state">No sessions yet</div>';
} else {
  const list = document.createElement("ul");
  list.className = "sessions-list";

  sessions.forEach((session) => {
    const item = document.createElement("li");
    const focuses = session.sets.map((s) => escapeHtml(s.focus)).join(", ");

    const bf = session.ballFlight || {};
    const badges = [];
    if (bf.direction) badges.push({ text: bf.direction, cls: "" });
    if (bf.contact) {
      const cls = bf.contact === "Crisp" ? "good" : bf.contact === "Fat" || bf.contact === "Thin" ? "miss" : "";
      badges.push({ text: bf.contact, cls });
    }
    if (bf.shape) badges.push({ text: bf.shape, cls: "" });

    const badgesHtml = badges.length
      ? `<div class="session-flight-badges">${badges
          .map((b) => `<span class="flight-badge${b.cls ? " " + b.cls : ""}">${escapeHtml(b.text)}</span>`)
          .join("")}</div>`
      : "";

    item.innerHTML = `
      <a href="session-detail.html?id=${encodeURIComponent(session.id)}" class="session-link">
        ${badgesHtml}
        <div class="session-date">${formatDate(session.date)} &middot; ${escapeHtml(formatFocusList(session.focus))}</div>
        <div class="session-meta">${session.totalBalls} balls · ${session.sets.length} sets</div>
        <div class="session-meta">${focuses}</div>
      </a>
    `;

    list.appendChild(item);
  });

  container.appendChild(list);
}
