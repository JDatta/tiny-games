# Number Garden Android release-grade device QA

Date: 2026-08-30  
Tester: Codex  
Source commit: `fd2dc034b33e64c38176f46ef09b0a93efb69e07`  
Initial worktree: dirty with pre-existing project/document changes and untracked `android/.idea/`; those were preserved and `.idea/` was never touched. Final worktree remains dirty, including the canonical quick-flight code, the corrected instrumentation assertion, moved/untracked execution-plan documents, the QA report, and untracked `.idea/`. This run did not stage, commit, push, delete, or alter `.idea/`.

## Artifact and tooling baseline

| Item | Evidence/result |
|---|---|
| Canonical source | `index.html` SHA-256 `4e9b4a51e4bbd67eefa6f489fc6e8a34897d2211298532461a7f91c4ad3308c2` |
| Web copies | `cmp index.html dist/index.html` and `cmp dist/index.html android/app/src/main/assets/public/index.html` passed; all three hash identically |
| APK | `android/app/build/outputs/apk/debug/app-debug.apk`, SHA-256 `29e48b353bcd66dd0723c0fbf6d6e00441907febf9b4efd90f46b59018ad63a9` |
| APK metadata | package `io.github.jdatta.numbergarden`, versionCode 1, versionName 1.0, min SDK 24, target/compile SDK 36 |
| APK signature | `apksigner verify --verbose` passed; v2 true, one signer; debug APK only |
| Build tooling | Node v22.22.2, npm 10.9.7, JDK 21.0.11, Gradle wrapper 8.14.3, AGP 8.13.0, Android SDK `/home/jd/Android/Sdk`, Build Tools 36.0.0 |
| Capacitor | `@capacitor/android`, `@capacitor/cli`, `@capacitor/core`, `@capacitor/ios` all 8.5.0 |
| Required commands | `npm ci`, `npm run build`, `npx cap sync android`, `git diff --check`, Gradle unit tests, and debug assemble passed |
| Unit test detail | `testDebugUnitTest` passed; app module has no local unit-test sources beyond the template arithmetic test |

## Test matrix

Result meanings: Pass means executed and verified; Partial means the listed subset ran but the complete scope did not; Blocked means the environment prevented execution; Fail means an executed assertion failed.

