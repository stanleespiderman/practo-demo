# Backend status and connection plan

The shipped Android app and browser review operate in **local demo mode**. There is no Firebase/Supabase connection, no real clinician, no remote authentication and no multi-device messaging. Supplying a URL/key alone does not enable a backend: a network repository and authenticated session UI still need implementation.

The Android app deliberately has no INTERNET permission in this revision. Its local role selector is a demo control and is not an authentication mechanism. The doctor workspace is accessible in the demo UI; it is not protected by real login. The private website offers the same switch for local UI testing. Never use this switch to assign roles in a connected deployment.

## Supabase preparation

1. Create a test project and two Auth users: one fictional patient and one test doctor. Keep their credentials outside the source tree. Create a third unrelated user for denial tests.
2. Review and run `schema.sql` once against the new project. It enables row-level security and participant-only reads/inserts. Conversation assignment is server/admin-only. Messages are immutable and use a client-generated UUID for retry idempotency; the server assigns timestamps.
3. Seed one conversation linking the patient and doctor Auth UUIDs through a trusted server or SQL editor. Do not embed a service-role key in an app or browser bundle.
4. Enable Realtime for `demo_messages` (the migration does this through `supabase_realtime`).
5. Implement a network-backed repository alongside `DemoRepository`, add the Android INTERNET permission, authenticated patient/test-doctor login, secure refresh-token storage and a local outbox. Map the local record IDs explicitly to server conversation UUIDs.
6. Insert each outgoing message using a stable UUID. On a duplicate-key response, retrieve and compare the existing authorized message before marking it sent. Never create a new UUID just to retry.
7. Subscribe only to the selected conversation and reconcile changes by UUID, ordered by server timestamp and UUID. Load history in pages and refetch after reconnect. Store read cursors per authenticated user. Keep sending/failed state in the local outbox.
8. Disable automatic replies when using the connected repository. Display the actual connection state. Do not claim delivery before server acknowledgement.

## Required end-to-end verification (not run)

- Patient A sends from device A; doctor B receives on device B and replies.
- An unrelated user C cannot select messages, subscribe to their contents, insert, or change participant assignments.
- Neither participant can send as the other user.
- A completed conversation rejects new messages.
- Rapid retry of the same UUID stores one message.
- Offline outbox entries persist across process death and reconcile after reconnect.
- Unauthorized/expired sessions fail closed. Sign-out clears private in-memory data.

References: https://supabase.com/docs/guides/database/postgres/row-level-security and https://supabase.com/docs/guides/realtime/postgres-changes . The migration is a starting point for development, not an audited production healthcare system.

## Doctor workspace extension (not connected)

The new doctor profiles, appointments, private notes and medical documents are currently persisted only in the local repository. The existing `schema.sql` remains a messaging scaffold, not a complete clinical backend migration.

Before enabling real sessions, provision 10 separate fictional test-doctor auth users and test-patient users on a trusted server; map their auth IDs to the demo profile IDs. Do not use the UI role selector as authentication. Add doctor-owned profile/appointment/note tables, and participant-readable shared documents with doctor-only draft access. Keep document shares immutable and create the attachment/message transaction atomically. Use private storage for PDFs with participant-scoped signed access. Separate table/policy tests must confirm cross-doctor and cross-patient access is denied. Wire the transport and repository adapters into both clients; a project URL/key alone does not complete that implementation.

No service key, auth credentials or Supabase project was provided or configured. Multi-device messaging and backend access controls have not been tested.
