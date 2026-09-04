#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIR, "..");
const DEFAULT_TRACKER = resolve(PROJECT_ROOT, "docs/exec-plans/android-release-action-items.json");
const DEFAULT_SCHEMA = resolve(PROJECT_ROOT, "docs/exec-plans/android-release-action-items.schema.json");
const ITEM_ID_PATTERN = /^NG-AND-(00[1-9]|01[0-9]|02[0-4])$/;

function parseJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Cannot parse ${path}: ${error.message}`);
  }
}

function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

function resolvePointer(rootSchema, ref) {
  if (!ref.startsWith("#/")) throw new Error(`Unsupported schema reference: ${ref}`);
  return ref
    .slice(2)
    .split("/")
    .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~"))
    .reduce((current, part) => current?.[part], rootSchema);
}

export function validateSchema(value, schema, rootSchema = schema, path = "$") {
  const errors = [];
  if (schema.$ref) {
    const target = resolvePointer(rootSchema, schema.$ref);
    if (!target) return [`${path}: unresolved schema reference ${schema.$ref}`];
    return validateSchema(value, target, rootSchema, path);
  }

  if (Object.hasOwn(schema, "const") && !Object.is(value, schema.const)) {
    errors.push(`${path}: expected constant ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((entry) => Object.is(entry, value))) {
    errors.push(`${path}: expected one of ${schema.enum.map((entry) => JSON.stringify(entry)).join(", ")}`);
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const actual = valueType(value);
    const numberMatches = actual === "integer" && allowed.includes("number");
    if (!allowed.includes(actual) && !numberMatches) {
      errors.push(`${path}: expected type ${allowed.join(" or ")}, got ${actual}`);
      return errors;
    }
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path}: string is shorter than ${schema.minLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      errors.push(`${path}: value ${JSON.stringify(value)} does not match ${schema.pattern}`);
    }
  }

  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: value is below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: value is above ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: allows at most ${schema.maxItems} items`);
    if (schema.uniqueItems) {
      const serialized = value.map((entry) => JSON.stringify(entry));
      if (new Set(serialized).size !== serialized.length) errors.push(`${path}: array entries must be unique`);
    }
    if (schema.items) {
      value.forEach((entry, index) => errors.push(...validateSchema(entry, schema.items, rootSchema, `${path}[${index}]`)));
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const required of schema.required ?? []) {
      if (!Object.hasOwn(value, required)) errors.push(`${path}: missing required property ${required}`);
    }
    for (const [key, entry] of Object.entries(value)) {
      if (schema.properties?.[key]) {
        errors.push(...validateSchema(entry, schema.properties[key], rootSchema, `${path}.${key}`));
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}: unexpected property ${key}`);
      }
    }
  }
  return errors;
}

function dependenciesSatisfied(item, itemsById, gatesById) {
  return item.dependencies.every((dependency) => {
    if (dependency.type === "item") {
      const status = itemsById.get(dependency.id)?.status;
      return status === "done" || status === "not_applicable";
    }
    const status = gatesById.get(dependency.id)?.status;
    return status === "satisfied" || status === "not_applicable";
  });
}

export function computeDerived(tracker) {
  const itemsById = new Map(tracker.items.map((item) => [item.id, item]));
  const gatesById = new Map(tracker.external_gates.map((gate) => [gate.id, gate]));
  return {
    ready_item_ids: tracker.items
      .filter((item) => item.status === "todo" && item.applicability !== "not_required" && dependenciesSatisfied(item, itemsById, gatesById))
      .map((item) => item.id),
    waiting_owner_item_ids: tracker.items.filter((item) => item.status === "waiting_owner").map((item) => item.id),
    blocked_external_gate_ids: tracker.external_gates
      .filter((gate) => gate.status !== "satisfied" && gate.status !== "not_applicable")
      .map((gate) => gate.id)
  };
}

function arraysEqual(left, right) {
  return left.length === right.length && left.every((entry, index) => entry === right[index]);
}

