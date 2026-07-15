# DOST Situation Reporting System - Architecture

## System Overview

The DOST (Department of Science and Technology) Situation Reporting Dashboard is a full-stack web application built to track and report disaster situation updates across regional offices. The system provides real-time incident tracking, report management, and comprehensive documentation of emergency responses.

## Technology Stack

### Frontend
- **Framework**: React 18.2.0 with Create React App (CRA)
- **UI Components**: Custom React functional components with hooks
- **State Management**: React hooks (useState, useCallback, useRef, useEffect, useMemo)
- **Styling**: CSS3 with CSS-in-JS patterns and responsive design
- **Excel Export**: XLSX 0.18.5 library for report generation
- **HTTP Client**: Native Fetch API with proxy setup to backend

### Backend
- **Runtime**: Node.js with Express.js framework
- **API Pattern**: RESTful architecture
- **Data Persistence**: 
  - Primary: PostgreSQL database
  - Fallback: JSON file-based storage (`fallback-store.json`)
- **CORS**: Configured for local development and Docker environments
- **Process Management**: Nodemon for development

### Database
- **Type**: PostgreSQL (relational)
- **Tables**: offices, events, users, pending_reports, notifications, archived_events
- **Initialization**: Automatic schema creation on backend startup

### Deployment & DevOps
- **Local Development**: `npm run dev` (concurrent frontend + backend)
- **Production**: Docker Compose with Nginx reverse proxy
- **Build Tool**: Webpack (via CRA)
- **Package Manager**: npm 6.x+

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                         │
└────────────────────────────┬────────────────────────────────────┘
                              │
                    React App (CRA)
                    Port 3000 (dev)
                              │
                    ┌─────────▼────────────┐
                    │  Frontend Services   │
                    │  - syncService.js    │
                    │  - dbService.js      │
                    │  - fallbackStore.js  │
                    └─────────┬────────────┘
                              │
          ┌───────────────────┼────────────────────┐
          │                   │                    │
      Proxy to            Fetch to           localStorage +
    Express API        API Endpoints         fallback-store
          │                   │                    │
          └───────────────────┼────────────────────┘
                              │
                    ┌─────────▼────────────┐
                    │   Express Server     │
                    │   Port 5010 (dev)    │
                    └─────────┬────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
          ┌───▼────┐    ┌────▼─────┐    ┌───▼────┐
          │Offices │    │  Events  │    │ Users  │
          │  API   │    │   API    │    │  API   │
          └────────┘    └──────────┘    └────────┘
                              │
                    ┌─────────▼────────────┐
                    │   PostgreSQL DB      │
                    │   (with fallback)    │
                    └──────────────────────┘

Docker Production:
  Client ──> Nginx (reverse proxy) ──> Express Backend
                                     └──> React Static Files
