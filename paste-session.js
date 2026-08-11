const textareaEl = document.getElementById("sessionText");
const parseErrorEl = document.getElementById("parseError");
const parseBtn = document.getElementById("parseBtn");
const closeBtn = document.getElementById("closeBtn");

closeBtn.addEventListener("click", () => {
  clearDraft();
  window.location.href = "index.html";
});

// Recognizes two line shapes per set:
//   "Balls 1-20: description"  (a ball range, "Balls" optional after the first line)
//   "20 balls: description"    (a direct count, an optional leading "Set 1" is ignored)
// Dashes may be a hyphen or an en/em dash, since pasted AI text often uses those.
const RANGE_PATTERN = /^(?:balls?\s+)?(\d+)\s*[-–—]\s*(\d+)\s*:\s*(.+)$/i;
const COUNT_PATTERN = /^(?:set\s*\d+\s*[:\-]?\s*)?\(?(\d+)\s*balls?\)?\s*[:\-]\s*(.+)$/i;

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
        return { balls: end - start + 1, focus: rangeMatch[3].trim() };
      }

      const countMatch = line.match(COUNT_PATTERN);
      if (countMatch) {
        return { balls: parseInt(countMatch[1], 10), focus: countMatch[2].trim() };
      }

      return null;
    })
    .filter((set) => set && set.balls > 0 && set.focus.length > 0);
}

parseBtn.addEventListener("click", () => {
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
    totalBalls,
    sets: sets.map((s) => ({ balls: s.balls, focus: s.focus, club: "", rating: null, note: "" })),
  };
  saveDraft(draft);
  window.location.href = "review.html";
});
