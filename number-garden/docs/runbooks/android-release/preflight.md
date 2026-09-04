# Android release owner preflight

This is a hard gate. Complete it on the Lenovo 20DSA0FV00 before starting the agentic Android release orchestrator. Do not postpone the BIOS change until an agent session is running.

The goal is to prove that the host can run one accelerated Android emulator at a time, the required test images exist, the OPPO can be tested outside the restricted sandbox, and the orchestrator can make local Git checkpoints. Ask for help at any failed step; do not work around a failure with an unaccelerated emulator or an unrestricted agent sandbox.

## 1. Enable Intel virtualization in BIOS/UEFI

1. Save your work and shut down or restart the Lenovo.
2. At the Lenovo logo, press `F1` repeatedly to enter BIOS/UEFI Setup.
3. Find the CPU or Security virtualization setting. Enable **Intel Virtualization Technology** or **Intel VT-x**.
4. Save changes and exit, usually with `F10`, then allow a full reboot.

VT-d is not required for the Android Emulator. Do not change unrelated BIOS options.

After login, verify the CPU flag:

```bash
lscpu | rg -w vmx
```

The output must contain `vmx`. If it does not, stop and recheck the BIOS setting.

Official reference: [Configure hardware acceleration for the Android Emulator](https://developer.android.com/studio/run/emulator-acceleration).

## 2. Verify KVM access after a fresh login

Run:

```bash
stat /dev/kvm
id -nG
/home/jd/Android/Sdk/emulator/emulator -accel-check
```

Confirm all of the following:

- `/dev/kvm` exists.
- The current, freshly logged-in account’s group list contains `kvm`.
- `emulator -accel-check` reports that KVM is installed and usable.

If the owner was just added to the `kvm` group, log out completely and log back in before retesting. Do not use a permission-changing shortcut that makes `/dev/kvm` globally writable.

## 3. Install the SDK command-line tools and images

Use Android Studio’s SDK Manager or the official command-line tools under `/home/jd/Android/Sdk`. Confirm `sdkmanager` and `avdmanager` are available, accept the official SDK licenses, and install:

```text
platform-tools
emulator
cmdline-tools;latest
platforms;android-24
platforms;android-30
platforms;android-36
system-images;android-24;google_apis;x86
system-images;android-30;google_apis;x86_64
system-images;android-36;google_apis;x86_64
```

Do not substitute a Play Store image or ARM image without updating the QA matrix and recording why.

## 4. Create and cold-boot the three AVDs

Create exactly these AVDs:

| AVD | Hardware profile | Image |
| --- | --- | --- |
| `NumberGarden_API24` | Pixel 2 | Google APIs API 24 x86 |
| `NumberGarden_API30` | Pixel 5 | Google APIs API 30 x86_64 |
| `NumberGarden_API36` | Pixel 6 | Google APIs API 36 x86_64 |

List them with:

```bash
/home/jd/Android/Sdk/emulator/emulator -list-avds
```

Cold-boot each AVD once with snapshots disabled. Start only one, wait for the Android home screen, verify ADB sees a booted emulator, then close it before starting the next:

```bash
/home/jd/Android/Sdk/emulator/emulator @NumberGarden_API24 -no-snapshot
/home/jd/Android/Sdk/emulator/emulator @NumberGarden_API30 -no-snapshot
/home/jd/Android/Sdk/emulator/emulator @NumberGarden_API36 -no-snapshot
```

This host has two CPU cores and about 11 GiB RAM. Never run two AVDs concurrently. Record non-sensitive configuration and boot results in the QA report; do not commit emulator data directories.

## 5. Authorize the OPPO outside the restricted sandbox

1. Enable Developer options and USB debugging on the OPPO.
2. Connect it by USB, unlock it, and accept the computer authorization prompt.
3. With no emulator running, use the Android SDK `adb` outside the restricted project sandbox to confirm the device is authorized and online.
4. Verify its model/API and a harmless shell command.

The ADB device list displays a serial. Look at it only long enough to confirm authorization. Do not copy it into chat, commands, screenshots, tracker state, evidence, or Git. Evidence should say only “one authorized OPPO NE2211 detected.”

## 6. Grant narrow Git checkpoint access

The repository root is `/home/jd/workspace/tiny-games`, while the project is its `number-garden` child. The current project-only sandbox cannot write `/home/jd/workspace/tiny-games/.git` and therefore cannot create worktrees or checkpoint commits.

Configure the orchestrator so it may write the repository’s exact Git directory and approved sibling worktree paths. Verify:

```bash
test -w /home/jd/workspace/tiny-games/.git
git -C /home/jd/workspace/tiny-games/number-garden status --short --branch
```

Do not grant blanket filesystem access and do not use `--dangerously-bypass-approvals-and-sandbox`.

## 7. Note bundletool status

`bundletool` was absent when this runbook was written. That is not a startup blocker. Before `NG-AND-019`, install the then-current release from the [official Google bundletool repository](https://github.com/google/bundletool/releases), record its version and SHA-256/source, and use the [official bundletool guide](https://developer.android.com/tools/bundletool). Do not silently download a third-party build.

## Evidence to return

Return only pass/fail facts, versions, AVD names/configurations, and safe evidence paths. Do not return the OPPO serial, secrets, account details, private signing paths, or full environment dumps.

## Exact acknowledgement

Copy this text and replace each bracketed value:

```text
I completed the Number Garden Android release preflight on the Lenovo 20DSA0FV00. VT-x/vmx: [PASS]. /dev/kvm: [PASS]. Fresh-login kvm group: [PASS]. emulator -accel-check: [PASS]. NumberGarden_API24 Pixel 2/API 24 Google APIs x86 cold boot: [PASS]. NumberGarden_API30 Pixel 5/API 30 Google APIs x86_64 cold boot: [PASS]. NumberGarden_API36 Pixel 6/API 36 Google APIs x86_64 cold boot: [PASS]. Only one AVD ran at a time: [CONFIRMED]. OPPO USB ADB authorization outside the restricted sandbox: [PASS; serial not recorded]. Write access to /home/jd/workspace/tiny-games/.git: [PASS]. bundletool: [DEFERRED UNTIL NG-AND-019 or VERSION + OFFICIAL SOURCE]. Safe evidence paths: [PATHS]. I authorize activation of the local orchestrator only; this is not permission to use signing secrets, mutate Play Console, upload an artifact, invite testers, push commits, or submit production.
```
