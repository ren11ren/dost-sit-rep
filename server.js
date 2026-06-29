const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT, 10) || 5010;

const allowedOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;

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

// MySQL / Aiven connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
});

// Helper: run a query and return rows
const query = async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
};

const initializeDatabase = async () => {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS offices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                office_name VARCHAR(255) UNIQUE NOT NULL,
                data JSON,
                image_url TEXT,
                municipalities JSON,
                damage_details JSON,
                affected_staff JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Offices table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_data JSON NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                deployment VARCHAR(50) DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Events table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                office VARCHAR(255),
                role VARCHAR(50) DEFAULT 'USER',
                status VARCHAR(50) DEFAULT 'Active',
                password_hash TEXT NOT NULL,
                profile_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS pending_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                office VARCHAR(255) NOT NULL,
                submitted_by VARCHAR(255),
                report_data JSON NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                remarks TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Pending reports table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info',
                \`read\` TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Notifications table ready');

        await query(`
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(255) UNIQUE NOT NULL,
                setting_value JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Settings table ready');

        await query(`
            INSERT IGNORE INTO users (name, email, office, role, status, password_hash)
            VALUES ('Admin User', 'admin@dostregion1.ph', 'PSTO-La Union', 'SADMIN', 'Active', 'admin123')
        `);
        console.log('✅ Default admin user ready');
        console.log('');
        console.log('🎉 MySQL setup complete! Your database is ready.');
    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
    }
};

(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Connected to MySQL (Aiven) successfully!');
        conn.release();
        await initializeDatabase();
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        console.log('⚠️  Check your .env DB credentials and Aiven firewall rules.');
    }
})();

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
            ON DUPLICATE KEY UPDATE
                data = VALUES(data),
                image_url = VALUES(image_url),
                municipalities = VALUES(municipalities),
                damage_details = VALUES(damage_details),
                affected_staff = VALUES(affected_staff)
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
            const [result] = await pool.execute(
                'INSERT INTO events (event_data, status, deployment) VALUES (?, ?, ?)',
                [JSON.stringify(eventData), status || 'pending', deployment || 'Draft']
            );
            eventData.id = result.insertId;
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
        const [result] = await pool.execute(
            'INSERT INTO pending_reports (office, submitted_by, report_data, status, submitted_at) VALUES (?, ?, ?, ?, ?)',
            [report.office, report.submittedBy, JSON.stringify(report.data), report.status || 'pending', report.submittedAt || new Date().toISOString()]
        );
        res.json({ success: true, message: 'Report submitted', id: result.insertId });
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
        const [result] = await pool.execute('INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)',
            [title, message, type || 'info']);
        res.json({ success: true, message: 'Notification created', id: result.insertId });
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
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
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
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
        `, ['active_menu', JSON.stringify(menu || 'dashboard')]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save active menu' });
    }
});

app.post('/api/sync-all', async (req, res) => {
    const { officesData, events, users, pendingReports, notifications, activeMenu, allowEmptySync } = req.body || {};
    const conn = await pool.getConnection();
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
            (existingOfficeRows?.[0]?.cnt || 0) +
            (existingEventRows?.[0]?.cnt || 0) +
            (existingUserRows?.[0]?.cnt || 0) +
            (existingReportRows?.[0]?.cnt || 0) +
            (existingNotifRows?.[0]?.cnt || 0);

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
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                ['active_menu', JSON.stringify(activeMenu)]
            );
        }

        await conn.commit();
        res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to sync all data' });
    } finally {
        conn.release();
    }
});

app.listen(port, () => {
    console.log('');
    console.log('🚀 Server running on port ' + port);
    console.log('📊 API available at http://localhost:' + port + '/api');
    console.log('📦 Connecting to MySQL (Aiven)...');
    console.log('');
});

module.exports = app;
