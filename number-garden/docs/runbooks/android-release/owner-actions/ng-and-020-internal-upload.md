# NG-AND-020 — scoped Internal-testing upload

## When the orchestrator pauses

Pause after `NG-AND-019` validates the signed release AAB and before any upload to Play Console. Approval must name the exact file hash, package, version name, and version code.

## What the owner does

1. Review the frozen commit, AAB SHA-256, public upload-certificate fingerprint, package `io.github.jdatta.numbergarden`, `versionName`, and `versionCode`.
2. Confirm policy declarations/listing are ready for Internal testing and the intended tester group is already authorized or separately approved.
3. Decide whether the owner or agent uploads.
4. Approve this one artifact for Internal testing only.

Recheck [Prepare and roll out a release](https://support.google.com/googleplay/android-developer/answer/9859348?hl=en) and [Set up an internal/closed/open test](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en) immediately before upload.

## What an agent may do

With exact approval and a scoped signed-in browser, an agent may upload the named AAB to Internal testing, resolve non-substantive console validation that does not alter the artifact/declarations, review App Bundle Explorer and the pre-launch report, and make the Internal release available to the already approved testers. It must record every warning/finding.

## Prohibited actions

- Do not upload a different hash/version, rebuild after approval, or reuse approval for a replacement.
- Do not upload to closed/open/production tracks.
- Do not invite or add testers without separate named approval.
- Do not accept a signing/package mismatch, suppress a blocking finding, or expose account data.

## Safe evidence to return

Return AAB SHA-256, package/version, frozen commit, public certificate fingerprint, upload timestamp, Internal release status, App Bundle Explorer result, pre-launch finding summary, and redacted evidence paths.

## Exact acknowledgement

```text
I authorize one NG-AND-020 upload to Google Play Internal testing only: file [BASENAME], SHA-256 [HASH], package io.github.jdatta.numbergarden, versionName [VALUE], versionCode [VALUE], frozen commit [COMMIT], public upload-certificate fingerprint [FINGERPRINT]. The approved tester scope is [EXISTING GROUP/SEPARATE APPROVAL]. The agent may upload this exact artifact, review validation/App Bundle Explorer/pre-launch results, and make only this Internal release available. Any changed hash/version or other track requires new approval. This does not authorize new testers, closed/open testing, production access, or production release.
```
