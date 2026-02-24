# PRD: Social Wishlist “GiftGoals”

**Document version**: 1.0 (February 2025)  
**Implementation**: frontend on React SPA, backend on Express (Node.js) with PostgreSQL (see section 4).

## 1. Product goal

Build a social wishlist web application where users:
- create and maintain wishlists for different occasions (birthday, New Year, etc.);
- share lists via a public link;
- let friends reserve gifts and contribute to expensive items;
- receive near real‑time updates of gift statuses.

Focus: simplicity for end users, clear sharing flow, transparent gift status **without spoilers for the wishlist owner**.

## 2. Main user roles

- **Guest**: opens a public link without registration. Can **see the entire wishlist** (title, description, date, all gifts with images, price, status “free” / “reserved” / collection progress). **Does not see** who is reserving or contributing. **Cannot** reserve or contribute — registration/login is required.
- **Wishlist owner**: registered user who creates and edits wishlists.
- **Friend (participant)**: registered user who opens a wishlist via link and is **not** the owner. Can reserve gifts and contribute to a group collection. The wishlist owner **cannot** reserve or contribute in **their own** wishlist (when opening their public link, “Reserve” / “Contribute” actions are unavailable for them).

## 3. Main user scenarios

### 3.1. Registration and authentication

- **Registration**: via email + password.
- **Login**:
  - via email + password;
  - via Google (OAuth): “Sign in with Google” button, no password required.
- Both login methods should lead to the same account type (optionally in MVP, a user can later link email and Google to one profile).

### 3.2. Profile management (MVP)

- Change display name.
- Change password.
- Log out.

### 3.3. Creating and managing wishlists

- Creating a new wishlist:
  - list title (required);
  - description/occasion (optional);
  - event date (optional but recommended);
  - when creating a list, the owner can immediately add desired gifts (gift fields — see section 3.4).
- View the list of own wishlists.
- Editing:
  - change title/description/date;
  - enable/disable public link;
  - add, edit, and delete gifts in the list;
  - delete a wishlist (when deleted, all reservations and contributions for that wishlist are considered void; in MVP, refunds are out of scope).
- Public link:
  - generates a unique slug/ID;
  - allows viewing the list without authentication;
  - when opening the public link **from an authenticated account**, the user can interact with the list as a Friend (reserve, contribute) **if they are not the owner of this wishlist** (the owner on their own public link cannot reserve or contribute, see sections 3.5–3.7).

### 3.4. Managing gifts within a wishlist

- Adding a gift:
  - title (required);
  - product URL;
  - approximate price;
  - image (URL or upload — for MVP, URL is sufficient);
  - comment/notes (optional).
- Editing a gift (same fields). If a “expensive” gift already has contributions, changing the price recalculates the target collection amount (the amount already collected does not change). When a gift is deleted, its reservation and contributions are voided (no refunds in MVP).
- Deleting a gift.
- **Gift type is determined automatically** based on a price threshold:
  - if the approximate price is **below** the threshold, the gift is considered “regular” (only a single‑person reservation is available);
  - if the price **reaches or exceeds** the threshold, the gift is considered “expensive” (group collection is available, see section 3.7).
- The price threshold is configured **by the owner in each wishlist’s settings** (each list has its own threshold; it defines which gifts are treated as “expensive” and available for group collection). If no threshold is set when the wishlist is created, a default value of **5000 ₽** is used (see section 4).

### 3.5. Viewing a wishlist via public link (roles: Guest/Friend)

- **Guest (unauthenticated)**:
  - sees the wishlist **entirely**: title, description, event date, all gifts with images, prices, and statuses (e.g. “free”, “reserved”, collection progress in %);
  - **does not see** who reserved what or who contributed and how much;
  - **cannot** reserve gifts or contribute — upon attempting an action a modal appears prompting to register/log in; the user stays on the same wishlist page, and after successful auth they can continue the action without losing context.
- **Friend (logged in, not owner)**:
  - same view as Guest, plus the ability to reserve and contribute (see sections 3.6 and 3.7);
  - sees the identities (name/avatar) of users who reserved gifts (see section 3.6).
- **Wishlist owner** opening their own wishlist by public link sees the same content, but reserve/contribute buttons are unavailable to them (see section 2).

### 3.6. Reserving a gift (role: Friend)

- Only a **registered user (Friend)** who is **not** the owner of the wishlist can reserve. Guest and owner of this wishlist cannot reserve.
- A Friend can:
  - reserve a regular gift (status becomes “reserved”); the reservation is created only if the gift is free at the moment of the request, otherwise an error is returned (see section 4, concurrency);
  - cancel their own reservation until the wishlist’s event date (after the event date, the reservation is final; see section 4).
