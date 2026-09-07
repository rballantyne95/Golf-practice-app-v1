const BACKUP_APP_ID = "golf-practice-app";
const BACKUP_VERSION = 1;
const BACKUP_KEYS = [
  "golfSessions",
  "golfSavedSessions",
  "golfSetNames",
  "golfCustomFocusAreas",
  "golfSwingThoughts",
  "golfSkillGames",
  "golfSkillAttempts",
];

const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFileInput = document.getElementById("importFileInput");
const statusMessageEl = document.getElementById("statusMessage");
const importConfirmEl = document.getElementById("importConfirm");
const importSummaryEl = document.getElementById("importSummary");
const confirmRestoreBtn = document.getElementById("confirmRestoreBtn");
const cancelRestoreBtn = document.getElementById("cancelRestoreBtn");

// Holds the fully validated backup data while the user reviews the summary.
// Nothing is written to localStorage until confirmRestoreBtn is clicked.
let pendingBackupData = null;

function showStatus(message, kind) {
  statusMessageEl.textContent = message;
  statusMessageEl.className = "status-message" + (kind ? " " + kind : "");
}

function clearStatus() {
  statusMessageEl.textContent = "";
  statusMessageEl.className = "hidden";
}

function readAllData() {
  const data = {};
  BACKUP_KEYS.forEach((key) => {
    const raw = localStorage.getItem(key);
    data[key] = raw ? JSON.parse(raw) : [];
  });
  return data;
}

exportBtn.addEventListener("click", () => {
  const backup = {
    app: BACKUP_APP_ID,
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: readAllData(),
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const a = document.createElement("a");
  a.href = url;
  a.download = `golf-practice-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showStatus("Backup exported.", "success");
});

importBtn.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", () => {
  const file = importFileInput.files[0];
  importFileInput.value = ""; // allow re-selecting the same file later
  if (!file) return;

  clearStatus();
  importConfirmEl.classList.add("hidden");
  pendingBackupData = null;

  const reader = new FileReader();

  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (err) {
      showStatus("That file isn't valid JSON. Please choose a golf practice backup file.", "error");
      return;
    }

    const result = validateBackup(parsed);
    if (!result.ok) {
      showStatus(result.message, "error");
      return;
    }

    pendingBackupData = result.data;
    importSummaryEl.textContent = summarize(result.data);
    importConfirmEl.classList.remove("hidden");
  };

  reader.onerror = () => {
    showStatus("Couldn't read that file. Please try again.", "error");
  };

  reader.readAsText(file);
});

function validateBackup(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, message: "That file doesn't look like a golf practice backup." };
  }
  if (parsed.app !== BACKUP_APP_ID) {
    return { ok: false, message: "That file doesn't look like a golf practice backup." };
  }
  if (typeof parsed.backupVersion !== "number") {
    return { ok: false, message: "That backup file is missing a version number and can't be trusted." };
  }
  if (parsed.backupVersion > BACKUP_VERSION) {
    return { ok: false, message: "This backup was made with a newer version of the app. Please update the app before restoring it." };
  }
  if (!parsed.data || typeof parsed.data !== "object" || !Array.isArray(parsed.data.golfSessions)) {
    return { ok: false, message: "That backup file is incomplete or corrupted." };
  }

  const data = {};
  BACKUP_KEYS.forEach((key) => {
    data[key] = Array.isArray(parsed.data[key]) ? parsed.data[key] : [];
  });

  return { ok: true, data };
}

function summarize(data) {
  const sessions = data.golfSessions;
  const sessionCount = sessions.length;
  const totalBalls = sessions.reduce((sum, s) => sum + (s.totalBalls || 0), 0);
  // Counts both the legacy free-text per-session thoughts (older backups)
  // and the newer swing-thought library entries, so the summary stays
  // accurate for a backup made with either version of the app.
  const legacyThoughtCount = sessions.reduce(
    (sum, s) => sum + (Array.isArray(s.swingThoughts) ? s.swingThoughts.length : 0),
    0
  );
  const libraryCount = Array.isArray(data.golfSwingThoughts) ? data.golfSwingThoughts.length : 0;
  const thoughtCount = legacyThoughtCount + libraryCount;
  let summary = `This backup contains ${sessionCount} session${sessionCount === 1 ? "" : "s"}, ${totalBalls} ball${totalBalls === 1 ? "" : "s"} and ${thoughtCount} swing thought${thoughtCount === 1 ? "" : "s"}.`;

  // Only mentioned when there is Skill Zone data, so backups made before
  // that feature existed don't read as if something is missing.
  const gameCount = Array.isArray(data.golfSkillGames) ? data.golfSkillGames.length : 0;
  const attemptCount = Array.isArray(data.golfSkillAttempts) ? data.golfSkillAttempts.length : 0;
  if (gameCount > 0 || attemptCount > 0) {
    summary += ` It also includes ${gameCount} skill game${gameCount === 1 ? "" : "s"} and ${attemptCount} recorded attempt${attemptCount === 1 ? "" : "s"}.`;
  }

  return summary;
}

cancelRestoreBtn.addEventListener("click", () => {
  pendingBackupData = null;
  importConfirmEl.classList.add("hidden");
  clearStatus();
});

confirmRestoreBtn.addEventListener("click", () => {
  if (!pendingBackupData) return;
  BACKUP_KEYS.forEach((key) => {
    localStorage.setItem(key, JSON.stringify(pendingBackupData[key]));
  });
  window.location.href = "index.html";
});
