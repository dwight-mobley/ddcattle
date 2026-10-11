# Private ride sync — implementation and test-server setup

Implemented 2026-10-11, Android 0.5.0. Nothing is deployed. This document is the current protocol;
`mobile/android/FUTURE_SYNC.md` retains the broader design and deferred work.

## Private Android–Django sync slice — 0.5.0 (2026-10-11)

User now authorizes backend sync implementation, superseding the earlier no-backend/no-sync scope
for this slice. Public presentation is expressly excluded. No deployment or production migration/data
change is authorized or performed. Frontend code is untouched.

- Separate RecordedTrack / RecordedTrackBatch tables contain private staff-test data. They have no
  Ride/Animal/marketplace/timeline linkage or publication field. HORSE uploads are also private test
  tracks; they do not create training participation. Admin lists title, owner, kind, distance in miles,
  sample count and completion status, and shows escaped private manifest and raw batch data. Complete
  tracks can be deleted through authorized admin; individual batch editing/deletion is disabled.
- Endpoint `/api/training/recorded-tracks/` is disabled by default (`RIDE_SYNC_ENABLED=False`). Explicit
  enablement plus active staff authentication is required. API reads/writes are owner-scoped even for
  staff; cross-owner review is restricted to model-permission-controlled Django admin. Anonymous and
  ordinary customer access are denied. API responses use private/no-store and noindex/noarchive.
- Use existing SimpleJWT login/refresh and `/api/me/`. Android requires an explicit HTTPS server
  origin, verifies staff identity/private protocol capabilities, holds access tokens in memory and
  encrypts saved refresh/account data with Android Keystore AES-GCM. Password is never persisted.
  No redirects, cleartext fallback, auth request logging, cookies or map-cache reuse. Keystore behavior,
  TLS transport and token-expiry handling still need real-device confirmation. Logout clears local
  credentials but does not revoke already issued server JWTs; existing server token lifecycle applies.
- Each upload requires selection and explicit consent to associate that finished local ride with a
  verified account/server. Snapshot and account binding are persisted separately in Room schema 3;
  additive migration 2→3 (and complete 1→3 chain) is tested. Recording/service/filters/GPX are unchanged.
  Details freeze once queued. Pending uploads cannot be locally deleted; synced phone copies may be
  deleted with a clear warning that the server copy remains. Only a receipt is retained after deleting a synced phone copy; its saved upload manifest/points are cleared in the same transaction. Status UI reads lightweight projections; full payloads load only for the selected upload.
- Upload immutable revision 1 in batches of at most 500 points/512 KiB raw UTF-8 JSON, up to 20,000
  points per ride. Manifest, batch and complete ordered-digest acknowledgments prevent silent changes
  and duplicate insertion. Server validates exact digests, supported fields/types/units and per-segment
  accepted clock order. Rejected out-of-order points and optional invalid altitude remain preserved.
  Nonfinite/out-of-range observations become null plus invalid-field markers. Monotonic nanoseconds
  are decimal strings, raw boot-relative values used only within each segment, never UTC. Distance and
  elevation remain explicitly client estimates; this slice does not recompute authoritative server metrics.
- Finalization is transactional and checks every batch/count/hash before COMPLETE; Android marks
  SYNCED only after a matching durable final acknowledgment. Partial uploads survive lost connections.
  Retry replays the same snapshot/identities. Conflicts and invalid payloads require review; no overwrite.
- This first upload slice is manual and runs while the app is open, independently of the recorder.
  There is no WorkManager/automatic background upload or scheduled backoff. After offline/process
  interruption, reconnect the original account and tap Resume upload. Original phone data is retained.
  Metadata revisions, horse linkage, dedicated devices, server-side deletion UI and public sharing are
  deferred. Nothing uploads automatically on Finish, account login or connectivity restoration.

Validation: Android debug build, 37 JVM/Robolectric tests, lint (0 errors, 13 warnings), instrumentation
APK compilation, and 41 Django tests pass. Django tests use disposable in-memory SQLite, in-memory
storage, local email/cache and a test-only JWT signing key. Version-1 and version-2 Room fixtures check
migration/preservation. Native tests cover snapshots, limits, invalid raw observations, lost-finalize
retries, frozen edits, local deletion rules and account isolation. Django tests cover anonymous/nonstaff
and cross-owner denial, disabled gate, JWT authentication/refresh, strict validation, missing/conflicting/
replayed batches, finalization and lack of public/horse activity. An actual Android-generated synthetic
501-point/two-batch fixture was accepted/finalized by Django without changing its hashes. No live server
requests, production imports/migrations or connected-device sync were performed.

