# Architecture

## Overview

Number Garden is a client-only web application contained in [`index.html`](../index.html). HTML, CSS, game logic, persistence, audio, and animation are embedded in that file. It has no build step, framework, external assets, or network dependency. [`server.py`](../server.py) is an optional static server that maps `/` to `index.html`; the game also supports direct `file://` use.

## Runtime components

- **Document and styles:** semantic controls, dialogs, the place-value board, responsive mobile-first layout, focus states, and reduced-motion rules.
- **Arithmetic model:** `deriveProblem(a, b)` validates two-digit addends and derives digits, place totals, remainders, carries, result, and carry category. Arithmetic does not depend on the DOM.
- **Session state:** `freshState()` tracks the current phase, count cursors, visible carries, animation lock, solver use, and reward status.
- **Rendering:** `render()` coordinates focused render helpers for the journey, board, prompts, answer state, and alternative problems. Interactive units are recreated from state and only the next valid unit is enabled.
- **Interaction controllers:** event handlers advance manual counting, run Solver from the unfinished step, collect typed answers, change problems, reset state, toggle sound/fullscreen, and manage settings.
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

`problem` contains derived, problem-level arithmetic. `state` contains temporary interaction progress. `profile` contains durable score, milestone progress, sound preference, schema version, and update timestamp. Keeping these separate prevents rendered CSS classes from becoming a source of truth.

Profile data is written to IndexedDB and mirrored to a compact cookie. The newest valid copy wins at startup; if storage is unavailable, the game continues with in-memory state. There is no backend, account, telemetry, or cross-device synchronization.

## Problem generation and diagnostics

Problems are categorized as no carry, ones carry, tens carry, or two carries. Random generation avoids several recent unordered pairs, while the suggestion tray exposes other categories. Query parameters allow deterministic cases, for example `index.html?a=58&b=47`. The pure arithmetic helper and constants are exposed as `window.NumberGarden` for browser-console checks.

## Change guidance

Keep arithmetic in pure helpers, transient behavior in `state`, durable preferences in `profile`, and DOM construction in render helpers. New phases must update prompt text, input locks, manual advancement, and Solver behavior together. Preserve direct-file operation and avoid introducing a required server or remote resource.
