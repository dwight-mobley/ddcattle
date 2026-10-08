from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.db import models


class Record(models.Model):
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="%(class)s_created")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class RidingLocation(Record):
    name = models.CharField(max_length=200)
    address = models.CharField(max_length=300, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, validators=[MinValueValidator(-90), MaxValueValidator(90)])
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True, validators=[MinValueValidator(-180), MaxValueValidator(180)])
    notes = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name", "pk"]

    def __str__(self):
        return self.name


class Activity(Record):
    date = models.DateField(db_index=True)
    title = models.CharField(max_length=200)
    location = models.ForeignKey(RidingLocation, on_delete=models.PROTECT, null=True, blank=True, related_name="%(class)s_records")
    location_name = models.CharField(max_length=200, blank=True, help_text="One-off location or historical location name.")
    duration_minutes = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    notes = models.TextField(blank=True)

    class Meta:
        abstract = True
        ordering = ["-date", "-created_at", "-pk"]


class Ride(Activity):
    class Type(models.TextChoices):
        TRAIL = "trail", "Trail"
        ARENA = "arena", "Arena"
        ROAD = "road", "Road"
        LESSON = "lesson", "Lesson"
        CONDITIONING = "conditioning", "Conditioning"
        EVENT = "event", "Competition / event"
        OTHER = "other", "Other"

    ride_type = models.CharField(max_length=30, choices=Type.choices, default=Type.TRAIL)
    distance_miles = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(Decimal("0"))])
    route = models.TextField(blank=True)
    terrain = models.CharField(max_length=250, blank=True)
    weather = models.CharField(max_length=250, blank=True)
    animals = models.ManyToManyField("animals.Animal", through="RideParticipant", related_name="rides")

    class Meta(Activity.Meta):
        abstract = False
        constraints = [
            models.CheckConstraint(condition=models.Q(distance_miles__isnull=True) | models.Q(distance_miles__gte=0), name="ride_nonnegative_distance"),
            models.CheckConstraint(condition=models.Q(duration_minutes__isnull=True) | models.Q(duration_minutes__gt=0), name="ride_positive_duration"),
        ]

    def __str__(self):
        return self.title


class RideParticipant(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name="participants")
    animal = models.ForeignKey("animals.Animal", on_delete=models.PROTECT, related_name="ride_participations", limit_choices_to={"species": "horse"})
    rider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="ride_participations")
    rider_name = models.CharField(max_length=150, blank=True)
    notes = models.TextField(blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1)])
    distance_miles = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])

    class Meta:
        ordering = ["pk"]
        constraints = [
            models.UniqueConstraint(fields=["ride", "animal"], name="unique_ride_animal"),
            models.CheckConstraint(condition=models.Q(duration_minutes__isnull=True) | models.Q(duration_minutes__gt=0), name="participant_positive_duration"),
            models.CheckConstraint(condition=models.Q(distance_miles__isnull=True) | models.Q(distance_miles__gte=0), name="participant_nonnegative_distance"),
        ]


class TrainingSession(Activity):
    class Type(models.TextChoices):
        GROUNDWORK = "groundwork", "Groundwork"
        ROUND_PEN = "round_pen", "Round pen"
        DESENSITIZATION = "desensitization", "Desensitization"
        MOUNTED = "mounted", "Mounted training"
        TRAILER = "trailer", "Trailer loading"
        HANDLING = "handling", "Handling / hoof care"
        OBSTACLES = "obstacles", "Obstacles"
        CONDITIONING = "conditioning", "Conditioning"
        JOURNAL = "journal", "Historical journal note"
        OTHER = "other", "Other"

    animal = models.ForeignKey("animals.Animal", on_delete=models.PROTECT, related_name="training_sessions", limit_choices_to={"species": "horse"})
    trainer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="training_sessions")
    trainer_name = models.CharField(max_length=150, blank=True)
    session_type = models.CharField(max_length=30, choices=Type.choices, default=Type.GROUNDWORK)
    ride = models.ForeignKey(Ride, on_delete=models.SET_NULL, null=True, blank=True, related_name="training_sessions")
    goals = models.TextField(blank=True)
    successes = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)

    class Meta(Activity.Meta):
        abstract = False
        constraints = [models.CheckConstraint(condition=models.Q(duration_minutes__isnull=True) | models.Q(duration_minutes__gt=0), name="training_positive_duration")]

    def __str__(self):
        return self.title


class TrainingSkill(models.Model):
    code = models.SlugField(max_length=100, unique=True)
    name = models.CharField(max_length=150)
    category = models.CharField(max_length=100)
    assessment_criteria = models.TextField(blank=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["category", "name"]

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        if self.pk and TrainingSkill.objects.filter(pk=self.pk).exclude(code=self.code).exists():
            raise ValidationError({"code": "Skill codes are stable identifiers; create a new skill instead."})


class SessionSkillProgress(Record):
    class Proficiency(models.TextChoices):
        NEEDS_WORK = "needs_work", "Needs work"
        INTRODUCED = "introduced", "Introduced"
        LEARNING = "learning", "Learning"
        IMPROVING = "improving", "Improving"
        RELIABLE = "reliable", "Reliable"
        MASTERED = "mastered", "Mastered"

    session = models.ForeignKey(TrainingSession, on_delete=models.CASCADE, related_name="skill_progress")
    skill = models.ForeignKey(TrainingSkill, on_delete=models.PROTECT, related_name="observations")
    proficiency = models.CharField(max_length=20, choices=Proficiency.choices, blank=True, help_text="Blank means practiced without an assessment.")
    accomplished = models.BooleanField(default=False)
    context = models.CharField(max_length=100, blank=True, help_text="For example left side, right side, or mounted.")
    accomplishment = models.CharField(max_length=250, blank=True)
    evidence = models.TextField(blank=True)

    class Meta:
        ordering = ["pk"]
        constraints = [models.UniqueConstraint(fields=["session", "skill", "context"], name="unique_session_skill_context")]

    def clean(self):
        super().clean()
        if (self.proficiency or self.accomplished) and not self.evidence.strip():
            raise ValidationError({"evidence": "Describe the evidence supporting this assessment."})
