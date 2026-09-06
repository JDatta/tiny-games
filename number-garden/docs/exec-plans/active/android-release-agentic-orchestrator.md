# Android release agentic orchestrator

**State:** active; local orchestrator activated on 2026-09-06 after the owner preflight passed
**Scope:** execute `NG-AND-001` through `NG-AND-024`  
**Authoritative tracker:** [`../android-release-action-items.json`](../android-release-action-items.json)  
**Tracker schema:** [`../android-release-action-items.schema.json`](../android-release-action-items.schema.json)  
**Validator:** [`../../../scripts/validate-android-release-tracker.mjs`](../../../scripts/validate-android-release-tracker.mjs)  
**Required owner preflight:** [`../../runbooks/android-release/preflight.md`](../../runbooks/android-release/preflight.md)

## Goal and completion boundary

Run the ranked Android release program safely and resumably from the current repository state through a monitored Google Play production release. The orchestrator coordinates no more than three workers, owns the tracker, reviews every worker result, integrates changes in rank order, and creates a local checkpoint after each integrated item or safe diagnostic milestone.

This document specifies execution; creating it does not start the release. Execution begins only after the preflight hard gate passes, the intended dirty baseline has been reviewed and committed, and this file is moved from `pending/` to `active/` in a separate activation commit. It is complete only when `NG-AND-024` is `done`, the release archive and monitoring evidence exist, and the plan has moved to `completed/` in its own closing checkpoint.

The Codemagic/iOS plan is context only. It is outside this orchestrator.

## Non-negotiable controls

- Use GPT-5.6-Sol with `xhigh` reasoning for the orchestrator and its provided 1,000,000-token context window.
- Use at most three concurrent workers, chosen only from GPT-5.6 Luna, Terra, and Sol. Reject an earlier family or an unlisted alias.
- The orchestrator is the only writer to `docs/exec-plans/android-release-action-items.json`. A worker must not edit, stage, or commit that file.
- Rank remains authoritative. Independent owner/infrastructure preparation may begin early, but an item is recorded complete only in ranked dependency order.
- Keep checkpoints local. Pushing is a separate owner-authorized action and is not part of ordinary checkpointing.
- Preserve `android/.idea/` as owner-local state. Never stage, modify, move, or delete it without a separate owner decision.
- Never record credentials, signing passwords, private keystore paths or material, device serials, sensitive traffic payloads, ignored artifacts, local SDK properties, or Android Studio state.
- Never use `--dangerously-bypass-approvals-and-sandbox`, `--dangerously-bypass-hook-trust`, `--ignore-rules`, or `--skip-git-repo-check`. Do not turn an approval failure into a sandbox bypass.
- Treat heavy builds, Capacitor syncs, OPPO/WebView work, Play Console mutations, release version changes, and emulator sessions as exclusive resources.
- Run one AVD at a time on the Lenovo 20DSA0FV00 host.
- Starting the orchestrator grants no Play Console, signing, upload, tester, or production authority. Obtain the scoped acknowledgement in the relevant runbook just in time.

## System of record

The JSON tracker is the only task state. Git history is the recovery source for the retired Markdown tracker; do not recreate it, generate a Markdown mirror, or introduce a spreadsheet copy.

Before reading readiness or assigning work, run:

```bash
npm run test:android-release-tracker
npm run validate:android-release-tracker
```

The validator enforces the schema, all 24 unique IDs, ranks 1–24, valid dependency and external-gate references, an acyclic DAG, conditional-item state, model/effort constraints, worker/resource consistency, checkpoint rules, remediation version increments, and derived readiness. `derived.ready_item_ids` is materialized so a reviewer can see it, but it must equal the validator calculation.

The tracker contains:

- source metadata and rank/writer policies;
- the two migrated external dependencies, `owner_system_access` and `artwork_approval`;
- orchestrator/worker model policy;
- baseline and checkpoint state, current wave, workers, worktrees, sessions, resource leases, owner approvals, blockers, and next actions;
- all row fields from the retired tracker plus per-item attempts, assignments, commits, evidence, blockers, and next actions;
- the conditional applicability of `NG-AND-022` and `NG-AND-023`;
- remediation history and strictly increasing replacement `versionCode` values.

Only update a derived array by calculating it from the rest of the tracker. Never use it to override dependency truth.

## Hard preflight and activation

