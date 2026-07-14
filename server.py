#!/usr/bin/env python3
"""Serves the static site and a small /api/news endpoint that surfaces
i24NEWS's live breaking-news feed (extracted server-side from their
homepage, since their site blocks direct browser fetches with CORS)."""

import json
import re
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 5000

I24_URL = "https://www.i24news.tv/en"
ITEM_RE = re.compile(
    r'\{"id":(\d+),"title":"((?:[^"\\]|\\.)*)","content":null,'
    r'"startedAt":new Date\("([^"]+)"\),"status":"(\w+)"\}'
)

def unescape_json_string(s):
    # Reuse json's own string decoder to handle \" \\ \u2014 etc.
    return json.loads(f'"{s}"')


def fetch_i24_news():
    # Always fetch live from i24news.tv — no caching. Every time a visitor
    # opens the dashboard, they should see exactly what's on the site right now.
    req = urllib.request.Request(
        I24_URL,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; JJsDashboard/1.0)",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        html = resp.read().decode("utf-8", errors="replace")

    items = []
    for m in ITEM_RE.finditer(html):
        items.append(
            {
                "id": m.group(1),
                "title": unescape_json_string(m.group(2)),
                "startedAt": m.group(3),
                "status": m.group(4),
            }
        )

    return items


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _serve_static(self):
        path = self.path.split("?", 1)[0]
        if path == "/":
            path = "/index.html"
        safe_path = path.lstrip("/")
        try:
            with open(safe_path, "rb") as f:
                body = f.read()
        except (FileNotFoundError, IsADirectoryError):
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(b"Not found")
            return

        content_type = "text/html; charset=utf-8"
        if safe_path.endswith(".css"):
            content_type = "text/css; charset=utf-8"
        elif safe_path.endswith(".js"):
            content_type = "text/javascript; charset=utf-8"
        elif safe_path.endswith(".json"):
            content_type = "application/json; charset=utf-8"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/news":
            try:
                items = fetch_i24_news()
                self._send_json({"items": items, "source": "i24news.tv"})
            except Exception as exc:  # noqa: BLE001 - report to client
                self._send_json({"error": str(exc)}, status=502)
            return

        self._serve_static()

    def log_message(self, format, *args):  # noqa: A002 - match http.server signature
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))


if __name__ == "__main__":
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Serving HTTP on 0.0.0.0 port {PORT} (http://0.0.0.0:{PORT}/) ...")
    server.serve_forever()
