from django.contrib import admin
from .models import Class, Module, Lesson, Mark
from django.contrib.auth import get_user_model
User = get_user_model()


# ============================
# 1. Пользователи (Ученики / Учителя / Админы)
# ============================
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "first_name", "last_name", "role", "email", "is_active", 'telegram', 'discord', "is_staff", "is_superuser", "last_login", "date_joined")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("id",)
    list_editable = ("role", "is_active")
    fieldsets = (
        ("Основная информация", {
            "fields": ("username", "first_name", "last_name", "email", "password")
        }),
        ("Роль и доступ", {
            "fields": ("role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")
        }),
        ("Даты", {
            "fields": ("last_login", "date_joined")
        }),
    )
    readonly_fields = ("last_login", "date_joined")


# ============================
# 2. Inline для модулей внутри класса
# ============================
class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    show_change_link = True


# ============================
# 3. Классы
# ============================
@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "teacher", "is_active", "created_at")
    list_filter = ("is_active", "teacher")
    search_fields = ("name", "teacher__first_name", "teacher__last_name")
    ordering = ("name",)
    inlines = [ModuleInline]
    filter_horizontal = ("students",)
    list_editable = ("is_active",)


# ============================
# 4. Inline для уроков внутри модуля
# ============================
class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    show_change_link = True


# ============================
# 5. Модули
# ============================
@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "school_class", "created_at")  # <-- изменено
    list_filter = ("school_class",)  # <-- изменено
    search_fields = ("title", "school_class__name")  # <-- изменено
    ordering = ("title",)
    inlines = [LessonInline]


# ============================
# 6. Уроки
# ============================
@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "module", "created_at", "start_time", "end_time")
    list_filter = ("module",)
    search_fields = ("title", "module__title")
    ordering = ("title",)


# ============================
# 7. Оценки
# ============================
@admin.register(Mark)
class MarkAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "lesson", "score", "created_at")
    list_filter = ("lesson", "student", "score")
    search_fields = ("student__first_name", "student__last_name", "lesson__title")
    ordering = ("-created_at",)
    list_editable = ("score",)
