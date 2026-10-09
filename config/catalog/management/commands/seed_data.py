from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from catalog.models import Category, Product


class Command(BaseCommand):
    help = 'Заполнить базу демо-данными пиццерии'

    def handle(self, *args, **options):
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user(
                username='demo',
                email='demo@pizza.ru',
                password='demo1234',
                first_name='Демо',
                last_name='Пользователь',
            )
            self.stdout.write('Создан пользователь demo / demo1234')

        categories_data = [
            ('pizza', 'Пицца', 'Классические и авторские пиццы'),
            ('snacks', 'Закуски', 'Закуски и гарниры'),
            ('drinks', 'Напитки', 'Газированные и безалкогольные напитки'),
            ('desserts', 'Десерты', 'Сладкие десерты'),
        ]

        categories = {}
        for slug, name, desc in categories_data:
            cat, created = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc},
            )
            categories[slug] = cat
            if created:
                self.stdout.write(f'Категория: {name}')

        products_data = [
            ('margarita', 'Маргарита', 'pizza', 'Томатный соус, моцарелла, базилик', Decimal('450.00'), 500, True),
            ('pepperoni', 'Пепперони', 'pizza', 'Томатный соус, моцарелла, пепперони', Decimal('550.00'), 550, True),
            ('four-cheese', '4 сыра', 'pizza', 'Моцарелла, пармезан, горгонзола, чеддер', Decimal('590.00'), 480, True),
            ('hawaiian', 'Гавайская', 'pizza', 'Томатный соус, моцарелла, ветчина, ананас', Decimal('520.00'), 520, False),
            ('meat-lovers', 'Мясная', 'pizza', 'Бекон, ветчина, пепперони, курица', Decimal('650.00'), 600, True),
            ('veggie', 'Вегетарианская', 'pizza', 'Овощи гриль, моцарелла, томатный соус', Decimal('480.00'), 450, False),
            ('fries', 'Картофель фри', 'snacks', 'Хрустящий картофель с соусом', Decimal('180.00'), 200, False),
            ('garlic-bread', 'Чесночные гренки', 'snacks', 'Гренки с чесночным маслом', Decimal('150.00'), 150, False),
            ('cola', 'Coca-Cola 0.5л', 'drinks', 'Газированный напиток', Decimal('120.00'), 500, False),
            ('juice', 'Апельсиновый сок 0.5л', 'drinks', 'Натуральный сок', Decimal('130.00'), 500, False),
            ('cheesecake', 'Чизкейк', 'desserts', 'Классический чизкейк', Decimal('250.00'), 150, True),
            ('tiramisu', 'Тирамису', 'desserts', 'Итальянский десерт', Decimal('280.00'), 120, False),
        ]

        for slug, name, cat_slug, desc, price, weight, popular in products_data:
            product, created = Product.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'category': categories[cat_slug],
                    'description': desc,
                    'price': price,
                    'weight': weight,
                    'is_popular': popular,
                },
            )
            if created:
                self.stdout.write(f'Товар: {name}')

        self.stdout.write(self.style.SUCCESS('Демо-данные успешно загружены'))