Stop before any release item when `docs/runbooks/android-release/preflight.md` is incomplete. BIOS/UEFI work cannot be deferred into a long-running session. In particular, do not start `NG-AND-001`, create worker worktrees, or mark the startup gate satisfied until the owner returns the exact runbook acknowledgement and its non-sensitive checks are independently verified.

After preflight:

1. Read `AGENTS.md`, `ARCHITECTURE.md`, this spec, the authoritative JSON, `docs/exec-plans/pending/android-play-release-handover.md`, `docs/qa/android-release-qa.md`, and every runbook for the first wave.
2. Validate the JSON and Git state. Inspect `git status --short --branch --untracked-files=all`, recent log, and `git worktree list --porcelain`.
3. Review every pre-existing modification. The current harnessification files plus this pending orchestrator/tracker/schema/runbook implementation are intended baseline work; stop for owner review if any other unknown change appears.
4. Make a baseline commit containing only those reviewed intended changes. Use explicit paths and verify the index with `git diff --cached --name-status`. Exclude `android/.idea/`.
5. Record the exact baseline commit in the JSON and validate it.
6. Move this spec from `pending/` to `active/` and make a separate activation commit. Do not mix an item implementation into activation.
7. Change the startup gate to `satisfied`, set orchestration mode to `ready`, set `current_wave` to `1`, recalculate `derived`, and checkpoint the activation.

The repository root is `/home/jd/workspace/tiny-games`; the project path is `/home/jd/workspace/tiny-games/number-garden`. Keep the orchestrator’s working directory at the project path and use only standard Git commands there. Git discovers and manages the parent repository metadata itself. Never request direct `.git` filesystem access, set `GIT_DIR`, or edit repository metadata manually. If an ordinary Git command or an explicit sibling worktree path needs tool approval, request approval for only that command/path.

## Checkpoint protocol

Every integrated item and every diagnostic result safe enough to preserve gets a local commit whose subject begins with the item ID:

```text
NG-AND-001: Stabilize deterministic curriculum harness
NG-AND-002: Record aggregate instrumentation diagnosis
```

The same commit contains the item changes, safe evidence updates, and the authoritative tracker transition. Do not make an implementation commit that leaves the tracker behind.

A Git commit cannot contain its own future SHA. The tracker therefore allows the literal `SELF` for only the current checkpoint:

1. Before committing, replace any older `SELF` with the current exact `HEAD` SHA and append its message and tracker digest to `checkpoint_history`.
2. Set the newly integrated item’s `execution.checkpoint_commit` and global `orchestration.checkpoint_commit` to `SELF`. Append `SELF` to that item’s `execution.commits` when the integration checkpoint itself is the commit being recorded.
3. Recalculate `derived`, run the validator without `--check-git`, review the staged paths, and commit with the required subject.
4. Immediately rerun the validator with `--check-git`. It resolves `SELF` to `HEAD` and verifies that the tracker bytes are exactly those committed at `HEAD`.
5. At the next checkpoint, turn the old `SELF` into its exact SHA. There is never more than one unresolved `SELF` checkpoint.

An item may become `done` only when its completion criteria are met, its dependencies are satisfied, at least one implementation/diagnostic commit and safe evidence path are recorded, the orchestrator has reviewed and retested the result, and no lower-ranked item remains incomplete. `not_applicable` is allowed only for a conditional item with recorded applicability evidence.

Checkpoint commands are intentionally local:

```bash
cd /home/jd/workspace/tiny-games/number-garden
node scripts/validate-android-release-tracker.mjs
git diff --check
git add -- REVIEWED_EXPLICIT_PATHS
git diff --cached --name-status
git commit -m "NG-AND-###: concise result"
node scripts/validate-android-release-tracker.mjs --check-git --print-ready
```

Never stage with a repository-wide wildcard. Replace `REVIEWED_EXPLICIT_PATHS` with individually reviewed paths, then confirm `android/.idea/` and secrets are absent from the index. Checkpointing uses Git’s normal index and commit plumbing; the orchestrator never writes `.git` files itself.

## Resume and recovery

Every fresh or resumed orchestrator session performs this sequence before work:

