# Android Capacitor Next Steps

For current execution order, release gates, and QA evidence requirements, continue with [`android-play-release-handover.md`](android-play-release-handover.md). This document retains the broader post-bootstrap reference checklist.

The Capacitor Android 8.5.0 platform has already been generated and synchronized for Number Garden. The `android/` directory is tracked native source, while its copied web assets and generated build output are ignored. A debug APK has now been compiled successfully from the command line with JDK 21 and Android SDK Platform 36, verified with Android's `aapt` and `apksigner` tools, installed over USB, and cold-launched successfully on an OPPO NE2211 physical device. Full functional QA and emulator coverage remain pending.

Android Studio setup and the remaining manual work can continue from this state. No release credentials or signing material have been created.

## 1. Install and configure the Android toolchain

Install Android Studio 2025.2.1 or newer from an official distribution. Use Android Studio's embedded JDK 21 for Gradle rather than the host's current runtime-only Java installation, which does not include `javac`.

Use Android Studio's SDK Manager to install:

- Android SDK Platform 36.
- The current compatible Android SDK Build Tools.
- Android SDK Platform Tools.
- Android SDK Command-line Tools.
- Android Emulator.
- At least one API 24 or newer system image; API 36 should be the primary test image.

Accept the required SDK licenses, then confirm Android Studio's SDK location and Gradle JDK settings. If command-line tools will also be used, verify `ANDROID_HOME` or `ANDROID_SDK_ROOT`, `PATH`, `adb`, and `sdkmanager` against that same SDK installation. Do not blindly install operating-system packages: first identify which JDK, SDK, or path component is actually missing.

## 2. First open and Gradle sync

From `number-garden/`, run:

```bash
npx cap open android
```

Allow Android Studio to complete its first Gradle dependency sync and any explicitly requested SDK downloads. If sync fails, check Android Studio's selected JDK, SDK Platform 36 availability, accepted licenses, proxy/network settings, and SDK path before changing project versions.

Android Studio may create `android/local.properties` with a machine-specific SDK path. It is already ignored and must not be committed.

## 3. Emulator workflow

Create an API 36 Android Virtual Device in Device Manager and use it for the primary run/debug pass. An API 24 AVD is also useful for validating the configured minimum SDK; additional intermediate/current devices can be added when compatibility findings justify them.

Select the `app` run configuration, start the AVD, and run or debug the project. Confirm that Number Garden launches from the assets bundled in the app rather than loading GitHub Pages or any other remote application URL.

## 4. Physical-device workflow

On the Android phone or tablet:

1. Enable Developer Options and USB debugging.
2. Connect the device over USB.
3. Approve the computer's RSA debugging prompt on the device.
4. Run `adb devices` and confirm that the device is listed as `device`, not `unauthorized` or `offline`.

On Linux, change USB/udev permissions only if the device is not visible after the cable, USB mode, RSA prompt, and `adb` server have been checked. Then select the device in Android Studio and run/debug the `app` configuration. Force-stop and relaunch the installed app during validation rather than relying only on a warm debug session.

The first CLI device smoke test completed successfully on an authorized OPPO NE2211: `adb install -r` succeeded, `MainActivity` cold-launched, and the app remained the top resumed fullscreen activity with a live process. A captured screen showed the L1 addition board rendered correctly, including system-bar and safe-area spacing, and filtered startup logs contained no Android runtime, Chromium, or Capacitor errors. This smoke test does not replace the interaction, persistence, offline, rotation, and accessibility checks below.

## 5. Android functional QA

Exercise the full learning flow on both an emulator and at least one physical device. In particular, verify:

- Touch targets, ordinary taps, 1.5-second holds, Drop All, and multiplication Pull All.
- The answer keypad, settings and other dialogs, focus behavior, fullscreen behavior, and audio.
- Narrow portrait layouts, wider/landscape layouts, and the visibility of the bee and level badge.
- IndexedDB-backed profile, settings, rewards, and progress persistence across force-stop and app restart, without clearing app data or reinstalling.
- A cold launch in airplane mode with no prior network connection; gameplay must work and the optional analytics request must fail harmlessly.
- The existing `viewport-fit=cover` and safe-area CSS with status/navigation bars, display cutouts, gesture navigation, and current Android edge-to-edge behavior.

