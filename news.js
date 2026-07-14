// Live breaking-news feed from i24NEWS.
//
// Two data paths, so this works whether the site is running on Replit
// (with our small Python backend) or on GitHub Pages (static-only, no
// backend at all):
//   1. Try our own `/api/news` endpoint first (server.py fetches
//      i24news.tv server-side, since they block direct cross-origin
//      browser requests).
//   2. If that 404s (no backend, e.g. GitHub Pages), fall back to
//      fetching i24news.tv's homepage through a public CORS proxy and
//      extracting the same embedded live-feed JSON in the browser.

const ITEM_RE =
  /\{"id":(\d+),"title":"((?:[^"\\]|\\.)*)","content":null,"startedAt":new Date\("([^"]+)"\),"status":"(\w+)"\}/g;

function decodeJsonString(s) {
  try {
    return JSON.parse(`"${s}"`);
  } catch {
    return s;
  }
}

function extractItemsFromHtml(html) {
  const items = [];
  let m;
  ITEM_RE.lastIndex = 0;
  while ((m = ITEM_RE.exec(html)) !== null) {
    items.push({
      id: m[1],
      title: decodeJsonString(m[2]),
      startedAt: m[3],
      status: m[4],
    });
  }
  return items;
}

async function fetchViaOwnBackend() {
  const res = await fetch("/api/news");
  if (!res.ok) throw new Error(`/api/news returned ${res.status}`);
  const data = await res.json();
  return data.items || [];
}

async function fetchViaCorsProxy() {
  const target = "https://www.i24news.tv/en";
  const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(target);
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`CORS proxy returned ${res.status}`);
  const html = await res.text();
  return extractItemsFromHtml(html);
}

function formatTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderItems(items) {
  const listEl = document.getElementById("news-list");
  listEl.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");

    const time = document.createElement("span");
    time.className = "news-time";
    time.textContent = formatTime(item.startedAt);

    const title = document.createElement("p");
    title.className = "news-title";
    title.textContent = item.title;

    li.append(time, title);
    listEl.appendChild(li);
  });
}

async function loadNews() {
  const statusEl = document.getElementById("news-status");

  let items;
  try {
    items = await fetchViaOwnBackend();
  } catch (backendErr) {
    console.warn("Own /api/news unavailable, falling back to CORS proxy", backendErr);
    try {
      items = await fetchViaCorsProxy();
    } catch (proxyErr) {
      statusEl.textContent = "Couldn't load live updates right now. Try refreshing.";
      console.error("Failed to load i24news feed via proxy", proxyErr);
      return;
    }
  }

  if (!items || items.length === 0) {
    statusEl.textContent = "No live updates right now.";
    return;
  }

  renderItems(items);
  statusEl.style.display = "none";
}

loadNews();
