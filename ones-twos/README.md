# Ones Twos

Ones Twos contains **Number Garden**, a mobile-first addition game that grows through nine persistent learning levels. Children count ones, trade groups of ten, count tens, and—after the L6 unlock—work with hundreds.

Run it locally:

```sh
cd ones-twos
python3 server.py
```

Then visit `http://localhost:8080`. The standalone `index.html` can also be opened directly. Tap the glowing blocks to count, tap `?` to enter an answer, or hold `?` to run Solver. Manual correct answers earn 10 coins and level credit; Solver is a teaching aid and does not award rewards or progress.

The learner advances one level after either four current-level manual successes or two higher-level manual successes. Settings can override L1–L9, toggle sound, or reset progress. Use `?a=1&b=99` through `?a=99&b=99` for untagged deterministic diagnostics; these problems can earn the normal manual coin reward but never affect level advancement.

With the local server running, open `http://localhost:8080/tests/curriculum-harness.html` to run the deterministic curriculum and browser integration checks.
