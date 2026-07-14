// Shows Sefaria's daily learning schedule (לוח לימוד יומי) — Daf Yomi, Daily
// Mishnah, Daily Rambam, and more — fetched live from Sefaria's public API.

const dateEl = document.getElementById("today-date");
const listEl = document.getElementById("calendar-list");
const statusEl = document.getElementById("calendar-status");

function renderDate(isoDate) {
  const d = isoDate ? new Date(isoDate) : new Date();
  dateEl.textContent = d.toLocaleDateString("he-IL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function sefariaUrl(item) {
  if (!item.url) return null;
  if (item.url.startsWith("collections/")) {
    return `https://www.sefaria.org.il/${item.url}`;
  }
  return `https://www.sefaria.org.il/${encodeURIComponent(item.url)}`;
}

const ALLOWED_TITLES_EN = new Set(["Parashat Hashavua", "Daf Yomi", "929", "Daily Rambam"]);

function isAllowed(item) {
  return ALLOWED_TITLES_EN.has(item.title?.en);
}

function renderItems(items) {
  listEl.innerHTML = "";

  items.filter(isAllowed).forEach((item) => {
    const li = document.createElement("li");

    const title = document.createElement("span");
    title.className = "item-title";
    title.textContent = item.title?.he || item.title?.en || "";

    const value = document.createElement("span");
    value.className = "item-value";
    value.textContent = item.displayValue?.he || item.displayValue?.en || "";

    const link = sefariaUrl(item);
    if (link) {
      const a = document.createElement("a");
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.append(title, value);
      li.appendChild(a);
    } else {
      li.append(title, value);
    }

    listEl.appendChild(li);
  });
}

async function init() {
  renderDate();

  try {
    const res = await fetch("https://www.sefaria.org/api/calendars", { cache: "no-store" });
    if (!res.ok) throw new Error(`Sefaria API returned ${res.status}`);
    const data = await res.json();

    renderDate(data.date);
    renderItems(data.calendar_items || []);
    statusEl.style.display = "none";
  } catch (err) {
    statusEl.textContent =
      "לא הצלחנו לטעון את לוח הלימוד היומי כרגע. נסו לרענן את הדף.";
    console.error("Failed to load Sefaria calendar", err);
  }
}

init();
