from datetime import date
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from animals.models.animal import Animal
from .models import Ride, RideSkillProgress, TrainingSession, TrainingSkill, SessionSkillProgress
from .checklist import training_checklist


class BulkSkillTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(username="admin", is_staff=True)
        self.horse = Animal.objects.create(name="Titus", species="horse", created_by=self.admin)
        self.second = Animal.objects.create(name="Henry", species="horse", created_by=self.admin)
        self.skills = list(TrainingSkill.objects.filter(active=True)[:2])
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def ride_payload(self):
        return {"title": "Don Carter", "date": "2024-01-01", "participants": [{"animal": self.horse.pk}, {"animal": self.second.pk}], "skill_checks": [{"animal": self.horse.pk, "skill": s.pk, "evidence": "Calmly demonstrated on the trail."} for s in self.skills]}

    def checklist_skill(self, animal, skill):
        return next(s for c in training_checklist(animal)["categories"] for s in c["skills"] if s["id"] == skill.pk)

    def test_shared_ride_skills_and_timeline_without_extra_sessions(self):
        result = self.client.post("/api/training/rides/", self.ride_payload(), format="json")
        self.assertEqual(result.status_code, 201, result.data)
        self.assertEqual(len(result.data["skill_checks"]), 2)
        self.assertFalse(TrainingSession.objects.exists())
        for skill in self.skills:
            observation = self.checklist_skill(self.horse, skill)
            self.assertTrue(observation["accomplished"])
            self.assertEqual(observation["latest"]["ride_id"], result.data["id"])
            self.assertFalse(self.checklist_skill(self.second, skill)["accomplished"])
        events = self.client.get(f"/api/animals/{self.horse.slug}/timeline/").data
        self.assertEqual(len([e for e in events if e["type"] == "ride"]), 1)
        self.assertEqual(len([e for e in events if e["type"] == "training"]), 0)

    def test_invalid_bulk_create_leaves_no_partial_ride(self):
        for modify in [lambda p: p["skill_checks"][0].update(evidence=" "), lambda p: p["skill_checks"].append(p["skill_checks"][0].copy()), lambda p: p["skill_checks"][0].update(animal=999999)]:
            payload = self.ride_payload()
            modify(payload)
            self.assertEqual(self.client.post("/api/training/rides/", payload, format="json").status_code, 400)
        self.assertFalse(Ride.objects.exists())
        self.assertFalse(RideSkillProgress.objects.exists())

    def test_edit_ride_checks_and_preserve_when_field_omitted(self):
        result = self.client.post("/api/training/rides/", self.ride_payload(), format="json")
        url = f"/api/training/rides/{result.data['id']}/"
        self.assertEqual(self.client.patch(url, {"notes": "Changed"}, format="json").status_code, 200)
        self.assertEqual(RideSkillProgress.objects.count(), 2)
        checks = [{"animal": self.second.pk, "skill": self.skills[0].pk, "evidence": "Henry demonstrated this."}]
        self.assertEqual(self.client.patch(url, {"skill_checks": checks}, format="json").status_code, 200)
        self.assertEqual(RideSkillProgress.objects.count(), 1)
        self.assertFalse(self.checklist_skill(self.horse, self.skills[0])["accomplished"])
        self.assertTrue(self.checklist_skill(self.second, self.skills[0])["accomplished"])
        response = self.client.patch(url, {"participants": [{"animal": self.horse.pk}]}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_session_bulk_preserves_context_and_detailed_proficiency(self):
        payload = {"animal": self.horse.pk, "title": "Existing skills review", "date": "2024-01-01", "session_type": "journal", "skill_checks": [{"skill": s.pk, "evidence": "Confirmed through years of handling."} for s in self.skills]}
        result = self.client.post("/api/training/sessions/", payload, format="json")
        self.assertEqual(result.status_code, 201, result.data)
        session = TrainingSession.objects.get(pk=result.data["id"])
        observation = session.skill_progress.get(skill=self.skills[0])
        observation.proficiency = "reliable"
        observation.accomplishment = "First willing attempt"
        observation.save()
        context = SessionSkillProgress.objects.create(session=session, skill=self.skills[0], context="left side", evidence="Good on left", created_by=self.admin)
        response = self.client.patch(f"/api/training/sessions/{session.pk}/", {"skill_checks": [payload["skill_checks"][0]]}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        observation.refresh_from_db()
        self.assertEqual(observation.proficiency, "reliable")
        self.assertEqual(observation.accomplishment, "First willing attempt")
        self.assertTrue(SessionSkillProgress.objects.filter(pk=context.pk).exists())
        self.assertEqual(session.skill_progress.filter(accomplished=True).count(), 1)

    def test_ride_date_respects_newer_regression_and_future(self):
        result = self.client.post("/api/training/rides/", self.ride_payload(), format="json")
        session = TrainingSession.objects.create(animal=self.horse, title="Revisit", date=date(2024, 2, 1), created_by=self.admin)
        SessionSkillProgress.objects.create(session=session, skill=self.skills[0], proficiency="needs_work", evidence="Needs practice again", created_by=self.admin)
        self.assertFalse(self.checklist_skill(self.horse, self.skills[0])["accomplished"])
        url = f"/api/training/rides/{result.data['id']}/"
        self.client.patch(url, {"date": "2099-01-01"}, format="json")
        self.assertFalse(self.checklist_skill(self.horse, self.skills[1])["accomplished"])

    def test_nonstaff_cannot_submit_bulk_skills(self):
        owner = get_user_model().objects.create_user(username="owner")
        self.client.force_authenticate(owner)
        self.assertEqual(self.client.post("/api/training/rides/", self.ride_payload(), format="json").status_code, 403)
        self.assertEqual(self.client.post("/api/training/sessions/", {"animal": self.horse.pk, "skill_checks": []}, format="json").status_code, 403)
