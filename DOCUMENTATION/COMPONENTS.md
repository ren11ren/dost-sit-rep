# DOST Situation Reporting System - Components Documentation

## Component Architecture

The frontend uses React functional components with hooks. Components are organized into two main categories: page components and dashboard subcomponents.

---

## Page-Level Components

### 1. Login.jsx

**Purpose:** User authentication and session initialization

**Key Features:**
- Test user credential selection
- Email/password input
- Session state management
- Redirect to dashboard on success

**Props:** None (top-level component)

**State:**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

**Key Methods:**
- `handleLogin()` - Authenticate user and store session
- `loadTestUsers()` - Populate dropdown with test credentials

**Usage:**
```javascript
<Route path="/login" element={<Login />} />
```

**Related Files:**
- Imports: Dashboard component
- Uses: localStorage for session storage

---

### 2. Dashboard.jsx

**Purpose:** Main application container and state management hub

**Key Features:**
- Event management (create, deploy, archive)
- Office data editing and persistence
- Real-time sync polling
- Multi-user coordination
- Report submission handling
- Weather data fetching
- Export to Excel/PDF

**Props:** None (top-level component)

**Major State Variables:**
```javascript
// Event Management
const [events, setEvents] = useState([]);
const [activeEvent, setActiveEvent] = useState(null);
const [selectedEvent, setSelectedEvent] = useState(null);
const [officesData, setOfficesData] = useState({});

// UI State
const [editMode, setEditMode] = useState(false);
const [selectedOffice, setSelectedOffice] = useState('DOST-Ilocos Norte');
const [formData, setFormData] = useState({});

// Modals
const [showAddEventModal, setShowAddEventModal] = useState(false);
const [showUserModal, setShowUserModal] = useState(false);
const [showReportModal, setShowReportModal] = useState(false);

// Live Data
const [displayEvent, setDisplayEvent] = useState({});
const [liveWeather, setLiveWeather] = useState(null);
```

**Key Methods:**
- `handleDeployEvent()` - Activate event and archive previous
- `handleSaveOfficeData()` - Persist office edits to database
- `fetchLiveWeather()` - Get current weather data
- `handleResetEvent()` - Clear office data for new event
- `exportToExcel()` - Generate downloadable report
- `handleAddUser()` - Create new system user
- `handleDeleteUser()` - Remove user from system

**Hooks:**
- `useEffect()` - Polling sync service setup
- `useMemo()` - Computed totals and aggregations
- `useCallback()` - Memoized event handlers

**Usage:**
```javascript
<Route path="/dashboard" element={<Dashboard />} />
```

**Related Components:**
- Renders: DashboardSections, DashboardModals, DashboardSidebar
- Imports services: syncService, dbService, fallbackStore

---

## Dashboard Subcomponents

### 3. DashboardSections.jsx

**Purpose:** Display office data and handle editing interface

**Key Features:**
- Office selector grid
- Situation data form
- Real-time edit capability
- Data validation
- Damage details management
- Affected staff tracking

**Props:**
```javascript
{
  officesData: Object,              // Current office data map
  selectedOffice: String,           // Currently selected office
  editMode: Boolean,                // Edit mode toggle
  isUser: Boolean,                  // Current user is field staff
  currentUser: Object,              // Current user object
  onOfficeSelect: Function,         // Handle office selection
  onSaveData: Function,             // Save edited data
  onEditToggle: Function,           // Toggle edit mode
  onOpenReportModal: Function,      // Open report submission
  regionSummary: Object,            // Regional aggregate data
  displayEvent: Object              // Active event details
}
```

**Key Sub-Components:**

#### PSTOSelector Component
Renders office cards in grid format
```javascript
<PSTOSelector
  officesData={officesData}
  selectedOffice={selectedOffice}
  handleOfficeClick={handleOfficeClick}
  isUser={isUser}
/>
```

#### EditControlsBar Component
Displays edit/save/submit buttons
```javascript
<EditControlsBar
  selectedOffice={selectedOffice}
  isUser={isUser}
  editMode={editMode}
  handleEditToggle={handleEditToggle}
  openReportModal={openReportModal}
  handleSave={handleSave}
/>
```

#### OfficeModal Component
Modal for office data viewing/editing
```javascript
<OfficeModal
  office={selectedOffice}
  officeData={officesData[selectedOffice]}
  editMode={editMode}
  onChange={handleFieldChange}
  onClose={closeModal}
/>
```

