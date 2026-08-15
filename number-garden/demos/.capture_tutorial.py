import base64
import hashlib
import json
import os
import socket
import struct
import time
import urllib.request


def websocket(url):
    host_port, path = url.removeprefix("ws://").split("/", 1)
    host, port = host_port.split(":")
    sock = socket.create_connection((host, int(port)), timeout=5)
    key = base64.b64encode(os.urandom(16)).decode()
    request = (
        f"GET /{path} HTTP/1.1\r\nHost: {host_port}\r\nUpgrade: websocket\r\n"
        "Connection: Upgrade\r\nOrigin: http://localhost\r\n"
        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
    )
    sock.sendall(request.encode())
    response = sock.recv(4096).decode()
    if " 101 " not in response:
        raise RuntimeError(response)
    sock.settimeout(10)
    return sock


class CDP:
    def __init__(self, sock):
        self.sock = sock
        self.ident = 0

    def send(self, method, params=None):
        self.ident += 1
        payload = json.dumps({"id": self.ident, "method": method, "params": params or {}}).encode()
        mask = os.urandom(4)
        masked = bytes(byte ^ mask[i % 4] for i, byte in enumerate(payload))
        header = bytes([0x81, 0x80 | len(payload)]) if len(payload) < 126 else bytes([0x81, 0x80 | 126]) + struct.pack("!H", len(payload))
        self.sock.sendall(header + mask + masked)
        while True:
            first, second = self.sock.recv(2)
            size = second & 127
            if size == 126:
                size = struct.unpack("!H", self.sock.recv(2))[0]
            elif size == 127:
                size = struct.unpack("!Q", self.sock.recv(8))[0]
            data = b""
            while len(data) < size:
                data += self.sock.recv(size - len(data))
            message = json.loads(data)
            if message.get("id") == self.ident:
                return message

    def evaluate(self, expression):
        result = self.send("Runtime.evaluate", {"expression": expression, "returnByValue": True})
        return result.get("result", {}).get("result", {}).get("value")


tabs = json.load(urllib.request.urlopen("http://127.0.0.1:9222/json"))
page = next(tab for tab in tabs if tab["type"] == "page")
print("page found", flush=True)
cdp = CDP(websocket(page["webSocketDebuggerUrl"]))
print("socket connected", flush=True)
cdp.send("Page.enable")
print("page enabled", flush=True)
cdp.send("Runtime.enable")
cdp.send("Emulation.setDeviceMetricsOverride", {"width": 480, "height": 900, "deviceScaleFactor": 1, "mobile": True})
cdp.send("Emulation.setVisibleSize", {"width": 480, "height": 900})
time.sleep(1)
cdp.evaluate("(() => { const original = window.setTimeout.bind(window); window.setTimeout = (fn, ms, ...args) => original(fn, Math.min(ms, 250), ...args); })()")
cdp.evaluate("document.querySelector('#launchTutorialButton').click()")

folder = "tutorial-frames"
os.makedirs(folder, exist_ok=True)
duration = 24
fps = 8
for frame in range(duration * fps):
    shot = cdp.send("Page.captureScreenshot", {"format": "png"})["result"]["data"]
    with open(f"{folder}/frame-{frame:04d}.png", "wb") as output:
        output.write(base64.b64decode(shot))
    time.sleep(1 / fps)
