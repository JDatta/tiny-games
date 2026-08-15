# Number Garden — Linux Bootstrap Plan for Codemagic iOS

## Purpose

Execute this plan from the `number-garden` project directory on Linux. This project currently lives in the `JDatta/tiny-games` Git repository.

The goal is to prepare the existing self-contained HTML game for an **initial unsigned iOS simulator build on Codemagic** using Capacitor, without requiring Xcode or macOS locally.

This plan must:

1. Inspect the existing repository before changing anything.
2. Add the minimal Node/Capacitor dependencies.
3. Add a reproducible web build that copies the existing self-contained `index.html` into `dist/`.
4. Add Capacitor configuration for the iOS application.
5. Add a repository-root `codemagic.yaml` workflow that targets this project, creates the native iOS project on Codemagic's macOS runner, and performs an unsigned simulator build.
6. Update `.gitignore`.
7. Create `docs/exec-plans/code-magic-next-steps.md` containing the manual Codemagic/Apple steps that cannot be completed from Linux.
8. Run local validation where possible.
9. Do **not** commit or push anything unless explicitly asked separately.

---

## Constraints

- The existing browser/GitHub Pages version must continue to work.
- Treat the project-root `index.html` as the canonical game implementation.
- Do not rewrite the game or split the HTML/JS/CSS.
- Do not add Ionic, React, Vue, Vite, or another frontend framework.
- Do not create an iOS project locally. The first `ios/` project will be generated in Codemagic.
- Do not configure Apple signing yet.
- Do not put Apple credentials, certificates, API keys, or secrets in the repository.
- Do not change GitHub Pages configuration.
- Prefer minimal changes.
- Preserve any existing `package.json`, `.gitignore`, or repository conventions rather than overwriting them blindly.
- If a required filename already exists, inspect it and merge the required changes instead of replacing unrelated content.

---

## Target architecture

After this plan is executed, the relevant files should look approximately like this:

```text
tiny-games/
├── codemagic.yaml
└── number-garden/
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── capacitor.config.json
    ├── .gitignore
    └── docs/
        └── exec-plans/
            └── code-magic-next-steps.md
```

Generated directories should **not** be committed yet:

```text
dist/
ios/
```

The initial CI flow will be:

```text
index.html
   ↓ npm run build
dist/index.html
   ↓
npx cap add ios
   ↓
ios/App/App.xcodeproj
   ↓
xcodebuild on Codemagic macOS runner
   ↓
unsigned iOS Simulator .app
```

---

# Execution Plan

## 1. Inspect the repository

Before modifying files:

```bash
pwd
git status --short
find . -maxdepth 2 -type f | sort
```

Inspect at minimum:

```bash
sed -n '1,220p' package.json 2>/dev/null || true
sed -n '1,220p' .gitignore 2>/dev/null || true
sed -n '1,120p' index.html
```

Confirm that:

- `index.html` exists at the Number Garden project root.
- The game is self-contained, or identify any local assets referenced from `index.html`.
- Existing uncommitted user changes are not overwritten.

If `index.html` does not exist, stop and report the problem rather than inventing a replacement.

---

## 2. Verify Node/npm

Check:

```bash
node --version
npm --version
```

If Node/npm are unavailable, stop and tell the user what is missing.

Do not install Node using `sudo` or modify the operating system package manager automatically.

---

## 3. Initialize or preserve the npm project

If `package.json` does not exist:

```bash
npm init -y
```

If it already exists, preserve it.

Then install Capacitor dependencies:

```bash
npm install @capacitor/core @capacitor/ios
npm install --save-dev @capacitor/cli
```

This should update/create both:

```text
package.json
package-lock.json
```

Do not use global Capacitor installs.

---

## 4. Add the web build script

The current app is a self-contained `index.html`, so the build should simply stage it into `dist/`.

Ensure `package.json` contains this script:

```json
{
  "scripts": {
    "build": "rm -rf dist && mkdir -p dist && cp index.html dist/index.html"
  }
}
```

Merge it into any existing `scripts` object; do not delete existing scripts.

If repository inspection showed additional **local runtime assets** referenced by `index.html`, extend the build script to copy only those required assets into `dist/` while preserving their relative paths.

Do not copy repository metadata, docs, `.git`, or unrelated files into `dist/`.

---

## 5. Create `capacitor.config.json`

Create this file at the Number Garden project root unless an existing Capacitor config already exists:

```json
{
  "appId": "io.github.jdatta.numbergarden",
  "appName": "Number Garden",
  "webDir": "dist"
}
```

If a Capacitor config already exists, preserve compatible existing settings and ensure these three values are correct.

Important:

- Do **not** add `server.url`.
- Production must use the HTML bundled into the app rather than load the GitHub Pages URL remotely.

---

## 6. Update `.gitignore`

Ensure these entries exist exactly once:

```gitignore
dist/
ios/
```

Preserve all existing ignore rules.

`ios/` is intentionally generated by Codemagic during the initial bootstrap phase.

