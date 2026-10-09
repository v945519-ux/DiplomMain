from django.urls import path

from .views import AddToCartView, CartItemView, CartView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('items/<int:item_id>/', CartItemView.as_view(), name='cart-item'),
]
