# Размещение проекта через Docker

Проект запускается тремя сервисами: Next.js (сайт), Django + Gunicorn (API и админка), Caddy (единый адрес и HTTPS). SQLite и фотографии хранятся в постоянных Docker volumes. Нужен VPS/Linux-сервер с Docker Engine и Docker Compose v2 либо хостинг с поддержкой Compose; обычный хостинг только для HTML/PHP не подходит.

## 1. Подготовка

Загрузите папку проекта на сервер. Все команды выполняйте из корня, где лежит compose.yaml.

Скопируйте .env.example в .env (Linux: cp .env.example .env; PowerShell: Copy-Item .env.example .env).
Создайте секрет командой:

    docker run --rm python:3.13-slim python -c "import secrets; print(secrets.token_hex(32))"

Впишите результат в DJANGO_SECRET_KEY. Не публикуйте .env.

Для локальной проверки оставьте остальные значения как в примере: сайт будет доступен по http://localhost.

## 2. Домен и HTTPS

Направьте DNS A-запись домена на IP сервера. Если есть AAAA-запись, она тоже должна вести на этот сервер. Откройте входящие TCP-порты 80 и 443. Замените настройки в .env:

    SITE_ADDRESS=pizza.example.com
    SITE_ORIGIN=https://pizza.example.com
    DJANGO_ALLOWED_HOSTS=pizza.example.com
    DJANGO_SECURE_COOKIES=true

Укажите собственный домен вместо pizza.example.com. SITE_ORIGIN пишется без завершающего слеша. Caddy получает и обновляет сертификат автоматически при доступном домене и открытых портах.

## 3. Запуск с новой базой

    docker compose up -d --build
    docker compose logs --tail=100
    docker compose exec backend python manage.py createsuperuser

Откройте сайт и /admin/. Миграции и сбор статики выполняются автоматически. Новая база пустая: категории и товары добавляются в админке. Для переноса существующего каталога используйте следующий раздел вместо создания новой базы.

## 4. Перенос существующей базы и фотографий

Текущие config/db.sqlite3 и config/media специально исключены из образа. Чтобы перенести существующие товары, аккаунты и заказы на НОВУЮ установку, остановите локальный Django перед копированием базы и загрузите эти файлы на сервер вместе с проектом.

До первого запуска выполните:

    docker compose build
    docker compose create backend
    docker compose cp config/db.sqlite3 backend:/data/db.sqlite3
    docker compose cp config/media/. backend:/app/media/
    docker compose up -d

Не выполняйте этот импорт поверх рабочей базы: он заменяет её содержимое. Для перенесённой базы используйте существующего администратора или создайте нового командой createsuperuser.

## 5. Обновление и обслуживание

После загрузки обновлённого кода:

    docker compose up -d --build
    docker compose ps
    docker compose logs --tail=100 backend frontend proxy

После смены SITE_ORIGIN обязательно пересоберите frontend: адрес API записывается во время сборки.

Остановка с сохранением данных:

    docker compose down

Не добавляйте флаг -v: он удаляет volumes с базой, фотографиями и сертификатами.

Резервное копирование (создайте новую пустую папку backups):

    docker compose stop backend
    docker compose cp backend:/data/db.sqlite3 ./backups/db.sqlite3
    docker compose cp backend:/app/media ./backups/media
    docker compose start backend

Храните копии отдельно от сервера. Перед обновлением делайте резервную копию. Эта конфигурация рассчитана на один экземпляр Django с SQLite; для масштабирования потребуется отдельная СУБД.

## 6. Проверка после запуска

Проверьте каталог и изображения, регистрацию и вход, добавление товара в корзину, /admin/ и загрузку новой фотографии. После перезапуска контейнеров данные должны сохраниться. Если появляется 502 сразу после старта, дождитесь завершения миграций и проверьте logs.

Справка: [Next.js standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [Django deployment checklist](https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/).
