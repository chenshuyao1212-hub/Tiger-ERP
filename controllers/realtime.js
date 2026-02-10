
const MARKETPLACE_OFFSETS = {
    'ATVPDKIKX0DER': -8, // US (PST/Standard Time) - Updated from -7 for better winter accuracy
    'A2EUQ1WTGCTBG2': -8, // CA - Aligned with US West
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

/**
 * Helper to generate SQL time ranges for a specific period
 */
const getPeriodSQL = (periodType) => {
    // periodType: 'today', 'yesterday', 'lastWeek', 'lastYear'
    const cases = [];
    const now = new Date();

    Object.entries(MARKETPLACE_OFFSETS).forEach(([mpId, offset]) => {
        // Calculate "Local Midnight" for this marketplace
        const localNow = new Date(now.getTime() + offset * 3600 * 1000);
        
        let startLocal = new Date(localNow);
        startLocal.setUTCHours(0, 0, 0, 0); // Local Midnight
        
        let endLocal = new Date(localNow);
        endLocal.setUTCHours(23, 59, 59, 999); // Local End of Day

        // Adjust based on period
        if (periodType === 'yesterday') {
            startLocal.setUTCDate(startLocal.getUTCDate() - 1);
            endLocal.setUTCDate(endLocal.getUTCDate() - 1);
        } else if (periodType === 'lastWeek') {
            startLocal.setUTCDate(startLocal.getUTCDate() - 7);
            endLocal.setUTCDate(endLocal.getUTCDate() - 7);
        } else if (periodType === 'lastYear') {
            startLocal.setUTCFullYear(startLocal.getUTCFullYear() - 1);
            endLocal.setUTCFullYear(endLocal.getUTCFullYear() - 1);
        }

        const startUTC = new Date(startLocal.getTime() - offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        const endUTC = new Date(endLocal.getTime() - offset * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');

        cases.push(`(marketplace_id = '${mpId}' AND purchase_date BETWEEN '${startUTC}' AND '${endUTC}')`);
    });

    return cases.join(' OR ');
};

exports.getRealTimeData = async (pool, req, res) => {
    try {
        const { sites, shops, salespersons, dimension, searchContent, sortKey, sortDir } = req.body; 
        // dimension: 'ASIN', 'MSKU', 'SKU', '父ASIN'

        // 1. Build Base Filter Query
        let whereClause = "WHERE 1=1";
        const params = [];

        if (shops && shops.length > 0) {
            whereClause += ` AND o.store_name IN (?)`; 
            params.push(shops);
        }

        if (sites && sites.length > 0) {
            // Map site codes back to marketplace IDs if needed, or assume frontend sends codes
            // For now, let's assume we can filter by region code or exact ID
            // Simple approach: skip if not critical for mock data flow, but real logic needs it.
        }

        if (searchContent && searchContent.trim()) {
            const term = `%${searchContent.trim()}%`;
            whereClause += ` AND (oi.asin LIKE ? OR oi.sku LIKE ? OR oi.title LIKE ?)`;
            params.push(term, term, term);
        }
        
        // 2. Determine Grouping Logic based on Dimension
        let groupCol = "oi.asin"; 
        let selectAsin = "MAX(oi.asin) as asin";
        let selectMsku = "GROUP_CONCAT(DISTINCT oi.sku SEPARATOR ', ') as msku"; // Default for ASIN view
        let selectTitle = "MAX(oi.title) as title";
        let selectImg = "MAX(oi.image_url) as img";
        
        if (dimension === 'MSKU') {
            // MSKU View: Group by MSKU, show ASINs as list
            groupCol = "oi.sku";
            selectAsin = "GROUP_CONCAT(DISTINCT oi.asin SEPARATOR ', ') as asin";
            selectMsku = "oi.sku as msku";
        } else if (dimension === 'SKU') {
            // Local SKU View: Group by Local SKU, show lists of MSKUs and ASINs
            groupCol = "oi.local_sku"; 
            selectAsin = "GROUP_CONCAT(DISTINCT oi.asin SEPARATOR ', ') as asin";
            selectMsku = "GROUP_CONCAT(DISTINCT oi.sku SEPARATOR ', ') as msku";
            // Note: If local_sku is null, rows will group under null.
        } else if (dimension === '父ASIN') {
            // Parent ASIN View (Placeholder: Group by ASIN for now until parent_asin exists)
            groupCol = "oi.asin"; 
            selectAsin = "MAX(oi.asin) as asin"; // Should be parent_asin
            selectMsku = "GROUP_CONCAT(DISTINCT oi.sku SEPARATOR ', ') as msku";
        }

        // 3. Build Complex Time & Status Expressions
        const todayCondition = getPeriodSQL('today') || "1=0";
        const yestCondition = getPeriodSQL('yesterday') || "1=0";
        const lwCondition = getPeriodSQL('lastWeek') || "1=0";
        const lyCondition = getPeriodSQL('lastYear') || "1=0";

        // *** STRICT STATUS FILTERS ***
        // Valid Sales Statuses: Pending, Shipped, Unshipped, Shipping, InvoiceUnconfirmed, PartiallyShipped
        // EXPANDED: PendingAvailability (Pre-order/Backorder), Unfulfillable (Stock issue but order exists)
        const validSalesStatus = `o.status IN ('Pending', 'Shipped', 'Unshipped', 'Shipping', 'InvoiceUnconfirmed', 'PartiallyShipped', 'PendingAvailability', 'Unfulfillable')`;
        
        // Exclude Replacements (is_replacement flag)
        const notReplacement = `(o.is_replacement IS NULL OR o.is_replacement = 0)`;
        
        // NEW: Exclude S-prefix orders (Multi-Channel Fulfillment / Free Replacements)
        const notMCF = `(o.amazon_order_id NOT LIKE 'S%')`;

        // Valid Condition Combined
        const validSale = `(${validSalesStatus} AND ${notReplacement} AND ${notMCF})`;

        // 4. Sorting Logic
        // Allow sorting by aggregated fields
        const safeSortKey = ['todaySales', 'todayAmount', 'yesterdaySales', 'lastWeekSales', 'todayOrders'].includes(sortKey) ? sortKey : 'todaySales';
        const safeSortDir = sortDir === 'ASC' ? 'ASC' : 'DESC';

        // 5. The Query
        const sql = `
            SELECT 
                ${selectAsin},
                ${selectMsku},
                ${selectTitle},
                ${selectImg},
                MAX(o.store_name) as store,
                o.marketplace_id as region,
                
                -- Today (Effective Sales)
                SUM(CASE WHEN ${todayCondition} AND ${validSale} THEN oi.quantity ELSE 0 END) as todaySales,
                COUNT(DISTINCT CASE WHEN ${todayCondition} AND ${validSale} THEN o.amazon_order_id END) as todayOrders,
                SUM(CASE WHEN ${todayCondition} AND ${validSale} THEN (oi.price * oi.quantity) ELSE 0 END) as todayAmount,

                -- Yesterday
                SUM(CASE WHEN ${yestCondition} AND ${validSale} THEN oi.quantity ELSE 0 END) as yesterdaySales,
                COUNT(DISTINCT CASE WHEN ${yestCondition} AND ${validSale} THEN o.amazon_order_id END) as yesterdayOrders,
                SUM(CASE WHEN ${yestCondition} AND ${validSale} THEN (oi.price * oi.quantity) ELSE 0 END) as yesterdayAmount,

                -- Last Week
                SUM(CASE WHEN ${lwCondition} AND ${validSale} THEN oi.quantity ELSE 0 END) as lastWeekSales,
                COUNT(DISTINCT CASE WHEN ${lwCondition} AND ${validSale} THEN o.amazon_order_id END) as lastWeekOrders,
                SUM(CASE WHEN ${lwCondition} AND ${validSale} THEN (oi.price * oi.quantity) ELSE 0 END) as lastWeekAmount,

                -- Last Year
                SUM(CASE WHEN ${lyCondition} AND ${validSale} THEN oi.quantity ELSE 0 END) as lastYearSales,
                COUNT(DISTINCT CASE WHEN ${lyCondition} AND ${validSale} THEN o.amazon_order_id END) as lastYearOrders,
                SUM(CASE WHEN ${lyCondition} AND ${validSale} THEN (oi.price * oi.quantity) ELSE 0 END) as lastYearAmount,

                -- Cancelled Stats
                SUM(CASE WHEN ${todayCondition} AND o.status = 'Canceled' THEN oi.quantity ELSE 0 END) as todayCancelled,
                SUM(CASE WHEN ${yestCondition} AND o.status = 'Canceled' THEN oi.quantity ELSE 0 END) as yesterdayCancelled,
                SUM(CASE WHEN ${lwCondition} AND o.status = 'Canceled' THEN oi.quantity ELSE 0 END) as lastWeekCancelled

            FROM orders o
            JOIN order_items oi ON o.amazon_order_id = oi.amazon_order_id
            ${whereClause}
            GROUP BY ${groupCol}, o.marketplace_id
            ORDER BY ${safeSortKey} ${safeSortDir}
            LIMIT 200
        `;

        const [rows] = await pool.query(sql, params);

        // 5. Post-process rows for display
        const formattedRows = rows.map((r, idx) => ({
            id: idx,
            img: r.img,
            asin: r.asin,
            title: r.title,
            msku: r.msku,
            skuName: r.msku && r.msku.length > 20 ? r.msku.substring(0, 20) + '...' : r.msku, // Short preview
            store: r.store,
            region: r.region,
            
            // Today
            todaySales: Number(r.todaySales || 0),
            todayOrders: Number(r.todayOrders || 0),
            todayAmount: Number(r.todayAmount || 0),
            todayCancelled: Number(r.todayCancelled || 0),
            
            // Yesterday
            yesterdaySales: Number(r.yesterdaySales || 0),
            yesterdayOrders: Number(r.yesterdayOrders || 0),
            yesterdayAmount: Number(r.yesterdayAmount || 0),
            yesterdayCancelled: Number(r.yesterdayCancelled || 0),

            // Last Week
            lastWeekSales: Number(r.lastWeekSales || 0),
            lastWeekOrders: Number(r.lastWeekOrders || 0),
            lastWeekAmount: Number(r.lastWeekAmount || 0),
            lastWeekCancelled: Number(r.lastWeekCancelled || 0),

            // Last Year
            lastYearSales: Number(r.lastYearSales || 0),
            lastYearOrders: Number(r.lastYearOrders || 0),
            lastYearAmount: Number(r.lastYearAmount || 0),

            // Inventory (Mock for now, as not in DB)
            fbaDays: '-',
            fbaAvailable: '-',
            fbaReserved: '-',
            fbaInbound: '-',
            
            // Trend (Mock sparkline)
            trend: [
                Number(r.lastWeekSales || 0), 
                Number(r.yesterdaySales || 0), 
                Number(r.todaySales || 0)
            ] 
        }));

        // 6. Calculate Summary
        const sum = (arr, key) => arr.reduce((acc, r) => acc + Number(r[key] || 0), 0);

        const s_sales_val = sum(formattedRows, 'todaySales');
        const s_sales_yest = sum(formattedRows, 'yesterdaySales');
        const s_sales_lw = sum(formattedRows, 'lastWeekSales');

        const s_amt_val = sum(formattedRows, 'todayAmount');
        const s_amt_yest = sum(formattedRows, 'yesterdayAmount');
        const s_amt_lw = sum(formattedRows, 'lastWeekAmount');

        const summary = {
            sales: { value: s_sales_val, yesterday: s_sales_yest, lastWeek: s_sales_lw },
            orders: { 
                value: sum(formattedRows, 'todayOrders'), 
                yesterday: sum(formattedRows, 'yesterdayOrders'), 
                lastWeek: sum(formattedRows, 'lastWeekOrders') 
            },
            amount: { value: s_amt_val, yesterday: s_amt_yest, lastWeek: s_amt_lw },
            avgPrice: {
                value: s_sales_val ? s_amt_val / s_sales_val : 0,
                yesterday: s_sales_yest ? s_amt_yest / s_sales_yest : 0,
                lastWeek: s_sales_lw ? s_amt_lw / s_sales_lw : 0
            },
            cancelled: { 
                value: sum(formattedRows, 'todayCancelled'), 
                yesterday: sum(formattedRows, 'yesterdayCancelled'), 
                lastWeek: sum(formattedRows, 'lastWeekCancelled') 
            }
        };

        res.json({
            success: true,
            rows: formattedRows,
            summary: summary
        });

    } catch (e) {
        console.error("Realtime Controller Error:", e);
        res.status(500).json({ success: false, error: e.message });
    }
};
