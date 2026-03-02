require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'tiger_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

async function addIndexIfNotExists(connection, tableName, indexName, columnNames) {
    try {
        // Check if index exists
        const [rows] = await connection.query(`SHOW INDEX FROM ${tableName} WHERE Key_name = ?`, [indexName]);
        if (rows.length > 0) {
            console.log(`[DB Opt] Index ${indexName} already exists on ${tableName}.`);
            return;
        }

        console.log(`[DB Opt] Adding index ${indexName} to ${tableName}...`);
        await connection.query(`ALTER TABLE ${tableName} ADD INDEX ${indexName} (${columnNames})`);
        console.log(`[DB Opt] Index ${indexName} added successfully.`);
    } catch (error) {
        console.error(`[DB Opt] Error adding index ${indexName} to ${tableName}:`, error.message);
    }
}

async function optimizeDatabase(poolOrConnection) {
    let connection = poolOrConnection;
    let isLocalConnection = false;

    try {
        if (!connection) {
            connection = await mysql.createConnection(DB_CONFIG);
            isLocalConnection = true;
            console.log('[DB Opt] Connected to database.');
        }

        // Orders table indexes
        await addIndexIfNotExists(connection, 'orders', 'idx_store_date', 'store_name, purchase_date');
        await addIndexIfNotExists(connection, 'orders', 'idx_mp_date', 'marketplace_id, purchase_date');
        
        // Order Items table indexes
        await addIndexIfNotExists(connection, 'order_items', 'idx_order_items_order_id', 'amazon_order_id');
        await addIndexIfNotExists(connection, 'order_items', 'idx_order_items_asin', 'asin');
        await addIndexIfNotExists(connection, 'order_items', 'idx_order_items_sku', 'sku');

        console.log('[DB Opt] Database optimization complete.');
    } catch (error) {
        console.error('[DB Opt] Database connection failed:', error);
    } finally {
        if (isLocalConnection && connection) await connection.end();
    }
}

module.exports = optimizeDatabase;

if (require.main === module) {
    optimizeDatabase();
}
