const textareaEl = document.getElementById("sessionText");
const parseErrorEl = document.getElementById("parseError");
const parseBtn = document.getElementById("parseBtn");
const closeBtn = document.getElementById("closeBtn");
const focusAreaPickerEl = document.getElementById("focusAreaPicker");
const newFocusAreaInput = document.getElementById("newFocusArea");
const addFocusAreaBtn = document.getElementById("addFocusAreaBtn");

let selectedFocusAreas = [];

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

function renderFocusArea() {
  renderFocusAreaPicker(focusAreaPickerEl, selectedFocusAreas, (area) => {
    const index = selectedFocusAreas.indexOf(area);
    if (index >= 0) {
      selectedFocusAreas.splice(index, 1);
    } else if (selectedFocusAreas.length < MAX_SESSION_FOCUSES) {
      selectedFocusAreas.push(area);
    }
    parseErrorEl.classList.add("hidden");
    renderFocusArea();
  });
}

addFocusAreaBtn.addEventListener("click", () => {
  const name = newFocusAreaInput.value.trim();
  if (!name) return;

  addCustomFocusArea(name);
  if (!selectedFocusAreas.includes(name) && selectedFocusAreas.length < MAX_SESSION_FOCUSES) {
    selectedFocusAreas.push(name);
  }
  newFocusAreaInput.value = "";
  parseErrorEl.classList.add("hidden");
  renderFocusArea();
});

renderFocusArea();

// Recognizes two line shapes per set:
//   "Balls 1-20: description"  (a ball range, "Balls" optional after the first line)
//   "20 balls: description"    (a direct count, an optional leading "Set 1" is ignored)
// Dashes may be a hyphen or an en/em dash, since pasted AI text often uses those.
const RANGE_PATTERN = /^(?:balls?\s+)?(\d+)\s*[-–—]\s*(\d+)\s*:\s*(.+)$/i;
const COUNT_PATTERN = /^(?:set\s*\d+\s*[:\-]?\s*)?\(?(\d+)\s*balls?\)?\s*[:\-]\s*(.+)$/i;

// A club is only recognized when it's the very first thing in the
// description (as in "8 iron, Swing Guide, 50%..."), since matching a club
// name anywhere in free text risks false positives. Maps common spoken/
// written forms to our fixed club list.
const CLUB_ALIASES = [
  { pattern: /^9[\s-]?iron\b/i, club: "9i" },
  { pattern: /^8[\s-]?iron\b/i, club: "8i" },
  { pattern: /^7[\s-]?iron\b/i, club: "7i" },
  { pattern: /^6[\s-]?iron\b/i, club: "6i" },
  { pattern: /^5[\s-]?iron\b/i, club: "5i" },
  { pattern: /^pitching[\s-]?wedge\b/i, club: "PW" },
  { pattern: /^pw\b/i, club: "PW" },
  { pattern: /^hybrid\b/i, club: "4h" },
  { pattern: /^5[\s-]?wood\b/i, club: "5w" },
  { pattern: /^driver\b/i, club: "Dr" },
];

function extractLeadingClub(description) {
  for (const { pattern, club } of CLUB_ALIASES) {
    const match = description.match(pattern);
    if (match) {
      const rest = description.slice(match[0].length).replace(/^[,\s]+/, "");
      return { club, description: rest };
    }
  }
  return { club: "", description };
}

function parseSessionText(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^[*\-•]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
    .map((line) => {
      const rangeMatch = line.match(RANGE_PATTERN);
      if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        const { club, description } = extractLeadingClub(rangeMatch[3].trim());
        return { balls: end - start + 1, focus: description, club };
      }

      const countMatch = line.match(COUNT_PATTERN);
      if (countMatch) {
        const { club, description } = extractLeadingClub(countMatch[2].trim());
        return { balls: parseInt(countMatch[1], 10), focus: description, club };
      }

      return null;
    })
    .filter((set) => set && set.balls > 0 && set.focus.length > 0);
}

parseBtn.addEventListener("click", () => {
  if (selectedFocusAreas.length === 0) {
    parseErrorEl.textContent = "Choose or add a focus for this session before parsing.";
    parseErrorEl.classList.remove("hidden");
    return;
  }

  const sets = parseSessionText(textareaEl.value);

  if (sets.length === 0) {
    parseErrorEl.textContent =
      'Couldn’t find any sets in that text. Try one line per set, like "Balls 1-20: description" or "20 balls: description".';
    parseErrorEl.classList.remove("hidden");
    return;
  }

  parseErrorEl.classList.add("hidden");

  const totalBalls = sets.reduce((sum, s) => sum + s.balls, 0);
  const draft = {
    focus: selectedFocusAreas.slice(),
    totalBalls,
    sets: sets.map((s) => ({ balls: s.balls, focus: s.focus, club: s.club || "", rating: null, note: "", swingThoughtIds: [] })),
  };
  saveDraft(draft);
  window.location.href = "review.html";
});
