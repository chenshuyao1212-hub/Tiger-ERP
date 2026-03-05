
/**
 * Controller for Sales Statistics
 * Handles multi-dimensional aggregation of order data
 */

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

exports.getSalesStatData = async (pool, req, res) => {
    try {
        const { 
            type = 'productNum', 
            groupType = 'asin', 
            startDate, 
            endDate, 
            pageNo = 1, 
            pageSize = 50,
            shopIdList,
            searchType,
            searchContentList,
            fulfillmentChannel,
            siteList
        } = req.body;

        const offset = (pageNo - 1) * pageSize;

        // 1. Build Base Filter
        let whereClause = "WHERE 1=1";
        const params = [];

        // Status filter: Only count valid sales
        whereClause += ` AND o.status IN ('Pending', 'Shipped', 'Unshipped', 'Shipping', 'InvoiceUnconfirmed', 'PartiallyShipped', 'PendingAvailability', 'Unfulfillable')`;
        whereClause += ` AND (o.is_replacement IS NULL OR o.is_replacement = 0)`;
        whereClause += ` AND (o.amazon_order_id NOT LIKE 'S%')`;

        if (startDate && endDate) {
            whereClause += ` AND o.purchase_date >= ? AND o.purchase_date <= ?`;
            params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        if (shopIdList && shopIdList.length > 0) {
            whereClause += ` AND o.store_name IN (?)`;
            params.push(shopIdList);
        }

        if (fulfillmentChannel) {
            whereClause += ` AND o.fulfillment_channel = ?`;
            params.push(fulfillmentChannel);
        }

        if (siteList && siteList.length > 0) {
            const mpIds = siteList.map(code => MARKETPLACE_CODE_MAP[code]).filter(Boolean);
            if (mpIds.length > 0) {
                whereClause += ` AND o.marketplace_id IN (?)`;
                params.push(mpIds);
            }
        }

        if (searchContentList && searchContentList.length > 0) {
            const searchTerms = searchContentList.map(t => `%${t.trim()}%`);
            let searchClause = "(";
            searchTerms.forEach((term, idx) => {
                if (idx > 0) searchClause += " OR ";
                if (searchType === 'asin') searchClause += "oi.asin LIKE ?";
                else if (searchType === 'msku' || searchType === 'sku') searchClause += "oi.sku LIKE ?";
                else if (searchType === 'title') searchClause += "oi.title LIKE ?";
                else searchClause += "oi.asin LIKE ? OR oi.sku LIKE ? OR oi.title LIKE ?";
                
                if (searchType === 'asin' || searchType === 'msku' || searchType === 'sku' || searchType === 'title') {
                    params.push(term);
                } else {
                    params.push(term, term, term);
                }
            });
            searchClause += ")";
            whereClause += ` AND ${searchClause}`;
        }

        // 2. Determine Grouping
        let groupCol = "oi.asin";
        if (groupType === 'parentAsin') groupCol = "oi.asin"; // Placeholder: need parent_asin column in DB
        if (groupType === 'msku') groupCol = "oi.sku";
        if (groupType === 'sku') groupCol = "oi.local_sku";

        // 3. Metric Calculation
        let metricSql = "SUM(oi.quantity)";
        if (type === 'orderNum') metricSql = "COUNT(DISTINCT o.amazon_order_id)";
        if (type === 'salePrice') metricSql = "SUM(oi.price * oi.quantity)";

        // 4. Generate Daily Columns
        // We need to generate a list of dates between start and end
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dailyCols = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            dailyCols.push(`
                JSON_OBJECT(
                    'day', '${dateStr}',
                    'productNum', SUM(CASE WHEN DATE(o.purchase_date) = '${dateStr}' THEN oi.quantity ELSE 0 END),
                    'orderNum', COUNT(DISTINCT CASE WHEN DATE(o.purchase_date) = '${dateStr}' THEN o.amazon_order_id END),
                    'salePrice', SUM(CASE WHEN DATE(o.purchase_date) = '${dateStr}' THEN oi.price * oi.quantity ELSE 0 END)
                )
            `);
        }

        // 5. Main Query
        const sql = `
            SELECT 
                ${groupCol} as groupKey,
                MAX(oi.asin) as asin,
                MAX(oi.sku) as msku,
                MAX(oi.title) as title,
                MAX(oi.image_url) as image_url,
                MAX(o.store_name) as shopName,
                MAX(o.marketplace_id) as marketplaceId,
                SUM(oi.quantity) as totalProductNum,
                COUNT(DISTINCT o.amazon_order_id) as totalOrderNum,
                SUM(oi.price * oi.quantity) as totalSalePrice,
                JSON_ARRAY(${dailyCols.join(',')}) as dailyData
            FROM orders o
            JOIN order_items oi ON o.amazon_order_id = oi.amazon_order_id
            ${whereClause}
            GROUP BY ${groupCol}, o.store_name
            ORDER BY totalProductNum DESC
            LIMIT ? OFFSET ?
        `;

        const [rows] = await pool.query(sql, [...params, parseInt(pageSize), parseInt(offset)]);

        // 6. Count Query
        const countSql = `
            SELECT COUNT(DISTINCT ${groupCol}, o.store_name) as total
            FROM orders o
            JOIN order_items oi ON o.amazon_order_id = oi.amazon_order_id
            ${whereClause}
        `;
        const [countRows] = await pool.query(countSql, params);
        const totalSize = countRows[0].total || 0;

        // 7. Format Rows
        const formattedRows = rows.map(r => ({
            asin: r.asin,
            parentAsin: r.asin, // Placeholder
            msku: r.msku,
            sku: r.msku,
            title: r.title,
            imageUrl: r.image_url,
            shopName: r.shopName,
            marketplaceId: r.marketplaceId,
            productNum: r.totalProductNum,
            orderNum: r.totalOrderNum,
            salePrice: r.totalSalePrice,
            productSaleDayOpenVo: r.dailyData
        }));

        res.json({
            code: 0,
            msg: 'success',
            data: {
                rows: formattedRows,
                totalSize: totalSize
            }
        });

    } catch (e) {
        console.error("Sales Stat Error:", e);
        res.status(500).json({ code: -1, msg: e.message });
    }
};
