from django.urls import path

from .views import OrderChoicesView, OrderDetailView, OrderListCreateView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='orders'),
    path('choices/', OrderChoicesView.as_view(), name='order-choices'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]
