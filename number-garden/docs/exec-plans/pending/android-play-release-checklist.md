# Android Google Play Release Checklist

Derived from [the Android Play release handover](android-play-release-handover.md).

## Current execution status — 2026-08-30

The connected OPPO NE2211 is now authorized and has been used for a focused release-QA pass. The debug APK was rebuilt from canonical `index.html`, synced into Capacitor, installed with `adb install -r`, and exercised through the real Capacitor WebView. Arithmetic and the listed shared-control subset passed on that device, and the corrected native smoke test passed. This is meaningful progress, but it is not full device-QA sign-off.

The exact source and APK hashes, commands, device details, screenshots, logcat result, browser-harness failure, and Gradle duplicate-class failure are recorded in [the Android QA report](../../qa/android-release-qa.md). The report is the evidence record; this checklist is the execution and release-gate index.

The current blocking items are: the curriculum harness still fails one multiplication visibility assertion; the aggregate Android instrumentation task still fails on a Kotlin duplicate-class conflict even though the app-targeted smoke task passes; required API 24, API 30, and API 36 emulator targets could not be created; and substantial lifecycle, accessibility, offline/network, and interaction coverage remains open on the OPPO.

## QA baseline

- [x] Inspect and preserve the worktree; do not stage or delete `android/.idea/` by default.
- [x] Create `docs/qa/android-release-qa.md` with commit, worktree, build, device, install, evidence, and defect details.
- [x] Run `npm ci`, `npm run build`, `npx cap sync android`, packaging comparisons, `npm ls`, and `git diff --check`.
- [ ] Run the curriculum harness and confirm direct `file://`, local-server, diagnostic URL, and analytics-blocked playability.
  Direct `file://`, local-server, and documented diagnostic URLs passed. The harness ran but does not yet reach its required PASS state: the multiplication visibility assertion recorded in `docs/qa/android-release-qa.md` remains failing.

## Functional and Android QA

- [ ] Test addition: no carry, Ones carry, Tens carry, both carries, empty places, Hundreds results, Drop All, holds, resets, and L1–L6+ rendering.
  On-device subset passed: `4+3`, `9+7`, `50+50`, and `99+99=198`, including a wrong-answer correction, Drop All, Ones/Tens/both carries, and Hundreds result. Reset and level-layout coverage are not complete on the device.
- [ ] Test subtraction: zero/equal results, `40−7`, `42−17`, `20−19`, `42−42`, borrowing, resumed removal, holds, resets, language, and theme.
  On-device subset passed: `42−42`, `40−7`, `42−17`, and `20−19`, including the borrow path and typed completions. Holds, resets, terminology, and theme still need deliberate device checks.
- [ ] Test multiplication: zero Ones, multiplier Tens conversion, `19×9`, `27×37=999`, stationary multiplicand, Pull All boundaries, regrouping, interruptions, language, and theme.
  On-device subset passed: `6×20`, `19×9`, and `27×37=999`; the last consumed 37 multiplier Ones across three explicit Tens conversions and ended at 999. Stationary-multiplicand, interruption, terminology, and theme checks remain open.
- [ ] Test shared flows: wrong-answer correction, exactly 10-coin rewards, Tutorial, progression, settings, sound, fullscreen, reset, keyboard, rapid taps, and locks.
  Wrong-answer correction and a single 10-coin typed reward were observed on-device. Keyboard Quick Drop, Settings sound toggle, fullscreen control response, and reward-free Tutorial also passed. Progression, reset, rapid-tap, and input-lock coverage remain open.
- [ ] Test on the OPPO Android 16 device, API 24 emulator, clean API 36 emulator, and an intermediate version if available.
  OPPO NE2211 Android 16/API 36 focused subset and `:app:connectedDebugAndroidTest` pass. API 24/30/36 emulator targets remain blocked by missing images/tooling and unavailable KVM acceleration.
- [ ] Test lifecycle, persistence, update install, clear-data behavior, offline operation, network failures, orientation, safe areas, system UI, accessibility, scaling, reduced motion, and audio interruptions.
  In-place `adb install -r`, force-stop/cold relaunch, persisted score/level/difficulty, portrait, and restored-landscape layout passed. `pm clear` was blocked by device policy; all remaining lifecycle/accessibility/network coverage is open.
- [ ] Capture filtered logcat, console, screenshots, and reproduction evidence for failures.
  Filtered startup/relaunch logcat and launch/relaunch/landscape screenshots were captured. The remaining browser-harness multiplication visibility failure and aggregate Android-test Kotlin duplicate-class failure are documented in `docs/qa/android-release-qa.md`.

## Defects and release candidate

- [ ] Reproduce each defect, add deterministic coverage, fix canonical `index.html` or tracked Android source, rebuild/sync, and retest.
  The quick-drop Tens timing defect was fixed, rebuilt, synced, and retested. The separate multiplication visibility failure remains unresolved, so this release gate remains open.
