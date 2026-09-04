# Security

## Trust boundaries

The game is a public client-only web application that can run from a local file or static server. It has no accounts, authentication service, application backend, or cloud learner-data store. The Android shell packages the same web asset. Google Analytics is the sole documented remote integration.

## Authentication and authorization

There is no user authentication or authorization model. Device-local game progress is not shared between users by the application.

## Local data and analytics

The profile stores level, score, milestones, difficulty, sound, and launch choice in IndexedDB with a compact cookie mirror. The product does not ask for account, contact, location, microphone, or other direct-identifying data.

`index.html` currently initializes Google Analytics tag `G-C3PJ0VBNH0` immediately. This conflicts with the release privacy draft’s proposed parent/guardian consent gate and is a release-blocking child-audience/privacy decision until implementation and traffic verification are complete. Tutorial must remain free of gameplay analytics events.

## Secrets and signing

`.gitignore` excludes keystores and Android signing properties. Do not commit signing material, use the debug key as an upload key, or create/move release keys without the owner’s explicit storage and backup decision. Native identity and versioning guidance live in `AGENTS.md`, the Android release tracker, and `docs/runbooks/android-release/owner-actions/ng-and-012-signing-custody.md`.

## Dependencies and vulnerability management

JavaScript and Capacitor versions are locked in `package-lock.json`; the Android wrapper uses Gradle-managed dependencies. No repository evidence shows automated dependency auditing or a public security-reporting process. Run dependency review as part of release work and establish a reporting contact before public distribution.

## Known risks

- Parent/guardian analytics consent and withdrawal are not implemented in the current shipped web source.
- The privacy policy is a draft and is not yet a published, release-linked policy.
- Android release signing, store policy decisions, and full pre-release QA remain incomplete.
