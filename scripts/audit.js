
require('dotenv').config();
const mysql = require('mysql2/promise');
const axios = require('axios');
const crypto = require('crypto');

// --- CONFIGURATION COPY ---
const SELLFOX_CONFIG = {
    clientId: process.env.SELLFOX_CLIENT_ID || '368081',
    clientSecret: process.env.SELLFOX_CLIENT_SECRET || '3f543f96-0ef7-42a8-bca9-26885f6a5d77',
    baseUrl: 'https://openapi.sellfox.com'
};

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Chenshuyao1212',
    database: process.env.DB_NAME || 'tiger_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4' 
};

const pool = mysql.createPool(DB_CONFIG);
let tokenCache = { accessToken: null, expiresAt: 0 };

// --- HELPERS ---
async function throttleSellfox() {
    // Simplified throttle for script
    await new Promise(resolve => setTimeout(resolve, 1100));
}

async function getSellfoxToken() {
    const now = Date.now();
    if (tokenCache.accessToken && tokenCache.expiresAt > now + 300000) return tokenCache.accessToken;
    try {
        const url = `${SELLFOX_CONFIG.baseUrl}/api/oauth/v2/token.json`;
        const response = await axios.get(url, { params: { client_id: SELLFOX_CONFIG.clientId, client_secret: SELLFOX_CONFIG.clientSecret, grant_type: 'client_credentials' }, timeout: 5000 });
        if (response.data.code === 0 && response.data.data) {
            tokenCache.accessToken = response.data.data.access_token;
            tokenCache.expiresAt = now + (response.data.data.expires_in * 1000);
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
            tokenCache.accessToken = null;
            return callSellfoxApi(apiPath, method, body);
        }
        return { code: -1, msg: error.message };
    }
}

async function saveOrderToDb(conn, order) {
    const amazonOrderId = order.amazonOrderId;
    if (!amazonOrderId) return;

    const parseNum = (val) => {
        if (!val) return 0;
        const num = parseFloat(String(val).replace(/[^0-9.-]+/g,""));
        return isNaN(num) ? 0 : num;
    };

    const parseDate = (val) => val ? new Date(val) : null;
    const storeName = order.shopName || null;

    const insertOrderQuery = `
        INSERT INTO orders (
            amazon_order_id, seller_order_id, store_name, marketplace_id, 
            status, purchase_date, last_update_date, amount, currency, 
            buyer_name, buyer_email, sales_channel, raw_data,
            profit, refund_time, fulfillment_channel, is_business, is_replacement, ship_by_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            last_update_date = VALUES(last_update_date),
            amount = VALUES(amount),
            currency = VALUES(currency),
            buyer_name = VALUES(buyer_name),
            buyer_email = VALUES(buyer_email),
            raw_data = VALUES(raw_data),
            profit = VALUES(profit),
            refund_time = VALUES(refund_time),
            fulfillment_channel = VALUES(fulfillment_channel),
            is_business = VALUES(is_business),
            is_replacement = VALUES(is_replacement),
            ship_by_date = VALUES(ship_by_date)
    `;
    
    await conn.execute(insertOrderQuery, [
        amazonOrderId,
        order.sellerOrderId || null,
        storeName, 
        order.marketplaceId || null,
        order.orderStatus || 'Unknown',
        parseDate(order.purchaseDate),
        parseDate(order.lastUpdateDate) || new Date(),
        parseNum(order.orderTotalAmount),
        order.currencyCode || 'USD',
        order.buyerName || 'Guest',
        order.buyerEmail || null,
        order.salesChannel || null,
        JSON.stringify(order),
        parseNum(order.orderProfit),
        parseDate(order.refundDate),
        order.fulfillmentChannel || null,
        order.isBusinessOrder === '1' || order.isBusinessOrder === true,
        order.isReplacementOrder === '1' || order.isReplacementOrder === true,
        parseDate(order.latestShipDate)
    ]);

    await conn.execute('DELETE FROM order_items WHERE amazon_order_id = ? AND (store_name = ? OR store_name IS NULL)', [amazonOrderId, storeName]);

    if (order.orderItemVoList && order.orderItemVoList.length > 0) {
        const itemValues = order.orderItemVoList.map(item => [
            amazonOrderId,
            item.asin || null,
            item.sellerSku || null,
            item.title || null,
            parseNum(item.quantityOrdered),
            parseNum(item.itemPriceAmount),
            item.imageUrl || null,
            Array.isArray(item.promotionIds) ? item.promotionIds.join(',') : (item.promotionIds || null),
            parseNum(item.purchaseCost),
            parseNum(item.headTripCost),
            parseNum(item.shippingCharge),
            parseNum(item.itemTaxAmount),
            parseNum(item.promotionDiscountAmount),
            null, 
            storeName 
        ]);
        
        const placeholders = itemValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const flatValues = itemValues.flat();
        
        await conn.execute(
            `INSERT INTO order_items (
                amazon_order_id, asin, sku, title, quantity, price, image_url, promotion_ids,
                cost_price, head_cost, shipping_price, tax_price, discount_price, local_sku, store_name
            ) VALUES ${placeholders}`,
            flatValues
        );
    }
}

