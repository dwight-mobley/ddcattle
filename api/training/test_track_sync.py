from pathlib import Path
import json
import uuid
from django.contrib.auth import get_user_model
from django.contrib.admin.sites import AdminSite
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from .models import RecordedTrack, RecordedTrackBatch, Ride, RideParticipant
from .track_sync import digest
from .admin import RecordedTrackAdmin

BASE = "/api/training/recorded-tracks/"

def point(i, **changes):
    p = dict(sequence=i, segment=0, timestamp_ms=1000+i*5000, monotonic_ns=str(1000000000+i*5000000000), latitude=34.0,
             longitude=-83.0, accuracy_m=3.0, speed_mps=None, altitude_m=None, vertical_accuracy_m=None,
             accepted=True, rejection=None, invalid_fields=[])
    p.update(changes); return p

def payload(points):
    return json.dumps(points, separators=(",", ":"), allow_nan=False)

def manifest(points, **changes):
    batches = [payload(points[i:i+500]) for i in range(0, len(points), 500)]
    hashes = [digest(b) for b in batches]
    m = dict(format_version=1, client_ride_uuid=str(uuid.uuid4()), revision=1, source="ANDROID_FUSED", kind="VEHICLE_TEST",
             filter_version="android-1", started_at_ms=1000, ended_at_ms=100000, active_ms=99000, moving_ms=5000,
             expected_samples=len(points), batch_digests=hashes, payload_digest=digest("\n".join(hashes)),
             title="Private commute", notes="Private note", horse_name="", location_name="Barn", distance_m=1609.344, gain_m=0, loss_m=0)
    m.update(changes)
    text=payload(m)
    return {"manifest": text, "digest": digest(text)}, batches

