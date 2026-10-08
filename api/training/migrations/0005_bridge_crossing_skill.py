from django.db import migrations


def seed(apps, schema_editor):
    Skill = apps.get_model("training", "TrainingSkill")
    Skill.objects.using(schema_editor.connection.alias).get_or_create(
        code="bridge-crossing", defaults={"name": "Bridge crossing", "category": "Trail", "assessment_criteria": "Crosses an appropriate bridge willingly and calmly. Describe the bridge and conditions observed."},
    )


class Migration(migrations.Migration):
    dependencies = [("training", "0004_rideskillprogress")]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
