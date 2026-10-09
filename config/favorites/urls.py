from django.urls import path

from .views import FavoriteDetailView, FavoriteListCreateView

urlpatterns = [
    path('', FavoriteListCreateView.as_view(), name='favorites'),
    path('<int:product_id>/', FavoriteDetailView.as_view(), name='favorite-detail'),
]
