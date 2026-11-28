#!/usr/bin/env python3
"""MIME-correct static server for godot-haigen/web-preview (Safari / Godot wasm)."""
from __future__ import annotations

import http.server
import os
import socketserver
import sys

ROOT = os.path.abspath(
    sys.argv[1]
    if len(sys.argv) > 1
    else os.path.join(os.path.dirname(__file__), "..", "web-preview")
)
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8766


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".mjs": "application/javascript",
        ".wasm": "application/wasm",
        ".pck": "application/octet-stream",
        ".png": "image/png",
        ".json": "application/json",
        ".css": "text/css",
        "": "application/octet-stream",
    }

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


def main() -> None:
    os.chdir(ROOT)
    print(f"Serving {ROOT} on http://127.0.0.1:{PORT}/", flush=True)
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
