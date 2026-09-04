# Android Google Play Release Checklist

Derived from [the Android Play release handover](android-play-release-handover.md). The sole execution-ranked tracker is [`../android-release-action-items.json`](../android-release-action-items.json), executed through the [agentic orchestrator spec](android-release-agentic-orchestrator.md) after the [owner preflight](../../runbooks/android-release/preflight.md).

**TOT audit:** 2026-08-31 at `e32ad0c` on `pr/apk/develop` (three commits ahead of `origin/develop`). Only preserved `android/.idea/` files are untracked.

**Status key:** `[DONE]` is fully evidenced; `[PARTIAL]` contains both complete and open work; `[TODO]` is not started or lacks completion evidence; `[BLOCKED]` needs a prerequisite or external capability. Checked boxes are done; unchecked boxes remain open.

The OPPO NE2211 Android 16/API 36 focused QA pass, debug packaging, app-targeted instrumentation smoke, and several owner decisions are complete. This is not release-QA sign-off. A fresh current-HEAD harness run on 2026-08-31 failed the quick-drop Tens visibility assertion, while the prior report recorded that assertion passing and later failed a multiplication visibility assertion. Treat the deterministic harness as unstable or regressed until one root cause and a repeatable full PASS are demonstrated.

The detailed 2026-08-30 device evidence is in [the Android QA report](../../qa/android-release-qa.md). That report began from bootstrap commit `fd2dc03`; its tested source changes were later committed, and its source/APK hashes still match the current generated copies and debug APK. Refresh the report at the next retest rather than treating its old commit/worktree prose as a current status snapshot.

## 1. [PARTIAL] QA baseline

- [x] Inspect and preserve the worktree; do not stage or delete `android/.idea/` by default.
- [x] Create `docs/qa/android-release-qa.md` with commit, worktree, build, device, install, evidence, and defect details.
- [x] Run `npm ci`, `npm run build`, `npx cap sync android`, packaging comparisons, `npm ls`, and `git diff --check` for the recorded QA pass.
- [x] Confirm direct `file://`, local-server, documented diagnostic URLs, and local-content playability.
- [x] Confirm that blocking the optional analytics request does not make remote gameplay content necessary.
- [ ] Make the deterministic curriculum harness reliably reach `PASS: Number Garden curriculum checks` on current HEAD.
- [ ] Refresh the QA report with current release-candidate commit, worktree, source hash, generated-copy hashes, APK/AAB hash, and rerun results.

Current blocker detail: the 2026-08-31 HEAD run failed `quick-drop Tens keep later bars fully colored until their own staggered flight begins` at `tests/curriculum-harness.html:1190`. The 2026-08-30 report instead recorded that check passing and a later multiplication visibility check failing at then-line 2449. Do not mark the harness done until the inconsistency is reproduced, fixed, and covered deterministically.

## 2. [PARTIAL] Functional and Android QA

- [ ] Complete addition coverage: no carry, Ones carry, Tens carry, both carries, empty places, Hundreds results, Drop All, holds, resets, and L1–L6+ rendering.
  - [x] OPPO subset: `4+3`, `9+7`, `50+50`, and `99+99=198`, including wrong-answer correction, Drop All, carry paths, and a Hundreds result.
  - [ ] Remaining: reset/queued-motion interruption, hold boundaries, empty-place skipping, and deliberate L1–L6+ layout coverage.
- [ ] Complete subtraction coverage: zero/equal results, `40−7`, `42−17`, `20−19`, `42−42`, borrowing, resumed removal, holds, resets, language, and theme.
  - [x] OPPO subset: all four required arithmetic cases, including equal/zero result, borrowing, and typed completions.
  - [ ] Remaining: hold boundaries, reset/interruption, role terminology, and operation theme.
