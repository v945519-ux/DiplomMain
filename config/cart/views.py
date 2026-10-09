from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalog.models import Product

from .models import Cart, CartItem
from .serializers import AddToCartSerializer, CartSerializer, UpdateCartItemSerializer


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart

    def get(self, request):
        cart = self.get_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    def delete(self, request):
        cart = self.get_cart(request.user)
        cart.items.all().delete()
        return Response({'message': 'Корзина очищена'})


class AddToCartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        product = Product.objects.get(id=serializer.validated_data['product_id'])
        quantity = serializer.validated_data['quantity']

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity},
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_201_CREATED)


class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    def get_cart_item(self, request, item_id):
        return CartItem.objects.get(id=item_id, cart__user=request.user)

    def patch(self, request, item_id):
        try:
            cart_item = self.get_cart_item(request, item_id)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Позиция не найдена'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart_item.quantity = serializer.validated_data['quantity']
        cart_item.save()

        return Response(CartSerializer(cart_item.cart).data)

    def delete(self, request, item_id):
        try:
            cart_item = self.get_cart_item(request, item_id)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Позиция не найдена'}, status=status.HTTP_404_NOT_FOUND)

        cart = cart_item.cart
        cart_item.delete()
        return Response(CartSerializer(cart).data)
