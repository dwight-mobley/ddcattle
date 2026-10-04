# Training & Riding: implementation decisions and legacy mapping

Status: backend implemented in /home/dmobley/dev/ddcattle/api after inspection of the current repository. 13 isolated database/API tests pass, Django system checks pass, and migration drift checks pass. Migrations have been generated but not applied to the application database. No production data or historical records have been imported.

## Available evidence

The referenced riding_logs.csv contains 43 records across six horse_id values. Its actual columns are id, horse_id, date, notes, created_at, updated_at, author_id. There are no structured location, rider, distance, duration, or skill columns. The attached models.py is the reminders model, not the animal or media model. Conversation snippets establish animals.models.animal.Animal, media_library.models.AnimalMedia, AnimalAccess, CanEditAnimalProfile, and a read-only animal timeline action; their current implementations still need inspection.

## Backend structure

- RidingLocation: reusable name, location type, address/city/state, optional validated coordinates, directions, facilities and notes; archive rather than delete locations referenced by history. Keep a free-text location snapshot on rides/sessions for one-off places and historical names.
- Ride: date, title, type, optional duration_minutes and distance_miles, route, terrain, weather, shared notes, location, creator and timestamps. Unknown duration/distance is null, not zero. Values must be nonnegative, with positive duration when supplied.
- RideParticipant: ride, animal, optional user rider and historical rider_name, horse-specific notes and optional participant duration/distance overrides. Enforce one participant per animal per ride. Overrides matter where a horse leaves early. Preserve rider names without requiring accounts. A ride's creation with participants should be atomic.
- TrainingSession: animal, date, session type, optional trainer account and trainer_name, location/free-text snapshot, duration, goals, notes, successes and next steps, creator and timestamps. Allow an optional ride link for training done during a ride; neither record automatically creates the other.
- TrainingSkill: stable unique code, name, category, descriptions of assessment criteria, active flag and versioned rubric membership. Avoid treating skill renaming as a new skill.
- SessionSkillProgress: session, skill, assessed proficiency, accomplishment description, context (for example left/right side, mounted/unmounted), evidence notes and assessor. Enforce a unique session/skill/context observation. Assessment is optional: a practiced skill can be logged without a proficiency claim. Record milestones separately from proficiency so one first success does not imply mastery.
- Media: use existing AnimalMedia content_type/object_id fields and storage/upload pipeline. Inspect exact GenericForeignKey field names before adding reverse relations; GenericRelation can cause attached media deletion when its parent is deleted. Preserve gallery discoverability for every participating horse, validate that the media's animal belongs to its target, and use existing visibility/access rules. Do not introduce a second upload system.
- API/admin: serializers with explicit fields and server-assigned created_by; protect participant/session reassignment, validate horses, expose filters by animal/date/location. Check access on all horses in a shared ride, including create and participant changes. Reuse verified project permissions; authentication alone is insufficient. Historical imports should not fabricate user identities.

## Explainable training rating

Use a named, versioned rubric with a fixed set of skills, positive weights and published assessment criteria. Suggested proficiency points: needs_work=0, introduced=20, learning=40, improving=60, reliable=80, mastered=100. These are rubric constants, not user-entered scores.

Select the latest dated assessed observation per animal/skill/context, using a deterministic tie-breaker. Backdated additions must not replace newer assessments. Regressions must lower the current rating; do not take the all-time maximum. For bilateral skills, the rubric should explicitly define whether both sides are required and use the weaker side when so defined.

Return algorithm/rubric version, denominator and numerator, per-skill weights and contributions, proficiency labels, source session IDs/dates, milestone evidence, category totals, and evidence coverage. Unknown proficiency is distinct from needs_work. Return null overall score until minimum rubric coverage is met. Once eligible, calculate sum(weight * points) / sum(all rubric weights); unknown required skills earn no demonstrated points and are explicitly labeled unassessed. Also return assessed-only proficiency and coverage so incomplete records are visible. Pin rubric membership/weights to a version: adding a skill to the catalog must not silently change an existing rubric.

A milestone alone never grants mastery. Historical prose generates review suggestions, not approved assessments. The rating describes recorded training evidence; it does not establish a horse's suitability for a particular rider. Deleting or editing evidence recalculates results without maintaining a manually editable cached score.

## Timeline integration

Extend the current aggregation after its animal access check. Query rides through participants for this animal, once per ride, and sessions directly by animal. Emit existing-shaped envelopes with stable ride-<pk> and training-<pk> IDs, source_id, type, normalized date, title, description and serialized data. Sort alongside existing events with deterministic tie-breakers. Do not create TimelineEvent rows or signals that copy records into a second history table. Prefetch participants/progress/media to avoid per-item queries. Verify existing media visibility in the timeline and exclude attached media from a second standalone presentation if the UI displays it inside its parent event; the monthly gallery can still contain it.

## CSV field mapping

| Legacy field | Destination | Rule |
| --- | --- | --- |
| id | Import provenance source key | Retain dataset + ID, unique per source row; multiple source rows may point to one shared ride. |
| horse_id | Participant animal or session animal | Resolve via verified old-to-current ID crosswalk, never names inferred from prose alone. |
| date | Ride/session date | Preserve written calendar date; midnight timestamp does not establish a real session start time. |
| notes | Participant/session notes and raw provenance | Preserve verbatim. Extract shared facts only after review. |
| author_id | Verified creator mapping | Author is not automatically rider/trainer. Unmatched accounts require an explicit import policy. |
| created_at / updated_at | Legacy provenance timestamps | Preserve separately; these are often batch migration timestamps, not activity dates. |