A later workflow may choose to commit `ios/` once native customization is required.

---

## 7. Create the initial `codemagic.yaml`

Create `codemagic.yaml` at the `tiny-games` Git repository root with an **unsigned simulator smoke build only**. The `working_directory` entry is required because Number Garden is a project within that repository:

```yaml
workflows:
  ios-smoke:
    name: Number Garden - iOS Smoke Build
    instance_type: mac_mini_m2
    max_build_duration: 30
    working_directory: number-garden

    environment:
      node: 22
      xcode: latest

    scripts:
      - name: Install dependencies
        script: |
          npm ci

      - name: Build web app
        script: |
          npm run build

      - name: Generate Capacitor iOS project
        script: |
          rm -rf ios
          npx cap add ios
          npx cap sync ios

      - name: Build unsigned iOS Simulator app
        script: |
          xcodebuild build \
            -project ios/App/App.xcodeproj \
            -scheme App \
            -sdk iphonesimulator \
            -destination 'generic/platform=iOS Simulator' \
            -configuration Debug \
            CODE_SIGN_IDENTITY="" \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGNING_ALLOWED=NO

    artifacts:
      - $HOME/Library/Developer/Xcode/DerivedData/**/Build/Products/Debug-iphonesimulator/*.app
      - /tmp/xcodebuild_logs/*.log
```

Do not add App Store Connect integration, signing, TestFlight publishing, or secrets yet.

The purpose of this workflow is only to prove:

1. Codemagic can read the repository.
2. npm dependencies install correctly.
3. Capacitor can generate the native iOS project on macOS.
4. Xcode can compile the game as an unsigned simulator application.









## 8. Document the next steps plan

Use the already drafted `plans/Codemagic-iOS-Manual-Next-Steps.md` as the source for the required deliverable:

```text
docs/exec-plans/code-magic-next-steps.md
```

Update repository-specific details while staging it. In particular, this game is in the `number-garden/` subdirectory of the `JDatta/tiny-games` repository, so the root workflow must set `working_directory: number-garden`.








## 9. Local validation

Run:

```bash
npm ci
npm run build
```

Verify:

```bash
test -f dist/index.html
test -f capacitor.config.json
test -f ../codemagic.yaml
test -f docs/exec-plans/code-magic-next-steps.md
```

Inspect dependency visibility:

```bash
npm ls @capacitor/core @capacitor/ios @capacitor/cli
```

Optionally validate JSON syntax:

```bash
node -e "JSON.parse(require('fs').readFileSync('capacitor.config.json', 'utf8')); console.log('capacitor.config.json OK')"
```

If Python/PyYAML happens to be available, YAML syntax may be checked, but do not install PyYAML just for validation.

Do **not** run:

```bash
npx cap add ios
```

on Linux as part of this plan.

The native iOS project is intentionally created by Codemagic.

---

## 10. Review the final diff

Run:

```bash
git status --short
git diff -- ../codemagic.yaml . ':!package-lock.json'
```

Also inspect the lockfile presence:

```bash
ls -lh package-lock.json
```

Confirm that:

- `index.html` was not unintentionally modified.
- Existing GitHub Pages behavior is unaffected.
- No secrets were added.
- `dist/` and `ios/` are ignored.
- `codemagic.yaml` is at repository root.
- `docs/exec-plans/code-magic-next-steps.md` exists.
- `package-lock.json` is present so Codemagic can use `npm ci`.

---

# Acceptance Criteria

The task is complete when all of the following are true:

- [ ] `npm ci` succeeds on Linux.
- [ ] `npm run build` produces `dist/index.html`.
- [ ] `@capacitor/core` is a production dependency.
- [ ] `@capacitor/ios` is a production dependency.
- [ ] `@capacitor/cli` is a development dependency.
- [ ] `capacitor.config.json` uses app ID `io.github.jdatta.numbergarden`.
- [ ] `capacitor.config.json` uses app name `Number Garden`.
- [ ] `capacitor.config.json` uses `dist` as `webDir`.
- [ ] No `server.url` is configured.
- [ ] `codemagic.yaml` contains the unsigned `ios-smoke` workflow.
- [ ] The Codemagic workflow generates `ios/` itself.
- [ ] The Codemagic workflow performs an unsigned iOS Simulator build.
- [ ] `.gitignore` ignores both `dist/` and `ios/`.
- [ ] `docs/exec-plans/code-magic-next-steps.md` exists and contains the manual Codemagic/Apple steps.
- [ ] Existing game behavior/source is unchanged.
- [ ] Existing GitHub Pages publishing remains unchanged.
- [ ] No Apple/Codemagic secrets exist in tracked files.
- [ ] No commit or push was performed automatically.

---

## Final response expected from Codex

After executing the plan, report concisely:

1. Files created.
2. Files modified.
3. Capacitor versions installed.
4. Local validation commands run and whether they passed.
5. Any assumptions or deviations.
6. The exact next manual action, which should normally be to review/commit/push and then follow `docs/exec-plans/code-magic-next-steps.md`.
