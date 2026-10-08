from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from animals.models.animal import Animal
from .models import TrainingSession, TrainingSkill, SessionSkillProgress
from .checklist import training_checklist


class DynamicSkillTests(TestCase):
    def setUp(self):
        self.admin = get_user_model().objects.create_user(username="admin", is_staff=True)
        self.horse = Animal.objects.create(name="Titus", species="horse", created_by=self.admin)
        self.client = APIClient()
        self.client.force_authenticate(self.admin)

    def test_add_skill_without_code_use_in_session_and_archive_preserves_history(self):
        response = self.client.post("/api/training/skills/", {"name": "Shooting", "category": "Specialty", "assessment_criteria": "Steady while mounted."}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        skill_id = response.data["id"]
        original_code = response.data["code"]
        self.assertTrue(original_code.startswith("shooting-"))
        response = self.client.post("/api/training/sessions/", {"animal": self.horse.pk, "title": "Specialty practice", "date": "2024-01-01", "skill_checks": [{"skill": skill_id, "evidence": "Stood quietly during the demonstration."}]}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        response = self.client.patch(f"/api/training/skills/{skill_id}/", {"name": "Mounted shooting", "active": False}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["code"], original_code)
        self.assertTrue(SessionSkillProgress.objects.filter(skill_id=skill_id).exists())
        checklist = training_checklist(self.horse)
        observed = next(s for c in checklist["categories"] for s in c["skills"] if s["id"] == skill_id)
        self.assertTrue(observed["accomplished"])
        self.assertFalse(observed["active"])
        self.assertEqual(observed["name"], "Mounted shooting")
        response = self.client.post("/api/training/sessions/", {"animal": self.horse.pk, "title": "New work", "date": "2024-01-02", "skill_checks": [{"skill": skill_id, "evidence": "Observed"}]}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_custom_skill_is_unweighted_and_codes_remain_unique_and_stable(self):
        first = self.client.post("/api/training/skills/", {"name": "New skill", "category": "Custom"}, format="json")
        second = self.client.post("/api/training/skills/", {"name": "New skill", "category": "Custom"}, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 201)
        self.assertNotEqual(first.data["code"], second.data["code"])
        duplicate = self.client.post("/api/training/skills/", {"code": first.data["code"], "name": "Duplicate", "category": "Custom"}, format="json")
        self.assertEqual(duplicate.status_code, 400)
        self.assertEqual(self.client.patch(f"/api/training/skills/{first.data['id']}/", {"code": "changed"}, format="json").status_code, 400)
        checklist = training_checklist(self.horse)
        self.assertNotIn("score", checklist)
        custom = next(c for c in checklist["categories"] if c["name"] == "Custom")
        self.assertEqual(len(custom["skills"]), 2)
        self.assertFalse(any(s["accomplished"] for s in custom["skills"]))
