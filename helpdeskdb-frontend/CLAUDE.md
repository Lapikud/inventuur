# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `helpdeskdb-frontend/`:

```bash
# Install dependencies
npm install

# Run dev server (Turbopack)
npm run dev

# Run dev server over HTTPS (self-signed cert; for testing Secure-cookie behavior)
npm run dev:https

# Build for production
npm run build

# Lint
npm run lint
```

The dev server runs on `http://localhost:3000`. The backend API must be running on `http://localhost:5018`.

**Stop the dev server before `npm run build`** — it holds `.next/` open and the build fails with an unrelated-looking file error. There are no frontend tests; verification is `npm run lint` + `npm run build` + a manual smoke pass.

First-time setup — copy the example env file:

```bash
cp .env.local.example .env.local
```

### Docker

The frontend is containerized (`Dockerfile` + `.dockerignore` in this directory) and runs as the `frontend` service in `../HelpdeskDb/docker-compose.yml`. Notes:

- `next.config.ts` sets `output: "standalone"`; the runtime image copies `.next/standalone` + `.next/static` + `public` and runs `node server.js` as the non-root `node` user on port 3000.
- `rewrites()` is resolved during `next build`, so the backend URL is a **build arg** (`NEXT_PUBLIC_BACKEND_URL`, compose passes `FRONTEND_BACKEND_URL`, default `http://lapikudhelpdesk-db-backend:8080`) — not a runtime env var. Changing it requires an image rebuild.
- Deployment requires a TLS proxy in front (bundled Caddy overlay or an external proxy) — see the root `README.md`.

## Architecture

This is a **Next.js 15** frontend (App Router, React 19, Tailwind CSS 3) for the HelpdeskDb asset management system. All pages use `"use client"` — there are no server components. Data fetching and caching are owned by **TanStack Query v5** (`@tanstack/react-query`; the devtools package is a devDependency mounted in `providers.tsx` — v5 strips it from production bundles).

### Proxy and middleware

- `next.config.ts` `rewrites()` proxies `/api/:path*` to `${NEXT_PUBLIC_BACKEND_URL}/api/:path*` (set in `.env.local`; default `http://localhost:5018`), so all browser requests stay same-origin and CORS never fires in dev.
- **`src/middleware.ts`** (matcher `/api/:path*`) sets `x-forwarded-proto` to the browser's real scheme on every proxied API request — unless an upstream TLS-terminating proxy (Caddy, nginx) already set the header, in which case that value is preserved. The Next proxy doesn't add this header itself; the backend's `UseForwardedHeaders` reads it, so when running `npm run dev:https` (or deployed behind an HTTPS proxy) the backend sees HTTPS and marks the auth cookies `Secure`. Over plain HTTP it forwards `http` — a no-op.
- `next.config.ts` also sets `trailingSlash: true` + `skipTrailingSlashRedirect: true` and attaches a **security headers** block to every response: CSP (`'unsafe-inline'` for Next bootstrap scripts; dev additionally gets `'unsafe-eval'` and localhost websockets for Turbopack HMR), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS.

### Service layer

All API calls go through a class hierarchy in `src/services/`:

```
BaseService         — axios instance with withCredentials: true, auto token-refresh interceptor
  └── EntityService<TEntity, TAddEntity>  — generic CRUD: getAllAsync, getAsync, addAsync, updateAsync, deleteAsync
        └── SpecificService (e.g., AssetService, CategoryService, ...)
```

