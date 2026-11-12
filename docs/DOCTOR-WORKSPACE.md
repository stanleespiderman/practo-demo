# Doctor workspace — review revision 2

Open the review site and select **Doctor workspace** on Home, in the sidebar or under Account. Choose any of the 10 fictional doctors from the doctor selector. On a narrow screen, use **Switch doctor** in the top bar and **More** in the bottom navigation.

## Local workflows implemented

| Area | Behaviour |
| --- | --- |
| Doctor profiles | 10 profiles with speciality, fictional qualifications, experience, fee, clinic, hours, availability and bio; profile changes feed patient discovery. |
| Overview | Schedule, unread consultation count, draft count, demo collections, availability and quick actions. |
| Consultations | Assigned-patient inbox, active/completed filters, unread messages, consultation completion and persistent conversation history. |
| Doctor chat | Manual doctor replies, sending/sent/failed states, retry, timestamps, empty/rapid duplicate prevention, read clearing, older-scroll preservation and demo document attachments. |
| Patient charts | Assigned patients only, consultation history, allergies/history seed fields, private notes and documents. |
| Summary & Rx | Consultation summary, prescription draft, lab request and medical-certificate demo; editable private draft, review, one-time share and read-only shared version. |
| PDF export | Text PDF with permanent DEMO banners and no real signature or registration number. Browser export uses vendored jsPDF; Android source uses PdfDocument and the system document picker. |
| Calendar | New visit, reschedule, check-in/cancel, duplicate-slot validation and linkage to the same consultation. |
| Billing | Demo invoice, local paid/unpaid ledger, live report totals. No money collection. |
| Reports | Saved consultation/document counts and local demo collection totals. |
| Feedback | Fictional patient stories and saved doctor replies. |
| Health feed | Editable local article drafts/publication state; nothing published to Practo. |
| Communications | Saved SMS/email text drafts only; no external delivery. |
| Inventory | Sample stock names, categories and quantities. |

The Android source includes these core modules using Compose. The browser and Android have independent local stores and do not synchronize with each other. Some presentation details differ: desktop has a sidebar, compact charts and cards; Android uses a native horizontally scrollable section selector and modal forms. Native numeric profile fields and browser reports may have different levels of editing/detail.

## Try the document workflow

1. Choose Dr. Ananya Rao → Consultations → Aarav Mehta → Open workspace.
2. Send a fictional message. It moves through Sending to Sent locally.
3. Add a private clinical note. The patient cannot see it through the patient interface.
4. Open Summary & Rx, enter fictional content and save a draft.
5. Review the preview, export the demo PDF, then Share in local chat.
6. Choose View as patient. The message and document appear in that consultation; the same document is under Medical records.
7. Return to Doctor workspace and choose another doctor. Other doctors' consultations, private notes and documents do not appear in that workspace.

## Messaging and security limits

This is a development demo with explicit role switching, not authenticated doctor access. Patient and doctor roles can exchange messages in the same browser across tabs; Android roles share app-private local data. All demo records exist in that local store and a developer can inspect them. UI filtering is not server authorization. Do not use real health information.

Automatic simulated replies are **off by default** so manual doctor testing is unambiguous. They can be enabled in patient Demo controls. Real multi-device messaging, Firebase/Supabase auth, participant RLS enforcement, notifications, video/audio calls, external appointment booking, payments and SMS/email remain unconnected.

A complete production clone of all Practo services is not claimed. This delivery recreates the major visible doctor-side workflows as functional local demos and leaves external service actions explicitly unavailable.

## Android approval hold

No APK/AAB has been produced. No emulator or Android SDK was available to compile or run the new native screens. Kotlin parsing passed, but type/dependency compilation and device testing remain required after environment setup. The explicit APK approval gate is unchanged.
