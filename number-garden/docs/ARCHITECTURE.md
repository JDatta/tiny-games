# Architecture

## Overview

Number Garden is a client-only application contained in [`index.html`](../index.html). Markup, responsive CSS, arithmetic, curriculum sampling, session state, persistence, audio, accessibility, and animation live in that standalone file. There is no framework or required network dependency. [`server.py`](../server.py) is optional; direct `file://` play remains supported.

## Runtime boundaries

- `problem` is the immutable arithmetic model. `deriveProblem(a, b, operation = "addition")` validates operands and returns operation, operand digits, result digits, result, and addition carry or subtraction borrow metadata.
- `state` is transient interaction progress. Addition retains accepted/landed Ones, Tens, and Hundreds cursors. Subtraction has separate minuend/subtrahend cursors, live difference digits, borrow state, and a shared drop queue.
- `profile` is durable schema-v4 data: score, milestones, sound, difficulty, launch choice, current L1–L13 level, both advancement counters, and timestamp.
- Rendering is derived from those values. CSS classes and DOM order never determine arithmetic.

Curriculum helpers (`problemMatchesLevel`, `generateProblemForLevel`, `selectCurriculumLevel`, and `sampleCurriculumProblem`) own L1–L13 generation. L8 retains `curriculumPattern`; L13 models retain both `curriculumLevel: 13` and `curriculumSourceLevel`. `problemKey` makes addition exclusions unordered and subtraction exclusions ordered.

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

Empty source places are skipped. Minuend landings construct the live difference. Each subtrahend landing removes the rightmost live result unit. Borrowing decrements result Tens, creates ten gold Ones, and resumes the existing queue. Exact Ones depletion does not borrow if no subtrahend Ones remain. These invariants handle `8−8`, `42−42`, `40−7`, `42−17`, and `20−19` without special-case arithmetic.

Each source has separate accepted and landed cursors. A tap captures one source rectangle; quick drop accepts the remainder of the active operand cell as one batch. Addition batches may pause at a carry boundary. Subtraction batches process source order and may pause between two removals for automatic borrowing, then resume without another gesture. The queue and animation fields lock reset, settings, answer, dice, suggestions, and other source cells until settled.

Tutorial uses the same eligibility, queue, carry/borrow, phase transitions, answer button, keypad digits, and checker as manual play. It adds only timing and noninteractive hand cues. Reduced motion commits travel statically but preserves the one-second stage pauses and two-second hidden-answer pause.

## Rendering and theming

`render()` applies `operation-addition` or `operation-subtraction` to both body and the active app. It updates the equation operator/semantics, prompt pool, result terminology, keypad equation, suggestion labels, board, and controls. Addition uses the original blue/green ownership colors. Subtraction uses lavender/deep purple with separate minuend/subtrahend colors. Gold identifies both carrying and borrowing; coral owns eligible, idle-hint, and shared success emphasis.

`renderBoard()` retains the addition renderer and delegates subtraction to a two-column board. Addition shows Hundreds when the profile is L6+; subtraction always omits it. Result cells expose stable `data-motion-role`, `data-place`, and `data-index` geometry. Source cells additionally expose operation-phase place names such as `minuend-ones` and `subtrahend-tens` so duplicate visual columns cannot be confused.

Frozen prompt pools cover every addition and subtraction phase. State caches the selected prompt so unrelated re-renders do not change it. Live announcements use addend/sum or minuend/subtrahend/difference vocabulary. Dialog focus, keyboard controls, touch targets, and reduced-motion alternatives remain shared.

## Curriculum selection and progression

L1 is 75% current and 25% next. L2–L8 and L10–L11 use 50% current, 25% next, and 25% uniform lower review. L9 is gated to 60% L9 plus 40% L1–L8 review; L12 is gated to 60% L12 plus 40% L1–L11 review. L13 first chooses addition below the exact 0.5 random boundary and subtraction at or above it, then uniformly chooses the corresponding review source.

Four current-level or two eligible higher-level manual successes advance one level. L12 deliberately ignores hypothetical higher-level credit and advances only from its current-level counter; L13 caps progress. Query-forced models have no curriculum tag, so they may earn coins but never counter credit.

## Persistence and analytics

IndexedDB is mirrored to a compact cookie; the newest valid profile wins. Schema v4 remains unchanged. V1 records migrate to L1, while v2/v3 curriculum records preserve their prior level, and validation now accepts the full L1–L13 range. Older profiles skip the launch choice; new/reset profiles require it. Storage failure degrades to in-memory play.

`game_start` fires once per page load only after manual engagement and includes version and operation. `game_complete` fires only after a typed success and includes cumulative rewards, version, operation, operands, and result. Tutorial emits neither event.

## Diagnostics and public surface

Addition is the default for `?a=...&b=...`. Subtraction uses `?op=subtraction&a=42&b=17`. Forced requests are untagged; invalid requests fall back to sampling. `quickPlaySpeed` remains 0.5–4. Harness-only flags compress timing and can force reduced motion.

`window.NumberGarden` exposes the pure arithmetic/curriculum/profile helpers, `problemKey`, L1–L13 definitions, frozen prompts and timing tables, version/constants, and read-only motion diagnostics. The snapshot retains every legacy addition field and adds operation, source level, all subtraction cursors, live result digits, borrow count/phase, and borrow classification. Motion events diagnose source drop, quick batches, and borrow formation/travel/landing.

## Change guidance

Keep arithmetic pure, session progress transient, profile data durable, and DOM derived. Any new phase must be handled by prompts, source eligibility, quick drop, locks, reset, Tutorial, announcements, audio, motion/reduced motion, diagnostics, completion, and tests. Preserve the standalone file, direct-file operation, optional analytics, and asset-free CSS/DOM animation architecture.
