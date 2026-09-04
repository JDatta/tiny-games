# NG-AND-016 — Play listing and media approval

## When the orchestrator pauses

Pause before treating listing copy or media as final and before entering/uploading it in Play Console. Final screenshots wait for a signed candidate; preparatory copy and graphics may be reviewed earlier.

## What the owner does

1. Review the title, short description, full description, support details, privacy URL, country scope, and release notes for accuracy and child/family appropriateness.
2. Review the exact 512×512 store icon, 1024×500 feature graphic, and representative phone screenshots.
3. Confirm screenshots come from the candidate, contain no notifications, serials, accounts, debug overlays, or private data, and have meaningful approved alt text.
4. Confirm all claims match actual gameplay and final policy declarations.
5. Approve exact copy and file hashes.

Recheck [Play preview-asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en) and [store-listing best practices](https://support.google.com/googleplay/android-developer/answer/13393723?hl=en) on the approval date. Current official requirements specify a 512×512 app icon and 1024×500 feature graphic; use the live page if that changes.

## What an agent may do

An agent may draft copy/alt text, produce candidate-based screenshots, verify dimensions/format, and prepare upload-ready files. After approval and with a scoped signed-in browser, it may enter/upload only the exact approved content and save the listing draft.

## Prohibited actions

- Do not fabricate features, awards, rankings, endorsements, or privacy claims.
- Do not use QA evidence screenshots with notification clutter or identifiers.
- Do not modify the frozen app to improve a screenshot without reopening `NG-AND-018`.
- Do not publish/promote a release under listing approval.

## Safe evidence to return

Return copy hash, asset filenames/hashes/dimensions, alt-text map, candidate version/commit, owner approval timestamp, and redacted Play draft status.

## Exact acknowledgement

```text
I approve the NG-AND-016 listing copy [HASH/PATH], privacy URL [URL], release notes [HASH/PATH], store icon [FILE + SHA-256], feature graphic [FILE + SHA-256], and screenshot/alt-text manifest [HASH/PATH] for candidate [VERSION, VERSIONCODE, COMMIT]. I authorize an agent to enter/upload only these exact materials and save the listing draft. Any content or candidate change requires review. This does not authorize an AAB upload, tester action, production access, or release. Official asset/listing requirements rechecked: [DATE + URLS].
```
