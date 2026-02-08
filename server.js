
// ... (imports and setup remain same)
require('dotenv').config({ path: '.env.local' }); // Try to load .env.local for local dev convenience if .env is missing
require('dotenv').config(); // Standard .env load

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const esbuild = require('esbuild');
const fs = require('fs').promises;

// NEW: Import controllers
const realtimeController = require('./controllers/realtime');
const ordersController = require('./controllers/orders');

const app = express();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; 
const PUBLIC_IP = process.env.PUBLIC_IP || '47.119.161.66';

const SELLFOX_CONFIG = {
    clientId: process.env.SELLFOX_CLIENT_ID,
    clientSecret: process.env.SELLFOX_CLIENT_SECRET,
    baseUrl: 'https://openapi.sellfox.com'
};

// Security Check
if (!SELLFOX_CONFIG.clientId || !SELLFOX_CONFIG.clientSecret) {
    console.warn("⚠️  WARNING: Sellfox credentials missing in environment variables.");
}

const CAIGOU_CONFIG = {
    baseUrl: 'https://test.caigoumail.com', 
    username: process.env.CAIGOU_USERNAME || 'pp_test', 
    password: process.env.CAIGOU_PASSWORD, 
    notifyUrl: `http://${PUBLIC_IP}:${PORT}/api/payment/callback` 
};

// ... (MARKETPLACE_OFFSETS, tokenCache, fileCache remain same) ...
const MARKETPLACE_OFFSETS = {
    'ATVPDKIKX0DER': -7, // US (PST)
    'A2EUQ1WTGCTBG2': -7, // CA
    'A1AM78C64UM0Y8': -6, // MX
    'A2Q3Y263D00KWC': -3, // BR
    'A1F83G8C2ARO7P': 0,  // GB (GMT)
    'A1PA6795UKMFR9': 1,  // DE (CET)
    'A13V1IB3VIYZZH': 1,  // FR
    'APJ6JRA9NG5V4': 1,   // IT
    'A1RKKUPIHCS9HS': 1,  // ES
    'A1805IZSGTT6HS': 1,  // NL
    'A2NODRKZP88ZB9': 1,  // SE
    'A1C3SOZRARQ6R3': 1,  // PL
    'A33AVAJ2CFY430': 3,  // TR
    'A1VC38T7YXB528': 9,  // JP (JST)
    'A39IBJ37TRP1C6': 10, // AU (AEST)
    'A21TJRUUN4KGV': 5.5, // IN
    'A2VIGQ35RCS4UG': 4,  // AE
    'A17E79C6D8DWNP': 3,  // SA
    'A19VAU5U5O7RUS': 8,  // SG
};

const AMERICAS_MPS = ['ATVPDKIKX0DER', 'A2EUQ1WTGCTBG2', 'A1AM78C64UM0Y8', 'A2Q3Y263D00KWC'];

const tokenCache = {
    sellfox: { accessToken: null, expiresAt: 0 },
    caigou: { accessToken: null, expiresAt: 0 }
};

const fileCache = new Map();

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tiger_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000, 
    enableKeepAlive: true, 
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4' 
};

// Database Connection Security Check
if (!DB_CONFIG.password) {
    console.warn("⚠️  WARNING: Database password missing in environment variables.");
}

const pool = mysql.createPool(DB_CONFIG);

app.use(cors());
app.use(bodyParser.json());

// Request Logging Middleware
app.use((req, res, next) => {
    if (!req.path.endsWith('.css') && !req.path.endsWith('.png')) {
        console.log(`[REQ] ${req.method} ${req.path}`);
    }
    next();
});

