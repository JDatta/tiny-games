# Android QA and Google Play Release Handover

**Handoff date:** 2026-08-30

**Goal:** complete release-grade Android QA, resolve policy and product gates, produce a signed Android App Bundle, distribute it through Google Play testing, and prepare a controlled production release.

This document is the starting point for the next agent. Do not treat the successful debug smoke test as release approval. Work in the order below: preserve the current state, establish a recorded QA baseline, fix and retest defects, obtain the owner decisions, prepare release assets/signing, build the AAB, then test the Play-delivered artifact.

## 1. Current repository and application state

| Item | Current state |
| --- | --- |
| Repository root | `/home/jd/workspace/tiny-games` |
| Project directory | `/home/jd/workspace/tiny-games/number-garden` |
| Branch at handoff | `pr/apk/develop`, one commit ahead of `origin/develop` |
| Android bootstrap commit | `fd2dc03 Add Capacitor Android project bootstrap` |
| App/package ID | `io.github.jdatta.numbergarden` — do not change after Play app creation |
| App name | `Number Garden` |
| Web source | Canonical root `index.html`; do not edit copied assets in `dist/` or `android/app/src/main/assets/public/` |
| Capacitor | Core, CLI, Android, and iOS all resolve to 8.5.0 |
| Android versions | Source currently has `versionCode 1`, `versionName 1.0`; owner selected `versionName 3.1.0` and `versionCode 1` for the first real Play upload. Make that deliberate source change during release signing/configuration. |
| Android SDK range | min 24, compile 36, target 36 |
| Native permissions observed | `INTERNET` plus the AndroidX-generated non-exported receiver permission; no `AD_ID`, location, camera, microphone, or storage permission observed |
| Debug build | Completed successfully from the CLI |
| Physical smoke | Installed and cold-launched successfully on OPPO NE2211, Android 16/API 36 |
| Release build/signing | No signed AAB exists. A dedicated owner-controlled upload keystore has been generated outside Git; encrypted backups and secret-free Gradle wiring remain pending. |
| Play Console | No app creation, package registration, policy declarations, testing track, or production submission has been performed |

At handoff, documentation changes are intentionally uncommitted and Android Studio has created untracked files under `android/.idea/`. Begin with `git status --short --branch --untracked-files=all`. Preserve all current changes. Do not stage `.idea/` by default and do not delete it without an explicit repository-policy decision from the owner.

The root ignore rules already exclude `*.jks`, `*.keystore`, and `android/keystore.properties`. The generated `android/.gitignore` excludes `local.properties`, Gradle/build output, and copied Capacitor web/config assets.

## 2. Verified local toolchain and build evidence

The successful build used:

- Node 22.22.2 and npm 10.9.7.
- Android SDK `/home/jd/Android/Sdk`.
- Android Platform/target 36 and Build Tools 36.0.0.
- JDK 21 `/home/jd/.jdks/jbr-21.0.11`.
- Gradle wrapper 8.14.3 and Android Gradle Plugin 8.13.0.

The system `java` is a runtime-only Java 21 install with no `javac`. Android Studio's `/usr/local/android-studio/jbr` reported Java 25. The reproducible successful CLI build explicitly selected the JDK 21 path above.

From `number-garden/`, the successful sequence was:

```bash
npm run build
npx cap sync android
android/gradlew -p android assembleDebug -Dorg.gradle.java.home=/home/jd/.jdks/jbr-21.0.11
```

The ignored artifact is:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Evidence from that artifact:

- Size: 4,210,772 bytes.
- APK SHA-256: `af7cecaf048c8a363b8b48a922dbc07788f8041f8125e5cb826ef2050d7e98aa`.
- Debug signing-certificate SHA-256: `0958ec23ba60f62991ae1f02bab5d729553e8bebbee4a2d4ce2e85794150f3b9`.
- Package/version: `io.github.jdatta.numbergarden`, code 1, name 1.0.
- Android manifest: min 24, target 36.
- `apksigner verify` passed using APK Signature Scheme v2.
- The APK's bundled `assets/public/index.html` was byte-identical to root `index.html` at build time.

