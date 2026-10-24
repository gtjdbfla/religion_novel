import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--author', action='store_true')
    parser.add_argument('--port', type=int)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1] / ('author-site' if args.author else 'site')
    port = args.port or (8102 if args.author else 8101)
    print(f'http://127.0.0.1:{port}', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), partial(SimpleHTTPRequestHandler, directory=str(root))).serve_forever()
