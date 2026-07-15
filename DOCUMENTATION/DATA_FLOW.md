# DOST Situation Reporting System - Data Flow & Synchronization

## System Data Flow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DOST SITREP SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React)           Backend (Express)  Database      │
│  ├─ Dashboard              ├─ API Routes       └─ PostgreSQL │
│  ├─ Components             ├─ Business Logic   └─ Fallback   │
│  └─ syncService ◄──────────► syncService       JSON Store    │
│                │            └─ dbService                      │
│                │                 │                            │
│                └─────────────────┘                           │
│                  HTTP/REST API                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Real-Time Synchronization Flow

### Polling-Based Sync Service

**Architecture: Client-Pull Model**

```
Frontend (React)                Backend (Express)
    │                               │
    ├─ Initialize sync             │
    │  (componentDidMount)          │
    │                               │
    ├──────────────────────────────>│ GET /api/offices
    │   Poll every 5 seconds        │
    │                               ├─ Check database
    │                               ├─ Check timestamp
    │<──────────────────────────────┤ 
    │   JSON Response               │
    │   (offices data)              │
    │                               │
    ├─ Update state                 │
    ├─ Re-render components         │
    │                               │
    │  (wait 5 seconds)             │
    │                               │
    └─────────(repeat)──────────────┘
```

### Sync Service Implementation

**File:** `src/services/syncService.js`

**Key Functions:**

#### `startPolling(officeOptions, callback, interval = 5000)`

```javascript
// Usage in Dashboard.jsx
useEffect(() => {
  const pollingId = syncService.startPolling(
    ['DOST-Ilocos Norte', 'DOST-Ilocos Sur', ...],
    (data) => {
      setOfficesData(data);
      console.log('Data synced at', new Date().toLocaleTimeString());
    },
    5000  // Poll every 5 seconds
  );
  
  return () => syncService.stopPolling(pollingId);
}, []);
```

**Polling Algorithm:**
```
1. Timer triggers every N seconds
2. Check if request already in-flight (prevent duplicates)
3. Fetch data from backend
4. Compare with cached data
5. If changed:
   - Update local state
   - Call callback
   - Emit change event
6. Handle errors gracefully
7. Fallback to cache if network fails
```

#### `stopPolling(pollingId)`

```javascript
// Cleanup on component unmount
return () => syncService.stopPolling(pollingId);
```

---

## Offline Fallback Flow

### Fallback Store Architecture

**File:** `src/services/fallbackStore.js`

**Purpose:** Maintain data availability when database is unavailable

**Storage Mechanism:**
```
Frontend (Browser)           Backend (Node.js)           File System
    │                            │                           │
    ├─ React State               ├─ Fallback Store Logic      │
    │  (in-memory)               │  (services/fallbackStore)  │
    │                            │                           │
    ├─ syncService polling       ├─ DB Connection Check       │
    │  (live updates)            │  (every request)           │
    │                            │                           │
    ├─ localStorage cache        ├─ Auto-sync to JSON File    │
    │  (browser storage)         │  on DB changes             │
    │                            │                           │
    └─────────────────────────────┴──────────────────────────┘
                         HTTP/REST
                         
    ┌──────────────────────────────────────┐
    │   data/fallback-store.json           │
    │  (Persisted on disk)                 │
    │                                      │
    │  {                                   │
    │    "offices": {...},                 │
    │    "events": [...],                  │
    │    "users": [...]                    │
    │  }                                   │
    └──────────────────────────────────────┘
```

### Fallback Flow Activation

**Scenario: Database Down, Network Still Available**

```
1. Frontend requests data
2. Backend receives request
3. Backend tries DB query
4. DB connection fails (timeout)
5. Backend reads fallback-store.json
6. Returns fallback data to frontend
7. Frontend displays data
8. User can view (read-only mode)
9. User cannot create/edit
10. Error banner shows degraded mode
```

**Code Example:**

```javascript
// server.js - Error handling
app.get('/api/offices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offices');
    return res.json(result.rows);
  } catch (err) {
    console.error('DB Error:', err.message);
    
    // Fallback to JSON file
    if (process.env.ALLOW_DEGRADED_DB_MODE === 'true') {
      try {
        const fallback = JSON.parse(
          fs.readFileSync(fallbackStorePath, 'utf8')
        );
        return res.status(503).json({
          status: 'degraded',
          data: fallback.offices,
          message: 'Database unavailable, serving fallback data'
        });
      } catch (err) {
        return res.status(500).json({ error: 'Complete service failure' });
      }
    }
  }
});
```

### Fallback Update Mechanism

**Auto-sync to JSON File:**

```javascript
// fallbackStore.js - Proxy-based auto-update
const handler = {
  set(target, prop, value) {
    target[prop] = value;
    
    // Auto-save to file
    fs.writeFileSync(
      fallbackStorePath,
      JSON.stringify(target, null, 2)
    );
    
    return true;
  }
};

const store = new Proxy(loadedData, handler);

// Any update automatically persists
store.offices['DOST-Ilocos Norte'] = newData;
// ↓ triggers writeFileSync automatically
```

---

## Event Deployment Flow

### Complete Event Lifecycle