1. Read the active spec, `AGENTS.md`, architecture, tracker, schema, validator, relevant owner runbooks, QA report, and handover.
2. Run tracker tests and validation with `--check-git`.
3. Inspect Git status/log and all worktrees. Compare actual branches, heads, paths, and worktree state with the tracker.
4. Reconcile every recorded Codex session with `codex agents` or the supported session listing. Do not assume a process is alive because a session ID is recorded.
5. Check exclusive resource leases against actual emulator, Gradle, ADB, and browser activity. Clear a stale lease only after proving no owner or worker still holds it.
6. If `checkpoint_commit` is `SELF`, verify the JSON is byte-identical to `HEAD`. If it is a SHA, verify it exists and is an ancestor of `HEAD`.
7. Inspect every interrupted worker worktree. Never delete, reset, overwrite, or reassign it until its changes and session are understood and recorded.
8. Recompute readiness, then resume the lowest-ranked dependency-ready item. Owner and infrastructure preparation may continue only in explicitly independent lanes.

On mismatch, set orchestration mode to `paused`, record the discrepancy in `blockers` and `next_actions`, and checkpoint only after state is safely reconciled. Git history—not a reconstructed Markdown table—is the rollback source.

## Worker isolation and contract

Use native sub-agents only for short, read-only investigations that need no persistent session. Use persisted Codex CLI sessions for long, mutable, device, or resumable work. Each implementation worker receives a dedicated branch and Git worktree outside the main checkout. A worker may commit its scoped implementation branch, but never edits the authoritative tracker.

Create a worktree only after recording its intended ID/path/branch and item assignment in the tracker. From `number-garden`, use a standard command such as `git worktree add EXPLICIT_SIBLING_PATH -b agent/ng-and-001-harness BASELINE_COMMIT`. Do not access `.git` directly and do not reuse a dirty or interrupted worktree.

Worker commands use installed CLI features documented by the [official Codex command reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli): `--model`, `-c` configuration overrides, `--output-schema`, `--output-last-message`, and `codex exec resume`. The current configuration reference defines `model_reasoning_effort` and `model_context_window`.

Example new persisted worker:

```bash
codex exec \
  --model gpt-5.6-terra \
  -c 'model_reasoning_effort="high"' \
  -c model_context_window=128000 \
  --strict-config \
  --sandbox workspace-write \
  --cd /absolute/reviewed/worker/worktree \
  --output-schema /home/jd/workspace/tiny-games/number-garden/docs/exec-plans/android-release-worker-result.schema.json \
  --output-last-message /absolute/nonsecret/evidence/ng-and-###-result.json \
  "Implement only NG-AND-###. Do not edit the authoritative tracker."
```

Resume by the exact recorded session ID:

```bash
codex exec resume SESSION_ID \
  --model gpt-5.6-terra \
  -c 'model_reasoning_effort="high"' \
  -c model_context_window=128000 \
  --strict-config \
  --output-schema /home/jd/workspace/tiny-games/number-garden/docs/exec-plans/android-release-worker-result.schema.json \
  --output-last-message /absolute/nonsecret/evidence/ng-and-###-result.json \
  "Continue from the recorded blocker and return the complete worker result."
```

Never add `--ephemeral`; the session must remain resumable. Use `--json` only when an orchestrator-owned log consumer redacts and stores safe event data. Context-window settings are upper budgets for the worker task, not a reason to stuff unrelated repository material into the prompt.

Every worker’s final JSON must contain:

- `item_id`, `status`, `branch`, `session_id`, and `worktree_id`;
- commits and changed files;
- tests run and their outcomes;
- safe evidence paths;
- remaining risks;
- a blocker or `null`;
- one recommended next action.

The orchestrator validates this result, reviews the diff and commit, reruns proportional tests in the integration context, checks for secrets/serials/ignored output, and only then integrates. A worker’s `ready_for_review` status is not tracker completion.

## Model routing

| Model | Effort and context | Primary work | Escalation |
| --- | --- | --- | --- |
| GPT-5.6-Luna | medium/high, 64K | SDK/AVD mechanics, scripted QA preparation, repeated commands, asset checks, evidence normalization | Escalate to Terra after one unexpected technical failure. |
| GPT-5.6-Terra | high/xhigh, 128K | Gradle diagnosis, device/WebView QA, policy-link implementation, artwork integration, signing configuration, AAB validation, Play-delivered QA | Escalate to Sol for unresolved critical behavior, privacy, or signing risk. |
| GPT-5.6-Sol | xhigh, 256K worker context | Arithmetic correctness, analytics consent, cross-cutting sign-off, Play policy, release freeze, remediation, consequential owner gates | The Sol orchestrator resolves scope/risk or pauses for the owner. |

