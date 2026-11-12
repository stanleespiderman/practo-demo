# Development setup

## Browser review

Install Node.js 20+ (CI uses Node 22) and npm. From the repository root:

```sh
npm ci
npm run check
npm run preview
```

Visit `http://127.0.0.1:4173/`. The server binds to localhost only. `PREVIEW_PORT` can override 4173. It is a development server, not a production API. No Android build runs with these commands.

| Command | Result |
| --- | --- |
| `npm run preview` | Rebuild `dist/` and serve it locally |
| `npm run build:preview` | Recreate `dist/` from `web/` plus canonical seed |
| `npm run seed:sync` | Copy canonical seed into Android assets |
| `npm run seed:check` | Fail if Android seed differs |
| `npm run check` | Seed parity, generated build parity, JS syntax, data/source and documentation checks |
| `npm run format` | Format authored web/scripts/tests source; skip vendor code |
| `npm run format:check` | Check formatting without edits |

The preview, build and source checks use Node's standard library. Prettier is the only npm development dependency. `npm ci` requires registry access; the vendored browser PDF library is already included.

## Editable data

Edit `data/demo-seed.json`, then run `npm run seed:sync` and `npm run check`. The browser build adds it as `dist/seed-data.json`; Android consumes `android/app/src/main/assets/seed-data.json`. IDs link profiles, patients, conversations and appointments. Preserve referential integrity and date/time consistency.

Existing persisted state takes precedence over seed values. For disposable browser testing, use the demo reset control or clear this origin's site data. In Android, clearing app data resets the demo after approved installation. Seed changes are not a production migration strategy.

## Android setup without an APK

Use Android Studio, **JDK 17**, SDK platform 35 and build-tools 35.0.0. Open `android/`. Set its SDK location through Android Studio or untracked `android/local.properties`. The wrapper pins Gradle 8.11.1; AGP 8.9.2, Kotlin 2.1.20 and Compose BOM 2025.04.01 are in the Gradle files. Minimum Android API is 26; target is 35.

From `android/`, after SDK/dependency setup:

```sh
./gradlew :app:compileDebugKotlin :app:testDebugUnitTest
```

On Windows use `gradlew.bat`. These are intended as non-packaging checks. If the approval gate rejects a dependency task, inspect the task graph and report it; do not bypass the gate. This command has not yet been verified in a complete Android environment.

**Do not use Android Studio Run, assemble, bundle or install before the owner's final approval.** Approval is not supplied by this document. After approval is actually recorded, the existing gate accepts `-PapkApproved=true` for the explicitly approved packaging task.

## Backend

There are no API credentials to copy and no connected environment. Follow [backend/README.md](../backend/README.md). A new network repository, Auth sessions, participant mappings, schema expansion and both clients' integration must be written. Adding a project URL/key alone will not work.

## Troubleshooting

- Missing seed or stale UI: run `npm run seed:sync`, `npm run build:preview`, then reset disposable local data.
- Port in use: stop the prior server or choose another `PREVIEW_PORT`; different ports have separate browser storage.
- Formatting failures: run `npm run format`, review the diff, rerun checks.
- Android SDK not found: configure `local.properties`; never commit machine paths.
- Wrong doctor view: verify assigned doctor ID and selected demo role. This is not an authenticated session.
- Disconnected services: expected. Unsupported actions must not report a real booking/payment/call as successful.
