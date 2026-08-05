# Number Garden Project Guide

## Project descriptions

### Product

Number Garden is a mobile-first learning game that teaches addition through visible ones, tens, hundreds, and regrouping. Nine persistent curriculum levels grow from single-digit sums to two-column carries. A learner counts the next highlighted unit in sequence and watches groups of ten carry into the next place. Organic problems may use addends from 1 through 99 and results through 198.

### Implementation

Number Garden is a client-only application implemented as one standalone HTML document with embedded CSS and JavaScript. It has no framework, package manager, build step, backend, remote asset, or required network connection. It must continue to work both when `index.html` is opened directly and when the included Python static server serves it at `http://localhost:8080`.

The runtime separates pure problem arithmetic (`problem`), temporary interaction progress (`state`), and durable browser data (`profile`). Rendering is derived from those values; the DOM and CSS classes are never the source of mathematical truth.

## Files

| Path | Purpose |
| --- | --- |
| `AGENT.md` | Project orientation and change guidance for coding agents. |
| `index.html` | Shipped application, including markup, styles, arithmetic, state management, rendering, persistence, sound, and animation. |
| `server.py` | Optional zero-dependency development server; maps `/` to `index.html` and preserves query parameters. |
| `@poc-game.html` | Historical proof of concept for the original idea. Treat it as reference material, not the current implementation. |
| `mocks/mock.png` | Visual inspiration for the mobile layout and garden theme; it is not an authoritative description of arithmetic or state. |
| `plans/init-game.md` | Original implementation brief and acceptance criteria. Useful for product intent, but the shipped code and current docs describe present behavior. |
| `docs/PRODUCT.md` | Product goals, audience, learning flow, supported problem categories, accessibility principles, and scope boundaries. |
| `docs/ARCHITECTURE.md` | Runtime structure, state flow, persistence boundaries, diagnostics, and architectural change guidance. |
| `tests/curriculum-harness.html` | Deterministic browser harness for curriculum predicates/generation, sampler boundaries, progression, migration, reward paths, Settings, persistence, and the Hundreds unlock. |

## Gotchas

- Keep `index.html` self-contained. Do not introduce a required build process, framework, server API, CDN, font, or remote image.
- Preserve direct `file://` operation as well as `python3 server.py`. Browser storage is best-effort, so the game must remain playable when IndexedDB or cookies are unavailable.
- Keep arithmetic in pure helpers such as `deriveProblem()`, transient interaction data in `state`, durable preferences and rewards in `profile`, and DOM construction in render helpers.
- A new or changed phase must be handled consistently by prompts, enabled-unit selection, input locks, manual advancement, Solver, accessibility announcements, and rendering.
- Only the next valid block is interactive. Do not make rendered order, CSS state, or arbitrary tap order determine the count.
- Carry behavior is derived from the addends. Validate no-carry, ones-carry, tens-carry, and two-carry cases, including zero ones and a result of `198`.
- Keep the nine curriculum predicates, generated `curriculumLevel` tags, and weighted sampler aligned. L8 intentionally overlaps L7/L9 arithmetic and distinguishes its 50/50 patterns with `curriculumPattern`.
- Startup, Next, suggestions, alternative refresh, and dice alternatives must all use `sampleCurriculumProblem()` and preserve unordered recent-pair avoidance.
- Use `?a=<1-99>&b=<1-99>` for deterministic browser checks. Query-forced problems are untagged and must not change advancement counters. Pure generation, selection, progression, profile, definitions, and constants are exposed through `window.NumberGarden`.
- Tutorial resumes at the next unfinished unit, follows the same carry transitions as manual play, and reaches the real answer keypad through `awaiting-answer`; it must not become a separate arithmetic path.
- Only a manually typed correct answer awards exactly 10 coins, one milestone, and eligible level credit once. Tutorial may celebrate and use the shared checker but must never change score, milestones, counters, or level or show a reward toast.
- Profile schema v4 persists `launchChoiceMade` alongside the v3 difficulty and curriculum fields. V1–v3 migrations preserve established-player progress and skip the new launch choice. A confirmed progress reset returns to L1 with zero counters/rewards, keeps sound and difficulty, and requires the launch choice again.
- Below L6 the board renders Labels/Tens/Ones. L6+ renders Hundreds too. Crossing upward into L6 through advancement or Settings announces and highlights the unlock once for that session; reloads must not replay it.
- Keep the bee and current-level badge visible on narrow/fullscreen layouts. Sound belongs in Settings.
- Maintain touch targets, keyboard access, ARIA announcements, focus handling, and `prefers-reduced-motion` behavior whenever controls or animations change.
- Do not edit `@poc-game.html` to implement product changes. Make shipped behavior changes in `index.html`.
- The mock and original plan can contain outdated or illustrative details. Prefer current behavior, `docs/PRODUCT.md`, and `docs/ARCHITECTURE.md` when they disagree.