async function runOrderSync(options = {}) {
    const conn = await pool.getConnection();
    const startTime = new Date();
    
    try {
        let dateStart, dateEnd;
        let dateType = (options.mode === 'history_crawler' || options.mode === 'repair') ? 'purchase' : 'updateDateTime';

        if (options.range) {
            dateStart = options.range.start;
            dateEnd = options.range.end;
        } else {
            console.log("No range provided for runOrderSync in script.");
            return;
        }

        if (!dateStart.includes(' ')) dateStart += ' 00:00:00';
        if (!dateEnd.includes(' ')) dateEnd += ' 23:59:59';

        console.log(`   > Sync Req: ${dateType} | ${dateStart} ~ ${dateEnd}`);

        let pageNo = 1;
        let hasMore = true;
        let totalSynced = 0;
        let pageSize = 200; 
        let previousFirstOrderId = null;

        while (hasMore) {
            if (pageNo > 500) break;

            let retries = 3;
            let apiRes = null;
            let currentTryPageSize = pageSize; 
            
            while (retries > 0) {
                try {
                    apiRes = await callSellfoxApi('/api/order/pageList.json', 'post', {
                        pageNo: pageNo, 
                        pageSize: currentTryPageSize, 
                        dateType: dateType,
                        dateStart: dateStart,
                        dateEnd: dateEnd
                    });
                    
                    if (apiRes && String(apiRes.code) === '40014' && currentTryPageSize > 100) {
                        pageSize = 100;
                        currentTryPageSize = 100;
                        continue; 
                    }

                    if (apiRes && apiRes.code === 0) break; 
                    throw new Error(apiRes?.msg || "API Error");
                } catch (e) {
                    retries--;
                    await new Promise(r => setTimeout(r, 1000)); 
                }
            }

            if (apiRes && apiRes.code === 0 && apiRes.data && apiRes.data.rows && apiRes.data.rows.length > 0) {
                const orders = apiRes.data.rows;
                const currentFirstId = orders[0].amazonOrderId;
                if (previousFirstOrderId === currentFirstId) {
                    hasMore = false;
                    break;
                }
                previousFirstOrderId = currentFirstId;

                await conn.beginTransaction();
                try {
                    for (const order of orders) {
                        await saveOrderToDb(conn, order);
                    }
                    await conn.commit();
                    totalSynced += orders.length;
                } catch (err) {
                    await conn.rollback();
                    throw err;
                }
                
                if (orders.length < currentTryPageSize) hasMore = false;
                else pageNo++;
            } else {
                hasMore = false;
            }
        }
        return { success: true, count: totalSynced };
    } catch (e) {
        console.error("❌ Order Sync Failed:", e);
        return { success: false, error: e.message };
    } finally {
        conn.release();
    }
}