- [ ] Complete multiplication coverage: zero Ones, multiplier Tens conversion, `19×9`, `27×37=999`, stationary multiplicand, Pull All boundaries, regrouping, interruptions, language, and theme.
  - [x] OPPO subset: `6×20`, `19×9`, and `27×37=999`, including explicit Tens conversions, Pull All, and Ones/Tens regrouping.
  - [ ] Remaining: stationary-multiplicand evidence, interruption/reset paths, zero-Ones boundary, explicit Pull All stop boundary, terminology, and theme.
- [ ] Complete shared flows: wrong-answer correction, exactly 10-coin rewards, Tutorial, progression, settings, sound, fullscreen, reset, keyboard, rapid taps, and locks.
  - [x] OPPO subset: wrong-answer correction, typed 10-coin reward, keyboard Quick Drop, sound toggle/restore, fullscreen response, and reward-free Tutorial.
  - [ ] Remaining: progression, reset, rapid taps, competing input locks, and complete settings/persistence matrix.
- [ ] Complete the required device matrix.
  - [x] OPPO NE2211 Android 16/API 36 focused subset.
  - [x] `:app:connectedDebugAndroidTest` on the OPPO.
  - [ ] API 24 Pixel 2 emulator.
  - [ ] API 30 Pixel 5 emulator.
  - [ ] Clean API 36 Pixel 6 emulator.
- [ ] Complete lifecycle, persistence, update, clear-data, offline/network, orientation, safe-area/system-UI, accessibility, scaling, reduced-motion, and audio-interruption coverage.
  - [x] In-place `adb install -r`, force-stop/cold relaunch, observed score/level/difficulty persistence, portrait, and restored landscape.
  - [ ] Remaining lifecycle and accessibility matrix; `pm clear` was blocked by device policy and needs an explicit alternate test target.
- [ ] Complete failure evidence capture.
  - [x] Preserve filtered startup/relaunch logcat, launch/relaunch/landscape screenshots, and recorded reproduction details for the prior harness and aggregate Android-test failures.
  - [ ] Add WebView console/Network/IndexedDB evidence, screenshots, and retest results for every new or unresolved failure.

## 3. [IN PROGRESS] Defects and release candidate

- [ ] Stabilize the quick-drop Tens visibility check, reconcile it with the prior later multiplication visibility failure, add deterministic coverage, fix canonical `index.html` or the harness as warranted, rebuild/sync, and rerun to a complete PASS.
- [ ] Resolve the aggregate `connectedDebugAndroidTest` Kotlin duplicate-class conflict, or document and isolate the non-app test-variant defect with explicit owner acceptance.
- [x] Correct the template instrumentation package assertion to `io.github.jdatta.numbergarden` and pass `:app:connectedDebugAndroidTest` on the OPPO.
- [ ] Reproduce every remaining defect, add or extend deterministic coverage, fix canonical source, rebuild/sync, and retest all affected targets.
- [ ] Confirm no P0/P1 defects remain and document owner-accepted lower risks.
- [ ] Freeze a clean release-candidate commit only after QA sign-off; make no code, asset, privacy, or version changes afterward.

## 4. [PARTIAL] Owner decisions and privacy/policy implementation

- [x] Record intended ages 3–8; all Play-supported countries/territories; **App → Education**; publisher Joydip Datta; support `mail.joydip@gmail.com`; no ads or in-app purchases; and unrestricted/no-login access. Complete IARC rather than preselecting a rating.
- [x] Create the conditional draft at `docs/privacy-policy-draft.md`.
- [x] Select basic parent/guardian analytics consent for Android.
- [ ] Implement persistent, revocable parent/guardian consent so `gtag.js` and analytics requests cannot occur before permission; preserve tag ID `G-C3PJ0VBNH0`.
- [ ] Inspect Android WebView traffic for cold launch, declined consent, granted consent, gameplay, withdrawal, and offline paths; record hosts, request/payload categories, and timing.
- [ ] Finalize, approve, and publish the privacy policy at an owner-controlled public HTTPS URL; add an accessible in-app link.
- [ ] Align shipped behavior and evidence with Play Data safety, Ads, App access, Families, target-audience, country availability, and IARC declarations.
- [x] Choose first-upload `versionName 3.1.0` and `versionCode 1`.
- [ ] Change Android source from `versionName "1.0"` only during deliberate release signing/configuration; increment `versionCode` after every uploaded bundle.
- [x] Generate the separate upload keystore outside Git with alias `numbergarden-upload` and record public SHA-256 fingerprint `CE:36:BB:68:C4:ED:B3:F3:25:4C:69:3F:47:4B:7D:DF:9F:F8:AD:D1:7A:A8:B5:83:BF:8A:18:39:A4:D4:51:E2`.
- [ ] Put the password in an owner-controlled password manager, create two verified encrypted backups, and remove the temporary local plaintext handoff.

