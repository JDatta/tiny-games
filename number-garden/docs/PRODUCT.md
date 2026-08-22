# Product

## Product summary

Number Garden is a short, mobile-first place-value game for early elementary learners. Twenty persistent levels move from addition and regrouping through granular subtraction and automatic borrowing into role-sensitive multiplication and automatic product regrouping. The board keeps the arithmetic concrete: Ones are blocks, Tens are bars, and Hundreds appear wherever the operation can produce them.

## Core experience

The game samples a practice or review problem near the learner's level. Only the next valid source item is actionable. For addition and subtraction, a tap processes one item and holding its operand cell for 1.5 seconds quick-drops that cell's remaining items while preserving the same arithmetic transitions. Standard difficulty hides running result labels; Easy shows them. Both retain the same blocks, announcements, phases, animations, rewards, and completed result.

Addition counts both addends in Ones, Tens, and—when visible—Hundreds. A complete group of ten visibly carries to the next place. Subtraction first drops the minuend Ones and Tens into the difference row, then drops each subtrahend One to destroy the rightmost result block. If Ones are empty while more must be removed, the game automatically turns one gold result Ten into ten gold Ones and resumes. Subtrahend Tens then remove result bars. Empty places skip automatically, exact depletion borrows only when another subtrahend One remains, and results are never negative.

Multiplication uses a dedicated Multiplicand, Multiplier, and Product board. The multiplicand remains visible and cannot be moved. Each multiplier One pulls a clone of every non-empty multiplicand place into the product, after which Ones regroup to Tens and Tens regroup to Hundreds automatically and visibly. A multiplier Ten must be tapped explicitly to convert it into ten waiting Ones. Holding the multiplier Ones cell starts Pull All for that active group only; pulls settle sequentially, and the learner must tap each later Ten separately. Multiplier Tens never batch, and multiplication never exposes Drop All.

After every operation, the answer remains hidden until the learner uses the keypad. A manually typed correct answer celebrates, awards 10 coins and one milestone, and may contribute level credit. Holding `?` starts Tutorial from the unfinished step. Tutorial uses the same source cells, carry, borrow, multiplier conversion, pull, regroup, hidden-answer pause, real keypad, and checker, but grants no rewards, analytics completion, or level progress. New and reset profiles retain the fixed untagged `28 + 47` launch Tutorial.

The “Try another problem” tray shows the current problem plus three alternatives. Its die refreshes only the alternatives, locks competing controls during motion, announces its busy state, and returns focus when finished. L15 cards may mix `+` and `−`; L20 cards may also include `×`. Every card exposes operation-correct labels.

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
| L11 | Subtraction: minuend 10–99; subtrahend 1–9; no borrow |
| L12 | Subtraction: minuend 10–99; subtrahend 1–9; with borrow |
| L13 | Subtraction: both operands 10–99; no borrow; minuend at least subtrahend |
| L14 | Subtraction: both operands 10–99; with borrow; minuend at least subtrahend |
| L15 | 50% addition review from uniform L1–L9; 50% subtraction review from uniform L10–L14 |
| L16 | Multiplication: one-digit multiplicand × one-digit multiplier; product at most 999 |
| L17 | Multiplication: two-digit multiplicand × one-digit multiplier; product at most 999 |
| L18 | Multiplication: one-digit multiplicand × two-digit multiplier; product at most 999 |
| L19 | Multiplication: two-digit multiplicand × two-digit multiplier; product at most 999 |
| L20 | 40% addition review from L1–L9, 30% subtraction review from L10–L14, and 30% multiplication review from L16–L19 |

L1 samples 75% current and 25% next. L2–L8, L10–L13, and L16–L18 sample 50% current, 25% next, and 25% uniform lower review. L9 is gated to 60% L9 and 40% uniform L1–L8 so subtraction cannot appear early. L14 is similarly gated to 60% L14 and 40% uniform L1–L13 so L15 mixing cannot appear early. L15 is exactly 50% addition and 50% subtraction review and never previews multiplication. L19 is 60% current work and 40% uniform L1–L18 review, so L20 cannot appear before L19 is cleared. L20 is exactly 40% addition, 30% subtraction, and 30% multiplication, selecting source levels uniformly within L1–L9, L10–L14, and L16–L19. Mixed L15 and L20 problems retain the mixed `curriculumLevel` and record `curriculumSourceLevel`.

Recent addition keys treat `a+b` and `b+a` as the same problem. Subtraction keys preserve minuend/subtrahend order. Multiplication keys also preserve order because multiplicand and multiplier have different gameplay roles. Generated problems keep their sampled curriculum tag; forced query problems remain untagged and do not affect level counters.

## Presentation and accessibility

Addition retains the blue/green garden theme. Subtraction applies a lavender and deep-purple palette with distinct minuend and subtrahend colors. Multiplication applies an operation-scoped forest/mint green palette and a three-column semantic board that can show up to nine Product Hundreds. Switching problems removes stale operation classes. Gold remains the carry, borrow, multiplier conversion, and product regrouping cue. The shared next-action, hint, and success emphasis is high-contrast coral so it remains distinct in every theme. Subtraction never renders Hundreds, even for an L15 or L20 learner.

Labels, position, text, and state changes ensure color is never the only cue. The equation, keypad, board badges, suggestion cards, completion prompt, analytics metadata, live announcements, and ARIA labels use the correct operator and addend/sum, minuend/subtrahend/difference, or multiplicand/multiplier/product terminology. Touch, pointer, keyboard holds, dialogs, focus, and `prefers-reduced-motion` remain supported. Reduced motion removes travel but retains the pedagogical Tutorial stages and hidden-answer pauses.

## Progress and persistence

Four current-level typed successes or two eligible higher-level typed successes advance exactly one level and reset both counters. L14 and L19 receive no higher-level credit because their gated samplers exclude the following mixed-review level; L20 is capped. Lower-level and diagnostic problems receive no level credit. Incorrect attempts do not prevent the later correct reward.

Profile schema v4 persists score, milestones, L1–L20 level, both counters, sound, difficulty, launch choice, and timestamp. Existing v1–v4 profiles are preserved and validated without a schema bump. Settings can override L1–L20, and reset returns to L1 while retaining sound and difficulty.

## Diagnostics and testing

`?a=<1–99>&b=<1–99>` forces addition. `?op=subtraction&a=42&b=17` forces subtraction, and `?op=multiplication&a=12&b=23` forces multiplication. Invalid operations, out-of-range operands, negative subtraction results, and multiplication products above 999 fall back to an organic problem. `?harness=1` compresses motion without skipping phases, and `?reducedMotion=1` forces reduced motion in harness mode. Motion diagnostics expose multiplication group size, accepted and consumed blocks, converted Tens, total multiplier units, product digits, queue and regroup phases, and Pull All lifecycle events. The deterministic browser harness covers every curriculum definition and sampler boundary, progression and migration through L20, addition carries, subtraction borrowing, multiplication pulling and regrouping, hold boundaries, Tutorial, themes, semantics, rewards, analytics, Settings, persistence, launch, dice, fullscreen, reset and motion interruption, and reduced motion.

## Scope

Number Garden is single-player curriculum-guided practice, not an assessment platform. It has no account, backend, advertising, multiplayer, cloud sync, learner report, or negative-number curriculum. The optional Google Analytics tag records aggregate manual engagement only; gameplay remains functional offline.
