# Quality score

| Area | Grade (A–F) | Evidence | Top gap |
| --- | --- | --- | --- |
| Arithmetic and curriculum | B | Pure helpers and all L1–L20 rules are documented in `ARCHITECTURE.md`; deterministic coverage lives in `tests/curriculum-harness.html`. | Restore a repeatable full curriculum-harness pass. |
| Learner interaction and accessibility | B | `index.html` supports keyboard, dialogs, live announcements, touch, and reduced motion; product docs define operation-correct semantics. | Complete the documented device accessibility and soft-keyboard matrix. |
| Persistence | B | IndexedDB is mirrored to a compact cookie with validation, migration, and in-memory fallback. | Exercise storage and lifecycle recovery on the required device matrix. |
| Browser integration tests | C | The harness is broad, but `docs/qa/android-release-qa.md` records an unresolved full-run failure. | Diagnose and deterministically fix the failing visibility assertion. |
| Android delivery | C | Capacitor configuration and a debug-device smoke test exist. | Complete API 24/30/36, offline, lifecycle, and release-build verification. |
| CI and release automation | C | The repository-root Codemagic workflow performs an unsigned iOS smoke build. | Add and validate the required Android release and test gates. |
| Security and privacy | D | Local-only gameplay and ignored signing paths are documented, but the live Google tag loads immediately and the privacy policy remains a draft. | Implement and verify parent/guardian analytics consent before release. |
| Documentation | B | Product, architecture, QA, privacy, execution, and owner-gate material is detailed; the Android tracker is schema-validated. | Keep release evidence and the sole JSON tracker current as decisions change. |

## How this is updated

Re-grade after meaningful architecture, test, privacy, or release changes, and at each release-readiness review. Grades describe recorded evidence and open gaps, not intended quality.
