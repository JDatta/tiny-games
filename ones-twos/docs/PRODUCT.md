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

Holding the `?` button runs Solver from the child’s current position. Solver demonstrates the same counting and carry sequence instead of only revealing the answer. It can keep its completion celebration and sounds, but awards no coins, milestone, or level progress and shows no reward toast.

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
- Controls are touch-friendly, keyboard accessible, and compatible with reduced-motion preferences.
- Audio is optional and never required to understand the game.

## Progress, board unlocks, and settings

A correct typed answer on the current sampled level increments the current-level counter; four such successes advance one level. A correct typed answer on any higher sampled level increments a separate higher-level counter; two such successes advance one level. The alternatives are independent, both reset on advancement, levels never skip, and L9 is capped. Lower-level and diagnostic problems give no level credit. Earlier incorrect attempts do not prevent credit for the later correct answer.

The top bar always shows the learner’s current level immediately after the bee. Below L6, the board contains Labels, Tens, and Ones. L6 previews the Hundreds column before L7 first requires it. Crossing upward into L6 through organic advancement or Settings animates or statically highlights the new column, announces it, and optionally sounds it; ordinary reloads do not replay the unlock.

Score, milestones, level, two advancement counters, and sound preference persist when browser storage permits. Settings provides L1–L9 override, sound, Solver, Reset Progress, and an in-dialog About view with the app's author, version, and license. A manual level selection starts a new weighted problem and clears both counters. Confirmed reset returns to L1 with zero coins, milestones, and counters while retaining sound. Supported browsers also receive a fullscreen control.

## Scope and non-goals

The product is a single-player curriculum-guided practice activity, not an assessment platform or competitive game. It has no login, backend, analytics, advertising, multiplayer features, cloud sync, or reporting. Subtraction, zero/negative addends, and more than two addends remain outside scope.