The first build took 6m53s while caches were populated. Template-level `flatDir` warnings and a Capacitor unchecked-operations note appeared, but the build completed with all 93 tasks successful.

## 3. Physical-device smoke evidence

The connected phone was an OPPO NE2211 running Android 16/API 36, with a 1440×3216 physical display, physical density 480, and density override 560. Do not record or commit the device serial.

The successful device sequence was:

```bash
/home/jd/Android/Sdk/platform-tools/adb devices -l
/home/jd/Android/Sdk/platform-tools/adb install -r android/app/build/outputs/apk/debug/app-debug.apk
/home/jd/Android/Sdk/platform-tools/adb shell am force-stop io.github.jdatta.numbergarden
/home/jd/Android/Sdk/platform-tools/adb shell am start -W -n io.github.jdatta.numbergarden/.MainActivity
```

The streamed install returned `Success`. The launch was cold, returned `Status: ok`, and completed in about 1.15 seconds. `MainActivity` was top-resumed and fullscreen with a live process. A device screenshot showed the initial L1 `3 + 6` board rendered correctly, including the action glow, bee and level badge, board, suggestions, status bar, gesture-navigation inset, and safe-area spacing. Filtered `AndroidRuntime`, `chromium`, and `Capacitor` startup logs contained no errors.

This proves only installation, startup, and initial rendering on one API-36 phone. It does not prove arithmetic correctness, touch/hold behavior, persistence, offline operation, accessibility, rotation, minimum-SDK compatibility, or Play-distributed signing/install behavior.

## 4. Release gates requiring owner input

Do not silently choose these on the owner's behalf. Present concrete recommendations and obtain direction before the release implementation that depends on them.

### Target audience, Families policy, and privacy

Number Garden is explicitly designed as an early-math learning game for young children. The Play target-audience declaration must reflect the actual intended age groups; choosing an adult audience to avoid Families requirements would conflict with the product and listing. Google specifically describes basic-math educational apps as potentially appropriate for ages 6–8.

If any selected audience includes children, Google Play Families requirements apply. The app must have an active privacy-policy URL in the store listing and an accessible privacy-policy link inside the app, even if no personal or sensitive data is collected. There is currently no in-app privacy-policy link.

Owner-decision areas (their recorded status is below):

1. Exact target age groups and distribution countries.
2. Publisher/legal identity and support contact shown in the privacy policy and store listing.
3. Final privacy-policy text and public HTTPS URL.
4. Whether the app is categorized as an app or game, and its Play category.
5. Whether the app contains ads or in-app purchases; the current build appears to contain neither.

### Owner decisions recorded on 2026-08-30

The owner selected the following release baseline. These entries are decisions,
not evidence that the corresponding product or policy implementation is complete.

| Topic | Recorded decision | Still required before release |
| --- | --- | --- |
| Intended audience | Ages 3–8 | Select only the matching Play age bands and verify the app is appropriate for each selected band. Families requirements apply. |
| Distribution | All Play-supported countries/territories | Confirm the final public policy and consent/data practice are appropriate for every selected territory before enabling rollout. |
| Listing type/category | App → Education | Use the final supported category/tags in Play Console. |
| Publisher/support | Joydip Datta; `mail.joydip@gmail.com` | Use the same details in the public policy and store listing. |
| Commercial model | No ads and no in-app purchases | Declare this accurately in Play Console; reassess before adding either feature. |
| App access | No account, login, or restricted content | Answer the Play App access declaration accordingly. |
| Content rating | Do not preselect a rating | Complete the IARC questionnaire accurately after policy behavior is final. |
| Privacy policy | Draft created at `docs/privacy-policy-draft.md` | Complete the placeholders after audit, publish it at an owner-controlled HTTPS URL, and add an accessible in-app link. |

The privacy-policy draft is deliberately conditional: it describes the intended
basic consent model but must not be published or used for Play declarations
until the implementation and traffic audit confirm it is accurate.

Official references:

- [Target audience and app content](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en)
- [Google Play Families policies](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en)
- [Prepare an app for Play review](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en)

