from django.contrib.auth.models import User
from django.db import models

from catalog.models import Product


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Ожидает'
        CONFIRMED = 'confirmed', 'Подтверждён'
        PREPARING = 'preparing', 'Готовится'
        DELIVERING = 'delivering', 'Доставляется'
        COMPLETED = 'completed', 'Завершён'
        CANCELLED = 'cancelled', 'Отменён'

    class DeliveryType(models.TextChoices):
        DELIVERY = 'delivery', 'Доставка'
        PICKUP = 'pickup', 'Самовывоз'

    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'Наличные'
        CARD = 'card', 'Картой (демо)'
        ONLINE = 'online', 'Онлайн (демо)'

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        verbose_name='Пользователь',
    )
    status = models.CharField(
        'Статус',
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    delivery_type = models.CharField(
        'Способ получения',
        max_length=20,
        choices=DeliveryType.choices,
    )
    payment_method = models.CharField(
        'Способ оплаты',
        max_length=20,
        choices=PaymentMethod.choices,
    )
    delivery_address = models.TextField('Адрес доставки', blank=True)
    phone = models.CharField('Телефон', max_length=20)
    comment = models.TextField('Комментарий', blank=True)
    total_price = models.DecimalField('Итого', max_digits=10, decimal_places=2)
    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ['-created_at']

    def __str__(self):
        return f'Заказ #{self.pk} — {self.user.username}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Заказ',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items',
        verbose_name='Товар',
    )
    product_name = models.CharField('Название товара', max_length=200)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField('Количество')

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'

    def __str__(self):
        return f'{self.product_name} x{self.quantity}'

    @property
    def subtotal(self):
        return self.price * self.quantity