// --- AUDITOR LOGIC ---
async function reconcileYearlyData(year) {
    console.log(`🔍 [Smart Reconcile] Starting audit for Year ${year}...`);
    const conn = await pool.getConnection();
    const monthlyStats = [];

    try {
        for (let m = 0; m < 12; m++) {
            const startOfMonth = new Date(year, m, 1);
            if (startOfMonth > new Date()) break;

            const endOfMonth = new Date(year, m + 1, 0);
            const startStr = startOfMonth.toISOString().slice(0, 10) + ' 00:00:00';
            const endStr = endOfMonth.toISOString().slice(0, 10) + ' 23:59:59';

            const apiRes = await callSellfoxApi('/api/order/pageList.json', 'post', {
                pageNo: 1, pageSize: 1, 
                dateType: 'purchase',
                dateStart: startStr,
                dateEnd: endStr
            });
            const apiCount = (apiRes && apiRes.code === 0) ? apiRes.data.totalSize : -1;

            const [rows] = await conn.query(
                'SELECT COUNT(*) as count FROM orders WHERE purchase_date >= ? AND purchase_date <= ?',
                [startStr, endStr]
            );
            const dbCount = rows[0].count;

            monthlyStats.push({
                month: `${year}-${String(m + 1).padStart(2, '0')}`,
                api: apiCount,
                db: dbCount,
                diff: dbCount - apiCount,
                range: { start: startStr, end: endStr },
                monthIndex: m
            });
        }

        console.log(`\n📊 [年度账单审计报告 - ${year}年]`);
        console.log("----------------------------------------------------------------");
        console.log("| 月份    | 赛狐条数 (API) | Tiger库内条数 | 差异   | 状态     |");
        console.log("|---------|---------------|--------------|--------|----------|");
        
        monthlyStats.forEach(stat => {
            const status = stat.diff === 0 ? "✅ 平账" : (stat.diff < 0 ? "🔴 缺失" : "⚠️ 多余");
            const diffStr = stat.diff === 0 ? "0" : (stat.diff > 0 ? `+${stat.diff}` : `${stat.diff}`);
            const pad = (s, w) => String(s).padEnd(w, ' ');
            console.log(`| ${pad(stat.month, 7)} | ${pad(stat.api, 13)} | ${pad(stat.db, 12)} | ${pad(diffStr, 6)} | ${status} |`);
        });
        console.log("----------------------------------------------------------------\n");

        const missing = monthlyStats.filter(s => s.diff < 0);
        if (missing.length > 0) {
            console.log(`⚠️ 发现 ${missing.length} 个月份存在数据缺失，正在启动“深层修补模式”...`);
            
            for (const stat of missing) {
                console.log(`   > 正在针对 ${stat.month} 重新按“天”扫描...`);
                const daysInMonth = new Date(year, stat.monthIndex + 1, 0).getDate();
                
                for (let d = 1; d <= daysInMonth; d++) {
                    const currentDay = new Date(year, stat.monthIndex, d);
                    if (currentDay > new Date()) break;

                    const dStart = currentDay.toISOString().slice(0, 10) + ' 00:00:00';
                    const dEnd = currentDay.toISOString().slice(0, 10) + ' 23:59:59';

                    const dApiRes = await callSellfoxApi('/api/order/pageList.json', 'post', {
                        pageNo: 1, pageSize: 1,
                        dateType: 'purchase',
                        dateStart: dStart,
                        dateEnd: dEnd
                    });
                    const dApiCount = (dApiRes && dApiRes.code === 0) ? dApiRes.data.totalSize : 0;

                    const [dRows] = await conn.query(
                        'SELECT COUNT(*) as count FROM orders WHERE purchase_date >= ? AND purchase_date <= ?',
                        [dStart, dEnd]
                    );
                    const dDbCount = dRows[0].count;

                    if (dApiCount > dDbCount) {
                        const gap = dApiCount - dDbCount;
                        console.log(`      🔴 发现漏洞：${dStart.split(' ')[0]} (赛狐 ${dApiCount} vs 库内 ${dDbCount}，缺 ${gap})，正在强行拉取...`);
                        await runOrderSync({ 
                            mode: 'repair', 
                            range: { start: dStart, end: dEnd } 
                        });
                    }
                }
                console.log(`   > ${stat.month} 扫描修补结束。`);
            }
        } else {
            console.log(`✨ ${year}年数据完美，无需修补。`);
        }

    } catch(e) {
        console.error("Reconcile Error", e);
    } finally {
        conn.release();
    }
}

// Main Execution
(async () => {
    console.log("🚀 Manual Auditor Script Started");
    await reconcileYearlyData(2026);
    await reconcileYearlyData(2025);
    await reconcileYearlyData(2024);
    console.log("✅ Audit Complete. Exiting...");
    process.exit(0);
})();
