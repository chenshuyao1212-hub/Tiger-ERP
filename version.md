
# Version History

## Frontend Versions
- **Q20260119V1**: Initial implementation of RealTime page and components.
- **Q20260119V2**: Fixed `toggleAll` and `handleColumnResizeEnd` errors in RealTime page.
- **Q20260119V3**: Updated PlatformOrder page to use Local DB API and removed client-side filtering logic as backend now handles date shifting.
- **Q20260119V4**: Updated PlatformOrder to use physical time date logic (local time) and implemented hot-sync (2hr) on reset/init for data freshness.
- **Q20260119V5**: Updated PlatformOrder to display multiple products per order card. Refactored `renderCellContent` to iterate over `items` array, aligning product details, SKUs, and quantities vertically with dashed separators.
- **Q20260119V6**: Updated PlatformOrder page. 
    - Removed "Sync Order" button. 
    - Implemented `LocalStorage` persistence for all filters and date ranges. 
    - Upgraded `fetchOrders` with a "Context-Aware Sync" strategy: "Auto" (Hot Sync 24h) on init/reset, and "Manual" (Range-based Smart Sync) on refresh click or F5 restore.
    - Added loading spinner to the refresh toolbar icon.
- **Q20260119V7**: Optimized PlatformOrder page performance.
    - Implemented "Render First, Sync Later" strategy: Pages now load DB data instantly (`fetchDbOrders`) while triggering background synchronization (`syncOrders`).
    - Decoupled `isLoading` (table blocker) from `isSyncing` (toolbar spinner) to allow viewing stale data during updates.
    - F5/Mount now triggers instant DB load + auto background sync.
    - Manual Refresh now triggers background sync + silent DB reload without clearing table.
- **Q20260119V8**: Fixed regression in PlatformOrder page.
    - Restored the V6 multi-item list rendering logic (vertical layout with dashed separators) that was accidentally reverted in V7.
    - Restored the full-featured Date Picker (day/week/month/quarter/year modes) from V6.
    - Kept the "Render First, Sync Later" performance optimizations from V7.