- [ ] Confirm no P0/P1 defects remain and document accepted lower risks.
- [ ] Freeze a clean release-candidate commit after QA sign-off; make no code, asset, privacy, or version changes afterward.

## Ordered next steps

1. Diagnose the remaining multiplication visibility assertion in `tests/curriculum-harness.html`, add or extend deterministic coverage as appropriate, fix only canonical source, rebuild/sync, and rerun until the harness prints `PASS: Number Garden curriculum checks`.
2. Resolve the aggregate Android-test Kotlin duplicate-class conflict, or document and isolate the non-app test-variant defect with owner approval; rerun both the aggregate task and `:app:connectedDebugAndroidTest`.
3. Complete the remaining OPPO checks: reset and progression, settings and persistence matrix, rapid taps/input locks, stationary multiplicand and interruption cases, terminology/themes, background/foreground, lock/unlock, reboot/process recovery, airplane-mode/offline play, analytics/network failure behavior, keyboard occlusion, scaling, reduced motion, TalkBack, and audio interruption.
4. Install the required API 24, API 30, and API 36 Google APIs images/AVDs through Android Studio SDK Manager, cold-boot without snapshots, and repeat the same smoke and functional matrix on Pixel 2, Pixel 5, and Pixel 6 targets. Record any display/navigation differences.
5. For every failure, retain filtered logcat, WebView console/Network/IndexedDB evidence, screenshots, and deterministic reproduction steps in the QA report; rerun all affected targets after each fix.
6. Rebuild from the final tested canonical source, rerun packaging/hash checks, update the report and every checklist row, and only then request QA sign-off and release-candidate freezing.
7. Complete the owner-controlled Play gates: target audience/Families, privacy policy and in-app link, analytics/Data Safety, versioning, artwork, signing-key custody, signed AAB validation, Play internal testing, and Play-delivered-build QA.

## Owner decisions and policy

- [x] Record the owner decisions: intended ages 3–8; all Play-supported countries/territories; **App → Education**; publisher Joydip Datta; support contact `mail.joydip@gmail.com`; no ads or in-app purchases; no login/restricted app access. Complete the IARC questionnaire rather than preselecting a rating.
- [ ] Publish and approve the privacy policy at a public HTTPS URL; add an accessible in-app link. A conditional draft is at `docs/privacy-policy-draft.md`; it cannot be published until the analytics implementation and traffic audit are complete.
- [ ] Implement the owner's analytics decision for Android: basic parent/guardian consent. Do not load `gtag.js` or send any analytics request until permission is granted; support withdrawal in Settings. The current source still initializes the tag at page load.
- [ ] Inspect Android WebView traffic on cold launch, declined consent, granted consent, gameplay, withdrawal, and offline paths. Record hosts, requests, headers/payload categories, and timing in the QA report; use that evidence to complete Data Safety and the final policy.
- [ ] Align shipped behavior with Play Data Safety, Ads (none), App access (unrestricted), Families, target-audience, and IARC declarations. Target ages 3–8 require the applicable Families path.
- [x] Choose the first Play-upload version plan: `versionName 3.1.0`, `versionCode 1`. The source still has Android `versionName "1.0"`; change it deliberately with the release signing/configuration work. Every later uploaded bundle must increment `versionCode`.
- [ ] Complete signing custody: the separate upload keystore was generated outside Git with alias `numbergarden-upload` and public SHA-256 fingerprint `CE:36:BB:68:C4:ED:B3:F3:25:4C:69:3F:47:4B:7D:DF:9F:F8:AD:D1:7A:A8:B5:83:BF:8A:18:39:A4:D4:51:E2`. The owner must place its password in an owner-controlled password manager, make two encrypted backups of the keystore, and remove the temporary local plaintext handoff before signing integration.

## Play Console and release assets

- [ ] Verify the Play developer account and create the app as `io.github.jdatta.numbergarden`.
- [ ] Resolve any developer-verification or prior debug-key ownership prompt.
- [ ] Enable Play App Signing and keep a separate owner-controlled upload key.
- [ ] Replace placeholder launcher/splash artwork and verify Android 12+ behavior.
- [ ] Prepare the 512×512 icon, 1024×500 feature graphic, clean screenshots, listing copy, support details, privacy URL, and release notes.

## Signing, testing, and rollout

- [ ] Finish backing up the generated dedicated upload keystore outside the repository; record only the public fingerprint above. Do not commit its path, credentials, or private material.
- [ ] Add secret-free Gradle signing wiring using ignored properties or CI environment variables; keep debug builds unaffected.
- [ ] Build and validate the signed bundle:

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
- [ ] If required, complete the Closed test with at least 12 continuously opted-in testers for 14 days.
- [ ] Resolve or explicitly accept pre-launch findings and increment `versionCode` for every replacement bundle.
- [ ] Archive the release commit, hashes, certificate fingerprint, QA report, listing copy, and release notes.
- [ ] Obtain explicit owner approval before production submission or staged rollout.

## Restrictions

Do not commit or push, create signing keys, upload artifacts, invite testers, or submit a Play release without explicit authorization.
