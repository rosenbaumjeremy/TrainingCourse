# JJ's Dashboard

A personal dashboard site (started from a blank HTML/CSS template), no build step, no dependencies.

- `index.html` — the page content.
- `style.css` — base styles.
- `script.js` — fetches Sefaria's daily learning schedule (לוח לימוד יומי: Daf Yomi, Daily Mishnah, Daily Rambam, etc.) live from `https://www.sefaria.org/api/calendars` on every page load.
- `scores.js` — fetches live World Cup and NBA Summer League (Las Vegas + Salt Lake City) scores from ESPN's public scoreboard API (`site.api.espn.com/apis/site/v2/sports/...`) on every page load. No stored history — always shows the current/most recent games.

## Running

The "Start application" workflow serves the folder with `python3 -m http.server 5000` so the Replit preview shows `index.html`. No install step needed.

The real, public site (per the original template) is intended to be hosted via GitHub Pages — Replit is just for previewing/building.

## User preferences

None recorded yet.
