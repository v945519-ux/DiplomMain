from django.contrib import admin

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'is_available', 'is_popular', 'created_at')
    list_filter = ('category', 'is_available', 'is_popular')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')
