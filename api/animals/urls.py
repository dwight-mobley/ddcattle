from django.urls import path, include
from rest_framework.routers import DefaultRouter
from animals.views import AnimalViewSet, HorseBreedViewSet, DogBreedViewSet

router = DefaultRouter()
router.register(r'animals', AnimalViewSet, basename='animal')
router.register(r'horse-breeds', HorseBreedViewSet, basename='horsebreed')
router.register(r'dog-breeds', DogBreedViewSet, basename='dogbreed')





urlpatterns = [
    path('', include(router.urls)),
]