Location, duration, distance, companions, rider, route and skills are prose extractions requiring approval. Preserve approximate wording and break inclusions. Do not infer coordinates, distances, or precision.

## Concrete review groups

- IDs 29 and 30: likely one Don Carter State Park ride on 2024-01-01, 7.25 miles, about 210 minutes including a break. Two horse participants; David explicitly rode Henry. Titus's rider is not explicitly named. Preserve each participant's original notes and route. Confirm identities and grouping before merging.
- IDs 9–12: likely one 2023-08-19 group ride with Titus, Henry, Dancer and Tid Bit. Three accounts say about four miles/two hours, while Dancer's says about one hour. Do not silently discard that discrepancy: review participant duration override versus a distinct ride.
- IDs 13 and 14: likely shared 2023-08-25 ride, approximately four miles. No duration supplied.
- ID 2: mounted training focused on sustained trot. Thirty minutes describes trot work, not necessarily total session duration.
- IDs 16–17, 19–21, 59–63, 65–68: training candidates. ID 19 spans trailer loading and round-pen saddling; the three hours applies to loading, not the entire day.
- IDs 18 and 22: veterinary/hoof-care handling narratives. Review as training observations or retain as historical notes; do not duplicate already imported medical records.
- ID 58: arrival/bonding note rather than a mounted ride. Preserve as a historical training journal note only if that classification is accepted.
- ID 64: retrospective summary of multiple 2025 rides and future intentions written on 2026-03-07. Do not create a dated ride, miles or saddle-time statistics from it. Mentioned locations can be review suggestions for the location catalog.
- ID 67: Rook is the subject of training with Titus assisting. Do not award Titus Rook's accomplishments or create a Titus ride solely because the trainer was mounted.
- ID 68: 90-minute session with differing left/right outcomes. Preserve context; a right-side success must not overwrite left-side difficulty.

## Incremental implementation and checks

1. Obtain current repository and inspect instructions, dependencies, migration leaf nodes, animal/horse models, AnimalAccess, media serializers/upload endpoints, admin conventions and the timeline action.
2. Add models/migrations without altering historical models; verify migration plan against a disposable database and confirm no migration drift.
3. Add permissions, serializers, viewsets, router registration and admin using current conventions. Keep changes additive.
4. Add computed rating and timeline queries. Test shared-ride deduplication, chronological/backdated assessment behavior, regressions, coverage, rubric stability, foreign-animal access denial, invalid media target denial, partial updates, transaction rollback and visibility.
5. Prepare a separate reviewed import manifest with all 43 source rows, crosswalks, classification, group keys, extraction confidence and unresolved conflicts. Use an idempotent provenance table with one unique key per dataset/source row, accommodating many rows per merged ride.
6. Run dry-run import and count reconciliation only after mapping review. No production import is authorized by this implementation request.


## Implemented backend and rollout

The implementation now lives in the existing WSL Django repository. The design sections above distinguish proposed extensions from the concrete implementation described here.

- Additive app: training. Routes: /api/training/locations/, rides/, sessions/, skills/, progress/. Ride participants are nested writes on rides: POST requires at least one participant; PATCH without participants leaves them unchanged. Supplying participants replaces membership, updating retained horse rows. Participant duration/distance overrides preserve per-horse differences.
- Photos/videos: GET/POST /api/training/rides/<id>/media/ and /api/training/sessions/<id>/media/. Use the existing multipart fields animal, file, media_type, caption, description, public. Target is assigned by the server; the existing gallery remains the update/delete route. No GenericRelation deletion cascade or new storage pipeline was added.
- Animal timeline emits ride/training envelopes directly; no TimelineEvent model exists. Attached media stays a separate gallery/timeline media item; activity envelopes do not duplicate media payloads. Each media row belongs to one animal; attaching a file to a shared ride does not automatically add it to every horse's gallery.
- GET /api/animals/<slug>/training-rating/ returns the versioned foundation-v1 rubric, contribution breakdown, coverage, source dates and evidence. Context-specific evidence is deliberately excluded from the general rating; record a separate context-free assessment when general proficiency is established. The initial ten-skill rubric uses equal weights; catalog additions do not change it. Minimum evidence coverage is 50%. Unknown skills are explicit and do not count as demonstrated points; needs_work is an assessed zero. Future-dated assessments do not contribute. No score is editable or cached on Animal.
- Training records and ratings require authentication and animal access. Active viewers can read but cannot write. Animal creators, staff, active owners/managers or access entries with can_manage_training may manage records. Uploads additionally require can_upload_media unless creator/staff. Shared ride access requires access to all participants; writes require management of all participants. Locations are currently scoped to their creator (staff can access all), reusable within that scope. Skills are authenticated-readable and staff-editable.
- Additive migrations: animals/0006_animalaccess_can_manage_training; training/0001_initial; training/0002_foundation_skills. The permission flag defaults to false; existing owner/manager roles continue to manage training. The seed adds a skill catalog only and imports no historical records.
- On a staging/local copy, run python manage.py migrate --plan, then python manage.py migrate and python manage.py check. Production migrations were not run. Database verification was performed exclusively with training.test_settings (fresh SQLite, memory storage, local email/cache), never DATABASE_URL.
- Run python manage.py test training --settings=training.test_settings. Review object deletion separately in admin: DRF blocks deletion of records that still have media/linked sessions; the trusted staff admin follows normal Django behavior. Prefer preserving historical records.
- Incremental limitations: rubric configuration is versioned in code rather than an editable database rubric builder; context aggregation, per-category summaries, location sharing across accounts, and multi-animal gallery attribution can be added later. No automatic prose extraction, import command, front-end changes or production import were added.
