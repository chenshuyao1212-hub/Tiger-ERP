
# Tiger ERP 系统架构设计文档 (System Architecture Design)

**文档版本**: 1.0  
**最后更新**: 2026-01-19  
**基于版本**: H20260119V26 / Q20260119V17

---

## 1. 架构概览 (High-Level Architecture)

Tiger ERP 采用 **"本地优先 (Local-First) + 混合云同步"** 的架构模式。与传统 SaaS（前端直接请求云端 API）不同，本系统在用户侧部署了完整的 Node.js 服务端和 MySQL 数据库。

### 1.1 核心设计图
```mermaid
graph TD
    User[用户浏览器 (Chrome)] <-->|HTTP/WebSocket| LocalNode[本地 Node.js 服务器 (Express)]
    
    subgraph "Local Environment (用户本地/私有云)"
        LocalNode <-->|SQL Read/Write| LocalDB[(本地 MySQL 数据库)]
        LocalNode -- 静态资源编译 --> FrontendFiles[React/Vite 源码]
    end
    
    subgraph "External Cloud (外部云端)"
        LocalNode -- 爬虫/API同步 --> Sellfox[赛狐 ERP Open API]
        LocalNode -- 支付指令 --> CaiGou[菜狗支付 API]
        LocalNode -- 消息交互 --> FB[Facebook Graph API]
    end
```

### 1.2 设计原则
1.  **读写分离 (逻辑层)**：前端的所有**查询 (Read)** 操作（列表、报表、详情）100% 走本地数据库，确保 `< 50ms` 的响应速度。
2.  **异步写入 (Write)**：前端的**修改**操作（如备注、支付）先写入本地库，再异步推送到远程；或者先调用远程 API，成功后回写本地库。
3.  **最终一致性**：不追求实时强一致，通过后台的“智能水位线”机制保证数据在 T+N 分钟内最终一致。

---

## 2. 技术栈详细说明 (Tech Stack)

| 层级 | 技术选型 | 关键库/工具 | 选型理由 |
| :--- | :--- | :--- | :--- |
| **前端** | React 18 | Vite, Tailwind CSS, Lucide React | 高性能渲染，组件化开发，Tailwind 极速构建 UI。 |
| **图表** | Recharts | `recharts` | 声明式图表库，适合 React 生态，用于销量趋势图。 |
| **后端** | Node.js | Express, `mysql2/promise` | I/O 密集型任务（高并发 API 请求）处理能力强，JS 全栈统一语言。 |
| **构建** | Esbuild | `esbuild` | 在 `server.js` 中集成，实现后端运行时实时编译前端 TSX，简化部署。 |
| **数据库** | MySQL 8.0 | JSON Type Support | 强一致性关系型数据库，利用 JSON 字段存储复杂的订单 Raw Data。 |
| **进程管理** | PM2 | `ecosystem.config.js` | 生产环境进程守护、日志合并、内存监控。 |

---

## 3. 核心子系统设计

### 3.1 订单同步子系统 (The Sync Engine)
这是系统的核心心脏，位于 `controllers/orders.js`。

#### 3.1.1 智能水位线 (Smart Watermark Strategy)
为了解决跨时区（如美国 PST vs 日本 JST）导致的漏单问题，系统不依赖单一的“上次同步时间”。
*   **逻辑**：
    1.  查询数据库，按店铺分组获取 `MAX(purchase_date)`。
    2.  识别“活跃店铺”（近 3 天有单）。
    3.  取所有活跃店铺中时间**最早**的那个时间点作为 `Anchor Time`。
    4.  `SyncStartTime = AnchorTime - 2 Hours` (安全缓冲)。
*   **优势**：即使某个店铺数据卡住，系统也会自动回溯去拉取，实现自愈。

#### 3.1.2 视口优先热更新 (Viewport Priority Sync)
*   **场景**：用户在前端打开“订单列表”页，想看当前页面这 20 个订单的最新状态（如是否发货）。
*   **流程**：
    1.  前端渲染时收集当前页面的 `Order IDs`。
    2.  调用 `POST /api/orders/sync-batch`。
    3.  后端绕过常规爬虫队列，强制以 `searchMode: exact` 调用上游 API。
    4.  前端收到响应后静默刷新表格。