**Usage:**
```javascript
<DashboardSections
  officesData={officesData}
  selectedOffice={selectedOffice}
  editMode={editMode}
  isUser={isUser}
  onSaveData={handleSaveOfficeData}
  onOfficeSelect={setSelectedOffice}
  // ... other props
/>
```

---

### 4. DashboardModals.jsx

**Purpose:** Handle modal dialogs for user management and event creation

**Props:**
```javascript
{
  showUserModal: Boolean,
  showReportModal: Boolean,
  closeUserModal: Function,
  closeReportModal: Function,
  onAddUser: Function,
  onDeleteUser: Function,
  onSubmitReport: Function,
  users: Array,
  currentUser: Object,
  officeOptions: Array
}
```

**Modal Components:**

#### UserModal
Manages system users
```javascript
<UserModal>
  - User creation form
  - Email, name, office, role fields
  - Delete user functionality
  - Role selection (USER/ADMIN/SADMIN)
</UserModal>
```

#### ReportModal
Submits field situation reports
```javascript
<ReportModal>
  - Report form with office data
  - Rich text editor for remarks
  - File attachments
  - Submit/Cancel buttons
</ReportModal>
```

#### EventDetailsModal
Displays deployed event information
```javascript
<EventDetailsModal>
  - Event details and metadata
  - Office summaries
  - Timeline of changes
  - Archive/Delete options
</EventDetailsModal>
```

**Usage:**
```javascript
<DashboardModals
  showUserModal={showUserModal}
  closeUserModal={() => setShowUserModal(false)}
  onAddUser={handleAddUser}
  // ... other props
/>
```

---

### 5. AddEventModal.jsx

**Purpose:** Create and configure new disaster events

**Props:**
```javascript
{
  show: Boolean,
  onClose: Function,
  onSave: Function,
  defaultData: Object
}
```

**Form Fields:**
- Event name (required)
- Alert level (1-5)
- General weather description
- Related incidents count
- Casualties count
- Additional notes

**Features:**
- Form validation
- Alert level presets
- Cancel/Create buttons

**Usage:**
```javascript
<AddEventModal
  show={showAddEventModal}
  onClose={() => setShowAddEventModal(false)}
  onSave={handleCreateEvent}
/>
```

---

### 6. DashboardSidebar.jsx

**Purpose:** Navigation and quick access panel

**Features:**
- Event list display
- Quick event switch
- User info display
- Logout button
- Notification indicator

**Props:**
```javascript
{
  activeEvent: Object,
  events: Array,
  onSelectEvent: Function,
  currentUser: Object,
  onLogout: Function
}
```

---

### 7. TyphoonHistoryContent.jsx

**Purpose:** Display archived events and historical data

**Features:**
- Event timeline
- Archived events list
- Summary statistics
- Search and filter

**Props:**
```javascript
{
  archivedEvents: Array,
  selectedEvent: Object,
  onSelectEvent: Function
}
```

---

## Service Modules

### syncService.js

**Purpose:** Real-time data synchronization with backend

**Key Methods:**

#### `startPolling(officeOptions, callback, interval = 5000)`
```javascript
syncService.startPolling(
  ['DOST-Ilocos Norte', 'DOST-Ilocos Sur'],
  (data) => setOfficesData(data),
  5000  // Poll every 5 seconds
);
```

**Returns:** Polling ID (for cancellation)

#### `stopPolling(pollingId)`
```javascript
syncService.stopPolling(pollingId);
```

**Features:**
- Configurable poll interval
- Automatic error handling
- Fallback to cached data on failure
- Request deduplication

---

### dbService.js

**Purpose:** Direct database API calls

**Key Methods:**

#### `getOffices()`
```javascript
const offices = await dbService.getOffices();
```

#### `updateOffice(officeName, data)`
```javascript
await dbService.updateOffice('DOST-Ilocos Norte', {
  general_weather: 'Rainy',
  casualties: 5
});
```

#### `getEvents()`
```javascript
const events = await dbService.getEvents();
```

#### `createEvent(eventData)`
```javascript
await dbService.createEvent({
  name: 'Typhoon Test',
  alert_level: 3
});
```

#### `deployEvent(eventId)`
```javascript
await dbService.deployEvent(eventId);
```

#### `getUsers()`
```javascript
const users = await dbService.getUsers();
```

#### `createUser(userData)`
```javascript
await dbService.createUser({
  name: 'John Doe',
  email: 'john@dost.gov.ph',
  office: 'DOST-Ilocos Norte',
  role: 'USER'
});
```

#### `deleteUser(userId)`
```javascript
await dbService.deleteUser(userId);
```