**Phase 1: Event Creation**

```
User clicks "Add Event"
        │
        ▼
AddEventModal opens
        │
        ▼
User fills form:
- Event name: "Typhoon Makiling"
- Alert level: 3
- Weather: "Typhoon signal 3 raised"
        │
        ▼
User clicks "Create"
        │
        ▼
POST /api/events
{
  "name": "Typhoon Makiling",
  "alert_level": 3,
  "status": "pending"
}
        │
        ▼
Backend creates event in DB
Event status: PENDING
        │
        ▼
Response: { success: true, event_id: 2 }
        │
        ▼
Frontend updates state
Event appears in sidebar
```

**Phase 2: Event Deployment (Activation)**

```
User selects PENDING event
        │
        ▼
User clicks "Deploy" button
        │
        ▼
Dashboard.handleDeployEvent() executes:
        │
        ├─ Archive previous event
        │  └─ INSERT INTO archived_events (
        │       SELECT * FROM events WHERE status='active'
        │     )
        │
        ├─ Deactivate previous event
        │  └─ UPDATE events SET status='archived'
        │     WHERE status='active'
        │
        ├─ Activate new event
        │  └─ UPDATE events SET status='active', deployment='Deployed'
        │     WHERE id=2
        │
        ├─ Reset office data
        │  └─ FOR each office:
        │     UPDATE offices SET data='{
        │       "casualties": 0,
        │       "incidents": 0,
        │       ...
        │     }'
        │
        └─ Create notifications
           └─ INSERT INTO notifications (
                title='Event deployed',
                office='DOST-Ilocos Norte',
                ...
              )
        │
        ▼
POST /api/events/2/deploy
        │
        ▼
Backend executes sequence above
        │
        ▼
Transactions commit atomically
        │
        ▼
Response: { success: true, archived_previous: true }
        │
        ▼
Frontend updates UI:
- Event marked ACTIVE
- Previous event appears in archive
- Office data reset to zero
- Notifications triggered
        │
        ▼
syncService polling picks up changes
        │
        ▼
All connected users see updates
```

**Database State After Deployment:**

```sql
-- Before deployment
SELECT id, status FROM events ORDER BY id DESC;
-- id | status
-- 1  | active
-- 2  | pending

-- After deployment
SELECT id, status FROM events ORDER BY id DESC;
-- id | status
-- 2  | active     ← Now active
-- 1  | archived   ← Now archived

-- Archive table updated
SELECT event_id, archived_at FROM archived_events;
-- event_id | archived_at
-- 1        | 2026-07-15 10:30:00  ← Previous event saved
```

---

## Report Submission Flow

### User Report Process

```
Field Officer (DOST-Ilocos Norte)
        │
        ▼
User enters office situation data:
- Casualties: 5
- Power status: "Partial outage"
- Damage details: "School roof damaged"
- Remarks: "Response ongoing"
        │
        ▼
User clicks "Submit Report"
        │
        ▼
ReportModal validates:
- Office assigned? ✓
- Casualties is number? ✓
- Message not empty? ✓
        │
        ▼
POST /api/reports
{
  "office": "DOST-Ilocos Norte",
  "submitted_by": "field.officer@dost.gov.ph",
  "report_data": {
    "casualties": 5,
    "power_status": "Partial outage",
    "damage_details": "School roof damaged",
    "timestamp": "2026-07-15T12:30:00Z"
  },
  "remarks": "Response ongoing"
}
        │
        ▼
Backend processing:
        │
        ├─ Validate user authorization
        ├─ Store in pending_reports table
        ├─ Create notification for admins
        └─ Return success
        │
        ▼
Response: { success: true, report_id: 42 }
        │
        ▼
Frontend feedback:
- Show success message
- Clear form
- Close modal
        │
        ▼
Admin Notification:
- Admin receives notification
- Admin reviews pending report
- Admin clicks "Approve"
        │
        ▼
Approval Process:
        │
        ├─ Validate admin authorization
        ├─ Move report data to archived reports
        ├─ Update office data with report info
        ├─ Create audit log entry
        └─ Send confirmation notification
        │
        ▼
Report Archived
(available in historical reports)
```

---

## User Authentication & Authorization Flow

### Login Flow

```
User Access: http://localhost:3000
        │
        ▼
Login component renders
        │
        ▼
User enters:
- Email: john.reyes@dost.gov.ph
- Password: ••••••••
        │
        ▼
User clicks "Login"
        │
        ▼
POST /api/auth/login
{
  "email": "john.reyes@dost.gov.ph",
  "password": "password123"
}
        │
        ▼
Backend processing:
        │
        ├─ Query users table for email
        ├─ Compare password hash
        ├─ Generate session token
        └─ Return user info + token
        │
        ▼
Response:
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Reyes",
    "email": "john.reyes@dost.gov.ph",
    "office": "DOST-Ilocos Norte",
    "role": "USER"
  },
  "token": "jwt_token_here"
}
        │
        ▼
Frontend stores:
- localStorage.setItem('user', JSON.stringify(user))
- localStorage.setItem('token', token)
        │
        ▼
Redirect to Dashboard
        │
        ▼
Dashboard loads with user context
```

