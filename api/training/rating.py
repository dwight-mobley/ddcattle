"""Versioned evidence rubric. New catalog skills never change this denominator."""
from decimal import Decimal
from django.utils import timezone
from .models import SessionSkillProgress

POINTS = {"needs_work": 0, "introduced": 20, "learning": 40, "improving": 60, "reliable": 80, "mastered": 100}
RUBRICS = {
    "foundation-v1": (("haltering", 1), ("leading", 1), ("standing-tied", 1), ("hoof-handling", 1), ("trailer-loading", 1), ("saddling", 1), ("mounting", 1), ("walk-trot", 1), ("water-crossing", 1), ("group-trail", 1)),
}


def training_rating(animal, rubric="foundation-v1"):
    skills = RUBRICS[rubric]
    observations = SessionSkillProgress.objects.filter(session__animal=animal, session__date__lte=timezone.localdate(), skill__code__in=[code for code, weight in skills]).exclude(proficiency="").select_related("skill", "session").order_by("-session__date", "-created_at", "-pk")
    latest = {}
    for observation in observations:
        # Context-specific evidence is displayed but does not assert general mastery.
        if not observation.context:
            latest.setdefault(observation.skill.code, observation)
    rows, earned, assessed_weight = [], Decimal(0), 0
    total_weight = sum(weight for code, weight in skills)
    for code, weight in skills:
        observation = latest.get(code)
        points = POINTS[observation.proficiency] if observation else None
        if observation:
            earned += Decimal(weight * points)
            assessed_weight += weight
        rows.append({"skill": code, "weight": weight, "proficiency": observation.proficiency if observation else None, "points": points, "contribution": float(Decimal(weight * (points or 0)) / total_weight), "session_id": observation.session_id if observation else None, "date": observation.session.date if observation else None, "evidence": observation.evidence if observation else None, "accomplishment": observation.accomplishment if observation else None})
    coverage = Decimal(assessed_weight) / total_weight
    return {"rubric": rubric, "algorithm": "latest-general-assessment-v1", "minimum_coverage": 0.5, "coverage": float(coverage), "score": float(earned / total_weight) if coverage >= Decimal("0.5") else None, "assessed_only_score": float(earned / assessed_weight) if assessed_weight else None, "earned_weighted_points": float(earned), "total_weight": total_weight, "skills": rows, "context_policy": "Only context-free assessments contribute; side-specific observations remain in session history."}