#### `submitReport(reportData)`
```javascript
await dbService.submitReport({
  office: 'DOST-Ilocos Norte',
  submitted_by: 'user@dost.gov.ph',
  report_data: {...}
});
```

---

### fallbackStore.js

**Purpose:** Client-side offline data cache

**Key Methods:**

#### `initializeFallbackStore()`
```javascript
fallbackStore.initializeFallbackStore();
```

Loads initial data from `data/fallback-store.json`

#### `getOfficeData(officeName)`
```javascript
const data = fallbackStore.getOfficeData('DOST-Ilocos Norte');
```

#### `updateOfficeData(officeName, data)`
```javascript
fallbackStore.updateOfficeData('DOST-Ilocos Norte', {...});
```

#### `saveEvent(eventData)`
```javascript
fallbackStore.saveEvent(eventData);
```

#### `getEvents()`
```javascript
const events = fallbackStore.getEvents();
```

**Proxy-Based Auto-Save:**
All updates automatically persisted via ES6 Proxy

---

## Helper Modules

### dashboardHelpers.js

**Common Utilities:**

#### `formatCurrency(amount)`
```javascript
formatCurrency(50000)  // '₱50,000.00'
```

#### `formatDate(timestamp)`
```javascript
formatDate('2026-07-15T10:00:00Z')  // 'Jul 15, 2026 10:00 AM'
```

#### `calculateTotals(officesData)`
```javascript
const totals = calculateTotals(officesData);
// { total_casualties: 15, total_incidents: 42 }
```

#### `validateEventData(eventData)`
```javascript
const valid = validateEventData(eventData);
// Returns boolean
```

---

### reportUtils.js

**Report Generation Utilities:**

#### `generateExcelReport(eventData, officesData)`
```javascript
const workbook = generateExcelReport(activeEvent, officesData);
workbook.xlsx.writeFile('Report.xlsx');
```

#### `generatePDFReport(eventData)`
```javascript
const pdf = generatePDFReport(activeEvent);
pdf.download('Report.pdf');
```

#### `formatReportData(data)`
```javascript
const formatted = formatReportData(rawEventData);
// Returns cleaned, formatted data
```

---

## Component Lifecycle

### Dashboard Initialization
```
1. Login.jsx → authenticate user
2. User redirected to Dashboard.jsx
3. Dashboard mounts
4. useEffect() hooks:
   - Initialize syncService
   - Fetch initial office data
   - Start polling
5. DashboardSections renders with data
```

### Event Deployment Lifecycle
```
1. User clicks Deploy on AddEventModal
2. Dashboard.handleDeployEvent():
   - Archive previous event
   - Create new event in DB
   - Reset office data
   - Update local state
3. syncService picks up changes
4. All components re-render with new data
```

### Office Data Edit Flow
```
1. User enables edit mode
2. DashboardSections renders form
3. User changes field values
4. handleFieldChange() updates formData state
5. User clicks Save
6. Dashboard.handleSaveOfficeData():
   - Validate form data
   - POST to API
   - Update local state
   - Trigger syncService refresh
7. UI updates with saved data
```

---

## Styling Strategy

### CSS Approach
- Global styles in `App.css`
- CSS classes for component sections
- CSS custom properties for theming
- Responsive design with media queries

### Key CSS Components
- `.modal-overlay` - Modal backgrounds
- `.psto-selector-card` - Office selector cards
- `.edit-form-*` - Form styling
- `.report-*` - Report display styling
- `.timeline-*` - Event timeline styling

### Responsive Breakpoints
```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

---

## Performance Optimizations

### Memoization
- `useMemo()` for expensive computations
- `useCallback()` for event handler stability
- Prevents unnecessary re-renders

### Lazy Loading
- Code splitting for modals
- Deferred image loading for office photos
- On-demand history data loading

### Data Fetching
- Polling interval configurable (default 5 sec)
- Request debouncing for rapid saves
- Fallback cache reduces API calls

---

## Error Boundaries

Recommended error boundary implementation:
```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    this.setState({ hasError: true });
  }

  render() {
    if (this.state?.hasError) {
      return <ErrorPage />;
    }
    return this.props.children;
  }
}
```

---

## Testing Components

### Test Structure
```javascript
// DashboardSections.test.js
describe('DashboardSections', () => {
  it('renders office selector', () => {
    render(<DashboardSections {...props} />);
    expect(screen.getByText('DOST-Ilocos Norte')).toBeInTheDocument();
  });
});
```

### Mock Data
See `src/components/dashboard/DashboardSections.test.js` for example mocks

