from rest_framework import serializers

from catalog.serializers import ProductListSerializer

from .models import Favorite


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ('id', 'product', 'product_id', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_product_id(self, value):
        from catalog.models import Product

        if not Product.objects.filter(id=value, is_available=True).exists():
            raise serializers.ValidationError('Товар недоступен')
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        product_id = validated_data['product_id']
        favorite, _ = Favorite.objects.get_or_create(
            user=user,
            product_id=product_id,
        )
        return favorite
