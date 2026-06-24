const mysql = require('mysql2');

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql-11a72ed3-rainierganaden1106-5bb8.h.aivencloud.com',
  port: parseInt(process.env.DB_PORT) || 18750,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_iAhIWlZIisjJZ9ztt9-',
  database: process.env.DB_NAME || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
  connectTimeout: 30000
});

const promisePool = pool.promise();

// Initialize database tables
const initTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS offices_data (
      id INT PRIMARY KEY AUTO_INCREMENT,
      office_name VARCHAR(255) UNIQUE NOT NULL,
      data JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS events (
      id INT PRIMARY KEY AUTO_INCREMENT,
      event_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_data JSON NOT NULL,
      email VARCHAR(255) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS pending_reports (
      id INT PRIMARY KEY AUTO_INCREMENT,
      report_data JSON NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      notification_data JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS active_menu (
      id INT PRIMARY KEY DEFAULT 1,
      menu VARCHAR(50) DEFAULT 'dashboard',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    try {
      await promisePool.query(query);
      console.log('✅ Table ready:', query.split(' ')[2]);
    } catch (err) {
      console.error('❌ Table error:', err.message);
    }
  }
};

// Database operations
const db = {
  isConnected: false,
  
  async connect() {
    try {
      await promisePool.query('SELECT 1');
      this.isConnected = true;
      await initTables();
      console.log('✅ Database connected successfully!');
      return true;
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      this.isConnected = false;
      return false;
    }
  },
  
  // Offices data
  async getOfficesData() {
    if (!this.isConnected) return null;
    try {
      const [rows] = await promisePool.query('SELECT office_name, data FROM offices_data');
      const offices = {};
      rows.forEach(row => { offices[row.office_name] = row.data; });
      return offices;
    } catch (err) {
      console.error('Error fetching offices:', err.message);
      return null;
    }
  },
  
  async saveOfficesData(officesData) {
    if (!this.isConnected) return false;
    try {
      for (const [officeName, data] of Object.entries(officesData)) {
        await promisePool.query(
          `INSERT INTO offices_data (office_name, data) VALUES (?, ?) 
           ON DUPLICATE KEY UPDATE data = VALUES(data)`,
          [officeName, JSON.stringify(data)]
        );
      }
      return true;
    } catch (err) {
      console.error('Error saving offices:', err.message);
      return false;
    }
  },
  
  // Events
  async getEvents() {
    if (!this.isConnected) return null;
    try {
      const [rows] = await promisePool.query('SELECT event_data FROM events ORDER BY id DESC');
      return rows.map(row => row.event_data);
    } catch (err) {
      console.error('Error fetching events:', err.message);
      return null;
    }
  },
  
  async saveEvents(events) {
    if (!this.isConnected) return false;
    try {
      await promisePool.query('DELETE FROM events');
      for (const event of events) {
        await promisePool.query('INSERT INTO events (event_data) VALUES (?)', [JSON.stringify(event)]);
      }
      return true;
    } catch (err) {
      console.error('Error saving events:', err.message);
      return false;
    }
  },
  
  // Users
  async getUsers() {
    if (!this.isConnected) return null;
    try {
      const [rows] = await promisePool.query('SELECT user_data FROM users');
      return rows.map(row => row.user_data);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      return null;
    }
  },
  
  async saveUsers(users) {
    if (!this.isConnected) return false;
    try {
      await promisePool.query('DELETE FROM users');
      for (const user of users) {
        await promisePool.query(
          'INSERT INTO users (user_data, email) VALUES (?, ?)',
          [JSON.stringify(user), user.email]
        );
      }
      return true;
    } catch (err) {
      console.error('Error saving users:', err.message);
      return false;
    }
  },
  
  // Pending Reports
  async getPendingReports() {
    if (!this.isConnected) return null;
    try {
      const [rows] = await promisePool.query('SELECT report_data FROM pending_reports WHERE status = "pending" ORDER BY id DESC');
      return rows.map(row => row.report_data);
    } catch (err) {
      console.error('Error fetching reports:', err.message);
      return null;
    }
  },
  
  async savePendingReports(reports) {
    if (!this.isConnected) return false;
    try {
      await promisePool.query('DELETE FROM pending_reports');
      for (const report of reports) {
        await promisePool.query(
          'INSERT INTO pending_reports (report_data, status) VALUES (?, ?)',
          [JSON.stringify(report), report.status || 'pending']
        );
      }
      return true;
    } catch (err) {
      console.error('Error saving reports:', err.message);
      return false;
    }
  },
  
  // Notifications
  async getNotifications() {
    if (!this.isConnected) return null;
    try {
      const [rows] = await promisePool.query('SELECT notification_data FROM notifications ORDER BY id DESC LIMIT 100');
      return rows.map(row => row.notification_data);
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
      return null;
    }
  },
  
  async saveNotifications(notifications) {
    if (!this.isConnected) return false;
    try {
      await promisePool.query('DELETE FROM notifications');
      for (const notif of notifications) {
        await promisePool.query('INSERT INTO notifications (notification_data) VALUES (?)', [JSON.stringify(notif)]);
      }
      return true;
    } catch (err) {
      console.error('Error saving notifications:', err.message);
      return false;
    }
  },
  
  // Active Menu
  async getActiveMenu() {
    if (!this.isConnected) return null;
    try {
      const [rows] = await promisePool.query('SELECT menu FROM active_menu WHERE id = 1');
      return rows.length > 0 ? rows[0].menu : 'dashboard';
    } catch (err) {
      console.error('Error fetching menu:', err.message);
      return null;
    }
  },
  
  async saveActiveMenu(menu) {
    if (!this.isConnected) return false;
    try {
      await promisePool.query(
        `INSERT INTO active_menu (id, menu) VALUES (1, ?) 
         ON DUPLICATE KEY UPDATE menu = VALUES(menu)`,
        [menu]
      );
      return true;
    } catch (err) {
      console.error('Error saving menu:', err.message);
      return false;
    }
  },
  
  // Sync all data
  async syncAllData(data) {
    if (!this.isConnected) return false;
    try {
      if (data.officesData) await this.saveOfficesData(data.officesData);
      if (data.events) await this.saveEvents(data.events);
      if (data.users) await this.saveUsers(data.users);
      if (data.pendingReports) await this.savePendingReports(data.pendingReports);
      if (data.notifications) await this.saveNotifications(data.notifications);
      if (data.activeMenu) await this.saveActiveMenu(data.activeMenu);
      return true;
    } catch (err) {
      console.error('Error syncing data:', err.message);
      return false;
    }
  }
};

module.exports = { db };
