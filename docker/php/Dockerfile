# syntax=docker/dockerfile:1

# Базовый образ с PHP 8.5
ARG VERSION

FROM php:${VERSION}-fpm AS php_base

# Установка mlocati для установки расширений PHP
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
# Установка расширений php
RUN install-php-extensions \
    zip \
    intl \
    pdo_pgsql \
    gd \
    curl \
    opcache \
    redis
# Установка composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# Копируем базовый конфиг для PHP
COPY ./conf/php.ini /usr/local/etc/php/php.ini

# --- Этап для РАЗРАБОТКИ (dev) ---
FROM php_base AS php_dev
ENV APP_ENV=dev
# Установка Xdebug (опционально для дебага)
RUN install-php-extensions xdebug

# Установка Symfony CLI внутрь dev-контейнера
COPY --link \
    --from=ghcr.io/symfony-cli/symfony-cli:latest \
    /usr/local/bin/symfony /usr/local/bin/symfony

WORKDIR /app

# --- Этап для Продакшена (dev) ---
FROM php_base AS php_prod
ENV APP_ENV=prod

WORKDIR /app