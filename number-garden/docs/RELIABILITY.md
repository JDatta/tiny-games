# Reliability

## SLOs

No formal SLOs are defined. Suitable starting measures are: successful local and direct-file launch, a deterministic full browser-harness pass on the release candidate, and successful offline play without required analytics or storage access.

## Critical user journeys

- **Launch and begin play:** Open `index.html` directly or via `server.py`, select Start or Tutorial, and render a valid sampled problem.
- **Complete arithmetic:** Follow the operation-specific place-value flow, reveal the keypad, and record one manual typed completion.
- **Resume local progress:** Load the newest valid IndexedDB or cookie profile, or continue in memory when storage fails.
- **Guided learning:** Run Tutorial through the same transitions without changing score, milestone, level, or analytics completion state.
- **Native shell startup:** Build the canonical web asset, sync Capacitor, and render the same web game in Android WebView.

`tests/curriculum-harness.html` exercises the browser journeys. Android-focused evidence and gaps are recorded in `docs/qa/android-release-qa.md`; ranked work and resumable orchestration state live only in `docs/exec-plans/android-release-action-items.json`.

## Failure modes

| Failure mode | Current behavior | Mitigation or gap |
| --- | --- | --- |
| IndexedDB or cookie unavailable | The game falls back to in-memory play. | Verify recovery and persistence behavior on representative browsers and devices. |
| Analytics unavailable | Gameplay remains functional because the tag is optional. | Confirm no visible error or stalled UI during network failure. |
| Animation interrupted by reset, resize, or visibility change | Interaction code settles or resets queued progress through centralized paths. | Retain regression coverage in the curriculum harness. |
| Android release candidate fails device or aggregate tests | Debug smoke evidence exists, but release QA is incomplete. | Resolve the harness and Kotlin duplicate-class failures, then complete the documented matrix. |

## Observability and runbooks

Browser diagnostics are exposed through `window.NumberGarden.motionDiagnostics`; analytics supplies only optional engagement events. There is no backend logging, monitoring service, dashboard, or on-call rotation. The Android QA report, agentic orchestrator spec, and `docs/runbooks/android-release/` are the current operational guidance. The tracker validator checks dependency readiness, resource/session state, checkpoint recovery, and remediation version increments before work resumes.

## Backups and disaster recovery

There is no server-side learner data or backup system. Game progress is device-local and may be reset or lost when browser/app storage is cleared. Release signing custody and artifact recovery remain owner-controlled release work.
