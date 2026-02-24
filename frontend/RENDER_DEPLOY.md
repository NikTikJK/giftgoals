# Деплой фронтенда GiftGoals на Render (Static Site)

Фронт уже подготовлен: сборка выводит в `dist`, API-клиент использует `VITE_API_BASE_URL` при сборке. Ниже — пошаговая настройка на Render.

---

## 1. Создать Static Site

1. Зайди в [Render Dashboard](https://dashboard.render.com).
2. **New → Static Site**.
3. Подключи репозиторий **giftgoals** (тот же, что и для бэкенда), если ещё не подключён.
4. Настрой сервис:
   - **Name:** `giftgoals-frontend` (или любое имя).
   - **Region:** тот же, что у бэкенда.
   - **Root Directory:** `frontend`.
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

---

## 2. Переменные окружения

В разделе **Environment** добавь одну переменную:

| KEY | VALUE |
|-----|--------|
| `VITE_API_BASE_URL` | Полный URL бэкенда **с путём `/api`**, например `https://giftgoals-backend.onrender.com/api` |

Подставь свой URL бэкенда из Render (без слэша в конце пути, но с `/api`).

---

## 3. SPA: редирект для React Router

Чтобы при прямом заходе на `/app/wishlists`, `/w/xxx` и т.п. не было 404, нужен rewrite:

1. В настройках Static Site открой вкладку **Redirects/Rewrites**.
2. **Add Rule**:
   - **Source Path:** `/*`
   - **Destination Path:** `/index.html`
   - **Action:** **Rewrite** (не Redirect).

Так все запросы к несуществующим путям будут отдавать `index.html`, и маршрутизацией займётся React Router.

---

## 4. Деплой

1. Включи **Auto-Deploy** из ветки `main` (или нужной ветки).
2. Нажми **Create Static Site** и дождись первого деплоя.
3. После успешного деплоя скопируй **URL сайта** (например `https://giftgoals-frontend.onrender.com`).

---

## 5. Связать с бэкендом (CORS)

В настройках **бэкенда** (Web Service) в **Environment** задай:

- **FRONTEND_URL** = URL только что созданного фронта, без слэша в конце, например `https://giftgoals-frontend.onrender.com`.

Сохрани и при необходимости перезапусти бэкенд. После этого логин и запросы с фронта к API будут проходить без ошибок CORS.

---

## Краткий чек-лист

- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Env: `VITE_API_BASE_URL` = `https://<твой-бэкенд>.onrender.com/api`
- [ ] Redirects/Rewrites: `/*` → `/index.html` (Rewrite)
- [ ] В бэкенде: `FRONTEND_URL` = URL этого Static Site
