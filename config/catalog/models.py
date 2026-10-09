from django.db import models


class Category(models.Model):
    name = models.CharField('Название', max_length=100, unique=True)
    slug = models.SlugField('Slug', max_length=100, unique=True)
    description = models.TextField('Описание', blank=True)
    image = models.ImageField('Изображение', upload_to='categories/', blank=True, null=True)
    is_active = models.BooleanField('Активна', default=True)
    created_at = models.DateTimeField('Создана', auto_now_add=True)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='products',
        verbose_name='Категория',
    )
    name = models.CharField('Название', max_length=200)
    slug = models.SlugField('Slug', max_length=200, unique=True)
    description = models.TextField('Описание', blank=True)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    image = models.ImageField('Изображение', upload_to='products/', blank=True, null=True)
    weight = models.PositiveIntegerField('Вес (г)', blank=True, null=True)
    is_available = models.BooleanField('Доступен', default=True)
    is_popular = models.BooleanField('Популярный', default=False)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['name']

    def __str__(self):
        return self.name