The orchestrator itself stays GPT-5.6-Sol/xhigh with the provided 1M context window. Do not silently downgrade it or use an earlier model family. Record every assigned model, effort, context, attempt, and escalation in the tracker.

## Resource leasing

Acquire a tracker lease before starting any exclusive operation and release it only after the process and evidence capture finish:

| Resource | Exclusive operations |
| --- | --- |
| `heavy_build` | Gradle builds/tests, clean npm install when resource-heavy, bundletool generation/validation |
| `capacitor_sync` | `npm run build` followed by `npx cap sync android` |
| `oppo_webview` | Any OPPO ADB, install, WebView inspection, traffic capture, screenshot, or logcat session |
| `play_console` | Any signed-in Play Console read/write session |
| `release_version` | Any `versionCode` or `versionName` mutation and candidate replacement |
| `emulator` | Any AVD boot or emulator QA; only one lease and one running AVD |

The Play Console lease does not itself authorize a mutation. It must be paired with the item-specific granted approval record. A lease holder may be the orchestrator or exactly one active worker. If a command is interrupted, retain the lease until process state is checked.

## Execution waves

### Wave 1 — stabilize and open owner lanes

- Investigate `NG-AND-001` and `NG-AND-002` concurrently.
- `NG-AND-003` may analyze in parallel, but it must not implement until `NG-AND-001` is integrated because both touch `index.html` and the browser harness.
- Review, retest, integrate, and checkpoint in the order `NG-AND-001` → `NG-AND-002` → `NG-AND-003`.
- Use the completed preflight as the evidence basis for `NG-AND-009`; do not call BIOS/AVD provisioning deferred work.
- Open the owner lanes for `NG-AND-012`, `NG-AND-013`, and `NG-AND-014` using their runbooks. Their preparation may overlap, but their tracker completion still waits for ranked recording.

### Wave 2 — privacy and QA matrices

- Execute `NG-AND-004` → `NG-AND-005` → `NG-AND-006`.
- Serialize `NG-AND-007` and `NG-AND-008` on the OPPO. They must never overlap with another OPPO/WebView session.
- Run `NG-AND-010` across API 24, API 30, and API 36, one cold-booted no-snapshot AVD at a time.
- Non-device documentation and owner-approved artwork preparation may overlap when it has no conflicting file/resource lease.

### Wave 3 — sign-off, policy, assets, and signing wiring

- Close `NG-AND-011` only after `NG-AND-001`–`NG-AND-010` have acceptable evidence and no P0/P1 defect is open.
- Complete `NG-AND-014` before its dependents.
- Run `NG-AND-015` and `NG-AND-017` in parallel only when their dependencies clear.
- Prepare listing copy and non-final media for `NG-AND-016`; defer final screenshots until a signed candidate exists.

### Wave 4 — candidate and bundle

- Run `NG-AND-018` from a clean dependency install and freeze the exact release-candidate commit.
- Run `NG-AND-019` against that exact commit. Install a current official `bundletool` release before this item and record its version/source; absence of bundletool is not a startup blocker.
- Finish `NG-AND-016` screenshots from the signed candidate without changing the frozen app, native assets, privacy behavior, or version.

### Wave 5 — Play testing, remediation, and production

- Obtain the exact-hash/version approval for `NG-AND-020`, then upload only that AAB to Internal testing.
- Run `NG-AND-021` and, when applicable/practical, `NG-AND-022` concurrently without sharing a device or Play Console mutation lease.
- For `NG-AND-022`, record `applicability=required` when the live account requires it. Otherwise record evidence, use `applicability=not_required`, and set `status=not_applicable` at the proper rank.
- `NG-AND-023` is a remediation loop. Any app mutation reopens `NG-AND-018` → `NG-AND-019` → `NG-AND-020` → `NG-AND-021` and increments `versionCode` above every uploaded bundle. Append one remediation-history record per replacement. Listing-only evidence changes do not mutate the frozen app.
- `NG-AND-024` always requires a fresh production acknowledgement. Earlier upload or console approvals do not carry forward.

## Owner and external actions

The owner-action directory contains the exact pause/return contract for each external gate:

