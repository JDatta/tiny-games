# Android Capacitor Next Steps

**TOT audit:** 2026-08-31 at `e32ad0c` on `pr/apk/develop` (three commits ahead of `origin/develop`). Only the preserved, user-local `android/.idea/` files are untracked.

**Status key:** `[DONE]` is complete and supported by repository or recorded QA evidence; `[PARTIAL]` has completed evidence but still contains open work; `[TODO]` has no completion evidence. Checked boxes are complete; unchecked boxes are open.

For the authoritative execution order and release state, use [`../android-release-action-items.json`](../android-release-action-items.json). Execute it through [`android-release-agentic-orchestrator.md`](android-release-agentic-orchestrator.md) only after the [owner preflight](../../runbooks/android-release/preflight.md). [`android-play-release-handover.md`](android-play-release-handover.md) retains the detailed rationale and QA matrices.

The Capacitor Android 8.5.0 platform is generated and synchronized. The `android/` directory is tracked native source, while copied web assets and generated build output are ignored. A debug APK was compiled with JDK 21 and Android SDK Platform 36, verified with Android tooling, installed over USB, and exercised on an OPPO NE2211 Android 16/API 36 device. Focused arithmetic, shared-control, persistence, orientation, and native smoke checks passed, but deterministic-harness sign-off, full device QA, and emulator coverage remain open.

A dedicated upload keystore has been generated outside Git. Owner-controlled password storage, two encrypted backups, removal of the temporary plaintext handoff, Gradle signing integration, and a signed AAB remain open. No Play Console app or release upload exists.

## 1. [PARTIAL] Install and configure the Android toolchain

- [x] Install Android Studio. The audited installation identifies itself as Android Studio `2026.1.3` and requires Java 21.
- [x] Install and verify JDK 21 at `/home/jd/.jdks/jbr-21.0.11` for reproducible CLI Gradle work.
- [x] Install Android SDK Platform 36.
- [x] Install Android SDK Build Tools 36.0.0.
- [x] Install Android SDK Platform Tools; `adb` is available from `/home/jd/Android/Sdk/platform-tools/adb`.
- [x] Install the Android Emulator.
- [ ] Install Android SDK Command-line Tools; `sdkmanager` and `avdmanager` are not currently available.
- [ ] Install Google APIs system images for API 24, API 30, and API 36 and create the required AVDs. Only an Android 37.1 image/AVD is currently present.
- [ ] Provide working hardware acceleration for x86_64 emulation. The available Android 37.1 AVD cannot cold-boot because `/dev/kvm` is unavailable.

The successful CLI builds prove that the selected JDK, Platform 36, Build Tools 36.0.0, SDK path, and required build licenses are usable. Do not change project SDK versions to work around missing emulator tooling or images.

## 2. [DONE] First open and Gradle/bootstrap sync

- [x] Open the tracked Android project in Android Studio; preserve generated `android/.idea/` as user-local state.
- [x] Resolve Gradle dependencies and compile the app successfully with the verified JDK 21.
- [x] Keep machine-specific `android/local.properties` ignored.
- [x] Complete Capacitor web build/sync and verify the copied application asset.

For later IDE sessions, open the project with:

```bash
npx cap open android
```

If a future sync fails, check the selected JDK, Platform 36, accepted licenses, proxy/network settings, and SDK path before changing project versions.

## 3. [TODO] Emulator workflow

- [ ] Create and cold-boot an API 24 Pixel 2 AVD.
- [ ] Create and cold-boot an API 30 Pixel 5 AVD.
- [ ] Create and cold-boot an API 36 Pixel 6 AVD with default density/navigation.
- [ ] Run the app from bundled local assets on each AVD and complete the required QA matrix.
- [ ] Record emulator configuration, results, screenshots, logs, and target-specific differences in `docs/qa/android-release-qa.md`.

Do not raise `minSdkVersion` merely to avoid API-24 testing.

## 4. [DONE] Physical-device smoke workflow

- [x] Enable Developer Options and USB debugging on the OPPO NE2211.
- [x] Connect by USB and approve the computer RSA prompt.
- [x] Confirm the device is authorized with `adb devices`.
- [x] Install the debug APK with `adb install -r`.
- [x] Force-stop and cold-launch `io.github.jdatta.numbergarden/.MainActivity`.
- [x] Verify a live, top-resumed activity, correct L1 rendering, safe-area/system-bar spacing, and no filtered startup errors.
- [x] Run and pass `:app:connectedDebugAndroidTest` on the device.

This section closes the physical-device bootstrap/smoke task only. The broader functional, lifecycle, offline, and accessibility work remains open below.

## 5. [PARTIAL] Android functional QA

- [x] Exercise representative on-device addition: `4+3`, `9+7`, `50+50`, and `99+99=198`, including wrong-answer correction, Drop All, and Ones/Tens/both carry paths.
- [x] Exercise representative on-device subtraction: `42−42`, `40−7`, `42−17`, and `20−19`, including zero difference and borrowing.
- [x] Exercise representative on-device multiplication: `6×20`, `19×9`, and `27×37=999`, including explicit Tens conversion, Pull All, and product regrouping.
- [x] Verify the focused shared-control subset: keyboard Quick Drop, sound toggle/restore, fullscreen response, reward-free Tutorial, typed reward behavior, force-stop/cold relaunch, update persistence, portrait, and restored landscape.
- [ ] Stabilize and pass the complete deterministic curriculum harness. A 2026-08-31 HEAD run failed the quick-drop Tens visibility assertion; the earlier QA run recorded that assertion passing and later failed a multiplication visibility assertion, so the gate is not deterministic or complete.
- [ ] Finish addition, subtraction, multiplication, and shared-flow coverage for resets, progression, holds, rapid taps/input locks, stationary multiplicand, interrupted motion, role language, themes, and all required level layouts.
- [ ] Finish lifecycle and persistence coverage: background/foreground, lock/unlock, reboot, process recovery, reset, explicit clear-data behavior, all durable preferences, and soft-keyboard behavior.
- [ ] Finish airplane-mode/offline and analytics/network-failure coverage.
- [ ] Finish accessibility, font/display scaling, reduced motion, contrast/touch targets, and audio interruption coverage.
- [ ] Repeat the required matrix on API 24, API 30, and clean API 36 emulators.
- [ ] Resolve or explicitly isolate the aggregate `connectedDebugAndroidTest` Kotlin duplicate-class failure; the app-targeted instrumentation task alone is not aggregate-task sign-off.