#### 3.1.3 防死循环与流控
*   **流控**：`lastSellfoxCallTime` 全局变量控制 API 调用间隔不低于 1.1 秒，防止触发 HTTP 429。
*   **熔断**：在分页抓取时，如果检测到不同页码返回的 `FirstOrderId` 相同，判定为游标卡死，自动终止任务。

### 3.2 数据库设计 (Database Schema)

#### 核心表结构：`orders`
采用了**复合主键**策略以支持拆单（Split Orders）。

```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amazon_order_id VARCHAR(50), -- 亚马逊订单号
    store_name VARCHAR(100),     -- 店铺名（关键区分字段）
    status VARCHAR(50),
    amount DECIMAL(10, 2),
    raw_data JSON,               -- 存储原始 API 响应，用于容错
    payment_time DATETIME,       -- 关键财务时间
    -- 索引优化
    UNIQUE KEY idx_unique_order (amazon_order_id, store_name), 
    INDEX idx_date (purchase_date)
);
```

#### 关联表：`order_items`
*   存储 SKU、ASIN、价格、促销 ID。
*   通过 `amazon_order_id` + `store_name` 关联主表。

### 3.3 营销与 CRM 架构
*   **虚拟化层**：通过 `virtual_customers` 表抽象客户概念。
*   **智能解析**：前端输入 Facebook Access Token，后端自动递归调用 Graph API (`/me/accounts`) 识别是 User Token 还是 Page Token，并自动获取长期令牌。
*   **订单匹配**：正则引擎扫描聊天记录 (`\d{3}-\d{7}-\d{7}`)，自动关联本地 `orders` 表数据，在聊天窗口右侧展示订单详情。

---

## 4. 接口与交互设计 (API Interaction)

### 4.1 内部 API (Proxy Pattern)
前端不直接调用赛狐或 Facebook API，而是请求 Node.js 层。
*   **请求**：`GET /api/order/pageList`
*   **Node.js 层**：
    1.  从 `.env` 读取 `CLIENT_SECRET`。
    2.  生成 HMAC-SHA256 签名。
    3.  附加 `access_token` (从内存缓存 `tokenCache` 中读取，过期自动刷新)。
    4.  转发请求至 `openapi.sellfox.com`。
*   **优势**：前端代码不暴露任何密钥，安全性极高。

### 4.2 实时数据聚合 (Real-Time Aggregation)
`controllers/realtime.js` 负责复杂的报表计算。
*   前端只传维度（如 `ASIN`）和筛选条件。
*   后端根据 `MARKETPLACE_OFFSETS` 字典，动态计算各站点当前的“今天”、“昨天”时间窗口（转为 UTC）。
*   执行复杂的 SQL `GROUP BY` 和 `SUM(CASE WHEN...)` 聚合查询，一次性返回多维度对比数据。

---

## 5. 部署与运维 (Deployment)

### 5.1 启动流程
1.  **DB Check**: `initDB()` 检查表结构，自动执行 Schema Migration（如添加 `payment_time` 字段）。
2.  **API Check**: 尝试连接 Sellfox 和 CaiGou 获取 Token，失败输出警告但不退出。
3.  **Auto Repair**: 启动 5秒后，异步触发一次全量数据修补任务（后台运行）。

### 5.2 环境隔离
*   **开发环境**：`npm run dev` (Node + Vite Server)。
*   **生产环境**：`npm start` (Node Server + Esbuild middleware)。
*   **配置管理**：优先读取 `.env.local`，其次读取 `.env`，严格遵循 12-Factor App 原则。

---

## 6. 安全设计 (Security Architecture)

1.  **凭证隔离**：代码库中已移除所有硬编码密码（`password: process.env.DB_PASSWORD`）。
2.  **签名验证**：所有外部 API 调用均在服务端完成签名，前端无感知。
3.  **SQL 注入防御**：全面使用 `mysql2` 的参数化查询（`?` 占位符），禁止字符串拼接 SQL。
4.  **UI 脱敏**：前端展示层对 Access Token 等敏感字段进行掩码处理或直接不返回给前端。
