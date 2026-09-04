# Design

## Core beliefs

- Keep the shipped game self-contained and playable without a server, framework, build step, or required network connection (`index.html`, `README.md`).
- Keep arithmetic pure, interaction progress transient, and durable learner data in the profile; rendering must derive from those values (`ARCHITECTURE.md`, “Runtime boundaries”).
- Teach place value through visible, operation-correct actions rather than by accepting an answer alone (`docs/PRODUCT.md`, “Core experience”).
- Make the Tutorial exercise the same transitions and answer checker as manual play, while withholding progress and analytics rewards (`ARCHITECTURE.md`, “Interaction state flows”).
- Preserve direct-file play and degrade storage failure to in-memory play (`ARCHITECTURE.md`, “Persistence and analytics”).
- Do not make color the only cue; preserve keyboard, touch, focus, live-announcement, and reduced-motion behavior (`docs/PRODUCT.md`, “Presentation and accessibility”).

## Recurring patterns

- `deriveProblem()` constructs immutable operation data; `state` owns accepted and landed or consumed counters; `profile` owns persisted progress.
- `render()` and `renderBoard()` project runtime data into DOM and operation theme classes. DOM order and CSS classes are never arithmetic state.
- Curriculum selection is centralized in `problemMatchesLevel()`, `generateProblemForLevel()`, `selectCurriculumLevel()`, and `sampleCurriculumProblem()`.
- `window.NumberGarden` exposes pure helpers and read-only diagnostics for `tests/curriculum-harness.html`; new behavior should retain deterministic observability.

## Anti-patterns

- Do not split the shipped experience into a second framework, backend, CDN, or asset pipeline.
- Do not implement a separate arithmetic path for Tutorial, quick actions, or diagnostics.
- Do not use rendered order, arbitrary tap order, or stale operation classes as mathematical truth.
- Do not edit `demos/poc-game.html` for product work; change `index.html`.

## Style

- The canonical application uses one standalone `index.html` with embedded semantic HTML, CSS, and strict-mode JavaScript.
- Use operation-specific vocabulary consistently: addend/sum, minuend/subtrahend/difference, and multiplicand/multiplier/product.
- Keep user-facing interaction accessible through touch and keyboard and verify changes with `tests/curriculum-harness.html`.
