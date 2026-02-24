# Развёртывание GiftGoals на Render

Документ описывает переменные окружения и пошаговую настройку деплоя фронта и бэка на [Render](https://render.com) с базой данных в [Neon](https://neon.tech).

## 1. Переменные окружения

### Backend (Web Service на Render)

| Переменная       | Обязательно | Описание |
|------------------|-------------|----------|
| `NODE_ENV`       | Да          | `production` для продакшена. |
| `PORT`           | Нет         | Render подставляет автоматически; бэкенд читает из `process.env.PORT`. |
| `DATABASE_URL`   | Да          | Строка подключения к PostgreSQL (Neon). Для прода — отдельная база или branch. |
| `JWT_SECRET`     | Да          | Секрет для подписи JWT (длинная случайная строка, напр. `openssl rand -base64 32`). |
| `FRONTEND_URL`   | Да          | Публичный URL фронта (для CORS и редиректов), напр. `https://giftgoals-frontend.onrender.com`. |
| `GOOGLE_CLIENT_ID`    | Нет | Для входа через Google OAuth. |
| `GOOGLE_CLIENT_SECRET`| Нет | Для входа через Google OAuth. |

Пример для Render: в **Environment** сервиса добавить каждую переменную (секреты — через **Secret Files** или зашифрованные env).

### Frontend (Static Site на Render)

| Переменная           | Обязательно | Описание |
|----------------------|-------------|----------|
| `VITE_API_BASE_URL`  | Да          | Публичный URL бэкенда **включая путь `/api`**, напр. `https://giftgoals-backend.onrender.com/api`. |

Подставляется на этапе сборки; после деплоя фронта нужно пересобрать при изменении.

---

## 2. Деплой бэкенда (Web Service)

1. Войти в [Render Dashboard](https://dashboard.render.com), подключить GitHub-репозиторий проекта.
2. **New → Web Service**.
3. Выбрать репозиторий и настроить:
   - **Name**: например `giftgoals-backend`.
   - **Region**: ближайший к пользователям.
   - **Root Directory**: `backend`.
   - **Runtime**: Node.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Environment**:
   - Добавить переменные из таблицы выше (`NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` и при необходимости Google OAuth).
   - `PORT` не задавать — Render задаёт сам.
5. **Auto-Deploy**: включить деплой из нужной ветки (например `main`).
6. Создать сервис и дождаться первого деплоя.
7. **Миграции БД**: после первого успешного билда выполнить один раз:
   - В Render: **Shell** (или через **Background Worker** / один раз вручную):
     ```bash
     npm run db:deploy
     ```
   - Либо добавить в **Build Command**: `npm install && npm run build && npm run db:deploy` (тогда миграции выполняются при каждом деплое).
8. Проверить API по публичному URL, например: `https://giftgoals-backend.onrender.com/api/health` (если есть такой маршрут) или любой другой эндпоинт.

---

## 3. Деплой фронтенда (Static Site)

1. В том же Render Dashboard: **New → Static Site**.
2. Выбрать тот же репозиторий:
   - **Name**: например `giftgoals-frontend`.
   - **Root Directory**: `frontend`.
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. **Environment**:
   - `VITE_API_BASE_URL` = полный URL бэкенда с путём `/api`, например `https://giftgoals-backend.onrender.com/api`.
4. Включить **Auto-Deploy** с той же ветки.
5. После деплоя открыть URL статики и в DevTools (Network) убедиться, что запросы уходят на бэкенд Render.

---

## 4. Связка CORS

- В настройках **backend** Web Service задать `FRONTEND_URL` равным точному URL статики (например `https://giftgoals-frontend.onrender.com`), без завершающего слэша.
- Сохранить и при необходимости перезапустить сервис.
- Убедиться, что логин, куки и редиректы работают между фронтом и бэком.

---

## 5. Проверка сценариев на production

Пройти вручную по чек-листу из `spec/PRD.md` и раздела 7 `spec/IMPLEMENTATION.md`:

- Регистрация, логин, выход.
- Создание, редактирование, удаление вишлиста и подарков.
- Переход по публичному `slug` как гость / друг / владелец.
- Резервация подарка и внесение взносов.
- Отображение статусов и прогресса коллекции.

---

## 6. Staging (опционально)

- Создать на Render второй **Web Service** и второй **Static Site** (например `giftgoals-staging-backend`, `giftgoals-staging-frontend`).
- В Neon завести отдельную ветку или базу для staging.
- В staging-сервисах задать свои `DATABASE_URL`, `FRONTEND_URL`, `VITE_API_BASE_URL` (на URL staging-бэкенда).
- Настроить деплой staging с отдельной ветки (например `develop`) через **Branch** в настройках каждого сервиса.

После базового деплоя можно добавить CI (GitHub Actions) для lint/test и автоматического деплоя на Render при пуше в нужные ветки.
