# Frontend

## Stack

The frontend is a mobile-first, framework-free HTML document. `index.html` contains markup, responsive CSS, application state, rendering, persistence, audio, accessibility, and animation. `server.py` only serves the same document locally; direct `file://` use is supported.

## Project layout

- `index.html` is the canonical web source and shipped game.
- `tests/curriculum-harness.html` embeds the game and drives deterministic browser checks through the public diagnostics surface.
- `demos/` contains a historical proof of concept and tutorial-recording support; it is not the production UI.
- `dist/index.html` is generated from the canonical file for Capacitor and must not be edited directly.

## State and rendering

`problem` contains immutable arithmetic data, `state` contains the active interaction, and `profile` contains durable browser data. `render()` derives the UI from those values. New interactions must update source eligibility, input locks, prompts, announcements, motion, reset, Tutorial, diagnostics, and reduced-motion behavior together.

## Visual and interaction conventions

Addition uses blue/green, subtraction lavender/deep purple, and multiplication forest/mint green. Gold marks regrouping or conversion; coral marks shared eligible, hint, and success states. Keep the operation-specific terminology, labels, and semantic row names synchronized with the active operation.

The game supports pointer, touch, and keyboard controls, dialogs with managed focus, ARIA/live announcements, and `prefers-reduced-motion`. Preserve visible next actions, touch targets, the guide beetle, and the level badge on narrow and fullscreen layouts.
