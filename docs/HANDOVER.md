# Developer handover

**Snapshot:** 12 November 2026 · **Product owner:** Aditya Chauhan · **Incoming developer:** to be assigned

This is the entry point for taking over the Practo-inspired demo. The app contains fictional records. The native Android implementation and browser review are separate programs with separate persistence. The wider goal of a complete Practo-style product remains unfinished.

## Non-negotiable release hold

The owner has explicitly requested **no APK before final approval**. No APK/AAB has been created. Keep the gate in `android/app/build.gradle.kts`. Compilation-only checks can be attempted after SDK setup; packaging and device installation require approval first.

## Done versus pending

“Implemented” below means local-demo source exists. Browser verification does not prove the native version works.

| Area | Implemented | Verification / remaining work |
| --- | --- | --- |
| Patient Home and discovery | Home, service tiles, doctor cards/profiles, search and broader navigation | Browser flows exercised; specialty-filter coverage needs correction/testing |
| Consultations | Persistent active/completed records, list, details, consistent IDs and chat navigation | Browser path exercised; native compilation/device pass pending |
| Text chat | Local send/retry states, unread clearing, timestamps, history and role switching | Same-browser tabs exercised; real two-device messaging absent |
| Ten doctor profiles | Fictional profiles, selection and locally editable profile information | All ten switched in browser; native parity review pending |
| Doctor workspace | Overview, assigned inbox, patient charts, private notes and manual replies | Browser workflows exercised; local filtering is not security |
| Medical documents | Summary/Rx, lab-request/certificate demo drafts, preview, share and PDF export | Browser download/share exercised; native picker and PDF edge cases pending |
| Doctor calendar | Local create/reschedule/check-in/cancel with slot checks | Browser conflict/reschedule exercised; no external booking integration |
| Practice tools | Local invoices/ledger, reports, feedback replies, articles, reminder drafts and stock | Demo persistence exercised; no real payment, publishing or message delivery |
| Other patient services | Medicine, labs, surgery, plans, orders, insurance, ABHA, calls and related screens | UI placeholders; operational workflows not built |
| Native Android | Compose source, local repository, ViewModel, PDF exporter and Gradle wrapper | Never compiled or device-run; two unit tests authored but not executed |
| Backend | Proposed participant-based Supabase messaging SQL and connection plan | SQL not applied/tested; auth, clients, clinical schema and network transport absent |
| Developer handover | Organised source, canonical seed, scripts, CI definition, setup, backlog and QA docs | Local source checks recorded separately; GitHub CI runs only after upload |

## Demo inventory

Seed content is in `data/demo-seed.json`: **10 doctors, 10 patients, 22 consultations and 20 appointments**. Initial dates are fixed around 4 November 2026; they are sample dates, not a live appointment feed. The working example is Dr. Ananya Rao / Aarav Mehta / consultation `DEMO-10482`.

Automatic replies are off by default. Two manual local sessions are useful for reviewing UI, but cannot establish backend delivery or authenticated access. Doctor/private-note visibility is enforced only by UI logic in this demo; all records exist in its local store.

## What the new developer should do first

1. Read this document, then [DEVELOPMENT.md](DEVELOPMENT.md). Run the source checks and browser review.
2. Reproduce patient → consultation → chat, switch to the assigned doctor, send a reply and share a DEMO document.
3. Read [ARCHITECTURE.md](ARCHITECTURE.md). Identify the separate stores and trace a message through each client.
4. Set up JDK 17 and SDK 35. Attempt compilation and unit tests without packaging; report any dependency/type errors as H-01.
5. Review [BACKLOG.md](BACKLOG.md) with the owner. Start with native verification and authenticated backend design before adding more service screens.
6. Obtain the employee's GitHub username before granting write access. A public repository allows reading without an invitation; write access is a separate decision.

## Known limitations to carry forward

- No Firebase/Supabase deployment, secrets, clinician sessions, push notifications or real transport exist.
- Browser localStorage and native app-private JSON never synchronize with each other.
- The browser uses read/modify/write storage; simultaneous multi-tab sends need race testing. A reload can mark an in-flight message failed.
- Several specialty labels need an explicit mapping to seed specialties. Search is not a complete validated discovery engine.
- The browser must load from its server first. There is no service worker or guaranteed offline cold start.
- Android lifecycle, keyboard, accessibility, long histories, persistence corruption and storage-full recovery have not been comprehensively tested.
- App UI code remains concentrated in a few large files. This handover improves folders, formatting and navigation; it is not a complete modular architecture refactor.
- Public references were incomplete. Pixel-perfect matching and complete Practo feature parity are not established.

## Where the evidence lives

[VERIFICATION.md](VERIFICATION.md) records previous browser tests and explicit native/backend gaps. [QA-CHECKLIST.md](QA-CHECKLIST.md) is the rerunnable test plan. [HANDOVER-VALIDATION.md](HANDOVER-VALIDATION.md) records checks performed for this repository reorganisation. Screenshots under `docs/` are browser views only.

No production credentials, signing identity or service account is handed over. No real user or medical data should be introduced before backend access controls and data handling have been designed and verified.

## Ownership and decisions still needed

The incoming engineer, reviewer, backend project owner and release approver should be recorded by the owner. Aditya retains final APK approval. Choose the final app name/application ID and licence before a public release. Publishing this repository does not imply that Practo branding or third-party assets are licensed for commercial distribution.
