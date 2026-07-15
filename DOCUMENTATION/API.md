# DOST Situation Reporting System - API Documentation

## Overview

The DOST API provides RESTful endpoints for managing disaster situation reports, offices, events, users, and notifications. The API runs on the Express backend server (default: `http://localhost:5010`).

---

## Base URL

```
Development:    http://localhost:5010/api
Production:     https://[domain]/api
```

## Authentication

Currently, the system uses simple mock authentication (test environment). In production:
- Implement JWT tokens
- Add Bearer token validation to all endpoints
- Include role-based middleware

---

## Offices API

### Get All Offices
```http
GET /api/offices
```

**Response: 200 OK**
```json
{
  "offices": {
    "DOST-Ilocos Norte": {
      "warning_signals": {},
      "general_weather": "Partly cloudy, 28°C",
      "related_incidents": 2,
      "casualties": 0,
      "power_status": "Operational",
      "communication_lines": "Clear",
      "damage_facilities": "Minor structural damage",
      "work_suspension": false,
      "assistance_provided": "Emergency supplies distributed",
      "remark": "Situation stabilizing",
      "municipalities": ["Laoag City", "Batac City"],
      "damage_details": [],
      "equipment_details": [],
      "affected_staff": []
    },
    "DOST-Ilocos Sur": {
      ...
    }
  }
}
```

### Get Specific Office Data
```http
GET /api/offices/:officeName
```

**Parameters:**
- `officeName` (path) - Office name (e.g., "DOST-Ilocos Norte")

**Response: 200 OK**
```json
{
  "office": "DOST-Ilocos Norte",
  "data": { ...office data object... }
}
```

### Update Office Data
```http
PUT /api/offices/:officeName
Content-Type: application/json
```

**Request Body:**
```json
{
  "general_weather": "Heavy rain expected",
  "related_incidents": 5,
  "casualties": 2,
  "power_status": "Partial outage",
  "damage_facilities": "Roof damage on Building A",
  "work_suspension": true,
  "assistance_provided": "Medical team dispatched",
  "remark": "Ongoing emergency response"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Office data updated",
  "office": "DOST-Ilocos Norte"
}
```

---

## Events API

### Get All Events
```http
GET /api/events
```

**Response: 200 OK**
```json
{
  "events": [
    {
      "id": 1,
      "name": "Typhoon Makiling",
      "status": "active",
      "deployment": "Deployed",
      "created_at": "2026-07-15T10:00:00Z",
      "updated_at": "2026-07-15T14:30:00Z",
      "event_data": {
        "alert_level": "3",
        "general_weather": "...",
        "offices": { ...office summaries... }
      }
    }
  ],
  "active_event": { ...current active event... },
  "archived_events": [ ...previous events... ]
}
```

### Get Active Event
```http
GET /api/events/active
```

**Response: 200 OK**
```json
{
  "event": {
    "id": 1,
    "name": "Typhoon Makiling",
    "status": "active",
    "event_data": { ...event details... }
  }
}
```

### Create New Event
```http
POST /api/events
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Typhoon Noru",
  "alert_level": "2",
  "general_weather": "Typhoon signal 2 raised",
  "status": "pending"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "event": {
    "id": 2,
    "name": "Typhoon Noru",
    "status": "pending",
    "created_at": "2026-07-15T15:00:00Z"
  }
}
```

### Deploy Event (Activate)
```http
POST /api/events/:eventId/deploy
Content-Type: application/json
```

**Request Body:**
```json
{
  "deployment": "Deployed"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Event deployed and office data reset",
  "event_id": 2,
  "archived_previous": true
}
```

**Effect:**
- Previous active event is archived
- New event becomes active
- All office data is reset to initial state

### Update Event Data
```http
PUT /api/events/:eventId
Content-Type: application/json
```

**Request Body:**
```json
{
  "alert_level": "4",
  "general_weather": "Typhoon signal 4 raised",
  "office_summaries": { ...updated office data... }
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Event updated",
  "event_id": 2
}
```

---

## Users API

### Get All Users
```http
GET /api/users
```

