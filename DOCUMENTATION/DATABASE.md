# DOST Situation Reporting System - Database Documentation

## Database Overview

The DOST system uses PostgreSQL as the primary database with JSON file-based fallback for resilience. The database schema is automatically initialized on backend startup.

---

## Database Connection

### Local Development
```bash
# PostgreSQL running locally
psql -U postgres -d dost_sitrep -h localhost
```

### Environment Variables
```bash
# Full connection string
DATABASE_URL=postgres://username:password@localhost:5432/dost_sitep

# Or individual components (backend uses these)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=dost_sitep
```

### Connection Pooling
- Backend uses connection pool (max connections: configurable)
- Prevents connection exhaustion
- Automatic reconnection on failure

---

## Schema Overview

### Tables

```
offices (Provincial office data)
├─ id (PRIMARY KEY)
├─ office_name (UNIQUE)
├─ data (JSONB - all office situation data)
├─ image_url
├─ municipalities (TEXT[])
├─ damage_details (JSONB array)
├─ affected_staff (JSONB array)
└─ timestamps (created_at, updated_at)

events (Disaster events and situations)
├─ id (PRIMARY KEY)
├─ event_data (JSONB - full event details)
├─ status (pending|active|archived)
├─ deployment (Draft|Deployed)
└─ timestamps (created_at, updated_at)

users (System users and administrators)
├─ id (PRIMARY KEY)
├─ name
├─ email (UNIQUE)
├─ office
├─ role (USER|ADMIN|SADMIN)
├─ status (Active|Inactive)
├─ password_hash
├─ profile_image
└─ timestamps (created_at, updated_at)

pending_reports (User-submitted situation reports)
├─ id (PRIMARY KEY)
├─ office
├─ submitted_by (user email)
├─ report_data (JSONB - report contents)
├─ status (pending|approved|rejected)
├─ remarks
└─ submitted_at

notifications (System notifications)
├─ id (PRIMARY KEY)
├─ title
├─ message
├─ office (target office for notification)
├─ read (boolean)
└─ created_at

archived_events (Historical event data)
├─ id (PRIMARY KEY)
├─ event_id (reference to events.id)
├─ event_data (JSONB snapshot)
├─ archived_at
└─ archived_reason
```

---

## Table Definitions

### 1. Offices Table

**SQL Definition:**
```sql
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
);
```

**Sample Record:**
```json
{
  "id": 1,
  "office_name": "DOST-Ilocos Norte",
  "data": {
    "warning_signals": {},
    "general_weather": "Partly cloudy, 28°C",
    "related_incidents": 2,
    "casualties": 0,
    "power_status": "Operational",
    "communication_lines": "Clear",
    "damage_facilities": "Minor structural damage",
    "work_suspension": false,
    "assistance_provided": "Emergency supplies",
    "remark": "Situation stabilizing",
    "damage_details": [],
    "equipment_details": [],
    "affected_staff": []
  },
  "image_url": "images/ilocos-norte.jpg",
  "municipalities": ["Laoag City", "Batac City", "Pagudpud"],
  "damage_details": [
    {
      "location": "Building A",
      "damage_type": "Roof damage",
      "cost": 50000
    }
  ],
  "affected_staff": [
    {
      "name": "Juan Dela Cruz",
      "position": "Staff Officer",
      "status": "Safe"
    }
  ],
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-07-15T14:30:00Z"
}
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_office_name ON offices(office_name);
CREATE INDEX idx_office_updated_at ON offices(updated_at);
```

---

### 2. Events Table