// ... (initDB, on-demand compilation middleware remain same) ...
async function initDB() {
    try {
        const conn = await pool.getConnection();
        
        await conn.query(`
            CREATE TABLE IF NOT EXISTS user_settings (
                setting_key VARCHAR(100) PRIMARY KEY,
                setting_value JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // NOTE: amazon_order_id constraint will be modified by migration below
        await conn.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amazon_order_id VARCHAR(50) NOT NULL,
                seller_order_id VARCHAR(50),
                store_name VARCHAR(100),
                marketplace_id VARCHAR(50),
                status VARCHAR(50),
                purchase_date DATETIME,
                last_update_date DATETIME,
                amount DECIMAL(10, 2),
                currency VARCHAR(10),
                buyer_name VARCHAR(100),
                buyer_email VARCHAR(100),
                sales_channel VARCHAR(50),
                raw_data JSON,
                local_note TEXT, 
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_store (store_name),
                INDEX idx_status (status),
                INDEX idx_date (purchase_date),
                INDEX idx_update (last_update_date)
            )
        `);
        
        // --- MIGRATIONS FOR SCHEMA UPDATES ---
        
        // 1. Basic Columns
        const orderMigrations = [
            "ALTER TABLE orders ADD COLUMN local_note TEXT",
            "ALTER TABLE orders ADD COLUMN profit DECIMAL(10, 2)",
            "ALTER TABLE orders ADD COLUMN refund_time DATETIME",
            "ALTER TABLE orders ADD COLUMN fulfillment_channel VARCHAR(20)",
            "ALTER TABLE orders ADD COLUMN is_business BOOLEAN DEFAULT FALSE",
            "ALTER TABLE orders ADD COLUMN is_replacement BOOLEAN DEFAULT FALSE",
            "ALTER TABLE orders ADD COLUMN ship_by_date DATETIME",
            "ALTER TABLE orders ADD COLUMN payment_time DATETIME" // New migration for payment time
        ];
        for (const q of orderMigrations) { try { await conn.query(q); } catch (e) {} }

        // 2. Split Order Support (Critical Fix for "Missing Orders")
        try {
            // Drop old simple unique index if it exists
            await conn.query("DROP INDEX amazon_order_id ON orders");
            console.log("✅ Migration: Dropped old unique index on amazon_order_id");
        } catch (e) { /* Ignore if not exists */ }

        try {
            // Add new COMPOSITE UNIQUE index (Order ID + Store Name)
            // This allows the same Amazon Order ID to exist multiple times if it belongs to different shops (Split shipments)
            await conn.query("CREATE UNIQUE INDEX idx_order_id_store ON orders (amazon_order_id, store_name)");
            console.log("✅ Migration: Added composite unique index (id + store)");
        } catch (e) { /* Ignore if exists */ }

        await conn.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                amazon_order_id VARCHAR(50),
                asin VARCHAR(20),
                sku VARCHAR(100),
                title TEXT,
                quantity INT,
                price DECIMAL(10, 2),
                image_url TEXT,
                promotion_ids TEXT,
                FOREIGN KEY (amazon_order_id) REFERENCES orders(amazon_order_id) ON DELETE CASCADE,
                INDEX idx_order_id (amazon_order_id),
                INDEX idx_sku (sku),
                INDEX idx_asin (asin)
            )
        `);

        // 3. Item Columns
        const itemMigrations = [
            "ALTER TABLE order_items ADD COLUMN cost_price DECIMAL(10, 2)",
            "ALTER TABLE order_items ADD COLUMN head_cost DECIMAL(10, 2)",
            "ALTER TABLE order_items ADD COLUMN shipping_price DECIMAL(10, 2)",
            "ALTER TABLE order_items ADD COLUMN tax_price DECIMAL(10, 2)",
            "ALTER TABLE order_items ADD COLUMN discount_price DECIMAL(10, 2)",
            "ALTER TABLE order_items ADD COLUMN local_sku VARCHAR(100)",
            "ALTER TABLE order_items ADD COLUMN store_name VARCHAR(100)" // New for split order item tracking
        ];
        for (const q of itemMigrations) { try { await conn.query(q); } catch (e) {} }

        // 4. Drop Strict FK on order_items if it prevents split orders (or relies on unique amazon_order_id)
        try {
            // Assuming DB is flexible or handled by CREATE TABLE IF NOT EXISTS
        } catch(e) {}

        await conn.query(`
            CREATE TABLE IF NOT EXISTS sync_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50),
                start_time DATETIME,
                end_time DATETIME,
                status VARCHAR(20),
                details TEXT
            )
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS fb_accounts (
                page_id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100),
                access_token TEXT,
                avatar TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS virtual_customers (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100),
                avatar TEXT,
                last_msg TEXT,
                unread_count INT DEFAULT 0,
                updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags JSON
            )
        `);

        await conn.query(`
            CREATE TABLE IF NOT EXISTS virtual_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id VARCHAR(50),
                sender ENUM('me', 'other'),
                text TEXT,
                image_url TEXT,
                type VARCHAR(20) DEFAULT 'text',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_customer (customer_id)
            )
        `);
        
        conn.release();
        console.log("✅ Database: Connected & Schema Synced");
    } catch (e) {
        console.error("❌ Database: Connection Failed -", e.message);
    }
}

app.use(async (req, res, next) => {
    const urlPath = req.path;
    if (urlPath === '/') return next();
    if (urlPath.startsWith('/api') || /\.(css|png|jpg|json|svg)$/.test(urlPath)) {
        return next();
    }

    const safePath = path.join(__dirname, urlPath);
    
    const resolveFile = async (p) => {
        try {
            const stats = await fs.stat(p);
            return { path: p, loader: path.extname(p).slice(1), mtime: stats.mtimeMs };
        } catch { return null; }
    };

    let target = null;
    if (urlPath.endsWith('.tsx') || urlPath.endsWith('.ts')) {
        target = await resolveFile(safePath);
    } else {
        target = await resolveFile(safePath + '.tsx') || 
                 await resolveFile(path.join(safePath, 'index.tsx')) || 
                 await resolveFile(path.join(safePath, 'index.ts'));
    }

    if (target) {
        try {
            const cached = fileCache.get(target.path);
            if (cached && cached.mtime === target.mtime) {
                res.type('js');
                return res.send(cached.code);
            }
            const content = await fs.readFile(target.path, 'utf-8');
            const result = await esbuild.transform(content, { loader: target.loader, format: 'esm', target: 'es2020' });
            fileCache.set(target.path, { mtime: target.mtime, code: result.code });
            res.type('js'); 
            return res.send(result.code);
        } catch (e) {
            console.error(`Compilation Error for ${urlPath}: ${e.message}`);
            return res.status(500).send(`Compilation Error: ${e.message}`); 
        }
    }
    next();
});

// *** Global Throttling for Sellfox API ***
let lastSellfoxCallTime = 0;
const MIN_API_INTERVAL = 1100; // 1.1s minimum interval between calls

async function throttleSellfox() {
    const now = Date.now();
    const timeSinceLastCall = now - lastSellfoxCallTime;
    
    // If not enough time passed, wait the difference
    if (timeSinceLastCall < MIN_API_INTERVAL && timeSinceLastCall >= 0) {
        const waitMs = MIN_API_INTERVAL - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitMs));
    }
    
    // Update timestamp immediately after waiting (claiming the slot)
    lastSellfoxCallTime = Date.now();
}

async function getSellfoxToken() {
    const now = Date.now();
    if (tokenCache.sellfox.accessToken && tokenCache.sellfox.expiresAt > now + 300000) return tokenCache.sellfox.accessToken;
    try {
        if (!SELLFOX_CONFIG.clientId || !SELLFOX_CONFIG.clientSecret) throw new Error("Sellfox credentials missing");
        
        const url = `${SELLFOX_CONFIG.baseUrl}/api/oauth/v2/token.json`;
        const response = await axios.get(url, { params: { client_id: SELLFOX_CONFIG.clientId, client_secret: SELLFOX_CONFIG.clientSecret, grant_type: 'client_credentials' }, timeout: 5000 });
        if (response.data.code === 0 && response.data.data) {
            tokenCache.sellfox.accessToken = response.data.data.access_token;
            tokenCache.sellfox.expiresAt = now + (response.data.data.expires_in * 1000);
            return response.data.data.access_token;
        } else throw new Error(`Sellfox Token Error: ${response.data.msg}`);
    } catch (error) { throw error; }
}

function generateSign(params, secret) {
    const sortedKeys = Object.keys(params).sort();
    const paramStr = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(paramStr);
    return hmac.digest('hex');
}

async function callSellfoxApi(apiPath, method = 'post', body = {}) {
    // *** Apply Global Throttle ***
    await throttleSellfox();

    try {
        const accessToken = await getSellfoxToken();
        const timestamp = Date.now();
        const nonce = Math.floor(Math.random() * 99999);
        const signParams = { access_token: accessToken, client_id: SELLFOX_CONFIG.clientId, method, nonce, timestamp, url: apiPath };
        const sign = generateSign(signParams, SELLFOX_CONFIG.clientSecret);
        const url = `${SELLFOX_CONFIG.baseUrl}${apiPath}?access_token=${accessToken}&client_id=${SELLFOX_CONFIG.clientId}&timestamp=${timestamp}&nonce=${nonce}&sign=${sign}`;
        
        const response = await axios({
            method: method,
            url: url,
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            data: body,
            timeout: 15000
        });
        return response.data;
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.data?.code === 40001)) {
            tokenCache.sellfox.accessToken = null;
            return callSellfoxApi(apiPath, method, body); // Recursive retry also gets throttled
        }
        return { code: -1, msg: error.message };
    }
}

// Interval to trigger hot syncs (recent data) and background crawler check
// Delegated to orders controller
setInterval(() => {
    ordersController.triggerAutoSync(pool, callSellfoxApi)
        .catch(e => console.error("Auto Hot Sync Error:", e));
}, 10 * 60 * 1000); // Check every 10 mins

// --- ORDERS API ROUTES ---
app.post('/api/orders/sync', (req, res) => ordersController.syncOrders(pool, callSellfoxApi, req, res));
// NEW ROUTE: Batch Sync for visible viewport
app.post('/api/orders/sync-batch', (req, res) => ordersController.syncOrderBatch(pool, callSellfoxApi, req, res));
app.get('/api/orders/last-sync', (req, res) => ordersController.getLastSync(pool, req, res));
app.post('/api/orders/note', (req, res) => ordersController.updateNote(pool, req, res));
app.post('/api/orders/db/list', (req, res) => ordersController.getOrderList(pool, callSellfoxApi, req, res));

// ... (Rest of API routes remain mostly unchanged) ...

async function getCaiGouToken() {
    const now = Date.now();
    if (tokenCache.caigou.accessToken && tokenCache.caigou.expiresAt > now + 60000) return tokenCache.caigou.accessToken;
    try {
        if (!CAIGOU_CONFIG.password) throw new Error("CaiGou credentials missing");

        const url = `${CAIGOU_CONFIG.baseUrl}/api/user/login`;
        const response = await axios.post(url, { 
            username: CAIGOU_CONFIG.username, 
            password: CAIGOU_CONFIG.password 
        }, { timeout: 5000 });
        
        if (response.data.code === 200 && response.data.data) {
            tokenCache.caigou.accessToken = response.data.data.token;
            tokenCache.caigou.expiresAt = now + 7200000;
            return response.data.data.token;
        } else throw new Error(response.data.message || 'Login failed');
    } catch (error) { throw error; }
}

async function callCaiGouApi(apiPath, method = 'post', body = {}) {
    try {
        const token = await getCaiGouToken();
        const url = `${CAIGOU_CONFIG.baseUrl}${apiPath}`;
        const response = await axios({
            method,
            url,
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: body,
            timeout: 15000
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            tokenCache.caigou.accessToken = null;
            return callCaiGouApi(apiPath, method, body); 
        }
        return { code: -1, msg: error.message };
    }
}

app.get('/api/settings/columns/:page', async (req, res) => {
    const { page } = req.params;
    try {
        const [rows] = await pool.query('SELECT setting_value FROM user_settings WHERE setting_key = ?', [`columns_${page}`]);
        res.json(rows.length > 0 ? rows[0].setting_value : null);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings/columns/:page', async (req, res) => {
    const { page } = req.params;
    const { settings } = req.body;
    try {
        await pool.query(
            'INSERT INTO user_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
            [`columns_${page}`, JSON.stringify(settings), JSON.stringify(settings)]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/facebook/accounts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM fb_accounts WHERE is_active = 1 ORDER BY created_at DESC');
        const formatted = rows.map(r => ({
            pageId: r.page_id,
            name: r.name,
            accessToken: r.access_token,
            avatar: r.avatar,
            isActive: r.is_active
        }));
        res.json({ data: formatted });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/facebook/accounts', async (req, res) => {
    const { pageId, name, accessToken, avatar } = req.body;
    try {
        await pool.query(
            'INSERT INTO fb_accounts (page_id, name, access_token, avatar, is_active) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE name=?, access_token=?, avatar=?, is_active=1',
            [pageId, name, accessToken, avatar, name, accessToken, avatar]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/facebook/accounts/:pageId', async (req, res) => {
    const { pageId } = req.params;
    try {
        await pool.query('UPDATE fb_accounts SET is_active = 0 WHERE page_id = ?', [pageId]);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/virtual/customers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM virtual_customers ORDER BY updated_time DESC');
        res.json({ data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/virtual/messages', async (req, res) => {
    const { customerId } = req.query;
    try {
        const [rows] = await pool.query('SELECT * FROM virtual_messages WHERE customer_id = ? ORDER BY created_at ASC', [customerId]);
        res.json({ data: rows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/virtual/messages', async (req, res) => {
    const { customerId, text, sender, type, imageUrl } = req.body;
    try {
        await pool.query(
            'INSERT INTO virtual_messages (customer_id, sender, text, type, image_url) VALUES (?, ?, ?, ?, ?)',
            [customerId, sender, text || '', type || 'text', imageUrl || null]
        );
        let lastMsgPreview = type === 'image' ? '[图片]' : text;
        await pool.query(
            'INSERT INTO virtual_customers (id, last_msg, updated_time) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE last_msg=?, updated_time=NOW()',
            [customerId, lastMsgPreview, lastMsgPreview]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/users/salespersons', async (req, res) => {
    try {
        const apiRes = await callSellfoxApi('/api/account/getSubUserPage.json', 'post', {
            pageNo: 1, // Fixed: Use Number
            pageSize: 200 // Fixed: Use Number
        });
        if (apiRes.code === 0) {
            const list = (apiRes.data.rows || []).map(u => ({
                id: u.id,
                name: u.nickname || u.account || u.mobile
            }));
            res.json({ data: list });
        } else {
            console.error("Sellfox User List Error:", apiRes.msg);
            res.json({ data: [] });
        }
    } catch (e) {
        console.error("Server Error /api/users/salespersons:", e);
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/common/delivery-methods', (req, res) => {
    res.json({
        data: [
            { id: 'AFN', name: 'FBA' },
            { id: 'MFN', name: 'FBM' }
        ]
    });
});

app.get('/api/common/statuses', (req, res) => {
    const statuses = [
        { id: 'PendingAvailability', name: 'PendingAvailability' },
        { id: 'Pending', name: 'Pending' },
        { id: 'Unshipped', name: 'Unshipped' },
        { id: 'PartiallyShipped', name: 'PartiallyShipped' },
        { id: 'Shipped', name: 'Shipped' },
        { id: 'InvoiceUnconfirmed', name: 'InvoiceUnconfirmed' },
        { id: 'Canceled', name: 'Canceled' },
        { id: 'Unfulfillable', name: 'Unfulfillable' },
        { id: 'Shipping', name: 'Shipping' }
    ];
    res.json({ data: statuses });
});

const SITE_DATA = [
    {
        id: 'na', name: '北美', type: 'region', children: [
            { id: 'US', name: '美国', marketplaceId: 'ATVPDKIKX0DER' },
            { id: 'CA', name: '加拿大', marketplaceId: 'A2EUQ1WTGCTBG2' },
            { id: 'MX', name: '墨西哥', marketplaceId: 'A1AM78C64UM0Y8' },
            { id: 'BR', name: '巴西', marketplaceId: 'A2Q3Y263D00KWC' }
        ]
    },
    {
        id: 'eu', name: '欧洲', type: 'region', children: [
            { id: 'GB', name: '英国', marketplaceId: 'A1F83G8C2ARO7P' },
            { id: 'DE', name: '德国', marketplaceId: 'A1PA6795UKMFR9' },
            { id: 'FR', name: '法国', marketplaceId: 'A13V1IB3VIYZZH' },
            { id: 'IT', name: '意大利', marketplaceId: 'APJ6JRA9NG5V4' },
            { id: 'ES', name: '西班牙', marketplaceId: 'A1RKKUPIHCS9HS' },
            { id: 'NL', name: '荷兰', marketplaceId: 'A1805IZSGTT6HS' },
            { id: 'SE', name: '瑞典', marketplaceId: 'A2NODRKZP88ZB9' },
            { id: 'PL', name: '波兰', marketplaceId: 'A1C3SOZRARQ6R3' },
            { id: 'BE', name: '比利时', marketplaceId: 'AMEN7PMS3EDWL' },
            { id: 'TR', name: '土耳其', marketplaceId: 'A33AVAJ2PDY3EV' }, 
            { id: 'IE', name: '爱尔兰', marketplaceId: 'A28R8C7NBKEWEA' },
        ]
    },
    { id: 'JP', name: '日本', type: 'site', marketplaceId: 'A1VC38T7YXB528' },
    { id: 'AU', name: '澳大利亚', type: 'site', marketplaceId: 'A39IBJ37TRP1C6' },
    { id: 'IN', name: '印度', type: 'site', marketplaceId: 'A21TJRUUN4KGV' },
    { id: 'AE', name: '阿联酋', type: 'site', marketplaceId: 'A2VIGQ35RCS4UG' },
    { id: 'SA', name: '沙特', type: 'site', marketplaceId: 'A17E79C6D8DWNP' },
    { id: 'SG', name: '新加坡', type: 'site', marketplaceId: 'A19VAU5U5O7RUS' }
];

app.get('/api/common/sites', (req, res) => {
    res.json({ data: SITE_DATA });
});

app.get('/api/dashboard/overview', (req, res) => {
    res.json({
        kpi: { sales: '12,450', revenue: '458,230.00', orders: '342', avgPrice: '36.80', canceled: '5' },
        comprehensive: {
            sales: { value: '12,450', sub1: '12%', sub2: '5%' },
            orders: { value: '342', sub1: '8%', sub2: '3%' },
            revenue: { value: '458,230', sub1: '15%', sub2: '10%' },
            adSpend: { value: '12,000', sub1: '-2%', sub2: '5%' },
            adSales: { value: '120,000', sub1: '10%', sub2: '8%' },
            acos: { value: '10%', sub1: '-1%', sub2: '-2%' },
            profit: { value: '80,000', sub1: '5%', sub2: '4%' },
            margin: { value: '17.5%', sub1: '0.5%', sub2: '0.2%' }
        },
        ads: { spend: '12,340.00', sales: '45,670.00', acots: '8.5%', acos: '27.0%' },
        exceptions: [
            { name: 'FBA库存不足', val: '3', isWarn: true, isNew: true },
            { name: 'Listing被跟卖', val: '1', isWarn: true, isNew: false }
        ],
        chart: Array.from({length: 12}, (_, i) => ({ name: `${i*2}:00`, sales: Math.floor(Math.random() * 1000) }))
    });
});

app.get('/api/dashboard/ranking', (req, res) => {
    res.json(Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        img: `https://picsum.photos/40/40?random=${i}`,
        asin: `B0${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        msku: `MSKU-${1000 + i}`,
        store: 'Tiger US',
        sales: Math.floor(Math.random() * 500),
        orders: Math.floor(Math.random() * 450),
        amt: (Math.random() * 10000).toFixed(2),
        ad: (Math.random() * 1000).toFixed(2),
        profit: (Math.random() * 2000).toFixed(2),
        margin: '20%',
        fba: Math.floor(Math.random() * 200)
    })));
});

app.get('/api/dashboard/tasks', (req, res) => {
    res.json({
        todos: {
            purchase: [{ label: '待采购', value: 5, isRed: true }, { label: '待发货', value: 12, isRed: false }],
            fba: [{ label: '补货建议', value: 3, isRed: true }, { label: '发货计划', value: 2, isRed: false }],
            fbm: [{ label: '待发货', value: 0, isRed: false }, { label: '待揽收', value: 0, isRed: false }]
        },
        announcements: [
            { text: '系统将于本周六进行维护', date: '2026-01-20' },
            { text: 'Amazon 新政策更新通知', date: '2026-01-18' }
        ]
    });
});

// Proxy route kept for legacy support, but new code uses /api/orders/db/list
app.post('/api/order/pageList', async (req, res) => {
    try {
        const apiRes = await callSellfoxApi('/api/order/pageList.json', 'post', req.body);
        if (apiRes.code === 0) res.json(apiRes.data);
        else res.json({ rows: [], total: 0, error: apiRes.msg });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/settings/shops/list', async (req, res) => {
    try {
        const { pageNo, pageSize } = req.body;
        const finalPageSize = pageSize || 100; // Fixed: Use Number directly or default
        console.log(`[API] Fetching Shop List: pageSize=${finalPageSize}`);
        const apiRes = await callSellfoxApi('/api/shop/pageList.json', 'post', {
            pageNo: pageNo || 1, // Fixed: Use Number
            pageSize: finalPageSize // Fixed: Use Number
        });
        if (apiRes.code === 0) {
            console.log(`[API] Shop List Success: Got ${apiRes.data?.rows?.length || 0} items`);
            res.json(apiRes.data);
        } else {
            console.error(`[API] Shop List Error: ${apiRes.msg}`);
            res.status(400).json(apiRes);
        }
    } catch (e) { 
        console.error(`[API] Server Error /api/settings/shops/list: ${e.message}`);
        res.status(500).json({ error: e.message }); 
    }
});

app.get('/api/common/shops', async (req, res) => {
    try {
        const apiRes = await callSellfoxApi('/api/shop/pageList.json', 'post', { 
            pageNo: 1, // Fixed: Use Number
            pageSize: 100 // Fixed: Use Number
        });
        if (apiRes.code === 0) {
            const list = (apiRes.data.rows || []).map(s => ({ id: s.id, name: s.name, region: s.region, marketplaceId: s.marketplaceId }));
            res.json({ data: list });
        } else {
            console.error("[API Error] /api/common/shops:", apiRes);
            res.json({ data: [] });
        }
    } catch (e) { 
        console.error("[Server Error] /api/common/shops:", e);
        res.json({ data: [] }); 
    }
});

app.post('/api/payment/create', async (req, res) => {
    try {
        const { account, amount, chargeType, currency, transNote, remark } = req.body;
        const payload = {
            payeeAccount: account,
            amount: Number(amount),
            currency: currency || '10', 
            chargeType: Number(chargeType), 
            remark: remark,
            notifyUrl: CAIGOU_CONFIG.notifyUrl,
            clientOrderId: `TIGER-${Date.now()}-${Math.floor(Math.random()*1000)}`
        };
        const apiRes = await callCaiGouApi('/api/payment/order/create', 'post', payload);
        if (apiRes.code === 200) {
            res.json(apiRes.data);
        } else {
            res.status(400).json({ error: apiRes.message || 'Payment Creation Failed' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/payment/balance', async (req, res) => {
    try {
        const apiRes = await callCaiGouApi('/api/user/balance', 'get');
        if (apiRes.code === 200) {
            res.json({ balance: `${apiRes.data.currency} ${apiRes.data.availableBalance}` });
        } else {
            res.json({ balance: '0.00' });
        }
    } catch (e) {
        res.json({ balance: '0.00' });
    }
});

// *** UPDATED REAL-TIME DATA ENDPOINT (Using Controller) ***
app.post('/api/realtime/data', (req, res) => realtimeController.getRealTimeData(pool, req, res));

app.use(express.static(path.join(__dirname), { extensions: ['html', 'htm', 'js', 'css', 'json', 'png', 'jpg'] }));

app.get('*', (req, res) => {
    if (
        req.path.startsWith('/api') || 
        req.path.includes('.') || 
        (req.headers.accept && !req.headers.accept.includes('text/html'))
    ) {
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Removed Reconcile & Ant Mover Logic from Main Server

(async () => {
    console.log("-----------------------------------------");
    console.log("🚀 Starting Tiger ERP Server...");
    console.log("-----------------------------------------");
    
    await initDB();

    // NEW: Auto-Repair Missing Data on Startup (Async/Background)
    // Non-blocking approach to ensure fast server startup
    setTimeout(() => {
        ordersController.autoRepairDataGap(pool, callSellfoxApi)
            .catch(err => console.error("⚠️ [Background Startup] Data Repair warning:", err.message));
    }, 5000); // 5s delay to let server settle

    const checks = [
        getSellfoxToken().then(() => "✅ Sellfox API: Connected").catch(e => `❌ Sellfox API: Failed (${e.message})`),
        getCaiGouToken().then(() => "✅ CaiGou API: Connected").catch(e => `❌ CaiGou API: Failed (${e.message})`)
    ];

    const results = await Promise.all(checks);
    results.forEach(msg => console.log(msg));
    
    console.log("-----------------------------------------");
    app.listen(PORT, HOST, () => console.log(`🚀 Server running at http://${PUBLIC_IP}:${PORT}`));
})();
