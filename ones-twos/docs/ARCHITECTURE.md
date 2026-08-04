# Architecture

## Overview

Number Garden is a client-only web application contained in [`index.html`](../index.html). HTML, CSS, game logic, persistence, audio, and animation are embedded in that file. It has no build step, framework, external assets, or network dependency. [`server.py`](../server.py) is an optional static server that maps `/` to `index.html`; the game also supports direct `file://` use.

## Runtime components

- **Document and styles:** semantic controls, dialogs, the place-value board, responsive mobile-first layout, focus states, and reduced-motion rules.
- **Arithmetic model:** `deriveProblem(a, b)` validates addends from 1 through 99 and derives digits, place totals, remainders, carries, result, and carry category. Arithmetic does not depend on the DOM.
- **Curriculum model:** `problemMatchesLevel()`, `generateProblemForLevel()`, `selectCurriculumLevel()`, and `sampleCurriculumProblem()` define and select L1–L9 problems. Generated models include `curriculumLevel`; L8 also has `curriculumPattern` because its arithmetic overlaps L7/L9.
- **Session state:** `freshState()` tracks the current phase, separate accepted and landed cursors, the sequential drop queue, visible carries, animation phase, solver use, and reward status. A separate transient dice-refresh state tracks `idle`, `tumbling`, `emphasizing`, or the reduced-motion static highlight without changing the arithmetic state or persisted profile.
- **Rendering:** `render()` coordinates focused render helpers for the journey, board, prompts, answer state, and alternative problems. Source and result units receive stable place/index metadata so animation geometry can be measured from the current responsive layout. Beetle prompts come from frozen per-step pools and are cached in transient state so unrelated renders do not change the message; an actual message change drives one mascot reaction. Interactive units are recreated from state and only the next valid unit is enabled.
- **Interaction controllers:** event handlers advance manual counting, run Solver from the unfinished step, collect typed answers, change problems, refresh only the three alternative cards, reset state, toggle sound/fullscreen, override levels, and manage settings.
- **Feedback services:** reusable Web Audio helpers produce optional drop, carry, beetle, outcome, celebration, and synthesized dice-rattle effects. The dice sound combines filtered noise bursts with short impacts and requires no media asset. Fixed-position overlay clones animate between measured source/result rectangles without becoming interactive. An ordered ARIA live queue announces landed counts and phase changes.

## State flow

```text
counting-ones
  -> queued drops (accepted -> landed, one overlay at a time)
  -> carrying-to-tens (formation -> travel -> landing, when needed)
  -> counting-tens
  -> queued drops (accepted -> landed, one overlay at a time)
  -> carrying-to-hundreds (formation -> travel -> landing, when needed)
  -> counting-hundreds (tap the parked carried hundred when Hundreds is visible)
  -> queued hundred drop (accepted -> landed)
  -> awaiting-answer
  -> completed
```

Problems with zero ones begin at `counting-tens`. Rapid manual taps may queue through the next group-of-ten boundary, then input pauses until regrouping lands. A visible carried hundred parks at the top left until Tens are finished, then becomes the next eligible unit; tapping it lands the `100` in the result and reveals the Hundreds count. Accepting either carried token immediately leaves an outlined empty slot in its yellow source badge while the captured gold token travels to the result; the empty badge remains through `awaiting-answer` and is removed by completed-state cleanup. Hidden-Hundreds diagnostic problems retain their compact settlement because they have no visible target. Result units remain hidden until their matching overlay lands. Manual play stops at `awaiting-answer` until the child enters the correct total. Solver uses the same full drop/carry path and completes automatically. Queue, animation, and solver state lock competing controls while transitions run. Reduced motion commits immediately and flashes the target without directional travel.

The suggestion tray has an independent transient sequence: `idle -> tumbling -> emphasizing -> idle`. The current card and die remain mounted while the three alternative buttons are replaced, preserving the current card visually and keeping keyboard focus on the die. The tray is `aria-busy` throughout, repeat rolls and competing controls are locked, and diagnostics record refresh start, face cycling, landing, each card emphasis, and completion. Production timing is approximately 600 ms. Reduced motion skips the tumble and stagger, replaces the alternatives synchronously, and holds a brief static highlight while leaving optional audio available.

## Data boundaries

`problem` contains derived arithmetic plus an optional sampled curriculum tag. Query-forced diagnostic problems deliberately have no tag. `state` contains temporary interaction progress, including the active beetle prompt key and template. A session-only map prevents an immediate repeat when a prompt type is selected again. Profile schema v2 contains durable score, milestone progress, sound, current level, current-level success count, higher-level success count, schema version, and update timestamp. Keeping these separate prevents rendered CSS classes from becoming a source of truth.

Profile data is written to IndexedDB and mirrored to a compact cookie. The newest valid copy wins at startup; if storage is unavailable, the game continues with in-memory state. Schema-v1 records migrate to L1 with zero advancement counters while preserving score, milestones, sound, and timestamp. Reset creates a fresh L1 v2 profile but carries sound forward. There is no backend, account, telemetry, or cross-device synchronization.

## Problem generation and diagnostics

All organic entry points—startup, Next, suggestion construction/selection, alternative refresh, and dice alternatives—draw from the same weighted sampler and share recent unordered-pair exclusions. L2/L4 randomize the location of the single-digit addend. L1 uses a 75/25 current/higher split; L2–L8 use 50/25/25 current/higher/uniform-lower; L9 uses 60/40 current/uniform-L1–L8 review. L8 generation splits evenly between tens-only and both-carry patterns.

Query parameters allow untagged deterministic cases from `index.html?a=1&b=1` through `index.html?a=99&b=99`. They exercise normal arithmetic and rewards but cannot change level counters. `?harness=1` compresses learning and dice-refresh animation durations while preserving lifecycle stages. `window.NumberGarden` exposes level definitions, frozen production motion timings, queue-boundary and curriculum helpers, profile validation/defaults, and read-only motion diagnostics, including dice-refresh state/events and sound-effect counts, for deterministic harness checks.

## Rewards and progression

`applyProgressForSuccess()` is a pure transition. Four current-level or two higher-level typed successes advance exactly one level and reset both independent counters; lower/untagged problems do nothing and L9 caps the transition. `completeProblem("typed")` applies that transition and awards 10 coins plus one milestone once. `completeProblem("solver")` shares the visual completion path but does not mutate durable profile data or show the reward toast.

## Conditional Hundreds column

Rendering derives column count from `profile.currentLevel`: L1–L5 use Labels/Tens/Ones and L6–L9 include Hundreds. A transient, non-persisted `hundredsUnlockPending` flag is set only when advancement or a Settings jump crosses from below L6 to L6+. The next board render consumes it, so reloads cannot replay the effect. CSS supplies the motion animation and a static reduced-motion highlight; ARIA announcements and the optional audio cue come from the controller that caused the crossing.

## Change guidance

Keep arithmetic in pure helpers, transient behavior in `state`, durable preferences in `profile`, and DOM construction in render helpers. New phases must update prompt text, input locks, manual advancement, and Solver behavior together. Preserve direct-file operation and avoid introducing a required server or remote resource.