- `BaseService` uses the relative base URL `/api/v1/` — requests go through the Next.js proxy described above.
- The axios instance is created with `withCredentials: true` so the browser sends and receives the HttpOnly auth cookies (`hd_jwt`, `hd_rt`) on every request. The frontend never reads or writes those cookies directly.
- The axios response interceptor catches 401s, calls `POST /account/renewRefreshToken` (which rotates the cookies on the backend and returns the refreshed identity), updates `AccountContext` with that identity, and replays the original request. Concurrent 401s are coalesced into a **single shared refresh promise** (module-level in `BaseService.ts`); if the refresh itself fails, the interceptor clears the account info and hard-redirects to `/login` via `window.location.href`.
- **Services are module-level singletons** exported from `src/services/index.ts` (which also exports the `allServices` array). Pages import them directly (`import { categoryService } from "@/services"`). Do not instantiate services in components — the old per-page `useMemo(() => new XService(), [])` + render-body `injectSetAccountInfo` pattern is gone. `ServiceAuthBinder` (see "Authentication") wires `setAccountInfo` into every service once.
- `OverviewService` extends `BaseService` directly (not `EntityService`). Its endpoints live under `home/overview/*`: `home/overview` (returns `IAssetsOverviewViewModel` — `{ availableAssets, assetsReservedByUser }`), plus `createNewAsset`, `edit/{id}`, `remove/{id}`, `reserve/{id}`, `changeReservationTime/{id}`, `remove-reservation/{id}`, and `return/{id}` (mark a reserved asset returned).
- All service methods return `IResultObject<T>` (`{ data?, errors?, statusCode? }`) and never throw. `unwrap()` from `src/services/errors.ts` converts that into data-or-thrown-`ApiError` (carrying `statusCode` and `errors`) — React Query decides success/failure by promise rejection, so every queryFn/mutationFn wraps the service call in `unwrap`. Components don't check `result.errors` by hand anymore.

### Data fetching (React Query)

- **`src/app/providers.tsx`** — creates the `QueryClient` in a `useState` lazy initializer and mounts `QueryClientProvider` (+ `ReactQueryDevtools`) in `layout.tsx` wrapping the app. Defaults: `staleTime` 30s, `gcTime` 5min, `refetchOnWindowFocus: false`; queries never retry on 4xx `ApiError` (401 is owned by the axios refresh interceptor — retrying would fight it) and retry at most twice otherwise; mutations never retry.
- **`src/lib/queryKeys.ts`** — the central `qk` key factory. Never inline query keys. **Rule: any parameter that changes the response goes in the key** (`qk.assets(includeRemoved)`, `qk.overview(searchTerm)`). `qk.assetsRoot()` / `qk.assetReservationsRoot()` / `qk.overviewRoot()` are prefix keys for invalidation (they match every variant and per-id entry in one call); the reservations *list* key carries a `"list"` discriminator so invalidating the list doesn't prefix-match and refetch per-id entries.
- **`src/hooks/queries/entityQueries.ts`** — shared `useXxx()` list hooks, one per entity. Defining each query once is what makes the cache shared across pages — use these hooks, don't inline `useQuery` in pages. Every constant-key list hook is built by the local `makeListQuery({ queryKey, queryFn, staleTime? })` factory and takes a uniform optional `{ enabled? }`, so a caller can gate the fetch (e.g. only while a dialog is open) without a bespoke signature — add new list hooks that way. Reference data (categories, owners, rooms, cupboards, locations, roles, users) gets a 5-min `staleTime`; transactional data uses the 30s default. Per-id hooks (`useAsset`, `useAssetReservation`, `useCategoryAssetByAsset`, `useLocationAssetByAsset`, `useOwnerAssetByAsset`) take `id | null` and stay `enabled: !!id`. The `…ByAsset` hooks resolve `null` only when the asset genuinely has no mapping; a failed fetch throws and marks the query errored.
- **`src/hooks/queries/overviewQueries.ts`** — `useOverview(searchTerm)` with `placeholderData: keepPreviousData`, so the previous list stays on screen while a new search term loads (`isLoading` is true only for the very first fetch).

### Authentication

