# NG-AND-014 — source artwork approval

## When the orchestrator pauses

Pause before choosing source art or replacing any tracked launcher, adaptive-icon, or splash asset.

## What the owner does

1. Review the proposed square launcher/adaptive-icon foreground, background color/art, and splash source at full resolution.
2. Confirm ownership/licensing and that no unapproved child image, trademark, or third-party asset is present.
3. Approve exact source-file hashes and intended backgrounds.
4. Review generated previews for adaptive masks/safe zones, legacy icons, light/dark appearance, and Android 12+ splash behavior.

The source approval is the `artwork_approval` external gate. Approval of a concept or screenshot is insufficient; identify the exact files/hashes.

## What an agent may do

Before approval, an agent may inventory placeholders and generate clearly labeled proposals without replacing shipped assets. After approval, it may generate all Android densities, update tracked native resources, and capture device/emulator evidence. It must return for owner review if generation materially changes the approved composition or colors.

## Prohibited actions

- Do not replace native assets before exact source approval.
- Do not assume generated artwork is owned/licensed.
- Do not include private photos, personal data, notification clutter, or device serials in evidence.
- Do not mutate the frozen release candidate after `NG-AND-018`; reopen the freeze if app assets change.

## Safe evidence to return

Return source filenames and SHA-256 hashes, ownership confirmation, approved colors, generated resource paths, mask/safe-zone review, and redacted device/emulator evidence paths.

## Exact acknowledgement

```text
I approve the Number Garden launcher/adaptive-icon/splash source files [FILENAMES] with SHA-256 [HASHES], backgrounds [VALUES], and confirm I have the right to use them. I authorize generation and integration of Android density resources plus device/emulator verification. Any material composition/color change requires new approval. This does not authorize store-listing approval, Play upload, or production. Safe review evidence path: [PATH].
```
