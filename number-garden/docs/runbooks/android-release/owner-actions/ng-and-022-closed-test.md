# NG-AND-022 — closed-test applicability and production access

## When the orchestrator pauses

Pause after Play app setup reveals the owner account’s live testing requirement and before creating a closed track, adding testers, starting the required duration, or applying for production access.

## What the owner does

1. Record whether the live account is subject to a mandatory closed test.
2. If it is not required, capture safe Console evidence and approve `NG-AND-022` as not applicable.
3. If required, recheck the current minimum tester count, uninterrupted opt-in duration, and application questions in the live official guidance.
4. Select and obtain consent from appropriate real testers. The owner coordinates people; no agent may recruit or contact them autonomously.
5. Approve the exact tester group/track and communication plan.
6. Keep dated opt-in/duration/feedback evidence, review changes from feedback, and approve the final production-access application answers.

The current official rule applies to certain personal accounts created after 13 November 2023 and currently states at least 12 continuously opted-in testers for 14 days. Treat those numbers as time-sensitive and account-specific; recheck [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) and [Set up a test](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en) at the gate.

## What an agent may do

After scoped approval, an agent in a signed-in browser may configure the named closed track/list, enter owner-provided tester addresses or group, monitor non-sensitive counts/dates, collate feedback, and draft the production-access application. A second owner acknowledgement is required before submitting the application.

## Prohibited actions

- Do not assume the requirement from account age; use live Console evidence.
- Do not invent testers, scrape addresses, contact people, or add anyone without consent.
- Do not fake opt-in duration, engagement, feedback, or readiness answers.
- Do not upload a replacement artifact without the NG-AND-023 version/freeze loop.
- Do not submit production access or production release without the exact applicable approval.

## Safe evidence to return

Return applicability, official check date/URLs, track name, aggregate tester count (not addresses), start/end dates, feedback summary, changes/evidence paths, and Console outcome. Store tester identities only in an owner-controlled location, not Git/tracker/chat.

## Exact acknowledgement — not required

```text
I reviewed the live Play Console requirement for Number Garden on [DATE]. A mandatory closed test/production-access application is not required for this owner account: [CONFIRMED]. I authorize NG-AND-022 to be marked not_applicable with safe Console evidence at [PATH]. This does not authorize production release.
```

## Exact acknowledgement — required test setup

```text
I confirm the live NG-AND-022 requirement checked on [DATE + OFFICIAL URLS]: [COUNT] testers continuously opted in for [DURATION]. I authorize creation/use of closed track [NAME] for owner-approved tester group [NONSECRET LABEL] and artifact [VERSION, VERSIONCODE, SHA-256]. Testers have been or will be contacted by the owner and consent to participate. The agent may configure and monitor this exact test and collate feedback, but may not add other testers, upload another artifact, or apply for production access without a new acknowledgement.
```

## Exact acknowledgement — production-access application

```text
I approve the NG-AND-022 production-access application answer sheet [HASH/PATH] based on closed-test dates [START–END], aggregate eligible testers [COUNT], feedback evidence [PATH], remediations [PATH], and candidate [VERSION, VERSIONCODE, SHA-256]. I authorize submission of this application only. This does not authorize a production release.
```
