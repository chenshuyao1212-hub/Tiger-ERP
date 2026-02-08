
// Controller for Platform Order Management
// Handles sync, storage, listing, and updates for orders

const MARKETPLACE_CODE_MAP = {
    'US': 'ATVPDKIKX0DER',
    'CA': 'A2EUQ1WTGCTBG2',
    'MX': 'A1AM78C64UM0Y8',
    'BR': 'A2Q3Y263D00KWC',
    'GB': 'A1F83G8C2ARO7P',
    'DE': 'A1PA6795UKMFR9',
    'FR': 'A13V1IB3VIYZZH',
    'IT': 'APJ6JRA9NG5V4',
    'ES': 'A1RKKUPIHCS9HS',
    'NL': 'A1805IZSGTT6HS',
    'SE': 'A2NODRKZP88ZB9',
    'PL': 'A1C3SOZRARQ6R3',
    'TR': 'A33AVAJ2CFY430',
    'JP': 'A1VC38T7YXB528',
    'AU': 'A39IBJ37TRP1C6',
    'IN': 'A21TJRUUN4KGV',
    'AE': 'A2VIGQ35RCS4UG',
    'SA': 'A17E79C6D8DWNP',
    'SG': 'A19VAU5U5O7RUS',
    'IE': 'A28R8C7NBKEWEA',
    'BE': 'AMEN7PMS3EDWL'
};

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

    // UPDATE: Insert/Update now relies on composite key (amazon_order_id, store_name)
    const insertOrderQuery = `
        INSERT INTO orders (
            amazon_order_id, seller_order_id, store_name, marketplace_id, 
            status, purchase_date, last_update_date, amount, currency, 
            buyer_name, buyer_email, sales_channel, raw_data,
            profit, refund_time, fulfillment_channel, is_business, is_replacement, ship_by_date,
            payment_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            ship_by_date = VALUES(ship_by_date),
            payment_time = VALUES(payment_time)
    `;
    
    await conn.execute(insertOrderQuery, [
        amazonOrderId,
        order.sellerOrderId || null,
        storeName, // Part of the new unique key
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
        parseDate(order.latestShipDate),
        parseDate(order.paymentsDate) // Map API paymentsDate to DB payment_time
    ]);

    // UPDATE: Delete existing items only for THIS store (or NULL store for legacy data cleanup)
    // This allows items for split orders (same ID, different store) to coexist
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
            null, // local_sku default
            storeName // NEW: Store name for item scoping
        ]);
        
        // Updated query includes store_name
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

// NEW: Batch Sync for Viewport Priority Update
exports.syncOrderBatch = async (pool, callSellfoxApi, req, res) => {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.json({ success: true, count: 0 });
    }

    const conn = await pool.getConnection();
    try {
        // Prepare ID string (API supports comma separated IDs)
        const searchContent = orderIds.join(',');
        
        console.log(`🔥 [Batch Sync] Syncing ${orderIds.length} specific orders for immediate UI update...`);

        // Force exact match and unlimited time to ensure we find these specific orders regardless of date filters
        const apiRes = await callSellfoxApi('/api/order/pageList.json', 'post', {
            pageNo: 1,
            pageSize: orderIds.length + 10, // Buffer
            searchType: 'amazonOrderId',
            searchContent: searchContent,
            searchMode: 'exact',
            unlimitedTime: 'true' 
        });

        let syncedCount = 0;
        if (apiRes && apiRes.code === 0 && apiRes.data && apiRes.data.rows) {
            await conn.beginTransaction();
            try {
                for (const order of apiRes.data.rows) {
                    await saveOrderToDb(conn, order);
                }
                await conn.commit();
                syncedCount = apiRes.data.rows.length;
            } catch (err) {
                await conn.rollback();
                throw err;
            }
        }

        console.log(`✅ [Batch Sync] Updated ${syncedCount} orders.`);
        res.json({ success: true, count: syncedCount });
    } catch (e) {
        console.error("❌ Batch Sync Error:", e);
        res.status(500).json({ error: e.message });
    } finally {
        conn.release();
    }
};

