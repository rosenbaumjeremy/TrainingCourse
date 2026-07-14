// Daily learning list — stored per calendar day in localStorage so each
// day keeps its own list, and today's list is always what you see first.

const dateEl = document.getElementById("today-date");
const formEl = document.getElementById("learning-form");
const inputEl = document.getElementById("learning-input");
const listEl = document.getElementById("learning-list");
const emptyEl = document.getElementById("learning-empty");

const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `learning-log:${yyyy}-${mm}-${dd}`;
};

const KEY = todayKey();

function loadItems() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function renderDate() {
  const formatted = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  dateEl.textContent = formatted;
}

function renderList(items) {
  listEl.innerHTML = "";
  emptyEl.style.display = items.length === 0 ? "block" : "none";

  items.forEach((item, index) => {
    const li = document.createElement("li");
    if (item.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      item.done = checkbox.checked;
      saveItems(items);
      renderList(items);
    });

    const span = document.createElement("span");
    span.className = "item-text";
    span.textContent = item.text;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.setAttribute("aria-label", "Remove item");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      items.splice(index, 1);
      saveItems(items);
      renderList(items);
    });

    li.append(checkbox, span, removeBtn);
    listEl.appendChild(li);
  });
}

function init() {
  renderDate();
  const items = loadItems();
  renderList(items);

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = inputEl.value.trim();
    if (!text) return;

    const items = loadItems();
    items.push({ text, done: false });
    saveItems(items);
    renderList(items);

    inputEl.value = "";
    inputEl.focus();
  });
}

init();
