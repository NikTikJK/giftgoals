# GiftGoals UX Specification

This document describes UX requirements for the GiftGoals social wishlist web application, based on the current PRD. Business logic and roles are defined in `spec/PRD.md`.

## 1. Roles and general principles

- **Guest**:
  - lands on a public wishlist via link without authentication;
  - sees the wishlist fully (header, all gifts, statuses, collection progress);
  - does not see identities of reservers and contributors;
  - cannot reserve gifts or contribute — on attempt, receives a modal prompting to log in or sign up, staying on the same page.

- **Friend** (logged‑in user who is **not** the wishlist owner):
  - can open a wishlist via public link;
  - sees everything the Guest sees;
  - additionally can:
    - reserve regular gifts;
    - contribute to collections for “expensive” gifts;
    - (Phase 2) suggest new gifts to the owner;
  - sees the reservers’ identities (name/avatar), but does not see who contributed how much (only progress and, optionally, an anonymous count of participants).

- **Wishlist owner**:
  - manages own wishlists in a personal area (create/edit/delete);
  - when opening their wishlist via public link:
    - sees the same content as the Friend;
    - does not see who reserved or who contributed and how much;
    - **does not have** “Reserve” / “Contribute” buttons (cannot act as a Friend in their own wishlist);
  - (Phase 2) manages the queue of suggested gifts.

General UX principles:
- clearly indicate the current user role (Guest / Friend / Owner);
- avoid losing context on login/registration from a public wishlist;
- minimise “silent” failures — any restriction must be accompanied by a clear message.

## 2. Visual style and UI

This section complements the PRD (`spec/PRD.md`) and UX flows in this document. It describes visual decisions (colors, typography, spacing, components and their states) that frontend developers can implement.

### 2.1. Color palette

- **Core tokens**:
  - `color-primary` — #2563EB (vivid blue, primary action color: main buttons, active links).
  - `color-primary-soft` — #DBEAFE (soft background for highlighting primary‑related blocks and states).
  - `color-accent` — #F97316 (orange accent: selected important CTAs, progress elements).
  - `color-success` — #16A34A (success: confirmations, completed collections).
  - `color-warning` — #FACC15 (warnings: underfunding, limits, soft alerts).
  - `color-danger` — #DC2626 (errors: failed reserve/contribution, critical messages).
  - `color-neutral-900` — #0F172A (primary dark text).
  - `color-neutral-700` — #334155 (secondary text, labels).
  - `color-neutral-500` — #64748B (muted text, hints).
  - `color-neutral-200` — #E5E7EB (borders, dividers).
  - `color-neutral-50` — #F9FAFB (card/surface background).
  - `color-background` — #FFFFFF (page background).
  - `color-border` — #E5E7EB (input/card/modal borders).
  - `color-overlay` — rgba(15, 23, 42, 0.5) (backdrop for modals).

- **Gift and collection statuses**:
  - `status-free` — text/icon in `color-neutral-700`, default background.
  - `status-reserved` — badge with background `color-primary-soft`, text `color-primary`.
  - `status-collect-open` — progress bar in `color-primary`, track in `color-neutral-200`.
  - `status-collect-complete` — progress bar/badge in `color-success` with a more saturated bar.
  - `status-collect-underfunded` — accent `color-warning` (background/icon), neutral text.

- **Themes**:
  - MVP uses **only a light theme** (values above).
  - Dark theme support can be added later as an extension (overriding the same tokens).

### 2.2. Typography

- **Base font**:
  - Family: system UI (e.g. `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`).

- **Sizes and weights (tokens)**:
  - `font-size-xs` — 0.75rem (12px);
  - `font-size-sm` — 0.875rem (14px);
  - `font-size-md` — 1rem (16px, base text);
  - `font-size-lg` — 1.125rem (18px);
  - `font-size-xl` — 1.5rem (24px, main headings).
  - `font-weight-regular` — 400;
  - `font-weight-medium` — 500;
  - `font-weight-semibold` — 600.

