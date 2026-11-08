# AGENTS.md

This is a Symfony project. Check `composer.json` for the exact Symfony/PHP version
in use, and read `symfony.lock` to see which recipes ran. Don't assume Doctrine,
Twig, API Platform, Messenger, or Lock are installed unless one of those says so.

## Ask before generating

If the task doesn't specify, ask rather than guess:

- Persistence: Doctrine ORM, Doctrine ODM, or none?
- Interface: server-rendered (Twig), API (Serializer, maybe API Platform), or both?
- Auth: SecurityBundle, and which authenticator?

If you can't ask (no interactive channel), state the assumption you're making and
pick the smallest option (e.g. no persistence layer) rather than scaffolding a
full stack nobody asked for.

## Adding features: Flex, not hand-wiring

Install new capabilities with `composer require <package>` (e.g. `symfony/lock`,
`symfony/messenger`, `orm-pack`) and let the Flex recipe register the bundle and
generate its config. Don't hand-edit `config/bundles.php` or hand-write a bundle's
base config; that's what the recipe is for. Don't skip a good-fit component just
because it isn't installed yet; installing it is one command.

## Conventions

Follow https://symfony.com/doc/current/best_practices.html to write idiomatic
Symfony:

- Use PHP attributes for framework metadata, and not only on controllers:
  `#[Route]`, `#[MapRequestPayload]`, `#[IsGranted]` on actions, `#[Assert\...]`
  on properties, `#[AsCommand]`, `#[AsEventListener]`, `#[AsMessageHandler]`, and
  `#[AsAlias]` / `#[AsTaggedItem]` / `#[Autoconfigure]` on services. No YAML or
  XML routing.
- Rely on autowiring and autoconfiguration. Type-hint constructor arguments and
  let the container resolve them. Where a type-hint can't express it, stay in the
  class with `#[Autowire]` (parameters, env vars, expressions) or `#[Target]` (one
  of several implementations of an interface). A YAML service definition is the
  last resort, not the first.
- Controllers extend `AbstractController`, stay thin, and delegate to services.
- Use the framework for what it already does: Form for server-rendered forms,
  Validator for validation, Serializer for JSON, Messenger for async work,
  Security (voters, authenticators) for access control, Twig `path()`/`url()`
  instead of hardcoded URLs.
- Before hand-writing infrastructure (locks, queues, caches, HTTP clients,
  mailers, schedulers) or reaching for a third-party library, check whether a
  Symfony component covers it. It usually does.

Three specifics worth spelling out, because they are easy to get wrong:

- Bind request data with `#[MapRequestPayload]` / `#[MapQueryString]` on action
  arguments, which wires up Serializer and Validator for you, instead of calling
  `json_decode()` or `SerializerInterface` by hand. If neither package is
  installed yet, `composer require` them rather than falling back to manual
  parsing.
- Use constructor property promotion, and `readonly` for DTOs and value objects.
- Use `symfony/lock` (`LockFactory`) for mutual exclusion. A hand-built flag or
  lock file looks fine in review and is usually wrong under concurrency.

## Frontend: Tailwind 4 + Twig components

- Верстаем на **Tailwind CSS 4** (подключается через AssetMapper: `@import "tailwindcss";`
  в `assets/styles/app.css`, конфигурация — через CSS-директивы, не через `tailwind.config.js`).
- **Цвета — только из `@theme`.** Все цвета проекта объявляются в блоке `@theme { ... }`
  (`assets/styles/app.css`) как design-токены (`--color-*`). В разметке и компонентах
  используем только эти токены (`bg-surface`, `text-muted`, ...). Запрещены произвольные
  значения цветов в классах (`bg-[#1a2b3c]`, `text-gray-500` вне темы) и «сырые» hex
  в шаблонах.
- **Компоненты карточек — через `{% include %} with ... only`.** Переиспользуемая
  разметка карточек выносится в отдельные партиалы
  (например, `templates/components/card.html.twig`) и подключается с явным набором
  переменных и `only`, чтобы партиал не тянул весь контекст:

  ```twig
  {% include 'components/card.html.twig' with { title: item.title, url: item.url, image: item.image } only %}
  ```
- Токены для тёмной темы (если она планируется): цвета объявляем сразу парами
  через `@theme` + CSS-переменные, чтобы позже включить `dark:` без переписывания
  шаблонов.

## Frontend: адаптивная вёрстка

- **Mobile-first.** Базовые классы пишем для мобильного вида, наращиваем через
  брейкпоинты (`sm:` → `md:` → `lg:` → `xl:`). Используем только стандартные
  брейкпоинты Tailwind (sm 640 / md 768 / lg 1024 / xl 1280); произвольные
  (`min-[420px]:`) — только если стандартный не решает задачу, и с комментарием.
- **Семантика и a11y.** Вёрстка на семантических тегах (`header`, `nav`, `main`,
  `section`, `article`, `footer`). Каждая страница — один `<h1>`. Картинки — с
  `alt` и осмысленными `loading="lazy"` / `decoding="async"` (кроме first-screen).
  Интерактивные элементы — настоящие `<button>`/`<a>`, не `<div onclick>`.
  Видимые `focus-visible` стили для всего интерактивного.
