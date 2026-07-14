// Live World Cup and NBA Summer League scores, fetched fresh from ESPN's
// public scoreboard API every time the page loads — no stored history,
// always today's/most recent games.

const ENDPOINTS = {
  worldcup: [
    {
      label: "FIFA World Cup",
      url: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
    },
  ],
  summerleague: [
    {
      label: "Las Vegas Summer League",
      url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-las-vegas/scoreboard",
    },
    {
      label: "Salt Lake City Summer League",
      url: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba-summer-utah/scoreboard",
    },
  ],
  mlb: [
    {
      label: "MLB",
      url: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
    },
  ],
};

function stateClass(state) {
  return `score-status state-${state || "pre"}`;
}

function findBoxscoreLink(links) {
  if (!links || links.length === 0) return null;

  const boxscore = links.find((l) => l.rel?.includes("boxscore"));
  if (boxscore) return { href: boxscore.href, label: "Box Score" };

  // Soccer scoreboards don't expose a "boxscore" rel — use match stats instead.
  const stats = links.find((l) => l.rel?.includes("stats"));
  if (stats) return { href: stats.href, label: "Match Stats" };

  const summary = links.find((l) => l.rel?.includes("summary"));
  if (summary) return { href: summary.href, label: "Summary" };

  return null;
}

function formatEventTime(isoDate) {
  return new Date(isoDate).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderEvent(event, groupLabel) {
  const li = document.createElement("li");

  const competition = event.competitions && event.competitions[0];
  const competitors = competition ? competition.competitors : [];
  // ESPN lists home team first; reverse so away@home reads top-to-bottom
  // in the order shown in the event name.
  const ordered = [...competitors].sort((a, b) =>
    a.homeAway === b.homeAway ? 0 : a.homeAway === "away" ? -1 : 1
  );

  const row = document.createElement("div");
  row.className = "score-row";

  const teamsEl = document.createElement("div");
  teamsEl.className = "score-teams";

  ordered.forEach((c) => {
    const teamRow = document.createElement("div");
    teamRow.className = "score-team" + (c.winner ? " winner" : "");

    const name = document.createElement("span");
    name.className = "team-name";
    name.textContent = c.team?.displayName || c.team?.name || "TBD";

    const score = document.createElement("span");
    score.className = "team-score";
    score.textContent = c.score ?? "-";

    teamRow.append(name, score);
    teamsEl.appendChild(teamRow);
  });

  const status = document.createElement("span");
  const state = event.status?.type?.state;
  status.className = stateClass(state);
  status.textContent = event.status?.type?.shortDetail || "";

  row.append(teamsEl, status);

  const meta = document.createElement("p");
  meta.className = "score-meta";
  meta.textContent = `${groupLabel} · ${formatEventTime(event.date)}`;

  const boxscoreLink = findBoxscoreLink(event.links);
  if (boxscoreLink) {
    const link = document.createElement("a");
    link.className = "score-boxscore-link";
    link.href = boxscoreLink.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = boxscoreLink.label;
    meta.append(" · ", link);
  }

  li.append(row, meta);
  return li;
}

async function fetchGroup(sources) {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      const res = await fetch(source.url);
      if (!res.ok) throw new Error(`ESPN API returned ${res.status}`);
      const data = await res.json();
      return { label: source.label, events: data.events || [] };
    })
  );

  return results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((group) => group.events.length > 0);
}

async function renderGroup(sources, listId, statusId) {
  const listEl = document.getElementById(listId);
  const statusEl = document.getElementById(statusId);

  try {
    const groups = await fetchGroup(sources);

    if (groups.length === 0) {
      statusEl.textContent = "No games scheduled right now.";
      return;
    }

    groups.forEach((group) => {
      group.events.forEach((event) => {
        listEl.appendChild(renderEvent(event, group.label));
      });
    });

    statusEl.style.display = "none";
  } catch (err) {
    statusEl.textContent = "Couldn't load scores from ESPN right now. Try refreshing.";
    console.error(`Failed to load scores for ${listId}`, err);
  }
}

renderGroup(ENDPOINTS.worldcup, "worldcup-list", "worldcup-status");
renderGroup(ENDPOINTS.summerleague, "summerleague-list", "summerleague-status");
renderGroup(ENDPOINTS.mlb, "mlb-list", "mlb-status");
