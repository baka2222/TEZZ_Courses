from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('edu.urls')),

    path('api/api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)