## 5. [TODO] Emulator capability

- [ ] Install Android SDK Command-line Tools or use Android Studio SDK Manager for managed image/AVD creation.
- [ ] Install API 24, API 30, and API 36 Google APIs images and create the specified Pixel AVDs.
- [ ] Provide `/dev/kvm` or another supported hardware-accelerated runner; the available Android 37.1 AVD cannot boot without it.
- [ ] Cold-boot without snapshots and record display, density, navigation, WebView, and OS differences.

## 6. [TODO] Play Console and release assets

- [ ] Verify the Play developer account and create the app as `io.github.jdatta.numbergarden`.
- [ ] Resolve any developer-verification or prior debug-key ownership prompt.
- [ ] Enable Play App Signing and retain the separate owner-controlled upload key.
- [ ] Replace placeholder launcher/splash artwork and verify Android 12+ behavior.
- [ ] Prepare the 512×512 icon, 1024×500 feature graphic, clean screenshots, screenshot alt text, listing copy, support details, privacy URL, countries, and release notes.
- [ ] Complete the policy declarations only after implementation and traffic evidence are final.

## 7. [PARTIAL] Signing, bundle, testing, and rollout

- [x] Generate a dedicated upload keystore outside Git and keep its private path/material out of repository documentation.
- [ ] Complete owner custody and backups before signing integration.
- [ ] Add secret-free Gradle signing wiring using ignored properties or CI environment variables; keep debug builds unaffected.
- [ ] Build the release candidate with the verified JDK:

  ```bash
  npm ci
  npm run build
  npx cap sync android
  android/gradlew -p android bundleRelease \
    -Dorg.gradle.java.home=/home/jd/.jdks/jbr-21.0.11
  ```

- [ ] Validate package ID, version, manifest, certificate, contents, signature, and SHA-256 of `android/app/build/outputs/bundle/release/app-release.aab`.
- [ ] Upload to Internal testing; review Console errors, App Bundle Explorer, and the pre-launch report.
- [ ] Install and test the Play-delivered build for launch, offline play, persistence, updates, all operations, holds, Tutorial, sound, orientation, safe areas, analytics/privacy, and accessibility.
- [ ] Determine whether the account requires a closed test and, if so, complete the currently applicable tester-count/duration requirement.
- [ ] Resolve or explicitly accept pre-launch findings and increment `versionCode` for every replacement bundle.
- [ ] Archive the release commit, hashes, certificate fingerprint, QA report, listing copy, policy version, and release notes.
- [ ] Obtain explicit owner approval before production submission or staged rollout.

## 8. [TODO] Ordered next steps

Execute the ranked backlog in [`../android-release-action-items.json`](../android-release-action-items.json). Rank is authoritative; dependencies, named external gates, owner approvals, workers, leases, checkpoints, blockers, and next actions are explicit there. Do not maintain this checklist as a second task-status tracker.

## Restrictions

Follow the scoped owner-action runbooks in `docs/runbooks/android-release/owner-actions/`. Local item checkpoints are required by the orchestrator, but pushing, external accounts, replacement signing keys, Play Console mutations, uploads, tester actions, and production each require separate authorization. Preserve `android/.idea/` as user-local state unless the owner decides its repository policy.
