# Practo interface demo

Native Android source in Kotlin + Jetpack Compose, plus a **separate browser review**. Fictional patient and doctor data only. This is an independent prototype, not an official Practo product or a complete production clone.

**Start here: [Developer handover](docs/HANDOVER.md)** — what is done, what remains, known limitations and the next developer's first steps.

> **Release hold:** No APK or AAB has been produced. Do not package, install or distribute an Android build until Aditya gives final approval. The Gradle approval gate remains enabled.

## Run the browser review

Requires Node.js 20+ and npm. From the repository root:

```sh
npm ci
npm run check
npm run preview
```

Open `http://127.0.0.1:4173/`. Patient mobile review: `/mobile.html`; doctor mobile review: `/doctor-mobile.html`. Stop with Ctrl+C. This does not build Android.

Try Home → My consultations → View consultation → Continue consultation. Open Doctor workspace, select Dr. Ananya Rao and reply to Aarav Mehta. Two tabs at the same origin share local data; different devices and the Android app do not. Automatic replies are off by default.

## Find the right code

| Path | Purpose | Edit here? |
| --- | --- | --- |
| `android/` | Native Android app, Gradle wrapper and unit-test source | Yes |
| `web/` | Browser review HTML, JavaScript, CSS and vendored PDF library | Yes |
| `data/demo-seed.json` | Canonical fictional demo content | Yes; then run `npm run seed:sync` |
| `backend/` | Proposed Supabase messaging schema and integration plan | Scaffold only |
| `scripts/` | Preview build/server, seed sync and validation | Yes |
| `tests/` | Source/data integrity and handover checks | Yes |
| `docs/` | Handover, backlog, setup, architecture, QA and browser screenshots | Yes |
| `dist/` | Generated browser output; excluded from Git | No; run `npm run build:preview` |

Download the [five-page handover PDF](docs/Practo-Developer-Handover.pdf) for a concise transfer summary.

## Read next

- [Development setup and commands](docs/DEVELOPMENT.md)
- [Architecture and storage](docs/ARCHITECTURE.md)
- [Prioritised pending work](docs/BACKLOG.md)
- [Verification checklist](docs/QA-CHECKLIST.md)
- [GitHub and employee handoff](docs/GITHUB-HANDOFF.md)
- [Doctor workspace behaviour](docs/DOCTOR-WORKSPACE.md)
- [Previous verification evidence](docs/VERIFICATION.md)
- [Contribution rules](CONTRIBUTING.md)

## Current status

Patient navigation, local consultations/chat and the 20-doctor workspace are implemented as local demos. The browser workflows were exercised on 4 November 2026. Native source is supplied, but Android compilation, unit-test execution and device testing remain unverified. Source/format/build checks are separate from device tests.

Real authentication, multi-device messaging, push notifications, clinical backend storage, real booking, payments and calls are unconnected. A backend URL/key alone will not enable these features. See [backend plan](backend/README.md).

The project is research-based; the available public references did not cover every screen. Existing screenshots show the browser review, not a native emulator. No root open-source licence has been selected; see [third-party notices](THIRD_PARTY_NOTICES.md).
