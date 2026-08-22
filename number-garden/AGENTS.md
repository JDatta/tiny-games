# Number Garden Project Guide

## Project descriptions

### Product

Number Garden is a mobile-first learning game that teaches addition, subtraction, and multiplication through visible place-value units. Twenty persistent levels grow from addition and carrying through subtraction and borrowing, then role-sensitive multiplication and a three-operation review. Addition uses Ones, Tens, and L6+ Hundreds; subtraction uses Ones and Tens only; multiplication keeps a stationary multiplicand beside a consumable multiplier and a three-place product.

### Implementation

Number Garden is a client-only application implemented as one standalone HTML document with embedded CSS and JavaScript. It has no framework, backend, required build step, or required network connection. npm/Capacitor metadata is optional and `npm run build` only copies the standalone file into `dist`. The only remote resource is the optional Google Analytics tag; gameplay must remain fully functional if it cannot load. The app must continue to work both when `index.html` is opened directly and when the included Python static server serves it at `http://localhost:8080`.

The runtime separates pure problem arithmetic (`problem`), temporary interaction progress (`state`), and durable browser data (`profile`). Rendering is derived from those values; the DOM and CSS classes are never the source of mathematical truth.

## Glossary

| Term | Meaning |
| --- | --- |
| **operation** | `addition`, `subtraction`, or `multiplication`; it determines arithmetic, phase flow, language, theme, and board semantics. |
| **addend** | Either number being added in a problem. |
| **minuend** | The first subtraction operand: the amount built before any units are removed. |
| **subtrahend** | The second subtraction operand: the amount removed from the minuend. |
| **multiplicand** | The first multiplication operand. Its blocks and bars stay visible and are cloned for each consumed multiplier One. |
| **multiplier** | The second multiplication operand. Its Ones are consumed; each Tens bar must be explicitly converted into ten new Ones. |
| **product** | The result of multiplying the multiplicand by the multiplier. Product Ones and Tens regroup automatically. |
| **result** | The sum for addition, difference for subtraction, or product for multiplication. |
| **difference** | The result of subtracting the subtrahend from the minuend. |
| **borrowing** | Automatically trading one result Ten for ten Ones when subtraction needs more Ones. |
| **Pull All** | Multiplication-only hold action that sequentially consumes the rest of the current multiplier Ones group, then stops before the next Tens bar. |
| **Drop All** | Addition/subtraction hold action for the remaining items in the active operand cell. Multiplier cells never use it. |
| **operand cells** | The place-value cells belonging to either addend, the minuend, or the subtrahend. |
| **addend cells** | The addition operand cells for an addend's Hundreds, Tens, and Ones places. |
| **result cells** | The table cells for the result's Hundreds, Tens, and Ones places. The result row has up to three cells. |
| **cell** | One place-value table cell—not an individual visual item. |
| **block** or **unit** | An item in an Ones cell, worth 1. |
| **bar** or **rod** | An item in a Tens cell, worth 10, or in a Hundreds cell, worth 100. |
| **Guide beetle** | The speaking beetle that guides the learner through the game. |

## State flows

Addition follows `counting-ones` → optional Ones carry → `counting-tens` → optional Hundreds carry/count → `awaiting-answer` → `completed`. Subtraction follows `counting-minuend-ones` → `counting-minuend-tens` → `counting-subtrahend-ones` → optional `borrowing-to-ones` and resumed Ones removal → `counting-subtrahend-tens` → the shared answer flow. Multiplication alternates `multiplication-consuming-ones` and explicit `multiplication-converting-ten`; every consumed One runs a multiplicand-pull animation followed by automatic Ones and then Tens regrouping before the next queued pull. Empty places skip automatically. Accepted and landed/consumed counters remain separate so ordinary input, hold batches, Tutorial, resets, animation interruption, and diagnostics share the same mathematical transitions.

## Files

| Path | Purpose |
| --- | --- |
| `AGENTS.md` | Project orientation, repository map, and change guidance for coding agents. |
| `.gitignore` | Excludes generated web output, Capacitor native projects, and installed Node dependencies. |
| `README.md` | User-facing overview, local startup instructions, gameplay summary, diagnostic query parameters, and test-harness URL. |
| `index.html` | Shipped application, including markup, styles, arithmetic, state management, rendering, persistence, sound, and animation. |
| `dist/index.html` | Generated copy of `index.html` used as Capacitor's web asset; produced by `npm run build` and not edited directly. |
| `server.py` | Optional zero-dependency development server; maps `/` to `index.html` and preserves query parameters. |
| `package.json` | Optional Node/Capacitor metadata, dependency declarations, and the web-asset build script. |
| `package-lock.json` | Locked npm dependency graph for reproducible Capacitor installs. |
| `capacitor.config.json` | Capacitor app identity and `dist` web-directory configuration for native packaging. |
| `../codemagic.yaml` | Repository-root Codemagic workflow that installs dependencies, builds the web asset, generates the iOS project, and runs an unsigned simulator build. |
| `node_modules/` | Generated, ignored npm dependency installation; recreate it with `npm ci`. |
| `demos/poc-game.html` | Historical proof of concept for the original idea. Treat it as reference material, not the current implementation. |
| `demos/record-tutorial.sh` | Tutorial recording driver that launches headless Chrome, captures frames, and assembles an MP4 with FFmpeg. |
| `demos/.capture_tutorial.py` | Chrome DevTools Protocol helper used by the recording script to capture the accelerated tutorial frame sequence. |
| `demos/tutorial-frames/frame-*.png` | Generated 480×900 PNG frames from the tutorial recording run. |
| `mocks/mock.png` | Visual inspiration for the mobile layout and garden theme; it is not an authoritative description of arithmetic or state. |
| `docs/PRODUCT.md` | Product goals, audience, learning flow, supported problem categories, accessibility principles, and scope boundaries. |
| `docs/ARCHITECTURE.md` | Runtime structure, state flow, persistence boundaries, diagnostics, and architectural change guidance. |
| `docs/exec-plans/completed/init-game.md` | Original implementation brief and acceptance criteria. Useful for product intent, but the shipped code and current docs describe present behavior. |
| `docs/exec-plans/completed/codemagic-linux-bootstrap-plan.md` | Completed plan for adding the npm, Capacitor, and Codemagic iOS bootstrap from Linux. |
| `docs/exec-plans/pending/code-magic-next-steps.md` | Pending manual steps for Codemagic setup, signing, TestFlight, device testing, and the eventual `ios/` tracking decision. |
| `tests/curriculum-harness.html` | Deterministic browser harness for all L1–L20 curriculum rules, arithmetic flows, motion, progression, migration, rewards, Settings, persistence, and operation semantics. |

