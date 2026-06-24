const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 5001;

app.use(cors({
    origin: 'http://localhost:5006',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Your Neon.tech connection string
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:npg_PWXMnZiOo74U@ep-silent-violet-aoe1t4uj-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Neon connection error:', err.message);
        console.log('');
        console.log('⚠️ Please check:');
        console.log('1. Your internet connection');
        console.log('2. The connection string is correct');
        console.log('3. Neon project is active');
    } else {
        console.log('✅ Connected to Neon.tech successfully!');
        release();
        initializeDatabase();
    }
});

const initializeDatabase = async () => {
    try {
        // Offices table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS offices (
                id SERIAL PRIMARY KEY,
                office_name VARCHAR(255) UNIQUE NOT NULL,
                data JSONB DEFAULT '{}'::jsonb,
                image_url TEXT,
                municipalities TEXT[],
                damage_details JSONB DEFAULT '[]'::jsonb,
                affected_staff JSONB DEFAULT '[]'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Offices table ready');

        // Events table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                event_data JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                deployment VARCHAR(50) DEFAULT 'Draft',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Events table ready');

        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                office VARCHAR(255),
                role VARCHAR(50) DEFAULT 'USER',
                status VARCHAR(50) DEFAULT 'Active',
                password_hash TEXT NOT NULL,
                profile_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table ready');

        // Pending reports table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS pending_reports (
                id SERIAL PRIMARY KEY,
                office VARCHAR(255) NOT NULL,
                submitted_by VARCHAR(255),
                report_data JSONB NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                remarks TEXT,
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Pending reports table ready');

        // Notifications table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info',
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Notifications table ready');

        // Settings table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS settings (
                id SERIAL PRIMARY KEY,
                setting_key VARCHAR(255) UNIQUE NOT NULL,
                setting_value JSONB,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Settings table ready');

        console.log('✅ All tables created successfully!');

        // Insert default admin user
        await pool.query(`
            INSERT INTO users (name, email, office, role, status, password_hash)
            SELECT 'Admin User', 'admin@dostregion1.ph', 'PSTO-La Union', 'SADMIN', 'Active', 'admin123'
            WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@dostregion1.ph')
        `);
        console.log('✅ Default admin user created');

        console.log('');
        console.log('🎉 Neon.tech setup complete!');
        console.log('🚀 Your database is ready.');

    } catch (err) {
        console.error('❌ Error creating tables:', err.message);
    }
};

// ==================== API ROUTES ====================

// GET all offices
app.get('/api/offices', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM offices ORDER BY id');
        const offices = {};
        result.rows.forEach(row => {
            offices[row.office_name] = {
                ...row.data,
                imageUrl: row.image_url,
                municipalities: row.municipalities || [],
                damage_details: row.damage_details || [],
                affected_staff: row.affected_staff || []
            };
        });
        res.json(offices);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch offices' });
    }
});