- **Hierarchy**:
  - Page title (H1): `font-size-xl`, `font-weight-semibold`, `color-neutral-900`.
  - Section headings (H2/H3): `font-size-lg` or `font-size-md`, `font-weight-medium`.
  - Card/form text: `font-size-md`, `font-weight-regular`, `color-neutral-900`.
  - Field labels/hints: `font-size-sm`, `color-neutral-500`.
  - Error text: `font-size-sm`, `color-danger`, `font-weight-medium`.
  - Status/badge text: `font-size-xs` or `font-size-sm` depending on context.

### 2.3. Layout, spacing, radii, shadows

- **Grid and spacing**:
  - Base step: 4px.
  - Tokens:
    - `spacing-xs` — 4px;
    - `spacing-sm` — 8px;
    - `spacing-md` — 12px;
    - `spacing-lg` — 16px;
    - `spacing-xl` — 24px;
    - `spacing-2xl` — 32px.
  - Principles:
    - vertical rhythm between sections is built on multiples of `spacing-md`/`spacing-lg`;
    - padding inside cards — `spacing-md` on sides, `spacing-sm`/`spacing-md` between elements.

- **Radii**:
  - `radius-sm` — 4px (inputs, badges, small elements);
  - `radius-lg` — 8px (cards, modals, toasts).

- **Shadows**:
  - `shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.06)`;
  - `shadow-md`: `0 4px 12px rgba(15, 23, 42, 0.12)`.
  - Usage:
    - `shadow-sm` — for cards and hover states;
    - `shadow-md` — for modals and toasts, to place them above content.

### 2.4. Base UI components (atoms)

- **Buttons**:
  - Variants:
    - `btn-primary`: background `color-primary`, text `#FFFFFF`;
    - `btn-secondary`: background `color-neutral-50`, text `color-neutral-900`, border `color-neutral-200`;
    - `btn-ghost`: no background, text `color-primary`, background `color-primary-soft` on hover;
    - `btn-danger`: background `color-danger`, text `#FFFFFF`.
  - States:
    - `default`: as described above;
    - `hover`: slightly darker background or stronger shadow;
    - `active`: slightly darker background, no animations required for MVP;
    - `disabled`: background and text in `color-neutral-200/500`, cursor `not-allowed`;
    - `focus-visible`: clear outline (2px) with a contrasting color (e.g. `#1D4ED8`).

- **Inputs**:
  - Background `#FFFFFF`, border `color-neutral-200`, radius `radius-sm`;
  - `focus`: border in `color-primary`, light shadow;
  - `error`: border and error icon/text in `color-danger`;
  - `disabled`: background `color-neutral-50`, text `color-neutral-500`.

- **Checkboxes/radios**:
  - Size ~16px, radius 4px for checkbox, 50% for radio;
  - active state — fill `color-primary`, checkmark/dot icon white.

- **Icons**:
  - Base size 16–20px;
  - Style: simple line/fill icons, no excessive detail, colors bound to status tokens (`success`, `warning`, `danger`, `primary`).

### 2.5. Accessibility (a11y)

- Minimum requirements:
  - text and background contrast for main text and CTAs ≥ WCAG AA;
  - all interactive elements (buttons, links, fields, clickable cards) have a clear focus style;
  - key flows (registration, login, reserve, contribute) are keyboard‑accessible.
- ARIA patterns:
  - modals — with `aria-modal`, focus trap, and proper focus return;
  - toasts — `role="status"` or `role="alert"` depending on severity;
  - progress bar — `role="progressbar"` with `aria-valuemin/max/now`.

## 2. User flows

### 2.1. Registration and login

**Registration**
- Entry points:
  - “Sign up” button on the landing page;
  - link from the Guest modal when attempting to reserve/contribute.
- Form:
  - fields: email, password, (optionally) password confirmation;
  - validation: valid email, password at least N characters (exact N set at implementation), error messages under fields;
  - link “Already have an account? Log in”.
- After successful registration:
  - user is automatically authenticated;
  - redirect:
    - if they came from a public wishlist — back to that wishlist, restoring the intended action (e.g. reopen the specific gift card for reservation);
    - otherwise — to the personal “Wishlists” screen.