### Google Analytics release decision

`index.html` loads `https://www.googletagmanager.com/gtag/js?id=G-C3PJ0VBNH0` and immediately calls `gtag('config', 'G-C3PJ0VBNH0')`. Custom `game_start` and `game_complete` events are intentionally restricted, but the base GA configuration initializes on page load and may perform its own collection. Do not equate the custom-event tests with a complete data-practice audit.

Before Play release:

1. Inspect actual cold-start and gameplay network traffic in the Android WebView.
2. Determine exactly what GA4 web tagging collects, stores, or transmits in this packaged context.
3. Decide whether Android releases will disable analytics, default consent to denied until an appropriate guardian flow, or retain and disclose a reviewed configuration.
4. Align the privacy policy, in-app disclosure/consent if required, and Play Data safety answers with the shipped behavior.
5. Re-run analytics harness checks and offline QA after any change. Preserve the project's single tag ID unless the owner approves a product-level analytics change.

The owner selected **basic parent/guardian consent for Android**. This means
the Google tag must not load, and no analytics request may be sent, before a
parent or guardian grants permission. This is not implemented: the current
source still loads `gtag.js` and calls `gtag('config', ...)` at page load.
Implement a persistent, revocable Settings choice; then inspect and record
WebView traffic for cold start, declined consent, granted consent, gameplay,
withdrawal, and offline behavior. Do not complete the policy or Play Data
Safety answers from source inspection alone.

