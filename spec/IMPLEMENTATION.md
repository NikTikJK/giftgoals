# GiftGoals Implementation Plan

This document describes practical steps for implementing the GiftGoals project on **React SPA + Express + PostgreSQL** in line with `spec/PRD.md` and `spec/UX.md`.

## 1. Repository and environment setup

- Create a repository with two main parts:
  - `frontend/` — React SPA (Vite + React + TypeScript).
  - `backend/` — Express (Node.js + TypeScript) with PostgreSQL access.
- Configure core tooling:
  - linter (ESLint) and formatter (Prettier) for both frontend and backend;
  - `dev`, `build`, `test` scripts for each part.
- Define environment variables:
  - backend: `DATABASE_URL`, JWT/OAuth secrets, base port, etc.;
  - frontend: `VITE_API_BASE_URL` (or equivalent) for API access.

## 2. Database and models

- Choose ORM/Query Builder (e.g. Prisma or Drizzle).
- Design and document DB schema (aligned with PRD):
  - `users` — users, auth and profile data;
  - `wishlists` — wishlists (owner, title, description, event date, “expensive” threshold, slug);
  - `gifts` — gifts (wishlist FK, title, price, URL, regular/expensive type, etc.);
  - `reservations` — gift reservations;
  - `contributions` — group collection contributions;
  - `suggestions` — gift suggestions (Phase 2);
  - `notifications` — in‑app notifications.
- Set up DB migrations and a minimal seed (a few test users, lists, gifts).

## 3. Backend: Express + PostgreSQL

- Set up Express app:
  - JSON body parser, CORS (if needed), request logging;
  - ORM/Query Builder connected to PostgreSQL via `DATABASE_URL`.
- Implement domains:
  - **Auth**:
    - registration/login via email + password;
    - Google OAuth login;
    - issue and verify JWT/sessions (httpOnly cookie).
  - **User & profile**:
    - get/update profile (name, email, settings).
  - **Wishlists**:
    - CRUD with owner checks;
    - unique slug generation;
    - enable/disable public link.
  - **Gifts**:
    - CRUD within a wishlist;
    - automatic type detection (regular/expensive) based on threshold;
    - logic for changing price of an expensive gift and updating collection target.
  - **Reservations**:
    - create/cancel reservation with up‑to‑date status checks;
    - disallow owner and guest from reserving.
  - **Group collection**:
    - create contributions with goal checks (no overfunding);
    - underfunding and extension logic (linked to event date).
  - **Public access**:
    - endpoints to fetch wishlist and gifts by slug;
    - different behavior by role (Guest/Friend/Owner) at data level.
  - **Notifications**:
    - persist in‑app notifications about reservations, contributions, underfunding, suggestions (Phase 2);
    - endpoint to fetch and mark as read.
- Wrap critical operations in transactions (reservations, contributions) and return consistent errors.

## 4. Frontend: React SPA

- Initialize project (e.g. `npm create vite@latest` with React + TS template).
- Configure routing (React Router or similar):
  - `/` — landing (optional);
  - `/auth/login`, `/auth/register`;
  - `/app/wishlists` — owner dashboard;
  - `/app/wishlists/:id` — wishlist details (owner mode);
  - `/w/:slug` — public wishlist for Guest/Friend/Owner.
- Implement main screens:
  - auth forms (including modals launched from public wishlist);
  - owner dashboard (wishlist list, create/edit/delete);
  - wishlist details (gift management, Phase‑2 suggestions view);
  - public wishlist with role‑dependent actions.
- Implement visual style and UI components based on `spec/UX.md`:
  - buttons, inputs, status badges;
  - wishlist and gift cards (regular/expensive);
  - collection progress bar;
  - confirmation and form modals;
  - toasts and notifications panel.
- Implement API layer:
  - common request wrapper (axios/fetch) with error handling and token handling;
  - hooks/services for each domain (auth, wishlists, gifts, reservations, contributions, notifications).

## 5. Real‑time and data refresh

- For MVP, implement updates:
  - via periodic polling (e.g. every 5–15 seconds) for key screens (public wishlist, owner dashboard);
  - or via SSE if hosting supports long‑lived connections.
- Refresh:
  - gift statuses (free/reserved);
  - collection progress;
  - new notifications for owner and friends.

## 6. Testing

- Derive scenarios from PRD section 7 and `spec/UX.md`:
  - registration/login from different entry points (landing, public wishlist);
  - create/edit/delete wishlists and gifts;
  - reservations (successful and conflicting cases);
  - contributions (success, overfund attempts, underfunding, extension);
  - behavior for Guest/Friend/Owner via link.
- Add:
  - unit tests for key backend services;
  - basic integration/end‑to‑end tests for critical flows (registration, create wishlist, reserve, contribute).

## 7. Deployment and environments

- Configure environments:
  - `development` — local development;
  - `staging` (if possible) — test deployment;
  - `production` — live environment.
- Deployment:
  - frontend: upload built React SPA to static hosting (Vercel/Netlify/Cloudflare Pages, etc.);
  - backend + PostgreSQL: deploy to PaaS (Railway/Render/Fly.io), set environment variables and run migrations.
- Manually run main scenarios on `staging`/`production` following a checklist derived from PRD/UX.

## 8. Optional extras

- Set up CI (GitHub Actions or similar) for:
  - linting and tests on pull requests;
  - deployment to staging/production on pushes to specific branches.

## 9. Implementation priorities

1. Database and models (migrations).  
2. Core backend (Auth, Wishlists, Gifts, public endpoints).  
3. Core frontend (routing, screens, integration with Auth and Wishlists).  
4. Reservations and group collection + real‑time updates.  
5. Notifications.  
6. UX/UI polishing and production readiness.  