- Visibility rules:
  - the **wishlist owner does not see** who exactly reserved the gift;
  - the **Guest does not see** who reserved — only the fact “reserved”;
  - Friends (logged‑in users) see the reservation fact and the reservers’ identities (name/avatar).

### 3.7. Group collection for an expensive gift

- For a gift whose price has reached or exceeded the threshold (type “expensive” is determined automatically, see section 3.4), instead of a simple reservation a “collection” mode is available.
- Only a **registered user (Friend)** who is **not** the wishlist owner can contribute. Guest and owner cannot contribute.
- There is no minimum contribution amount: any positive amount (strictly greater than 0) is allowed.
- A Friend can:
  - enter their contribution amount;
  - submit the contribution (for MVP, logical accounting without real payment gateway is enough); the contribution is accepted only if the total will not exceed the target amount, otherwise an error is returned (see section 4, concurrency).
- Display:
  - progress bar: collected amount / target amount;
  - when entering an amount the system **must not allow** a contribution that would overfund the goal: the maximum allowed contribution is limited so that the total becomes exactly equal to the target, not exceeding it (overfunding is forbidden);
  - if by the event date the target is not reached, the wishlist owner can **extend the collection** for this gift (set a new date or leave it open); participants and owner receive **notifications** about underfunding **3 days before the event date** and **on the event date** (message like “Gift X is 60% funded, Y remains to goal”). If the wishlist has no event date, underfunding notifications are not sent (see section 4). Default channel is in‑app; email can be added later.
- Visibility rules:
  - the owner does not see **who** or **how much** contributed;
  - the **Guest does not see** who and how much contributed — only aggregate progress (e.g. “60% funded”);
  - Friends (logged‑in) see progress and, optionally, the anonymous number of participants.

### 3.8. Real‑time updates

- When a gift is reserved or a contribution is made:
  - all open clients viewing this wishlist receive an update without page reload (WebSocket / SSE or equivalent).
- Real‑time events:
  - gift status change (free → reserved);
  - collection progress change;
  - reservation cancellation.

### 3.9. Gift suggestions (Phase 2 / post‑MVP)

- **Who can suggest**: only logged‑in users (Friends) who opened the wishlist via link. Guests cannot suggest gifts.
- **Idea**: a Friend can submit a **gift suggestion** to a wishlist — same fields as a regular gift (title, URL, price, image, comment). The suggestion lands in the owner’s “Suggestions” queue and is not visible in the public gift list until the owner decides.
- **Owner’s decision**: the owner sees the list of suggestions and for each can press **Accept** (gift is added to the wishlist as a normal item) or **Reject** (suggestion is removed from the queue). The owner **does not see** who suggested the gift — the suggester remains anonymous.
- **Limits**: at most **20** pending suggestions per wishlist and at most **2** suggestions from one user per wishlist (see section 4).
- **Notifications**: when a suggestion is accepted or rejected, the system notifies the suggester (without exposing owner identity — just “your suggestion was accepted” / “rejected”). Default channel is in‑app (see section 4).

## 4. Non‑functional and technical requirements

- **Architecture**: split stack — React SPA frontend and separate Express backend. Data exchange via REST/JSON API over HTTP.
- **Frontend (SPA)**: separate React application (React + TypeScript, e.g. Vite), built into static assets and running in the browser; uses backend REST API for all data operations.
- **Backend**: Express (Node.js, preferably TypeScript), implementing REST/JSON API according to this PRD (auth, wishlist and gift CRUD, reservations, contributions, real‑time updates).
- **Database and data access**: PostgreSQL (managed, e.g. Supabase/Railway/Render), accessed via ORM/Query Builder (Prisma, Drizzle or similar).
- **Authentication**: email + password (registration and login) and Google login (OAuth); passwords stored hashed (bcrypt or argon2); exact password strength rules will be defined at implementation time. Session/token (JWT in httpOnly cookie or similar) is checked on each API request.
- **Security and validation**: backend must check user role (wishlist owner — only their own lists; reserve/contribute — only if user is not the owner of this wishlist). Input validation: maximum lengths for title, description, URL; gift price and contribution are non‑negative numbers; public slug is unique and hard to guess (sufficiently long random ID). Implement rate limiting for registration, login and, if needed, for public link access.
- **Public link** to a wishlist works **without registration** (view only).
- **Responsiveness**: correct display on mobile screens.
- **Soft limits**: up to 50 wishlists per account; up to 200 gifts per wishlist. On reaching a limit, show a message and prevent creating more.
- **System constants and defaults** (set by the system; owner can change only where explicitly allowed):
  - **Default “expensive” price threshold**: if owner does not set a threshold when creating a wishlist, use **5000 ₽** (owner can change in wishlist settings).
  - **Underfunding notifications** (group collection): send **3 days before the event date** and **on the event date**; default channel — **in‑app** (shown on next login). Email can be added later. If the wishlist has **no event date**, underfunding notifications are not sent (the collection deadline is treated as absent until the owner explicitly extends the collection and sets a date).
  - **Reservation cancellation**: allowed **until the wishlist event date**; after the event date the reservation is final and cannot be cancelled. If the wishlist has **no event date**, reservation can be cancelled at any time (no date restriction).
  - **Gift suggestions (Phase 2)**: at most **20** pending suggestions per wishlist; at most **2** suggestions from one user per wishlist. Notification to the suggester on acceptance/rejection — default channel **in‑app**.
