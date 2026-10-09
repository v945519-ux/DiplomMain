from django.contrib.auth.models import User
from django.db import models

from catalog.models import Product


class Favorite(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name='Пользователь',
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name='Товар',
    )
    created_at = models.DateTimeField('Добавлено', auto_now_add=True)

    class Meta:
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} — {self.product.name}'
