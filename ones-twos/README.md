# Ones Twos

Ones Twos contains **Number Garden**, a mobile-first addition game that grows through nine persistent learning levels. Children count ones, trade groups of ten, count tens, and—after the L6 unlock—work with hundreds.

Run it locally:

```sh
cd ones-twos
python3 server.py
```

Then visit `http://localhost:8080`. The standalone `index.html` can also be opened directly. On a new profile, choose `Start` to begin with the generated problem or `Tutorial` to watch the guided `28 + 47` example. Tap the glowing blocks to count, tap `?` to enter an answer, or hold `?` to start Tutorial. Tutorial demonstrates counting and then uses the real answer keypad after a two-second hidden-answer pause. Manual correct answers earn 10 coins and level credit; Tutorial is a teaching aid and does not award rewards or progress.

The learner advances one level after either four current-level manual successes or two higher-level manual successes. Settings can switch between Standard (the default, with hidden running result counts and slower hints) and Easy (visible running counts and faster hints), override L1–L9, toggle sound, reset progress, or show the app's author, version, and license. Use `?a=1&b=99` through `?a=99&b=99` for untagged deterministic diagnostics; these problems can earn the normal manual coin reward but never affect level advancement.

With the local server running, open `http://localhost:8080/tests/curriculum-harness.html` to run the deterministic curriculum and browser integration checks.