function findCycle(itemsById) {
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  function visit(id) {
    if (visiting.has(id)) {
      const start = stack.indexOf(id);
      return [...stack.slice(start), id];
    }
    if (visited.has(id)) return null;
    visiting.add(id);
    stack.push(id);
    for (const dependency of itemsById.get(id).dependencies.filter((entry) => entry.type === "item")) {
      if (!itemsById.has(dependency.id)) continue;
      const cycle = visit(dependency.id);
      if (cycle) return cycle;
    }
    stack.pop();
    visiting.delete(id);
    visited.add(id);
    return null;
  }
  for (const id of itemsById.keys()) {
    const cycle = visit(id);
    if (cycle) return cycle;
  }
  return null;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function validateDocument(tracker, schema) {
  const errors = validateSchema(tracker, schema);
  if (errors.length) return errors;

  const expectedIds = Array.from({ length: 24 }, (_, index) => `NG-AND-${String(index + 1).padStart(3, "0")}`);
  const ids = tracker.items.map((item) => item.id);
  const ranks = tracker.items.map((item) => item.rank);
  const duplicateIds = duplicateValues(ids);
  const duplicateRanks = duplicateValues(ranks);
  if (duplicateIds.length) errors.push(`items: duplicate IDs: ${duplicateIds.join(", ")}`);
  if (duplicateRanks.length) errors.push(`items: duplicate ranks: ${duplicateRanks.join(", ")}`);
  if (!arraysEqual([...ids].sort(), [...expectedIds].sort())) errors.push("items: expected each NG-AND-001 through NG-AND-024 exactly once");
  if (!arraysEqual([...ranks].sort((a, b) => a - b), Array.from({ length: 24 }, (_, index) => index + 1))) {
    errors.push("items: ranks must contain each integer from 1 through 24 exactly once");
  }
  tracker.items.forEach((item) => {
    const expectedId = `NG-AND-${String(item.rank).padStart(3, "0")}`;
    if (item.id !== expectedId) errors.push(`${item.id}: rank ${item.rank} must correspond to ${expectedId}`);
  });

  const itemsById = new Map(tracker.items.map((item) => [item.id, item]));
  const gateIds = tracker.external_gates.map((gate) => gate.id);
  const duplicateGates = duplicateValues(gateIds);
  if (duplicateGates.length) errors.push(`external_gates: duplicate IDs: ${duplicateGates.join(", ")}`);
  const gatesById = new Map(tracker.external_gates.map((gate) => [gate.id, gate]));

  for (const item of tracker.items) {
    const dependencyKeys = item.dependencies.map((dependency) => `${dependency.type}:${dependency.id}`);
    const duplicateDependencies = duplicateValues(dependencyKeys);
    if (duplicateDependencies.length) errors.push(`${item.id}: duplicate dependencies: ${duplicateDependencies.join(", ")}`);
    for (const dependency of item.dependencies) {
      if (dependency.type === "item" && !itemsById.has(dependency.id)) errors.push(`${item.id}: unknown item dependency ${dependency.id}`);
      if (dependency.type === "external_gate" && !gatesById.has(dependency.id)) errors.push(`${item.id}: unknown external gate ${dependency.id}`);
      if (dependency.type === "item" && dependency.id === item.id) errors.push(`${item.id}: cannot depend on itself`);
      if (dependency.type === "item" && itemsById.has(dependency.id) && itemsById.get(dependency.id).rank >= item.rank) {
        errors.push(`${item.id}: item dependencies must have a lower authoritative rank than their dependent`);
      }
    }
    if (item.play_store_blocker === "required") {
      if (item.applicability !== "always") errors.push(`${item.id}: required blocker must have always applicability`);
      if (item.status === "not_applicable") errors.push(`${item.id}: required blocker cannot be not_applicable`);
    } else {
      if (item.applicability === "always") errors.push(`${item.id}: conditional blocker cannot have always applicability`);
      if (item.applicability === "not_required" && item.status !== "not_applicable") {
        errors.push(`${item.id}: not_required applicability requires not_applicable status`);
      }
      if (item.status === "not_applicable" && item.applicability !== "not_required") {
        errors.push(`${item.id}: not_applicable status requires not_required applicability`);
      }
    }
    if (item.execution.attempts === 0 && (item.execution.assigned_model !== null || item.execution.reasoning_effort !== null)) {
      errors.push(`${item.id}: an unattempted item cannot have an assigned model or reasoning effort`);
    }
    if (item.execution.attempts > 0 && (item.execution.assigned_model === null || item.execution.reasoning_effort === null)) {
      errors.push(`${item.id}: an attempted item must record its assigned model and reasoning effort`);
    }
    if ((item.execution.assigned_model === null) !== (item.execution.reasoning_effort === null)) {
      errors.push(`${item.id}: assigned model and reasoning effort must be set together`);
    }
    if (item.execution.assigned_model) {
      const allowed = tracker.model_policy.workers[item.execution.assigned_model].allowed_reasoning_efforts;
      if (!allowed.includes(item.execution.reasoning_effort)) {
        errors.push(`${item.id}: ${item.execution.reasoning_effort} is not allowed for ${item.execution.assigned_model}`);
      }
    }
    if (item.status === "done") {
      if (item.execution.attempts === 0) errors.push(`${item.id}: done item needs at least one recorded attempt`);
      if (!item.execution.checkpoint_commit) errors.push(`${item.id}: done item needs a checkpoint commit`);
      if (!item.execution.commits.length) errors.push(`${item.id}: done item needs at least one implementation commit`);
      if (!item.execution.evidence_paths.length) errors.push(`${item.id}: done item needs evidence paths`);
      if (!dependenciesSatisfied(item, itemsById, gatesById)) errors.push(`${item.id}: cannot be done before all dependencies are satisfied`);
    }
    if (["blocked", "waiting_owner"].includes(item.status) && item.execution.blockers.length === 0) {
      errors.push(`${item.id}: ${item.status} item must record a blocker`);
    }
    if (["todo", "done", "not_applicable"].includes(item.status) && item.execution.blockers.length > 0) {
      errors.push(`${item.id}: ${item.status} item cannot retain blockers`);
    }
    if (item.status === "not_applicable" && item.execution.evidence_paths.length === 0) {
      errors.push(`${item.id}: not_applicable item needs applicability evidence`);
    }
  }

  const cycle = findCycle(itemsById);
  if (cycle) errors.push(`items: dependency cycle detected: ${cycle.join(" -> ")}`);

  let incompleteSeen = false;
  for (const item of tracker.items) {
    const recordedComplete = item.status === "done" || item.status === "not_applicable";
    if (!recordedComplete) incompleteSeen = true;
    else if (incompleteSeen) errors.push(`${item.id}: completion is recorded after a lower-ranked incomplete item`);
  }

  const calculated = computeDerived(tracker);
  for (const field of Object.keys(calculated)) {
    if (!arraysEqual(tracker.derived[field], calculated[field])) {
      errors.push(`derived.${field}: expected ${JSON.stringify(calculated[field])}, got ${JSON.stringify(tracker.derived[field])}`);
    }
  }

  const expectedModels = {
    "gpt-5.6-luna": { context: 64000, efforts: ["medium", "high"] },
    "gpt-5.6-terra": { context: 128000, efforts: ["high", "xhigh"] },
    "gpt-5.6-sol": { context: 256000, efforts: ["xhigh"] }
  };
  for (const [model, expected] of Object.entries(expectedModels)) {
    const policy = tracker.model_policy.workers[model];
    if (policy.context_window_tokens !== expected.context) {
      errors.push(`model_policy.workers.${model}: context must be ${expected.context}`);
    }
    if (!arraysEqual(policy.allowed_reasoning_efforts, expected.efforts)) {
      errors.push(`model_policy.workers.${model}: reasoning efforts must be ${expected.efforts.join(", ")} in order`);
    }
  }
  const expectedEscalation = ["gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"];
  if (!arraysEqual(tracker.model_policy.escalation_order, expectedEscalation)) {
    errors.push(`model_policy.escalation_order must be ${expectedEscalation.join(" -> ")}`);
  }

  const workerIds = tracker.orchestration.active_workers.map((worker) => worker.worker_id);
  const duplicateWorkers = duplicateValues(workerIds);
  if (duplicateWorkers.length) errors.push(`orchestration.active_workers: duplicate IDs: ${duplicateWorkers.join(", ")}`);
  for (const worker of tracker.orchestration.active_workers) {
    const item = itemsById.get(worker.item_id);
    if (!item) errors.push(`worker ${worker.worker_id}: unknown item ${worker.item_id}`);
    else {
      if (item.status !== "in_progress") errors.push(`worker ${worker.worker_id}: item ${worker.item_id} is not in_progress`);
      if (item.execution.worker_id !== worker.worker_id) errors.push(`worker ${worker.worker_id}: item execution worker_id differs`);
      if (item.execution.assigned_model !== worker.model) errors.push(`worker ${worker.worker_id}: item assigned model differs`);
      if (item.execution.reasoning_effort !== worker.reasoning_effort) errors.push(`worker ${worker.worker_id}: item reasoning effort differs`);
      if (item.execution.worktree_id !== worker.worktree_id) errors.push(`worker ${worker.worker_id}: item worktree differs`);
      if (item.execution.session_id !== worker.session_id) errors.push(`worker ${worker.worker_id}: item session differs`);
    }
    if (!tracker.model_policy.workers[worker.model].allowed_reasoning_efforts.includes(worker.reasoning_effort)) {
      errors.push(`worker ${worker.worker_id}: invalid reasoning effort for ${worker.model}`);
    }
  }
  const worktreeIds = new Set(tracker.orchestration.worktrees.map((worktree) => worktree.id));
  const sessionIds = new Set(tracker.orchestration.sessions.map((session) => session.id));
  for (const [label, values] of [
    ["worktree IDs", tracker.orchestration.worktrees.map((entry) => entry.id)],
    ["worktree paths", tracker.orchestration.worktrees.map((entry) => entry.path)],
    ["worktree branches", tracker.orchestration.worktrees.map((entry) => entry.branch)],
    ["session IDs", tracker.orchestration.sessions.map((entry) => entry.id)],
    ["approval IDs", tracker.orchestration.owner_approvals.map((entry) => entry.id)]
  ]) {
    const duplicates = duplicateValues(values);
    if (duplicates.length) errors.push(`orchestration: duplicate ${label}: ${duplicates.join(", ")}`);
  }
  for (const worktree of tracker.orchestration.worktrees) {
    if (!itemsById.has(worktree.item_id)) errors.push(`worktree ${worktree.id}: unknown item ${worktree.item_id}`);
  }
  for (const session of tracker.orchestration.sessions) {
    if (!itemsById.has(session.item_id)) errors.push(`session ${session.id}: unknown item ${session.item_id}`);
    if (session.state === "running" && !workerIds.includes(session.worker_id)) errors.push(`session ${session.id}: running session has no active worker`);
  }
  for (const approval of tracker.orchestration.owner_approvals) {
    if (!itemsById.has(approval.item_id)) errors.push(`approval ${approval.id}: unknown item ${approval.item_id}`);
    if (["granted", "used"].includes(approval.status) && approval.acknowledged_at === null) {
      errors.push(`approval ${approval.id}: ${approval.status} approval needs an acknowledgement timestamp`);
    }
  }
  for (const worker of tracker.orchestration.active_workers) {
    if (worker.worktree_id && !worktreeIds.has(worker.worktree_id)) errors.push(`worker ${worker.worker_id}: unknown worktree ${worker.worktree_id}`);
    if (worker.session_id && !sessionIds.has(worker.session_id)) errors.push(`worker ${worker.worker_id}: unknown session ${worker.session_id}`);
  }
  const leasedResources = tracker.orchestration.resource_leases.map((lease) => lease.resource);
  const duplicateLeases = duplicateValues(leasedResources);
  if (duplicateLeases.length) errors.push(`orchestration.resource_leases: resources are leased more than once: ${duplicateLeases.join(", ")}`);
  for (const lease of tracker.orchestration.resource_leases) {
    if (!itemsById.has(lease.item_id)) errors.push(`resource lease ${lease.resource}: unknown item ${lease.item_id}`);
    if (lease.holder !== "orchestrator" && !workerIds.includes(lease.holder)) {
      errors.push(`resource lease ${lease.resource}: holder is neither orchestrator nor an active worker`);
    }
  }

  const startupIncomplete = tracker.orchestration.startup_gates.some((gate) => gate.status !== "satisfied");
  if (startupIncomplete && tracker.orchestration.mode !== "preflight_required") {
    errors.push("orchestration.mode must be preflight_required while a startup gate is incomplete");
  }
  if (!startupIncomplete && tracker.orchestration.mode === "preflight_required") {
    errors.push("orchestration.mode cannot remain preflight_required after all startup gates pass");
  }
  if (tracker.orchestration.baseline_commit === null && tracker.orchestration.checkpoint_commit !== null) {
    errors.push("orchestration.checkpoint_commit requires a baseline_commit");
  }
  if (tracker.orchestration.baseline_commit === null && tracker.orchestration.current_wave !== 0) {
    errors.push("orchestration.current_wave must be 0 before a baseline commit exists");
  }
  const selfCheckpointItems = tracker.items.filter((item) => item.execution.checkpoint_commit === "SELF");
  if (selfCheckpointItems.length > 1) errors.push("items: only one item may own the current SELF checkpoint");
  if (selfCheckpointItems.length && tracker.orchestration.checkpoint_commit !== "SELF") {
    errors.push("items: an item SELF checkpoint requires orchestration.checkpoint_commit=SELF");
  }
  const selfCommitItems = tracker.items.filter((item) => item.execution.commits.includes("SELF"));
  if (selfCommitItems.length > 1) errors.push("items: only one item may record SELF in execution.commits");
  if (selfCommitItems.some((item) => item.execution.checkpoint_commit !== "SELF")) {
    errors.push("items: SELF in execution.commits requires the same item checkpoint_commit=SELF");
  }
  const history = tracker.orchestration.checkpoint_history;
  const historyCommits = history.map((checkpoint) => checkpoint.commit);
  const duplicateHistory = duplicateValues(historyCommits);
  if (duplicateHistory.length) errors.push(`orchestration.checkpoint_history: duplicate commits: ${duplicateHistory.join(", ")}`);
  for (const checkpoint of history) {
    if (!itemsById.has(checkpoint.item_id)) errors.push(`checkpoint ${checkpoint.commit}: unknown item ${checkpoint.item_id}`);
    if (!checkpoint.message.startsWith(`${checkpoint.item_id}:`)) errors.push(`checkpoint ${checkpoint.commit}: message must start with ${checkpoint.item_id}:`);
  }

  const remediation = tracker.orchestration.remediation;
  const expectedRepeat = ["NG-AND-018", "NG-AND-019", "NG-AND-020", "NG-AND-021"];
  if (!arraysEqual(remediation.repeat_item_ids, expectedRepeat)) errors.push("orchestration.remediation.repeat_item_ids must be NG-AND-018 through NG-AND-021 in order");
  if (remediation.cycle !== remediation.history.length) errors.push("orchestration.remediation.cycle must equal history length");
  remediation.history.forEach((entry, index) => {
    if (entry.cycle !== index + 1) errors.push(`remediation history entry ${index}: cycle must be ${index + 1}`);
    if (entry.to_version_code <= entry.from_version_code) errors.push(`remediation cycle ${entry.cycle}: versionCode must increase`);
    if (index > 0 && entry.from_version_code < remediation.history[index - 1].to_version_code) {
      errors.push(`remediation cycle ${entry.cycle}: versionCode regresses from the previous cycle`);
    }
  });

  return errors;
}

function parseLegacyDependencies(text) {
  if (text === "None") return [];
  if (text === "Owner/system access") return [{ type: "external_gate", id: "owner_system_access" }];
  if (text === "Approved artwork") return [{ type: "external_gate", id: "artwork_approval" }];
  const range = text.match(/^NG-AND-(\d{3}) through NG-AND-(\d{3})$/);
  if (range) {
    const start = Number(range[1]);
    const end = Number(range[2]);
    return Array.from({ length: end - start + 1 }, (_, index) => ({
      type: "item",
      id: `NG-AND-${String(start + index).padStart(3, "0")}`
    }));
  }
  return text.split(/,\s*/).map((id) => ({ type: "item", id }));
}

function parseLegacyRows(markdown) {
  const rows = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!/^\|\s*\d+\s*\|\s*NG-AND-\d{3}\s*\|/.test(line)) continue;
    const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
    if (cells.length !== 13) throw new Error(`Legacy row has ${cells.length} columns instead of 13: ${line}`);
    const [rank, id, phase, severity, priority, blocker, status, owner, summary, description, dependencies, doneWhen, evidence] = cells;
    rows.push({
      rank: Number(rank),
      id,
      phase,
      severity,
      priority,
      play_store_blocker: blocker === "YES" ? "required" : "conditional",
      status: { TODO: "todo", BLOCKED: "blocked", "WAITING OWNER": "waiting_owner" }[status],
      owner,
      summary,
      description,
      dependencies: parseLegacyDependencies(dependencies),
      completion_criteria: doneWhen,
      evidence_sources: evidence.split(/;\s*/)
    });
  }
  return rows;
}

