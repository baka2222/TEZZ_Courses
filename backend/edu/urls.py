from django.urls import path
from .views import (
    LoginView, UserModulesView, MarkUpdateView, ProfileView,
    StudentsByLessonView, ModuleDetailView, LessonDetailView,
    MarksByLessonView, MarksByLessonQueryView
)

urlpatterns = [
    path('user/<str:username>', LoginView.as_view()),
    path('modules/', UserModulesView.as_view()),
    path('marks/<int:pk>/update/', MarkUpdateView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('lessons/<int:id>/students/', StudentsByLessonView.as_view()),
    path('modules/<int:id>/', ModuleDetailView.as_view()),
    path('lessons/<int:id>/', LessonDetailView.as_view()),
    path('marks/<int:id>/', MarksByLessonView.as_view()), 
    path('marks/', MarksByLessonQueryView.as_view()),      
]