### Role-Based Authorization

```javascript
// Check user role on Dashboard
const isAdmin = currentUser?.role === 'ADMIN';
const isSuperAdmin = currentUser?.role === 'SADMIN';

// Conditionally render UI
{isAdmin && <UserManagementPanel />}
{isSuperAdmin && <SystemConfigPanel />}
{!isAdmin && <FieldReportPanel />}
```

---

## Office Data Update Flow

### Real-Time Update Sequence

```
Field Officer (DOST-Ilocos Norte)
        │
        ▼
Edit office data in form:
- General Weather: "Heavy rain"
- Casualties: 3
- Power Status: "Operational"
        │
        ▼
Form onChange events trigger:
handleFieldChange('casualties', 3)
        │
        ▼
Update form state:
setFormData({ ...formData, casualties: 3 })
        │
        ▼
User clicks "Save"
        │
        ▼
Dashboard.handleSaveOfficeData():
        │
        ├─ Validate form
        ├─ POST /api/offices/DOST-Ilocos%20Norte
        │  {
        │    "general_weather": "Heavy rain",
        │    "casualties": 3,
        │    "power_status": "Operational"
        │  }
        │
        ├─ Backend updates database
        ├─ Update fallback store
        └─ Return success
        │
        ▼
Response: { success: true }
        │
        ▼
Frontend updates:
- Show success toast
- Update local state
        │
        ▼
syncService detects change (next poll):
        │
        ├─ GET /api/offices returns updated data
        ├─ Detect timestamp change
        ├─ Update UI components
        │
        └─ Other connected users see updates
        │
        ▼
Notification system triggers:
        │
        └─ Alert admins of office update
```

---

## Concurrent User Handling

### Multi-User Coordination

**Scenario: Two users editing different offices**

```
User A (DOST-Ilocos Norte)      User B (DOST-Ilocos Sur)
        │                               │
        ├─ Edit casualties              ├─ Edit power status
        │                               │
        ├─ Save data                    ├─ Save data
        │                               │
        ├─ PUT /api/offices/Ilocos%20Norte
        │                               │
        │                               ├─ PUT /api/offices/Ilocos%20Sur
        │                               │
        ▼                               ▼
Backend queues requests (async)
        │
        ├─ Update office 1 in DB
        ├─ Update office 2 in DB
        │
        ▼
Both requests complete
        │
        ├─ Response to A: { success: true }
        │
        └─ Response to B: { success: true }
        │
        ▼
Next sync cycle:
        │
        ├─ Both users see BOTH updates
        │  (via polling)
```

**Conflict Handling:**

```javascript
// Last-write-wins strategy
// Timestamp-based conflict resolution

// Office update timestamp in database
{
  office_name: 'DOST-Ilocos Norte',
  data: {...},
  updated_at: '2026-07-15T12:30:00Z'  ← Latest timestamp wins
}

// If two requests happen ~simultaneously:
// Request 1: Save at 12:30:00.100
// Request 2: Save at 12:30:00.110
// 
// Result: Request 2 data persists (newer timestamp)
```

---

## Error Handling & Recovery

### Network Failure Handling

```
Sync request in-flight
        │
        ▼
Network error (timeout/500 error)
        │
        ▼
Frontend error handler:
        │
        ├─ Log error to console
        ├─ Update retry counter
        ├─ Show warning toast
        │  "Update failed, will retry..."
        │
        ├─ Check fallback data available?
        │  ├─ Yes: Use cached data (read-only)
        │  └─ No: Show error state
        │
        ├─ Schedule retry
        │  └─ Retry after 3 seconds
        │
        └─ Continue polling (with backoff)
        │
        ▼
Retry succeeds
        │
        ▼
Clear error state
Show success toast
```

### Database Failure Handling

```
Backend receives API request
        │
        ▼
Attempt DB query
        │
        ▼
DB Connection Error
        │
        ▼
Server response:
{
  "status": "degraded",
  "message": "Database unavailable",
  "data": {...fallback_data...}
}
Status: 503 Service Unavailable
        │
        ▼
Frontend receives response
        │
        ▼
Display degraded mode:
- Show yellow warning banner
- Display fallback data
- Disable write operations
- Show message: "Database unavailable. 
                 View-only mode active."
        │
        ▼
UI disabled for: Create, Update, Delete
UI enabled for: View, Read, Export
        │
        ▼
Continue polling for recovery
        │
        ▼
DB recovers
        │
        ▼
Server returns 200 with fresh data
        │
        ▼
Frontend exits degraded mode
- Hide warning banner
- Re-enable operations
- Sync latest data
```

---

## Data Consistency Guarantees

### Atomicity
- Event deployment is all-or-nothing
- Archive + deactivate + activate happens together
- If any step fails, all rolled back

### Durability
- All writes persisted to PostgreSQL
- Fallback store updated immediately
- Loss of data only on complete server failure

### Availability
- Fallback store allows read access during outage
- Frontend caches last-known data
- Degraded mode prevents data loss

### Consistency
- Last-write-wins conflict resolution
- Polling-based eventual consistency
- Timestamps ensure ordering