**Login**
- Entry points:
  - “Log in” button on landing/header;
  - link from the Guest modal.
- Form:
  - fields: email, password;
  - “Continue with Google” button;
  - link “Create account”.
- After successful login:
  - same as registration — return to original page (if it was a public wishlist) or go to the personal area.

### 2.2. Owner dashboard

**Wishlist list**
- `Wishlists` screen:
  - list of wishlist cards:
    - title;
    - event date (if present);
    - number of gifts;
    - indicator for active collections;
  - top “Create wishlist” button.
- Actions on a card:
  - “Open” (switch to owner mode for that wishlist);
  - “Public link” (copy URL);
  - “Edit” (title, description, date, threshold settings);
  - “Delete” (confirmation modal warning about voiding reservations/contributions).

**Create / edit wishlist**
- Form:
  - title (required);
  - description / occasion (optional);
  - event date (optional but recommended);
  - “expensive gift” threshold (default 5000 ₽, editable);
  - option to enable/disable public link.
- On the same form or immediately after creation:
  - ability to add initial gifts (see 2.3).

### 2.3. Gift management

**Add/edit gift**
- Modal or separate screen:
  - title (required);
  - product URL;
  - approximate price (rubles, integer or decimal);
  - image (URL or upload; for MVP, URL is enough);
  - comment (optional).
- Additionally:
  - current “expensive” threshold for this wishlist;
  - explanation that type (regular/expensive) is determined automatically by price.
- Editing an expensive gift with existing contributions:
  - UX must clearly warn that changing the price will change the target collection amount (but not the already collected part).

**Gift list**
- For the owner:
  - full list of gifts with:
    - type (regular/expensive);
    - status (free/reserved/collection open/collection complete/collection underfunded);
    - for expensive gifts — progress bar `collected / target`;
  - actions:
    - “Edit”;
    - “Delete” (with confirmation notice about voiding reservation/contributions).

### 2.4. Viewing wishlist by link

**Guest**
- Sees:
  - header (title, event date, description);
  - all gifts;
  - gift statuses and collection progress.
- On clicking:
  - “Reserve” or “Contribute”:
    - show a modal:
      - short explanation that login/registration is required;
      - buttons “Log in” and “Sign up”;
      - close / “Cancel”;
    - after login/registration, return to the same wishlist and the same gift.

**Friend (logged in, not owner)**
- Elements:
  - for a regular gift:
    - either “Reserve” button if gift is free;
    - or text “Reserved” plus optional reserver name/avatar;
  - for an expensive gift:
    - “Contribute” form/button (amount input);
    - progress bar and amounts;
    - “Collection complete” status when target reached;
  - on error (gift already reserved, collection complete) — toast or inline message near the card.

**Owner via public link**
- Sees the same list and statuses as Friend;
- **Does not see** “Reserve” and “Contribute” buttons;
- May have a button “Open as owner” (go to the owner dashboard view for this wishlist).

### 2.5. Reservation

- Friend flow:
  - clicks “Reserve”;
  - optionally sees a confirmation modal (“Are you sure you want to reserve this gift?”);
  - on success:
    - status changes to “Reserved”;
    - other users see the updated status via real‑time update/refresh;
    - toast “Gift reserved” appears.
  - on error (gift already reserved):
    - show message like “Unfortunately, someone has already reserved this gift”;
    - update card status in UI.
- Cancelling reservation:
  - available until event date (if set);
  - initiated from the card (“Cancel reservation”);
  - after event date, the button is hidden/disabled.

### 2.6. Group collection

- Friend flow:
  - on the card of an expensive gift:
    - sees target amount, collected amount, progress;
    - enters contribution amount;
    - system checks that contribution will not overfund the goal; optionally can auto‑suggest a “max allowed” amount;
    - on success:
      - progress updates;
      - toast “Contribution recorded” appears.
    - on attempt to overfund:
      - show error message and suggest correcting the amount.
- Underfunding and extension:
  - when event date passes and goal is not reached:
    - gift status indicates that goal was not reached;
    - after owner decides to extend, date and status are updated.