- The JWT and refresh token live in **HttpOnly cookies** (`hd_jwt`, `hd_rt`) set by the backend. The frontend never sees the token strings — it only knows whether the cookies are valid by asking the server.
- On app mount (`layout.tsx`), the frontend calls `GET /api/v1/account/me`, which validates the `hd_jwt` cookie server-side and returns the user identity (id, username, roles). That identity is used to hydrate `AccountContext`.
- `AccountContext` (`src/context/AccountContext.ts`) is the single source of truth for auth state in the UI (`id`, `name`, `roles`). It does not hold token strings.
- **`ServiceAuthBinder`** (`src/components/ServiceAuthBinder.tsx`) is rendered once in `layout.tsx`, *above* the hydration gate; a single effect wires `setAccountInfo` into every service in `allServices` — this is how the 401 interceptor pushes a refreshed identity back into React context. Child effects run before the parent's, so services are wired before layout's `/me` call fires.
- **`QueryCacheReset`** (`src/components/QueryCacheReset.tsx`) is rendered inside both `Providers` and `AccountContext.Provider`; it clears the whole query cache whenever `accountInfo.id` changes (login, logout, user switch, failed refresh), so one user never sees another's cached data. The logout handler in `Header.tsx` deliberately does **not** call `queryClient.clear()` — the timing rationale is in the component's comment; don't move the clear.
- **`usePermissions()`** (`src/hooks/usePermissions.ts`) is the only sanctioned way to check roles — it reads `AccountContext` and returns `{ accountInfo, userId, userName, isAdmin, isHelpdeskDbAdmin, canManage, canSeeReservationActions }`. Never inline `accountInfo?.roles?.includes(...)`; role name strings live in `src/lib/roles.ts` (`ROLES`).
- `canManage` (`admins` **or** `helpdesk_db_admins`) gates create/edit/delete actions, admin-only pages, and the Header admin dropdown — matching the backend's `[Authorize(Roles = "admins,helpdesk_db_admins")]` on write endpoints. `canSeeReservationActions` adds `members` and `pixels`, and gates the Actions columns on the reservations page and the overview `AssetList`.
- **`AuthGuard`** (`src/components/AuthGuard.tsx`) is mounted once inside `layout.tsx` and wraps every route, and owns **both** authentication and authorization. It treats `/login` as public, redirects unauthenticated users to `/login`, and shows a spinner while `accountInfo` is still hydrating. Its `ADMIN_ROUTES` array lists the first path segments that require `canManage`; a non-manager hitting one gets a spinner (never a flash of admin data) and a redirect to `/`. The match is on `pathname.split("/")[1]` — `trailingSlash` is on, so don't `startsWith` the raw pathname — and **case-insensitive**, because a case-insensitive filesystem serves `/CupboardsInRooms` and `/cupboardsInRooms` alike and both must gate. Individual pages must not check auth themselves — do not add per-page redirects or hydration guards.
- **Logout** (`Header.tsx` → `AccountService.logoutAsync`) calls `POST /api/v1/account/logout` so the backend deletes the refresh token from the DB and clears both cookies, then clears `AccountContext`. Do not try to clear cookies from the client — they are HttpOnly.

### Internationalization

- Uses `react-i18next` with `i18next-http-backend` (translations loaded from `/public/locales/{lang}/{namespace}.json`).
- Supported languages: `en`, `et`, `ru`. Language detected from `localStorage` key `i18nextLng`, then browser.
- i18n is initialized in **`i18n.ts` at the package root** (not under `src/`) and imported once in `layout.tsx`. Every namespace is listed up front in its `ns` array — **a new namespace must be added there** or it never loads.
- Each domain entity has its own namespace (e.g., `asset`, `category`, `room`). Common strings use the `common` namespace; form validation messages use `validationerrors`.
- Namespace names must match the locale filename **exactly, including case** (`reserve`, not `Reserve`). A wrong-case namespace still resolves on Windows/macOS and 404s on the case-sensitive filesystem in Docker.
- `nsSeparator` is left at its default, so any `t()` call can address another namespace inline as `"namespace:Key"` (used by the dialog configs and `assetFields.ts`).
- When adding translations, add the key to all three language files: `public/locales/en/`, `et/`, and `ru/`.

### Page structure

Pages follow the Next.js App Router convention under `src/app/`. **All entity CRUD happens through inline dialogs on the list page — there are no `/create`, `/edit/[id]`, `/delete/[id]`, or `/details/[id]` subroutes. Do not add new subroutes; add dialogs instead.**

- `/overview` — the primary user-facing page; asset list with inline dialogs for create/edit/remove/reserve/return
- `/login` — FreeIPA login form
- `/dbassets` — admin asset list (the "Assets" admin link)
- `/{entity}/` — list page with inline CRUD dialogs (see "Entity dialog system" below)

