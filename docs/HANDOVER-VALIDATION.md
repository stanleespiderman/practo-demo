# Handover validation — 12 November 2026

## Passed for the reorganised source

- `npm ci` / dependency installation from pinned package metadata; Prettier 3.10.1.
- `npm run check`: canonical/native seed parity; JavaScript syntax; ID/reference/date/message checks; 10 doctors; no APK/AAB; generated preview byte parity; handover Markdown link targets; APK gate and no packaging in default CI.
- `npm run format:check`: authored browser/script/test source formatting passed; vendored code excluded.
- Development server: patient index, doctor mobile review and JSON seed served with expected MIME types; unknown files returned 404 and encoded parent traversal returned 403. The first external smoke-test attempt found a stopped process; rerun with a managed subprocess passed.
- Public-export file selection excludes original Git metadata, Sites metadata, local settings, node_modules and generated output.

## Scope of this validation

This pass reorganised files, formatted authored browser code and added developer tooling/documentation. It did not add new clinical/backend features. The automated source checks are not end-to-end UI tests. Previous browser interaction evidence remains dated 4 November in [VERIFICATION.md](VERIFICATION.md); those flows were not all repeated during this documentation pass.

Android compilation, native unit-test execution, device/keyboard tests, actual backend messaging and authorization remain unrun. No APK/AAB was generated. GitHub Actions results must be checked on the uploaded commit; local results alone do not establish a hosted CI result.
