# Product

## Product summary

Number Garden is a short, mobile-first learning game for children practicing place-value addition. It turns two-digit addition into a visible sequence: count ones, trade ten ones for a ten, count tens, and trade ten tens for a hundred. The answer remains hidden until the learning interaction is complete.

## Audience and learning goal

The primary audience is early elementary learners, with a parent or teacher available when needed. The game aims to connect written addition with concrete ones, tens, and hundreds while making regrouping understandable rather than presenting it as a memorized rule.

## Core experience

1. The game presents two addends from 10 through 99.
2. The child taps the single glowing next block, counting both addends in order.
3. At ten units, the game groups and carries them into the next place.
4. After counting, the child enters the total with a large keypad.
5. A correct answer reveals the result, celebrates, awards 10 coins, and advances the milestone journey.
6. The child chooses the next suggested sum or refreshes the choices.

Holding the `?` button runs Solver from the child’s current position. Solver demonstrates the same counting and carry sequence instead of only revealing the answer.

## Problem coverage

The generator supports:

- no carry;
- carry from ones to tens;
- carry from tens to hundreds without an ones carry;
- carries in both places;
- results through 198.

The suggestion tray offers variety across carry categories and avoids recently seen number pairs. A current problem may be forced with `?a=<10–99>&b=<10–99>` for teaching or testing.

## Experience principles

- The mathematical blocks are the visual focus; decorative garden elements stay secondary.
- Blue and green distinguish addends, while labels, position, and state changes ensure color is not the only cue.
- Only the next valid block is actionable, preventing accidental or out-of-order counting.
- Instructions change with the current step and important updates are announced to assistive technology.
- Controls are touch-friendly, keyboard accessible, and compatible with reduced-motion preferences.
- Audio is optional and never required to understand the game.

## Progress and settings

Every completion, whether manual or Solver-assisted, earns 10 coins and one emoji milestone. Score, milestones, and sound preference persist when browser storage permits. A confirmed reset clears coins and milestones but keeps the sound preference. Settings also provide an explicit Solver control; supported browsers receive a fullscreen control.

## Scope and non-goals

The product is a single-player practice activity, not a curriculum, assessment platform, or competitive game. It has no login, backend, analytics, advertising, multiplayer features, or cloud sync. It currently covers addition of two positive two-digit numbers only; subtraction, more addends, difficulty levels, learner profiles, and reporting are outside the shipped scope.
