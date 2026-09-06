#!/usr/bin/env node

import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const timeoutMs = 180000;
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const delay = milliseconds => new Promise(resolveDelay => setTimeout(resolveDelay, milliseconds));

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url, "http://127.0.0.1").pathname;
      const relativePath = pathname === "/" ? "index.html" : decodeURIComponent(pathname.slice(1));
      const filePath = resolve(projectRoot, relativePath);
      if (filePath !== projectRoot && !filePath.startsWith(projectRoot + sep)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const { readFile } = await import("node:fs/promises");
      const body = await readFile(filePath);
      response.writeHead(200, { "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream" });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      response.writeHead(error && error.code === "ENOENT" ? 404 : 500).end("Not found");
    }
  });
  return new Promise((resolveServer, rejectServer) => {
    server.once("error", rejectServer);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolveServer({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

function waitForDebuggerUrl(chrome) {
  return new Promise((resolveUrl, rejectUrl) => {
    let stderr = "";
    const timeout = setTimeout(() => rejectUrl(new Error("Timed out waiting for Chrome DevTools")), 15000);
    const inspect = chunk => {
      stderr += chunk;
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (!match) return;
      clearTimeout(timeout);
      chrome.stderr.off("data", inspect);
      resolveUrl(match[1]);
    };
    chrome.stderr.on("data", inspect);
    chrome.once("exit", code => {
      clearTimeout(timeout);
      rejectUrl(new Error("Chrome exited before the harness opened (code " + code + ")"));
    });
  });
}

async function waitForPageTarget(debuggerUrl, harnessUrl) {
  const endpoint = new URL(debuggerUrl);
  const listUrl = `http://${endpoint.host}/json/list`;
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const targets = await fetch(listUrl).then(response => response.json());
    const page = targets.find(target => target.type === "page" && target.url === harnessUrl);
    if (page) return page.webSocketDebuggerUrl;
    await delay(50);
  }
  throw new Error("Timed out waiting for the curriculum harness page");
}

async function connectCdp(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  await new Promise((resolveSocket, rejectSocket) => {
    socket.addEventListener("open", resolveSocket, { once: true });
    socket.addEventListener("error", () => rejectSocket(new Error("Could not connect to Chrome DevTools")), { once: true });
  });
  let messageId = 0;
  const pending = new Map();
  socket.addEventListener("message", message => {
    const payload = JSON.parse(message.data);
    if (!payload.id || !pending.has(payload.id)) return;
    const { resolveMessage, rejectMessage } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) rejectMessage(new Error(payload.error.message));
    else resolveMessage(payload.result);
  });
  return {
    socket,
    send(method, params = {}) {
      messageId += 1;
      return new Promise((resolveMessage, rejectMessage) => {
        pending.set(messageId, { resolveMessage, rejectMessage });
        socket.send(JSON.stringify({ id: messageId, method, params }));
      });
    }
  };
}

async function waitForHarness(cdp) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const evaluated = await cdp.send("Runtime.evaluate", {
      expression: `(() => ({
        status: document.body && document.body.dataset.status,
        title: document.title,
        results: document.querySelector("#results")?.textContent || ""
      }))()`,
      returnByValue: true
    });
    const state = evaluated.result && evaluated.result.value;
    if (state && (state.status === "passed" || state.status === "failed")) return state;
    await delay(100);
  }
  throw new Error("Timed out waiting for the curriculum harness result");
}

let chrome;
let cdp;
let server;
let profileDirectory;

try {
  const local = await startServer();
  server = local.server;
  const harnessUrl = local.origin + "/tests/curriculum-harness.html";
  profileDirectory = await mkdtemp(join(tmpdir(), "number-garden-harness-"));
  chrome = spawn("google-chrome", [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--remote-debugging-port=0",
    "--user-data-dir=" + profileDirectory,
    harnessUrl
  ], { stdio: ["ignore", "ignore", "pipe"] });
  const debuggerUrl = await waitForDebuggerUrl(chrome);
  const pageWebSocketUrl = await waitForPageTarget(debuggerUrl, harnessUrl);
  cdp = await connectCdp(pageWebSocketUrl);
  await cdp.send("Runtime.enable");
  const result = await waitForHarness(cdp);
  const summary = result.results.trim().split("\n").at(-1);
  if (result.status === "passed") {
    console.log(result.title);
    console.log(summary);
  } else {
    const failure = result.results.match(/FAIL: Error: ([^\n]+)/)?.[0] || result.title;
    console.error(failure);
    console.error(result.results.slice(-5000));
    process.exitCode = 1;
  }
} catch (error) {
  console.error("FAIL: " + (error && error.message ? error.message : String(error)));
  process.exitCode = 1;
} finally {
  if (cdp && cdp.socket.readyState === WebSocket.OPEN) cdp.socket.close();
  if (chrome && chrome.exitCode === null) {
    chrome.kill("SIGTERM");
    await Promise.race([
      new Promise(resolveExit => chrome.once("exit", resolveExit)),
      delay(2000)
    ]);
  }
  if (server) await new Promise(resolveClose => server.close(resolveClose));
  if (profileDirectory) await rm(profileDirectory, { recursive: true, force: true });
}