Google holds the app developer responsible for third-party code and data collection, including analytics. See [Using SDKs safely](https://support.google.com/googleplay/android-developer/answer/13326895?hl=en) and [Families data practices](https://support.google.com/googleplay/android-developer/answer/11043825?hl=en).

### Versioning

The owner selected public Android `versionName 3.1.0`, aligning it with the
semantic version in `package.json` and the game while omitting build metadata
from the store version. Change `android/app/build.gradle` from `1.0` before the
first real upload. `versionCode` remains 1 only for that first upload; every
subsequent uploaded bundle must use a larger code. Never upload a disposable
bundle with a version code intended for the production candidate.

### Signing ownership and storage

A dedicated upload keystore has now been generated locally outside the
repository, with alias `numbergarden-upload`. Its public certificate SHA-256
fingerprint is
`CE:36:BB:68:C4:ED:B3:F3:25:4C:69:3F:47:4B:7D:DF:9F:F8:AD:D1:7A:A8:B5:83:BF:8A:18:39:A4:D4:51:E2`.
The private keystore, credentials, and their filesystem location must never be
put in Git, this handover, logs, screenshots, chat, or CI configuration.

The owner must now put the password in an owner-controlled password manager,
create two encrypted backups in separate owner-controlled locations, and
remove the temporary plaintext local handoff only after confirming those
backups. The upload keystore remains distinct from the Android debug key.
Do not create a replacement key merely to make Gradle pass.

Because the debug-signed package was installed on a certified Android device before a Play Console app was created, the 2026 Android developer-verification flow may ask for proof of ownership of that known signing key. This is an inference from Google's current package-registration guide, not a confirmed Play Console outcome. Create/register the Play app early and preserve the current machine's debug keystore until package registration succeeds. If Play requests proof, use the existing debug private key only for that verification step; do not make it the release upload key. See [Play Console developer verification guide](https://developer.android.com/developer-verification/guides/pdf-guides/pdc-guide.pdf).

## 5. Required QA record

Create `docs/qa/android-release-qa.md` during execution. Each pass must record:

- Date, tester/agent, exact Git commit, and whether the worktree was clean.
- `index.html` hash and APK/AAB hash.
- Browser/Chrome/WebView versions.
- Device model, Android/API level, resolution/density, navigation mode, and orientation.
- Install type: fresh debug install, `-r` update, locally signed release, or Play-delivered build.
- Each test result as Pass, Fail, Blocked, or Not run, with reproduction steps and evidence links.
- Logcat/console findings and screenshots for failures or layout-sensitive checks.
- Defect commit and exact retest evidence.
- Final unresolved risks and owner acceptance.

No release candidate is ready while required rows are unrecorded, any P0/P1 defect remains open, or a policy/signing gate is unresolved.

## 6. QA phase A — deterministic browser and packaging baseline

Start from the canonical web app before device testing:

```bash
git status --short --branch --untracked-files=all
npm ci
npm run build
cmp index.html dist/index.html
npx cap sync android
cmp dist/index.html android/app/src/main/assets/public/index.html
npm ls --depth=0 @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
git diff --check
```

Then run the local server:

```bash
python3 server.py
```

Open `http://localhost:8080/tests/curriculum-harness.html` and wait for the document title `PASS: Number Garden curriculum checks`. Save the full result text in the QA report. A failure must be investigated; do not rerun until it happens to pass.

Also confirm:

- Direct `file://` launch remains playable.
- `http://localhost:8080` launch remains playable.
- The only required app content is local; blocking the analytics request does not block play.
- Default addition and forced diagnostic URLs still behave as documented in `README.md`.

## 7. QA phase B — arithmetic and interaction matrix

Run manual focused checks in a browser first, then repeat representative and high-risk paths in the Android app.

### Addition

- No carry, Ones carry, Tens carry, and both carries.
- Zero Ones and empty-place skipping.
- Problems producing a Hundreds result, including 198.
- Drop All by 1.5-second hold; carry-boundary pause; reset during queued motion.
- L1–L5 two-place board and L6+ Hundreds unlock/rendering.

### Subtraction

- Equal/zero difference and exact depletion.
- `40−7`, `42−17`, `20−19`, and `42−42`.
- Borrow only when Ones are empty with removals remaining.
- Drop All, resumed removal after borrowing, and reset mid-flow.
- Correct minuend/subtrahend/difference language and purple theme.

### Multiplication

- Zero multiplier Ones, multiple multiplier Tens, and explicit Ten conversion.
- `19×9` and `27×37=999`, including simultaneous Ones/Tens overflow.
- Stationary multiplicand; each multiplier One clones all non-empty multiplicand places.
- Pull All consumes only the current Ones group and stops before the next Ten.
- Reset/interruption during pull and regroup animation.
- Correct multiplicand/multiplier/product language and forest/mint theme.

### Shared flows

- Manual wrong answer, correction, and successful answer.
- Exactly 10 coins, one milestone, and eligible level credit once per typed success.
- Tutorial from launch and from a partially completed problem; no Tutorial reward, progression, or analytics completion.
- Next, suggestions, alternative refresh, dice, Settings, level override, sound, About, fullscreen, and reset.
- L1–L20 progression gates and operation/theme transitions.
- Rapid taps, competing input during locks, keyboard activation, and 1.5-second holds.

## 8. QA phase C — Android device, lifecycle, offline, and accessibility

### Device/API matrix

At minimum test:

- The existing OPPO NE2211 on Android 16/API 36.
- An API 24 emulator because 24 is the configured minimum.
- A clean API 36 emulator with default density/navigation.
- One additional common intermediate Android version if available.

The current SDK has an Android 37.1 system image but no confirmed API-24 image. Install only the missing emulator image/tool after confirming SDK Manager state; do not change `minSdkVersion` merely to avoid the test.

### Lifecycle and persistence

- Fresh install and first launch.
- Force-stop and cold relaunch.
- Background/foreground and screen lock/unlock.
- Device reboot followed by launch.
- Progress, coins, level, sound, difficulty, and launch-choice persistence.
- `adb install -r` update preserving app data.
- Reset behavior and an explicit clear-data test as a separate destructive case.
- Low-memory/process-death recovery if practical.

### Offline and network

- Airplane-mode cold launch before the app has network access.
- Full problem/Tutorial/completion flow offline.
- Graceful analytics failure with no repeated visible errors or frozen UI.
- WebView network inspection confirming no remote page or asset is required.
- Final reviewed analytics behavior matches the privacy/Data safety decision.

### Layout and system UI

- Portrait and landscape before deciding whether orientation should be locked.
- Status bar, gesture navigation, three-button navigation if available, display cutout, and edge-to-edge behavior.
- Narrow/tall and wide layouts; bee and level badge remain visible.
- Keypad/dialogs are not obscured by the soft keyboard or system bars.
- Fullscreen enter/exit and restoration after lifecycle changes.
- Launcher icon and splash behavior on Android 12+.

### Accessibility and input

- TalkBack reading order, roles, labels, live announcements, and dialog focus trapping/restoration.
- External keyboard/ChromeOS-style navigation where available.
- Touch targets and contrast.
- System font scaling and display scaling.
- System “Remove animations”/reduced-motion behavior.
- Audio on/off, silent mode, interruption, and no unexpected autoplay.

Use `chrome://inspect/#devices` for WebView console, DOM, Network, and IndexedDB inspection. Capture a clean filtered logcat around each cold launch and all failures.

## 9. Defect loop and release-candidate freeze

For every defect:

1. Reproduce on a forced problem or stable profile when possible.
2. Add or extend deterministic harness coverage before or with the fix.
3. Change canonical `index.html` or tracked Android source only; never patch copied assets.
4. Run browser harness and relevant manual regression.
5. Run `npm run build` and `npx cap sync android`.
6. Rebuild, install with `adb install -r`, and retest on device.
7. Record evidence and close the defect in the QA report.

After all release-blocking defects are fixed, freeze a specific Git commit as the release candidate. Rebuild from a clean dependency install and do not change code, assets, privacy behavior, or version metadata between QA sign-off and AAB generation.

## 10. Release artwork and store listing

The generated Capacitor launcher/splash assets are placeholders and are not release-approved. Obtain deliberate Number Garden source artwork and generate Android assets for all densities. Verify Android 12+ system splash masking and transition on device.

Prepare Play assets from the approved art and final app:

- 512×512 32-bit PNG Play icon, maximum 1 MB.
- Required 1024×500 JPEG or 24-bit PNG feature graphic with no alpha.
- At least two real screenshots; for strong game presentation, provide at least three 9:16 portrait screenshots at 1080×1920 or higher.
- Screenshot alt text, no notification clutter, no misleading rankings/pricing/calls to action, and no unapproved third-party marks.
- App title, short description (80-character maximum), full description, category, support email/site, privacy-policy URL, and release notes.

The existing smoke screenshot contains notification icons and is evidence only; do not use it as a store asset. Capture clean screenshots from the signed release/Play build after QA, representing addition, subtraction, multiplication, Tutorial/regrouping, and progress/settings without exposing personal device information.

See [Google Play preview-asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en).

## 11. Play Console registration and policy setup

Perform these owner-account actions before final signing integration:

1. Confirm the Play developer account is fully identity-verified.
2. Create the app using package `io.github.jdatta.numbergarden`, default language, app/game classification, free/paid choice, and applicable declarations.
3. Resolve any Android developer-verification/package-ownership prompt caused by the earlier debug-signed device install.
4. Enable Play App Signing and decide whether Google generates the app-signing key; keep a separate owner-controlled upload key.
5. Complete privacy policy, Ads, App access, Target audience and content, Data safety, IARC content rating, and any Families declarations accurately.
6. Complete the main store listing and countries/regions.

As of 2026-08-30, the project target SDK 36 meets Google's announced requirement that new phone/tablet apps and updates target Android 16/API 36 starting 2026-08-31. Recheck the live policy at submission time: [Google Play target API requirements](https://support.google.com/googleplay/android-developer/answer/11926878?hl=en-GB).

For personal developer accounts created after 2023-11-13, Google currently requires a closed test with at least 12 testers continuously opted in for 14 days before applying for production access. Determine whether this account is subject to that requirement; do not assume internal testing satisfies it. See [new personal-account testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB).

## 12. Release signing and AAB generation

Only after the owner approves key custody:

1. Complete the owner-controlled password-manager and two-encrypted-backup handoff for the already generated dedicated upload keystore.
2. Record only its public certificate fingerprint in release records; never record private key material, credentials, or secret filesystem locations in Git, shell history, logs, screenshots, chat, or CI output.
3. Add secret-free Gradle signing wiring that reads either the ignored `android/keystore.properties` or CI environment variables. Fail clearly when release credentials are absent; debug builds must remain unaffected.
4. Update `android/app/build.gradle` deliberately to the owner-selected `versionName 3.1.0`; retain `versionCode 1` only if this will be the first actual Play upload.
5. Re-run the complete web build/sync and release-candidate QA baseline.

Build from `number-garden/` with the verified JDK:

```bash
npm ci
npm run build
npx cap sync android
android/gradlew -p android bundleRelease -Dorg.gradle.java.home=/home/jd/.jdks/jbr-21.0.11
```

Expected artifact:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Validate the bundle's package, version, manifest, certificate, contents, and SHA-256. `jarsigner -verify` can verify the AAB's JAR signature; use the current official `bundletool` to validate and inspect device APK generation if installed. Ensure no debug certificate, local path, keystore properties, or secrets are packaged or committed.

Android App Bundles uploaded for new Play apps must use Play App Signing; the upload bundle is signed with the upload key and Play signs device APKs with the app-signing key. See [Android app signing](https://developer.android.com/studio/publish/app-signing) and [uploading an app bundle](https://developer.android.com/studio/publish/upload-bundle).

## 13. Play testing and production sequence

1. Upload the signed AAB to Internal testing first.
2. Resolve Play Console errors/warnings, inspect App Bundle Explorer output, and review the pre-launch report.
3. Install the Play-delivered build from the tester opt-in link; do not treat the sideloaded debug APK as equivalent.
4. Repeat the critical QA subset on the Play-signed build: cold launch, offline play, persistence, update behavior, all three operations, holds, Tutorial, sound, orientation, safe areas, analytics/privacy behavior, and accessibility smoke.
5. Start and maintain the required Closed test if the account is subject to the 12-testers/14-days rule. Collect real tester feedback and document fixes.
6. Increment `versionCode` for every replacement bundle and repeat QA proportional to changes.
7. Apply for production access only after the testing requirement, QA report, policy declarations, privacy URL, and store assets are complete.
8. Use a staged production rollout where available; monitor Android vitals, crashes/ANRs, reviews, and policy messages before broadening distribution.

## 14. Definition of done

The Android Play release is ready only when all are true:

- The deterministic curriculum harness passes on the frozen release commit.
- Required physical-device and emulator/API matrix rows pass with evidence.
- No unresolved P0/P1 defect remains; accepted lower risks are documented by the owner.
- Offline, persistence, lifecycle, rotation, accessibility, and update tests pass.
- Target audience, Families, analytics, privacy policy, Data safety, ads, and content-rating decisions match shipped behavior.
- Release launcher/splash assets and Play listing assets are approved and verified.
- The owner controls a backed-up upload key; no secret is in Git or logs.
- The signed AAB has the intended immutable package ID and monotonically increasing version code.
- The Play internal build installs and passes the critical QA subset.
- Any mandatory closed-test duration/tester count is satisfied.
- Play pre-launch findings are resolved or explicitly accepted.
- The release commit, AAB hash, signing certificate fingerprint, QA report, listing copy, and release notes are archived.
- The owner explicitly approves production submission/rollout.

## 15. Immediate next-agent checklist

1. Read `AGENTS.md`, this handover, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, and the existing Android next-steps document.
2. Inspect and preserve the working tree; do not stage/delete `android/.idea/` by default.
3. Create `docs/qa/android-release-qa.md` and run QA phase A.
4. Execute phases B and C, beginning with the already authorized OPPO device and then API-24/API-36 emulators.
5. Fix and regress defects until a release candidate can be frozen.
6. Present the owner with the target-audience, analytics/privacy, versioning, store classification, and signing-custody decisions.
7. Create/register the Play Console app early enough to resolve the possible debug-key ownership check.
8. Prepare approved release artwork, privacy link, Play listing, secret-free signing wiring, and the signed AAB.
9. Upload to Internal testing and QA the Play-delivered build before any production request.

Do not commit, push, create external accounts, generate signing keys, upload artifacts, invite testers, or submit a Play release unless those actions are explicitly authorized in the next task.
