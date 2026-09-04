# NG-AND-012 — upload-key custody and backups

## When the orchestrator pauses

Pause before inspecting signing configuration or attempting any release-signed build. This action is performed by the owner outside agent-visible logs and chat.

## What the owner does

1. Put the existing upload-key password in an owner-controlled password manager.
2. Create two encrypted backups of the existing keystore in separate owner-controlled locations.
3. Verify both backups are readable and recoverable without changing the key.
4. Confirm the key remains distinct from the Android debug key.
5. Remove the temporary plaintext handoff only after both backup checks pass.

Do not generate a replacement upload key. The existing public certificate fingerprint may be compared to the already documented fingerprint, but private material and its path must stay out of the repository, tracker, evidence, commands, screenshots, and conversation.

## What an agent may do

An agent may explain the checklist, inspect only secret-free Gradle wiring after custody is confirmed, and compare a public certificate fingerprint. It may not open the keystore, ask for passwords/paths, move backup files, or operate the password manager.

## Prohibited actions

- Never paste a password, keystore path, private key, recovery code, password-manager screenshot, or backup location into chat or Git.
- Never use the debug key as the upload key.
- Never delete the plaintext handoff before both encrypted backups are verified.
- Never create, rotate, or replace signing material merely to make a build pass.

## Safe evidence to return

Return only yes/no confirmation of password-manager custody, two verified encrypted backups, plaintext cleanup, debug-key separation, and (optionally) the public certificate fingerprint match. No storage locations.

## Exact acknowledgement

```text
I confirm custody of the existing Number Garden upload key: password-manager entry [CONFIRMED]; encrypted backup 1 recoverability [VERIFIED]; encrypted backup 2 recoverability [VERIFIED]; backups are in separate owner-controlled locations [CONFIRMED]; temporary plaintext handoff removed [CONFIRMED]; upload key remains separate from the debug key [CONFIRMED]; documented public fingerprint match [PASS]. I authorize NG-AND-012 to be evidenced without recording any secret or private path. This does not authorize signing, upload, key replacement, or Play Console changes.
```