export function validateLegacyParity(tracker, markdown) {
  const legacyRows = parseLegacyRows(markdown);
  const fields = [
    "rank", "id", "phase", "severity", "priority", "play_store_blocker", "status", "owner", "summary",
    "description", "dependencies", "completion_criteria", "evidence_sources"
  ];
  const errors = [];
  if (legacyRows.length !== 24) errors.push(`legacy parity: expected 24 rows, found ${legacyRows.length}`);
  for (const legacy of legacyRows) {
    const item = tracker.items.find((candidate) => candidate.id === legacy.id);
    if (!item) {
      errors.push(`legacy parity: ${legacy.id} is missing from JSON`);
      continue;
    }
    for (const field of fields) {
      if (JSON.stringify(item[field]) !== JSON.stringify(legacy[field])) {
        errors.push(`legacy parity: ${legacy.id}.${field} differs\n  Markdown: ${JSON.stringify(legacy[field])}\n  JSON:     ${JSON.stringify(item[field])}`);
      }
    }
  }
  return { errors, rowCount: legacyRows.length, fieldCount: fields.length };
}

function git(projectRoot, args) {
  return execFileSync("git", args, { cwd: projectRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function checkCommitExists(projectRoot, ref, label, errors) {
  if (!ref || ref === "SELF") return;
  try {
    git(projectRoot, ["cat-file", "-e", `${ref}^{commit}`]);
  } catch {
    errors.push(`${label}: commit ${ref} does not exist in the local repository`);
  }
}

export function validateGitState(tracker, trackerPath, projectRoot = PROJECT_ROOT) {
  const errors = [];
  let topLevel;
  let head;
  try {
    topLevel = git(projectRoot, ["rev-parse", "--show-toplevel"]);
    head = git(projectRoot, ["rev-parse", "HEAD"]);
  } catch (error) {
    return [`git state: ${error.message}`];
  }
  const repoPath = relative(topLevel, trackerPath).split("\\").join("/");
  checkCommitExists(projectRoot, tracker.metadata.source_audit_commit, "metadata.source_audit_commit", errors);
  checkCommitExists(projectRoot, tracker.metadata.migration.legacy_blob_commit, "metadata.migration.legacy_blob_commit", errors);
  checkCommitExists(projectRoot, tracker.orchestration.baseline_commit, "orchestration.baseline_commit", errors);
  checkCommitExists(projectRoot, tracker.orchestration.checkpoint_commit, "orchestration.checkpoint_commit", errors);
  tracker.orchestration.checkpoint_history.forEach((entry) => checkCommitExists(projectRoot, entry.commit, `checkpoint ${entry.commit}`, errors));
  tracker.items.forEach((item) => {
    item.execution.commits.forEach((commit) => checkCommitExists(projectRoot, commit, `${item.id}.execution.commits`, errors));
    checkCommitExists(projectRoot, item.execution.checkpoint_commit, `${item.id}.execution.checkpoint_commit`, errors);
  });

  const checkpoint = tracker.orchestration.checkpoint_commit;
  if (checkpoint && checkpoint !== "SELF") {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", checkpoint, head], { cwd: projectRoot, stdio: "ignore" });
    } catch {
      errors.push(`orchestration.checkpoint_commit ${checkpoint} is not an ancestor of HEAD ${head}`);
    }
  }
  if (checkpoint === "SELF") {
    try {
      const committed = execFileSync("git", ["show", `HEAD:${repoPath}`], { cwd: projectRoot });
      const current = readFileSync(trackerPath);
      if (!committed.equals(current)) errors.push("orchestration.checkpoint_commit is SELF but the tracker differs from HEAD");
    } catch {
      errors.push("orchestration.checkpoint_commit is SELF but the tracker is not present at HEAD");
    }
  }
  for (const entry of tracker.orchestration.checkpoint_history) {
    try {
      const historical = execFileSync("git", ["show", `${entry.commit}:${repoPath}`], { cwd: projectRoot });
      const digest = createHash("sha256").update(historical).digest("hex");
      if (digest !== entry.tracker_sha256) errors.push(`checkpoint ${entry.commit}: tracker SHA-256 differs from Git`);
    } catch {
      errors.push(`checkpoint ${entry.commit}: tracker blob is unavailable in Git`);
    }
  }
  if (tracker.orchestration.baseline_commit && tracker.orchestration.baseline_commit !== "SELF") {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", tracker.orchestration.baseline_commit, head], { cwd: projectRoot, stdio: "ignore" });
    } catch {
      errors.push(`orchestration.baseline_commit ${tracker.orchestration.baseline_commit} is not an ancestor of HEAD ${head}`);
    }
  }
  for (const item of tracker.items) {
    const itemCheckpoint = item.execution.checkpoint_commit;
    if (!itemCheckpoint || itemCheckpoint === "SELF") continue;
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", itemCheckpoint, head], { cwd: projectRoot, stdio: "ignore" });
    } catch {
      errors.push(`${item.id}.execution.checkpoint_commit ${itemCheckpoint} is not an ancestor of HEAD ${head}`);
    }
  }

  const actualWorktrees = new Map();
  try {
    const records = git(projectRoot, ["worktree", "list", "--porcelain"]).split(/\n\n+/);
    for (const record of records) {
      const fields = Object.fromEntries(record.split(/\r?\n/).map((line) => {
        const separator = line.indexOf(" ");
        return separator === -1 ? [line, true] : [line.slice(0, separator), line.slice(separator + 1)];
      }));
      if (fields.worktree) actualWorktrees.set(fields.worktree, fields);
    }
  } catch (error) {
    errors.push(`git worktree state: ${error.message}`);
  }
  for (const worktree of tracker.orchestration.worktrees) {
    const actual = actualWorktrees.get(worktree.path);
    if (!actual) {
      errors.push(`worktree ${worktree.id}: recorded path ${worktree.path} is not a registered Git worktree`);
      continue;
    }
    if (actual.HEAD !== worktree.head_commit) errors.push(`worktree ${worktree.id}: recorded HEAD differs from Git`);
    const actualBranch = typeof actual.branch === "string" ? actual.branch.replace(/^refs\/heads\//, "") : null;
    if (actualBranch !== worktree.branch) errors.push(`worktree ${worktree.id}: recorded branch differs from Git`);
  }
  return errors;
}

function parseArguments(argv) {
  const options = { tracker: DEFAULT_TRACKER, schema: DEFAULT_SCHEMA, legacy: null, checkGit: false, printReady: false };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--tracker") options.tracker = resolve(argv[++index]);
    else if (argument === "--schema") options.schema = resolve(argv[++index]);
    else if (argument === "--legacy") options.legacy = resolve(argv[++index]);
    else if (argument === "--check-git") options.checkGit = true;
    else if (argument === "--print-ready") options.printReady = true;
    else if (argument === "--help") {
      console.log("Usage: node scripts/validate-android-release-tracker.mjs [--tracker PATH] [--schema PATH] [--legacy PATH] [--check-git] [--print-ready]");
      process.exit(0);
    } else throw new Error(`Unknown argument: ${argument}`);
  }
  return options;
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  const tracker = parseJson(options.tracker);
  const schema = parseJson(options.schema);
  const errors = validateDocument(tracker, schema);
  let parity = null;
  if (options.legacy) {
    parity = validateLegacyParity(tracker, readFileSync(options.legacy, "utf8"));
    errors.push(...parity.errors);
  }
  if (options.checkGit) errors.push(...validateGitState(tracker, options.tracker));
  if (errors.length) {
    console.error(`Android release tracker validation: FAIL (${errors.length} error${errors.length === 1 ? "" : "s"})`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log(`Android release tracker validation: PASS (${tracker.items.length} items, acyclic dependencies)`);
  if (parity) console.log(`Legacy Markdown parity: PASS (${parity.rowCount} rows × ${parity.fieldCount} fields)`);
  if (options.checkGit) console.log("Git checkpoint consistency: PASS");
  if (options.printReady) console.log(`Ready: ${tracker.derived.ready_item_ids.join(", ") || "none"}`);
  const digest = createHash("sha256").update(readFileSync(options.tracker)).digest("hex");
  console.log(`Tracker SHA-256: ${digest}`);
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(`Android release tracker validation: FAIL\n- ${error.message}`);
    process.exit(1);
  }
}
