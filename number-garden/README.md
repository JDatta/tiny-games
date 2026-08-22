# Number Garden

Number Garden is a mobile-first addition and subtraction game with fifteen persistent learning levels. L1–L9 teach addition by counting ones and tens and visibly regrouping into tens and hundreds. L10–L14 introduce subtraction in separate no-borrow and borrowing stages, and L15 mixes both operations for review.

Run it locally:

```sh
cd number-garden
python3 server.py
```

Then visit `http://localhost:8080`. The standalone `index.html` can also be opened directly. On a new profile, choose `Start` or watch the guided `28 + 47` Tutorial. Tap the coral-highlighted blocks in order, or hold the active operand cell for 1.5 seconds to quick-drop its remaining blocks. Addition visibly carries groups of ten; subtraction builds the minuend, removes the subtrahend, and automatically borrows one ten when Ones run out. Tap `?` to enter an answer, or hold it to start Tutorial from the current step. Manual correct answers earn 10 coins and level credit; Tutorial awards neither.

The learner advances after either four current-level manual successes or two higher-level manual successes. L14 deliberately offers no early L15 problems, so it advances through current-level work; L15 is the cap. Settings supports Standard/Easy difficulty, L1–L15 overrides, sound, reset, and About. Addition diagnostics default to `?a=58&b=47`; subtraction uses `?op=subtraction&a=42&b=17`. Forced problems are untagged: they may earn the normal manual reward but never level credit. Subtraction diagnostics with a subtrahend greater than the minuend are rejected.

Quick play defaults to `quickPlaySpeed=2`. The optional numeric URL flag accepts `0.5` through `4`; for example, `?quickPlaySpeed=1` restores the original three-second hold and `?quickPlaySpeed=4` shortens it to 0.75 seconds.

With the local server running, open `http://localhost:8080/tests/curriculum-harness.html` to run the deterministic curriculum and browser integration checks.