**SQL Definition:**
```sql
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    deployment VARCHAR(50) DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Record:**
```json
{
  "id": 1,
  "event_data": {
    "name": "Typhoon Makiling",
    "alert_level": "3",
    "general_weather": "Typhoon signal 3 raised",
    "related_incidents": 45,
    "total_casualties": 12,
    "provinces_impacted": 5,
    "office_summaries": {
      "DOST-Ilocos Norte": {
        "warning_signals": "Signal 3",
        "related_incidents": 8,
        "casualties": 2,
        "power_status": "Partial outage"
      },
      "DOST-Ilocos Sur": {
        ...
      }
    }
  },
  "status": "active",
  "deployment": "Deployed",
  "created_at": "2026-07-10T09:00:00Z",
  "updated_at": "2026-07-15T08:00:00Z"
}
```

**Indexes:**
```sql
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_deployment ON events(deployment);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
```

---

### 3. Users Table

**SQL Definition:**
```sql
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
);
```

**Sample Record:**
```json
{
  "id": 1,
  "name": "John Reyes",
  "email": "john.reyes@dost.gov.ph",
  "office": "DOST-Ilocos Norte",
  "role": "USER",
  "status": "Active",
  "password_hash": "$2b$10$...",
  "profile_image": "images/john.jpg",
  "created_at": "2026-01-01T10:00:00Z",
  "updated_at": "2026-07-15T10:00:00Z"
}
```

**Indexes:**
```sql
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_office ON users(office);
CREATE INDEX idx_role ON users(role);
```

**Role Hierarchy:**
- `USER` - View own office data, submit reports
- `ADMIN` - Manage users, view all data
- `SADMIN` - Full system access

---

### 4. Pending Reports Table

**SQL Definition:**
```sql
CREATE TABLE IF NOT EXISTS pending_reports (
    id SERIAL PRIMARY KEY,
    office VARCHAR(255) NOT NULL,
    submitted_by VARCHAR(255),
    report_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    remarks TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Record:**
```json
{
  "id": 42,
  "office": "DOST-Ilocos Norte",
  "submitted_by": "john.reyes@dost.gov.ph",
  "report_data": {
    "casualties": 5,
    "damaged_facilities": "School building roof",
    "power_status": "Partial outage",
    "assistance_needed": "Medical supplies, generators",
    "damage_cost": "50000",
    "timestamp": "2026-07-15T12:00:00Z",
    "attachments": [
      {
        "name": "damage_photo.jpg",
        "url": "uploads/photo_12345.jpg"
      }
    ]
  },
  "status": "pending",
  "remarks": "Awaiting verification",
  "submitted_at": "2026-07-15T12:00:00Z"
}
```

**Indexes:**
```sql
CREATE INDEX idx_pending_office ON pending_reports(office);
CREATE INDEX idx_pending_status ON pending_reports(status);
CREATE INDEX idx_pending_submitted_at ON pending_reports(submitted_at DESC);
```

---

### 5. Notifications Table

**SQL Definition:**
```sql
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    office VARCHAR(255),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Sample Record:**
```json
{
  "id": 1,
  "title": "New event deployment",
  "message": "Typhoon Makiling has been activated. Please submit updated office data.",
  "office": "DOST-Ilocos Norte",
  "read": false,
  "created_at": "2026-07-15T10:00:00Z"
}
```

**Indexes:**
```sql
CREATE INDEX idx_notification_office ON notifications(office);
CREATE INDEX idx_notification_read ON notifications(read);
CREATE INDEX idx_notification_created_at ON notifications(created_at DESC);
```

---

### 6. Archived Events Table

**SQL Definition:**
```sql
CREATE TABLE IF NOT EXISTS archived_events (
    id SERIAL PRIMARY KEY,
    event_id INTEGER,
    event_data JSONB NOT NULL,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_reason VARCHAR(255)
);
```

**Sample Record:**
```json
{
  "id": 1,
  "event_id": 1,
  "event_data": {
    "name": "Typhoon Makiling",
    "status": "archived",
    "final_summary": {
      "total_provinces": 5,
      "total_casualties": 12,
      "total_damage": "5000000 PHP",
      "duration": "5 days"
    }
  },
  "archived_at": "2026-07-15T08:00:00Z",
  "archived_reason": "New event deployed"
}
```

---

## Data Relationships

```
┌─────────────────────────────────────────┐
│ Offices                                 │
│ ─ Office-specific situation data        │
│ ─ Real-time updates from field teams    │
└─────────────────────────────────────────┘
           ▲                    │
           │                    │ updated during
           │                    ▼
    ┌──────────────────────────────────┐
    │ Events                           │
    │ ─ Active disaster event          │
    │ ─ Contains office summaries      │
    │ ─ Status & deployment info       │
    └──────────────────────────────────┘
           │                    │
      contains            triggers
           │                    │
           ▼                    ▼
    ┌──────────────────────────────────┐
    │ Archived Events                  │
    │ ─ Historical records             │
    │ ─ Audit trail                    │
    └──────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Users                                   │
│ ─ System access control                 │
│ ─ Role-based permissions                │
└─────────────────────────────────────────┘
      │               │
  submits        manages
      │               │
      ▼               ▼
┌──────────────────────────────────┐
│ Pending Reports                  │
│ ─ User-submitted field updates   │
│ ─ Awaiting review/approval       │
└──────────────────────────────────┘

┌─────────────────────────────────┐
│ Notifications                   │
│ ─ System messages               │
│ ─ Alert broadcasts              │
└─────────────────────────────────┘
```

---

## Queries & Common Operations

### Get Current Situation Summary
```sql
SELECT 
  name,
  (event_data->>'alert_level')::int as alert_level,
  jsonb_object_keys(event_data->'office_summaries') as offices,
  updated_at
FROM events
WHERE status = 'active'
LIMIT 1;
```

### Get Office Report History
```sql
SELECT 
  office,
  submitted_by,
  report_data,
  status,
  submitted_at
FROM pending_reports
WHERE office = 'DOST-Ilocos Norte'
ORDER BY submitted_at DESC
LIMIT 10;
```

### Archive Previous Events on Deployment
```sql
-- Archive current active event
INSERT INTO archived_events (event_id, event_data, archived_reason)
SELECT id, event_data, 'New event deployed'
FROM events
WHERE status = 'active';

-- Deactivate previous event
UPDATE events SET status = 'archived' WHERE status = 'active';

-- Activate new event
UPDATE events SET status = 'active', deployment = 'Deployed' WHERE id = $1;
```

### Get Active Users Count by Office
```sql
SELECT office, COUNT(*) as user_count
FROM users
WHERE status = 'Active'
GROUP BY office
ORDER BY user_count DESC;
```

### Unread Notifications Count
```sql
SELECT COUNT(*) as unread_count
FROM notifications
WHERE read = false AND office = $1;
```

---

## Performance Optimization

### Indexes Created
- Office name (UNIQUE) - fast office lookups
- Event status - filtering active/archived
- User email (UNIQUE) - user authentication
- Report submission timestamps - historical queries
- Notification read status - UI filters

### Query Optimization Tips
1. Always filter by specific office when possible
2. Use event status in WHERE clauses
3. Paginate large result sets (pending reports, notifications)
4. Use JSONB operators for nested field searches

### Potential Bottlenecks
- Large `event_data` JSONB documents may slow queries
- Notifications table grows unbounded (consider archiving)
- No sharding currently (single database)

---

## Backup & Recovery

### Backup Strategy
```bash
# Full database backup
pg_dump -U postgres dost_sitep > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres dost_sitep < backup_20260715.sql
```

### Fallback Store
- File: `data/fallback-store.json`
- Auto-updated when database operations occur
- Allows read operations if database is down
- User writes cached to fallback store until DB reconnects

---

## Monitoring & Maintenance

### Health Checks
```sql
-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for slow queries
EXPLAIN ANALYZE
SELECT * FROM pending_reports WHERE office = 'DOST-Ilocos Norte' LIMIT 100;
```

### Maintenance Tasks
- Vacuum tables (auto-vacuum enabled)
- Reindex after large deletions
- Archive old notifications monthly
- Monitor disk space

---

## Initial Data Seeding

### seed.sql
Includes default users, offices, and test data. Run on first setup:
```bash
psql -U postgres dost_sitep < database/seed.sql
```

**Default Test Users:**
- Admin: admin@dostregion1.ph / admin123
- Field Staff: Various DOST office users