Do not add an orientation lock solely to conceal a layout defect. Test portrait and landscape first.

## 6. [PARTIAL] WebView debugging

- [x] Inspect and drive the real Capacitor WebView at `https://localhost/` through its debug socket for the focused device-QA run.
- [x] Confirm the packaged app uses local web content and that startup/relaunch filtered logcat contains no Android runtime, Chromium fatal, or Capacitor startup error.
- [x] Verify persistence across force-stop/relaunch for the exercised score, level, and difficulty state.
- [ ] Capture a complete WebView console/DOM/computed-style/Network/IndexedDB audit for remaining functional failures and lifecycle paths.
- [ ] Audit cold launch, declined analytics consent, granted consent, gameplay, withdrawal, and offline traffic after the consent implementation exists.

Use `chrome://inspect/#devices` for the remaining console, DOM, Network, and IndexedDB evidence.

## 7. [DONE] Normal development loop exercised

- [x] Edit the canonical root `index.html`, not copied assets.
- [x] Run `npm run build`.
- [x] Run `npx cap sync android`.
- [x] Verify `index.html`, `dist/index.html`, and `android/app/src/main/assets/public/index.html` are byte-identical.
- [x] Rebuild, install, and retest the changed debug application.

Repeat this loop for every future web, Capacitor configuration, or native-plugin change. A completed development loop does not imply that the current release QA gates pass.

## 8. [TODO] Icons and splash screen

- [ ] Obtain deliberate, reviewed Number Garden source artwork.
- [ ] Replace the generated Capacitor launcher and splash placeholders for all Android densities.
- [ ] Verify launcher masking, safe zones, background color, light/dark appearance, and Android 12+ splash transition on real devices and emulators.

If `@capacitor/assets` is used, follow its current guide, generate Android assets only, and inspect every density. Raster icon sources should be at least 1024×1024 and raster splash sources at least 2732×2732; SVG sources may also be used.

## 9. [DONE] Debug APK

- [x] Build with `android/gradlew -p android assembleDebug -Dorg.gradle.java.home=/home/jd/.jdks/jbr-21.0.11`.
- [x] Produce the ignored artifact at `android/app/build/outputs/apk/debug/app-debug.apk`.
- [x] Verify package `io.github.jdatta.numbergarden`, version code `1`, version name `1.0`, min SDK `24`, target SDK `36`, and a valid Android debug signature.
- [x] Verify the current recorded artifact SHA-256: `29e48b353bcd66dd0723c0fbf6d6e00441907febf9b4efd90f46b59018ad63a9`.

Repeat the build and verification after future source, asset, version, or native changes. Build outputs remain ignored and must not be committed.

## 10. [PARTIAL] Release signing and artifacts

- [x] Choose the first Play-upload version plan: `versionName 3.1.0`, `versionCode 1`.
- [x] Generate a dedicated upload keystore outside Git with alias `numbergarden-upload`; record only its public certificate fingerprint in release documentation.
- [ ] Store the password in an owner-controlled password manager, create two encrypted keystore backups in separate owner-controlled locations, and remove the temporary plaintext handoff only after verifying both backups.
- [ ] Add secret-free Gradle signing wiring using ignored properties or CI environment variables; keep debug builds unaffected.
- [ ] Change `android/app/build.gradle` deliberately from `versionName "1.0"` to `versionName "3.1.0"` for the first real upload. Never reuse a published `versionCode`.
- [ ] Freeze a QA-approved release-candidate commit.
- [ ] Build and validate a signed AAB; no release AAB exists at current TOT.

Never commit the keystore, passwords, `keystore.properties`, CI secrets, or exported credentials. Use Play App Signing for Play distribution.

## 11. [TODO] Google Play workflow

- [ ] Verify the owner Play developer account and create the app with immutable package name `io.github.jdatta.numbergarden`.
- [ ] Resolve any developer-verification or prior debug-key package-ownership prompt.
- [ ] Enable Play App Signing while retaining the separate owner-controlled upload key.
- [ ] Complete the store listing, public privacy-policy URL, Data safety, Ads, App access, target-audience/Families, IARC, screenshots, icon, feature graphic, countries, and release notes.
- [ ] Upload the signed AAB to Internal testing and review Console validation, App Bundle Explorer, and the pre-launch report.
- [ ] Install and complete critical QA on the Play-delivered build.
- [ ] Determine and, if applicable, complete the required closed test before requesting production access.
- [ ] Obtain explicit owner approval before production submission or staged rollout.

Google Play rules change. Recheck current requirements at submission time rather than treating this checklist as a permanent policy source.

## 12. [DONE — NO CURRENT ACTION] Native plugins

- [x] Keep the app plugin-free while browser APIs meet product requirements; no current release requirement justifies a native plugin.
- [ ] If a concrete native need later appears, select a Capacitor-compatible plugin, sync Android, and inspect permissions, manifest entries, SDK requirements, privacy implications, and generated native changes before adoption.

Commit applicable dependency and Android source changes, but continue excluding copied assets, build output, SDK-local paths, user-local IDE files, and secrets.