Build reused the portable Windows JDK/SDK with bounded heaps because WSL instability remains open.
Nonfatal SDK metadata, existing GPX nullability and Gradle metaspace notices remain. Lint warnings are
dependency/KTX suggestions. Same debug signing key as 0.4.0; versionCode 6 upgrades in place.
PostgreSQL concurrency, HTTPS networking, Keystore storage, phone login/restart/expiry and real upload
UI remain unverified. Existing two-hour/offline/eight-hour recorder tests remain open.

## Preparing a disposable test server (instructions only; not executed against a live server)

1. Use a separate testing database and HTTPS hostname with a valid Android-trusted certificate.
   Configure the test deployment's `DATABASE_URL`, `ALLOWED_HOSTS`, strong secret/JWT signing key,
   storage/email/cache and usual settings. Do not point a staging server at production data. Existing
   ALLOWED_HOSTS is explicit in config/settings.py; add the approved test hostname in test settings.
2. Review/apply training migration 0006 only to that disposable server. It adds private track/batch
   tables; it does not alter existing Ride/Animal data. Backend deployment needs separate authorization.
3. Enable `RIDE_SYNC_ENABLED=True` explicitly on that server. Without it, staff calls receive 503.
   Create a disposable staff test account. Staff is required for the API; admin also requires view
   permissions for RecordedTrack/RecordedTrackBatch (superuser in isolated testing is sufficient).
4. Install 0.5.0 over 0.4.0 after finishing recording, without uninstalling/clearing data. Open Private
   test sync, enter the HTTPS server origin and staff username/password. No production URL is prefilled.
5. Select a finished test ride, review precise-data disclosure, check account association consent,
   and Upload privately. Look in admin → Training → Recorded tracks; completed_at indicates completion.
   Batches hold raw precise points and rejection diagnostics. No public map/page or horse history entry
   is created. General staff permission to view admin records is deliberate and must be assigned carefully.
6. Keep the app open for upload. If it stops, reconnect the same account and Resume upload. Original
   phone data remains. Retry keeps the same frozen snapshot; title/notes cannot change after queuing.
   Delete a complete disposable server track via authorized admin when testing is done. Deleting a phone
   copy never deletes server data; deleting server data does not erase the phone's already-synced receipt.
7. Disable the sync flag to stop API upload/read access. This does not erase tracks or disable admin.
   There is no publishing toggle. Any future public exposure requires separately approved design/code.

## Wire format

Authenticated JSON endpoints (all under `/api/training/recorded-tracks/`):
- GET `capabilities/` → private/staff-only protocol 1, verified user ID and size limits.
- POST collection `{ "manifest": "<exact compact JSON string>", "digest": "<sha256 hex>" }`.
  Manifest contains format/source/kind/filter_version, UUID/revision=1, UTC start/end, recording/moving
  milliseconds, SI client metrics, private labels/notes, expected_samples, ordered batch_digests and
  payload_digest = SHA256(UTF8(batch digests joined with LF; no final LF)). Empty array hashes empty text.
- POST `{id}/batch/` `{ "index": 0, "payload": "<exact sample-array JSON string>", "digest": "..." }`.
  Each sample has insertion sequence, segment, UTC ms, raw decimal monotonic_ns, lat/lon, horizontal
  accuracy, optional speed/altitude/vertical accuracy, accepted/rejection and invalid_fields. Optional
  values are null. Invalid raw values are null with marker; ordinary absent values have no marker.
  Accepted `gap` reasons are preserved; no invented geometry bridges gaps. All stored rejects included.
- POST `{id}/finalize/` `{ "payload_digest": "..." }` → durable COMPLETE/private acknowledgment.
- GET list/detail returns owner-only state; list is paginated (20). No PATCH/PUT/DELETE/public endpoint.

Digests apply to exact UTF-8 strings, not reserialized JSON. Duplicate keys and NaN/Infinity JSON are
rejected. Stable owner+UUID+revision uniqueness and per-track locks protect retries. API throttles
240 requests/min per staff user and caps incomplete uploads at 100 per owner; these are application
limits, not a substitute for hosting/proxy limits. Request envelope max 544 KiB (512 KiB raw payload
plus envelope allowance); future revision/device-source handling is not implemented.

## Local verification

From api with the repository environment: `python manage.py test training animals accounts
--settings=training.test_settings --noinput` and `python manage.py makemigrations --check --dry-run
--settings=training.test_settings`. Test settings override all data/storage/email/cache endpoints and
JWT signing key before tests; only disposable SQLite is used. No ordinary `manage.py migrate` was run.

Reference implementations/documentation:
- [DRF permissions](https://www.django-rest-framework.org/api-guide/permissions/) — authentication plus owner-filtered querysets.
- [SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/en/stable/index.html) — existing token authentication/refresh.
- [Android Keystore](https://developer.android.com/privacy-and-security/keystore) — refresh encryption keys.
