# Prioritised backlog

Status on 12 November 2026: every item below is **open** unless explicitly marked otherwise. No delivery estimates or engineer assignments have been agreed. P0 means required before claiming a verified Android/connected product; it does not authorise APK creation.

| ID | Priority | Work and definition of done | Dependency |
| --- | --- | --- | --- |
| H-01 | P0 | Set up SDK/JDK, resolve native compilation errors, execute the two authored unit tests, record reproducible results. No APK required. | Android environment |
| H-02 | P0 | Implement real patient/doctor Auth, trusted participant mapping and session isolation. Unrelated user denied; sign-out clears private state. | Backend project and architecture decision |
| H-03 | P0 | Implement network messaging adapters, durable outbox, stable-ID retry, server timestamps, pagination/read cursors and reconnect. Demonstrate two devices and exactly-once retry outcome. | H-02; approved APK for native device test |
| H-04 | P0 | Expand/test backend for profiles, appointments, notes and documents. Deny cross-doctor drafts, allow only participant-shared records; private PDF storage and atomic share. | H-02 |
| H-05 | P0 | Record owner's final APK approval, then run native device/emulator QA: navigation, keyboard, rotation, process death, accessibility, sizes and PDF picker. | H-01; explicit approval |
| H-06 | P1 | Fix specialty-to-doctor mappings including Women's Health and Child Specialist; test every tile plus empty/unknown search. | Browser and native audit |
| H-07 | P1 | Reproduce simultaneous multi-tab sends and reload-during-send; prevent lost updates/incorrect status. Add meaningful regression coverage. | Browser storage strategy |
| H-08 | P1 | Verify storage-full/corrupt-state recovery, long histories, scroll preservation and offline behaviour; document supported cold-start behaviour. | H-01 / H-03 as applicable |
| H-09 | P1 | Extract domain/repository/UI modules incrementally; add behavioural tests for document share, appointment conflict and unread/retry transitions. | Stable compiling baseline |
| H-10 | P1 | Audit patient/doctor parity across browser and native, including profile fields and reports; agree which client is authoritative. | H-05 |
| H-11 | P1 | Review dependencies, asset licences, branding, final application ID, backup/retention and release security. Keep demo controls out of any real connected release. | Product/release decisions |
| H-12 | P2 | Owner prioritises real booking, payments, calls, labs/pharmacy, ABHA, notifications and other full-product features. Write acceptance criteria before implementation. | Scope, providers, budget and backend |
| H-13 | P2 | Add approved reference screenshots and visual regression/accessibility checks for supported phone sizes. Existing public-reference design is approximate. | Reference approval + H-05 |

## First work sequence

1. Establish the native compilation baseline (H-01) and reproduce the browser review.
2. Decide backend ownership and participant model (H-02), then implement transport and records (H-03/H-04).
3. Resolve the specific discovery/concurrency defects (H-06/H-07) and add targeted tests.
4. Request final APK approval only when the source is reviewable, then execute H-05.
5. Agree a separate scope for full production service workflows. Current placeholders are not completed integrations.
