# QA checklist

Use this for a fresh run. Checkboxes are intentionally unchecked; historical evidence is in [VERIFICATION.md](VERIFICATION.md). Do not turn an implemented control into a claimed passing test without exercising it.

## Source and packaging hold

- [ ] Clean clone: `npm ci`, `npm run check`, `npm run format:check` all pass.
- [ ] Canonical seed and Android copy match; generated browser files match `web/`.
- [ ] No secrets, APK/AAB, build outputs or local settings are tracked.
- [ ] Default CI contains no Android packaging/installation command.
- [ ] Android compilation and unit-test results recorded after SDK setup.

## Patient and doctor browser flows

- [ ] Home → consultations → selected details → chat; browser and in-app Back preserve identity.
- [ ] Search names, IDs and every specialty tile; an unknown term produces an empty state.
- [ ] Send nonempty message; Sending/Sent and timestamps are consistent. Empty/rapid duplicate input rejected.
- [ ] Fail-next/offline simulation → Failed; recipient sees no delivered bubble; retry delivers one.
- [ ] Open recipient conversation, clear unread count, reload and confirm history persists.
- [ ] Use two same-origin tabs for manual patient/assigned-doctor replies; clearly label this local test.
- [ ] Switch all ten doctors; correct profile, assigned charts, notes and inbox are shown.
- [ ] Save private note and document draft; patient UI cannot see the draft. Share once; attachment and records persist.
- [ ] PDF downloads, repeats DEMO mark and renders long/multipage content without clipping.
- [ ] Create conflicting appointment, reschedule, check in and cancel; associated consultation stays consistent.
- [ ] Demo invoice totals, profile edits, feedback replies, article/reminder drafts and inventory survive reload.
- [ ] Unsupported services show a placeholder and never fake external success.
- [ ] Narrow layouts, increased font size and long text do not overlap or hide composer/navigation.

## Native device checks — after explicit APK approval only

- [ ] Complete the patient/doctor workflows above on Android.
- [ ] Back/system bars/rotation/process death restore an appropriate screen and data.
- [ ] Keyboard/composer behaviour, IME send and scroll position work on multiple screen sizes.
- [ ] System PDF picker handles save, cancel and errors correctly.
- [ ] Accessibility focus/labels/font scaling pass; no clipped text or touch targets.
- [ ] Storage corruption/full disk and interrupted sends recover without silent data loss.

## Connected backend checks — currently unavailable

- [ ] Two distinct authenticated devices exchange messages; simulated replies disabled.
- [ ] Unrelated user cannot read, subscribe, send, assign participants or access PDFs.
- [ ] A participant cannot spoof the other sender; completed consultation rejects messages.
- [ ] Retry same UUID repeatedly; only one server record exists.
- [ ] Offline outbox survives restart and reconnect; server ordering/read cursors reconcile.
- [ ] Doctor drafts/notes remain private; shared document permissions are participant scoped.
- [ ] Token expiry, logout and role changes fail closed and clear private cached state.
