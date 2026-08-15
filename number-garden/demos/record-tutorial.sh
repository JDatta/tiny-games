#!/usr/bin/env bash
set -euo pipefail
rm -rf /tmp/number-garden-capture
rm -rf tutorial-frames
google-chrome --headless=new --disable-gpu --no-first-run --no-default-browser-check --remote-allow-origins='*' --remote-debugging-port=9222 --user-data-dir=/tmp/number-garden-capture file:///home/jd/workspace/tiny-games/number-garden/index.html >/tmp/number-garden-chrome.log 2>&1 &
chrome_pid=$!
trap 'kill "$chrome_pid" 2>/dev/null || true' EXIT
sleep 2
python3 .capture_tutorial.py
ffmpeg -y -loglevel error -framerate 10 -i tutorial-frames/frame-%04d.png -c:v libx264 -preset medium -crf 22 -pix_fmt yuv420p -movflags +faststart number-garden-tutorial.mp4
