# JJ's Dashboard

A personal dashboard site. Started as a blank HTML/CSS template; now has a small Python backend (`server.py`) alongside the static frontend.

- `index.html` — the page content.
- `style.css` — base styles.
- `script.js` — fetches Sefaria's daily learning schedule (לוח לימוד יומי: Daf Yomi, Daily Mishnah, Daily Rambam, etc.) live from `https://www.sefaria.org/api/calendars` on every page load.
- `scores.js` — fetches live World Cup and NBA Summer League (Las Vegas + Salt Lake City) scores from ESPN's public scoreboard API (`site.api.espn.com/apis/site/v2/sports/...`) on every page load. No stored history — always shows the current/most recent games.
- `news.js` — fetches live breaking-news updates from i24NEWS via our own `/api/news` endpoint.
- `server.py` — replaces the plain `python -m http.server`. Serves the static files, plus `/api/news`, which fetches `https://www.i24news.tv/en` server-side (their CORS/bot protection blocks direct browser fetches), regex-extracts the embedded live "asideNewsFeed" JSON, and re-serves it as JSON. Cached in-memory for 60s to avoid hammering their site.

## Notes on external data sources
- Times of Israel's liveblog (`timesofisrael.com`) could not be used: Cloudflare returns 403 to all scraping (including RSS/wp-json), and the page also sets `X-Frame-Options: sameorigin` so it can't be iframed either. i24NEWS was used instead per user's choice.
- Sefaria and ESPN both have CORS-open public JSON APIs so those are fetched directly client-side; i24NEWS does not, hence the small backend proxy.

## Running

The "Start application" workflow runs `python3 server.py` on port 5000 (webview). No install step needed — pure stdlib Python.

## Running

The "Start application" workflow serves the folder with `python3 -m http.server 5000` so the Replit preview shows `index.html`. No install step needed.

The real, public site (per the original template) is intended to be hosted via GitHub Pages — Replit is just for previewing/building.

## User preferences

None recorded yet.
