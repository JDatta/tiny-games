# NG-AND-003 analytics-consent implementation analysis

Date: 2026-09-06

Analysis source: `5c5d1bf6518074b51607f533ce5b7e0d324e906d` on `agent/ng-and-003-consent-analysis`

Worker session: `01a075b4-c9b4-7aa3-85ef-b22c26ab753e`

Result: analysis ready for review; implementation intentionally deferred until NG-AND-001 is integrated.

## Confirmed current risk

Canonical `index.html` statically loads `gtag.js` and queues the base `js` and `config` calls before profile initialization. This does not satisfy the selected parent/guardian consent model. Existing harness coverage inspects `dataLayer` commands; it does not prove suppression of actual Android WebView traffic.

## Recommended implementation boundary

- Remove both static analytics blocks from the document head. Keep `G-C3PJ0VBNH0` once as a runtime constant.
- Add explicit `unset`, `denied`, and `granted` consent values to durable profile schema v4 without changing the schema number. Missing legacy values normalize to `unset` while preserving existing progress and preferences.
- Treat missing, invalid, unreadable, timed-out, or unavailable storage as `unset`; analytics stays off and gameplay remains usable.
- Add an idempotent loader with suppressed/loading/ready/failed states. It may construct `dataLayer`/`gtag`, queue one base configuration, and inject the remote script only after a persisted grant or the Settings Allow action.
- Do not queue or replay activity that occurred before consent or while denied, loading, failed, offline, or in Tutorial. Preserve the existing at-most-once manual `game_start` and typed-success-only `game_complete` semantics after consent.
- Withdrawal must fail closed in memory before persistence: disable the measurement ID, cancel retries, remove the injected script, stop future application calls, discard queued commands, and clear accessible analytics cookies. A persistence failure must be announced accessibly without blocking play.
- A later grant starts one fresh loader instance and must not replay prior engagement or duplicate the page-scoped start event.
- Preserve the analytics choice across Reset Progress; clearing application data remains the full local-data erase.

## Settings and accessibility

Add a visible Optional analytics fieldset explaining that a parent or guardian should choose, limited game-use and technical data goes to Google only when allowed, and the game works fully without it. Provide keyboard-operable Do not allow and Allow controls, no preselected choice for `unset`, at least 44 px targets, non-color-only state, stable focus, `aria-describedby` help, a textual status, and polite live announcements for grant, decline, withdrawal, and save failure.

## Verification design

Deterministic coverage must keep the loader inert and assert fresh/migrated unset, persisted decline, grant-once behavior, custom-event payload/count semantics, Tutorial isolation, withdrawal, denied reload, regrant without replay, Reset Progress preservation, v1-v4 migration, invalid/storage-failure fail-closed behavior, loader failure/retry, offline/reconnect, reduced motion, keyboard/focus, and live announcements. The full curriculum harness must then pass repeatedly.

Separate direct-`file://` and local-HTTP headless checks must prove unset/declined launches make no remote request, storage failure degrades to in-memory play, and full manual/Tutorial flows remain offline-capable. After implementation, NG-AND-004 must capture redacted Android WebView Network/console/IndexedDB evidence for unset, declined, granted, gameplay, Tutorial, withdrawal, denied relaunch, offline, and reconnect states. No request may begin after withdrawal; already-started requests cannot be recalled.

The privacy-policy draft remains unpublished until NG-AND-004 confirms actual hosts, timing, payload categories, cookie/storage effects, loader failure behavior, and withdrawal boundaries.

## Validation note

The worker's in-sandbox `--check-git` command reported the known nested-Git `EPERM` symptom. Direct blob comparison and the orchestrator's approved out-of-sandbox validator both confirmed checkpoint consistency; this is not an NG-AND-003 product blocker.
