from datetime import date
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess
from media_library.models import AnimalMedia
from .models import Ride, RideParticipant, TrainingSession, TrainingSkill, SessionSkillProgress
from .checklist import training_checklist


class ChecklistAndAdminTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(username="admin", is_staff=True)
        self.owner = get_user_model().objects.create_user(username="owner")
        self.horse = Animal.objects.create(name="Titus", species="horse", created_by=self.owner)
        self.session = TrainingSession.objects.create(animal=self.horse, title="Work", date=date(2024, 1, 1), created_by=self.admin)
        self.skill = TrainingSkill.objects.first()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def current_skill(self):
        checklist = training_checklist(self.horse)
        return next(s for category in checklist["categories"] for s in category["skills"] if s["id"] == self.skill.pk)

    def test_accomplishment_checkbox_requires_evidence(self):
        payload = {"session": self.session.pk, "skill": self.skill.pk, "accomplished": True}
        self.assertEqual(self.client.post("/api/training/progress/", payload, format="json").status_code, 400)
        payload["evidence"] = "Stands quietly for handling."
        response = self.client.post("/api/training/progress/", payload, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(self.current_skill()["accomplished"])
        self.assertEqual(self.client.patch(f"/api/training/progress/{response.data['id']}/", {"accomplished": False}, format="json").status_code, 200)
        self.assertFalse(self.current_skill()["accomplished"])

    def test_latest_general_context_backdate_and_future(self):
        SessionSkillProgress.objects.create(session=self.session, skill=self.skill, accomplished=True, evidence="First success", accomplishment="First calm handling", created_by=self.admin)
        newer = TrainingSession.objects.create(animal=self.horse, title="Revisit", date=date(2024, 2, 1), created_by=self.admin)
        SessionSkillProgress.objects.create(session=newer, skill=self.skill, accomplished=False, proficiency="needs_work", evidence="Needs more practice", created_by=self.admin)
        SessionSkillProgress.objects.create(session=newer, skill=self.skill, context="left side", accomplished=True, evidence="Left side works", created_by=self.admin)
        old = TrainingSession.objects.create(animal=self.horse, title="Backdated", date=date(2023, 1, 1), created_by=self.admin)
        future = TrainingSession.objects.create(animal=self.horse, title="Future", date=date(2099, 1, 1), created_by=self.admin)
        for session in [old, future]:
            SessionSkillProgress.objects.create(session=session, skill=self.skill, accomplished=True, evidence="Success", created_by=self.admin)
        row = self.current_skill()
        self.assertFalse(row["accomplished"])
        self.assertEqual(row["latest"]["session_id"], newer.pk)
        self.assertTrue(row["contexts"][0]["accomplished"])
        self.assertEqual(row["milestones"][0]["accomplishment"], "First calm handling")

    def test_checklist_includes_custom_skills_without_score(self):
        TrainingSkill.objects.create(code="custom-skill", name="Custom skill", category="Custom")
        response = self.client.get(f"/api/animals/{self.horse.slug}/training-checklist/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("score", response.data)
        self.assertNotIn("rubric", response.data)
        self.assertIn("Custom", [category["name"] for category in response.data["categories"]])

    def test_nonstaff_owner_cannot_write_any_training_resource(self):
        self.client.force_authenticate(self.owner)
        for resource in ["rides", "sessions", "progress", "locations", "skills"]:
            self.assertEqual(self.client.post(f"/api/training/{resource}/", {}, format="json").status_code, 403)
        self.assertEqual(self.client.patch(f"/api/training/sessions/{self.session.pk}/", {"notes": "Changed"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/training/sessions/{self.session.pk}/").status_code, 403)
        self.assertEqual(self.client.get(f"/api/training/sessions/{self.session.pk}/").status_code, 200)

    def test_ride_photo_and_video_upload_and_legacy_edit_permissions(self):
        ride = Ride.objects.create(title="Trail", date=date(2024, 1, 1), created_by=self.admin)
        RideParticipant.objects.create(ride=ride, animal=self.horse)
        for filename, media_type, mime in [("photo.jpg", "image", "image/jpeg"), ("clip.mp4", "video", "video/mp4")]:
            response = self.client.post(f"/api/training/rides/{ride.pk}/media/", {"animal": self.horse.pk, "media_type": media_type, "file": SimpleUploadedFile(filename, b"test media attachment", content_type=mime)}, format="multipart")
            self.assertEqual(response.status_code, 201, response.data)
            attachment = AnimalMedia.objects.get(pk=response.data["id"])
            self.assertEqual(attachment.content_object, ride)
            self.assertEqual(attachment.media_type, media_type)
        self.assertEqual(len(self.client.get(f"/api/training/rides/{ride.pk}/media/").data), 2)
        attachment = AnimalMedia.objects.first()
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(f"/api/training/rides/{ride.pk}/media/", {}, format="json").status_code, 403)
        self.assertEqual(self.client.patch(f"/api/media/{attachment.pk}/", {"caption": "Changed"}, format="json").status_code, 403)
        self.assertEqual(self.client.delete(f"/api/media/{attachment.pk}/").status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.delete(f"/api/media/{attachment.pk}/").status_code, 204)
