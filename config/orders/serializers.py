from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import ProductListSerializer

from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'price', 'quantity', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    delivery_type_display = serializers.CharField(source='get_delivery_type_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'status', 'status_display', 'delivery_type', 'delivery_type_display',
            'payment_method', 'payment_method_display', 'delivery_address', 'phone',
            'comment', 'total_price', 'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('status', 'total_price', 'created_at', 'updated_at')


class CreateOrderSerializer(serializers.Serializer):
    delivery_type = serializers.ChoiceField(choices=Order.DeliveryType.choices)
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20)
    comment = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs['delivery_type'] == Order.DeliveryType.DELIVERY and not attrs.get('delivery_address'):
            raise serializers.ValidationError({
                'delivery_address': 'Укажите адрес доставки',
            })
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        cart = user.cart
        cart_items = cart.items.select_related('product').all()

        if not cart_items.exists():
            raise serializers.ValidationError('Корзина пуста')

        total_price = sum(item.subtotal for item in cart_items)

        order = Order.objects.create(
            user=user,
            total_price=total_price,
            **validated_data,
        )

        order_items = [
            OrderItem(
                order=order,
                product=item.product,
                product_name=item.product.name,
                price=item.product.price,
                quantity=item.quantity,
            )
            for item in cart_items
        ]
        OrderItem.objects.bulk_create(order_items)
        cart.items.all().delete()

        return order