```

---

## Core Components & Modules

### Backend Structure

#### Server.js (Main Entry Point)
- Initializes Express app
- Sets up CORS middleware
- Implements database connection pooling
- Handles fallback store persistence
- Routes API requests to handlers

#### API Endpoints
- `/api/offices` - Manage regional office data
- `/api/events` - Create, update, retrieve events
- `/api/users` - User authentication and management
- `/api/reports` - Submit and retrieve situation reports
- `/api/notifications` - Push notifications to offices
- `/api/history` - Archived events and historical data

#### Database Layer (lib/db.js)
- PostgreSQL connection pooling
- Query execution with error handling
- Schema initialization on startup

### Frontend Structure

#### Main Components
- **Dashboard.jsx** - Primary dashboard container with event management
- **Login.jsx** - Authentication UI with test user credentials
- **DashboardSections.jsx** - Office data display and editing
- **DashboardModals.jsx** - Modal dialogs for user and event management

#### Services
- **dbService.js** - Direct database API calls
- **syncService.js** - Polling service for real-time updates
- **fallbackStore.js** - Client-side offline data management

#### CSS
- **App.css** - Global styles, modals, office selector, responsive design

---

## Data Flow Architecture

### Real-Time Sync Flow
```
1. Component mounts
2. syncService.poll() starts (interval-based polling)
3. Fetch office data from backend
4. Update React state
5. UI re-renders
6. User edits data
7. Save to PostgreSQL
8. Fallback store updates automatically (Proxy pattern)
9. Next poll cycle fetches updated data
```

### Offline Fallback Flow
```
1. API request fails (no database connection)
2. Fallback store JSON loaded from disk
3. UI displays cached data
4. User edits are saved to fallback store only
5. When database reconnects, sync service re-syncs
```

### Event Deployment Flow
```
1. User creates new event (Draft status)
2. Event saved to events table
3. User clicks Deploy
4. Previous event archived
5. New event becomes active
6. Office data reset for fresh reporting cycle
7. sync service polls and reflects changes
```

---

## State Management

### Component-Level State (React Hooks)
- `useState` - Local component state (officeData, editMode, selectedEvent)
- `useCallback` - Memoized event handlers (prevent unnecessary re-renders)
- `useMemo` - Computed derived state (filtered lists, aggregations)
- `useRef` - Direct DOM access and unmount tracking

### Persistence Strategy
1. **Primary**: PostgreSQL via Express API
2. **Secondary**: Fallback JSON file (`data/fallback-store.json`)
3. **Client-Side**: React state during session
4. **Browser**: localStorage for user preferences (optional)

---

## Authentication & Authorization

### Current Implementation
- **Login.jsx** provides mock test users for development
- Simple email/password authentication
- No JWT tokens (test environment)
- Role-based access (USER, ADMIN, SADMIN)

### Roles
- **USER** - View own office data, submit reports
- **ADMIN** - Manage users and office data
- **SADMIN** - Full system access, super admin functions

---

## Error Handling & Resilience

### Database Fallback
- If PostgreSQL unavailable, system uses `fallback-store.json`
- User sees cached data but cannot sync new changes
- Console warnings indicate degraded mode
- Automatic re-sync when database becomes available

### Network Resilience
- Polling-based sync tolerates temporary network loss
- Failed requests retry on next interval
- Fallback data serves UI during outages

### Graceful Degradation
- UI remains functional with offline data
- Warning indicators show sync status
- Users can continue viewing reports while offline

---

## Scalability Considerations

### Current Limitations
- Single-node PostgreSQL (not horizontally scaled)
- Polling-based sync (not WebSocket/real-time)
- Session-based state (not distributed caching)

### Future Improvements
- WebSocket for instant updates
- Redis cache layer
- Read replicas for database scaling
- Message queue (RabbitMQ/Kafka) for event processing
- CDN for static asset delivery

---

## File Structure

```
dost-frontend/
├── docs/                           # Documentation (this folder)
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx          # Main dashboard container
│   │   ├── Login.jsx              # Auth UI
│   │   ├── dashboard/
│   │   │   ├── DashboardSections.jsx
│   │   │   ├── DashboardModals.jsx
│   │   │   ├── AddEventModal.jsx
│   │   │   ├── TyphoonHistoryContent.jsx
│   │   │   ├── dashboardHelpers.js
│   │   │   └── reportUtils.js
│   │   └── [other components]
│   ├── services/
│   │   ├── dbService.js           # API calls
│   │   ├── syncService.js         # Polling service
│   │   └── fallbackStore.js       # Offline cache
│   ├── App.css                    # Global styles
│   └── index.js                   # Entry point
├── lib/
│   └── db.js                      # PostgreSQL connection pool
├── database/
│   ├── schema.sql                 # Database schema
│   └── seed.sql                   # Initial data
├── data/
│   └── fallback-store.json        # Offline cache
├── server.js                      # Express server
├── package.json                   # Dependencies & scripts
└── README.md                      # Original README

```

---

## Environment Configuration

### Backend (server.js)
```
PORT=5010                          # Express server port
NODE_ENV=development|production    # Environment mode
DATABASE_URL=postgres://user:pass@host/db
CORS_ALLOW_ALL=true|false
CORS_ALLOWED_ORIGINS=origin1,origin2
FALLBACK_STORE_PATH=/path/to/fallback-store.json
ALLOW_DEGRADED_DB_MODE=true|false
```

### Frontend (CRA)
```
REACT_APP_API_PORT=5010            # Proxy target for API
PORT=3000                          # CRA dev server port
```

---

## Deployment

### Local Development
```bash
npm install
npm run dev                        # Starts both frontend and backend
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up
```

### Build for Production
```bash
npm run build                      # Create optimized bundle
```

The built files go into the `build/` directory for static serving via Nginx.

---

## Monitoring & Debugging

### Logging
- Backend: Console logs via `console.log()`, `console.error()`
- Frontend: Browser DevTools console, React DevTools extension
- Database: PostgreSQL logs (if applicable)

### Health Checks
- Backend startup message shows database status
- syncService logs polling status
- API errors logged with details

### Common Issues & Solutions
- CORS errors: Check `CORS_ALLOWED_ORIGINS` env var
- Database connection: Verify PostgreSQL is running, check credentials
- Port conflicts: Kill stale processes or change PORT env var
- Fallback mode: Check if database is accessible, review fallback-store.json

