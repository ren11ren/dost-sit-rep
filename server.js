const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const pool = require('./lib/db');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5010;
const allowDegradedDatabaseMode = process.env.ALLOW_DEGRADED_DB_MODE !== 'false';
let databaseReady = false;
let databaseError = null;
let useFallbackData = false;

const allowedOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

const fallbackStoreFile = process.env.FALLBACK_STORE_PATH || path.join(__dirname, 'data', 'fallback-store.json');

const ensureFallbackStoreFile = (filePath = fallbackStoreFile) => {
    try {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
    } catch (error) {
        console.warn('Unable to create fallback store directory:', error.message);
    }
};

const readFallbackStore = (filePath = fallbackStoreFile) => {
    try {
        if (!fs.existsSync(filePath)) return null;
        const raw = fs.readFileSync(filePath, 'utf8');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
        console.warn('Unable to read fallback store:', error.message);
        return null;
    }
};

const persistFallbackStore = (store, filePath = fallbackStoreFile) => {
    try {
        ensureFallbackStoreFile(filePath);
        fs.writeFileSync(filePath, JSON.stringify(store, null, 2));
    } catch (error) {
        console.warn('Unable to persist fallback store:', error.message);
    }
};

const createPersistedProxy = (value, filePath, onChange) => {
    if (Array.isArray(value)) {
        return new Proxy(value, {
            get(target, prop, receiver) {
                const item = target[prop];
                if (['push', 'pop', 'splice', 'sort', 'reverse', 'shift', 'unshift'].includes(prop)) {
                    return (...args) => {
                        const result = target[prop](...args);
                        onChange();
                        return result;
                    };
                }
                if (item && typeof item === 'object') {
                    return createPersistedProxy(item, filePath, onChange);
                }
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, newValue) {
                target[prop] = newValue && typeof newValue === 'object'
                    ? createPersistedProxy(newValue, filePath, onChange)
                    : newValue;
                onChange();
                return true;
            }
        });
    }

    if (value && typeof value === 'object') {
        return new Proxy(value, {
            get(target, prop, receiver) {
                const item = target[prop];
                if (item && typeof item === 'object') {
                    return createPersistedProxy(item, filePath, onChange);
                }
                return Reflect.get(target, prop, receiver);
            },
            set(target, prop, newValue) {
                target[prop] = newValue && typeof newValue === 'object'
                    ? createPersistedProxy(newValue, filePath, onChange)
                    : newValue;
                onChange();
                return true;
            }
        });
    }

    return value;
};

const createFallbackStore = (options = {}) => {
    const now = new Date().toISOString();
    const persistedFile = options.persistToFile || fallbackStoreFile;
    const existingStore = readFallbackStore(persistedFile);
    const baseStore = existingStore || {
        offices: [],
        events: [],
        users: [{
            id: 1,
            name: 'Admin User',
            email: 'admin@dostregion1.ph',
            office: 'PSTO-La Union',
            role: 'SADMIN',
            status: 'Active',
            password_hash: 'admin123',
            profile_image: null,
            created_at: now,
            updated_at: now
        }],
        pendingReports: [],
        notifications: [],
        settings: [{ setting_key: 'active_menu', setting_value: JSON.stringify('dashboard') }],
        typhoonHistory: []
    };

    const proxyStore = createPersistedProxy(baseStore, persistedFile, () => persistFallbackStore(baseStore, persistedFile));
    persistFallbackStore(baseStore, persistedFile);
    return proxyStore;
};

const loadFallbackStore = (filePath = fallbackStoreFile) => {
    const readStore = readFallbackStore(filePath);
    if (!readStore) {
        return createFallbackStore({ persistToFile: filePath });
    }
    return createPersistedProxy(readStore, filePath, () => persistFallbackStore(readStore, filePath));
};

const fallbackStore = createFallbackStore();