Implemented entity list pages: `dbassets`, `categories`, `categoryAssets`, `owners`, `ownerAssets`, `rooms`, `cupboards`, `cupboardsInRooms`, `locations`, `locationAssets`, `assetReservations`, `removedAssets`, `users`, `roles`, `refreshTokens`. Locations-in-cupboards have no page of their own — they are managed through the nested `CupboardLocationsDialog`, opened by the Details button on `cupboardsInRooms`. (The old `userAssets` pages and `UserAssetsService` were removed — do not re-add them.)

**Hydration** — `layout.tsx` holds the single hydration gate: it renders a spinner until the `/me` call settles, so pages never render before the identity is known. The old per-page `hydrated`/`setHydrated` guard is gone — do not add per-page hydration guards.

**Admin-only pages** are gated centrally by `AuthGuard`'s `ADMIN_ROUTES` (see "Authentication") — add the route segment there, not a redirect effect in the page. `removedAssets`, `owners` and `assetReservations` are deliberately absent: they stay viewable by every logged-in user.

**Client-side enrichment** — pages needing related names (e.g. `IAssetReservationWithNames`) run several shared query hooks and join the cached results in `useMemo`. No server-side join endpoints exist for enriched types; each list is cached under its own key, so lookup lists are shared with every other page that needs them.

**Reservation action display** (`assetReservations/page.tsx`): the whole Actions column renders only under `canSeeReservationActions`. Per row, priority order — `isRemoved` → "Removed" label; else `reservationTo < now` → "Expired" label; else `userId === accountInfo.id` → Edit/Delete dialog buttons; else nothing. The Create button is `admins`/`helpdesk_db_admins` only.

**Overview page dialogs** are driven by `useDialogSelection` + the per-id query hooks: a dialog opens when its queries reach `isSuccess`, and re-clicking the same row is the retry gesture for an errored query (`refetchErrored`). `useDialogSelection<T>({ queryParamKey?, getId? })` (`src/hooks/useDialogSelection.ts`) returns `{ selected, select, clear }` and mirrors the selection into the URL. Those params (`editId`, `removeId`, `reserveId`, `changeReservationId`) are **write-only breadcrumbs** — nothing reads them back, so a refresh opens no dialog; don't add reads without designing the deep-link behavior. `anyDialogOpen` (which disables the barcode scanner) deliberately mirrors the dialogs' `open` props rather than the selection state: a selection whose data failed to load must not pin the scanner off. Overview mutations take the DTO alone and derive the endpoint id from it, and invalidate `qk.overviewRoot()` plus the related entity keys (asset mappings, reservations).

### Entity dialog system

All entity create/edit/delete flows use three generic dialogs driven by declarative per-entity configs. **Pages render the generic dialogs directly — there are no per-entity wrapper components; do not add any.**

