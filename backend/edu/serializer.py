from rest_framework import serializers
from .models import Class, Module, Lesson, Mark
from django.utils import timezone
from django.conf import settings
from zoneinfo import ZoneInfo
import pytz
from django.contrib.auth import get_user_model
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'discord', 'telegram']


class MarkSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    
    class Meta:
        model = Mark
        fields = ['id', 'student', 'lesson', 'score', 'created_at', 'updated_at', 'answer']

LOCAL_TZ = ZoneInfo('Asia/Bishkek')
    
class LessonSerializer(serializers.ModelSerializer):
    # переопределяем поля, чтобы вернуть локализованную строку вместо "сырых" UTC
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    student_mark = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'title', 'content',
            'created_at', 'updated_at', 'student_mark',
            'start_time', 'end_time',
        ]

    def _as_local_wallclock(self, dt):
        if not dt:
            return None
        if timezone.is_aware(dt):
            naive = dt.replace(tzinfo=None)
        else:
            naive = dt
        return naive.replace(tzinfo=LOCAL_TZ)

    def get_start_time(self, obj):
        local_dt = self._as_local_wallclock(obj.start_time)
        return local_dt.isoformat() if local_dt else None

    def get_end_time(self, obj):
        local_dt = self._as_local_wallclock(obj.end_time)
        return local_dt.isoformat() if local_dt else None

    def get_student_mark(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        mark = obj.marks.filter(student=request.user).first()
        return mark.score if mark else None


class StudentsByLessonSerializer(serializers.ModelSerializer):
    mark = serializers.SerializerMethodField()
    answer_url = serializers.SerializerMethodField()
    mark_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'discord', 'telegram', 'mark', 'answer_url', 'mark_id']

    def get_mark(self, obj):
        lesson = self.context.get('lesson')
        if not lesson:
            return None
        mark = lesson.marks.filter(student=obj).first()
        return mark.score if mark else None
    
    def get_mark_id(self, obj):
        lesson = self.context.get('lesson')
        if not lesson:
            return None
        mark = lesson.marks.filter(student=obj).first()
        return mark.id if mark else None
    
    def get_answer_url(self, obj):
        request = self.context.get('request') 
        lesson = self.context.get('lesson')
        if not lesson:
            return None

        mark = lesson.marks.filter(student=obj).first()
        if mark and mark.answer:
            return request.build_absolute_uri(mark.answer.url) 
        return None
        

class UserModulesSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'lessons']