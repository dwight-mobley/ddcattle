# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Private frontend viewer and visible phone sync receipts — 2026-10-11

Android 0.5.1 fixes a visibility omission: 0.5.0 persisted receipts in Room but displayed them only
inside the signed-in Private test sync picker. Saved ride cards and route details now show Local only,
Synced privately, queued/interrupted/sign-in/conflict/review states directly from the persistent status
projection, without requiring connectivity or login. Synced means a matching server receipt was saved;
it does not promise the server copy still exists after later admin deletion. Upload / sync details opens
and scrolls to the selected ride's panel; a persisted selected receipt is also visible there before login.
No schema/migration or recorder/filter changes. Existing lost-ack recovery uses Resume upload and the
same immutable identity, so retries do not create duplicates. Physical badge/scroll behavior awaits user testing.

Frontend `/admin/recorded-tracks` and `/admin/recorded-tracks/:id` now provide an owner-scoped staff
list and readable private ride summary. Added Recorded rides navigation only to DashboardLayout under
the existing RequireAdmin guard. They are distinct from horse Rides. Display miles/mph, recorded minutes,
GPS elevation estimates in feet, labels/notes and completion state. No publish/edit/delete or horse linkage
is introduced. Leaflet 1.9.4 is pinned/bundled and loaded in a separate admin chunk. Map offers USGS Topo,
OpenStreetMap and route-only mode, pan/zoom, fit, feet/mile scale, start/end and optional rejected markers.
Pause/reboot/gap boundaries stay separate using exact decimal-string BigInt clock arithmetic, matching
Android's millisecond threshold. Dateline coordinates wrap locally; Mercator display clamps polar latitudes.
No remote script/CDN dependency. Tile failures leave overlays usable; resize/cleanup handled explicitly.
Visible attribution and provider disclosure remain. No bulk/offline tile download or service-worker caching
of private API data; existing PWA precaches static code only, and map providers see viewed-area requests.

Django adds owner/staff/flag-protected, bounded GET `{id}/samples/?batch=N` for completed tracks only
(maximum 500 rows per read). List/detail now include owner identity and display metrics. No new Django
migration is needed. Responses remain private/no-store. Frontend verifies account/track/batch identity
and completeness, reuses JWT refresh, clears unused private query caches and existing logout reset,
provides loading/error/disabled/empty/incomplete states, and has no public fetch path. Notes and rejection
labels are rendered as text, never unsanitized HTML.

Field evidence update: user-supplied Django admin screenshots show a real uploaded test track finalized
on October 11 with 831 expected samples and two batches. This confirms observed server-side completion
of Android sync in the user's deployed environment; local phone receipt visibility was not confirmed in
0.5.0. These screenshots do not establish live anonymous-access behavior or all token/retry/endurance paths.
The agent has not deployed this viewer/status update, pushed commits, modified live settings/data, or
run live migrations. Backend sample-read update must be deployed to Render before the frontend viewer
is deployed to Cloudflare. Install the APK over 0.5.0 after finishing recording; do not uninstall/clear data.
The APK's status display itself works with the existing 0.5.0 backend and saved receipts.

Validation: Android debug build, 38 JVM/Robolectric tests, lint (0 errors, 13 warnings) and instrumentation
APK compilation pass. New disk-backed receipt test closes/reopens Room and checks SYNCED without
sign-in. Django 42 tests pass in isolated SQLite/storage/cache/email/JWT settings; map reads are checked
for completed-only access, batching, malformed indices and anonymous/nonstaff/cross-owner denial.
Frontend production/PWA build, 8 Node tests and ESLint on all changed/new JS/JSX pass. New tests cover
clock precision, gap/segment/rejection boundaries, dateline/polar/invalid/empty data and unit conversion.
Headless Edge checks with mocked authentication/API and synthetic points passed staff list/detail/map,
notes escaping, tile-failure fallback, 390px layout and anonymous/nonstaff redirects without track requests.
Desktop/mobile screenshots inspected. No real locations/credentials or live API calls used for browser tests.
Actual topo/OSM imagery was blocked in those tests; live tile coverage is not claimed. Build warnings:
existing frontend main bundle size/PWA deprecated option, GPX test nullability, SDK metadata and bounded
Gradle metaspace. PostgreSQL concurrency, phone token lifecycle/new UI and longer recorder endurance
remain open. The map and frontend cache behavior still need normal deployed-browser verification.