- **`src/components/dialogs/common/entityDialogTypes.ts`** — the config types: `FormDialogConfig<TForm>` (`namespace`, optional `singularKey`/`titleKey`/`confirmLabelKey`/`destructive`, `fields`, `defaultValues`), the `FieldSpec` union (`text` — with optional `multiline` — | `number` | `select` | `display` | `readonly`), `ValidationSpec` (required/min/max/length — translated via the `validationerrors` namespace), `SelectOption`, `toOptions(items, label)` (use it instead of writing another `*ToOptions`), `DeleteSummaryField<TEntity>` (optional `half` pairs two fields onto one row), and `ConfirmResult`. Label keys resolve in the config's entity namespace by default; prefix with `ns:` (e.g. `common:Comment`) to target another namespace.
- **`src/components/dialogs/entityConfigs/*.ts`** — one file per entity (`category`, `owner`, `room`, `cupboard`, `cupboardInRoom`, `location`, `locationInCupboard`, `role`, `categoryAsset`, `locationAsset`, `ownerAsset`, `dbAsset`, `removedAsset`, `assetReservation`, `editAssetViewModel`), each exporting `xFormConfig`, `xToForm` (entity → form values, for edit), `xDeleteSummary`, and — for join entities whose update DTO carries more than `{ id, ...form }` — `xToUpdate`. **Rule: `toUpdate` lists its fields explicitly and never lets enriched `…WithNames` fields reach the wire.**
- **`EntityFormDialog.tsx`** — generic create/edit modal built on `react-hook-form`. Props: `open`, `mode` (`create`/`edit`), `config`, `initialValues`, `options` (select option lists keyed by each select field's `optionsKey`), `staticValues` (for `display`/`readonly` fields), `subtitle`, `onClose`, `onConfirm`, `isLoading`.
- **`EntityEditDialog.tsx`** — wraps `EntityFormDialog` for the edit case: takes `entity` + `toForm` (must be referentially stable — the module-level config exports always are) and an optional `toUpdate` override. This is what pages spread `crud.editDialogProps` into.
- **`EntityDeleteDialog.tsx`** — generic delete confirmation. Props: `open`, `entity`, `namespace`, optional `singularKey`/`titleKey`/`questionKey`/`confirmLabelKey`/`subtitle`, `summaryFields`, `onClose`, `onConfirm`, `isLoading`.
- `onConfirm` handlers return `ConfirmResult` (`Promise<{ error?: string } | void>`) — resolve `{ error }` to render it inside the dialog and keep the dialog open, or `void` on success. **A failed save must never close the dialog or `alert()`** — the user's input has to survive.
- **Still hand-rolled, deliberately:** the four date-range dialogs (`overviewDialogs/ReserveAssetDialog`, `ChangeReservationTimeDialog`, `assetReservationDialogs/Create|EditAssetReservationDialog`) — `DateTimePicker` isn't a `FieldSpec` kind, so they build a `Modal` body from the shared `useDateRangeForm` + `ReservationTimeFields` + `ModalFooter` instead. Everything else in `overviewDialogs/` and `locationInCupboardDialogs/` is a thin binding over the generic dialogs.

**Adding CRUD for a new entity:** write `entityConfigs/{entity}.ts`, then wire `useEntityCrud` + the three generic dialogs into the list page. No wrapper step.

**Typical list page anatomy** — `src/app/categories/page.tsx` is the reference (~95 lines) and every list page follows it:

- `"use client"`; singleton service import from `@/services`; `const { canManage } = usePermissions()` gates the Actions column and Create button.
- The shared list hook for data (`const { data = [], error } = useCategories()`), and **`useEntityCrud`** (`src/hooks/useEntityCrud.ts`) for everything else: `useEntityCrud<TEntity, TAdd, TUpdate?>({ service, invalidateKeys, decorateCreate? })` owns the three mutations (invalidating every key in `invalidateKeys` on success), the dialog selection state, and the ConfirmResult handlers. It returns `openCreate`/`openEdit(entity)`/`openDelete(entity)`, the `createDialogProps`/`editDialogProps`/`deleteDialogProps` bundles that match the generic dialogs' prop names, `invalidate`, and the raw mutations as escape hatches. `decorateCreate` is how the three `…Assets` pages inject `createdBy: userName`.
- For a page mutation outside that trio (e.g. `cupboardsInRooms`' extra create-cupboard dialog), wrap it with **`makeConfirmHandler(mutateAsync, onSuccess?)`** from the same file rather than hand-writing the try/catch.
- Render is `ListPageWrapper` → `ErrorBanner` → `DataTable` → `<EntityFormDialog mode="create" config={…} {...crud.createDialogProps} />`, `<EntityEditDialog config toForm {...crud.editDialogProps} />`, `<EntityDeleteDialog namespace singularKey summaryFields {...crud.deleteDialogProps} />`.
- Some pages invalidate more than one key — `removedAssets`: `[qk.removedAssets(), qk.assetsRoot()]`; `dbassets`: `[qk.assetsRoot()]`; entity edits that surface on the overview also invalidate `qk.overviewRoot()`.

### Layout pattern for list pages

All entity list pages use a shared three-component stack:

1. **`ListPageWrapper`** (`src/components/ListPageWrapper.tsx`) — full-bleed gray `#efefef` background, title, and optional `createButton` ReactNode slot; pass `<CreateButton onClick={crud.openCreate} />` (`src/components/CreateButton.tsx`, `variant: "solid" | "outline"`) rather than a hand-rolled orange pill.
2. **`DataTable`** (`src/components/DataTable.tsx`) — white outer card → gray inner area → dark `#424242` pill header row → scrollable white row cards. Pass `columns: string[]` and `rows: { id, cells: ReactNode[] }[]`. Use the `minWidth` prop to control the mobile horizontal-scroll breakpoint, and `emptyMessage` for the no-rows state (it defaults to the `common:NoRows` translation).
3. **`TableActions`** (`src/components/TableActions.tsx`) — owns every action button in the app. Exports `ActionCell` (flex wrapper), `EditButton`, `DeleteButton`, `DetailsButton`, `PrimaryButton` (the orange CTA), and `btnBase`. All variants take `label`, `onClick` (renders `<button>`) or `href` (renders `<Link>`), `disabled`, and `size` — `"md"` (default: fills its column) or `"sm"` (for buttons sitting inline in a row, e.g. `CupboardLocationsDialog`). Don't write a `<button className="text-sm font-medium py-2 px-4 …">` — add or reuse a variant here. For complex action states (Expired, Removed, conditional), put custom JSX directly inside `<ActionCell>`.

### Components

- `src/components/dialogs/common/` — `Modal.tsx` (base wrapper), `ModalFooter.tsx` (the shared Cancel/Confirm row; takes an already-translated `confirmLabel`), `ReservationTimeFields.tsx`, `EntityFormDialog.tsx`, `EntityEditDialog.tsx`, `EntityDeleteDialog.tsx`, `entityDialogTypes.ts`
- `src/components/dialogs/entityConfigs/` — see "Entity dialog system"
- `src/components/dialogs/overviewDialogs/` — the overview's dialogs (Create/Edit/Remove asset, Reserve/ChangeReservationTime/RemoveReservation); `assetReservationDialogs/` — the two date-range reservation dialogs; `locationInCupboardDialogs/CupboardLocationsDialog.tsx` — nested dialog for a cupboard's locations
- `src/components/ui/` — shadcn/ui-style primitives (Button, Calendar, Popover, ScrollArea, Select) built on Radix UI
- `src/components/assetFields.ts` — one renderer per asset field, exported as `assetLineFields` (the 10 overview table columns) and `assetCardFields`. It drives the `AssetList` header, `AssetLineDetails` and `AssetCardDetails` — add or change a column here, not in three places. The card list is intentionally shorter: the name is its heading and room+cupboard collapse into one "Location" row.
- `src/components/ErrorBanner.tsx` — `variant="page"` (the list-page LoadFailed banner; pass the raw query `error`) and `variant="dialog"` (the modal-level red box)
- `src/components/ServiceAuthBinder.tsx` and `QueryCacheReset.tsx` — auth/cache wiring rendered once in `layout.tsx` (see "Authentication")
- Other shared components: `AssetList.tsx`, `DataTable.tsx`, `ListPageWrapper.tsx`, `CreateButton.tsx`, `TableActions.tsx`, `DateTimePicker.tsx`, `LanguageSwitcher.tsx`, `LoadingSpinner.tsx`, `Header.tsx`, `Footer.tsx`
- Hooks: `usePermissions`, `useEntityCrud` (+ `makeConfirmHandler`), `useDialogSelection`, `useDateRangeForm`, `useBarcodeScanner`, and `src/hooks/queries/` (see "Data fetching")
- `src/lib/`: `queryKeys.ts` (`qk`), `roles.ts` (`ROLES`), `format.ts` (`formatDate` / `formatDateTime` — use these, don't inline `toLocaleDateString`), `utils.ts`; `getErrorMessage(e)` lives in `src/services/errors.ts` — use it instead of `(error as Error).message`

### Types

- `src/types/domain/DomainTypes.ts` — all domain interfaces (`IAsset`, `ICategory`, `IRoom`, etc., plus `Add` and `WithNames` variants)
- `src/types/domain/IAssetViewModels.ts` — overview view models (`IAssetViewModel`, `IAssetsOverviewViewModel`, and Create/Update/Remove variants)
- `src/types/IResultObject.ts` — generic API response wrapper
- `src/types/IDomainId.ts` — base `{ id }` interface; `src/types/IIdentityResponse.ts` — identity payload returned by login/me/renew