| Test / target | Device/API/display/navigation/orientation | Install type | Result | Evidence / defect / retest |
|---|---|---|---|---|
| Packaging and signature / host | Host; not device-specific | Local debug build | Pass | Hashes and metadata above; no AAB or release signing material created |
| Deterministic curriculum harness / headless Chrome | Chrome headless; local HTTP server | Browser source | Fail | Full run reached the repaired quick-drop Tens assertion, then failed at `converted Tens stay consumed while the next multiplier Ten and all future Pull All Ones remain visible` in `tests/curriculum-harness.html:2449`. Diagnostic state: multiplication conversion phase, `convertedTensBars=1`, `controlsLocked=false`. The earlier quick-drop defect was fixed and retested: `quick-drop Tens keep later bars fully colored...` passed. |
| Direct `file://` and local HTTP / host | Chrome headless | Browser source | Pass | Direct file launch, `http://localhost:8080/`, and documented addition (`58+47`), subtraction (`42−17`), and multiplication (`12×23`) URLs rendered their requested operands. |
| Analytics-blocked play / host | Chrome/headless local app | Browser source | Partial | Harness analytics isolation checks pass before the later failure; no remote gameplay asset is required by the local copies. Full final harness PASS not achieved. |
| Native unit tests / all targets | N/A | N/A | Pass | Gradle `testDebugUnitTest` passed. |
| Corrected instrumentation smoke / OPPO NE2211 API 36 | NE2211, Android 16/API 36, 1440×3216 physical, density override 560, navigation mode 2, portrait | `adb install -r` debug update | Pass | `:app:connectedDebugAndroidTest` completed successfully: 1 test ran and passed. The assertion now verifies `io.github.jdatta.numbergarden`. |
| Forced arithmetic and interaction subset / OPPO NE2211 API 36 | Same target; real Capacitor WebView at `https://localhost/` inspected through its debug socket | `adb install -r` debug update | Pass | Typed completions on-device: addition `4+3` (wrong-answer correction then correct), `9+7` (Ones carry and Drop All), `50+50` (Tens carry), `99+99=198` (both carries); subtraction `42−42`, `40−7`, `42−17`, and `20−19` (borrow); multiplication `6×20` (explicit Tens conversion), `19×9`, and `27×37=999` (37 consumed multiplier Ones, three explicit Tens conversions, Pull All, Ones/Tens regrouping). All ended in `completed` with the expected typed result and reward. |
| Shared controls / OPPO NE2211 API 36 | Same target; real WebView controls | Fresh debug reinstall after instrumentation-run cleanup | Pass | Keyboard Quick Drop, Settings sound toggle (changed then restored), fullscreen control response, and Tutorial all passed. Tutorial completed `3+2=5` with score unchanged at `0 → 0` and announced that no coins or level progress were awarded. |
| Lifecycle, update, and layout subset / OPPO NE2211 API 36 | Portrait plus forced landscape with original rotation settings restored | `adb install -r` debug update | Partial | In-place update, force-stop/cold relaunch, score/level/difficulty persistence (230 coins, L15, Standard after relaunch), and landscape rendering passed. Android’s instrumentation runner later removed its test deployment, so the final debug APK was reinstalled for the shared-controls check. `pm clear` was blocked by the device security policy; reboot, background/foreground, lock/unlock, offline, scaling, TalkBack, audio-interruption, and soft-keyboard coverage remain open. |
| Device logs and visual evidence / OPPO NE2211 API 36 | Same target | Debug update | Pass | Cold launches completed in 1.14 s and 1.02 s. Filtered logcat had no Android runtime fatal exception, Chromium fatal error, or Capacitor startup error. Launch/relaunch and landscape screenshots were captured during the run. |
| Aggregate Android instrumentation task / host + OPPO | Gradle Android-test variants | N/A | Fail | `connectedDebugAndroidTest` ran the app test but failed afterward in `:capacitor-cordova-android-plugins:checkDebugAndroidTestDuplicateClasses`: Kotlin stdlib 1.8.22 collides with kotlin-stdlib-jdk7/jdk8 1.6.21. This is an unresolved test-variant dependency defect; `:app:connectedDebugAndroidTest` is the passing smoke result above. |
| Full functional Android matrix / NumberGarden_API24 | Required Pixel 2, Android 7/API 24, Google APIs x86 | Fresh debug install | Blocked | API-24 image/AVD is not installed; `sdkmanager`/command-line tools are unavailable in the environment. |
| Full functional Android matrix / NumberGarden_API30 | Required Pixel 5, Android 11/API 30, Google APIs x86_64 | Fresh debug install | Blocked | API-30 image/AVD is not installed; `sdkmanager`/command-line tools are unavailable. |
| Full functional Android matrix / NumberGarden_API36 | Required Pixel 6, Android 16/API 36, Google APIs x86_64 | Fresh debug install | Blocked | API-36 image/AVD is not installed. |
| Available emulator smoke / Medium_Phone | API 37.1 Google APIs Play Store x86_64, 1080×2400, density 420, portrait/default gesture navigation | Not installed | Blocked | Cold boot failed: x86_64 emulation requires hardware acceleration; `/dev/kvm` is unavailable. |

## Source changes and retest

The canonical source now records each quick-flight `drop-start` immediately after that item is rendered as in-flight. This prevents later quick-drop Tens from receiving the queued fade before their own staggered flight begins. The changed source was rebuilt and synced; the repaired assertion passed in a subsequent headless run. The remaining multiplication visibility failure is unresolved and must be diagnosed before device-QA sign-off.

