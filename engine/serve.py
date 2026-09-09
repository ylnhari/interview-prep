"""Loopback-only static server for built prep pages.

Usage:
    python engine/serve.py [--port N]

Port resolution (see AGENTS.md): --port > INTERVIEW_PREP_PORT > workspace
ports.json (walked up from this repository) > default 8781. Binds 127.0.0.1 only.
"""
import http.server
import os
import sys
from functools import partial
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from portlib import resolve_port  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
PROJECT = "interview-prep"
DEFAULT_PORT = 8781


def main(argv):
    explicit = None
    if "--port" in argv:
        explicit = int(argv[argv.index("--port") + 1])
    port = resolve_port(PROJECT, explicit=explicit, env_var="INTERVIEW_PREP_PORT", default=DEFAULT_PORT, start=Path(ROOT))
    os.makedirs(DIST, exist_ok=True)
    handler = partial(http.server.SimpleHTTPRequestHandler, directory=DIST)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    print("interview-prep serving %s at http://127.0.0.1:%d/ (Ctrl+C to stop)" % (DIST, port))
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
