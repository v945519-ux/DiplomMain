import django_filters
from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'is_active', 'products_count')


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'description', 'price', 'image',
            'weight', 'is_available', 'is_popular', 'category', 'category_name',
        )


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ('created_at', 'updated_at')


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.NumberFilter(field_name='category_id')
    category_slug = django_filters.CharFilter(field_name='category__slug')
    is_popular = django_filters.BooleanFilter(field_name='is_popular')
    search = django_filters.CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['category', 'category_slug', 'min_price', 'max_price', 'is_popular', 'is_available']
