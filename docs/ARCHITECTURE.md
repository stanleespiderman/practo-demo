# Architecture and code map

## Two clients, one seed, separate stores

The native Android app is Kotlin/Compose with no WebView. The browser review is plain JavaScript/HTML/CSS. They share initial fictional JSON content, but not executable application logic or live state. Treat parity as a product requirement to test, not an architectural guarantee.

| Responsibility | Android | Browser |
| --- | --- | --- |
| Entry/navigation and patient UI | `MainActivity.kt` | `web/app.js`, `web/index.html` |
| Doctor UI and forms | `DoctorWorkspace.kt` | `web/doctor-workspace.js` |
| Mutable application state | `AppViewModel.kt` + repository StateFlow | Application state and action handlers in `web/app.js` |
| Models/unread/order helpers | `Models.kt` | Seed-shaped JS objects and helpers in `web/app.js` |
| Persistence | `DemoRepository.kt` | localStorage persistence helpers in `web/app.js` |
| Documents/PDF | `DemoPdf.kt`, system document picker | Doctor workspace + `web/vendor/jspdf.umd.min.js` |
| Styling | Compose components/theme in native source | `web/styles.css`, `web/doctor-workspace.css` |

Native files are under `android/app/src/main/java/com/example/practodemo/`.

## State and persistence

Android persists JSON to `context.filesDir/demo-state.json` using an atomic file and a coroutine mutex. The repository publishes StateFlow after saving. The ViewModel coordinates role, selected doctor, message delivery and CRUD. Existing migration logic handles the earlier doctor-data revision; this is not a general migration system. In-flight messages recover as failed after restart.

Browser state is stored under localStorage key `practo-review-v1`. Tab-specific doctor selection/role use sessionStorage keys `practo-doctor-id` and `practo-role`; patient selection is part of shared application state. A storage event updates other tabs on the same origin. This is neither transactional concurrent storage nor cross-device delivery.

## Trace a message

The composer validates content and consultation state, creates a stable message ID and a local Sending record. The local delivery path updates that same record to Sent or Failed. Retry reuses its identity. Incoming-role messages and read cursors determine unread counts. Simulated automatic replies are optional and off by default. The doctor workspace receives a narrow callback API from the browser app, but its UI is still a large module.

The pending connected implementation must replace local acknowledgement with server acknowledgement and enforce participant identity on the server. Keep delivery state in an outbox and reconcile by stable UUID/server timestamp. The current local role selector must never become an authorization mechanism.

## Documents and scheduling

Private notes and draft documents are associated with doctor/consultation IDs. Sharing makes a document visible in the consultation and patient records; shared versions are treated as read-only in the UI. PDF exports carry DEMO markings. Current access is only local UI filtering.

Doctor appointments link to consultation records, and rescheduling updates related dates/times. Doctor calendar CRUD is a local workflow; patient external appointment booking remains a placeholder. Invoice state updates only a fictional ledger; no payment processor is called.

## Build and repository boundaries

`data/demo-seed.json` is canonical. `scripts/sync-seed.mjs` updates the tracked Android asset. `scripts/build-preview.mjs` copies authored `web/` files and seed into generated `dist/`. `scripts/serve-preview.mjs` serves that folder at localhost. GitHub source checks build only the preview and never package Android.

The original Sites checkout may contain `.openai/hosting.json`; it is deployment metadata, not application code. The GitHub-ready export omits it, all original Git metadata, credentials, node_modules and generated output. Original site history remains in its own repository. Do not repoint its origin when uploading the separate handoff snapshot.

## Suggested refactor boundary

After H-01 establishes a compiling native baseline, extract patient screens, doctor screens, reusable components and domain actions incrementally. For the browser, separate storage/repository functions, routing, patient UI and doctor sections behind explicit interfaces. Keep behaviour tests and stable IDs before moving business logic. Do not refactor the two clients into a WebView to avoid native work.