- [`NG-AND-005 privacy policy`](../../runbooks/android-release/owner-actions/ng-and-005-privacy-policy.md)
- [`NG-AND-012 signing custody`](../../runbooks/android-release/owner-actions/ng-and-012-signing-custody.md)
- [`NG-AND-013 Play setup`](../../runbooks/android-release/owner-actions/ng-and-013-play-setup.md)
- [`NG-AND-014 artwork approval`](../../runbooks/android-release/owner-actions/ng-and-014-artwork-approval.md)
- [`NG-AND-015 Play declarations`](../../runbooks/android-release/owner-actions/ng-and-015-play-declarations.md)
- [`NG-AND-016 store listing`](../../runbooks/android-release/owner-actions/ng-and-016-store-listing.md)
- [`NG-AND-020 Internal upload`](../../runbooks/android-release/owner-actions/ng-and-020-internal-upload.md)
- [`NG-AND-022 closed-test decision`](../../runbooks/android-release/owner-actions/ng-and-022-closed-test.md)
- [`NG-AND-024 production`](../../runbooks/android-release/owner-actions/ng-and-024-production.md)

At each applicable gate, re-open the linked official Google/Android pages, record the check date and relevant current requirement in safe evidence, and resolve discrepancies before asking for approval. Runbooks are operational guides, not substitutes for current policy.

## Evidence rules

Evidence must identify the item, date, exact commit/source hash, artifact hash where relevant, target configuration, command/test, outcome, and safe path. Redact or omit:

- ADB serials and other stable device identifiers;
- cookies, tokens, authorization headers, account details, traffic bodies with identifiers, and Play Console private data;
- keystore paths, aliases when not already public, passwords, secret environment/property names containing values, and private key material;
- ignored APK/AAB contents as tracked files;
- local absolute owner-secret paths and Android Studio workspace state.

Public upload-certificate fingerprints and artifact SHA-256 hashes are allowed. Prefer textual pass/fail summaries and redacted screenshots. Evidence is not completion until the orchestrator verifies it against the item’s criteria.

## Owner pauses and prohibited assumptions

Pause when a runbook says so, when a dependency or external gate is unsatisfied, when policy/source facts conflict, when a critical privacy/signing defect is unresolved, when the frozen candidate would change, or when new authority is needed.

Never infer permission to:

- accept or publish a privacy policy;
- create a Play app, accept signing terms, resolve ownership with a private key, or change account settings;
- choose final artwork/listing/declarations;
- create/move/replace signing material or inspect its secret location;
- upload a bundle, add/invite testers, apply for production access, or start/expand production;
- push local commits.

Record approvals as exact target/scope/status entries in `orchestration.owner_approvals`. An approval expires after its named action or target changes. Production approval is never reusable.

## Rollback and failure handling

- Preserve interrupted worker branches, worktrees, sessions, results, and safe logs.
- Revert a bad integrated checkpoint with a new, explicit `NG-AND-###:` recovery commit only after reviewing its downstream state. Do not rewrite or hard-reset shared history.
- Rebuild generated web/native copies from canonical `index.html`; do not repair copied assets directly.
- If a released/tested artifact has a defect, never replace it under the same `versionCode`. Enter the NG-AND-023 loop.
- If signing integrity or credential exposure is suspected, stop all signing/upload work, preserve non-secret facts, and ask the owner for a containment decision.
- If policy requirements change, pause the relevant item, record the new official source/date, and reopen affected implementation, declaration, listing, or QA work.

## Verification and closure

Before each item checkpoint:

- validate worker output against its schema;
- review changed files and commits;
- rerun proportional tests and all stated completion checks;
- scan staged paths/content for secrets, serials, ignored artifacts, and `android/.idea/`;
- run tracker validation and `git diff --check`.

Before candidate freeze and production, additionally verify:

- the full deterministic browser harness and required native/device/emulator matrices;
- canonical/generated web asset identity;
- final privacy behavior and WebView traffic evidence;
- package identity, manifest, min/target SDK, version, signatures, certificate, AAB contents, and SHA-256;
- final Play declarations/listing against current official policy;
- every owner acknowledgement is for the exact current target;
- no P0/P1 defect or unaccepted release blocker remains.

At `NG-AND-024`, archive the exact commit, AAB hash, public certificate fingerprint, QA report, policy/listing versions, release notes, approval, rollout state, and monitoring/stop criteria. Set orchestration mode to `complete`, validate the final tracker, then move this spec from `active/` to `completed/` in a final local checkpoint.
