from rest_framework.routers import DefaultRouter
from .views import RidingLocationViewSet, RideViewSet, TrainingSessionViewSet, TrainingSkillViewSet, SessionSkillProgressViewSet

router = DefaultRouter()
router.register("locations", RidingLocationViewSet, basename="riding-location")
router.register("rides", RideViewSet, basename="ride")
router.register("sessions", TrainingSessionViewSet, basename="training-session")
router.register("skills", TrainingSkillViewSet, basename="training-skill")
router.register("progress", SessionSkillProgressViewSet, basename="session-skill-progress")
urlpatterns = router.urls
