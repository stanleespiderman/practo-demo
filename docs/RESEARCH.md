# Visual and feature research — 4 November 2026

## Primary references inspected

1. Official Android listing: https://play.google.com/store/apps/details?id=com.practo.fabric&hl=en_IN — listing dated 31 October 2026 at retrieval. Six public screenshots were opened; the doctor listing and five-image contact sheet were inspected visually.
2. Official health-app overview: https://www.practo.com/health-app — searchable page text describes appointments, medicines, lab tests, online chat, reminders and records. Direct page retrieval returned 403; it was not treated as a full screenshot reference.
3. Patient consultation FAQ: https://help.practo.com/practo-consult/faqs-for-practo-consult-patients/ — consultation and follow-up flow, text/image/audio/video touchpoints.
4. Official consultation guidance: https://help.practo.com/practo-consult/consult-latest-updates/summary-note-for-every-online-consultation/ — summary notes are surfaced in chat; this demo uses non-clinical fictional summaries only.
5. Public secondary visual cross-check: https://assets.nextleap.app/submissions/NLPRACTO-d3c975b0-44cd-434d-829d-586b228b11e5.pdf — surfaced app menu/home observations informed the broad account navigation. This is older third-party evidence, not proof of the current UI.

## What the images show

- White surfaces, dark navy typography, bright cyan calls to action, violet/pale-blue service panels.
- Location and search above two prominent in-person and video consultation cards.
- A compact row of tests, surgery, medicines and plan services.
- Round speciality illustrations, readable doctor rows, credentials, experience and clinic metadata.
- Doctor lists with filter chips, ratings/stories and outlined/filled clinic actions.
- App navigation also exposes records, orders, consultation history, plans, reminders and support.

## Implementation decisions

Mobile layout retains these elements and their hierarchy. Desktop review extends the account menu into a sidebar and exposes the active consultation in a right column. Artwork is original SVG/Compose Canvas illustration. No production doctor photos or patient records were copied. All claims, prices, ratings, identities and credentials in the demo are explicitly fictional/illustrative.

Public screenshots do not expose all current consultation/chat states. Those views are consistent approximations based on the observed design vocabulary and documented flow. Exact visual parity is not claimed. No authentication, payment, real booking or production API calls were attempted.

## Native framework references

- AGP 8.9 compatibility: https://developer.android.com/build/releases/agp-8-9-0-release-notes — Gradle 8.11.1, SDK 35 and JDK 17 baseline.
- Kotlin/Compose compiler: https://developer.android.com/jetpack/androidx/releases/compose-kotlin — Kotlin 2.x uses the matching Compose compiler plugin.

## Doctor workspace research — 4 November 2026

Public official sources were used to extend the interface to the doctor side:

- [Practo Pro](https://www.practo.com/practo-pro-app): profile, Consult, calendar, patients, practice reports and patient feedback.
- [Practo Ray navigation](https://help.practo.com/practo-ray/navigation/): appointments, patients, communications, reports, profile and back-office tools.
- [Calendar overview](https://help.practo.com/practo-ray-v7/calendar-practo-ray-v7/calendar-overview-2/): scheduling, rescheduling and patient check-in.
- [Consult Summary & Rx](https://help.practo.com/practo-consult/consult-latest-updates/summary-note-for-every-online-consultation/): structured summary, optional medicine/test entries and sharing the PDF in consultation chat.

The workspace adapts these documented workflows into the existing navy/cyan design system. It does not claim exact parity with private, authenticated Practo Pro screens or implement Practo's real clinical, booking, payments, Reach advertising or communications infrastructure. The brand treatment is an interface study, and all profiles are fictional.

The 10 profiles cover general medicine, dermatology, dentistry, orthopaedics, gynaecology, paediatrics, ENT, psychiatry, cardiology and ophthalmology. No real registration IDs or signatures are used. Document content is manually entered; the app generates no treatment recommendations.
