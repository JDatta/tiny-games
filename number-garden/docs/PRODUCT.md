# Product

## Product summary

Number Garden is a short, mobile-first place-value game for early elementary learners. Thirteen persistent levels move from addition and regrouping into subtraction and automatic borrowing. The board keeps the arithmetic concrete: Ones are blocks, Tens are bars, and addition Hundreds are visible from L6 onward.

## Core experience

The game samples a practice or review problem near the learner's level. Only the next valid source item is actionable. A tap processes one item; holding its operand cell for 1.5 seconds quick-drops that cell's remaining items while preserving the same arithmetic transitions. Standard difficulty hides running result labels; Easy shows them. Both retain the same blocks, announcements, phases, animations, rewards, and completed result.

Addition counts both addends in Ones, Tens, and—when visible—Hundreds. A complete group of ten visibly carries to the next place. Subtraction first drops the minuend Ones and Tens into the difference row, then drops each subtrahend One to destroy the rightmost result block. If Ones are empty while more must be removed, the game automatically turns one gold result Ten into ten gold Ones and resumes. Subtrahend Tens then remove result bars. Empty places skip automatically, exact depletion borrows only when another subtrahend One remains, and results are never negative.

After either operation, the answer remains hidden until the learner uses the keypad. A manually typed correct answer celebrates, awards 10 coins and one milestone, and may contribute level credit. Holding `?` starts Tutorial from the unfinished step. Tutorial uses the same source cells, carry/borrow transitions, hidden-answer pause, real keypad, and checker, but grants no rewards, analytics completion, or level progress. New and reset profiles retain the fixed untagged `28 + 47` launch Tutorial.

The “Try another problem” tray shows the current problem plus three alternatives. Its die refreshes only the alternatives, locks competing controls during motion, announces its busy state, and returns focus when finished. At L13 the cards may mix `+` and `−` and always expose operation-correct labels.

## Curriculum and sampling

| Level | Generated problems |
| --- | --- |
| L1 | Addition: two 1–9 addends; sum at most 9 |
| L2 | Addition: one 1–9 and one 10–99 addend; no carry |
| L3 | Addition: two 1–9 addends; sum at least 10 |
| L4 | Addition: mixed digit lengths; Ones carry and two-digit result |
| L5 | Addition: two 10–99 addends; no carry |
| L6 | Addition: two 10–99 addends; Ones carry only and two-digit result |
| L7 | Addition: two 10–99 addends; Tens-only carry |
| L8 | Addition: three-digit result; even split between Tens-only and both carries |
| L9 | Addition: two 10–99 addends with carries in both columns |
| L10 | Subtraction: operands 1–9; minuend at least subtrahend |
| L11 | Subtraction: minuend 10–99; subtrahend 1–9 |
| L12 | Subtraction: both operands 10–99; minuend at least subtrahend |
| L13 | 50% addition review from uniform L1–L9; 50% subtraction review from uniform L10–L12 |

L1 samples 75% current and 25% next. L2–L8 and L10–L11 sample 50% current, 25% next, and 25% uniform lower review. L9 is gated to 60% L9 and 40% uniform L1–L8 so subtraction cannot appear early. L12 is similarly gated to 60% L12 and 40% uniform L1–L11 so L13 mixing cannot appear early. L13 always emits `curriculumLevel: 13` and also records `curriculumSourceLevel`.

Recent addition keys treat `a+b` and `b+a` as the same problem. Subtraction keys preserve minuend/subtrahend order. Generated problems keep their sampled curriculum tag; forced query problems remain untagged and do not affect level counters.

## Presentation and accessibility

Addition retains the blue/green garden theme. Subtraction applies a lavender and deep-purple page, equation, board, badge, control, and accent palette, with distinct minuend and subtrahend colors. Gold remains the carry/borrow regrouping cue. The shared next-action, hint, and success emphasis is high-contrast coral so it does not merge with either theme. Subtraction never renders Hundreds, even for an L13 learner.

Labels, position, text, and state changes ensure color is never the only cue. The equation, keypad, board badges, suggestion cards, completion prompt, analytics metadata, live announcements, and ARIA labels use the correct operator and the terms addend/sum or minuend/subtrahend/difference. Touch, pointer, Space-key quick drop, dialogs, focus, and `prefers-reduced-motion` remain supported. Reduced motion removes travel but retains the pedagogical Tutorial stage and hidden-answer pauses.

## Progress and persistence

Four current-level typed successes or two eligible higher-level typed successes advance exactly one level and reset both counters. L12 receives no higher-level credit because its sampler intentionally excludes L13; L13 is capped. Lower-level and diagnostic problems receive no level credit. Incorrect attempts do not prevent the later correct reward.

Profile schema v4 persists score, milestones, L1–L13 level, both counters, sound, difficulty, launch choice, and timestamp. Existing v1–v4 profiles are preserved and validated without a schema bump. Settings can override L1–L13, and reset returns to L1 while retaining sound and difficulty.

## Diagnostics and testing

`?a=<1–99>&b=<1–99>` forces addition. `?op=subtraction&a=42&b=17` forces subtraction; invalid operations, out-of-range operands, and negative-result requests fall back to an organic problem. `?harness=1` compresses motion without skipping phases, and `?reducedMotion=1` forces reduced motion in harness mode. The deterministic browser harness covers all curriculum definitions, sampler boundaries, progression/migration, addition carries, subtraction borrowing and zero differences, quick drop, Tutorial, themes, semantics, rewards, analytics, Settings, persistence, launch, dice, fullscreen, and reduced motion.

## Scope

Number Garden is single-player curriculum-guided practice, not an assessment platform. It has no account, backend, advertising, multiplayer, cloud sync, learner report, or negative-number curriculum. The optional Google Analytics tag records aggregate manual engagement only; gameplay remains functional offline.
