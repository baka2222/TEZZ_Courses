from django.shortcuts import render
from rest_framework.generics import (ListAPIView, RetrieveAPIView, ListCreateAPIView, UpdateAPIView, RetrieveUpdateAPIView)
from .models import (Class, Module, Lesson, Mark)
from .serializer import (UserSerializer, UserModulesSerializer, MarkSerializer, StudentsByLessonSerializer, LessonSerializer)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
User = get_user_model()


class LessonDetailView(RetrieveAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'


class MarksByLessonView(ListAPIView):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        lesson_id = self.kwargs.get('id')
        return Mark.objects.filter(lesson__id=lesson_id)


class MarksByLessonQueryView(ListAPIView):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        lesson_id = self.request.query_params.get('lesson')
        if lesson_id:
            return Mark.objects.filter(lesson__id=lesson_id)
        return Mark.objects.none()


class ModuleDetailView(RetrieveAPIView):
    queryset = Module.objects.all()
    serializer_class = UserModulesSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class StudentsByLessonView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = StudentsByLessonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        lesson_id = self.kwargs.get('id')
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return User.objects.none()

        if self.request.user.role == 'teacher' and lesson.module.school_class.teacher == self.request.user:
            return lesson.module.school_class.students.all()
        return User.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        lesson_id = self.kwargs.get('id')
        context['lesson'] = Lesson.objects.filter(id=lesson_id).first()
        return context


class MarkUpdateView(UpdateAPIView):
    queryset = Mark.objects.all()
    serializer_class = MarkSerializer
    permission_classes = [IsAuthenticated]

    def partial_update(self, request, *args, **kwargs):
        mark = self.get_object()
        user = request.user

        if user.role == 'teacher':
            serializer = self.get_serializer(mark, data={'score': request.data.get('score')}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"message": "Оценка успешно обновлена"}, status=status.HTTP_200_OK)

        elif user.role == 'student':
            if mark.student != user:
                return Response({"error": "Вы не можете менять чужой ответ"}, status=status.HTTP_403_FORBIDDEN)

            serializer = self.get_serializer(mark, data={'answer': request.data.get('answer')}, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response({"message": "Ответ успешно обновлён"}, status=status.HTTP_200_OK)

        return Response({"error": "Недостаточно прав"}, status=status.HTTP_403_FORBIDDEN)


class LoginView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'username'


class UserModulesView(ListAPIView):
    queryset = Module.objects.all()
    serializer_class = UserModulesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Module.objects.filter(school_class__teacher=user)
        elif user.role == 'student':
            return Module.objects.filter(school_class__students=user)
        return Module.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ProfileView(RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user