# Architecture

## Overview

Number Garden is a client-only web application contained in [`index.html`](../index.html). HTML, CSS, game logic, persistence, audio, and animation are embedded in that file. It has no build step, framework, or required network dependency. Its only remote resource is an optional Google Analytics tag; gameplay remains functional when the tag is blocked or offline. [`server.py`](../server.py) is an optional static server that maps `/` to `index.html`; the game also supports direct `file://` use.

## Runtime components

- **Document and styles:** semantic controls, dialogs, the place-value board, responsive mobile-first layout, focus states, and reduced-motion rules.
- **Arithmetic model:** `deriveProblem(a, b)` validates addends from 1 through 99 and derives digits, place totals, remainders, carries, result, and carry category. Arithmetic does not depend on the DOM.
- **Curriculum model:** `problemMatchesLevel()`, `generateProblemForLevel()`, `selectCurriculumLevel()`, and `sampleCurriculumProblem()` define and select L1–L9 problems. Generated models include `curriculumLevel`; L8 also has `curriculumPattern` because its arithmetic overlaps L7/L9.
- **Session state:** `freshState()` tracks the current phase, separate accepted and landed cursors, the sequential drop queue, visible carries, animation phase, solver use, and reward status. A separate transient dice-refresh state tracks `idle`, `tumbling`, `emphasizing`, or the reduced-motion static highlight without changing the arithmetic state or persisted profile.
- **Rendering:** `render()` coordinates focused render helpers for the journey, board, prompts, answer state, and alternative problems. Source and result units receive stable place/index metadata so animation geometry can be measured from the current responsive layout. Beetle prompts come from frozen per-step pools and are cached in transient state so unrelated renders do not change the message; an actual message change drives one mascot reaction. Interactive units are recreated from state and only the next valid unit is enabled.
- **Interaction controllers:** event handlers advance manual counting, start Tutorial from the unfinished step, collect typed answers, change problems, refresh only the three alternative cards, reset state, toggle sound/fullscreen, change difficulty without replacing the active problem, override levels, and manage settings. Internal solver function names and DOM IDs remain stable for compatibility.
- **Feedback services:** reusable Web Audio helpers produce optional drop, carry, beetle, outcome, celebration, and synthesized dice-rattle effects. The dice sound combines filtered noise bursts with short impacts and requires no media asset. Fixed-position overlay clones animate between measured source/result rectangles without becoming interactive. An ordered ARIA live queue announces landed counts and phase changes.

## State flow

```text
counting-ones
  -> queued drops (accepted -> landed, one overlay at a time)
  -> carrying-to-tens (formation -> travel -> landing, when needed)
  -> counting-tens
  -> queued drops (accepted -> landed, one overlay at a time)
  -> carrying-to-hundreds (formation -> travel -> landing, when needed)
  -> counting-hundreds (tap the parked carried hundred when Hundreds is visible)
  -> queued hundred drop (accepted -> landed)
  -> awaiting-answer
  -> completed
```

Problems with zero ones begin at `counting-tens`. Rapid manual taps may queue through the next group-of-ten boundary, then input pauses until regrouping lands. A visible carried hundred parks at the top left until Tens are finished, then becomes the next eligible unit; tapping it lands the `100` in the result and reveals the Hundreds count. Accepting either carried token immediately leaves an outlined empty slot in its yellow source badge while the captured gold token travels to the result; the empty badge remains through `awaiting-answer` and is removed by completed-state cleanup. Hidden-Hundreds diagnostic problems retain their compact settlement because they have no visible target. Result units remain hidden until their matching overlay lands. Manual and Tutorial counting share the transition to `awaiting-answer`. Manual play waits there for the child; Tutorial holds the prompt for two seconds, then activates the real answer button, keypad digits, and shared checker in sequence. Queue, animation, and internal solver state lock competing controls while transitions run. Keypad dismissal and all input except the currently cued internal activation are blocked until the sequence finishes. Every automatic tap receives a fixed, non-interactive `👆` overlay: block cues retain place/index metadata, while answer cues use stable control identifiers and live inside the open modal while keypad controls are active. Reduced motion commits block movement immediately, flashes the target, and uses brief static hand cues without removing either pedagogical pause.

The suggestion tray has an independent transient sequence: `idle -> tumbling -> emphasizing -> idle`. The current card and die remain mounted while the three alternative buttons are replaced, preserving the current card visually and keeping keyboard focus on the die. The tray is `aria-busy` throughout, repeat rolls and competing controls are locked, and diagnostics record refresh start, face cycling, landing, each card emphasis, and completion. Production timing is approximately 600 ms. Reduced motion skips the tumble and stagger, replaces the alternatives synchronously, and holds a brief static highlight while leaving optional audio available.

## Data boundaries

`problem` contains derived arithmetic plus an optional sampled curriculum tag. Query-forced diagnostic problems deliberately have no tag. `state` contains temporary interaction progress, including the active beetle prompt key and template. A session-only map prevents an immediate repeat when a prompt type is selected again. Profile schema v4 contains durable score, milestone progress, sound, difficulty mode, current level, current-level success count, higher-level success count, `launchChoiceMade`, schema version, and update timestamp. The launch-Tutorial origin remains transient. Keeping these separate prevents rendered CSS classes from becoming a source of truth.

