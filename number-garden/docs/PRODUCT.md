# Product

## Product summary

Number Garden is a short, mobile-first learning game for children practicing addition and place value. It turns addition into a visible sequence: count ones, trade ten ones for a ten, count tens, and eventually trade ten tens for a hundred. Nine persistent levels introduce those ideas progressively.

## Audience and learning goal

The primary audience is early elementary learners, with a parent or teacher available when needed. The game aims to connect written addition with concrete ones, tens, and hundreds while making regrouping understandable rather than presenting it as a memorized rule.

## Core experience

1. The game samples a practice or review problem around the learner’s current L1–L9 level.
2. The child taps the single glowing next block, counting both addends in order.
3. At ten units, the game groups and carries them into the next place.
4. After counting, the child enters the total with a large keypad.
5. A manually entered correct answer reveals the result, celebrates, awards 10 coins, advances the milestone journey, and may contribute to level advancement.
6. The child chooses the next suggested sum or refreshes the choices.

Holding the `?` button starts Tutorial from the child’s current position. Tutorial demonstrates the same counting and carry sequence instead of only revealing the answer. When counting finishes, Tutorial shows the normal hidden-answer prompt for two seconds, then visibly taps the real `?`, result digits, and `Check Answer` controls in order. It can keep its completion celebration and sounds, but awards no coins, milestone, or level progress and shows no reward toast. A genuinely new or reset profile first requires a `Start` or `Tutorial` choice: `Start` keeps the generated level-based problem, while `Tutorial` teaches the fixed untagged `28 + 47` example and finishes with `Start Game`.

The “Try another sum” die refreshes only the three alternative cards; the current-problem card stays fixed. A refresh plays a short tumbling die with changing faces and an optional dry rattle/landing sound, then gives the new cards a staggered colored pop. While that sequence runs, counting and other problem-changing controls are locked and the tray exposes its busy state to assistive technology. Keyboard focus returns to the die when the new choices are ready.

Number Garden has two difficulty modes. **Standard**, the default, asks learners to infer the running place totals from the landed blocks: temporary Ones, Tens, and Hundreds result labels stay hidden during counting, and idle help waits longer. **Easy** keeps the running result labels visible and offers the same hints sooner. Both modes retain the same blocks, carry sequence, spoken count announcements, arithmetic, animation speed, rewards, and completed place-value labels.

## Curriculum and sampling

| Level | Generated problems |
| --- | --- |
| L1 | Two addends from 1–9; sum at most 9 |
| L2 | One 1–9 addend and one 10–99 addend; no carry |
| L3 | Two 1–9 addends; sum at least 10 |
| L4 | One 1–9 addend and one 10–99 addend; ones carry and a two-digit result |
| L5 | Two 10–99 addends; no carry |
| L6 | Two 10–99 addends; ones carry only and a two-digit result |
| L7 | Two 10–99 addends; tens carry only and a three-digit result |
| L8 | Two 10–99 addends and a three-digit result; evenly split between tens-only and both-column carries |
| L9 | Two 10–99 addends; both columns carry and the result has three digits |

At L2–L8, organic selection is 50% current level, 25% the next level, and 25% a uniformly selected lower level. L1 is 75% L1 and 25% L2. L9 is 60% L9 and 40% uniform review across L1–L8. Startup, Next, suggestions, and both kinds of alternative refresh use this same sampler and avoid recent unordered pairs.

Generated models keep their sampled curriculum level; this matters because L8 overlaps L7 and L9 arithmetically. A current problem may be forced with `?a=<1–99>&b=<1–99>` for teaching or testing. Forced problems are untagged and never affect level progress.

## Experience principles

- The mathematical blocks are the visual focus; decorative garden elements stay secondary.
- Blue and green distinguish addends, while labels, position, and state changes ensure color is not the only cue.
- Only the next valid block is actionable, preventing accidental or out-of-order counting.
- The beetle varies its kid-friendly instructions when the learning step changes, while keeping the chosen message stable during that step; important updates are announced precisely to assistive technology.
- Controls are touch-friendly, keyboard accessible, and compatible with reduced-motion preferences. With reduced motion, the die updates the alternatives immediately and uses a brief non-moving card highlight instead of tumbling or staggered pops.
- Audio is optional and never required to understand the game.

## Progress, board unlocks, and settings

A correct typed answer on the current sampled level increments the current-level counter; four such successes advance one level. A correct typed answer on any higher sampled level increments a separate higher-level counter; two such successes advance one level. The alternatives are independent, both reset on advancement, levels never skip, and L9 is capped. Lower-level and diagnostic problems give no level credit. Earlier incorrect attempts do not prevent credit for the later correct answer.

The top bar always shows the learner’s current level immediately after the bee. Below L6, the board contains Labels, Tens, and Ones. L6 previews the Hundreds column before L7 first requires it. Crossing upward into L6 through organic advancement or Settings animates or statically highlights the new column, announces it, and optionally sounds it; ordinary reloads do not replay the unlock.

Score, milestones, level, two advancement counters, sound preference, difficulty mode, and the completed launch choice persist when browser storage permits. Settings provides an accessible Standard/Easy selector with short mode descriptions alongside the L1–L9 override, sound, Tutorial, Reset Progress, and an in-dialog About view with the app's author, version, and license. A difficulty change applies immediately to the current problem without changing its counting state, curriculum progress, or sampled problem. A manual level selection starts a new weighted problem and clears both counters. Confirmed reset returns to L1 with zero coins, milestones, and counters while retaining sound and difficulty, then requires the launch choice again. Supported browsers also receive a fullscreen control.

Idle help uses fixed mode-specific delays: Easy highlights the next block after 3 seconds, first suggests Tutorial after 20 seconds, and repeats the Tutorial hint after 5 seconds; Standard uses 9, 60, and 15 seconds respectively. Standard delays are exactly three times Easy delays. Tutorial waits one second at entry and after each counting-message change, then uses a dedicated two-second wait at the hidden-answer step instead of adding it to the ordinary message wait. Reduced motion keeps these pedagogical waits and replaces the animated automatic-tap hand with a brief static cue.

## Scope and non-goals

The product is a single-player curriculum-guided practice activity, not an assessment platform or competitive game. It has no login, backend, analytics, advertising, multiplayer features, cloud sync, or reporting. Subtraction, zero/negative addends, and more than two addends remain outside scope.