const parseFallbackValue = (value) => {
    if (typeof value !== 'string') return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const serializeFallbackValue = (value) => {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
};

const normalizeSql = (sql) => (sql || '').replace(/\s+/g, ' ').trim();

// Default office data to seed into the database
const DEFAULT_OFFICE_DATA = {
    'PSTO-Ilocos Norte': {
        warning_signals: {},
        general_weather: '',
        related_incidents: 0,
        casualties: 0,
        power_status: '',
        communication_lines: '',
        damage_facilities: '',
        work_suspension: false,
        assistance_provided: '',
        remark: '',
        remark_related_incidents: '',
        remark_casualties: '',
        remark_power_status: '',
        remark_communication_lines: '',
        remark_damage_facilities: '',
        remark_work_suspension: '',
        remark_assistance_provided: '',
        imageUrl: '',
        municipalities: ['Laoag City', 'Batac City', 'Pagudpud'],
        damage_details: [],
        equipment_details: [],
        affected_staff: []
    },
    'PSTO-Ilocos Sur': {
        warning_signals: {},
        general_weather: '',
        related_incidents: 0,
        casualties: 0,
        power_status: '',
        communication_lines: '',
        damage_facilities: '',
        work_suspension: false,
        assistance_provided: '',
        remark: '',
        remark_related_incidents: '',
        remark_casualties: '',
        remark_power_status: '',
        remark_communication_lines: '',
        remark_damage_facilities: '',
        remark_work_suspension: '',
        remark_assistance_provided: '',
        imageUrl: '',
        municipalities: ['Vigan City', 'Candon City', 'Santa Maria'],
        damage_details: [],
        equipment_details: [],
        affected_staff: []
    },
    'PSTO-La Union': {
        warning_signals: {},
        general_weather: '',
        related_incidents: 0,
        casualties: 0,
        power_status: '',
        communication_lines: '',
        damage_facilities: '',
        work_suspension: false,
        assistance_provided: '',
        remark: '',
        remark_related_incidents: '',
        remark_casualties: '',
        remark_power_status: '',
        remark_communication_lines: '',
        remark_damage_facilities: '',
        remark_work_suspension: '',
        remark_assistance_provided: '',
        imageUrl: '',
        municipalities: ['San Fernando', 'Bauang', 'Agoo', 'Luna', 'Bacnotan', 'Bangar', 'San Juan'],
        damage_details: [],
        equipment_details: [],
        affected_staff: []
    },
    'PSTO-Pangasinan': {
        warning_signals: {},
        general_weather: '',
        related_incidents: 0,
        casualties: 0,
        power_status: '',
        communication_lines: '',
        damage_facilities: '',
        work_suspension: false,
        assistance_provided: '',
        remark: '',
        remark_related_incidents: '',
        remark_casualties: '',
        remark_power_status: '',
        remark_communication_lines: '',
        remark_damage_facilities: '',
        remark_work_suspension: '',
        remark_assistance_provided: '',
        imageUrl: '',
        municipalities: ['Lingayen', 'Dagupan', 'Alaminos'],
        damage_details: [],
        equipment_details: [],
        affected_staff: []
    },
    'PSTO-Ilocos Sur - FO': {
        warning_signals: {},
        general_weather: '',
        related_incidents: 0,
        casualties: 0,
        power_status: '',
        communication_lines: '',
        damage_facilities: '',
        work_suspension: false,
        assistance_provided: '',
        remark: '',
        remark_related_incidents: '',
        remark_casualties: '',
        remark_power_status: '',
        remark_communication_lines: '',
        remark_damage_facilities: '',
        remark_work_suspension: '',
        remark_assistance_provided: '',
        imageUrl: '',
        municipalities: ['Vigan City', 'Candon City', 'Santa Maria'],
        damage_details: [],
        equipment_details: [],
        affected_staff: []
    },
    'PSTO-Pangasinan - FO': {
        warning_signals: {},
        general_weather: '',
        related_incidents: 0,
        casualties: 0,
        power_status: '',
        communication_lines: '',
        damage_facilities: '',
        work_suspension: false,
        assistance_provided: '',
        remark: '',
        remark_related_incidents: '',
        remark_casualties: '',
        remark_power_status: '',
        remark_communication_lines: '',
        remark_damage_facilities: '',
        remark_work_suspension: '',
        remark_assistance_provided: '',
        imageUrl: '',
        municipalities: ['Lingayen', 'Dagupan', 'Alaminos'],
        damage_details: [],
        equipment_details: [],
        affected_staff: []
    },
};

const getFallbackTableRows = (tableName) => {
    switch (tableName) {
        case 'offices': return fallbackStore.offices;
        case 'events': return fallbackStore.events;
        case 'users': return fallbackStore.users;
        case 'pending_reports': return fallbackStore.pendingReports;
        case 'notifications': return fallbackStore.notifications;
        case 'settings': return fallbackStore.settings;
        case 'typhoon_history': return fallbackStore.typhoonHistory;
        default: return [];
    }
};

const setFallbackTableRows = (tableName, rows) => {
    switch (tableName) {
        case 'offices': fallbackStore.offices = rows; break;
        case 'events': fallbackStore.events = rows; break;
        case 'users': fallbackStore.users = rows; break;
        case 'pending_reports': fallbackStore.pendingReports = rows; break;
        case 'notifications': fallbackStore.notifications = rows; break;
        case 'settings': fallbackStore.settings = rows; break;
        case 'typhoon_history': fallbackStore.typhoonHistory = rows; break;
        default: break;
    }
    persistFallbackStore(fallbackStore);
};

const fallbackQuery = async (sql, params = []) => {
    const normalizedSql = normalizeSql(sql);

    if (/^CREATE TABLE/i.test(normalizedSql)) {
        return { rows: [] };
    }

    if (/^SELECT\s+COUNT\(\*\)\s+AS\s+cnt/i.test(normalizedSql)) {
        const tableMatch = normalizedSql.match(/FROM\s+([a-z_]+)/i);
        const tableName = tableMatch?.[1];
        const rows = getFallbackTableRows(tableName || '');
        return { rows: [{ cnt: rows.length }] };
    }

    if (/^SELECT/i.test(normalizedSql)) {
        const tableMatch = normalizedSql.match(/FROM\s+([a-z_]+)/i);
        const tableName = tableMatch?.[1];
        return { rows: getFallbackTableRows(tableName || '') };
    }

    if (/^INSERT\s+INTO/i.test(normalizedSql)) {
        const tableMatch = normalizedSql.match(/INTO\s+([a-z_]+)/i);
        const tableName = tableMatch?.[1];
        const columnMatch = normalizedSql.match(/\(([^)]+)\)\s+VALUES/i);
        const columns = columnMatch?.[1]
            ?.split(',')
            .map((column) => column.trim().replace(/^"|"$/g, '')) || [];

        const values = Array.isArray(params) ? params : [];
        const row = {};

        columns.forEach((column, index) => {
            row[column] = parseFallbackValue(values[index]);
        });

        if (tableName === 'offices') {
            const existingIndex = fallbackStore.offices.findIndex((item) => item.office_name === row.office_name);
            const nextId = fallbackStore.offices.length + 1;
            row.id = row.id || nextId;
            if (existingIndex >= 0) {
                fallbackStore.offices[existingIndex] = row;
            } else {
                fallbackStore.offices.push(row);
            }
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        if (tableName === 'events') {
            const nextId = fallbackStore.events.length + 1;
            row.id = row.id || nextId;
            fallbackStore.events.push(row);
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        if (tableName === 'users') {
            const nextId = fallbackStore.users.length + 1;
            row.id = row.id || nextId;
            fallbackStore.users.push(row);
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        if (tableName === 'pending_reports') {
            const nextId = fallbackStore.pendingReports.length + 1;
            row.id = row.id || nextId;
            fallbackStore.pendingReports.push(row);
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        if (tableName === 'notifications') {
            const nextId = fallbackStore.notifications.length + 1;
            row.id = row.id || nextId;
            fallbackStore.notifications.push(row);
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        if (tableName === 'settings') {
            const existingIndex = fallbackStore.settings.findIndex((item) => item.setting_key === row.setting_key);
            if (existingIndex >= 0) {
                fallbackStore.settings[existingIndex] = row;
            } else {
                fallbackStore.settings.push(row);
            }
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        if (tableName === 'typhoon_history') {
            const nextId = fallbackStore.typhoonHistory.length + 1;
            row.id = row.id || nextId;
            fallbackStore.typhoonHistory.push(row);
            persistFallbackStore(fallbackStore);
            return { rows: [row] };
        }

        return { rows: [] };
    }

    if (/^UPDATE/i.test(normalizedSql)) {
        const tableMatch = normalizedSql.match(/UPDATE\s+([a-z_]+)/i);
        const tableName = tableMatch?.[1];

        if (tableName === 'notifications') {
            const id = params[0];
            const target = fallbackStore.notifications.find((item) => item.id === Number(id));
            if (target) {
                target.read = true;
            }
            persistFallbackStore(fallbackStore);
        }

        if (tableName === 'users') {
            const id = params[params.length - 1];
            const target = fallbackStore.users.find((item) => item.id === Number(id));
            if (target) {
                target.name = params[0];
                target.email = params[1];
                target.office = params[2];
                target.role = params[3];
                target.status = params[4];
                target.profile_image = params[5] || null;
            }
            persistFallbackStore(fallbackStore);
        }

        return { rows: [] };
    }

    if (/^DELETE/i.test(normalizedSql)) {
        const tableMatch = normalizedSql.match(/FROM\s+([a-z_]+)/i);
        const tableName = tableMatch?.[1];
        if (tableName === 'offices') {
            setFallbackTableRows('offices', []);
        }
        if (tableName === 'events') {
            setFallbackTableRows('events', []);
        }
        if (tableName === 'users') {
            setFallbackTableRows('users', []);
        }
        if (tableName === 'pending_reports') {
            setFallbackTableRows('pending_reports', []);
        }
        if (tableName === 'notifications') {
            setFallbackTableRows('notifications', []);
        }
        if (tableName === 'typhoon_history') {
            setFallbackTableRows('typhoon_history', []);
        }
        return { rows: [] };
    }

    return { rows: [] };
};

app.use(cors({
    origin: (origin, callback) => {
        // Allow non-browser clients or same-origin requests with no Origin header.
        if (!origin) return callback(null, true);
        if (allowedOriginRegex.test(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const waitForDatabase = async () => {
    const maxAttempts = parseInt(process.env.DB_CONNECT_RETRIES || '5', 10);
    const delayMs = parseInt(process.env.DB_CONNECT_RETRY_DELAY_MS || '1000', 10);

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await pool.query('SELECT 1');
            databaseReady = true;
            databaseError = null;
            useFallbackData = false;
            return true;
        } catch (err) {
            databaseError = err;
            if (attempt === maxAttempts) {
                useFallbackData = allowDegradedDatabaseMode;
                return false;
            }
            console.log(`⏳ Waiting for PostgreSQL (${attempt}/${maxAttempts})... ${err.message}`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }

    return false;
};

// Converts legacy mysql-style placeholders/backticks to PostgreSQL format.
// Converts legacy mysql-style placeholders/backticks to PostgreSQL format.
const toPgSql = (sql) => {
    let idx = 0;
    return sql
        .replace(/`([^`]+)`/g, '"$1"')
        .replace(/\?/g, () => `$${++idx}`);
};

// Wraps the pool to support fallback mode and execute() interface
const dbAdapter = {
    async query(sql, params = []) {
        if (!databaseReady && useFallbackData) {
            return fallbackQuery(sql, params);
        }
        if (!databaseReady) {
            if (/^\s*select/i.test(sql)) {
                return { rows: [] };
            }
            return { rows: [], rowCount: 0 };
        }
        return pool.query(toPgSql(sql), params);
    },
    async execute(sql, params = []) {
        if (!databaseReady && useFallbackData) {
            const result = await fallbackQuery(sql, params);
            return [result.rows];
        }
        if (!databaseReady) {
            return [[]];
        }
        const result = await pool.query(toPgSql(sql), params);
        return [result.rows];
    },
    async getConnection() {
        if (!databaseReady && useFallbackData) {
            return {
                async execute(sql, params = []) {
                    const result = await fallbackQuery(sql, params);
                    return [result.rows];
                },
                async beginTransaction() { },
                async commit() { },
                async rollback() { },
                release() { }
            };
        }

        if (!databaseReady) {
            return {
                async execute() {
                    return [[]];
                },
                async beginTransaction() { },
                async commit() { },
                async rollback() { },
                release() { }
            };
        }

        const client = await pool.connect();
        return {
            async execute(sql, params = []) {
                const result = await client.query(toPgSql(sql), params);
                return [result.rows];
            },
            async beginTransaction() {
                await client.query('BEGIN');
            },
            async commit() {
                await client.query('COMMIT');
            },
            async rollback() {
                await client.query('ROLLBACK');
            },
            release() {
                client.release();
            }
        };
    }
};

// Helper: run a query and return rows
const query = async (sql, params = []) => {
    const result = await dbAdapter.query(sql, params);
    return result.rows;
};

const initializeDatabase = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS offices (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                office_name VARCHAR(255) UNIQUE NOT NULL,
                data JSONB,
                image_url TEXT,
                municipalities JSONB,
                damage_details JSONB,
                affected_staff JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Offices table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS events (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                event_data JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                deployment VARCHAR(50) DEFAULT 'Draft',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Events table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                office VARCHAR(255),
                role VARCHAR(50) DEFAULT 'USER',
                status VARCHAR(50) DEFAULT 'Active',
                password_hash TEXT NOT NULL,
                profile_image TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Users table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS pending_reports (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                office VARCHAR(255) NOT NULL,
                submitted_by VARCHAR(255),
                report_data JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                remarks TEXT,
                submitted_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Pending reports table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info',
                "read" BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Notifications table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                setting_key VARCHAR(255) UNIQUE NOT NULL,
                setting_value JSONB,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Settings table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS typhoon_history (
                id INTEGER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
                event_id VARCHAR(255),
                event_data JSONB NOT NULL,
                archived_at TIMESTAMPTZ DEFAULT NOW(),
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        console.log('✅ Typhoon history table ready');

        await query(`
            INSERT INTO users (name, email, office, role, status, password_hash)
            VALUES ('Admin User', 'admin@dostregion1.ph', 'PSTO-La Union', 'SADMIN', 'Active', 'admin123')
            ON CONFLICT (email) DO NOTHING
        `);
        console.log('✅ Default admin user ready');

        // Seed default office data
        const existingCount = await query('SELECT COUNT(*) AS cnt FROM offices');
        if (existingCount[0]?.cnt === 0) {
            for (const [officeName, officeData] of Object.entries(DEFAULT_OFFICE_DATA)) {
                await query(
                    `INSERT INTO offices (office_name, data, municipalities, damage_details, affected_staff)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (office_name) DO NOTHING`,
                    [
                        officeName,
                        JSON.stringify(officeData),
                        JSON.stringify(officeData.municipalities || []),
                        JSON.stringify(officeData.damage_details || []),
                        JSON.stringify(officeData.affected_staff || [])
                    ]
                );
            }
            console.log('✅ Default office data seeded');
        } else {
            console.log('ℹ️ Office data already exists, skipping seed');
        }
        console.log('');
        console.log('🎉 PostgreSQL setup complete! Your database is ready.');
    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
    }
};

if (require.main === module) {
    (async () => {
        try {
            const connected = await waitForDatabase();
            if (connected) {
                console.log('✅ Connected to PostgreSQL successfully!');
                await initializeDatabase();
                return;
            }

            if (allowDegradedDatabaseMode) {
                console.warn('⚠️ PostgreSQL unavailable; continuing in degraded mode with built-in fallback data.');
                return;
            }

            throw databaseError || new Error('Database connection failed');
        } catch (err) {
            console.error('❌ Database connection error:', err.message);
            console.log('⚠️  Check your .env DB credentials and database availability.');
        }
    })();
}

// ==================== API ROUTES ====================

app.get('/api/offices', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM offices ORDER BY id');
        const offices = {};
        rows.forEach(row => {
            const data = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
            offices[row.office_name] = {
                ...data,
                imageUrl: row.image_url,
                municipalities: typeof row.municipalities === 'string' ? JSON.parse(row.municipalities) : (row.municipalities || []),
                damage_details: typeof row.damage_details === 'string' ? JSON.parse(row.damage_details) : (row.damage_details || []),
                affected_staff: typeof row.affected_staff === 'string' ? JSON.parse(row.affected_staff) : (row.affected_staff || [])
            };
        });
        res.json(offices);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch offices' });
    }
});

app.post('/api/offices', async (req, res) => {
    const { officeName, data } = req.body;
    try {
        const { imageUrl, municipalities, damage_details, affected_staff, ...officeData } = data;
        await query(`
            INSERT INTO offices (office_name, data, image_url, municipalities, damage_details, affected_staff)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (office_name) DO UPDATE SET
                data = EXCLUDED.data,
                image_url = EXCLUDED.image_url,
                municipalities = EXCLUDED.municipalities,
                damage_details = EXCLUDED.damage_details,
                affected_staff = EXCLUDED.affected_staff
        `, [officeName, JSON.stringify(officeData), imageUrl || null,
            JSON.stringify(municipalities || []), JSON.stringify(damage_details || []), JSON.stringify(affected_staff || [])]);
        res.json({ success: true, message: 'Office saved' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save office' });
    }
});

app.get('/api/events', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM events ORDER BY created_at DESC');
        const events = rows.map(row => {
            const eventData = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : (row.event_data || {});
            return { id: row.id, ...eventData, status: row.status, deployment: row.deployment };
        });
        res.json(events);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

app.post('/api/events', async (req, res) => {
    const { eventData, status, deployment } = req.body;
    try {
        if (eventData.id) {
            await query('UPDATE events SET event_data = ?, status = ?, deployment = ? WHERE id = ?',
                [JSON.stringify(eventData), status || 'pending', deployment || 'Draft', eventData.id]);
        } else {
            const rows = await query(
                'INSERT INTO events (event_data, status, deployment) VALUES (?, ?, ?) RETURNING id',
                [JSON.stringify(eventData), status || 'pending', deployment || 'Draft']
            );
            eventData.id = rows?.[0]?.id;
        }
        res.json({ success: true, message: 'Event saved', event: eventData });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save event' });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        await query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const rows = await query('SELECT id, name, email, office, role, status, profile_image, created_at FROM users ORDER BY id');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.post('/api/users', async (req, res) => {
    const { userData } = req.body;
    try {
        if (userData.id) {
            await query('UPDATE users SET name = ?, email = ?, office = ?, role = ?, status = ?, profile_image = ? WHERE id = ?',
                [userData.name, userData.email, userData.office, userData.role, userData.status, userData.profileImage || null, userData.id]);
        } else {
            await query('INSERT INTO users (name, email, office, role, status, password_hash, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userData.name, userData.email, userData.office, userData.role, userData.status, userData.password || '', userData.profileImage || null]);
        }
        res.json({ success: true, message: 'User saved' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.get('/api/pending-reports', async (req, res) => {
    try {
        const rows = await query("SELECT * FROM pending_reports WHERE status = 'pending' ORDER BY submitted_at DESC");
        const reports = rows.map(row => ({
            ...row,
            data: typeof row.report_data === 'string' ? JSON.parse(row.report_data) : (row.report_data || {})
        }));
        res.json(reports);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending reports' });
    }
});

app.post('/api/pending-reports', async (req, res) => {
    const { report } = req.body;
    try {
        const rows = await query(
            'INSERT INTO pending_reports (office, submitted_by, report_data, status, submitted_at) VALUES (?, ?, ?, ?, ?) RETURNING id',
            [report.office, report.submittedBy, JSON.stringify(report.data), report.status || 'pending', report.submittedAt || new Date().toISOString()]
        );
        res.json({ success: true, message: 'Report submitted', id: rows?.[0]?.id });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

app.put('/api/pending-reports/:id', async (req, res) => {
    const { status, remarks } = req.body;
    try {
        await query('UPDATE pending_reports SET status = ?, remarks = ? WHERE id = ?', [status, remarks, req.params.id]);
        res.json({ success: true, message: 'Report updated' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to update report' });
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        res.json(rows);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.post('/api/notifications', async (req, res) => {
    const { title, message, type } = req.body;
    try {
        const rows = await query('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?) RETURNING id',
            [title, message, type || 'info']);
        res.json({ success: true, message: 'Notification created', id: rows?.[0]?.id });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    try {
        await query('UPDATE notifications SET `read` = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

app.delete('/api/notifications', async (req, res) => {
    try {
        await query('DELETE FROM notifications');
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

app.get('/api/settings', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM settings');
        const settings = {};
        rows.forEach(row => {
            settings[row.setting_key] = typeof row.setting_value === 'string' ? JSON.parse(row.setting_value) : row.setting_value;
        });
        res.json(settings);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/settings', async (req, res) => {
    const { settings } = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            await query(`
                INSERT INTO settings (setting_key, setting_value)
                VALUES (?, ?)
                ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
            `, [key, JSON.stringify(value)]);
        }
        res.json({ success: true, message: 'Settings saved' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

app.get('/api/active-menu', async (req, res) => {
    try {
        const rows = await query('SELECT setting_value FROM settings WHERE setting_key = ?', ['active_menu']);
        let menu = 'dashboard';
        if (rows.length > 0) {
            const val = rows[0].setting_value;
            if (typeof val === 'string') {
                try {
                    menu = JSON.parse(val);
                } catch {
                    menu = val;
                }
            } else if (val && typeof val === 'object' && val.menu) {
                menu = val.menu;
            } else if (val) {
                menu = val;
            }
        }
        res.json({ menu });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch active menu' });
    }
});

app.post('/api/active-menu', async (req, res) => {
    const { menu } = req.body;
    try {
        await query(`
            INSERT INTO settings (setting_key, setting_value)
            VALUES (?, ?)
            ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
        `, ['active_menu', JSON.stringify(menu || 'dashboard')]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save active menu' });
    }
});

app.post('/api/sync-all', async (req, res) => {
    const { officesData, events, users, pendingReports, notifications, activeMenu, allowEmptySync } = req.body || {};
    const conn = await dbAdapter.getConnection();
    try {
        const incomingOfficeCount = officesData && typeof officesData === 'object' ? Object.keys(officesData).length : 0;
        const incomingEventCount = Array.isArray(events) ? events.length : 0;
        const incomingUserCount = Array.isArray(users) ? users.length : 0;
        const incomingReportCount = Array.isArray(pendingReports) ? pendingReports.length : 0;
        const incomingNotifCount = Array.isArray(notifications) ? notifications.length : 0;
        const incomingTotal = incomingOfficeCount + incomingEventCount + incomingUserCount + incomingReportCount + incomingNotifCount;

        const [existingOfficeRows] = await conn.execute('SELECT COUNT(*) AS cnt FROM offices');
        const [existingEventRows] = await conn.execute('SELECT COUNT(*) AS cnt FROM events');
        const [existingUserRows] = await conn.execute('SELECT COUNT(*) AS cnt FROM users');
        const [existingReportRows] = await conn.execute('SELECT COUNT(*) AS cnt FROM pending_reports');
        const [existingNotifRows] = await conn.execute('SELECT COUNT(*) AS cnt FROM notifications');
        const existingTotal =
            Number(existingOfficeRows?.[0]?.cnt || 0) +
            Number(existingEventRows?.[0]?.cnt || 0) +
            Number(existingUserRows?.[0]?.cnt || 0) +
            Number(existingReportRows?.[0]?.cnt || 0) +
            Number(existingNotifRows?.[0]?.cnt || 0);

        if (!allowEmptySync && existingTotal > 0 && incomingTotal === 0) {
            return res.status(409).json({
                error: 'Safety lock: empty sync payload blocked to prevent data loss',
                existingTotal,
                incomingTotal
            });
        }

        await conn.beginTransaction();

        if (officesData && typeof officesData === 'object') {
            await conn.execute('DELETE FROM offices');
            for (const [officeName, data] of Object.entries(officesData)) {
                const { imageUrl, municipalities, damage_details, affected_staff, ...officeData } = data || {};
                await conn.execute(
                    `INSERT INTO offices (office_name, data, image_url, municipalities, damage_details, affected_staff)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        officeName,
                        JSON.stringify(officeData || {}),
                        imageUrl || null,
                        JSON.stringify(municipalities || []),
                        JSON.stringify(damage_details || []),
                        JSON.stringify(affected_staff || [])
                    ]
                );
            }
        }

        if (Array.isArray(events)) {
            await conn.execute('DELETE FROM events');
            for (const ev of events) {
                const eventCopy = { ...(ev || {}) };
                const evStatus = eventCopy.status || 'pending';
                const evDeployment = eventCopy.deployment || 'Draft';
                delete eventCopy.status;
                delete eventCopy.deployment;
                await conn.execute(
                    'INSERT INTO events (event_data, status, deployment) VALUES (?, ?, ?)',
                    [JSON.stringify(eventCopy), evStatus, evDeployment]
                );
            }
        }

        if (Array.isArray(users)) {
            await conn.execute('DELETE FROM users');
            for (const u of users) {
                await conn.execute(
                    `INSERT INTO users (name, email, office, role, status, password_hash, profile_image)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        u?.name || 'User',
                        u?.email || `${Date.now()}@example.local`,
                        u?.office || null,
                        u?.role || 'USER',
                        u?.status || 'Active',
                        u?.password || u?.password_hash || '',
                        u?.profileImage || u?.profile_image || null
                    ]
                );
            }
        }

        if (Array.isArray(pendingReports)) {
            await conn.execute('DELETE FROM pending_reports');
            for (const r of pendingReports) {
                await conn.execute(
                    `INSERT INTO pending_reports (office, submitted_by, report_data, status, remarks, submitted_at)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        r?.office || '',
                        r?.submittedBy || r?.submitted_by || null,
                        JSON.stringify(r?.data || r?.report_data || {}),
                        r?.status || 'pending',
                        r?.remarks || null,
                        r?.submittedAt || r?.submitted_at || new Date().toISOString()
                    ]
                );
            }
        }

        if (Array.isArray(notifications)) {
            await conn.execute('DELETE FROM notifications');
            for (const n of notifications) {
                await conn.execute(
                    `INSERT INTO notifications (title, message, type, \`read\`, created_at)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        n?.title || 'Notification',
                        n?.message || '',
                        n?.type || 'info',
                        n?.read ? 1 : 0,
                        n?.timestamp || n?.created_at || new Date().toISOString()
                    ]
                );
            }
        }

        if (activeMenu) {
            await conn.execute(
                `INSERT INTO settings (setting_key, setting_value)
                 VALUES (?, ?)
                 ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
                ['active_menu', JSON.stringify(activeMenu)]
            );
        }

        // Save typhoon history
        const { typhoonHistory } = req.body || {};
        if (Array.isArray(typhoonHistory)) {
            await conn.execute('DELETE FROM typhoon_history');
            for (const entry of typhoonHistory) {
                const entryCopy = { ...(entry || {}) };
                const eventId = entryCopy.id ? String(entryCopy.id) : null;
                await conn.execute(
                    'INSERT INTO typhoon_history (event_id, event_data, archived_at) VALUES (?, ?, ?)',
                    [
                        eventId,
                        JSON.stringify(entryCopy),
                        entryCopy.archivedAt ? new Date(entryCopy.archivedAt).toISOString() : new Date().toISOString()
                    ]
                );
            }
        }

        await conn.commit();
        // Echo _localTs back so the frontend can detect stale remote overwrites
        res.json({ success: true, _localTs: req.body?._localTs || null });
    } catch (err) {
        await conn.rollback();
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to sync all data' });
    } finally {
        conn.release();
    }
});

app.get('/api/typhoon-history', async (req, res) => {
    try {
        const rows = await query('SELECT * FROM typhoon_history ORDER BY archived_at DESC');
        const history = rows.map(row => {
            const data = typeof row.event_data === 'string' ? JSON.parse(row.event_data) : (row.event_data || {});
            return data;
        });
        res.json(history);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch typhoon history' });
    }
});

app.post('/api/typhoon-history', async (req, res) => {
    const history = req.body;
    if (!Array.isArray(history)) return res.status(400).json({ error: 'Expected an array' });
    try {
        await query('DELETE FROM typhoon_history');
        for (const entry of history) {
            const eventId = entry.id ? String(entry.id) : null;
            await query(
                'INSERT INTO typhoon_history (event_id, event_data, archived_at) VALUES (?, ?, ?)',
                [
                    eventId,
                    JSON.stringify(entry),
                    entry.archivedAt ? new Date(entry.archivedAt).toISOString() : new Date().toISOString()
                ]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save typhoon history' });
    }
});

if (require.main === module) {
    app.listen(port, () => {
        console.log('');
        console.log('🚀 Server running on port ' + port);
        console.log('📊 API available at http://localhost:' + port + '/api');
        console.log('📦 Connecting to PostgreSQL...');
        console.log('');
    });
}

module.exports = { app, createFallbackStore, loadFallbackStore, persistFallbackStore };