@override_settings(RIDE_SYNC_ENABLED=True, SECRET_KEY="private-sync-isolated-test-signing-key-not-for-production")
class PrivateTrackTests(TestCase):
    def setUp(self):
        users=get_user_model()
        self.owner=users.objects.create_user(username="tester", password="test-password", is_staff=True)
        self.other=users.objects.create_user(username="other-tester", is_staff=True)
        self.regular=users.objects.create_user(username="customer")
        self.client=APIClient(); self.client.force_authenticate(self.owner)

    def create(self, points=None, **changes):
        request,batches=manifest(points if points is not None else [point(0),point(1)], **changes)
        response=self.client.post(BASE,request,format="json")
        self.assertEqual(response.status_code,201,response.data)
        self.assertEqual(response["Cache-Control"],"private, no-store")
        return response.data["id"],request,batches

    def batch(self,id,index,text):
        return self.client.post(f"{BASE}{id}/batch/",dict(index=index,payload=text,digest=digest(text)),format="json")

    def finish(self,id,request):
        return self.client.post(f"{BASE}{id}/finalize/",dict(payload_digest=json.loads(request["manifest"])["payload_digest"]),format="json")

    @override_settings(RIDE_SYNC_ENABLED=False)
    def test_default_gate_is_closed(self):
        self.assertEqual(self.client.get(BASE+"capabilities/").status_code,503)
        request,_=manifest([])
        self.assertEqual(self.client.post(BASE,request,format="json").status_code,503)
        self.assertEqual(RecordedTrack.objects.count(),0)

    def test_anonymous_and_nonstaff_are_denied_on_every_action(self):
        id,request,batches=self.create()
        for user,code in [(None,401),(self.regular,403)]:
            self.client.force_authenticate(user)
            for path in [BASE,BASE+"capabilities/",f"{BASE}{id}/"]:
                self.assertEqual(self.client.get(path).status_code,code)
            for path,body in [(BASE,request),(f"{BASE}{id}/batch/",{}),(f"{BASE}{id}/finalize/",{})]:
                self.assertEqual(self.client.post(path,body,format="json").status_code,code)

    def test_staff_api_is_owner_scoped_and_same_uuid_can_exist_for_two_owners(self):
        id,request,batches=self.create()
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(BASE).data["count"],0)
        self.assertEqual(self.client.get(f"{BASE}{id}/").status_code,404)
        self.assertEqual(self.batch(id,0,batches[0]).status_code,404)
        self.assertEqual(self.finish(id,request).status_code,404)
        self.assertEqual(self.client.post(BASE,request,format="json").status_code,201)
        self.assertEqual(RecordedTrack.objects.count(),2)

    def test_real_jwt_login_and_refresh_use_existing_account(self):
        self.client.force_authenticate(None)
        tokens=self.client.post("/api/token/",dict(username="tester",password="test-password"),format="json").data
        self.client.credentials(HTTP_AUTHORIZATION="Bearer "+tokens["access"])
        self.assertEqual(self.client.get("/api/me/").data["id"],self.owner.pk)
        cap=self.client.get(BASE+"capabilities/")
        self.assertEqual(cap.status_code,200);self.assertEqual(cap.data["visibility"],"PRIVATE_TEST")
        self.assertEqual(self.client.post("/api/token/refresh/",dict(refresh=tokens["refresh"]),format="json").status_code,200)

    def test_repeated_manifest_batches_and_lost_finalize_response_are_idempotent(self):
        points=[point(0),point(1,rejection="gap"),point(2,accepted=False,rejection="accuracy",accuracy_m=80)]
        id,request,batches=self.create(points)
        self.assertEqual(self.client.post(BASE,request,format="json").status_code,200)
        self.assertEqual(self.finish(id,request).status_code,400) # Missing batch cannot become complete.
        for _ in range(2): self.assertEqual(self.batch(id,0,batches[0]).status_code,200)
        first=self.finish(id,request);second=self.finish(id,request)
        self.assertEqual(first.status_code,200,first.data);self.assertEqual(second.data,first.data)
        self.assertEqual(first.data["state"],"COMPLETE");self.assertEqual(first.data["visibility"],"PRIVATE_TEST")
        self.assertEqual(RecordedTrack.objects.count(),1);self.assertEqual(RecordedTrackBatch.objects.count(),1)
        self.assertEqual(Ride.objects.count(),0);self.assertEqual(RideParticipant.objects.count(),0)
        self.assertEqual(self.client.get("/api/training/rides/").data,[])
        self.assertEqual(self.client.patch(f"{BASE}{id}/",{},format="json").status_code,405)
        self.assertEqual(self.client.delete(f"{BASE}{id}/").status_code,405)

    def test_changed_manifest_or_batch_is_conflict_and_never_overwrites(self):
        id,request,batches=self.create()
        altered=json.loads(request["manifest"]);altered["notes"]="Different"
        text=payload(altered)
        self.assertEqual(self.client.post(BASE,dict(manifest=text,digest=digest(text)),format="json").status_code,409)
        self.assertEqual(self.batch(id,0,payload([point(0,latitude=35),point(1)])).status_code,409)
        self.assertEqual(RecordedTrack.objects.get(pk=id).manifest["notes"],"Private note")
        self.assertEqual(RecordedTrackBatch.objects.count(),0)

    def test_no_owner_publication_or_animal_injection(self):
        for change in [dict(owner=self.other.pk),dict(visibility="PUBLIC"),dict(animal_id=1),dict(location_id=1),dict(kind="PUBLIC")]:
            request,_=manifest([],**change)
            self.assertEqual(self.client.post(BASE,request,format="json").status_code,400)
        self.assertEqual(RecordedTrack.objects.count(),0)

    def test_malformed_and_oversized_requests_leave_no_record(self):
        for body in [[],[{}],dict(manifest="{",digest=digest("{")),dict(manifest="[]",digest="wrong"),dict(manifest="x"*(512*1024+1),digest="0"*64)]:
            self.assertEqual(self.client.post(BASE,body,format="json").status_code,400)
        request,_=manifest([],expected_samples=20001)
        self.assertEqual(self.client.post(BASE,request,format="json").status_code,400)
        request,_=manifest([],expected_samples="0")
        self.assertEqual(self.client.post(BASE,request,format="json").status_code,400)
        self.assertEqual(RecordedTrack.objects.count(),0)

    def test_invalid_samples_and_sequence_are_rejected_atomically(self):
        for bad in [point(0,latitude=95),point(0,accepted=True,accuracy_m=80),point(4),point(0,monotonic_ns="-5"),point(0,accepted="true"),point(0,speed_mps=float("inf"))]:
            # Nonfinite JSON itself is separately rejected by parse_exact.
            text=json.dumps([bad],separators=(",",":"))
            request,_=manifest([])
            m=json.loads(request["manifest"]);m.update(expected_samples=1,batch_digests=[digest(text)],payload_digest=digest(digest(text)))
            raw=payload(m);request=dict(manifest=raw,digest=digest(raw))
            response=self.client.post(BASE,request,format="json");id=response.data["id"]
            self.assertEqual(self.batch(id,0,text).status_code,400)
            self.assertEqual(RecordedTrackBatch.objects.filter(track_id=id).count(),0)
            self.assertIsNone(RecordedTrack.objects.get(pk=id).completed_at)

    def test_rejected_out_of_order_and_invalid_optional_altitude_are_preserved(self):
        points=[point(0,altitude_m=None,invalid_fields=["altitude_m"]),point(1,accepted=False,rejection="out of order",monotonic_ns="1"),point(2)]
        id,request,batches=self.create(points)
        self.assertEqual(self.batch(id,0,batches[0]).status_code,200)
        self.assertEqual(self.finish(id,request).status_code,200)
        self.assertEqual(json.loads(RecordedTrackBatch.objects.get(track_id=id).payload),points)

    def test_out_of_order_batches_resume_but_bad_accepted_clock_blocks_completion(self):
        id,request,batches=self.create([point(i) for i in range(501)])
        self.assertEqual(self.batch(id,1,batches[1]).status_code,200)
        self.assertEqual(self.finish(id,request).status_code,400)
        self.assertEqual(self.batch(id,0,batches[0]).status_code,200)
        self.assertEqual(self.finish(id,request).status_code,200)
        id,request,batches=self.create([point(0),point(1,monotonic_ns="1")])
        self.assertEqual(self.batch(id,0,batches[0]).status_code,200)
        self.assertEqual(self.finish(id,request).status_code,400)
        self.assertIsNone(RecordedTrack.objects.get(pk=id).completed_at)

    def test_admin_displays_escaped_private_details_and_no_edit_publish_action(self):
        id,_,_=self.create([],title="<script>private</script>")
        admin=RecordedTrackAdmin(RecordedTrack,AdminSite())
        html=admin.private_details(RecordedTrack.objects.get(pk=id))
        self.assertIn("&lt;script&gt;",html);self.assertNotIn("<script>",html)
        self.assertFalse(admin.has_add_permission(None));self.assertFalse(admin.has_change_permission(None))

    def test_actual_android_serialization_uploads_without_cross_language_digest_changes(self):
        fixture=json.loads((Path(__file__).parent / "testdata/android_sync_v1.json").read_text())
        response=self.client.post(BASE,fixture["request"],format="json")
        self.assertEqual(response.status_code,201,response.data);id=response.data["id"]
        for i,batch in enumerate(fixture["batches"]):
            response=self.batch(id,i,batch)
            self.assertEqual(response.status_code,200,response.data)
        response=self.finish(id,fixture["request"])
        self.assertEqual(response.status_code,200,response.data)
        self.assertEqual(response.data["state"],"COMPLETE")
        self.assertEqual(RecordedTrack.objects.get(pk=id).manifest["expected_samples"],501)
        self.assertEqual(RecordedTrackBatch.objects.filter(track_id=id).count(),2)

    def test_private_map_reads_are_owner_scoped_completed_only_and_bounded(self):
        id,request,batches=self.create([point(i) for i in range(501)])
        url=f"{BASE}{id}/samples/"
        self.assertEqual(self.client.get(url).status_code,400)
        for i,b in enumerate(batches):self.assertEqual(self.batch(id,i,b).status_code,200)
        self.assertEqual(self.finish(id,request).status_code,200)
        response=self.client.get(url)
        self.assertEqual(response.status_code,200);self.assertEqual(len(response.data["samples"]),500)
        self.assertEqual(response.data["owner_id"],str(self.owner.pk));self.assertEqual(response["Cache-Control"],"private, no-store")
        self.assertEqual(len(self.client.get(url+"?batch=1").data["samples"]),1)
        for index in ["2","-1","wat","99999999999999"]:self.assertEqual(self.client.get(url+"?batch="+index).status_code,400)
        for user,code in [(None,401),(self.regular,403),(self.other,404)]:
            self.client.force_authenticate(user);self.assertEqual(self.client.get(url).status_code,code)