// POST save office
app.post('/api/offices', async (req, res) => {
    const { officeName, data } = req.body;
    try {
        const { imageUrl, municipalities, damage_details, affected_staff, ...officeData } = data;
        
        await pool.query(`
            INSERT INTO offices (office_name, data, image_url, municipalities, damage_details, affected_staff, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
            ON CONFLICT (office_name) DO UPDATE SET
                data = EXCLUDED.data,
                image_url = EXCLUDED.image_url,
                municipalities = EXCLUDED.municipalities,
                damage_details = EXCLUDED.damage_details,
                affected_staff = EXCLUDED.affected_staff,
                updated_at = CURRENT_TIMESTAMP
        `, [officeName, officeData, imageUrl, municipalities || [], damage_details || [], affected_staff || []]);
        
        res.json({ success: true, message: 'Office saved' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save office' });
    }
});

// GET all events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
        const events = result.rows.map(row => ({
            id: row.id,
            ...row.event_data,
            status: row.status,
            deployment: row.deployment
        }));
        res.json(events);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// POST save event
app.post('/api/events', async (req, res) => {
    const { eventData, status, deployment } = req.body;
    try {
        let result;
        if (eventData.id) {
            result = await pool.query(`
                UPDATE events 
                SET event_data = $1, status = $2, deployment = $3, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING id
            `, [eventData, status || 'pending', deployment || 'Draft', eventData.id]);
        } else {
            result = await pool.query(`
                INSERT INTO events (event_data, status, deployment)
                VALUES ($1, $2, $3)
                RETURNING id
            `, [eventData, status || 'pending', deployment || 'Draft']);
            eventData.id = result.rows[0].id;
        }
        res.json({ success: true, message: 'Event saved', event: eventData });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save event' });
    }
});

// DELETE event
app.delete('/api/events/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM events WHERE id = $1', [id]);
        res.json({ success: true, message: 'Event deleted' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// GET all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, office, role, status, profile_image, created_at FROM users ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST save user
app.post('/api/users', async (req, res) => {
    const { userData } = req.body;
    try {
        if (userData.id) {
            await pool.query(`
                UPDATE users 
                SET name = $1, email = $2, office = $3, role = $4, status = $5, 
                    profile_image = $6, updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
            `, [userData.name, userData.email, userData.office, userData.role, 
                userData.status, userData.profileImage, userData.id]);
        } else {
            await pool.query(`
                INSERT INTO users (name, email, office, role, status, password_hash, profile_image)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [userData.name, userData.email, userData.office, userData.role, 
                userData.status, userData.password, userData.profileImage]);
        }
        res.json({ success: true, message: 'User saved' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// DELETE user
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// GET pending reports
app.get('/api/pending-reports', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pending_reports WHERE status = $1 ORDER BY submitted_at DESC', ['pending']);
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch pending reports' });
    }
});

// POST submit report
app.post('/api/pending-reports', async (req, res) => {
    const { report } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO pending_reports (office, submitted_by, report_data, status, submitted_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `, [report.office, report.submittedBy, report.data, report.status || 'pending', report.submittedAt || new Date().toISOString()]);
        
        res.json({ success: true, message: 'Report submitted', id: result.rows[0].id });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// PUT update report status
app.put('/api/pending-reports/:id', async (req, res) => {
    const { id } = req.params;
    const { status, remarks } = req.body;
    try {
        await pool.query(`
            UPDATE pending_reports 
            SET status = $1, remarks = $2
            WHERE id = $3
        `, [status, remarks, id]);
        res.json({ success: true, message: 'Report updated' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to update report' });
    }
});

// GET notifications
app.get('/api/notifications', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// POST create notification
app.post('/api/notifications', async (req, res) => {
    const { title, message, type } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO notifications (title, message, type)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [title, message, type || 'info']);
        res.json({ success: true, message: 'Notification created', id: result.rows[0].id });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// PUT mark notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE notifications SET read = TRUE WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// DELETE all notifications
app.delete('/api/notifications', async (req, res) => {
    try {
        await pool.query('DELETE FROM notifications');
        res.json({ success: true, message: 'All notifications cleared' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// GET settings
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// POST save settings
app.post('/api/settings', async (req, res) => {
    const { settings } = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            await pool.query(`
                INSERT INTO settings (setting_key, setting_value, updated_at)
                VALUES ($1, $2, CURRENT_TIMESTAMP)
                ON CONFLICT (setting_key) DO UPDATE SET
                    setting_value = EXCLUDED.setting_value,
                    updated_at = CURRENT_TIMESTAMP
            `, [key, value]);
        }
        res.json({ success: true, message: 'Settings saved' });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

app.listen(port, () => {
    console.log('');
    console.log('🚀 Server running on port ' + port);
    console.log('📊 API available at http://localhost:' + port + '/api');
    console.log('📦 Connected to Neon.tech PostgreSQL');
    console.log('');
});

module.exports = app;
