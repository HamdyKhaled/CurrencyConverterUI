# Currency Converter UI

A React + TypeScript frontend for the Currency Converter Platform.

---

## Tech Stack

- **React 18** with TypeScript
- **Vite** (dev server + build)
- **Tailwind CSS** (styling)
- **Vitest + Testing Library** (unit / component tests)

---

## Setup & Local Development

### Prerequisites
- Node.js ≥ 20
- Backend API running (see `../CurrencyConverter/README.md`)

### Install dependencies

```bash
npm install
```

### Configure environment

The app reads the API base URL from an environment variable. For local development `.env.development` is already provided:

```
VITE_API_BASE_URL=https://localhost:7130/api/v1
```

For production builds `.env.production` sets:

```
VITE_API_BASE_URL=/api/v1
```

Override `VITE_API_BASE_URL` in your CI/deployment environment as needed.

### Run dev server

```bash
npm run dev
```

App is available at `http://localhost:5173`. The Vite dev proxy forwards `/api/*` to `https://localhost:7130` (see `vite.config.ts`).

### Production build

```bash
npm run build
```

---

## Authentication

- Login at `/login` with a username and password.
- The JWT token is stored in `localStorage`.
- All API calls in `src/services/apiClient.ts` attach `Authorization: Bearer <token>`.
- On receiving `401`, the token is cleared and the user is redirected to `/login`.

Demo credentials (from backend):

| Username | Password     | Role  |
|----------|--------------|-------|
| `user`   | `User@123!`  | User  |
| `admin`  | `Admin@123!` | Admin |

---

## Pages & Role Requirements

| Route      | Description                                      | Required Role  |
|------------|--------------------------------------------------|----------------|
| `/login`   | Obtain a JWT token                               | Public         |
| `/convert` | Convert an amount between two currencies         | User, Admin    |
| `/rates`   | View latest exchange rates for a base currency   | User, Admin    |
| `/history` | View paginated historical rates for a date range | **Admin only** |

> Accessing `/history` with a `User` token returns HTTP 403 from the API.

---

## Restricted Currencies

The following currencies are blocked by the backend and are excluded from all currency dropdowns in the UI:

`TRY`, `PLN`, `THB`, `MXN`

---

## Running Tests

```bash
# Watch mode
npm run test

# Single run (CI)
npm run test -- --run

# With coverage report
npm run test:coverage
```

---

## Environment Variables

| Variable             | Default    | Description           |
|----------------------|------------|-----------------------|
| `VITE_API_BASE_URL`  | `/api/v1`  | Backend API base URL  |

---

## CI/CD

Example steps for a GitHub Actions pipeline:

```yaml
- name: Install dependencies
  run: npm ci

- name: Lint
  run: npm run lint

- name: Test
  run: npm run test -- --run

- name: Build
  run: npm run build
```

---

## AI Usage

### Where AI Helped
1. Initial project scaffolding (Vite + React + TypeScript + Tailwind setup)
2. Generating boilerplate page components (`ConvertPage`, `RatesPage`, `HistoryPage`, `LoginPage`)
3. Writing unit/component test templates using Vitest + Testing Library
4. Suggesting `apiClient.ts` structure with centralized JWT injection and 401 handling
5. Implementing error surfacing (extracting FluentValidation messages from API error responses)

### What Was Validated Manually
1. Correct JWT flow — token storage, attachment to requests, redirect on expiry
2. Role-based route protection via `ProtectedRoute` component
3. UI/UX decisions — layout, form behaviour, pagination controls
4. Restricted currency filtering logic aligned with backend constants
5. Date validation logic (end date ≥ start date) on both frontend and backend

### What Was NOT Accepted Blindly
1. Replaced hardcoded `BASE_OPTIONS` / `CURRENCIES` arrays with dynamic loading via `getSupportedCurrencies()` — AI initially suggested static lists
2. Added proper error extraction from backend `{ errors: [{field, message}] }` shape instead of generic catch messages
3. Added same-currency validation on conversion (`from !== to`) not present in initial scaffold
4. Ensured fallback lists are used only when the API is unavailable, not as primary data source
