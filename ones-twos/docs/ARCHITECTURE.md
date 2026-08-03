# Architecture

## Overview

Number Garden is a client-only web application contained in [`index.html`](../index.html). HTML, CSS, game logic, persistence, audio, and animation are embedded in that file. It has no build step, framework, external assets, or network dependency. [`server.py`](../server.py) is an optional static server that maps `/` to `index.html`; the game also supports direct `file://` use.

## Runtime components

- **Document and styles:** semantic controls, dialogs, the place-value board, responsive mobile-first layout, focus states, and reduced-motion rules.
- **Arithmetic model:** `deriveProblem(a, b)` validates addends from 1 through 99 and derives digits, place totals, remainders, carries, result, and carry category. Arithmetic does not depend on the DOM.
- **Curriculum model:** `problemMatchesLevel()`, `generateProblemForLevel()`, `selectCurriculumLevel()`, and `sampleCurriculumProblem()` define and select L1–L9 problems. Generated models include `curriculumLevel`; L8 also has `curriculumPattern` because its arithmetic overlaps L7/L9.
- **Session state:** `freshState()` tracks the current phase, count cursors, visible carries, animation lock, solver use, and reward status.
- **Rendering:** `render()` coordinates focused render helpers for the journey, board, prompts, answer state, and alternative problems. Interactive units are recreated from state and only the next valid unit is enabled.
- **Interaction controllers:** event handlers advance manual counting, run Solver from the unfinished step, collect typed answers, change problems, reset state, toggle sound/fullscreen, override levels, and manage settings.
- **Feedback services:** Web Audio produces optional cues; DOM/CSS effects provide carry and completion animations; an ARIA live region announces state changes.

## State flow

```text
counting-ones
  -> carrying-to-tens (when needed)
  -> counting-tens
  -> carrying-to-hundreds (when needed)
  -> awaiting-answer
  -> completed
```

Problems with zero ones begin at `counting-tens`. Manual play stops at `awaiting-answer` until the child enters the correct total. Solver advances through the same transitions and completes automatically. Animation and solver flags lock competing input while transitions run.

## Data boundaries

`problem` contains derived arithmetic plus an optional sampled curriculum tag. Query-forced diagnostic problems deliberately have no tag. `state` contains temporary interaction progress. Profile schema v2 contains durable score, milestone progress, sound, current level, current-level success count, higher-level success count, schema version, and update timestamp. Keeping these separate prevents rendered CSS classes from becoming a source of truth.

Profile data is written to IndexedDB and mirrored to a compact cookie. The newest valid copy wins at startup; if storage is unavailable, the game continues with in-memory state. Schema-v1 records migrate to L1 with zero advancement counters while preserving score, milestones, sound, and timestamp. Reset creates a fresh L1 v2 profile but carries sound forward. There is no backend, account, telemetry, or cross-device synchronization.

## Problem generation and diagnostics

All organic entry points—startup, Next, suggestion construction/selection, alternative refresh, and dice alternatives—draw from the same weighted sampler and share recent unordered-pair exclusions. L2/L4 randomize the location of the single-digit addend. L1 uses a 75/25 current/higher split; L2–L8 use 50/25/25 current/higher/uniform-lower; L9 uses 60/40 current/uniform-L1–L8 review. L8 generation splits evenly between tens-only and both-carry patterns.

Query parameters allow untagged deterministic cases from `index.html?a=1&b=1` through `index.html?a=99&b=99`. They exercise normal arithmetic and rewards but cannot change level counters. `window.NumberGarden` exposes level definitions, named constants, profile validation/defaults, and pure arithmetic, predicate, generation, selection, and progression helpers for deterministic harness checks.

## Rewards and progression

`applyProgressForSuccess()` is a pure transition. Four current-level or two higher-level typed successes advance exactly one level and reset both independent counters; lower/untagged problems do nothing and L9 caps the transition. `completeProblem("typed")` applies that transition and awards 10 coins plus one milestone once. `completeProblem("solver")` shares the visual completion path but does not mutate durable profile data or show the reward toast.

## Conditional Hundreds column

Rendering derives column count from `profile.currentLevel`: L1–L5 use Labels/Tens/Ones and L6–L9 include Hundreds. A transient, non-persisted `hundredsUnlockPending` flag is set only when advancement or a Settings jump crosses from below L6 to L6+. The next board render consumes it, so reloads cannot replay the effect. CSS supplies the motion animation and a static reduced-motion highlight; ARIA announcements and the optional audio cue come from the controller that caused the crossing.

## Change guidance

Keep arithmetic in pure helpers, transient behavior in `state`, durable preferences in `profile`, and DOM construction in render helpers. New phases must update prompt text, input locks, manual advancement, and Solver behavior together. Preserve direct-file operation and avoid introducing a required server or remote resource.
