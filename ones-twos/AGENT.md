# Ones Twos Project Guide

## Project descriptions

### Product

Ones Twos contains **Number Garden**, a mobile-first learning game that teaches children how two-digit addition works through visible ones, tens, hundreds, and regrouping. A learner counts the next highlighted unit in sequence, watches groups of ten carry into the next place, and enters the answer only after completing the concrete counting activity. The game supports sums from `10 + 10` through `99 + 99`, including all carry combinations and three-digit results.

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

## Gotchas

- Keep `index.html` self-contained. Do not introduce a required build process, framework, server API, CDN, font, or remote image.
- Preserve direct `file://` operation as well as `python3 server.py`. Browser storage is best-effort, so the game must remain playable when IndexedDB or cookies are unavailable.
- Keep arithmetic in pure helpers such as `deriveProblem()`, transient interaction data in `state`, durable preferences and rewards in `profile`, and DOM construction in render helpers.
- A new or changed phase must be handled consistently by prompts, enabled-unit selection, input locks, manual advancement, Solver, accessibility announcements, and rendering.
- Only the next valid block is interactive. Do not make rendered order, CSS state, or arbitrary tap order determine the count.
- Carry behavior is derived from the addends. Validate no-carry, ones-carry, tens-carry, and two-carry cases, including zero ones and a result of `198`.
- Use `?a=<10-99>&b=<10-99>` for deterministic browser checks. `window.NumberGarden.deriveProblem()` is also exposed for console diagnostics.
- Solver resumes at the next unfinished unit and follows the same carry transitions as manual play; it must not become a separate arithmetic path.
- Completing manually or through Solver awards exactly 10 coins once. Resetting the current problem must not reset persistent progress, while the confirmed profile reset keeps the sound preference.
- Maintain touch targets, keyboard access, ARIA announcements, focus handling, and `prefers-reduced-motion` behavior whenever controls or animations change.
- Do not edit `@poc-game.html` to implement product changes. Make shipped behavior changes in `index.html`.
- The mock and original plan can contain outdated or illustrative details. Prefer current behavior, `docs/PRODUCT.md`, and `docs/ARCHITECTURE.md` when they disagree.
