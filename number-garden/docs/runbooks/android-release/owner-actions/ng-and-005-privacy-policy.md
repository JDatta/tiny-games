# NG-AND-005 — privacy-policy approval and publication

## When the orchestrator pauses

Pause after the `NG-AND-004` traffic audit and an evidence-aligned draft are complete, before accepting the policy text, publishing it, or adding its final URL to the app.

## What the owner does

1. Review the draft against the recorded cold-launch, declined, granted, gameplay, withdrawal, and offline traffic evidence.
2. Confirm publisher identity, support contact, intended ages 3–8, countries, analytics purpose/data handling, retention/deletion language, and the effective date.
3. Obtain legal advice if desired; the agent cannot certify legal compliance.
4. Approve an owner-controlled public HTTPS location and publish the exact approved text.
5. Open the final URL in a signed-out/private browser and verify it is public, readable on mobile, stable, and not behind a login.
6. Authorize the exact URL for the in-app Settings link and later Play listing.

Google currently requires a privacy-policy link both in the Play listing and inside an app targeting children. Recheck the [Play app-review guidance](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en) and [Families policy](https://support.google.com/googleplay/android-developer/answer/9893335?hl=en) on the approval date.

## What an agent may do

After the acknowledgement below, an agent may publish the already approved text to the named owner-controlled location if the owner has provided a scoped, signed-in browser session; verify HTTPS/public access; and implement/test the exact final link. The agent may not alter the approved substance while publishing.

## Prohibited actions

- Do not publish placeholders, guesses, or a policy that predates the traffic audit.
- Do not create a new hosting account, domain, or paid service without separate approval.
- Do not expose account tokens, analytics identifiers beyond the already public tag ID, private traffic payloads, or device serials.
- Do not make gameplay depend on the policy host being online.

## Safe evidence to return

Return the public HTTPS URL, policy content hash/effective date, approval timestamp, signed-out/mobile availability result, and paths to redacted accessibility/link tests. Do not return browser cookies or account screenshots containing private data.

## Exact acknowledgement

```text
I approve the Number Garden privacy policy content hash [SHA-256] dated [DATE] for publication at [HTTPS URL]. I confirm that it matches the NG-AND-004 traffic evidence and authorize an agent to [PUBLISH THE APPROVED TEXT / VERIFY OWNER-PUBLISHED TEXT] and add this exact URL to the app and Play listing. This approval does not authorize other website, analytics, Play Console, upload, or production changes. Safe evidence path: [PATH].
```
