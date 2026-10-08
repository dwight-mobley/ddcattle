from django.db.models import Q
from django.utils import timezone
from .models import TrainingSkill, SessionSkillProgress, RideSkillProgress


def training_checklist(animal):
    observations = list(SessionSkillProgress.objects.filter(
        session__animal=animal, session__date__lte=timezone.localdate(),
    ).select_related("session", "skill").order_by("-session__date", "-created_at", "-pk"))
    ride_observations = list(RideSkillProgress.objects.filter(
        animal=animal, ride__date__lte=timezone.localdate(),
    ).select_related("ride", "skill").order_by("-ride__date", "-created_at", "-pk"))
    from types import SimpleNamespace
    observations.extend(SimpleNamespace(
        skill_id=o.skill_id, context="", accomplished=True, proficiency="",
        accomplishment="", evidence=o.evidence, session=o.ride, session_id=None,
        ride_id=o.ride_id, pk=o.pk, created_at=o.created_at,
    ) for o in ride_observations)
    observations.sort(key=lambda o: (o.session.date, o.created_at, o.pk), reverse=True)
    latest = {}
    for observation in observations:
        latest.setdefault((observation.skill_id, observation.context), observation)
    skills = TrainingSkill.objects.filter(Q(active=True) | Q(pk__in=[o.skill_id for o in observations])).distinct().order_by("category", "name", "pk")
    groups = {}
    completed = 0

    def evidence(observation):
        if not observation:
            return None
        return {"accomplished": observation.accomplished, "proficiency": observation.proficiency,
                "context": observation.context, "accomplishment": observation.accomplishment,
                "evidence": observation.evidence, "date": observation.session.date,
                "session_id": observation.session_id, "ride_id": getattr(observation, "ride_id", None),
                "observation_id": observation.pk, "source": "ride" if getattr(observation, "ride_id", None) else "session"}

    for skill in skills:
        general = latest.get((skill.pk, ""))
        checked = bool(general and general.accomplished)
        completed += int(checked)
        groups.setdefault(skill.category, []).append({
            "id": skill.pk, "code": skill.code, "name": skill.name, "active": skill.active,
            "accomplished": checked, "latest": evidence(general),
            "contexts": [evidence(o) for (skill_id, context), o in latest.items() if skill_id == skill.pk and context],
            "milestones": [evidence(o) for o in observations if o.skill_id == skill.pk and o.accomplishment],
        })
    return {"animal_id": animal.pk, "accomplished_count": completed,
            "categories": [{"name": name, "skills": items} for name, items in groups.items()],
            "policy": "Latest dated general session assessment or accomplished ride skill determines the checkbox. Context-specific accomplishments remain separate; no skills are weighted or scored."}
