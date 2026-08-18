const params = new URLSearchParams(window.location.search);
const editId = params.get("id");
const existing = editId ? getSwingThought(editId) : null;

const backLink = document.getElementById("backLink");
const formTitle = document.getElementById("formTitle");
const nameInput = document.getElementById("nameInput");
const nameError = document.getElementById("nameError");
const goalInput = document.getElementById("goalInput");
const statusPicker = document.getElementById("statusPicker");
const notesInput = document.getElementById("notesInput");
const saveBtn = document.getElementById("saveBtn");

let selectedStatus = "unsure";

function renderStatusPicker() {
  statusPicker.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.status === selectedStatus);
  });
}

statusPicker.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedStatus = btn.dataset.status;
    renderStatusPicker();
  });
});

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim().length > 0) nameError.classList.add("hidden");
});

if (editId && !existing) {
  window.location.href = "swing-thoughts.html";
}

if (existing) {
  formTitle.textContent = "Edit Swing Thought";
  backLink.href = `swing-thought-detail.html?id=${encodeURIComponent(existing.id)}`;
  nameInput.value = existing.name;
  goalInput.value = existing.goal || "";
  notesInput.value = existing.notes || "";
  selectedStatus = existing.status;
}

renderStatusPicker();

saveBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (!name) {
    nameError.classList.remove("hidden");
    nameInput.focus();
    return;
  }

  if (existing) {
    updateSwingThought(existing.id, {
      name,
      goal: goalInput.value.trim(),
      status: selectedStatus,
      notes: notesInput.value.trim(),
    });
    window.location.href = `swing-thought-detail.html?id=${encodeURIComponent(existing.id)}`;
  } else {
    const thought = createSwingThought({
      name,
      goal: goalInput.value.trim(),
      status: selectedStatus,
      notes: notesInput.value.trim(),
    });
    window.location.href = `swing-thought-detail.html?id=${encodeURIComponent(thought.id)}`;
  }
});
