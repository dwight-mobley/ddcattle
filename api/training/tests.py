from datetime import date
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess
from media_library.models import AnimalMedia
from .models import Ride, RideParticipant, TrainingSession, TrainingSkill, SessionSkillProgress
from .rating import training_rating


class TrainingTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username="trainer")
        self.other = get_user_model().objects.create_user(username="other")
        self.horse = Animal.objects.create(name="Titus", species="horse", created_by=self.user)
        self.second = Animal.objects.create(name="Henry", species="horse", created_by=self.user)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def ride(self):
        return self.client.post("/api/training/rides/", {"title": "Shared ride", "date": "2024-01-01", "distance_miles": "7.25", "participants": [{"animal": self.horse.pk}, {"animal": self.second.pk, "rider_name": "David"}]}, format="json")

    def session(self, when=date(2024, 1, 1)):
        return TrainingSession.objects.create(animal=self.horse, title="Work", date=when, created_by=self.user)

    def test_shared_ride_timeline_and_partial_update(self):
        response = self.ride()
        self.assertEqual(response.status_code, 201, response.data)
        ride_id = response.data["id"]
        for horse in [self.horse, self.second]:
            events = self.client.get(f"/api/animals/{horse.slug}/timeline/").data
            self.assertEqual([e["id"] for e in events if e["type"] == "ride"], [f"ride-{ride_id}"])
        self.assertEqual(self.client.patch(f"/api/training/rides/{ride_id}/", {"notes": "Updated"}, format="json").status_code, 200)
        self.assertEqual(RideParticipant.objects.count(), 2)
        self.assertEqual(self.client.patch(f"/api/training/rides/{ride_id}/", {"participants": []}, format="json").status_code, 400)

    def test_cross_animal_denial_and_read_scope(self):
        foreign = Animal.objects.create(name="Private", species="horse", created_by=self.other)
        response = self.client.post("/api/training/rides/", {"title": "Denied", "date": "2024-01-01", "participants": [{"animal": self.horse.pk}, {"animal": foreign.pk}]}, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Ride.objects.exists())
        ride = self.ride().data["id"]
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/training/rides/{ride}/").status_code, 404)
        self.assertEqual(self.client.get(f"/api/animals/{self.horse.slug}/training-rating/").status_code, 403)

    def test_rating_latest_regression_backdate_and_coverage(self):
        old = self.session()
        skills = list(TrainingSkill.objects.order_by("code")[:5])
        for skill in skills:
            SessionSkillProgress.objects.create(session=old, skill=skill, proficiency="mastered", evidence="Repeated success", created_by=self.user)
        rating = training_rating(self.horse)
        self.assertEqual(rating["coverage"], 0.5)
        self.assertEqual(rating["score"], 50)
        recent = self.session(date(2024, 2, 1))
        assessment = SessionSkillProgress.objects.create(session=recent, skill=skills[0], proficiency="needs_work", evidence="Current difficulty", created_by=self.user)
        self.assertEqual(training_rating(self.horse)["score"], 40)
        backdated = self.session(date(2023, 1, 1))
        SessionSkillProgress.objects.create(session=backdated, skill=skills[0], proficiency="mastered", created_by=self.user)
        self.assertEqual(training_rating(self.horse)["score"], 40)
        TrainingSkill.objects.create(code="new-skill", name="New skill", category="Other")
        self.assertEqual(training_rating(self.horse)["total_weight"], 10)
        assessment.delete()
        self.assertEqual(training_rating(self.horse)["score"], 50)
        SessionSkillProgress.objects.filter(skill=skills[0]).delete()
        self.assertIsNone(training_rating(self.horse)["score"])

    def test_progress_evidence_and_session_reassignment(self):
        session = self.session()
        skill = TrainingSkill.objects.first()
        response = self.client.post("/api/training/progress/", {"session": session.pk, "skill": skill.pk, "proficiency": "mastered"}, format="json")
        self.assertEqual(response.status_code, 400)
        response = self.client.patch(f"/api/training/sessions/{session.pk}/", {"animal": self.second.pk}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_media_attachment_membership_and_delete_guard(self):
        ride_id = self.ride().data["id"]
        image = SimpleUploadedFile("photo.jpg", b"photo", content_type="image/jpeg")
        response = self.client.post(f"/api/training/rides/{ride_id}/media/", {"animal": self.horse.pk, "media_type": "image", "file": image}, format="multipart")
        self.assertEqual(response.status_code, 201, response.data)
        media = AnimalMedia.objects.get()
        self.assertEqual(media.content_object.pk, ride_id)
        self.assertIsInstance(media.content_object, Ride)
        self.assertEqual(self.client.delete(f"/api/training/rides/{ride_id}/").status_code, 400)
        self.assertEqual(self.client.patch(f"/api/training/rides/{ride_id}/", {"participants": [{"animal": self.second.pk}]}, format="json").status_code, 400)
        outsider = Animal.objects.create(name="Rook", species="horse", created_by=self.user)
        image = SimpleUploadedFile("other.jpg", b"photo", content_type="image/jpeg")
        response = self.client.post(f"/api/training/rides/{ride_id}/media/", {"animal": outsider.pk, "media_type": "image", "file": image}, format="multipart")
        self.assertEqual(response.status_code, 400)

    def test_viewer_cannot_write(self):
        session = self.session()
        AnimalAccess.objects.create(animal=self.horse, user=self.other, role="viewer")
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/training/sessions/{session.pk}/").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/training/sessions/{session.pk}/", {"notes": "Changed"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/training/sessions/{session.pk}/").status_code, 403)

    def test_database_constraints(self):
        ride = Ride.objects.create(title="Ride", date=date(2024, 1, 1), created_by=self.user)
        RideParticipant.objects.create(ride=ride, animal=self.horse)
        with self.assertRaises(IntegrityError), transaction.atomic():
            RideParticipant.objects.create(ride=ride, animal=self.horse)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Ride.objects.create(title="Bad", date=date(2024, 1, 1), created_by=self.user, distance_miles=-1)

    def test_legacy_gallery_protects_training_attachment(self):
        session = self.session()
        media = AnimalMedia.objects.create(animal=self.horse, content_object=session, media_type="image", file="private.jpg", uploaded_by=self.user)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/media/{media.pk}/").status_code, 404)
        self.assertEqual(self.client.delete(f"/api/media/{media.pk}/").status_code, 404)
        AnimalAccess.objects.create(animal=self.horse, user=self.other, role="viewer")
        self.assertEqual(self.client.get(f"/api/media/{media.pk}/").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/media/{media.pk}/", {"caption": "Changed"}, format="json").status_code, 403)
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.get(f"/api/media/{media.pk}/").status_code, 404)
        timeline = self.client.get(f"/api/animals/{self.horse.slug}/timeline/").data
        self.assertNotIn(f"media-{media.pk}", [e["id"] for e in timeline])
        self.assertNotIn(f"training-{session.pk}", [e["id"] for e in timeline])

    def test_shared_ride_hidden_when_one_participant_inaccessible(self):
        ride_id = self.ride().data["id"]
        AnimalAccess.objects.create(animal=self.horse, user=self.other, role="trainer", can_manage_training=True)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(f"/api/training/rides/{ride_id}/").status_code, 404)
        AnimalAccess.objects.create(animal=self.second, user=self.other, role="viewer")
        self.assertEqual(self.client.get(f"/api/training/rides/{ride_id}/").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/training/rides/{ride_id}/", {"notes": "Change"}, format="json").status_code, 403)

    def test_training_timeline_and_patch_evidence(self):
        session = self.session()
        progress = SessionSkillProgress.objects.create(session=session, skill=TrainingSkill.objects.first(), proficiency="learning", evidence="Needs help", created_by=self.user)
        self.assertEqual(self.client.patch(f"/api/training/progress/{progress.pk}/", {"evidence": ""}, format="json").status_code, 400)
        events = self.client.get(f"/api/animals/{self.horse.slug}/timeline/").data
        self.assertEqual([e["id"] for e in events if e["type"] == "training"], [f"training-{session.pk}"])

    def test_future_and_context_assessments_do_not_inflate_rating(self):
        future = self.session(date(2099, 1, 1))
        general = self.session()
        for skill in TrainingSkill.objects.all():
            SessionSkillProgress.objects.create(session=future, skill=skill, proficiency="mastered", created_by=self.user)
            SessionSkillProgress.objects.create(session=general, skill=skill, proficiency="mastered", context="right", created_by=self.user)
        self.assertEqual(training_rating(self.horse)["coverage"], 0)
        self.assertIsNone(training_rating(self.horse)["score"])

    def test_session_ride_membership_and_participant_removal(self):
        ride_id = self.ride().data["id"]
        session = self.session()
        self.assertEqual(self.client.patch(f"/api/training/sessions/{session.pk}/", {"ride": ride_id}, format="json").status_code, 200)
        self.assertEqual(self.client.patch(f"/api/training/rides/{ride_id}/", {"participants": [{"animal": self.second.pk}]}, format="json").status_code, 400)

    def test_invalid_inputs_and_duplicate_participants(self):
        data = {"title": "Bad", "date": "2024-01-01", "participants": [{"animal": self.horse.pk}, {"animal": self.horse.pk}]}
        self.assertEqual(self.client.post("/api/training/rides/", data, format="json").status_code, 400)
        data["participants"] = [{"animal": self.horse.pk}]
        data["duration_minutes"] = 0
        self.assertEqual(self.client.post("/api/training/rides/", data, format="json").status_code, 400)
        self.assertEqual(self.client.get("/api/training/rides/?date_from=nonsense").status_code, 400)
        self.assertEqual(self.client.post("/api/training/locations/", {"name": "Park", "latitude": "35"}, format="json").status_code, 400)
