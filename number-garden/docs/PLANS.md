# Plans

## Lightweight changes

Small fixes and focused refactors can be described in the change or pull-request summary. Use the deterministic curriculum harness or a proportional manual check to record verification.

## Execution plans

Use a long-form execution plan for changes that span arithmetic semantics, curriculum, persistence, native delivery, privacy, or release readiness. A plan starts in `docs/exec-plans/pending/`, moves to `docs/exec-plans/active/` when implementation begins, and moves to `docs/exec-plans/completed/` only after implementation and verification are done.

Each plan should state its goal, key decisions, task checklist, risks, rollback or recovery approach, and verification evidence. The engineer executing the work owns moving the plan between states.

## Tech debt

Record release and engineering follow-up in the appropriate pending plan. `docs/exec-plans/android-release-action-items.json` is the sole authoritative Android release tracker for NG-AND-001 through NG-AND-024. Only the orchestrator may edit it; workers return structured results and must not maintain Markdown, spreadsheet, or generated tracker copies.

Validate the tracker with `npm run test:android-release-tracker` and `npm run validate:android-release-tracker`. The latter also reconciles recorded checkpoints with local Git state.

## Pointers

Use `ARCHITECTURE.md` to identify runtime boundaries and `QUALITY_SCORE.md` to identify the highest-value gaps before drafting a plan.
