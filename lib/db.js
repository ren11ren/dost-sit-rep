const { Pool } = require('pg');

const isLocalHost = (host) => ['localhost', '127.0.0.1', '::1'].includes(host || '');

const getPgConfig = () => {
    if (process.env.DATABASE_URL) {
        let connStr = process.env.DATABASE_URL;
        let host = null;

        try {
            const url = new URL(connStr);
            host = url.hostname;
            url.searchParams.delete('sslmode');
            connStr = url.toString();
        } catch (err) {
            host = null;
        }

        return {
            connectionString: connStr,
            ...(isLocalHost(host) ? {} : { ssl: { rejectUnauthorized: false } }),
            max: parseInt(process.env.DB_POOL_MAX || '2', 10),
            idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
            connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10),
        };
    }

    const host = process.env.DB_HOST || 'localhost';
    return {
        host,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'defaultdb',
        ...(isLocalHost(host) ? {} : { ssl: { rejectUnauthorized: false } }),
        max: parseInt(process.env.DB_POOL_MAX || '2', 10),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '2000', 10),
    };
};

const globalPool = globalThis.__PG_POOL__;
const pool = globalPool || new Pool(getPgConfig());

if (!globalPool) {
    globalThis.__PG_POOL__ = pool;
}

pool.on('error', (err) => {
    console.error('⚠️ PostgreSQL pool error:', err.message);
});

module.exports = pool;