async function runOrderSync(pool, callSellfoxApi, options = {}) {
    const conn = await pool.getConnection();
    const startTime = new Date();
    
    // --- 1. Heartbeat Log (Start) ---
    const timeStr = startTime.toLocaleTimeString('en-US', { hour12: false });
    const modeLabel = options.mode === 'manual' ? 'Manual-Trigger' : (options.mode || 'Auto-Timer');
    console.log(`\n⏰ [${timeStr}] [${modeLabel}] 任务触发 | 正在计算智能水位线...`);

    try {
        let dateStart, dateEnd;
        // Default to 'updateDateTime' to capture both new orders and status updates of existing orders
        let dateType = 'updateDateTime'; 

        const toLocalISO = (d) => {
             const offset = d.getTimezoneOffset() * 60000;
             return new Date(d.getTime() - offset).toISOString().slice(0, 19).replace('T', ' ');
        };

        // --- ANCHOR LOGIC ---
        if (options.range) {
            // Case 1: Manual/Explicit Range (e.g. "Sync History" button)
            dateStart = options.range.start;
            dateEnd = options.range.end;
            // For historical backfilling, 'purchase' date is often cleaner to ensure coverage
            if (options.mode === 'history_crawler' || options.mode === 'repair') {
                dateType = 'purchase';
            }
            console.log(`👉 [Manual Range] 指定范围: ${dateStart} ~ ${dateEnd}`);
        } else {
            // Case 2: Auto / Incremental Smart Sync
            // STRATEGY: Smart Watermark (Active Stores MIN)
            
            // 2.1 Fetch Max Purchase Date PER STORE
            const [storeRows] = await conn.query(`
                SELECT store_name, MAX(purchase_date) as last_date 
                FROM orders 
                WHERE store_name IS NOT NULL 
                GROUP BY store_name
            `);

            const now = new Date();
            const ACTIVE_WINDOW_DAYS = 3; // Stores with orders in last 3 days are "Active"
            const activeThreshold = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

            let activeStoreDates = [];

            // 2.2 Filter for Active Stores
            for (const row of storeRows) {
                if (!row.last_date) continue;
                const lastDate = new Date(row.last_date);
                if (lastDate >= activeThreshold) {
                    activeStoreDates.push(lastDate);
                }
            }

            let anchorDate;

            // 2.3 Determine Anchor
            if (activeStoreDates.length > 0) {
                // Find the OLDEST (Min) date among active stores.
                // This ensures that if US is behind JP by 16h, we sync from US time, not JP time.
                const minActiveDate = new Date(Math.min(...activeStoreDates));
                anchorDate = minActiveDate;
                
                const lagHours = ((now.getTime() - anchorDate.getTime()) / 3600000).toFixed(1);
                console.log(`📊 [Smart Watermark] 活跃店铺数: ${activeStoreDates.length} | 锚点(最慢活跃时区): ${toLocalISO(anchorDate)} (-${lagHours}h)`);
            } else {
                // Fallback: No active stores (Empty DB or Long Holiday)
                if (storeRows.length > 0) {
                     // DB has data, but all > 3 days old. Just scan last 24h to check for "Resurrections".
                     console.log(`📊 [Smart Watermark] 全店静默 (>3天). 兜底扫描最近24小时.`);
                     anchorDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                } else {
                     // Brand new DB
                     console.log(`📊 [Smart Watermark] 初始化模式 (新库). 扫描最近30天.`);
                     anchorDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                }
            }

            // 2.4 Apply Buffer & Set Range
            // User requested 1h buffer. We use 2h for extra API latency safety.
            const bufferTime = 2 * 60 * 60 * 1000; 
            const startDateObj = new Date(anchorDate.getTime() - bufferTime);
            
            dateStart = toLocalISO(startDateObj);
            dateEnd = toLocalISO(now);
        }

        if (!dateStart.includes(' ')) dateStart += ' 00:00:00';
        if (!dateEnd.includes(' ')) dateEnd += ' 23:59:59';

        let pageNo = 1;
        let hasMore = true;
        let totalSynced = 0;
        let pageSize = 200; 
        let previousFirstOrderId = null; // Anti-deadloop variable

        while (hasMore) {
            // Circuit Breaker
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

                // --- DEAD LOOP PROTECTION ---
                const currentFirstId = orders[0].amazonOrderId;
                if (previousFirstOrderId === currentFirstId) {
                    hasMore = false;
                    break;
                }
                previousFirstOrderId = currentFirstId;
                // ----------------------------

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
                
                // *** THROTTLING ***
                // Yield to event loop for 500ms between pages to allow other requests (VIP Search) to pass through
                await new Promise(resolve => setTimeout(resolve, 500));

                if (orders.length < currentTryPageSize) hasMore = false;
                else pageNo++;
            } else {
                hasMore = false;
            }
        }

        const duration = ((new Date() - startTime) / 1000).toFixed(1);

        // --- 3. Explicit Outcome Log (Result Confirmation) ---
        // Verify actual DB state regardless of API result
        const [checkRows] = await conn.query('SELECT MAX(purchase_date) as latest_time FROM orders');
        const dbMaxDate = checkRows[0].latest_time ? new Date(checkRows[0].latest_time) : null;
        const now = new Date();
        
        let freshnessStr = 'N/A';
        let lagMinutes = 0;
        
        if (dbMaxDate) {
            const diffMs = now - dbMaxDate;
            lagMinutes = Math.floor(diffMs / 60000);
            const lagHours = (lagMinutes / 60).toFixed(1);
            
            if (lagMinutes < 60) {
                freshnessStr = `${lagMinutes}分钟`;
            } else {
                freshnessStr = `${lagHours}小时`;
            }
        }

        const statusIcon = totalSynced > 0 ? '✅' : '💤';
        const lagIcon = lagMinutes > 1440 ? '⚠️' : (lagMinutes > 60 ? '🕒' : '🟢'); // Warning if > 24h lag

        console.log(`${statusIcon} [Sync Result] 同步完成 | 耗时: ${duration}s`);
        console.log(`   ------------------------------------------------------`);
        console.log(`   📦 本次抓取: ${totalSynced} 单`);
        console.log(`   🏁 截止水位: ${dbMaxDate ? toLocalISO(dbMaxDate) : '无数据'} (DB Max)`);
        console.log(`   ⏱️ 数据延迟: ${freshnessStr} ${lagIcon}`);
        console.log(`   ------------------------------------------------------`);

        await conn.query('INSERT INTO sync_logs (type, start_time, end_time, status, details) VALUES (?, ?, NOW(), ?, ?)',
            ['ORDER', startTime, 'SUCCESS', `Synced ${totalSynced} orders. Lag: ${freshnessStr}`]
        );
        return { success: true, count: totalSynced };

    } catch (e) {
        console.error("❌ Order Sync Failed:", e);
        await conn.query('INSERT INTO sync_logs (type, start_time, end_time, status, details) VALUES (?, ?, NOW(), ?, ?)',
            ['ORDER', startTime, 'FAILED', e.message]
        );
        return { success: false, error: e.message };
    } finally {
        conn.release();
    }
}

