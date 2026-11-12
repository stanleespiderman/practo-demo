# Verification — review revision 1

## Actually exercised in the browser

- Home → My consultations → View consultation → Continue consultation → chat.
- Doctor/patient/date/ID consistency across list and detail views.
- Active conversation unread count cleared when chat opened.
- Empty composer has a disabled Send button.
- Sending text, sending/sent transition and clearly labelled simulated reply.
- Reload preserved the sent message and its reply.
- Fail-next-message control produced a failed state; retry stored the same message once, with no duplicate bubble.
- Manual test-doctor reply in a second tab appeared in the patient tab. This verified same-browser localStorage synchronization, not a backend or a second device.
- In-app return from chat and browser Back preserved the selected consultation.
- Search for Rohan returned the matching fictional doctor and consultation; an unknown term produced an empty result.
- Appointment empty state accurately said booking was not connected.
- 390px mobile layouts were inspected through live iframes. Hero artwork/text spacing and compact consultation headers were adjusted after inspection.
- Test messages were reset to clean seed state after testing.

## Source checks actually run

- JavaScript syntax: `node --check dist/app.js`.
- Shared seed parity, unique IDs, valid record references, dates, message fields, no APK/AAB: `node tests/check-source.mjs` — passed.
- Kotlin/Gradle source parsed and formatted with ktfmt 0.54 — passed. This validates parsing, not Android dependency resolution or type checking.

## Not verified in this environment

- Android compile, unit-test execution, emulator/device launch, native screenshots, rotation/process-death recovery, accessibility/font scaling, physical keyboard resizing and Android Back behaviour.
- No Android SDK, Gradle distribution cache or emulator was present. Gradle wrapper and source are supplied for the Android Studio build after setup. The APK packaging gate remains enabled.
- Supabase SQL is prepared but was not executed, audited or connected. No multi-device transport or participant-access tests have run.
- Browser fully offline cold start, storage quota errors, corrupted persistence recovery and exhaustive race/load testing were not exercised. Error handling exists, but a passing test is not claimed.
- Automatic scrolling was implemented to preserve an older scroll position; long-history/device stress tests remain pending.
- No claim of exact parity with every current Practo screen; public screenshots do not cover the whole product.

## Screenshots

The screenshots are of the **browser review**, including mobile-width views, not an Android emulator. They are labelled accordingly in the review page. No APK was created to produce them.

Final screenshot review: the three mobile-width screens showed legible text, distinct cards, visible bottom navigation and a visible chat composer. No hero text/art overlap remained after the spacing correction. The screenshot is `practo-mobile-review.jpg`.

## Doctor extension — review revision 2

Browser checks performed on 4 November 2026:

- Switched through every one of the 10 named fictional doctors; each dashboard showed its correct identity.
- Opened Ananya's consultation while Dev was selected: the UI denied access to the unassigned record.
- Sent a manual doctor message, saved a private clinical note, created and previewed a demo medical summary, and downloaded its PDF through the browser download control.
- Shared that document into the same consultation; the patient saw its attachment and Medical records entry. Reload preserved the shared document.
- Sent a patient reply, then used a separate same-origin browser tab to receive a manual doctor response. This is local synchronization, not a real backend.
- Failed a doctor message deliberately. The patient had **zero** matching bubbles before retry, then **one** after successful retry. Empty send remained disabled.
- Verified duplicate appointment time rejection; rescheduled an existing appointment, checked it in, and confirmed its consultation displayed the updated time.
- Created an invoice and marked the local demo ledger paid; the displayed collection total updated without processing any money.
- Saved and observed a feedback reply, article draft, reminder draft and stock quantity.
- Edited a doctor's working hours and reloaded; the saved value persisted.
- Inspected 360px mobile overview, chat and document-editor views. Fixed page-level overflow; DOM measurement confirmed overview body scrollWidth equals clientWidth. The composer and bottom navigation remained visible.
- New screenshots are browser review screenshots (`practo-doctor-dashboard.jpg`, `practo-doctor-mobile.jpg`), not native Android screenshots.

Source checks were rerun for JavaScript syntax, exactly 10 unique doctors, patient/consultation/message references, matching appointment times, shared Android/web seed parity and no APK/AAB output. All Kotlin files, including the native doctor workspace and PDF exporter, parsed successfully with ktfmt.

Android compilation, type checking, device execution and PDF picker behaviour remain unverified because the SDK/emulator are unavailable. No APK was produced. The separate browser and native stores are not connected, and the expanded Supabase clinical backend is documented as future integration work. The exported browser PDF downloaded successfully; multipage/font-edge-case PDF rendering was not stress-tested. Source checks do not replace a native build or backend authorization tests.