- **Q20260119V9**: Updated `PlatformOrder` column rendering.
    - `promoCode` column now supports multi-item display, showing promotion IDs vertically aligned with other item details.
    - `paymentTime` column now correctly reflects the `payment_time` field from the backend (sourced from API's `paymentsDate`), fixing the discrepancy where `last_update_date` was shown.
- **Q20260119V10**: (Compatible with H20260119V19) No frontend code changes, but benefits from backend logic updates.
- **Q20260119V11**: Implemented "Viewport Priority Update" (Hot Sync) in `PlatformOrder`.
    - Updated `syncOrders` to accept an array of visible Order IDs.
    - When clicking Refresh, the app now performs a two-phase sync:
      1. **Hot Phase**: Immediately syncs the status of the *currently visible* orders via `/api/orders/sync-batch` and silently reloads the table. This provides instant feedback on order status changes.
      2. **Background Phase**: Proceeds with the standard full-range background sync to ensure data consistency for other pages/dates.
- **Q20260119V12**: Fixed "Timezone Gap" issue in `PlatformOrder`.
    - Modified date calculation logic to use `America/Los_Angeles` timezone (Amazon Business Time) as the anchor instead of local system time.
    - Introduced `getLADate` helper using `Intl.DateTimeFormat`.
    - "Yesterday" filter now correctly targets the previous business day in Los Angeles time (e.g., at 10:00 AM Beijing time, "Yesterday" correctly maps to the just-finished day in PST/PDT), resolving the issue where recent orders appeared missing due to local/server time offsets.
- **Q20260119V13**: **Reverted Date Logic to Physical Time**.
    - Replaced `getLADate` with `getLocalDate` in `PlatformOrder`.
    - "Today" and "Yesterday" now refer strictly to the user's local browser time (e.g., Beijing Time).
    - This allows multi-region visibility (e.g., Japan data shows up on "Today" even if US is still "Yesterday"), aligning with user intuition for a global dashboard.
- **Q20260119V14**: **Fixed "Closure Trap" bug in `PlatformOrder` Reset logic**.
    - **Issue**: Clicking Reset was triggering `fetchDbOrders` immediately inside the handler, capturing stale state (old dates) due to closure scope, resulting in incorrect total counts until the next interaction.
    - **Fix**: Removed manual `fetchDbOrders` call from `handleReset`. Now relies entirely on the `useEffect` dependency on `resetKey`, ensuring data fetch occurs only after state updates have been applied and rendered.
- **Q20260119V15**: **Fixed Filter Connectivity Issues**.
    - **Feature**: `ShopFilterDropdown` now supports returning store names instead of IDs via `returnField="name"` prop.
    - **Fix**: Updated `PlatformOrder` and `RealTime` pages to send `store_name` for shop filtering, aligning with backend DB schema.
    - **Enhancement**: Added `sites` (marketplace) and `deliveryMethod` (FBA/FBM) filtering to `fetchDbOrders` payload in `PlatformOrder`.
- **Q20260119V16**: **Implicit Logic Update**.
    - Frontend remains unchanged, but now benefits from "VIP Fast Track" backend logic. Users searching for specific order IDs will see results faster due to backend unblocking and direct API fallback.
- **Q20260119V17**: **Fixed Race Condition in PlatformOrder Filter**.
    - **Problem**: When user rapidly changes filters (e.g., toggling "Unlimited Time") while a previous slow query is pending, the old result could overwrite the new one or cause queueing delays.
    - **Solution**: Implemented `AbortController` in `fetchDbOrders`. Now, initiating a new search immediately cancels any pending DB fetch requests, ensuring the UI always reflects the latest user action without delay.
    - **UX**: "Unlimited Time" checkbox defaults to unchecked (false) to preserve performance.

## Backend Versions
- **H20260119V1**: Initial implementation of RealTime controller and API endpoints.
- **H20260119V2**: Updated `/api/orders/db/list` endpoint to implement regional date shifting logic (Americas vs. Rest of World).
- **H20260119V3**: Reverted regional date shifting in `/api/orders/db/list` to support simple physical date range queries.
- **H20260119V4**: (Implicit) Stability fixes.
- **H20260119V5**: Optimized crawler with page size 200, auto-downgrade on 40014 error, and added detailed stats logging.
- **H20260119V6**: Implemented global smart throttling (1.1s interval) for Sellfox API to prevent 429 errors and optimize crawler speed.
- **H20260119V7**: Fixed infinite loop in order sync by using numeric pagination params and adding "Dead Loop Protection" (duplicate page detection).
- **H20260119V8**: Added "Smart Reconciliation" module to automatically detect and fix data gaps by drilling down from month to day level.
- **H20260119V9**: Updated Database Schema to support "Split Orders" (same Order ID, different Shops). 
    - Migrated `orders` table unique index from `amazon_order_id` to `(amazon_order_id, store_name)`.
    - Added `store_name` to `order_items` table to correctly scope items to the specific split shipment.
    - Updated `saveOrderToDb` logic to handle scoped deletions and insertions.
- **H20260119V10**: Updated `/api/orders/db/list` endpoint to use `JSON_ARRAYAGG` instead of `LIMIT 1`. Now returns all items associated with an order (scoped by store_name) to support frontend multi-item display.
- **H20260119V11**: Enhanced `reconcileYearlyData` to print a detailed "Yearly Audit Report" in server logs. It now gathers stats for all months first, prints a formatted ASCII table comparing API vs DB counts, and then triggers deep repair mode for months with missing data.
- **H20260119V12**: Refactored `server.js` to be lightweight by removing the "Auditor" (`reconcileYearlyData`) and "Ant Mover" (`startHistoryCrawler`) logic. These have been moved to standalone scripts (`scripts/audit.js` and `scripts/crawler.js`) for on-demand execution via command line.
- **H20260119V13**: Removed `scripts/crawler.js`. The functionality is fully superseded by `scripts/audit.js` which provides smarter, gap-detection-based history backfilling.
- **H20260119V14**: Decoupled Order management logic into `controllers/orders.js`.
    - Moved `saveOrderToDb`, `runOrderSync`, `fetchAndSyncSingleOrder` to the new controller.
    - `server.js` now imports `ordersController` and routes requests (`/api/orders/*`) to it.
    - `server.js` uses dependency injection to pass the DB `pool` and `callSellfoxApi` function to the controller, maintaining a clean separation of concerns.
- **H20260119V15**: Fixed critical data mapping issues.
    - `server.js`: Added migration to add `payment_time` column to `orders` table.
    - `controllers/orders.js`: Updated `saveOrderToDb` to map API's `paymentsDate` to `payment_time`. Updated `getOrderList` to return `payment_time` correctly and ensure `items` JSON includes `promotion_ids`.
- **H20260119V16**: Implemented "Local-First + Smart Incremental Hot Sync" architecture.
    - **Startup Auto-Repair**: Server now checks for data gaps >15min on startup and auto-patches them.
    - **Smart Clipping**: `runOrderSync` now intelligently clips the requested API range if local data is already up-to-date (based on `last_order_sync_time` anchor), drastically reducing API calls and improving frontend response speed.
    - **Heartbeat Logging**: Added specific log format `数据库数据已更新至 YYYY/MM/DD HH:mm:ss` upon successful sync to serve as a clear operational indicator.
- **H20260119V17**: Fixed Critical Startup Crash & Optimization.
    - **Fix**: Removed incorrect `JSON.parse` calls in `controllers/orders.js`. The `mysql2` driver automatically parses JSON columns, so manual parsing was causing `SyntaxError: Unexpected non-whitespace character` on date strings.
    - **Optimization**: Added `try-catch` block around the startup `autoRepairDataGap` call in `server.js` to ensure the server starts successfully even if the initial sync encounters a non-fatal error.
- **H20260119V18**: Fixed Anchor "Fake Complete" Bug.
    - **Issue**: Previously, `last_order_sync_time` was set to the *end* of the requested sync range (e.g., 23:59:59) even if the current physical time was earlier (e.g., 11:00 AM). This caused the system to falsely believe it had future data, preventing new order syncs for the rest of the day.
    - **Fix**: Updated `runOrderSync` to cap the anchor time at `Math.min(requestEnd, now)`. The anchor now correctly reflects real-time data freshness.
- **H20260119V19**: **Critical Logic Overhaul: DB-Centric Anchoring**.
    - **Change**: Abandoned reliance on `last_order_sync_time` stored in `user_settings` (Process Anchor).
    - **New Logic**: `runOrderSync` now queries `SELECT MAX(purchase_date) FROM orders` (Data Anchor) at the start of every auto-sync.
    - **Mechanism**: The sync start time is now calculated as `MAX(purchase_date) - 24 hours` (Safety Buffer). This "sliding window with overlap" approach guarantees that any delayed orders or API latency issues are automatically self-healed in subsequent runs without manual intervention.
    - **Benefit**: Eliminates "missing orders" caused by API latency or task failures, as the system always resumes from the last known *data point*, regardless of when the task last ran.
- **H20260119V20**: **New Endpoint: Batch Order Sync**.
    - **Feature**: Added `POST /api/orders/sync-batch` endpoint mapped to `controllers/orders.js:syncOrderBatch`.
    - **Logic**: Accepts a list of `orderIds`, sends them to Sellfox API using strict ID search mode (`unlimitedTime: 'true'`, `searchMode: 'exact'`), and updates only those specific orders in the database.
    - **Purpose**: Enables the frontend "Viewport Priority Update" strategy, allowing users to see instant status updates for the orders currently on screen without waiting for the full date-range sync to complete.
- **H20260119V21**: **Enhanced Sync Observability**.
    - **Feature**: Updated `controllers/orders.js` with a comprehensive logging system for the auto-sync process.
    - **Details**:
        1. **Heartbeat**: Every sync cycle now logs `⏰ [Time] Task Triggered` to confirm the scheduler is active.
        2. **Watermark**: Logs the exact `MAX(purchase_date)` from the DB and the calculated "Lag" (in minutes/hours) relative to the current time before starting the sync. This provides immediate visibility into data freshness.
        3. **Explicit Outcome**: Logs "No new orders" explicitly if 0 updates occurred, distinguishing between a failed sync and a successful-but-empty sync.
- **H20260119V22**: **Smart Watermark Strategy (Zombie Store Filter)**.
    - **Problem**: Global `MAX(purchase_date)` caused data loss for "slower" timezones (e.g., US) when "faster" timezones (e.g., Japan) had newer orders.
    - **Solution**: Implemented "Active Store Min-Anchor" logic in `runOrderSync`.
    - **Logic**:
        1. Queries `MAX(purchase_date)` grouped by `store_name`.
        2. Filters for "Active Stores" (orders within last 3 days).
        3. Sets synchronization anchor to the **oldest** (minimum) date among active stores.
        4. Applies a 2-hour safety buffer.
    - **Fallback**: If no active stores (e.g., long holiday), defaults to scanning the last 24 hours to catch any store "resurrection".
- **H20260119V23**: **Result-Oriented Logging & Result Confirmation**.
    - **Feature**: Enhanced `runOrderSync` with "Result Confirmation" step.
    - **Change**: Added a final DB query `SELECT MAX(purchase_date)` at the end of the sync loop.
    - **Log Output**: Now prints "Cutoff Watermark" (the latest order time in DB) and "Data Freshness Lag" (Current Time - Cutoff Time) in the success log.
    - **Benefit**: Provides definitive proof that data is up-to-date, allowing instant detection of silent failures (e.g., sync succeeded but no new data came in for 20 hours).
- **H20260119V24**: **Filter Logic Fixes**.
    - **Feature**: Added backend support for Site (`marketplace_id`) and Delivery Method (`fulfillment_channel`) filtering in `getOrderList`.
    - **Feature**: Added `MARKETPLACE_CODE_MAP` to backend to translate site codes (e.g., 'US') to Marketplace IDs.
- **H20260119V25**: **Performance & Responsiveness Optimization**.
    - **Feature (Server)**: Server startup is now non-blocking. The initial data sync (`autoRepairDataGap`) runs asynchronously in the background after a 5-second delay, allowing the API to serve requests immediately.
    - **Feature (Sync)**: Added "Event Loop Throttling" to the background sync task. The sync process now sleeps for 500ms between page fetches, yielding CPU and DB connections to ensure frontend queries (like VIP searches) remain fast and responsive even during heavy syncs.
