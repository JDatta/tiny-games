# NG-AND-015 — Play policy declarations

## When the orchestrator pauses

Pause after analytics/privacy implementation, WebView traffic evidence, the public policy, and Play app setup are complete, but before saving or submitting Families, Data safety, Ads, App access, target-audience, country, category, or IARC answers.

## What the owner does

1. Review a proposed answer sheet tied to the exact candidate behavior and traffic audit.
2. Confirm intended ages 3–8, all selected Play-supported countries/territories, App → Education, no ads, no in-app purchases, and unrestricted/no-login access remain accurate.
3. Review every Data safety data type/purpose/sharing/retention answer, including behavior of Google Analytics after parent/guardian consent and every third-party component.
4. Complete the IARC questionnaire from actual content; do not preselect a rating.
5. Confirm the live policy requirements and console questions were rechecked on the action date.
6. Approve exact proposed answers or enter them personally.

Google makes the developer responsible for complete declarations, including third-party code. Recheck [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en), [Target audience and app content](https://support.google.com/googleplay/android-developer/answer/9867159?hl=en), [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en), and [Prepare an app for review](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en) at this gate.

## What an agent may do

An agent may prepare a source/evidence-backed answer sheet. With the acknowledgement below and a scoped signed-in browser session, it may enter and save those exact answers. It must pause if the console wording/options differ, an answer requires judgment not covered by the sheet, or the console action would publish/promote a release.

## Prohibited actions

- Do not infer “no data collected” solely from source inspection or consent defaults.
- Do not select an older audience to evade Families requirements.
- Do not answer around analytics, WebView storage, or third-party code.
- Do not submit an artifact, invite testers, apply for production access, or start production.

## Safe evidence to return

Return the dated answer-sheet hash, exact source/artifact commit, official pages and check date, saved/completed section status, and redacted evidence paths. Omit account IDs, cookies, and private traffic payloads.

## Exact acknowledgement

```text
I approve the NG-AND-015 Play declaration answer sheet [SHA-256/PATH] for Number Garden commit [COMMIT], based on traffic evidence [PATH] and privacy policy [URL + HASH]. I confirm ages 3–8, countries [SCOPE], App → Education, no ads, no IAP, and unrestricted/no-login access. I authorize an agent to enter and save only these exact Families, Data safety, Ads, App access, target-audience, country, category, and IARC answers. Pause on any changed question or discrepancy. This does not authorize upload, tester changes, production access, or release. Official requirements rechecked: [DATE + URLS].
```