### 2.7. Gift suggestions (Phase 2)

- Friend flow:
  - “Suggest a gift” button on public wishlist (Friends only);
  - modal with same fields as a regular gift;
  - after submit:
    - suggestion disappears from Friend’s UI (only message “Your suggestion has been sent to the owner”);
    - goes into the owner’s suggestions queue.
- Owner flow:
  - in owner mode, sees a separate “Suggestions” list;
  - each suggestion shows minimal gift info and two buttons:
    - “Accept” — gift is added to main gift list;
    - “Reject” — suggestion is removed from the queue;
  - suggester identity is not shown anywhere.

## 3. Структура экранов и навигации

Основные разделы SPA:

- `Главная` (опционально):
  - краткое описание продукта;
  - CTA: «Войти» / «Зарегистрироваться».
- `Вишлисты` (кабинет владельца):
  - список вишлистов;
  - кнопка «Создать вишлист».
- `Детали вишлиста (режим владельца)`:
  - шапка вишлиста;
  - список подарков с действиями владельца;
  - (Phase 2) вкладка/блок «Предложения».
- `Публичный вишлист` (по slug):
  - один и тот же URL для гостя/друга/владельца, но разный набор доступных действий.
- `Профиль / Настройки`:
  - смена имени;
  - смена пароля;
  - выход.

Навигация:
- верхнее меню (для залогиненных): «Вишлисты», «Профиль», «Выход»;
- для незалогиненных: «Войти», «Зарегистрироваться»;
- доступ к публичному вишлисту — только по прямой ссылке.

## 4. Состояния и статусы

### 4.1. Подарки

- Статусы:
  - `свободен`;
  - `зарезервирован`;
  - `сбор открыт`;
  - `сбор завершён` (цель достигнута);
  - `сбор недобор` (дата события прошла, цель не достигнута).
- Для дорогих подарков всегда отображается прогресс и целевая сумма.

### 4.2. Вишлист

- С датой события:
  - влияет на:
    - возможность снятия резерва;
    - отправку уведомлений о недоборе;
    - статусы сборов.
- Без даты события:
  - снятие резерва доступно всегда;
  - уведомления о недоборе не отправляются, пока владелец не установит дату при продлении.

### 4.3. Резервы и вклады

- Для владельца:
  - видит только факт наличия резерва по подарку;
  - видит только суммарный прогресс по сбору, без разбивки по людям.
- Для друга:
  - видит, какие подарки зарезервированы и кем (имя/аватар);
  - по сбору видит прогресс и, опционально, число участников (без имён и сумм).
- Для гостя:
  - видит только факт резерва и прогресс сборов без деталей.

## 5. Ошибки и крайние случаи

Ключевые UX‑ошибки:

- Подарок уже зарезервирован к моменту запроса:
  - показать сообщение и обновить карточку.
- Вклад переполняет цель:
  - сообщение об ошибке, подсказка скорректировать сумму (например, «максимально доступно X»).
- Лимиты:
  - при попытке создать > 50 вишлистов, > 200 подарков или превышении лимита предложений — понятное сообщение, какое ограничение сработало.
- Недоступный вишлист:
  - удалён или скрыт — отдельный экран/сообщение.

## 6. Реалтайм и уведомления (UX)

- При изменения статуса подарка или прогресса сбора:
  - обновлять данные на странице (через polling/SSE) без перезагрузки;
  - по возможности отображать ненавязчивый индикатор обновления.
- In-app уведомления:
  - глобальный индикатор (значок колокольчика / счётчик);
  - список уведомлений с краткими описаниями (новые резервы, новые вклады, недобор, продление сбора, принятые/отклонённые предложения в Phase 2).

## 7. MVP vs Phase 2

- **MVP**:
  - все сценарии из раздела 7 PRD (регистрация/вход, личный кабинет, создание/редактирование/удаление вишлистов и подарков, публичный вишлист, резервирование, групповой сбор, реалтайм‑обновления, адаптивность);
  - базовые in-app уведомления.
- **Phase 2**:
  - предложения подарков;
  - расширенные настройки уведомлений и профиля.

