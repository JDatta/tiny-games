import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  computeDerived,
  validateDocument,
  validateGitState
} from "../scripts/validate-android-release-tracker.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const trackerPath = resolve(projectRoot, "docs/exec-plans/android-release-action-items.json");
const schemaPath = resolve(projectRoot, "docs/exec-plans/android-release-action-items.schema.json");
const base = JSON.parse(readFileSync(trackerPath, "utf8"));
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

function clone() {
  return structuredClone(base);
}

function refreshDerived(tracker) {
  tracker.derived = computeDerived(tracker);
  return tracker;
}

function complete(item, commit = "e32ad0c") {
  item.status = "done";
  item.execution.attempts = 1;
  item.execution.assigned_model = "gpt-5.6-sol";
  item.execution.reasoning_effort = "xhigh";
  item.execution.commits = [commit];
  item.execution.checkpoint_commit = commit;
  item.execution.evidence_paths = [`docs/qa/${item.id.toLowerCase()}.md`];
  item.execution.blockers = [];
  item.execution.next_actions = [];
}

function expectValid(tracker, label) {
  assert.deepEqual(validateDocument(refreshDerived(tracker), schema), [], label);
}

function expectError(tracker, pattern, label) {
  const errors = validateDocument(refreshDerived(tracker), schema);
  assert(errors.some((error) => pattern.test(error)), `${label}\nExpected ${pattern}, got:\n${errors.join("\n")}`);
}

assert.deepEqual(validateDocument(base, schema), [], "authoritative tracker must validate");
assert.deepEqual(computeDerived(base).ready_item_ids, ["NG-AND-001", "NG-AND-002", "NG-AND-003"]);

{
  const tracker = clone();
  complete(tracker.items[0]);
  tracker.orchestration.baseline_commit = "e32ad0c";
  tracker.orchestration.checkpoint_commit = "e32ad0c";
  expectValid(tracker, "a checkpointed rank-one completion should validate");
  assert.deepEqual(tracker.derived.ready_item_ids, ["NG-AND-002", "NG-AND-003"]);
}

{
  const tracker = clone();
  tracker.external_gates.find((gate) => gate.id === "owner_system_access").status = "satisfied";
  tracker.items.find((item) => item.id === "NG-AND-009").status = "todo";
  tracker.items.find((item) => item.id === "NG-AND-009").execution.blockers = [];
  expectValid(tracker, "a satisfied external gate should make its todo item dependency-ready");
  assert(tracker.derived.ready_item_ids.includes("NG-AND-009"));
  assert(!tracker.derived.blocked_external_gate_ids.includes("owner_system_access"));
}

{
  const tracker = clone();
  tracker.orchestration.startup_gates[0].status = "satisfied";
  tracker.orchestration.mode = "ready";
  tracker.external_gates.forEach((gate) => { gate.status = "satisfied"; });
  tracker.orchestration.baseline_commit = "e32ad0c";
  tracker.orchestration.checkpoint_commit = "e32ad0c";
  for (let index = 0; index < 21; index += 1) complete(tracker.items[index]);
  tracker.items[21].status = "not_applicable";
  tracker.items[21].applicability = "not_required";
  tracker.items[21].execution.blockers = [];
  tracker.items[21].execution.next_actions = [];
  tracker.items[21].execution.evidence_paths = ["docs/qa/ng-and-022-applicability.md"];
  expectValid(tracker, "NG-AND-022 may be not applicable only after applicability evidence and ranked predecessors");
}

{
  const tracker = clone();
  tracker.items[21].applicability = "not_required";
  expectError(tracker, /not_required applicability requires not_applicable status/, "conditional applicability mismatch must fail");
}

{
  const tracker = clone();
  tracker.orchestration.remediation.cycle = 1;
  tracker.orchestration.remediation.history.push({
    cycle: 1,
    reason: "A Play-delivered critical defect required a replacement bundle.",
    from_version_code: 1,
    to_version_code: 2,
    release_commit: "e32ad0c",
    evidence_paths: ["docs/qa/android-release-qa.md"]
  });
  expectValid(tracker, "a strictly increasing remediation cycle should validate");
  tracker.orchestration.remediation.history[0].to_version_code = 1;
  expectError(tracker, /versionCode must increase|below 2/, "a remediation cycle cannot reuse a versionCode");
}

{
  const tracker = clone();
  tracker.items[0].dependencies = [{ type: "item", id: "NG-AND-024" }];
  expectError(tracker, /dependency cycle detected/, "cyclic tracker dependencies must fail");
}

{
  const tracker = clone();
  tracker.items[0].dependencies = [{ type: "item", id: "NG-AND-999" }];
  expectError(tracker, /unknown item dependency/, "unknown dependency references must fail");
}

{
  const tracker = clone();
  tracker.items[0].execution.attempts = 1;
  tracker.items[0].execution.assigned_model = "gpt-5.5";
  tracker.items[0].execution.reasoning_effort = "high";
  expectError(tracker, /expected one of/, "earlier model families must be rejected");
}

{
  const tracker = clone();
  tracker.model_policy.workers["gpt-5.6-luna"].context_window_tokens = 128000;
  expectError(tracker, /gpt-5\.6-luna: context must be 64000/, "worker context routing must be exact");
}

{
  const tracker = clone();
  tracker.orchestration.baseline_commit = "d5ec022";
  tracker.orchestration.checkpoint_commit = "d5ec022";
  expectValid(tracker, "an existing ancestor checkpoint should be resumable");
  assert.deepEqual(validateGitState(tracker, trackerPath, projectRoot), [], "recorded checkpoint must agree with Git state");
  tracker.orchestration.checkpoint_commit = "deadbee";
  assert(validateGitState(tracker, trackerPath, projectRoot).some((error) => /does not exist/.test(error)));
}

{
  const tracker = clone();
  tracker.derived.ready_item_ids = [];
  const errors = validateDocument(tracker, schema);
  assert(errors.some((error) => /derived\.ready_item_ids/.test(error)), "stale readiness must fail");
}

console.log("Android release tracker tests: PASS (readiness, gates, conditionals, remediation, recovery, invalid DAG/model/state)");
