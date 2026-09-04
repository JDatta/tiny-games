# NG-AND-024 — production archive, approval, and monitoring

## When the orchestrator pauses

Pause after Play-delivered QA, any closed-test requirement, and remediation are complete, before creating/submitting a production release or changing rollout state. Always obtain a fresh approval; no prior Play/upload approval carries forward.

## What the owner does

1. Review the release archive: exact commit, AAB SHA-256, package/version, public certificate fingerprint, QA report, policy/listing versions, release notes, Play-delivered evidence, accepted risks, and monitoring plan.
2. Recheck current Play/Families requirements and verify there are no unresolved Console errors or P0/P1 defects.
3. Review the exact production countries and availability.
4. Review what the live Console offers for the first production release.
5. Approve the exact production action and explicit stop criteria.

Important: Google’s current documentation says percentage-based staged rollout is available for updates, not an app’s first production publication. For a first release, “Start rollout to production” can publish to all selected countries. Recheck [Prepare and roll out a release](https://support.google.com/googleplay/android-developer/answer/9859348?hl=en) and [Staged rollouts](https://support.google.com/googleplay/android-developer/answer/6346149?hl=en) immediately before approval. If a staged percentage is unavailable, do not reinterpret a “staged rollout” approval as permission for full first-publication; the acknowledgement must explicitly authorize the live action.

## What an agent may do

After the exact acknowledgement, an agent in a scoped signed-in browser may create/review the production release from the named artifact, enter approved notes/countries, and perform only the exact authorized submission/rollout action. It may monitor Android vitals, crashes/ANRs, reviews, policy messages, and rollout state at the approved cadence, and halt an eligible rollout when an approved stop criterion is met.

## Prohibited actions

- Do not reuse Internal, closed-test, production-access, or old production approval.
- Do not submit a different artifact/version/country scope.
- Do not treat first-release full publication as a staged percentage.
- Do not expand a rollout percentage, resume a halted rollout, or publish after material findings without new approval.
- Do not hide policy messages, crashes, ANRs, severe reviews, or accepted risks.

## Safe evidence to return

Return the archive manifest/hash, exact artifact/version/commit, approved countries/action, approval timestamp, Play status, monitoring snapshots/summaries, stop criteria, and any halt/remediation decision. Omit account identifiers and user-level data.

## Exact acknowledgement — first production publication

```text
I reviewed the NG-AND-024 archive [HASH/PATH] for Number Garden artifact [VERSION, VERSIONCODE, AAB SHA-256], commit [COMMIT], countries [SCOPE], release notes [HASH/PATH], QA/policy/listing evidence [PATHS], and accepted risks [NONE or PATH]. The live Console does not offer a percentage-staged first release: [CONFIRMED]. I explicitly authorize [START FIRST PRODUCTION ROLLOUT TO ALL SELECTED COUNTRIES / SUBMIT FOR REVIEW WITH MANAGED PUBLICATION AS SPECIFIED]. Monitor [CADENCE] for [PERIOD]. Stop/escalate on [EXACT CRASH, ANR, POLICY, REVIEW, OR FUNCTIONAL CRITERIA]. No artifact, country, or action change is authorized.
```

## Exact acknowledgement — staged update rollout

```text
I reviewed the NG-AND-024 archive [HASH/PATH] for Number Garden update artifact [VERSION, VERSIONCODE, AAB SHA-256], commit [COMMIT], countries [SCOPE], release notes [HASH/PATH], QA/policy/listing evidence [PATHS], and accepted risks [NONE or PATH]. I authorize a staged production update at [PERCENT]% only. Monitor [CADENCE] for [PERIOD]. Halt/escalate on [EXACT CRASH, ANR, POLICY, REVIEW, OR FUNCTIONAL CRITERIA]. Increasing/resuming the rollout or changing artifact/countries requires new approval.
```