Profile data is written to IndexedDB and mirrored to a compact cookie. The newest valid copy wins at startup; if storage is unavailable, the game continues with in-memory state. Schema-v1 records migrate to L1 with zero advancement counters while preserving score, milestones, sound, and timestamp. Schema-v2 records preserve those fields plus their curriculum level and both counters. Both migrations select the `standard` default. Schema-v3 validation accepts only `standard` or `easy`. All v1–v3 migrations set `launchChoiceMade: true`, so existing learners do not receive a first-launch interruption. New and reset v4 profiles set it to `false`; either launch choice saves `true`. Reset creates a fresh normal L1-weighted problem while carrying sound and difficulty forward, then immediately reopens the non-dismissible launch dialog. There is no backend, account, or cross-device synchronization.

Google Analytics receives the standard page view plus two gameplay events. `game_start` is guarded to fire once per page load when manual play genuinely begins: Start, a first accepted block, a first non-empty answer submission, or Start Game after the launch Tutorial. `game_complete` fires only for a successful typed answer after rewards update, with the cumulative coin score, cumulative manual completion count, and shared game version. Automated Tutorial starts and solver completions emit neither event.

## Problem generation and diagnostics

All organic entry points—startup, Next, suggestion construction/selection, alternative refresh, and dice alternatives—draw from the same weighted sampler and share recent unordered-pair exclusions. L2/L4 randomize the location of the single-digit addend. L1 uses a 75/25 current/higher split; L2–L8 use 50/25/25 current/higher/uniform-lower; L9 uses 60/40 current/uniform-L1–L8 review. L8 generation splits evenly between tens-only and both-carry patterns.

Query parameters allow untagged deterministic cases from `index.html?a=1&b=1` through `index.html?a=99&b=99`. They exercise normal arithmetic and rewards but cannot change level counters. `?harness=1` compresses learning, Tutorial-stage, Tutorial-answer, and dice-refresh durations while preserving lifecycle stages. `window.NumberGarden` exposes level definitions, supported difficulty modes, the frozen 3× idle-hint timing table, frozen production motion timings (including `TUTORIAL_STAGE_PAUSE: 1000` and `TUTORIAL_ANSWER_PAUSE: 2000`), queue-boundary and curriculum helpers, profile validation/defaults, and read-only motion diagnostics. The diagnostics snapshot includes the active difficulty/timing row, launch state, active hand-cue count, dice-refresh state/events, and sound-effect counts for deterministic harness checks. Dedicated pause events distinguish the answer hold from ordinary Tutorial stage pauses. Hand-cue events diagnose block targets with place/index and answer targets with stable control IDs; matching control-tap events record the automatic answer order.

## Difficulty rendering and idle help

Difficulty remains in `profile`, not `state`, so changing it saves the preference and re-renders the existing arithmetic/session state without selecting a new problem or moving any accepted/landed cursor. Easy renders the temporary result-cell `.digit-label` elements, including carry-digit styling. Standard omits those temporary Ones, Tens, and Hundreds labels; addend labels, result blocks, carry visuals, announcements, and completed remainder labels are shared. `IDLE_HINT_TIMINGS` supplies Easy delays of 3/20/5 seconds and Standard delays of 9/60/15 seconds for next block, first Tutorial hint, and Tutorial repeat. Motion duration tables and reduced-motion branches are independent of difficulty, but reduced motion deliberately retains both Tutorial stage and answer pauses.

## Rewards and progression

`applyProgressForSuccess()` is a pure transition. Four current-level or two higher-level typed successes advance exactly one level and reset both independent counters; lower/untagged problems do nothing and L9 caps the transition. The shared answer checker calls `completeProblem("typed")` for manual entry, applying that transition and awarding 10 coins plus one milestone once. While Tutorial owns the same keypad flow it calls `completeProblem("solver")`; that path shares visual completion but does not mutate durable profile data or show the reward toast. A launch-origin Tutorial changes the completion control to `Start Game`, which starts a fresh weighted problem; Settings and long-press Tutorials retain `Next →`.

## Conditional Hundreds column

Rendering derives column count from `profile.currentLevel`: L1–L5 use Labels/Tens/Ones and L6–L9 include Hundreds. A transient, non-persisted `hundredsUnlockPending` flag is set only when advancement or a Settings jump crosses from below L6 to L6+. The next board render consumes it, so reloads cannot replay the effect. CSS supplies the motion animation and a static reduced-motion highlight; ARIA announcements and the optional audio cue come from the controller that caused the crossing.

## Change guidance

Keep arithmetic in pure helpers, transient behavior in `state`, durable preferences in `profile`, and DOM construction in render helpers. New phases must update prompt text, input locks, manual advancement, and Tutorial behavior together. Preserve direct-file operation and avoid introducing a required server or remote resource.
