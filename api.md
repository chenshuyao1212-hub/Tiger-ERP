
# API Development Documentation

## 1. CaiGou Payment API (菜狗支付)

**Version:** V1.0
**Base URL (Test):** `https://test.caigoumail.com`
**Base URL (Prod):** `https://caigoumail.com`
**Authentication:** Add `Authorization: Bearer <token>` to request headers.
**Unauthorized Response:** `{"code":401, "data":null, "message":"请求未授权!"}`

*(Detailed endpoints for Get Token, Create Order, Balance, Status, Callback remain unchanged from previous version)*

---

## 2. Sellfox API (赛狐 ERP)

**Base URL:** `https://openapi.sellfox.com`
**Content-Type:** `application/json`

### 2.1 Authentication & Common
- **Token**: `/api/oauth/v2/token.json`
- **Sign**: HMAC-SHA256 signature required for all requests.

### 2.2 User Management (账号管理)
- **POST /api/account/getSubUserPage.json**: Get Sub-User List (获取子账号列表)
  - **Params**: 
    - `pageNo` (string, required)
    - `pageSize` (string, required)
  - **Response (`UserListOpenVo`)**:
    - `id`: User ID
    - `nickname`: Nickname
    - `account`: Account Name
    - `mobile`: Phone Number

### 2.3 Shops (店铺)
- **POST /api/shop/pageList.json**: Get Shop List (获取店铺列表)
  - **Description**: Retrieves a paginated list of authorized shops.
  - **Params**:
    - `pageNo` (string, required): Page number.
    - `pageSize` (string, required): Page size.
  - **Response (`ShopAuthOpenListVo`)**:
    - `id`: Shop ID.
    - `name`: Shop Name.
    - `sellerId`: Amazon Seller ID.
    - `region`: Region code (na, eu, fe).
    - `marketplaceId`: Amazon Marketplace ID (e.g., ATVPDKIKX0DER).
    - `adStatus`: Advertising auth status (e.g., "已授权", "未授权").
    - `status`: Shop auth status (0: Default/Success, 1: Invalid, 2: SP Invalid).

### 2.4 Orders (订单)
- **POST /api/order/pageList.json**: Get Order List (订单列表)
  - **Description**: The main endpoint for retrieving order data. Supports various filtering options including date ranges, status, and search terms.
  - **Params (`OrderSearchOpenQo`)**: 
    - `pageNo`: string (Page number)
    - `pageSize`: string (Items per page)
    - `dateType`: string (Filter date type: `updateDateTime` (update), `createDateTime` (create), `purchase` (order time))
    - `dateStart`: string (Start date, yyyy-MM-dd hh:mm:ss)
    - `dateEnd`: string (End date, yyyy-MM-dd hh:mm:ss)
    - `shopIdList`: array of strings (Shop IDs)
    - `orderStatus`: string (Comma-separated status list: Pending, Shipped, Canceled, etc.)
    - `searchType`: string ('amazonOrderId' | 'buyerEmail')
    - `searchContent`: string (Search term)
    - `searchMode`: string ('exact' | 'blur', default 'blur')
    - `unlimitedTime`: string ('true' | 'false', default 'false') - **Note**: If searching by ID without time, you MUST pass `searchMode:'exact'` and `unlimitedTime:'true'`.
  - **Response (`Page<OrderPageOpenVo>`)**: 
    - `code`: 0 (Success)
    - `data`:
        - `pageNo`: int
        - `pageSize`: int
        - `totalPage`: int
        - `totalSize`: int (**Use this for total count**)
        - `rows`: Array of `OrderPageOpenVo`
            - `amazonOrderId`: ID
            - `orderTotalAmount`: Sales amount
            - `orderStatus`: Status
            - `orderItemVoList`: Items
            - `purchaseDate`: Order time

### 2.5 Reports (报告)
- **POST /api/report/create**: Create Report (创建赛狐报告)
  - **Description**: Trigger generation of sales reports.
  - **Params**:
    - `reportType`: 'PRODUCT_SALE_REPORT'
    - `startDate`: 'yyyy-MM-dd' (Max 90 days range)
    - `endDate`: 'yyyy-MM-dd'

---

## 3. Internal Backend API (Node.js Proxy & DB)

These APIs are hosted on the local Node.js server (`/api/...`) and handle database persistence or proxying to external services.

