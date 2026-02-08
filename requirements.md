
# Tiger ERP 系统需求规格说明书 (Ver 1.0)

**文档生成时间**: 2026-01-19  
**基于代码版本**: H20260119V26 / Q20260119V17

---

## 1. 项目概述

### 1.1 产品简介
**Tiger ERP** 是一款专为亚马逊（Amazon）跨境电商卖家打造的 SaaS 运营管理系统。系统采用了“本地数据库优先（Local-First）+ 智能增量同步”的混合架构设计，旨在解决传统 ERP 在跨国网络环境下数据加载慢、统计延迟高的问题。

### 1.2 核心价值
*   **极速体验**：所有列表和报表查询优先读取本地 MySQL 数据库，实现毫秒级响应。
*   **智能同步**：后台自动维护“数据水位线”，采用视口优先（Viewport Priority）策略，确保用户看到的订单状态是最新的。
*   **业财一体**：集成了订单管理、实时销量统计、CRM 客服以及第三方支付（菜狗支付）功能。

---

## 2. 系统架构

### 2.1 技术栈
*   **前端**：React 18, Vite, Tailwind CSS, Recharts, Lucide React。
*   **后端**：Node.js (Express), MySQL2 (Promise)。
*   **数据库**：MySQL 8.0+ (支持 JSON 字段)。
*   **外部集成**：
    *   **Sellfox (赛狐) Open API**：核心数据源（订单、商品、店铺）。
    *   **CaiGou (菜狗) Payment API**：支付与返款服务。
    *   **Facebook Graph API**：社交媒体消息互动。

### 2.2 数据同步策略 (核心竞争力)
后端控制器 (`controllers/orders.js`) 实现了复杂的同步逻辑以保证数据一致性：

1.  **智能水位线 (Smart Watermark)**：
    *   系统不依赖单一的全局更新时间。
    *   根据店铺活跃度（近3天是否有订单）分组计算 `MAX(purchase_date)`。
    *   同步锚点取活跃店铺中的**最小值**，防止因时区差异（如美国 vs 日本）导致的数据漏抓。
2.  **视口优先热更新 (Viewport Priority Sync)**：
    *   当用户在前端查看特定订单列表时，前端会收集当前页面的 Order IDs。
    *   调用 `/api/orders/sync-batch` 接口，后端强制通过 API 精确刷新这批订单的状态。
    *   **效果**：用户看到的永远是最新状态（如 Pending -> Shipped），而无需等待全量同步。
3.  **防死循环与流控**：
    *   全局 API 节流阀：限制对 Sellfox 接口的调用间隔不低于 1.1秒。
    *   死循环熔断：检测游标是否卡死，防止爬虫陷入无限循环。

---

## 3. 功能模块详解

### 3.1 订单管理 (Platform Order)
*   **多维度展示**：
    *   支持自定义列配置（显示/隐藏、冻结、排序），配置存储于 `user_settings` 表。
    *   支持多商品（Multi-SKU）订单的垂直堆叠展示。
*   **高级筛选与搜索**：
    *   **竞态处理**：使用 `AbortController` 自动取消过期的筛选请求，防止数据错乱。
    *   支持按 `订购时间`、`付款时间`、`退款时间` 筛选。
    *   支持批量搜索（订单号、ASIN、SKU），支持 Excel 复制粘贴输入。
*   **数据模型变更**：
    *   支持**拆单**场景：数据库唯一键调整为 `(amazon_order_id, store_name)`，允许同一订单号对应多条记录（不同发货仓库/店铺）。

### 3.2 实时销量看板 (RealTime Dashboard)
*   **多维度聚合**：
    *   支持按 **ASIN**、**父ASIN**、**MSKU**、**本地SKU** 四种维度聚合数据。
*   **时效对比**：
    *   **今日实时**：计算各站点当地时间的“今日”销量（后端根据 `MARKETPLACE_OFFSETS` 自动计算时区偏移）。
    *   **历史环比**：对比昨日、上周同日、去年同日的数据。
*   **库存集成**：
    *   集成 FBA 库存（可售、预留、在途）及 AWD 库存数据。
*   **可视化**：
    *   集成 Sparkline（微线图）展示近7天销量趋势。

### 3.3 营销与 CRM (Facebook & Payment)
*   **多渠道对话**：
    *   集成 Facebook Page 消息，支持发送文本和图片。
    *   支持“虚拟客户”模式，用于系统演示和测试。
*   **智能订单核对**：
    *   自动正则匹配聊天记录中的亚马逊订单号格式 (`000-0000000-0000000`)。
    *   调用本地数据库核对订单真实性、金额及状态，并自动打标（如“已下单”）。
*   **支付集成 (CaiGou)**：
    *   在聊天窗口直接发起返款/支付请求。
    *   自动计算手续费（费率 4.5%）。
    *   **凭证生成**：前端使用 Canvas 动态生成专业的支付回执图片（Receipt Image），包含交易流水号。

### 3.4 设置与基础数据
*   **店铺授权**：
    *   管理 Amazon 店铺授权及广告授权状态。
    *   按区域（北美、欧洲、远东）分组展示。
*   **Facebook 授权**：
    *   支持 Access Token 智能解析（自动识别 User Token 或 Page Token）。

---

## 4. 数据库设计 (Schema)

基于 `server.js` 的迁移逻辑，核心表结构如下：

| 表名 | 描述 | 关键字段 | 备注 |
| :--- | :--- | :--- | :--- |
| **`orders`** | 订单主表 | `amazon_order_id`, `store_name`, `status`, `purchase_date`, `payment_time`, `profit` | 复合主键：`id` + `store` |
| **`order_items`** | 订单商品表 | `amazon_order_id`, `sku`, `asin`, `quantity`, `price`, `promotion_ids` | 关联主表 |
| **`user_settings`** | 用户配置 | `setting_key`, `setting_value` (JSON) | 存储列配置等 |
| **`fb_accounts`** | FB账号 | `page_id`, `access_token`, `name` | 营销账号 |
| **`sync_logs`** | 同步日志 | `start_time`, `end_time`, `status`, `details` | 监控爬虫健康度 |

---

## 5. 非功能性需求

### 5.1 安全性 (Security)
*   **零硬编码**：严禁在代码中保留数据库密码或 API Secret。所有敏感信息必须通过 `process.env` 读取。
*   **API 代理**：前端通过 Node.js 中间层调用外部 API，隐藏签名算法（HMAC-SHA256）和密钥。
*   **环境隔离**：支持 `.env.local` 本地开发配置，且该文件被 `.gitignore` 忽略。

### 5.2 性能 (Performance)
*   **按需编译**：开发环境使用 `esbuild` 中间件实时编译 TSX 文件。
*   **后台异步启动**：服务器启动时，数据自愈（Auto Repair）任务在后台 5秒后延迟执行，不阻塞 HTTP 服务端口监听。

### 5.3 健壮性
*   **启动自检**：服务启动时自动检查关键环境变量，缺失时输出警告。
*   **PM2 托管**：生产环境使用 PM2 进行进程守护和日志管理。
