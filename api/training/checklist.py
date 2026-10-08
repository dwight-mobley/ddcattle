from django.db.models import Q
from django.utils import timezone
from .models import TrainingSkill, SessionSkillProgress


def training_checklist(animal):
    observations = list(SessionSkillProgress.objects.filter(
        session__animal=animal, session__date__lte=timezone.localdate(),
    ).select_related("session", "skill").order_by("-session__date", "-created_at", "-pk"))
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
                "session_id": observation.session_id, "observation_id": observation.pk}

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
            "policy": "Latest dated general observation determines the checkbox. Context-specific accomplishments remain separate; no skills are weighted or scored."}
