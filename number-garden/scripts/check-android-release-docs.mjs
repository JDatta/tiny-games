#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSchema } from "./validate-android-release-tracker.mjs";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const specPath = resolve(projectRoot, "docs/exec-plans/pending/android-release-agentic-orchestrator.md");
const runbookRoot = resolve(projectRoot, "docs/runbooks/android-release");

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

const markdownPaths = [
  specPath,
  ...filesUnder(runbookRoot),
  resolve(projectRoot, "AGENTS.md"),
  resolve(projectRoot, "docs/PLANS.md"),
  resolve(projectRoot, "docs/RELIABILITY.md"),
  resolve(projectRoot, "docs/SECURITY.md"),
  resolve(projectRoot, "docs/QUALITY_SCORE.md"),
  resolve(projectRoot, "docs/exec-plans/README.md"),
  ...filesUnder(resolve(projectRoot, "docs/exec-plans/pending")).filter((path) => /android.*\.md$/.test(path))
];

const broken = [];
for (const path of new Set(markdownPaths)) {
  const source = readFileSync(path, "utf8");
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, "").split("#", 1)[0];
    if (!target || /^(https?:|mailto:)/.test(target)) continue;
    const resolved = resolve(dirname(path), decodeURIComponent(target));
    if (!existsSync(resolved)) broken.push(`${path}: ${target}`);
  }
}
assert.deepEqual(broken, [], `Broken local Android release links:\n${broken.join("\n")}`);

const spec = readFileSync(specPath, "utf8");
for (const required of [
  "GPT-5.6-Sol",
  "GPT-5.6-Terra",
  "GPT-5.6-Luna",
  "model_context_window=128000",
  "model_reasoning_effort",
  "codex exec resume SESSION_ID",
  "--output-schema",
  "Never use `--dangerously-bypass-approvals-and-sandbox`",
  "pending/` to `active/",
  "NG-AND-018",
  "NG-AND-024"
]) assert(spec.includes(required), `Orchestrator spec is missing required text: ${required}`);

const runbooks = filesUnder(runbookRoot).filter((path) => path.endsWith(".md"));
assert.equal(runbooks.length, 10, "Expected one preflight and nine owner-action runbooks");
for (const path of runbooks) {
  const source = readFileSync(path, "utf8");
  assert(source.includes("acknowledgement"), `${path} lacks an acknowledgement contract`);
  assert(statSync(path).size > 500, `${path} is unexpectedly short`);
}

const workerSchema = JSON.parse(readFileSync(resolve(projectRoot, "docs/exec-plans/android-release-worker-result.schema.json"), "utf8"));
const sampleWorkerResult = {
  item_id: "NG-AND-001",
  status: "ready_for_review",
  branch: "agent/ng-and-001-harness",
  session_id: "example-session",
  worktree_id: "ng-and-001",
  commits: ["e32ad0c"],
  changed_files: ["tests/curriculum-harness.html"],
  tests: [{ command: "browser harness", outcome: "pass", evidence_path: "docs/qa/android-release-qa.md" }],
  evidence_paths: ["docs/qa/android-release-qa.md"],
  risks: [],
  blocker: null,
  recommended_next_action: "Review and retest in the integration worktree."
};
assert.deepEqual(validateSchema(sampleWorkerResult, workerSchema), [], "Worker result schema must accept the documented contract");

console.log(`Android release documentation checks: PASS (${new Set(markdownPaths).size} documents, ${runbooks.length} runbooks, links and worker contract)`);
