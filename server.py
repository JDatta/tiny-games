from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


PORT = 8080
DIRECTORY = Path(__file__).resolve().parent
GAME_FILE = "index.html"


class GameRequestHandler(SimpleHTTPRequestHandler):
    def _route_game_root(self):
        parts = urlsplit(self.path)
        if parts.path == "/":
            self.path = urlunsplit((parts.scheme, parts.netloc, f"/{GAME_FILE}", parts.query, parts.fragment))

    def do_GET(self):
        self._route_game_root()
        super().do_GET()

    def do_HEAD(self):
        self._route_game_root()
        super().do_HEAD()


if __name__ == "__main__":
    handler = partial(GameRequestHandler, directory=DIRECTORY)
    server = ThreadingHTTPServer(("0.0.0.0", PORT), handler)
    print(f"Serving {DIRECTORY / GAME_FILE} at http://localhost:{PORT}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
