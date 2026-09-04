# Execution plans

Long-form plans for non-trivial changes use this lifecycle:

- `pending/` — approved or proposed work that has not started.
- `active/` — work currently under implementation. Move a plan here when execution begins.
- `completed/` — implemented and verified plans. Move from `active/` only when the work is done.

Each plan should include its goal, key decisions, task checklist, risks, rollback or recovery approach, and verification evidence. The engineer driving the work owns lifecycle moves. Existing pending and completed documents remain historical project records; this harness does not generate plan bodies.

The Android release program is the deliberate exception to plan-local checklists: `android-release-action-items.json` is its sole authoritative task and runtime-state tracker. Its schema and dependency-free validator live beside it. Do not create a Markdown, spreadsheet, or generated mirror. The orchestrator specification begins in `pending/`, moves to `active/` only after the owner preflight and activation commit, and moves to `completed/` after NG-AND-024 closes.
