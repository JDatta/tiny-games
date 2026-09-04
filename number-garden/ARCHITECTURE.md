# Architecture

## Overview

Number Garden is a client-only application contained in [`index.html`](index.html). Markup, responsive CSS, arithmetic, curriculum sampling, session state, persistence, audio, accessibility, and animation live in that standalone file. There is no framework or required network dependency. [`server.py`](server.py) is optional; direct `file://` play remains supported.

## Runtime boundaries

- `problem` is the immutable arithmetic model. `deriveProblem(a, b, operation = "addition")` validates operands and returns operation, operand/result digits, result, and operation-specific carry, borrow, or multiplicand/multiplier metadata. Multiplication rejects products above 999.
- `state` is transient interaction progress. Addition retains accepted/landed place cursors. Subtraction has separate minuend/subtrahend cursors, live difference digits, borrow state, and a drop queue. Multiplication has an isolated sequential pull queue, active multiplier group counters, converted Tens count, settled product digits, pull/regroup phases, and Pull All lifecycle state.
- `profile` is durable schema-v4 data: score, milestones, sound, difficulty, launch choice, current L1–L20 level, both advancement counters, and timestamp.
- Rendering is derived from those values. CSS classes and DOM order never determine arithmetic.

Curriculum helpers (`problemMatchesLevel`, `generateProblemForLevel`, `selectCurriculumLevel`, and `sampleCurriculumProblem`) own L1–L20 generation. L8 retains `curriculumPattern`; mixed L15/L20 models retain their mixed level and `curriculumSourceLevel`. `problemKey` makes addition exclusions unordered while subtraction and role-sensitive multiplication remain ordered.

## Interaction state flows

Addition keeps its established path:

```text
counting-ones
  -> carrying-to-tens (when needed)
  -> counting-tens
  -> carrying-to-hundreds (when needed)
  -> counting-hundreds (when Hundreds is visible)
  -> awaiting-answer
  -> completed
```

Subtraction has a separate ordered path:

```text
counting-minuend-ones
  -> counting-minuend-tens
  -> counting-subtrahend-ones
       -> borrowing-to-ones (formation -> travel -> landing, only when empty with removals left)
       -> counting-subtrahend-ones resumes
  -> counting-subtrahend-tens
  -> awaiting-answer
  -> completed
```

Multiplication has a third isolated path:

```text
multiplication-consuming-ones
  -> multiplicand pull (all non-empty multiplicand places together)
  -> automatic Ones-to-Tens regrouping
  -> automatic Tens-to-Hundreds regrouping
  -> multiplication-converting-ten (explicit multiplier Ten tap, when needed)
  -> multiplication-consuming-ones (ten new waiting blocks)
  -> awaiting-answer
  -> completed
```

If the multiplier Ones digit is zero, the path starts at Tens conversion. Each Tens bar opens exactly one new group of ten Ones. Pull All queues only the remainder of the current group and drains one complete pull plus both possible regroup stages before starting the next. Only the active multiplier One is highlighted while its multiplicand copy travels; completed Ones mute afterward and future queued Ones stay visible. Pull All cannot convert or cross another Tens bar.

Empty source places are skipped. Minuend landings construct the live difference. Each subtrahend landing removes the rightmost live result unit. Borrowing decrements result Tens, creates ten gold Ones, and resumes the existing queue. Exact Ones depletion does not borrow if no subtrahend Ones remain. These invariants handle `8−8`, `42−42`, `40−7`, `42−17`, and `20−19` without special-case arithmetic.

Addition/subtraction sources have separate accepted and landed cursors. Multiplication separates accepted and consumed counts. A tap captures one source action; Drop All accepts an addition/subtraction operand-cell remainder, while multiplication Pull All accepts only its active Ones group. Addition batches may pause at a carry boundary. Subtraction batches may pause for borrowing. Multiplication queues are strictly sequential. Queue and animation fields lock competing controls; multiplication Reset remains available so its centralized interruption path can abandon a pull safely.

Tutorial uses the same eligibility, queues, carry/borrow/pull/regroup transitions, answer button, keypad digits, and checker as manual play. It adds only timing and noninteractive hand cues. Reduced motion commits travel statically but preserves stage and hidden-answer pauses.

## Rendering and theming

