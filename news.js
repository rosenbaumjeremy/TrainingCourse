// Live breaking-news feed from i24NEWS, via our own /api/news endpoint.
// i24news.tv blocks direct cross-origin browser fetches, so our server
// fetches their homepage, extracts the embedded live feed, and re-serves
// it here (cached briefly to avoid hammering their site).

function formatTime(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

async function loadNews() {
  const listEl = document.getElementById("news-list");
  const statusEl = document.getElementById("news-status");

  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error(`/api/news returned ${res.status}`);
    const data = await res.json();
    const items = data.items || [];

    if (items.length === 0) {
      statusEl.textContent = "No live updates right now.";
      return;
    }

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

    statusEl.style.display = "none";
  } catch (err) {
    statusEl.textContent = "Couldn't load live updates right now. Try refreshing.";
    console.error("Failed to load i24news feed", err);
  }
}

loadNews();
