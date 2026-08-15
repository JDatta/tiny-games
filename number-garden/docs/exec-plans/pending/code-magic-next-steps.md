# Codemagic iOS — Manual Next Steps

This document starts after the Linux bootstrap has been committed and pushed to GitHub.

At this stage the repository should already contain:

- `package.json`
- `package-lock.json`
- `capacitor.config.json`
- `codemagic.yaml`
- the existing `index.html`

The first objective is to get an **unsigned iOS Simulator build** working in Codemagic. Do not configure Apple signing until that succeeds.

## Phase 1 — Commit and push the Linux bootstrap

Review the local changes:

```bash
git status
git diff
```

Expected new/modified files include:

```text
package.json
package-lock.json
capacitor.config.json
codemagic.yaml
.gitignore
docs/exec-plans/code-magic-next-steps.md
```

Verify locally:

```bash
npm ci
npm run build
test -f dist/index.html
```

Then commit and push using the repository's normal Git workflow.

## Phase 2 — Add the repository to Codemagic

1. Sign in to Codemagic.
2. Choose **Add application**.
3. Connect/authorize the GitHub integration if it is not already connected.
4. Give Codemagic access to the `JDatta/tiny-games` repository.
5. Select the `tiny-games` repository.
6. Finish adding the application.

The repository does not need an Xcode project checked in. The `ios-smoke` workflow generates it on the Codemagic macOS runner using:

```bash
npx cap add ios
npx cap sync ios
```

The repository-root workflow sets `working_directory: number-garden`, so its scripts run inside this project automatically.

## Phase 3 — Make Codemagic detect the YAML workflow

In the Codemagic application:

1. Select the branch containing the bootstrap changes.
2. Choose **Check for configuration file** / scan the branch.
3. Confirm Codemagic finds the root-level `codemagic.yaml`; its `working_directory` setting targets `number-garden`.
4. Confirm the workflow appears as:

```text
Number Garden - iOS Smoke Build
```

If Codemagic asks for a project type during repository onboarding, choose the closest Capacitor/Ionic option if offered; the YAML file is authoritative for the actual build.

## Phase 4 — Run the unsigned smoke build

Start:

```text
ios-smoke
```

Expected build stages:

```text
npm ci
npm run build
npx cap add ios
npx cap sync ios
xcodebuild ... iphonesimulator
```

Success criteria:

- `npm ci` succeeds.
- `dist/index.html` is created.
- Capacitor creates `ios/App/App.xcodeproj`.
- `xcodebuild` completes successfully.
- Codemagic exposes a simulator `.app` artifact.

This `.app` is for the iOS Simulator. It is **not** intended for installation on a physical iPhone.

If the smoke build fails, fix that failure before setting up signing.

## Phase 5 — Apple Developer prerequisites

Only after the unsigned smoke build succeeds:

1. Enroll in the Apple Developer Program if not already enrolled.
2. In Apple Developer, register an explicit App ID using:

```text
io.github.jdatta.numbergarden
```

3. In App Store Connect, create the app record:
   - Platform: iOS
   - Name: Number Garden
   - Bundle ID: `io.github.jdatta.numbergarden`
   - SKU: any stable internal value, for example `number-garden-ios`

Do not change the bundle ID casually after this point.

## Phase 6 — Connect Codemagic to App Store Connect

Create an App Store Connect API key with sufficient permission for Codemagic publishing/signing.

Record:

- Issuer ID
- Key ID
- downloaded `.p8` private key

Store the key only in Codemagic/secure credential storage. Never commit it to Git.

Add the App Store Connect integration in Codemagic Team settings.

Then configure or generate:

- Apple Distribution certificate
- App Store provisioning profile for `io.github.jdatta.numbergarden`

Codemagic can manage/fetch signing files once the App Store Connect integration exists.

## Phase 7 — Add a signed TestFlight workflow

After signing is configured, replace or supplement `ios-smoke` with a separate release workflow.

Keep the smoke workflow if useful; do not make every CI build publish to TestFlight.

The release workflow should eventually contain:

```yaml
integrations:
  app_store_connect: <integration-name>

environment:
  ios_signing:
    distribution_type: app_store
    bundle_identifier: io.github.jdatta.numbergarden
```

Before building the IPA, run:

```bash
xcode-project use-profiles
```

Then build a signed IPA from:

```text
ios/App/App.xcodeproj
```

using scheme:

```text
App
```

Finally configure App Store Connect publishing/TestFlight.

Do not add secret values directly to `codemagic.yaml`.

## Phase 8 — Test on the real iPhone

Once the signed build reaches TestFlight:

1. Add yourself as an internal tester.
2. Install TestFlight on the iPhone.
3. Install Number Garden.
4. Test at minimum:
   - first launch
   - game interaction/touch targets
   - orientation
   - audio
   - reload/relaunch
   - IndexedDB persistence across app restarts
   - offline launch
   - safe areas around notch/Dynamic Island/home indicator
   - text sizing
   - links or browser navigation, if any

Do not assume Chrome/Linux behavior guarantees identical WKWebView behavior.

## Phase 9 — Decide when to commit `ios/`

The bootstrap intentionally regenerates `ios/` in CI.

That is acceptable while Number Garden has no native customization.

Once native changes become necessary—for example:

- app icon
- launch screen
- native capabilities
- native plugins
- Info.plist changes
- orientation rules
- Xcode project settings

change strategy:

1. Generate the Capacitor iOS project on a macOS environment.
2. Commit `ios/` to Git.
3. Remove `ios/` from `.gitignore`.
4. Change Codemagic from:

```bash
npx cap add ios
```

to:

```bash
npx cap sync ios
```

From that point forward, treat the native iOS project as source code.

## Final release readiness

Before App Store submission, separately review:

- app icon and screenshots
- privacy declarations, including the optional Google Analytics request
- App Store metadata
- age rating
- support/privacy URLs
- Apple's minimum-functionality requirements
- storage durability and whether IndexedDB alone is sufficient
- production version/build numbering