**Response: 200 OK**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Reyes",
      "email": "john.reyes@dost.gov.ph",
      "office": "DOST-Ilocos Norte",
      "role": "USER",
      "status": "Active",
      "profile_image": "url/to/image.jpg"
    }
  ]
}
```

### Get User by Email
```http
GET /api/users/:email
```

**Response: 200 OK**
```json
{
  "user": {
    "id": 1,
    "name": "John Reyes",
    "email": "john.reyes@dost.gov.ph",
    "office": "DOST-Ilocos Norte",
    "role": "USER",
    "status": "Active"
  }
}
```

### Create User
```http
POST /api/users
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Maria Santos",
  "email": "maria.santos@dost.gov.ph",
  "office": "DOST-Ilocos Sur",
  "role": "USER",
  "password": "secure_password_123"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "user": {
    "id": 15,
    "name": "Maria Santos",
    "email": "maria.santos@dost.gov.ph",
    "office": "DOST-Ilocos Sur",
    "role": "USER"
  }
}
```

### Update User
```http
PUT /api/users/:userId
Content-Type: application/json
```

**Request Body:**
```json
{
  "office": "DOST-La Union",
  "role": "ADMIN",
  "status": "Active"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "User updated",
  "user_id": 15
}
```

### Delete User
```http
DELETE /api/users/:userId
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "User deleted",
  "user_id": 15
}
```

---

## Reports API

### Submit Report
```http
POST /api/reports
Content-Type: application/json
```

**Request Body:**
```json
{
  "office": "DOST-Ilocos Norte",
  "submitted_by": "john.reyes@dost.gov.ph",
  "report_data": {
    "casualties": 5,
    "damaged_facilities": "School building roof",
    "power_status": "Partial outage",
    "assistance_needed": "Medical supplies, generators",
    "damage_cost": "50000"
  },
  "remarks": "Ongoing assessment"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "report_id": 42,
  "message": "Report submitted"
}
```

### Get Pending Reports
```http
GET /api/reports/pending
```

**Response: 200 OK**
```json
{
  "pending_reports": [
    {
      "id": 42,
      "office": "DOST-Ilocos Norte",
      "submitted_by": "john.reyes@dost.gov.ph",
      "report_data": { ...report details... },
      "status": "pending",
      "submitted_at": "2026-07-15T12:00:00Z"
    }
  ]
}
```

### Approve Report
```http
POST /api/reports/:reportId/approve
Content-Type: application/json
```

**Request Body:**
```json
{
  "reviewed_by": "admin.user@dost.gov.ph",
  "remarks": "Data verified and recorded"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "message": "Report approved",
  "report_id": 42
}
```

---

## Notifications API

### Get Notifications
```http
GET /api/notifications
```

**Query Parameters:**
- `office` (optional) - Filter by office name
- `limit` (optional, default 50) - Number of notifications to retrieve

**Response: 200 OK**
```json
{
  "notifications": [
    {
      "id": 1,
      "title": "New event deployment",
      "message": "Typhoon Makiling has been activated",
      "office": "DOST-Ilocos Norte",
      "created_at": "2026-07-15T10:00:00Z",
      "read": false
    }
  ]
}
```

### Mark Notification as Read
```http
PUT /api/notifications/:notificationId/read
```

**Response: 200 OK**
```json
{
  "success": true,
  "notification_id": 1
}
```

### Create Notification (Admin)
```http
POST /api/notifications
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "System maintenance",
  "message": "Scheduled maintenance tonight at 22:00",
  "office": "DOST-Ilocos Region"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "notification_id": 5
}
```

---

## History API

### Get Archived Events
```http
GET /api/history/events
```

**Query Parameters:**
- `limit` (optional, default 20) - Number of events to retrieve
- `offset` (optional, default 0) - Pagination offset

**Response: 200 OK**
```json
{
  "archived_events": [
    {
      "id": 1,
      "name": "Typhoon Makiling",
      "status": "archived",
      "deployment": "Deployed",
      "created_at": "2026-07-10T09:00:00Z",
      "archived_at": "2026-07-15T08:00:00Z",
      "total_provinces_impacted": 5,
      "total_casualties": 12,
      "total_damage_cost": "5000000",
      "event_data": { ...complete event data... }
    }
  ],
  "total_archived": 42
}
```

### Get Event History Details
```http
GET /api/history/events/:eventId
```

**Response: 200 OK**
```json
{
  "event": {
    "id": 1,
    "name": "Typhoon Makiling",
    "status": "archived",
    "timeline": [
      {
        "timestamp": "2026-07-10T09:00:00Z",
        "action": "Event created",
        "status": "pending"
      },
      {
        "timestamp": "2026-07-10T10:30:00Z",
        "action": "Event deployed",
        "status": "active"
      }
    ],
    "office_summaries": { ...office reports at each stage... }
  }
}
```

---

## Health Check API

### System Status
```http
GET /api/health
```

**Response: 200 OK**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-07-15T15:30:00Z"
}
```

**Response: 503 Service Unavailable (Degraded Mode)**
```json
{
  "status": "degraded",
  "database": "disconnected",
  "fallback": "using fallback-store.json",
  "message": "Database unavailable, running on fallback data"
}
```

---

## Error Responses

All error responses follow this format:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request",
  "details": "Office name is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not found",
  "message": "Event with ID 999 does not exist"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

### 503 Service Unavailable
```json
{
  "success": false,
  "error": "Service unavailable",
  "message": "Database connection failed. Running in fallback mode."
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. For production:
- Implement rate limiting middleware (e.g., express-rate-limit)
- Recommended: 100 requests per 15 minutes per IP

---

## Versioning

API Version: v1 (implicit, no version prefix in routes)

Future versions will use `/api/v2/` prefix if breaking changes occur.

---

## CORS Configuration

**Allowed Origins** (configurable via env):
- localhost:3000, localhost:5010
- 127.0.0.1 (any port)
- Docker internal hosts
- Configured production domains

**Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**: Content-Type, Authorization

---

## Example Usage (cURL)

### Get all offices
```bash
curl -X GET http://localhost:5010/api/offices
```

### Create new event
```bash
curl -X POST http://localhost:5010/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Typhoon Test",
    "alert_level": "2",
    "status": "pending"
  }'
```

### Update office data
```bash
curl -X PUT http://localhost:5010/api/offices/DOST-Ilocos%20Norte \
  -H "Content-Type: application/json" \
  -d '{
    "general_weather": "Partly cloudy",
    "related_incidents": 3,
    "casualties": 0
  }'
```