Test both portrait and landscape before deciding whether an orientation lock is educationally or ergonomically necessary. Do not add a lock solely because one layout needs correction.

## 6. WebView debugging

Connect a running emulator or USB-debugged device, open `chrome://inspect/#devices` in desktop Chrome, and inspect the Number Garden WebView. Use DevTools to check:

- JavaScript console errors and failed resource requests.
- Network activity, especially that no remote application page is required and analytics failure is harmless.
- DOM, computed styles, safe-area layout, touch states, and accessibility attributes.
- IndexedDB and other Application storage used by the durable profile.

## 7. Normal development loop

Edit the canonical root `index.html`; never edit `android/app/src/main/assets/public/index.html`, because Capacitor replaces that copied file during sync. Run the relevant browser and curriculum-harness checks, then refresh Android assets with:

```bash
npm run build
npx cap sync android
```

Rebuild or relaunch the Android app afterward. Repeat the sync whenever web code, Capacitor configuration, or native plugin dependencies change.

## 8. Icons and splash screen

The generated Capacitor icons and splash screens are bootstrap placeholders. Replace them later from deliberate, reviewed Number Garden source artwork.

The optional `@capacitor/assets` package can generate Android assets. Follow its current guide and keep source images in the expected `assets/` locations. Raster icon sources should be at least 1024×1024, and raster splash sources should be at least 2732×2732; SVG sources may also be used. Provide foreground/background or dark-mode variants only when the artwork has been designed for those roles. Generate Android only, for example with the package's `generate --android` command, and inspect every density afterward.

Android 12 and newer use the system splash-screen model, which centers a constrained icon over a background rather than showing an unrestricted full-screen launch image. Check masking, safe zones, background color, light/dark appearance, and the transition into the WebView on real devices. Do not regenerate assets until the source artwork and intended Android 12+ behavior are settled.

## 9. Debug APK (completed)

The first command-line debug build completed successfully using:

```bash
android/gradlew -p android assembleDebug
```

The expected artifact is:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

The APK was verified as package `io.github.jdatta.numbergarden`, version code 1, version name 1.0, min SDK 24, target SDK 36, and a valid Android debug signature. Build outputs are ignored and should not be committed. Repeat the build after later web syncs or native changes.

## 10. Release signing and artifacts

Before the first release, choose a monotonically increasing integer `versionCode` and a user-facing `versionName` in `android/app/build.gradle`. Never reuse a published version code.

Create the upload keystore outside the repository and back it up securely in more than one controlled location. Never commit the keystore, passwords, `keystore.properties`, CI secrets, or exported credentials. The root ignore rules cover `*.jks`, `*.keystore`, and `android/keystore.properties`; keep only secret-free signing logic and property lookups in Gradle source.

Configure Play App Signing for Play distribution. Generate a signed Android App Bundle (`.aab`) for Google Play. Generate a release APK only when direct installation or a non-Play distribution channel specifically requires one. Verify the signed artifact and archive the associated version metadata and release notes.

## 11. Google Play workflow

Create the Play Console application with the immutable package name `io.github.jdatta.numbergarden`. Configure Play App Signing and complete the store listing, privacy-policy URL, Data safety disclosure (including the optional Google Analytics request), content/age rating, screenshots, high-resolution icon, target-API compliance, and release notes.

Upload the first signed AAB to the internal testing track, add testers, and review automated pre-launch reports. Promote only after emulator and physical-device QA has covered offline cold launch, profile persistence, force-stop/relaunch, interaction holds, audio, safe areas, and orientation behavior.

Google Play policy and target-API deadlines change. Recheck the current Play Console requirements and official policy documentation at release time instead of treating bootstrap-era requirements as permanent.

## 12. When to add native plugins

Keep the app plugin-free while browser APIs provide the required behavior. Add a version-compatible Capacitor plugin only for a concrete native need, such as status/system-bar control, orientation locking, haptics, network-state awareness, or stronger storage durability.

After installing any plugin:

```bash
npm run build
npx cap sync android
```

Inspect the plugin's Android permissions, manifest entries, SDK requirements, privacy implications, and generated native changes. Commit applicable dependency and Android source changes, but continue excluding copied assets, build output, SDK-local paths, and secrets.
