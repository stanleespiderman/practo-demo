# Contributing

Read [the handover](docs/HANDOVER.md) before making changes.

1. Create a short-lived feature branch and reference a backlog ID from [BACKLOG.md](docs/BACKLOG.md).
2. Edit browser code in `web/`, native code in `android/`, and fictional seed content in `data/demo-seed.json`. Do not edit generated `dist/` or the Android seed copy directly.
3. After a seed edit run `npm run seed:sync`. Reset disposable demo state to see new initial records; do not promise a migration unless one is implemented.
4. Run `npm run format`, `npm run check`, and `npm run format:check`. Use the relevant manual steps in [QA-CHECKLIST.md](docs/QA-CHECKLIST.md).
5. Explain changed behaviour and actual validation in the pull request. Mark tests not run, including device/backend checks.
6. Keep documentation and the done/pending matrix current. A source change alone is not proof of a working Android build.

Use fictional data only. Keep DEMO markings on medical documents and simulated interactions. Do not commit credentials, tokens, signing keys, real patient data, local settings or generated binaries. Do not use local role switches as authentication.

**No APK/AAB, installation or release without the owner's final approval.** Do not disable the Gradle gate, add packaging to default CI, or pass its approval property without that approval.

The browser and Android implementations do not share executable UI or runtime state. When changing shared product behaviour, evaluate both clients and document any remaining parity gap. Large UI files remain candidates for incremental refactoring; avoid unrelated rewrites in a functional fix.
