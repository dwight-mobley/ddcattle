from django.db import migrations

SKILLS = [
    ("haltering", "Haltering", "Ground manners"),
    ("leading", "Leading", "Ground manners"),
    ("standing-tied", "Standing tied", "Ground manners"),
    ("hoof-handling", "Hoof handling", "Ground manners"),
    ("trailer-loading", "Trailer loading", "Handling"),
    ("saddling", "Saddling", "Mounted foundations"),
    ("mounting", "Mounting", "Mounted foundations"),
    ("walk-trot", "Walk and trot", "Mounted foundations"),
    ("water-crossing", "Water crossing", "Trail"),
    ("group-trail", "Group trail riding", "Trail"),
]


def seed(apps, schema_editor):
    skill_model = apps.get_model("training", "TrainingSkill")
    for code, name, category in SKILLS:
        skill_model.objects.using(schema_editor.connection.alias).get_or_create(code=code, defaults={"name": name, "category": category, "assessment_criteria": "Introduced: first exposure; learning: requires frequent assistance; improving: increasingly consistent with assistance; reliable: consistently succeeds under normal conditions; mastered: consistently succeeds across varied conditions; needs work: current difficulty. Record context and supporting evidence; one success alone does not establish reliability."})


class Migration(migrations.Migration):
    dependencies = [("training", "0001_initial")]
    # Do not delete assessment catalog entries when reversing this seed.
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