## Gotchas

- Keep `index.html` self-contained. Do not introduce a required build process, framework, server API, CDN, font, or remote image.
- Keep the single Google tag ID `G-C3PJ0VBNH0` intact. Analytics tracks one manual start per page load and successful typed completions; automated Tutorial activity must not emit gameplay engagement events.
- Preserve direct `file://` operation as well as `python3 server.py`. Browser storage is best-effort, so the game must remain playable when IndexedDB or cookies are unavailable.
- Keep arithmetic in pure helpers such as `deriveProblem()`, transient interaction data in `state`, durable preferences and rewards in `profile`, and DOM construction in render helpers.
- A new or changed phase must be handled consistently by prompts, enabled-unit selection, input locks, manual advancement, Solver, accessibility announcements, and rendering.
- Only the next valid place-value item is interactive. Do not make rendered order, CSS state, or arbitrary tap order determine the count. See the glossary for the place-specific names: Ones blocks/units and Tens or Hundreds bars/rods.
- Addition carry behavior is derived from the addends. Validate no-carry, ones-carry, tens-carry, and two-carry cases, including zero ones and `198`.
- Subtraction state must build minuend Ones, build minuend Tens, remove subtrahend Ones, borrow only when empty with removals left, resume Ones, remove Tens, then enter `awaiting-answer`. Validate zero/equal differences, exact depletion, empty places, `40−7`, `42−17`, `20−19`, and reset mid-flow.
- Multiplication must never move or consume the multiplicand itself. One multiplier One clones every non-empty multiplicand place together, lands that copy, and settles Ones→Tens before Tens→Hundreds. Pull All is sequential, ends at the current Ones group, and cannot cross an explicit multiplier Tens tap. Validate zero Ones, multiple Tens, simultaneous overflows, `19×9`, and `27×37=999`.
- Keep all twenty predicates, generated tags, and sampler gates aligned. L8 retains `curriculumPattern`; L9 cannot preview subtraction; L14 cannot preview L15; L15 contains no multiplication; L19 cannot preview L20; L15 and L20 retain `curriculumSourceLevel`. L20 uses exact 40%/30%/30% operation boundaries.
- Startup, Next, suggestions, alternative refresh, and dice alternatives use `sampleCurriculumProblem()`. Addition recent keys are unordered; subtraction and multiplication keys preserve operand order.
- `?a=<1-99>&b=<1-99>` defaults to addition. Use `?op=subtraction&a=42&b=17` or `?op=multiplication&a=12&b=23`. Forced problems are untagged; invalid subtraction order and multiplication products above 999 must fall back to sampling.
- Tutorial resumes at the next unfinished unit, follows the same carry, borrow, multiplier conversion, pull, and product-regroup transitions as manual play, and reaches the real answer keypad through `awaiting-answer`; never create a separate arithmetic path.
- Only a manually typed correct answer awards exactly 10 coins, one milestone, and eligible level credit once. Tutorial may celebrate and use the shared checker but must never change score, milestones, counters, or level or show a reward toast.
- Profile schema v4 persists `launchChoiceMade` alongside difficulty and L1–L20 curriculum fields. Keep the schema number unchanged; v1–v3 migrations preserve established-player progress. Reset returns to L1 and keeps sound/difficulty.
- Addition below L6 renders Labels/Tens/Ones and L6+ adds Hundreds. Subtraction always renders Labels/Tens/Ones. Multiplication always uses the four-column Labels/Hundreds/Tens/Ones grid, with three number rows whose Multiplicand/Multiplier/Product terms remain accessible but not visible. The L6 unlock announces/highlights only when an addition board can show it.
- Apply operation semantics everywhere: equation, keypad, role labels, suggestions, prompts, completion, analytics metadata, live announcements, and ARIA. Use minuend/subtrahend/difference for subtraction and multiplicand/multiplier/product for multiplication.
- Addition owns blue/green; subtraction owns lavender/deep purple; multiplication owns forest/mint green; gold identifies regrouping; coral is reserved for shared eligible/hint/success emphasis. Remove stale operation classes whenever the operation changes.
- Keep the bee and current-level badge visible on narrow/fullscreen layouts. Sound belongs in Settings.
- Maintain touch targets, keyboard access, ARIA announcements, focus handling, and `prefers-reduced-motion` behavior whenever controls or animations change.
- Do not edit `@poc-game.html` to implement product changes. Make shipped behavior changes in `index.html`.
- The mock and original plan can contain outdated or illustrative details. Prefer current behavior, `docs/PRODUCT.md`, and `docs/ARCHITECTURE.md` when they disagree.