// Fetch a single order by ID from API and save to DB (Hot Interceptor)
async function fetchAndSyncSingleOrder(pool, callSellfoxApi, orderId) {
    console.log(`🔥 [Hot Interceptor] Force fetching order: ${orderId}`);
    const conn = await pool.getConnection();
    try {
        // Use exact search logic with numeric params
        const apiRes = await callSellfoxApi('/api/order/pageList.json', 'post', {
            pageNo: 1, 
            pageSize: 20, 
            searchType: 'amazonOrderId',
            searchContent: orderId,
            searchMode: 'exact',
            unlimitedTime: 'true' // Critical for finding old orders by ID
        });

        if (apiRes && apiRes.code === 0 && apiRes.data && apiRes.data.rows && apiRes.data.rows.length > 0) {
            const order = apiRes.data.rows[0];
            await conn.beginTransaction();
            await saveOrderToDb(conn, order);
            await conn.commit();
            return { success: true, order: order };
        }
        return { success: false, msg: "Order not found in API" };
    } catch (e) {
        console.error("Single sync error", e);
        if (conn) await conn.rollback();
        return { success: false, msg: e.message };
    } finally {
        conn.release();
    }
}

// --- Auto Startup Check ---
exports.autoRepairDataGap = async (pool, callSellfoxApi) => {
    // With the new Logic, "Auto Repair" is simply running the standard sync.
    // The standard sync automatically looks at the DB Max Date and fills the gap to Now.
    console.log("🚀 [Startup] Initializing Data Consistency Check...");
    return runOrderSync(pool, callSellfoxApi);
};