- **Контейнер и сетка.** Один общий контейнер `mx-auto max-w-<токен> px-4 md:px-6`
  (переменная выносится в `@theme`, например `--spacing-page`). Сетки — `grid`
  с `gap-*` и адаптивным числом колонок (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`),
  не вложенные флексы с ручными ширинами.
- **Никаких горизонтальных скроллов.** Не задавать фиксированные ширины/высоты
  контентным блокам; длинные слова — `break-words`, переполнение — `truncate`
  или `line-clamp-*`. Текст — `text-balance`, заголовки — `text-pretty`.
- **Типографика и отступы** — только из шкалы Tailwind (`text-*`, `p-*`, `gap-*`).
  Произвольные значения (`p-[13px]`) запрещены; если значение нужно часто —
  добавляем токен в `@theme` в `assets/styles/app.css`, а не хардкодим.
- **Тач-цели.** Кликабельные элементы на мобильных ≥ 44×44 px (учитывать
  `p-*` вокруг иконок). `hover:`-эффекты — только как дополнение к `active:`/
  `focus-visible:`, не как единственная индикация.
- **Изображения.** Декоративные фоны — `aspect-*` + `object-cover`; контентные —
  через `<picture>`/`srcset`, когда есть разные размеры. Никаких
  `background-image` для контентных картинок.
- **Мобильная навигация.** Burger-меню делаем рабочим (Stimulus-контроллер или
  `<details>`), а не просто `hidden md:flex` без замены. Header — `sticky`,
  mobile-меню закрывается по Escape и клику вне.
- **База страницы.** `templates/base.html.twig` содержит `meta viewport`,
  `meta description`, favicon и пустые блоки `title`/`meta`/`content`; новые
  страницы наследуют её, а не создают свой `<html>`.
- **Самопроверка вёрстки.** После вёрстки страницы: `bin/console lint:twig`,
  затем проверить скриншоты через браузер минимум в двух вьюпортах —
  1280×800 (desktop) и 375×667 (mobile) — и убедиться, что нет переполнений,
  наложений и «прыгающих» элементов. Скриншоты — ключевой критерий готовности,
  «локально вроде ок» без проверки на мобильном вьюпорте не считается готовым.
- **Состояния.** Для списков/карточек предусмотреть empty-state (что видно, если
  данных нет) и, где уместно, skeleton/loading-состояние — даже если данные пока
  статичные.

## Everyday workflow

- **Сервер разработки.** Проект доступен по адресу **https://mastermp.loc/** —
  работает через nginx, конфигурация сайта лежит в
  `/server_data/nginx/config/mastermp.conf`. Не поднимать свой встроенный
  сервер для проверки — открывать готовый домен. Домена нет в `/etc/hosts`:
  в headless-браузере использовать `--host-resolver-rules=MAP mastermp.loc 127.0.0.1`,
  в curl — `--resolve mastermp.loc:443:127.0.0.1` (сертификат self-signed, нужен `-k`).
- PHP выполняется в Docker-контейнере `mmp_php`: обёртка `/usr/bin/php` требует
  `PHP_CONTAINER=mmp_php` (по умолчанию она ищет контейнер `php`). Команды
  запускать как `PHP_CONTAINER=mmp_php bin/console ...`.
- После изменения `assets/styles/app.css` пересобирать CSS:
  `PHP_CONTAINER=mmp_php bin/console tailwind:build`.
- Run the app with `symfony serve -d`, and commands with `symfony console ...`
  (or `bin/console` when the Symfony CLI isn't available).
- When something fails, read `var/log/dev.log` and the web profiler
  (`/_profiler`) before changing code.
- If `maker-bundle` is installed, prefer `bin/console make:*` with every argument
  passed up front and `--no-interaction` where supported: makers prompt on a
  terminal by default, which hangs a non-interactive shell. If a maker still
  needs interactive input, hand-write the code instead.
- If Doctrine ORM is installed, schema changes go through migrations
  (`bin/console make:migration`, then `doctrine:migrations:migrate`), never
  `doctrine:schema:update` or hand-written SQL.
- `.env` is committed and holds defaults only. Real secrets belong in `.env.local`
  (git-ignored) or the secrets vault (`bin/console secrets:set`), read via
  `%env(...)%`.

## Testing

Install `symfony/test-pack` if it isn't already. Functional/HTTP tests extend
`WebTestCase`; service-level tests extend `KernelTestCase`. Run
`php bin/phpunit` (falls back to `vendor/bin/phpunit`). A feature isn't done
until it has a test that exercises it the way a caller would, an HTTP request for
a controller or a service call for a service, not just "it didn't throw."

## Code style

Symfony's coding standard, the `@Symfony` php-cs-fixer ruleset (a PSR-12-derived
superset). Run `vendor/bin/php-cs-fixer fix` if `friendsofphp/php-cs-fixer` is
installed; it isn't part of the skeleton by default.

## Discover, don't guess

Framework APIs change between versions and your training data may be stale. Look
things up in the project instead of relying on memory:

- `bin/console about`: versions, environment, paths.
- `bin/console debug:router`, `debug:container`, `debug:autowiring <name>`,
  `debug:config <bundle>`, `config:dump-reference <bundle>`: what exists and how
  it is configured.
- `bin/console lint:container`, plus `lint:twig templates/` and
  `lint:yaml config/` where those packages are installed: validate before running.
- Read the installed source and docblocks under `vendor/`.
- Docs: https://symfony.com/doc/current/ (switch to the version matching
  `composer.json` if it differs).
