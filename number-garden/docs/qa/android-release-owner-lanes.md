# Android release owner-lane evidence

Checked: 2026-09-06  
Scope: non-secret preparation for NG-AND-012, NG-AND-013, and NG-AND-014. No signing material, private paths, account data, Play Console state, or device identifiers were inspected or recorded.

## NG-AND-012 — upload-key custody

The owner runbook was reviewed. The existing upload key must remain unchanged and outside agent-visible paths and logs. Completion still requires the exact owner acknowledgement covering password-manager custody, two verified encrypted backups in separate owner-controlled locations, plaintext-handoff cleanup, separation from the debug key, and the already documented public-fingerprint match. No signing or upload authority is implied.

## NG-AND-013 — Play setup requirement refresh

Current official Google Play guidance checked on 2026-09-06 confirms:

- Play package names are unique and permanent, so the app record must use `io.github.jdatta.numbergarden` exactly.
- New Play apps use Android App Bundles, and Play App Signing is configured for the first release. Current guidance says new apps are enrolled with Google-generated app-signing keys by default while the developer retains a separate upload key.
- Personal developer accounts created after 2023-11-13 must run a closed test with at least 12 testers continuously opted in for at least 14 days before applying for production access. Live-account applicability must be recorded rather than inferred.
- Google says Play package registration becomes required on 2026-09-30. Play attempts auto-registration, while some packages need manual registration and signing-key proof. Any unexpected ownership or private-key proof step remains an owner pause.

Official sources:

- https://support.google.com/googleplay/android-developer/answer/9859152?hl=en
- https://support.google.com/googleplay/android-developer/answer/9842756?hl=en
- https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB
- https://support.google.com/googleplay/android-developer/answer/16984799?hl=en-GB

No Play Console sign-in, terms acceptance, app creation, package registration, upload, tester invitation, or policy submission occurred. The exact NG-AND-013 acknowledgement remains required.

## NG-AND-014 — artwork inventory

The shipped Android resources are still the generic blue Capacitor placeholder launcher and splash artwork. Representative tracked files and SHA-256 values are:

- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`: `87cb2f2ffe992652bb4fa768c73719a37b5852ab17fbf8e170e888f7a42b0761`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`: `bd24fd383253bf8d43f0a81f11c071d76d1d555114376dd647cd9fb38fa0a9da`
- `android/app/src/main/res/drawable-port-xxxhdpi/splash.png`: `3db071a03b2f8ffe0dfd4170fc59842d53cd15bba5e88af59401d58efabf7827`

`mocks/mock.png` remains visual inspiration only and is not an approved or authoritative release-art source. No source-art proposal has been selected, no ownership has been asserted, and no native resource was changed. NG-AND-014 remains gated on exact source files, hashes, backgrounds, usage rights, and the owner acknowledgement in its runbook.