// --- EXPORTED CONTROLLER METHODS ---

exports.syncOrders = async (pool, callSellfoxApi, req, res) => {
    const { mode, range, days, minutes } = req.body; 
    let syncOptions = { mode: mode || 'auto', range: null };

    // Support manual overrides
    if (range) {
        syncOptions.range = range;
    } else if (days) {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        const toLocalISOString = (d) => {
             const offset = d.getTimezoneOffset() * 60000;
             return new Date(d.getTime() - offset).toISOString().slice(0, 19).replace('T', ' ');
        };
        syncOptions.range = { 
            start: toLocalISOString(start).split(' ')[0], 
            end: toLocalISOString(end).split(' ')[0]
        };
    }
    // Note: 'minutes' param is now ignored for default syncs as we prefer DB anchor logic.
    
    const result = await runOrderSync(pool, callSellfoxApi, syncOptions);
    res.json(result);
};

exports.getLastSync = async (pool, req, res) => {
    try {
        // Return MAX Purchase Date as the "Last Sync" indicator
        const [rows] = await pool.query('SELECT MAX(purchase_date) as last_date FROM orders');
        const lastDate = rows[0].last_date;
        res.json({ lastSync: lastDate || null });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.updateNote = async (pool, req, res) => {
    const { orderId, note } = req.body;
    try {
        await pool.query('UPDATE orders SET local_note = ? WHERE amazon_order_id = ?', [note, orderId]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.getOrderList = async (pool, callSellfoxApi, req, res) => {
    try {
        const { pageNo = 1, pageSize = 20, startDate, endDate, searchType, searchContent, shops, statuses, timeType, unlimitedTime, deliveryMethod, sites } = req.body;
        const offset = (pageNo - 1) * pageSize;
        
        // *** HOT INTERCEPTOR LOGIC (VIP Fast Track) ***
        // If searching for a specific ID and page is 1
        if (pageNo === 1 && searchType === 'amazonOrderId' && searchContent && searchContent.trim()) {
            const exactId = searchContent.trim();
            // 1. Check DB first
            const [checkRows] = await pool.query('SELECT last_update_date FROM orders WHERE amazon_order_id = ?', [exactId]);
            
            let needFetch = false;
            if (checkRows.length === 0) {
                needFetch = true; // Not in DB
            } else {
                const dbTime = new Date(checkRows[0].last_update_date).getTime();
                // If data is older than 1 hour, try to refresh
                if (Date.now() - dbTime > 60 * 60 * 1000) {
                    needFetch = true;
                }
            }

            if (needFetch) {
                // This call uses exact API search + DB save.
                // Throttling in runOrderSync allows this to execute quickly even if background sync is running.
                await fetchAndSyncSingleOrder(pool, callSellfoxApi, exactId);
            }
        }

        // UPDATE: Changed subquery from LIMIT 1 to JSON_ARRAYAGG to fetch ALL items for the specific order+store combo
        let query = `
            SELECT o.*, 
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'title', title, 
                        'sku', sku, 
                        'asin', asin, 
                        'image_url', image_url, 
                        'quantity', quantity,
                        'price', price,
                        'promotion_ids', promotion_ids
                    )
                )
                FROM order_items oi 
                WHERE oi.amazon_order_id = o.amazon_order_id 
                AND (oi.store_name = o.store_name OR oi.store_name IS NULL)
            ) as items_json
            FROM orders o
            WHERE 1=1
        `;
        const params = [];

        if (startDate && endDate && unlimitedTime !== 'true') {
            const col = timeType === '付款时间' ? 'payment_time' : (timeType === '退款时间' ? 'refund_time' : 'purchase_date');
            query += ` AND o.${col} >= ? AND o.${col} <= ?`;
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        if (shops && shops.length > 0) {
            query += ` AND o.store_name IN (?)`;
            params.push(shops);
        }

        if (statuses && statuses.length > 0) {
            query += ` AND o.status IN (?)`;
            params.push(statuses);
        }

        if (deliveryMethod) {
            query += ` AND o.fulfillment_channel = ?`;
            params.push(deliveryMethod);
        }

        if (sites && sites.length > 0) {
            const mpIds = sites.map(code => MARKETPLACE_CODE_MAP[code]).filter(Boolean);
            if (mpIds.length > 0) {
                query += ` AND o.marketplace_id IN (?)`;
                params.push(mpIds);
            }
        }

        if (searchContent && searchContent.trim()) {
            const term = searchContent.trim();
            // Handle Batch Search (comma separated)
            if (term.includes(',') || term.includes('\n')) {
                const ids = term.split(/[\n,]/).map(s => s.trim()).filter(s => s);
                query += ` AND o.amazon_order_id IN (?)`;
                params.push(ids);
            } else {
                const likeTerm = `%${term}%`;
                if (searchType === 'ASIN' || searchType === 'SKU' || searchType === 'MSKU') {
                    query += ` AND EXISTS (SELECT 1 FROM order_items oi WHERE oi.amazon_order_id = o.amazon_order_id AND (oi.asin LIKE ? OR oi.sku LIKE ?))`;
                    params.push(likeTerm, likeTerm);
                } else if (searchType === '买家邮箱') {
                    query += ` AND o.buyer_email LIKE ?`;
                    params.push(likeTerm);
                } else {
                    query += ` AND (o.amazon_order_id LIKE ? OR o.seller_order_id LIKE ?)`;
                    params.push(likeTerm, likeTerm);
                }
            }
        }

        let finalQuery = query + ` ORDER BY o.purchase_date DESC LIMIT ? OFFSET ?`;
        let queryParams = [...params, parseInt(pageSize), parseInt(offset)];

        let [rows] = await pool.query(finalQuery, queryParams);

        // FIX: Use Regex replacement to avoid SyntaxError with simple string replace on complex multi-line strings
        const countQueryStr = query.replace(/SELECT[\s\S]+?FROM orders o/, 'SELECT COUNT(*) as total FROM orders o');
        
        const [countRows] = await pool.query(countQueryStr, params);
        const total = countRows[0].total || 0;

        const formattedRows = rows.map(r => {
            // Parse items_json which can be string or object depending on driver version
            let items = [];
            try {
                items = typeof r.items_json === 'string' ? JSON.parse(r.items_json) : (r.items_json || []);
            } catch(e) { items = []; }
            
            // For backward compatibility or sorting, use the first item as default for some fields
            const firstItem = items.length > 0 ? items[0] : {};

            let comment = '-';
            try {
                const raw = typeof r.raw_data === 'string' ? JSON.parse(r.raw_data) : r.raw_data;
                comment = raw?.comment || '-';
            } catch(e){}

            return {
                id: r.amazon_order_id,
                store: r.store_name,
                region: r.marketplace_id,
                orderId: r.amazon_order_id,
                sellerOrderId: r.seller_order_id || '-',
                orderTime: r.purchase_date ? new Date(r.purchase_date).toLocaleString() : '-',
                paymentTime: r.payment_time ? new Date(r.payment_time).toLocaleString() : '-',
                status: r.status,
                sales: r.amount || '0.00',
                title: firstItem.title || '-', // kept for legacy sort/search compat
                sku: firstItem.sku || '-',     // kept for legacy sort/search compat
                asin: firstItem.asin || '-',   // kept for legacy sort/search compat
                img: firstItem.image_url,      // kept for legacy sort/search compat
                qty: items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0), // Total Qty
                items: items, // NEW: Full list of items including promotion_ids
                amount: r.amount,
                profit: r.profit || '0.00',
                margin: r.amount > 0 ? ((r.profit / r.amount) * 100).toFixed(1) + '%' : '0%',
                buyer: r.buyer_name,
                buyerEmail: r.buyer_email,
                note: comment,
                localNote: r.local_note || ''
            };
        });

        res.json({ rows: formattedRows, total });

    } catch (e) {
        console.error("DB List Error", e);
        res.status(500).json({ error: e.message });
    }
};

exports.triggerAutoSync = async (pool, callSellfoxApi) => {
    // No minutes passed here. The new logic in runOrderSync uses DB Anchor.
    return runOrderSync(pool, callSellfoxApi);
};