- **Currency and price storage**: single currency — Russian ruble (RUB). Prices and contributions are stored as integer minimal units (kopecks); conversion to rubles is done on the frontend. The “expensive” threshold and default value 5000 ₽ are defined in rubles and converted to kopecks for storage.
- **Real‑time and notifications (technical)**: for MVP, it is acceptable to implement near real‑time via short polling (5–15s interval) or SSE; if serverless hosting does not support long‑lived connections, WebSocket may require a dedicated service — choose approach based on hosting. In‑app notifications are stored in DB (notifications table per user) and shown on login and, if possible, while the app is open.
- **Concurrent operations**: one operation for regular gift reservation must both check that the gift is still free and create the reservation; if conflict (already reserved), API returns an error and message. Contributions must be processed in a single transaction verifying that total will not exceed target; on conflict, return error and message (see sections 3.6 and 3.7).
- **API limits and errors**: on hitting limits (wishlists, gifts, suggestions), API must return a clear error (e.g. 403 or 400 with code), and frontend shows a human‑readable message (see limits above).
- **Deployment**:
  - frontend (React SPA): static hosting (Vercel, Netlify, Cloudflare Pages, etc.), frontend built as static files;
  - backend (Express) + PostgreSQL: PaaS (Railway, Render, Fly.io, etc.) with Node.js and environment variables (`DATABASE_URL` and other secrets).

## 5. UX requirements (high‑level)

This section captures only key UX principles for MVP. Full screen, flow, and state descriptions are in the dedicated UX document “GiftGoals UX Specification” (`spec/UX.md`), which complements this PRD.

- Empty wishlist state:
  - copy/illustration explaining that desired gifts will appear here;
  - primary CTA button “Add first gift”.
- Public link page:
  - Guest sees the full wishlist (without reserver/contributor names); “Reserve” / “Contribute” buttons trigger a login/registration prompt;
  - simple layout: header with main info, then gift cards.
- Error states:
  - wishlist deleted or unavailable;
  - gift not available for reservation (already reserved or collection closed).

## 6. Previously open product questions (now fixed)

Decisions:
- **Minimum contribution**: not enforced; any positive amount (> 0) is allowed.
- **Overfunding**: forbidden — contribution may only bring the total **up to** the target, not above (see section 3.7).
- **Limits**: up to 50 wishlists per account; up to 200 gifts per wishlist (see section 4).
- **“Expensive” threshold**: configurable by owner in each wishlist settings (see section 3.4).
- **Underfunding by event date (expensive gift)**: combination of **collection extension** and **notifications**. Owner can extend the collection (new date or no date); underfunding notifications are sent **3 days before the date** and **on the event date**, default channel in‑app (see sections 3.7 and 4).

## 7. MVP scope

For the first version (MVP) implement:

1. Registration via email + password; login via email + password and via Google.
2. Personal list of owner’s wishlists.
3. Creating/editing/deleting wishlists.
4. Adding/editing/deleting gifts.
5. Public wishlist page (view without registration).
6. Gift reservations (without exposing identities/amounts to the owner).
7. Group collection with progress bar (no real payments).
8. Near real‑time updates of gift statuses and collection progress.
9. Responsive layout for mobile.

**Post‑MVP (Phase 2):** gift suggestions by friends, with owner accept/reject and suggester anonymity (see section 3.9).

---

## Glossary

- **Wishlist** — a list of desired gifts created by the owner and available via public link.
- **Owner** — the wishlist author; creates and edits the list, does not see who reserves or contributes.
- **Guest** — unauthenticated user opening a wishlist via link; view‑only.
- **Friend** — logged‑in user (not owner) opening the wishlist via link; can reserve and contribute.
- **Regular gift** — gift priced below the threshold; only single‑user reservation is available.
- **Expensive gift** — gift priced at or above the threshold; group collection is available.
- **Reservation** — assignment of a regular gift to a single Friend.
- **Contribution** — an amount a Friend adds to a group collection for an expensive gift.
- **Suggestion (Phase 2)** — gift proposed by a Friend to the owner for inclusion in the wishlist; owner accepts or rejects.