# NG-AND-013 — Play account verification and app setup

## When the orchestrator pauses

Pause before signing in to Play Console, accepting terms, creating the app, registering the package, proving package ownership, or enabling Play App Signing.

## What the owner does

1. Verify the intended Play developer account and required contact/identity details.
2. Confirm the app record will be named Number Garden and use immutable package `io.github.jdatta.numbergarden`.
3. Confirm App → Education, free, no ads, no in-app purchases, and the previously selected owner/support identity remain intended.
4. Review and accept any applicable Play terms personally when the console requires owner acceptance.
5. Determine from the live account whether a closed-test/production-access requirement applies.
6. Decide whether the owner will perform the steps or authorize a scoped signed-in browser session for the agent.

Package names are unique/permanent in Play. New apps use Android App Bundles and configure Play App Signing. Recheck [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en), [Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en), and the current [developer verification guidance](https://support.google.com/googleplay/android-developer/answer/16471116?hl=en) before acting.

## What an agent may do

After exact authorization, an agent in the owner’s signed-in browser may create this one app record, enter the approved non-secret setup values, navigate the package-registration flow, and record whether the account requires closed testing. It must pause for terms, identity verification, any private-key proof, unexpected package-ownership prompt, payment, or destructive choice.

## Prohibited actions

- Do not create another developer account or app/package record.
- Do not change the package name.
- Do not upload an AAB, invite testers, complete policy declarations, or submit any release under this approval.
- Do not expose account details, verification documents, private signing material, or browser session data.

## Safe evidence to return

Return app-record existence, package name, Play App Signing state, account testing-requirement applicability, safe timestamps, and redacted evidence paths. Do not return account IDs or private verification artifacts.

## Exact acknowledgement

```text
I authorize NG-AND-013 in my signed-in Play Console for one app record only: Number Garden, package io.github.jdatta.numbergarden, App → Education, free. The agent may [CREATE AND CONFIGURE / VERIFY OWNER-CREATED] the app, record Play App Signing state, and determine closed-test applicability. The agent must pause for terms, identity/private-key proof, payment, or any unexpected ownership prompt. This does not authorize an artifact upload, tester invitation, policy submission, production-access application, or production release. Safe evidence path: [PATH].
```