The template native instrumentation assertion was corrected from `com.getcapacitor.app` to `io.github.jdatta.numbergarden`. It passed on the authorized OPPO through `:app:connectedDebugAndroidTest`.

## Connected-device execution log

The OPPO NE2211 was authorized during this run and tested as the available physical API-36 target. Its serial is intentionally not recorded. The device reported Android 16/API 36, a 1440×3216 display, physical density 480 with an active density override of 560, and secure navigation mode `2`; orientation was tested in portrait and forced landscape, then the original rotation settings were restored.

The tested on-device arithmetic set was:

- Addition: `4+3` with wrong-answer correction, `9+7` with Ones carry and Drop All, `50+50` with Tens carry, and `99+99=198` with both carries and a Hundreds result.
- Subtraction: `42−42`, `40−7`, `42−17`, and `20−19`, including equal/zero results and borrowing.
- Multiplication: `6×20` with explicit multiplier-Tens conversion, `19×9`, and `27×37=999` with 37 consumed multiplier Ones, three explicit Tens conversions, Pull All, and product Ones/Tens regrouping.

Shared on-device checks passed for keyboard Quick Drop, a Settings sound toggle that was restored, fullscreen control response, and Tutorial. Tutorial completed `3+2=5` with score unchanged from `0` to `0` and the no-reward announcement. The arithmetic completions also verified the typed-success reward behavior on the exercised paths.

Lifecycle evidence currently covers `adb install -r`, force-stop/cold relaunch, persistence of the observed score/level/difficulty (`230` coins, `L15`, Standard), portrait/landscape layout, and launch times of approximately 1.14 s and 1.02 s. `pm clear` was attempted for a fresh-install checkpoint but was rejected by the device security policy. The instrumentation runner then removed its test deployment, so the debug APK was reinstalled afterward; this reset the device-local profile and is recorded as a cleanup reset, not as a successful clear-data test. Reboot, background/foreground, lock/unlock, process death, airplane mode, network failure, accessibility, scaling, reduced motion, soft-keyboard occlusion, and audio interruption still need execution.

Native test commands and outcomes:

- `android/gradlew -p android connectedDebugAndroidTest ...`: the app test ran on `NE2211 - 16`, but the aggregate task failed afterward at `:capacitor-cordova-android-plugins:checkDebugAndroidTestDuplicateClasses` because Kotlin stdlib `1.8.22` conflicts with `kotlin-stdlib-jdk7/jdk8` `1.6.21`.
- `android/gradlew -p android :app:connectedDebugAndroidTest ...`: passed; one corrected instrumentation smoke test ran and passed on `NE2211 - 16`.

## Retest plan and evidence to add

Before sign-off, rerun the complete browser harness to its required `PASS: Number Garden curriculum checks` output, resolve or isolate the aggregate instrumentation dependency defect, complete the remaining OPPO lifecycle/interaction/accessibility/offline matrix, and run the same matrix on API 24, API 30, and API 36 Google APIs emulators. Each defect retest must add its reproduction steps plus filtered logcat, WebView console/Network/IndexedDB evidence, and screenshots. After all rows pass, regenerate the APK/hash baseline from the final canonical source and update this report and the release checklist.

## Final risks and release status

- Device QA is **not signed off**: the OPPO has a passing focused subset, but API 24/30/36 emulators are still unavailable, required physical-device lifecycle/accessibility/offline coverage remains incomplete, the aggregate instrumentation task has a Kotlin duplicate-class defect, and the deterministic harness still has one failing assertion.
- No P0/P1 classification was assigned to the remaining browser-harness or aggregate-test failure; both are release-blocking unresolved defects until reproduced and retested.
- No release keystore, signed release APK/AAB, Play Console app, upload, policy declaration, or production artifact was created.
- Play target-audience/Families, privacy-policy URL/in-app link, Google Analytics release behavior, version naming, release artwork, signing ownership, and Play-delivered-build QA remain owner/release gates outside this run.
- `android/.idea/` was not staged, deleted, or altered.