`render()` applies exactly one of `operation-addition`, `operation-subtraction`, or `operation-multiplication` to body and app. It updates operator semantics, prompts, terminology, keypad, suggestions, board, and controls. Addition uses blue/green, subtraction lavender/deep purple, and multiplication forest/mint green. Gold identifies carrying, borrowing, multiplier Tens conversion, and product regrouping; coral owns actionable/hint/success emphasis.

`renderBoard()` retains addition, delegates subtraction to its two-place board, and delegates multiplication to a horizontal four-column grid matching addition: a blank label header followed by Hundreds, Tens, and Ones. Its three rows keep semantic Multiplicand/Multiplier/Product containers for ARIA and diagnostics while showing only the operand/result badges and arithmetic symbols. The multiplicand renders as noninteractive source geometry, multiplier Ones/Tens expose distinct action names, and the Product supports up to nine Hundreds with all underlying motion metadata intact. After each multiplication render and viewport resize, the Hundreds layout compares the non-overlapping column height with the cell’s available height; counts up to five compact only when necessary, while six through nine always use the badged stack. Multiplication state transiently tracks the latest Ones-to-Tens result index so its bar stays gold until the next such regroup; Tens-to-Hundreds clears or rebases that index when it consumes a group. Stable `data-motion-role`, `data-place`, and `data-index` metadata drives vertical copy travel and token-sized horizontal conversion/regrouping without making the DOM arithmetic truth.

Frozen prompt pools cover every phase of all three operations. State caches the selected prompt so unrelated re-renders do not change it. Live announcements and ARIA use addend/sum, minuend/subtrahend/difference, or multiplicand/multiplier/product vocabulary. Dialog focus, keyboard controls, touch targets, and reduced-motion alternatives remain shared.

## Curriculum selection and progression

L1 is 75% current and 25% next. L2–L8, L10–L13, and L16–L18 use 50% current, 25% next, and 25% uniform lower review. L9 and L14 use 60% current plus 40% gated review. L15 chooses exactly 50% addition from uniform L1–L9 and 50% subtraction from uniform L10–L14; it never previews multiplication. L19 uses 60% current plus 40% uniform L1–L18 and never previews L20. L20 selects exactly 40% addition (uniform L1–L9), 30% subtraction (uniform L10–L14), and 30% multiplication (uniform L16–L19).

Four current-level or two eligible higher-level manual successes advance one level. L9, L14, and L19 are operation-boundary gates: their samplers never preview the next level and their earlier-level practice problems receive no level credit. Completion feedback always states whether a success moved the current or higher-level counter, so a practice problem cannot look like stalled progress. L20 caps progress. Query-forced models have no curriculum tag, so they may earn coins but never counter credit.

## Persistence and analytics

IndexedDB is mirrored to a compact cookie; the newest valid profile wins. Schema v4 remains unchanged because its shape did not change. V1 records migrate to L1, v2/v3 curriculum records preserve their level, and validation accepts L1–L20. Older profiles skip the launch choice; new/reset profiles require it. Storage failure degrades to in-memory play.

`game_start` fires once per page load only after manual engagement and includes version and operation. `game_complete` fires only after a typed success and includes cumulative rewards, version, operation, operands, and result. Tutorial emits neither event.

## Diagnostics and public surface

Addition is the default for `?a=...&b=...`. Subtraction uses `?op=subtraction&a=42&b=17`; multiplication uses `?op=multiplication&a=12&b=23`. Forced requests are untagged; invalid operands, order, operation, or products above 999 fall back to sampling. `quickPlaySpeed` remains 0.5–4. Harness-only flags compress timing and can force reduced motion.

`window.NumberGarden` exposes pure arithmetic/curriculum/profile helpers, ordered keys, L1–L20 definitions, frozen prompts/timings, version/constants, and read-only diagnostics. The snapshot retains legacy fields and adds all multiplication group counts, accepted/consumed values, converted Tens, total units consumed, product digits, pull/regroup/conversion phases, queue length, and Pull All lifecycle. Motion events diagnose every source, regroup, interruption, and hold boundary.

## Change guidance

Keep arithmetic pure, session progress transient, profile data durable, and DOM derived. Any new phase must be handled by prompts, source eligibility, quick drop, locks, reset, Tutorial, announcements, audio, motion/reduced motion, diagnostics, completion, and tests. Preserve the standalone file, direct-file operation, optional analytics, and asset-free CSS/DOM animation architecture.
