from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import CurrentUserView, LoginView, LogoutView, ProfileView, RegisterView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