### 3.1 Settings & Configuration
*   **GET /api/settings/columns/:page**: Retrieve custom column configurations for a specific page (e.g., `platform_order`).
*   **POST /api/settings/columns/:page**: Save custom column configurations.
    *   Body: `{ settings: ColumnDef[] }`

### 3.2 Facebook & Virtual Chat
*   **GET /api/facebook/accounts**: List connected Facebook pages.
*   **POST /api/facebook/accounts**: Connect a new Facebook page.
*   **DELETE /api/facebook/accounts/:pageId**: Disconnect a page.
*   **GET /api/virtual/customers**: List virtual customers (for demo/testing).
*   **GET /api/virtual/messages**: Get chat history for a customer.
*   **POST /api/virtual/messages**: Send a message (stored in DB).

### 3.3 Sellfox Proxy Endpoints
The backend wraps Sellfox API calls to handle authentication (Token/Sign) securely.
*   **POST /api/order/pageList**: Proxies to `order/pageList.json`.
    *   **Logic**: Handles 'totalSize' mapping, sets default date range if missing, ensures `dateType='purchase'` for order lists. Handles exact search logic (`unlimitedTime`).
*   **POST /api/settings/shops/list**: Proxies to `shop/pageList.json`.
*   **GET /api/common/shops**: Helper to get a simplified list of shops for dropdowns.
*   **GET /api/users/salespersons**: Helper to get list of salespersons (proxies to `/api/account/getSubUserPage.json`).

### 3.4 CaiGou Proxy Endpoints
The backend wraps CaiGou API calls to handle token management securely.
*   **POST /api/payment/create**: Creates a payment order via CaiGou.
    *   **Body**: `{ account, amount, chargeType, currency, transNote, remark }`
    *   **Response**: `{ orderId, externalOrderId, ... }`
*   **GET /api/payment/balance**: Retrieves current account balance.
    *   **Response**: `{ balance: "USD 123.45" }`

### 3.5 RealTime Data
*   **POST /api/realtime/data**: 
    *   **Description**: Returns real-time sales data aggregated by ASIN/MSKU. Currently returns mock data structure populated with random values for demonstration purposes, ensuring UI stability.
    *   **Body**: `{ sites: [], shops: [], salespersons: [] }`
    *   **Response**: `{ success: true, rows: [...], summary: {...} }`

### 3.6 Common Dictionaries (New)
*   **GET /api/common/sites**: Returns hierarchical list of regions and sites (US, UK, DE, etc.).
*   **GET /api/common/statuses**: Returns list of order statuses (Pending, Shipped, etc.).
*   **GET /api/common/delivery-methods**: Returns delivery methods (FBA, FBM).

### 3.7 Dashboard Data (Mock)
*   **GET /api/dashboard/overview**: Returns KPI cards and sales chart data.
*   **GET /api/dashboard/ranking**: Returns top product ranking list.
*   **GET /api/dashboard/tasks**: Returns pending tasks and announcements.

---

## 4. Data Dictionaries (数据字典)

### 4.1 Marketplace IDs
| Site Code | Site Name | MarketplaceId |
| :--- | :--- | :--- |
| US | 美国 | ATVPDKIKX0DER |
| CA | 加拿大 | A2EUQ1WTGCTBG2 |
| MX | 墨西哥 | A1AM78C64UM0Y8 |
| GB | 英国 | A1F83G8C2ARO7P |
| DE | 德国 | A1PA6795UKMFR9 |
| FR | 法国 | A13V1IB3VIYZZH |
| IT | 意大利 | APJ6JRA9NG5V4 |
| ES | 西班牙 | A1RKKUPIHCS9HS |
| JP | 日本 | A1VC38T7YXB528 |
| AU | 澳大利亚 | A39IBJ37TRP1C6 |
| NL | 荷兰 | A1805IZSGTT6HS |
| SE | 瑞典 | A2NODRKZP88ZB9 |
| PL | 波兰 | A1C3SOZRARQ6R3 |
| TR | 土耳其 | A33AVAJ2CFY430 |
| IN | 印度 | A21TJRUUN4KGV |
| AE | 阿联酋 | A2VIGQ35RCS4UG |
| SA | 沙特 | A17E79C6D8DWNP |
| SG | 新加坡 | A19VAU5U5O7RUS |
