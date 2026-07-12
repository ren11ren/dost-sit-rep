// Dashboard.js - Complete Full Code with Fixed History

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import dbService from '../services/dbService';
import syncService from '../services/syncService';
import DashboardSidebar from './dashboard/DashboardSidebar';
import {
    ImagePreviewModal,
    RejectEventModal,
    ReportReviewModal,
    ReportSubmissionModal,
    ReportRejectModal,
    SettingsModal,
    UserModal
} from './dashboard/DashboardModals';
import {
    DEFAULT_OFFICE_DATA,
    TYPHOON_HISTORY_KEY,
    DEFAULT_EVENTS,
    DEFAULT_USERS,
    loadFromStorage,
    saveToStorage,
    archiveOldEvents,
    fetchLiveWeather,
    deepClone,
    ToastBanner,
    NotificationWidget,
    TopInfoBar,
    InfoBar,
    NotificationBanner,
    PSTOSelector,
    EditControlsBar,
    OfficeModal,
    EventDetailsModal,
    TyphoonHistoryContent
} from './dashboard/DashboardSections';

// Import AddEventModal directly
import AddEventModal from './dashboard/AddEventModal';

// ============================================================
// CONSTANTS & HELPERS
// ============================================================
const ALL_PROVINCES = ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan', 'Ilocos Sur - FO', 'Pangasinan - FO', 'Ilocos Region'];
const STORAGE_KEYS = {
    OFFICES: 'dash_officesData',
    EVENTS: 'dash_events',
    HISTORY: TYPHOON_HISTORY_KEY,
    USERS: 'dash_users',
    REPORTS: 'dash_pendingReports',
    NOTIFICATIONS: 'dash_notifications',
    ACTIVE_MENU: 'dash_activeMenu',
    SETTINGS: 'dash_settings',
    LAST_MODIFIED: 'dash_lastModified',
    EXPANDED_OFFICES: 'dash_expanded_offices',
    HIDDEN_OFFICES: 'dash_hidden_offices',
};

const INITIAL_SETTINGS = {
    systemName: 'DOST Ilocos Region Disaster Management',
    notificationSound: true,
    autoArchiveDays: 7,
    darkMode: false,
    defaultAlertLevel: 'WHITE',
    developerName: 'Rainier Ganaden',
    developerEmail: 'rainierganaden1106@gmail.com',
    developerWebsite: 'https://dostregion1.ph',
    developerNotes: 'Developed and maintained by the DOST Region 1 IT team.'
};

const EMPTY_DAMAGE = { description: '', cost: '', status: 'Reported', image: null };
const EMPTY_EQUIPMENT = { name: '', description: '', cost: '', status: 'Reported', image: null };
const EMPTY_STAFF = { name: '', area: '', assistance: '', status: 'Active' };

// ============================================================
// IMAGE PLACEHOLDERS
// ============================================================

// DOST Ilocos Region Master Logo
const DOST_MASTER_LOGO = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="20" fill="#0a2a4a"/>
  <rect x="15" y="15" width="170" height="170" rx="12" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="100" y="65" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="bold">DOST</text>
  <text x="100" y="88" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="13">ILOCOS REGION</text>
  <text x="100" y="115" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">DISASTER</text>
  <text x="100" y="132" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10">MANAGEMENT</text>
  <circle cx="100" cy="165" r="12" fill="none" stroke="#ffd700" stroke-width="1.5"/>
  <text x="100" y="170" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="14">★</text>
</svg>
`);

// PSTO-Ilocos Norte
const PSTO_ILOCOS_NORTE_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a3c6e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2a6cae;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="15" fill="url(#grad1)"/>
  <rect x="10" y="10" width="280" height="180" rx="10" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">DOST ILOCOS REGION</text>
  <text x="150" y="65" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="10">PSTO OFFICE</text>
  <circle cx="150" cy="105" r="30" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="112" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="28">☀️</text>
  <text x="150" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">ILOCOS NORTE</text>
  <text x="150" y="175" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">Provincial Science & Technology Office</text>
</svg>
`);

// PSTO-Ilocos Sur
const PSTO_ILOCOS_SUR_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a5c3e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2a9c6e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="15" fill="url(#grad2)"/>
  <rect x="10" y="10" width="280" height="180" rx="10" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">DOST ILOCOS REGION</text>
  <text x="150" y="65" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="10">PSTO OFFICE</text>
  <circle cx="150" cy="105" r="30" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="112" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="28">🌾</text>
  <text x="150" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">ILOCOS SUR</text>
  <text x="150" y="175" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">Provincial Science & Technology Office</text>
</svg>
`);

// PSTO-La Union
const PSTO_LA_UNION_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6a2c3e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#aa5c7e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="15" fill="url(#grad3)"/>
  <rect x="10" y="10" width="280" height="180" rx="10" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">DOST ILOCOS REGION</text>
  <text x="150" y="65" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="10">PSTO OFFICE</text>
  <circle cx="150" cy="105" r="30" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="112" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="28">🏖️</text>
  <text x="150" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">LA UNION</text>
  <text x="150" y="175" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">Provincial Science & Technology Office</text>
</svg>
`);

// PSTO-Pangasinan
const PSTO_PANGASINAN_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2a5c3e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4a9c6e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="15" fill="url(#grad4)"/>
  <rect x="10" y="10" width="280" height="180" rx="10" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="13" font-weight="bold">DOST ILOCOS REGION</text>
  <text x="150" y="65" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="10">PSTO OFFICE</text>
  <circle cx="150" cy="105" r="30" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="112" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="28">🌊</text>
  <text x="150" y="155" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">PANGASINAN</text>
  <text x="150" y="175" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">Provincial Science & Technology Office</text>
</svg>
`);

// PSTO-Ilocos Region
const PSTO_ILOCOS_REGION_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a4d6d;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d7a9e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="15" fill="url(#grad5)"/>
  <rect x="10" y="10" width="280" height="180" rx="10" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="bold">DOST ILOCOS REGION</text>
  <text x="150" y="75" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="20" font-weight="bold">📍 ILOCOS REGION</text>
  <line x1="60" y1="85" x2="240" y2="85" stroke="#ffd700" stroke-width="1" opacity="0.5"/>
  <text x="150" y="115" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="11">Regional Coordination Center</text>
  <text x="150" y="135" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="10">Ilocos Norte • Ilocos Sur</text>
  <text x="150" y="150" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="10">La Union • Pangasinan</text>
  <text x="150" y="175" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="9">Regional Science & Technology Office</text>
</svg>
`);

// Ilocos Region Summary Image
const REGION_1_IMG = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
  <defs>
    <linearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a1a2a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a3c6e;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" rx="15" fill="url(#grad6)"/>
  <rect x="10" y="10" width="280" height="180" rx="10" fill="none" stroke="#ffd700" stroke-width="2"/>
  <text x="150" y="45" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">🏛️ DOST ILOCOS REGION</text>
  <text x="150" y="65" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="11">Ilocos Region</text>
  <line x1="80" y1="75" x2="220" y2="75" stroke="#ffd700" stroke-width="1" opacity="0.5"/>
  <text x="150" y="100" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="12">📍 5 Provincial Offices</text>
  <text x="150" y="120" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">🔬 Science & Technology</text>
  <text x="150" y="140" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">🌪️ Disaster Risk Reduction</text>
  <text x="150" y="160" text-anchor="middle" fill="#b0c4de" font-family="Arial, sans-serif" font-size="11">📊 Situational Reporting</text>
  <text x="150" y="182" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-size="9">Ilocos Region Disaster Management Dashboard</text>
</svg>
`);

// Map office keys to their images
const OFFICE_IMAGE_MAP = {
    'PSTO-Ilocos Norte': PSTO_ILOCOS_NORTE_IMG,
    'PSTO-Ilocos Sur': PSTO_ILOCOS_SUR_IMG,
    'PSTO-La Union': PSTO_LA_UNION_IMG,
    'PSTO-Pangasinan': PSTO_PANGASINAN_IMG,
    'PSTO-Ilocos Sur - FO': PSTO_ILOCOS_SUR_IMG,
    'PSTO-Pangasinan - FO': PSTO_PANGASINAN_IMG,
    'PSTO-Ilocos Region': PSTO_ILOCOS_REGION_IMG,
};

// ============================================================
// CUSTOM HOOKS
// ============================================================
const useLocalStorage = (key, initialValue) => {
    try {
        const [state, setState] = useState(() => {
            try {
                return loadFromStorage(key, initialValue);
            } catch (e) {
                console.warn(`Failed to load ${key}:`, e);
                return typeof initialValue === 'function' ? initialValue() : initialValue;
            }
        });

        useEffect(() => {
            try {
                saveToStorage(key, state);
            } catch (e) {
                console.warn(`Failed to save ${key}:`, e);
            }
        }, [key, state]);

        return [state, setState];
    } catch (e) {
        console.error('useLocalStorage error:', e);
        return [typeof initialValue === 'function' ? initialValue() : initialValue, () => { }];
    }
};

const useToast = (duration = 3200) => {
    const [toast, setToastState] = useState({ message: '', type: 'info', visible: false });
    const timerRef = useRef(null);

    const showToast = useCallback((message, type = 'info') => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setToastState({ message, type, visible: true });
        timerRef.current = setTimeout(() => {
            setToastState(prev => ({ ...prev, visible: false }));
            timerRef.current = null;
        }, duration);
    }, [duration]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return [toast, showToast];
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const Dashboard = ({ onLogout, currentUser }) => {
    try {
        // --- User Role Checks ---
        const normalizedRole = useMemo(() => {
            try {
                const raw = currentUser?.role ?? '';
                return raw.toString().trim().toUpperCase();
            } catch (e) {
                console.error('normalizedRole error:', e);
                return '';
            }
        }, [currentUser]);

        const userPermissions = useMemo(() => ({
            isSuperAdmin: ['SADMIN', 'SUPER ADMIN', 'SUPERADMIN'].some(r => normalizedRole.includes(r)),
            isAdmin: !['SADMIN', 'SUPER ADMIN', 'SUPERADMIN'].some(r => normalizedRole.includes(r)) &&
                (normalizedRole === 'ADMIN' || normalizedRole.includes('ADMIN')),
            isUser: normalizedRole === 'USER',
        }), [normalizedRole]);

        const { isSuperAdmin, isAdmin, isUser } = userPermissions;
        const canManageUsers = isSuperAdmin || isAdmin;
        const canEditEvents = isSuperAdmin || isAdmin;
        const canDeployEvents = isSuperAdmin;
        const canRejectEvents = isSuperAdmin;
        const canApproveReports = isSuperAdmin || isAdmin;

        // --- State ---
        const [officesData, setOfficesData] = useLocalStorage(STORAGE_KEYS.OFFICES, () => {
            try {
                const stored = loadFromStorage(STORAGE_KEYS.OFFICES, DEFAULT_OFFICE_DATA);
                const merged = { ...DEFAULT_OFFICE_DATA, ...stored };
                Object.keys(merged).forEach(key => {
                    const defaultOffice = DEFAULT_OFFICE_DATA[key] || {};
                    merged[key] = {
                        ...defaultOffice,
                        ...merged[key],
                        damage_details: merged[key]?.damage_details || [],
                        equipment_details: merged[key]?.equipment_details || [],
                        affected_staff: merged[key]?.affected_staff || [],
                        municipalities: merged[key]?.municipalities || defaultOffice.municipalities || [],
                        imageUrl: merged[key]?.imageUrl || OFFICE_IMAGE_MAP[key] || DOST_MASTER_LOGO,
                    };
                });
                return merged;
            } catch (e) {
                console.error('OfficesData init error:', e);
                return DEFAULT_OFFICE_DATA;
            }
        });

        // DEV: log officesData changes to trace unexpected resets
        useEffect(() => {
            try {
                console.debug('DEBUG: officesData changed. Summary:', {
                    timestamp: new Date().toISOString(),
                    officeCount: Object.keys(officesData || {}).length,
                    nonEmptyOffices: Object.keys(officesData || {}).filter(k => {
                        const o = officesData[k] || {};
                        const buildingSum = Array.isArray(o.damage_details) ? o.damage_details.reduce((s, it) => s + (parseFloat(it?.cost) || 0), 0) : 0;
                        const equipSum = Array.isArray(o.equipment_details) ? o.equipment_details.reduce((s, it) => s + (parseFloat(it?.cost) || 0), 0) : 0;
                        return buildingSum + equipSum > 0 || (o.casualties || 0) > 0;
                    }).length
                });
            } catch (e) {
                console.error('DEBUG: officesData change log failed:', e);
            }
        }, [officesData]);

        const [events, setEvents] = useLocalStorage(STORAGE_KEYS.EVENTS, () => {
            try {
                return archiveOldEvents(loadFromStorage(STORAGE_KEYS.EVENTS, DEFAULT_EVENTS));
            } catch (e) {
                console.error('Events init error:', e);
                return DEFAULT_EVENTS;
            }
        });

        const [typhoonHistory, setTyphoonHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
        const [users, setUsers] = useLocalStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
        // Ensure defaults are present if stored users are missing or incomplete
        useEffect(() => {
            try {
                if (!Array.isArray(users) || users.length === 0) {
                    setUsers(DEFAULT_USERS);
                    return;
                }
                if (Array.isArray(users) && users.length < DEFAULT_USERS.length) {
                    const existingEmails = new Set(users.map(u => (u.email || '').toLowerCase()));
                    const missing = DEFAULT_USERS.filter(u => !existingEmails.has((u.email || '').toLowerCase()));
                    if (missing.length > 0) {
                        const merged = [...users, ...missing];
                        setUsers(merged);
                    }
                }
            } catch (e) {
                console.error('merge default users error:', e);
            }
        }, [users, setUsers]);
        const [pendingReports, setPendingReports] = useLocalStorage(STORAGE_KEYS.REPORTS, []);
        const [notifications, setNotifications] = useLocalStorage(STORAGE_KEYS.NOTIFICATIONS, []);
        const [activeMenu, setActiveMenu] = useLocalStorage(STORAGE_KEYS.ACTIVE_MENU, 'dashboard');

        // --- Expanded Offices State ---
        const [expandedOffices, setExpandedOffices] = useLocalStorage(STORAGE_KEYS.EXPANDED_OFFICES, () => {
            const allOffices = Object.keys(DEFAULT_OFFICE_DATA);
            const expanded = {};
            allOffices.forEach(office => {
                expanded[office] = true;
            });
            return expanded;
        });

        // --- Hidden Offices State ---
        const [hiddenOffices, setHiddenOffices] = useLocalStorage(STORAGE_KEYS.HIDDEN_OFFICES, () => {
            const allOffices = Object.keys(DEFAULT_OFFICE_DATA);
            const hidden = {};
            allOffices.forEach(office => {
                hidden[office] = false;
            });
            return hidden;
        });

        const [liveWeather, setLiveWeather] = useState(null);
        const [weatherLoading, setWeatherLoading] = useState(true);
        const [selectedOffice, setSelectedOffice] = useState(() => {
            try {
                return currentUser?.office || 'PSTO-La Union';
            } catch (e) {
                return 'PSTO-La Union';
            }
        });
        const [editMode, setEditMode] = useState(false);
        const [formData, setFormData] = useState(null);
        const [newMunicipality, setNewMunicipality] = useState('');
        const [newSignal, setNewSignal] = useState(1);
        const [searchTerm, setSearchTerm] = useState('');
        const [statusFilter, setStatusFilter] = useState('all');

        // --- Modal States ---
        const [modals, setModals] = useState({
            add: false,
            details: false,
            office: false,
            reject: false,
            report: false,
            reportReview: false,
            reportReject: false,
            settings: false,
            user: false,
            image: false,
            notifications: false,
        });

        const [selectedEvent, setSelectedEvent] = useState(null);
        const [isEditingEvent, setIsEditingEvent] = useState(false);
        const [isEditingReportLink, setIsEditingReportLink] = useState(false);
        const [reportLinkInput, setReportLinkInput] = useState('');
        const [isEditingUser, setIsEditingUser] = useState(false);
        const [userForm, setUserForm] = useState({
            id: null, name: '', email: '', office: 'PSTO-La Union',
            role: 'USER', status: 'Active', password: '', profileImage: ''
        });
        const [userSearchTerm, setUserSearchTerm] = useState('');
        const [imageModalSrc, setImageModalSrc] = useState('');
        const [rejectReason, setRejectReason] = useState('');
        const [rejectEventId, setRejectEventId] = useState(null);
        const [reportFormData, setReportFormData] = useState(null);
        const [selectedReport, setSelectedReport] = useState(null);
        const [reportRejectReason, setReportRejectReason] = useState('');
        const [settingsData, setSettingsData] = useLocalStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);

        // --- Form States ---
        const [newDamage, setNewDamage] = useState(EMPTY_DAMAGE);
        const [newEquipment, setNewEquipment] = useState(EMPTY_EQUIPMENT);
        const [newStaff, setNewStaff] = useState(EMPTY_STAFF);
        const [editingDamageIndex, setEditingDamageIndex] = useState(null);
        const [editingEquipmentIndex, setEditingEquipmentIndex] = useState(null);
        const [editingStaffIndex, setEditingStaffIndex] = useState(null);

        // --- Report Form States ---
        const [reportNewDamage, setReportNewDamage] = useState(EMPTY_DAMAGE);
        const [reportNewEquipment, setReportNewEquipment] = useState(EMPTY_EQUIPMENT);
        const [reportNewStaff, setReportNewStaff] = useState(EMPTY_STAFF);
        const [editingReportDamageIndex, setEditingReportDamageIndex] = useState(null);
        const [editingReportEquipmentIndex, setEditingReportEquipmentIndex] = useState(null);
        const [editingReportStaffIndex, setEditingReportStaffIndex] = useState(null);

        const [expandedSections, setExpandedSections] = useState({
            warningSignals: true,
            generalWeather: true,
            effects: true,
            remarks: true,
            damageDetails: true,
            equipmentDetails: true,
            affectedStaff: true,
            officeImage: true
        });

        // --- New Event Form ---
        const [newEvent, setNewEvent] = useState({
            id: null,
            name: '',
            startDateTime: '',
            endDateTime: '',
            alertLevel: '',
            category: '',
            general_weather: '',
            deployment: 'Draft',
            provinces: [],
            sendToAllUsers: false,
            reportLink: '',
            trackPositions: '',
            intensity: '',
            related_incidents: 0,
            remark_related_incidents: '',
            casualties: 0,
            remark_casualties: '',
            power_status: '',
            remark_power_status: '',
            communication_lines: '',
            remark_communication_lines: '',
            damage_facilities: '',
            remark_damage_facilities: '',
            work_suspension: false,
            remark_work_suspension: '',
            assistance_provided: '',
            remark_assistance_provided: '',
            imageUrl: '',
            status: 'pending',
            rejectionReason: ''
        });

        // --- Refs ---
        const mainContentRef = useRef(null);
        const scrollPositionRef = useRef(0);
        const suppressRemotePushRef = useRef(false);
        const syncBootstrappedRef = useRef(false);
        const syncPushTimerRef = useRef(null);

        // --- Toast ---
        const [toast, showToast] = useToast();

        // --- Helper Functions ---
        const addNotification = useCallback((title, message, type = 'info') => {
            try {
                const newNotif = {
                    id: Date.now(),
                    title,
                    message,
                    type,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                setNotifications(prev => {
                    try {
                        return [newNotif, ...prev].slice(0, 50);
                    } catch (e) {
                        console.error('setNotifications error:', e);
                        return prev;
                    }
                });
                showToast(message, type);
            } catch (e) {
                console.error('addNotification error:', e);
            }
        }, [setNotifications, showToast]);

        const getAlertColor = useCallback((level) => {
            const colors = { RED: '#dc3545', BLUE: '#007bff', WHITE: '#6c757d' };
            return colors[level] || '#28a745';
        }, []);

        const getStatusColor = useCallback((status) => {
            const colors = {
                active: '#28a745',
                approved: '#0d6efd',
                pending: '#ffc107',
                draft: '#6c757d',
                rejected: '#dc3545',
                archived: '#adb5bd'
            };
            return colors[status] || '#6c757d';
        }, []);

        const getEventStatusLabel = useCallback((event) => {
            try {
                if (event.deployment === 'Deployed') return 'Active';
                if (event.status === 'pending') return 'Pending Approval';
                if (event.status === 'approved') return 'Approved';
                if (event.status === 'rejected') return 'Rejected';
                if (event.status === 'archived') return 'Archived';
                return event.deployment || 'Draft';
            } catch (e) {
                return 'Unknown';
            }
        }, []);

        const formatDateTime = useCallback((value, fallback = 'Unknown date') => {
            try {
                const date = new Date(value);
                return isNaN(date.getTime()) ? fallback : date.toLocaleString();
            } catch (e) {
                return fallback;
            }
        }, []);

        const toggleModal = useCallback((key) => {
            setModals(prev => {
                try {
                    return { ...prev, [key]: !prev[key] };
                } catch (e) {
                    console.error('toggleModal error:', e);
                    return prev;
                }
            });
        }, []);

        // --- Toggle Office Expansion ---
        const toggleOfficeExpansion = useCallback((officeKey) => {
            setExpandedOffices(prev => ({
                ...prev,
                [officeKey]: !prev[officeKey]
            }));
        }, [setExpandedOffices]);

        // --- Toggle Office Hide/Show ---
        const toggleOfficeVisibility = useCallback((officeKey) => {
            setHiddenOffices(prev => ({
                ...prev,
                [officeKey]: !prev[officeKey]
            }));
            const isHidden = !hiddenOffices[officeKey];
            showToast(`${officeKey.replace('PSTO-', '')} ${isHidden ? 'hidden' : 'shown'}`, 'info');
        }, [hiddenOffices, setHiddenOffices, showToast]);

        // --- Show All Offices ---
        const showAllOffices = useCallback(() => {
            const allOffices = Object.keys(DEFAULT_OFFICE_DATA);
            const newHidden = {};
            allOffices.forEach(office => {
                newHidden[office] = false;
            });
            setHiddenOffices(newHidden);
            showToast('All offices are now visible', 'success');
        }, [setHiddenOffices, showToast]);

        // --- Hide All Offices ---
        const hideAllOffices = useCallback(() => {
            const allOffices = Object.keys(DEFAULT_OFFICE_DATA);
            const newHidden = {};
            allOffices.forEach(office => {
                newHidden[office] = true;
            });
            setHiddenOffices(newHidden);
            showToast('All offices are now hidden', 'info');
        }, [setHiddenOffices, showToast]);

        // --- Get Visible Offices ---
        const visibleOffices = useMemo(() => {
            const visible = {};
            Object.keys(officesData).forEach(officeKey => {
                if (!hiddenOffices[officeKey]) {
                    visible[officeKey] = officesData[officeKey];
                }
            });
            return visible;
        }, [officesData, hiddenOffices]);

        // --- Get Hidden Offices Count ---
        const hiddenCount = useMemo(() => {
            return Object.values(hiddenOffices).filter(hidden => hidden).length;
        }, [hiddenOffices]);

        // --- Scroll Management ---
        const handleScroll = useCallback(() => {
            if (mainContentRef.current) {
                scrollPositionRef.current = mainContentRef.current.scrollTop;
            }
        }, []);

        useEffect(() => {
            try {
                if (mainContentRef.current && scrollPositionRef.current > 0) {
                    mainContentRef.current.scrollTop = scrollPositionRef.current;
                }
            } catch (e) {
                console.error('Scroll restore error:', e);
            }
        });

        useEffect(() => {
            try {
                scrollPositionRef.current = 0;
                if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = 0;
                }
            } catch (e) {
                console.error('Scroll reset error:', e);
            }
        }, [activeMenu]);

        // --- Search Handlers ---
        const handleSearchChange = useCallback((e) => {
            try {
                if (mainContentRef.current) {
                    scrollPositionRef.current = mainContentRef.current.scrollTop;
                }
                setSearchTerm(e.target.value);
            } catch (e) {
                console.error('handleSearchChange error:', e);
            }
        }, []);

        const handleUserSearchChange = useCallback((e) => {
            try {
                if (mainContentRef.current) {
                    scrollPositionRef.current = mainContentRef.current.scrollTop;
                }
                setUserSearchTerm(e.target.value);
            } catch (e) {
                console.error('handleUserSearchChange error:', e);
            }
        }, []);

        // --- Memoized Data ---
        const filteredEvents = useMemo(() => {
            try {
                const term = searchTerm.toLowerCase();
                return events.filter(event => {
                    const matchSearch = event.name?.toLowerCase().includes(term) ||
                        event.alertLevel?.toLowerCase().includes(term) ||
                        event.date?.toLowerCase().includes(term) ||
                        event.status?.toLowerCase().includes(term) ||
                        (event.category || '').toLowerCase().includes(term);
                    if (statusFilter === 'all') return matchSearch;
                    return matchSearch && event.status === statusFilter;
                });
            } catch (e) {
                console.error('filteredEvents error:', e);
                return [];
            }
        }, [events, searchTerm, statusFilter]);

        const filteredUsers = useMemo(() => {
            try {
                const term = userSearchTerm.toLowerCase();
                return users.filter(u =>
                    u.name.toLowerCase().includes(term) ||
                    u.email.toLowerCase().includes(term) ||
                    u.role.toLowerCase().includes(term)
                );
            } catch (e) {
                console.error('filteredUsers error:', e);
                return [];
            }
        }, [users, userSearchTerm]);

        const unreadCount = useMemo(() => {
            try {
                return notifications.filter(n => !n.read).length;
            } catch (e) {
                return 0;
            }
        }, [notifications]);

        const activeEvent = useMemo(() => {
            try {
                return events.find(e => e.deployment === 'Deployed');
            } catch (e) {
                return null;
            }
        }, [events]);

        const summaryStats = useMemo(() => {
            try {
                return {
                    totalEvents: events.length,
                    totalIncidents: Object.values(officesData).reduce((sum, office) => sum + (office.related_incidents || 0), 0),
                    totalCasualties: Object.values(officesData).reduce((sum, office) => sum + (office.casualties || 0), 0),
                    totalAffected: Object.values(officesData).reduce((sum, office) => sum + ((office.affected_staff || []).length), 0),
                    totalDamages: Object.values(officesData).reduce((sum, office) => sum + ((office.damage_details || []).length + (office.equipment_details || []).length), 0),
                    deployedEvents: events.filter(e => e.deployment === 'Deployed').length,
                    archivedEvents: events.filter(e => e.status === 'archived' || e.deployment === 'Archived').length,
                    pendingEvents: events.filter(e => e.status === 'pending').length
                };
            } catch (e) {
                console.error('summaryStats error:', e);
                return {
                    totalEvents: 0,
                    totalIncidents: 0,
                    totalCasualties: 0,
                    totalAffected: 0,
                    totalDamages: 0,
                    deployedEvents: 0,
                    archivedEvents: 0,
                    pendingEvents: 0
                };
            }
        }, [events, officesData]);

        const regionSummary = useMemo(() => {
            try {
                return {
                    offices: Object.keys(visibleOffices).length,
                    incidents: Object.values(visibleOffices).reduce((sum, office) => sum + (office.related_incidents || 0), 0),
                    casualties: Object.values(visibleOffices).reduce((sum, office) => sum + (office.casualties || 0), 0),
                    suspensions: Object.values(visibleOffices).filter(office => office.work_suspension).length,
                    damageDetails: Object.values(visibleOffices).reduce((sum, office) => sum + ((office.damage_details && office.damage_details.length) || 0), 0),
                    affectedStaff: Object.values(visibleOffices).reduce((sum, office) => sum + ((office.affected_staff && office.affected_staff.length) || 0), 0),
                };
            } catch (e) {
                console.error('regionSummary error:', e);
                return { offices: 0, incidents: 0, casualties: 0, suspensions: 0, damageDetails: 0, affectedStaff: 0 };
            }
        }, [visibleOffices]);

        const currentOfficeData = useMemo(() => {
            try {
                if (selectedOffice === 'PSTO-Region-1') {
                    return {
                        general_weather: liveWeather ? `${liveWeather.condition}, ${liveWeather.temp}°C` : 'Fetching live weather...',
                        related_incidents: regionSummary.incidents,
                        casualties: regionSummary.casualties,
                        warning_signals: {},
                        power_status: 'Region summary',
                        communication_lines: 'Region summary',
                        damage_facilities: 'Region summary',
                        work_suspension: false,
                        assistance_provided: 'Region summary',
                        remark: 'Region-wide situation overview.',
                        remark_related_incidents: '',
                        remark_casualties: '',
                        remark_power_status: '',
                        remark_communication_lines: '',
                        remark_damage_facilities: '',
                        remark_work_suspension: '',
                        remark_assistance_provided: '',
                        municipalities: [],
                        damage_details: [],
                        equipment_details: [],
                        affected_staff: [],
                        imageUrl: REGION_1_IMG,
                    };
                }
                return officesData[selectedOffice] || {
                    general_weather: '',
                    related_incidents: 0,
                    casualties: 0,
                    warning_signals: {},
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
                    municipalities: [],
                    damage_details: [],
                    equipment_details: [],
                    affected_staff: [],
                    imageUrl: OFFICE_IMAGE_MAP[selectedOffice] || DOST_MASTER_LOGO,
                };
            } catch (e) {
                console.error('currentOfficeData error:', e);
                return { general_weather: '', related_incidents: 0, casualties: 0, warning_signals: {} };
            }
        }, [selectedOffice, liveWeather, regionSummary, officesData]);

        const displayWeather = useMemo(() => {
            try {
                if (liveWeather) return `${liveWeather.condition}, ${liveWeather.temp}°C, Wind ${liveWeather.windSpeed} km/h`;
                if (weatherLoading) return 'Loading live weather...';
                return currentOfficeData.general_weather;
            } catch (e) {
                return 'Weather unavailable';
            }
        }, [liveWeather, weatherLoading, currentOfficeData.general_weather]);

        // --- Weather Fetching ---
        useEffect(() => {
            const getWeather = async () => {
                try {
                    setWeatherLoading(true);
                    const weather = await fetchLiveWeather();
                    setLiveWeather(weather);
                } catch (e) {
                    console.error('Weather fetch error:', e);
                } finally {
                    setWeatherLoading(false);
                }
            };
            getWeather();
            const interval = setInterval(getWeather, 60000);
            return () => clearInterval(interval);
        }, []);

        // --- Sync Logic ---
        useEffect(() => {
            let unsubscribe = null;

            const hasRemoteData = (payload) => {
                try {
                    const hasOffices = !!payload?.offices && Object.keys(payload.offices).length > 0;
                    const hasEvents = Array.isArray(payload?.events) && payload.events.length > 0;
                    const hasUsers = Array.isArray(payload?.users) && payload.users.length > 0;
                    const hasReports = Array.isArray(payload?.reports) && payload.reports.length > 0;
                    const hasNotifications = Array.isArray(payload?.notifications) && payload.notifications.length > 0;
                    const hasHistory = Array.isArray(payload?.typhoonHistory) && payload.typhoonHistory.length > 0;
                    const hasActiveMenu = typeof payload?.activeMenu === 'string' && payload.activeMenu.trim();
                    return hasOffices || hasEvents || hasUsers || hasReports || hasNotifications || hasHistory || hasActiveMenu;
                } catch (e) {
                    return false;
                }
            };

            const hasLocalUserData = () => {
                try {
                    const officesChanged = JSON.stringify(officesData) !== JSON.stringify(DEFAULT_OFFICE_DATA);
                    const eventsChanged = JSON.stringify(events) !== JSON.stringify(archiveOldEvents(DEFAULT_EVENTS));
                    const usersChanged = JSON.stringify(users) !== JSON.stringify(DEFAULT_USERS);
                    const hasReports = Array.isArray(pendingReports) && pendingReports.length > 0;
                    const hasNotifications = Array.isArray(notifications) && notifications.length > 0;
                    return officesChanged || eventsChanged || usersChanged || hasReports || hasNotifications;
                } catch (e) {
                    return false;
                }
            };

            const applyRemoteData = (payload, isBootstrap = false) => {
                try {
                    if (!isBootstrap) {
                        const localLastMod = parseInt(loadFromStorage(STORAGE_KEYS.LAST_MODIFIED, 0), 10) || 0;
                        const remoteTs = parseInt(payload?._localTs, 10) || 0;
                        if (localLastMod > remoteTs) return;
                    }

                    suppressRemotePushRef.current = true;

                    const hasOffices = payload?.offices && typeof payload.offices === 'object' && Object.keys(payload.offices).length > 0;
                    const hasEvents = Array.isArray(payload?.events) && payload.events.length > 0;
                    const hasUsers = Array.isArray(payload?.users) && payload.users.length > 0;
                    const hasReports = Array.isArray(payload?.reports) && payload.reports.length > 0;
                    const hasNotifications = Array.isArray(payload?.notifications) && payload.notifications.length > 0;

                    if (hasOffices) {
                        setOfficesData(prev => {
                            try {
                                const merged = { ...DEFAULT_OFFICE_DATA, ...payload.offices };
                                Object.keys(merged).forEach(key => {
                                    const defaultOffice = DEFAULT_OFFICE_DATA[key] || {};
                                    merged[key] = {
                                        ...defaultOffice,
                                        ...merged[key],
                                        damage_details: merged[key]?.damage_details || [],
                                        equipment_details: merged[key]?.equipment_details || [],
                                        affected_staff: merged[key]?.affected_staff || [],
                                        municipalities: merged[key]?.municipalities || defaultOffice.municipalities || [],
                                        imageUrl: merged[key]?.imageUrl || OFFICE_IMAGE_MAP[key] || prev[key]?.imageUrl || DOST_MASTER_LOGO,
                                    };
                                });
                                return merged;
                            } catch (e) {
                                console.error('Apply offices error:', e);
                                return prev;
                            }
                        });
                    }
                    if (hasEvents) setEvents(archiveOldEvents(payload.events));
                    if (hasUsers) setUsers(payload.users);
                    if (hasReports) {
                        // Normalize server report shape to client expectations
                        const normalized = (payload.reports || []).map(r => ({
                            id: r.id || r.ID || null,
                            office: r.office || r.office_name || r.office || '',
                            submittedBy: r.submitted_by || r.submittedBy || r.submittedBy || '',
                            submittedAt: (() => {
                                const raw = r.submitted_at || r.submittedAt || r.created_at || new Date().toISOString();
                                const parsed = new Date(raw);
                                return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
                            })(),
                            status: r.status || 'pending',
                            remarks: r.remarks || r.remark || '',
                            data: r.data || r.report_data || (r.report_data ? (typeof r.report_data === 'string' ? JSON.parse(r.report_data) : r.report_data) : {})
                        }));
                        setPendingReports(normalized);
                    }
                    if (hasNotifications) setNotifications(payload.notifications);
                    if (typeof payload?.activeMenu === 'string' && payload.activeMenu.trim()) setActiveMenu(payload.activeMenu);
                    if (Array.isArray(payload?.typhoonHistory) && payload.typhoonHistory.length > 0) {
                        setTyphoonHistory(payload.typhoonHistory);
                        saveToStorage(STORAGE_KEYS.HISTORY, payload.typhoonHistory);
                    }
                    setTimeout(() => { suppressRemotePushRef.current = false; }, 1200);
                } catch (e) {
                    console.error('applyRemoteData error:', e);
                    suppressRemotePushRef.current = false;
                }
            };

            const bootstrapSync = async () => {
                try {
                    const [initial, remoteHistory] = await Promise.all([
                        syncService.syncData(),
                        dbService.getTyphoonHistory()
                    ]);

                    if (initial && hasRemoteData(initial)) {
                        const activeMenuRemote = await dbService.getActiveMenu();
                        applyRemoteData({
                            ...initial,
                            activeMenu: activeMenuRemote || 'dashboard',
                            typhoonHistory: Array.isArray(remoteHistory) ? remoteHistory : []
                        }, true);
                    } else if (hasLocalUserData()) {
                        await dbService.syncAllData({
                            officesData,
                            events,
                            users,
                            pendingReports,
                            notifications,
                            activeMenu,
                            typhoonHistory
                        });
                    }

                    unsubscribe = syncService.onSync((remote) => {
                        if (!remote || !hasRemoteData(remote)) return;
                        applyRemoteData(remote);
                    });
                    syncService.startAutoSync();
                    syncBootstrappedRef.current = true;
                } catch (e) {
                    console.error('bootstrapSync error:', e);
                }
            };

            bootstrapSync();

            return () => {
                try {
                    syncService.stopAutoSync();
                    if (unsubscribe) unsubscribe();
                    if (syncPushTimerRef.current) clearTimeout(syncPushTimerRef.current);
                } catch (e) {
                    console.error('Cleanup error:', e);
                }
            };
        }, []);

        useEffect(() => {
            if (!syncBootstrappedRef.current) return;
            if (suppressRemotePushRef.current) return;
            if (syncPushTimerRef.current) clearTimeout(syncPushTimerRef.current);

            const localTs = Date.now();
            syncPushTimerRef.current = setTimeout(() => {
                try {
                    saveToStorage(STORAGE_KEYS.LAST_MODIFIED, localTs);
                    dbService.syncAllData({
                        officesData,
                        events,
                        users,
                        pendingReports,
                        notifications,
                        activeMenu,
                        typhoonHistory,
                        _localTs: localTs
                    });
                } catch (e) {
                    console.error('Sync push error:', e);
                }
            }, 500);
        }, [officesData, events, users, pendingReports, notifications, activeMenu, typhoonHistory]);

        // --- Archive Old Events ---
        useEffect(() => {
            try {
                const archived = archiveOldEvents(events);
                if (JSON.stringify(archived) !== JSON.stringify(events)) setEvents(archived);
            } catch (e) {
                console.error('Archive events error:', e);
            }
        }, [events, setEvents]);

        // --- Set User's Office ---
        useEffect(() => {
            try {
                if (isUser && currentUser?.office) setSelectedOffice(currentUser.office);
            } catch (e) {
                console.error('Set user office error:', e);
            }
        }, [isUser, currentUser]);

        // --- Image Compression ---
        const compressImage = useCallback((file, maxWidth = 960, maxHeight = 720, quality = 0.75) => {
            return new Promise((resolve) => {
                try {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = new Image();
                        img.onload = () => {
                            try {
                                let { width, height } = img;
                                if (width > maxWidth || height > maxHeight) {
                                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                                    width = Math.round(width * ratio);
                                    height = Math.round(height * ratio);
                                }
                                const canvas = document.createElement('canvas');
                                canvas.width = width;
                                canvas.height = height;
                                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                                resolve(canvas.toDataURL('image/jpeg', quality));
                            } catch (e) {
                                console.error('Image processing error:', e);
                                resolve(null);
                            }
                        };
                        img.onerror = () => resolve(null);
                        img.src = ev.target.result;
                    };
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                } catch (e) {
                    console.error('compressImage error:', e);
                    resolve(null);
                }
            });
        }, []);

        // ============================================================
        // EVENT HANDLERS
        // ============================================================

        // --- Reset PSTO Data ---
        const resetPSTODataForNewEvent = useCallback(() => {
            try {
                setOfficesData(prev => {
                    const resetData = {};
                    Object.keys(DEFAULT_OFFICE_DATA).forEach(office => {
                        resetData[office] = {
                            ...DEFAULT_OFFICE_DATA[office],
                            imageUrl: prev[office]?.imageUrl || OFFICE_IMAGE_MAP[office] || DOST_MASTER_LOGO,
                            municipalities: prev[office]?.municipalities || DEFAULT_OFFICE_DATA[office]?.municipalities || [],
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
                            damage_details: [],
                            equipment_details: [],
                            affected_staff: []
                        };
                    });
                    return resetData;
                });
                addNotification('PSTO Data Reset', 'All PSTO warning signals and effects have been reset for the new event.', 'success');
            } catch (e) {
                console.error('resetPSTODataForNewEvent error:', e);
            }
        }, [setOfficesData, addNotification]);

        // --- Reset Event Form ---
        const resetNewEventForm = useCallback(() => {
            setNewEvent({
                id: null,
                name: '',
                startDateTime: '',
                endDateTime: '',
                alertLevel: '',
                category: '',
                deployment: 'Draft',
                provinces: [],
                sendToAllUsers: false,
                reportLink: '',
                trackPositions: '',
                intensity: '',
                related_incidents: 0,
                remark_related_incidents: '',
                casualties: 0,
                remark_casualties: '',
                power_status: '',
                remark_power_status: '',
                communication_lines: '',
                remark_communication_lines: '',
                damage_facilities: '',
                remark_damage_facilities: '',
                work_suspension: false,
                remark_work_suspension: '',
                assistance_provided: '',
                remark_assistance_provided: '',
                imageUrl: '',
                status: 'pending',
                rejectionReason: ''
            });
        }, []);

        // --- Handle Office Click ---
        const handleOfficeClick = useCallback((officeName) => {
            try {
                setSelectedOffice(officeName);
                setEditMode(false);
                toggleModal('office');
            } catch (e) {
                console.error('handleOfficeClick error:', e);
            }
        }, [toggleModal]);

        // --- Handle Edit Toggle ---
        const handleEditToggle = useCallback(() => {
            try {
                if (selectedOffice === 'PSTO-Region-1') {
                    showToast('Cannot edit Ilocos Region summary. Select a specific PSTO office.', 'warning');
                    return;
                }
                if (!editMode) {
                    setFormData(deepClone({
                        ...currentOfficeData,
                        municipalities: [...(currentOfficeData.municipalities || [])],
                        damage_details: [...(currentOfficeData.damage_details || [])],
                        equipment_details: [...(currentOfficeData.equipment_details || [])],
                        affected_staff: [...(currentOfficeData.affected_staff || [])],
                        imageUrl: currentOfficeData.imageUrl || OFFICE_IMAGE_MAP[selectedOffice] || DOST_MASTER_LOGO,
                    }));
                }
                setEditMode(!editMode);
            } catch (e) {
                console.error('handleEditToggle error:', e);
            }
        }, [selectedOffice, editMode, currentOfficeData, showToast]);

        // --- Handle Save ---
        const handleSave = useCallback(() => {
            try {
                if (selectedOffice === 'PSTO-Region-1') {
                    showToast('Cannot save Ilocos Region data directly. Select a specific PSTO office.', 'warning');
                    return;
                }

                const updatedData = {
                    ...formData,
                    damage_details: formData.damage_details || [],
                    equipment_details: formData.equipment_details || [],
                    affected_staff: formData.affected_staff || [],
                    imageUrl: formData.imageUrl || OFFICE_IMAGE_MAP[selectedOffice] || DOST_MASTER_LOGO,
                };

                setOfficesData(prev => ({
                    ...prev,
                    [selectedOffice]: updatedData
                }));

                setEditMode(false);
                addNotification('PSTO Data Saved', `${selectedOffice} data was manually edited.`, 'info');
                showToast('PSTO data saved.', 'success');
            } catch (e) {
                console.error('handleSave error:', e);
                showToast('Failed to save data.', 'error');
            }
        }, [selectedOffice, formData, setOfficesData, addNotification, showToast]);

        // --- Office Image Handlers ---
        const handleOfficeImageChange = useCallback(async (e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;
                const imageData = await compressImage(file);
                if (imageData) {
                    setFormData(prev => ({ ...prev, imageUrl: imageData }));
                    setOfficesData(prev => ({
                        ...prev,
                        [selectedOffice]: { ...prev[selectedOffice], imageUrl: imageData }
                    }));
                    showToast('Image uploaded successfully.', 'success');
                } else {
                    showToast('Failed to process image.', 'error');
                }
            } catch (e) {
                console.error('handleOfficeImageChange error:', e);
                showToast('Failed to process image.', 'error');
            }
            e.target.value = '';
        }, [compressImage, selectedOffice, setOfficesData, showToast]);

        const handleRemoveOfficeImage = useCallback(() => {
            try {
                setFormData(prev => ({ ...prev, imageUrl: '' }));
                setOfficesData(prev => ({
                    ...prev,
                    [selectedOffice]: { ...prev[selectedOffice], imageUrl: OFFICE_IMAGE_MAP[selectedOffice] || DOST_MASTER_LOGO }
                }));
                showToast('Image removed.', 'info');
            } catch (e) {
                console.error('handleRemoveOfficeImage error:', e);
            }
        }, [selectedOffice, setOfficesData, showToast]);

        // --- Municipality Handlers ---
        const handleSignalChange = useCallback((municipality, value) => {
            try {
                setFormData(prev => ({
                    ...prev,
                    warning_signals: { ...prev.warning_signals, [municipality]: parseInt(value) }
                }));
            } catch (e) {
                console.error('handleSignalChange error:', e);
            }
        }, []);

        const handleAddMunicipality = useCallback(() => {
            try {
                if (newMunicipality.trim() && !formData.municipalities.includes(newMunicipality)) {
                    setFormData({
                        ...formData,
                        municipalities: [...formData.municipalities, newMunicipality],
                        warning_signals: { ...formData.warning_signals, [newMunicipality]: newSignal }
                    });
                    setNewMunicipality('');
                    setNewSignal(1);
                    showToast('Municipality added.', 'success');
                }
            } catch (e) {
                console.error('handleAddMunicipality error:', e);
            }
        }, [newMunicipality, newSignal, formData, showToast]);

        const handleRemoveMunicipality = useCallback((municipality) => {
            try {
                const updatedMunicipalities = formData.municipalities.filter(m => m !== municipality);
                const updatedSignals = { ...formData.warning_signals };
                delete updatedSignals[municipality];
                setFormData({ ...formData, municipalities: updatedMunicipalities, warning_signals: updatedSignals });
                showToast('Municipality removed.', 'info');
            } catch (e) {
                console.error('handleRemoveMunicipality error:', e);
            }
        }, [formData, showToast]);

        // --- Damage Handlers ---
        const handleAddDamage = useCallback(() => {
            try {
                if (!newDamage.description) {
                    showToast('Please enter a damage description.', 'warning');
                    return;
                }
                const damageToAdd = {
                    ...newDamage,
                    id: Date.now(),
                    date: new Date().toISOString(),
                    reportedBy: currentUser?.name || 'Unknown'
                };
                setFormData(prev => ({
                    ...prev,
                    damage_details: [...(prev.damage_details || []), damageToAdd]
                }));
                setNewDamage(EMPTY_DAMAGE);
                showToast('Damage added successfully.', 'success');
            } catch (e) {
                console.error('handleAddDamage error:', e);
            }
        }, [newDamage, currentUser, showToast]);

        const handleEditDamage = useCallback((index) => {
            try {
                const damage = formData.damage_details[index];
                setNewDamage({
                    description: damage.description || '',
                    cost: damage.cost || '',
                    status: damage.status || 'Reported',
                    image: damage.image || null
                });
                setEditingDamageIndex(index);
            } catch (e) {
                console.error('handleEditDamage error:', e);
            }
        }, [formData]);

        const handleUpdateDamage = useCallback(() => {
            try {
                if (editingDamageIndex === null) return;
                const updatedDetails = [...formData.damage_details];
                updatedDetails[editingDamageIndex] = {
                    ...newDamage,
                    id: updatedDetails[editingDamageIndex].id,
                    date: updatedDetails[editingDamageIndex].date,
                    reportedBy: updatedDetails[editingDamageIndex].reportedBy
                };
                setFormData(prev => ({ ...prev, damage_details: updatedDetails }));
                setNewDamage(EMPTY_DAMAGE);
                setEditingDamageIndex(null);
                showToast('Damage updated successfully.', 'success');
            } catch (e) {
                console.error('handleUpdateDamage error:', e);
            }
        }, [editingDamageIndex, formData, newDamage, showToast]);

        const handleDeleteDamage = useCallback((index) => {
            try {
                if (!window.confirm('Delete this damage record?')) return;
                const updatedDetails = formData.damage_details.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, damage_details: updatedDetails }));
                showToast('Damage deleted.', 'error');
            } catch (e) {
                console.error('handleDeleteDamage error:', e);
            }
        }, [formData, showToast]);

        // --- Equipment Handlers ---
        const handleAddEquipment = useCallback(() => {
            try {
                if (!newEquipment.name) {
                    showToast('Please enter equipment name.', 'warning');
                    return;
                }
                const equipToAdd = {
                    ...newEquipment,
                    id: Date.now(),
                    date: new Date().toISOString(),
                    reportedBy: currentUser?.name || 'Unknown'
                };
                setFormData(prev => ({
                    ...prev,
                    equipment_details: [...(prev.equipment_details || []), equipToAdd]
                }));
                setNewEquipment(EMPTY_EQUIPMENT);
                showToast('Equipment added successfully.', 'success');
            } catch (e) {
                console.error('handleAddEquipment error:', e);
            }
        }, [newEquipment, currentUser, showToast]);

        const handleEditEquipment = useCallback((index) => {
            try {
                const equip = formData.equipment_details[index];
                setNewEquipment({
                    name: equip.name || '',
                    description: equip.description || '',
                    cost: equip.cost || '',
                    status: equip.status || 'Reported',
                    image: equip.image || null
                });
                setEditingEquipmentIndex(index);
            } catch (e) {
                console.error('handleEditEquipment error:', e);
            }
        }, [formData]);

        const handleUpdateEquipment = useCallback(() => {
            try {
                if (editingEquipmentIndex === null) return;
                const updated = [...formData.equipment_details];
                updated[editingEquipmentIndex] = {
                    ...newEquipment,
                    id: updated[editingEquipmentIndex].id,
                    date: updated[editingEquipmentIndex].date,
                    reportedBy: updated[editingEquipmentIndex].reportedBy
                };
                setFormData(prev => ({ ...prev, equipment_details: updated }));
                setNewEquipment(EMPTY_EQUIPMENT);
                setEditingEquipmentIndex(null);
                showToast('Equipment updated successfully.', 'success');
            } catch (e) {
                console.error('handleUpdateEquipment error:', e);
            }
        }, [editingEquipmentIndex, formData, newEquipment, showToast]);

        const handleDeleteEquipment = useCallback((index) => {
            try {
                if (!window.confirm('Delete this equipment record?')) return;
                const updated = formData.equipment_details.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, equipment_details: updated }));
                showToast('Equipment deleted.', 'error');
            } catch (e) {
                console.error('handleDeleteEquipment error:', e);
            }
        }, [formData, showToast]);

        // --- Staff Handlers ---
        const handleAddStaff = useCallback(() => {
            try {
                if (!newStaff.name) {
                    showToast('Please enter staff name.', 'warning');
                    return;
                }
                const staffToAdd = {
                    ...newStaff,
                    id: Date.now(),
                    dateAdded: new Date().toISOString()
                };
                setFormData(prev => ({
                    ...prev,
                    affected_staff: [...(prev.affected_staff || []), staffToAdd]
                }));
                setNewStaff(EMPTY_STAFF);
                showToast('Staff added successfully.', 'success');
            } catch (e) {
                console.error('handleAddStaff error:', e);
            }
        }, [newStaff, showToast]);

        const handleEditStaff = useCallback((index) => {
            try {
                const staff = formData.affected_staff[index];
                setNewStaff({
                    name: staff.name || '',
                    area: staff.area || '',
                    assistance: staff.assistance || '',
                    status: staff.status || 'Active'
                });
                setEditingStaffIndex(index);
            } catch (e) {
                console.error('handleEditStaff error:', e);
            }
        }, [formData]);

        const handleUpdateStaff = useCallback(() => {
            try {
                if (editingStaffIndex === null) return;
                const updatedStaff = [...formData.affected_staff];
                updatedStaff[editingStaffIndex] = {
                    ...newStaff,
                    id: updatedStaff[editingStaffIndex].id,
                    dateAdded: updatedStaff[editingStaffIndex].dateAdded
                };
                setFormData(prev => ({ ...prev, affected_staff: updatedStaff }));
                setNewStaff(EMPTY_STAFF);
                setEditingStaffIndex(null);
                showToast('Staff updated successfully.', 'success');
            } catch (e) {
                console.error('handleUpdateStaff error:', e);
            }
        }, [editingStaffIndex, formData, newStaff, showToast]);

        const handleDeleteStaff = useCallback((index) => {
            try {
                if (!window.confirm('Delete this staff record?')) return;
                const updatedStaff = formData.affected_staff.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, affected_staff: updatedStaff }));
                showToast('Staff deleted.', 'error');
            } catch (e) {
                console.error('handleDeleteStaff error:', e);
            }
        }, [formData, showToast]);

        // --- Report Submission ---
        const openReportModal = useCallback(() => {
            try {
                const currentData = officesData[selectedOffice] || {};
                setReportFormData({
                    warning_signals: { ...(currentData.warning_signals || {}) },
                    general_weather: currentData.general_weather || '',
                    related_incidents: currentData.related_incidents || 0,
                    casualties: currentData.casualties || 0,
                    power_status: currentData.power_status || '',
                    communication_lines: currentData.communication_lines || '',
                    damage_facilities: currentData.damage_facilities || '',
                    work_suspension: currentData.work_suspension || false,
                    assistance_provided: currentData.assistance_provided || '',
                    remark: currentData.remark || '',
                    remark_related_incidents: currentData.remark_related_incidents || '',
                    remark_casualties: currentData.remark_casualties || '',
                    remark_power_status: currentData.remark_power_status || '',
                    remark_communication_lines: currentData.remark_communication_lines || '',
                    remark_damage_facilities: currentData.remark_damage_facilities || '',
                    remark_work_suspension: currentData.remark_work_suspension || '',
                    remark_assistance_provided: currentData.remark_assistance_provided || '',
                    municipalities: [...(currentData.municipalities || [])],
                    damage_details: [...(currentData.damage_details || [])],
                    equipment_details: [...(currentData.equipment_details || [])],
                    affected_staff: [...(currentData.affected_staff || [])],
                    imageUrl: currentData.imageUrl || OFFICE_IMAGE_MAP[selectedOffice] || DOST_MASTER_LOGO,
                });
                toggleModal('report');
            } catch (e) {
                console.error('openReportModal error:', e);
            }
        }, [officesData, selectedOffice, toggleModal]);

        const submitReport = useCallback(() => {
            try {
                if (!reportFormData) {
                    showToast('No data to submit.', 'warning');
                    return;
                }

                const submitData = {
                    ...reportFormData,
                    warning_signals: { ...(reportFormData.warning_signals || {}) },
                    municipalities: [...(reportFormData.municipalities || [])],
                    damage_details: (reportFormData.damage_details || []).map(d => ({ ...d })),
                    equipment_details: (reportFormData.equipment_details || []).map(e => ({ ...e })),
                    affected_staff: (reportFormData.affected_staff || []).map(s => ({ ...s }))
                };

                const newReport = {
                    id: Date.now(),
                    office: selectedOffice,
                    submittedBy: currentUser?.name || currentUser?.email || 'Unknown User',
                    submittedAt: new Date().toISOString(),
                    status: 'pending',
                    data: submitData,
                    remarks: ''
                };

                setPendingReports(prev => [newReport, ...prev]);
                // Persist pending reports to backend immediately and trigger a sync push
                (async () => {
                    try {
                        // Save pending reports list on server
                        const serverReports = Array.isArray(await dbService.getPendingReports()) ? await dbService.getPendingReports() : [];
                        const merged = [newReport, ...serverReports.filter(r => r.id !== newReport.id)];
                        await dbService.savePendingReports(merged);

                        // Trigger a sync push so other clients pulling the server will receive updates quickly
                        try {
                            const localTs = Date.now();
                            await dbService.syncAllData({ officesData, events, users, pendingReports: merged, notifications, activeMenu, typhoonHistory, _localTs: localTs });
                        } catch (syncErr) {
                            // Not critical; others will pick up via polling
                            console.warn('syncAllData warning:', syncErr);
                        }
                    } catch (e) {
                        console.error('submitReport persistence error:', e);
                    }
                })();
                toggleModal('report');
                setReportFormData(null);

                addNotification('Report Submitted', `${selectedOffice} has submitted a new report for approval.`, 'info');
                showToast('Report submitted for approval.', 'success');
            } catch (e) {
                console.error('submitReport error:', e);
                showToast('Failed to submit report.', 'error');
            }
        }, [reportFormData, selectedOffice, currentUser, setPendingReports, toggleModal, addNotification, showToast]);

        const approveReport = useCallback(async (reportId) => {
            try {
                const report = pendingReports.find(r => r.id === reportId);
                if (!report) {
                    showToast('Report not found.', 'error');
                    return;
                }

                setOfficesData(prev => ({
                    ...prev,
                    [report.office]: {
                        ...prev[report.office],
                        ...report.data,
                        warning_signals: { ...prev[report.office]?.warning_signals, ...report.data.warning_signals },
                        municipalities: [...(report.data.municipalities || prev[report.office]?.municipalities || [])],
                        damage_details: [...(report.data.damage_details || prev[report.office]?.damage_details || [])],
                        equipment_details: [...(report.data.equipment_details || prev[report.office]?.equipment_details || [])],
                        affected_staff: [...(report.data.affected_staff || prev[report.office]?.affected_staff || [])],
                        imageUrl: report.data.imageUrl || prev[report.office]?.imageUrl || OFFICE_IMAGE_MAP[report.office] || DOST_MASTER_LOGO,
                    }
                }));

                const updatedReports = pendingReports.map(r =>
                    r.id === reportId ? { ...r, status: 'approved' } : r
                );

                setPendingReports(updatedReports);
                setSelectedReport(prev => prev?.id === reportId ? { ...prev, status: 'approved' } : prev);

                addNotification('Report Approved', `Report from ${report.office} was approved and applied.`, 'success');
                showToast(`Report for ${report.office} approved and applied.`, 'success');

                try {
                    await dbService.savePendingReports(updatedReports);
                    const localTs = Date.now();
                    await dbService.syncAllData({ officesData, events, users, pendingReports: updatedReports, notifications, activeMenu, typhoonHistory, _localTs: localTs });
                } catch (syncError) {
                    console.warn('Approve report persistence warning:', syncError);
                }
            } catch (e) {
                console.error('approveReport error:', e);
                showToast('Failed to approve report.', 'error');
            }
        }, [pendingReports, setOfficesData, setPendingReports, setSelectedReport, officesData, events, users, notifications, activeMenu, typhoonHistory, addNotification, showToast]);

        const handleRejectReport = useCallback(async (reportId, reason) => {
            try {
                if (!reason || !reason.trim()) {
                    showToast('Please provide a rejection reason.', 'warning');
                    return;
                }

                const updatedReports = pendingReports.map(r =>
                    r.id === reportId ? { ...r, status: 'rejected', remarks: reason } : r
                );

                setPendingReports(updatedReports);
                setSelectedReport(prev => prev?.id === reportId ? { ...prev, status: 'rejected', remarks: reason } : prev);

                const report = updatedReports.find(r => r.id === reportId);
                addNotification('Report Rejected', `Report from ${report?.office || 'Unknown office'} was rejected. Reason: ${reason}`, 'error');
                showToast('Report rejected.', 'error');

                try {
                    await dbService.savePendingReports(updatedReports);
                    const localTs = Date.now();
                    await dbService.syncAllData({ officesData, events, users, pendingReports: updatedReports, notifications, activeMenu, typhoonHistory, _localTs: localTs });
                } catch (syncError) {
                    console.warn('Reject report persistence warning:', syncError);
                }
            } catch (e) {
                console.error('handleRejectReport error:', e);
            }
        }, [pendingReports, setPendingReports, setSelectedReport, officesData, events, users, notifications, activeMenu, typhoonHistory, addNotification, showToast]);

        const openRejectReportModal = useCallback((report) => {
            try {
                if (!report) return;
                setSelectedReport(report);
                setReportRejectReason('');
                setModals(prev => ({
                    ...prev,
                    reportReview: false,
                    reportReject: true,
                }));
            } catch (e) {
                console.error('openRejectReportModal error:', e);
            }
        }, []);

        const confirmRejectReport = useCallback(() => {
            if (!selectedReport) {
                showToast('No report selected.', 'error');
                return;
            }
            handleRejectReport(selectedReport.id, reportRejectReason);
            setReportRejectReason('');
            setModals(prev => ({ ...prev, reportReject: false }));
        }, [selectedReport, reportRejectReason, handleRejectReport, showToast]);

        // --- Report Form Handlers ---
        const handleReportFieldChange = useCallback((field, value) => {
            try {
                setReportFormData(prev => {
                    if (!prev) {
                        return {
                            warning_signals: {},
                            municipalities: [],
                            damage_details: [],
                            equipment_details: [],
                            affected_staff: [],
                            [field]: value
                        };
                    }
                    return { ...prev, [field]: value };
                });
            } catch (e) {
                console.error('handleReportFieldChange error:', e);
            }
        }, []);

        const handleReportAddDamage = useCallback(() => {
            try {
                if (!reportNewDamage.description.trim()) {
                    showToast('Please enter damage description.', 'warning');
                    return;
                }
                const damage = {
                    ...reportNewDamage,
                    id: Date.now(),
                    date: new Date().toISOString(),
                    reportedBy: currentUser?.name || 'Unknown'
                };
                setReportFormData(prev => {
                    if (!prev) {
                        return {
                            warning_signals: {},
                            municipalities: [],
                            damage_details: [damage],
                            equipment_details: [],
                            affected_staff: []
                        };
                    }
                    return { ...prev, damage_details: [...(prev.damage_details || []), damage] };
                });
                setReportNewDamage(EMPTY_DAMAGE);
                showToast('Damage added.', 'success');
            } catch (e) {
                console.error('handleReportAddDamage error:', e);
            }
        }, [reportNewDamage, currentUser, showToast]);

        const handleReportAddEquipment = useCallback(() => {
            try {
                if (!reportNewEquipment.name.trim()) {
                    showToast('Please enter equipment name.', 'warning');
                    return;
                }
                const equipment = {
                    ...reportNewEquipment,
                    id: Date.now(),
                    date: new Date().toISOString(),
                    reportedBy: currentUser?.name || 'Unknown'
                };
                setReportFormData(prev => {
                    if (!prev) {
                        return {
                            warning_signals: {},
                            municipalities: [],
                            damage_details: [],
                            equipment_details: [equipment],
                            affected_staff: []
                        };
                    }
                    return { ...prev, equipment_details: [...(prev.equipment_details || []), equipment] };
                });
                setReportNewEquipment(EMPTY_EQUIPMENT);
                showToast('Equipment added.', 'success');
            } catch (e) {
                console.error('handleReportAddEquipment error:', e);
            }
        }, [reportNewEquipment, currentUser, showToast]);

        const handleReportAddStaff = useCallback(() => {
            try {
                if (!reportNewStaff.name.trim()) {
                    showToast('Please enter staff name.', 'warning');
                    return;
                }
                const staff = {
                    ...reportNewStaff,
                    id: Date.now(),
                    dateAdded: new Date().toISOString()
                };
                setReportFormData(prev => {
                    if (!prev) {
                        return {
                            warning_signals: {},
                            municipalities: [],
                            damage_details: [],
                            equipment_details: [],
                            affected_staff: [staff]
                        };
                    }
                    return { ...prev, affected_staff: [...(prev.affected_staff || []), staff] };
                });
                setReportNewStaff(EMPTY_STAFF);
                showToast('Staff added.', 'success');
            } catch (e) {
                console.error('handleReportAddStaff error:', e);
            }
        }, [reportNewStaff, showToast]);

        // --- Event Management ---
        const handleApproveEvent = useCallback((eventId) => {
            try {
                const event = events.find(e => e.id === eventId);
                setEvents(events.map(e => e.id === eventId ? { ...e, status: 'approved', rejectionReason: '' } : e));
                if (selectedEvent?.id === eventId) setSelectedEvent(prev => prev ? { ...prev, status: 'approved', rejectionReason: '' } : prev);
                addNotification('Event Approved', `Event ${event?.name} has been approved.`, 'success');
                showToast('Event approved and ready for deployment.', 'success');
            } catch (e) {
                console.error('handleApproveEvent error:', e);
            }
        }, [events, setEvents, selectedEvent, addNotification, showToast]);

        const openRejectModal = useCallback((eventId) => {
            try {
                setRejectEventId(eventId);
                setRejectReason('');
                toggleModal('reject');
            } catch (e) {
                console.error('openRejectModal error:', e);
            }
        }, [toggleModal]);

        const confirmRejectEvent = useCallback(() => {
            try {
                if (!rejectReason.trim()) {
                    showToast('Please provide a rejection reason.', 'warning');
                    return;
                }
                const eventName = events.find(e => e.id === rejectEventId)?.name;
                setEvents(events.map(e => e.id === rejectEventId ? { ...e, status: 'rejected', rejectionReason: rejectReason, deployment: 'Draft' } : e));
                if (selectedEvent?.id === rejectEventId) setSelectedEvent(prev => prev ? { ...prev, status: 'rejected', rejectionReason: rejectReason } : prev);
                addNotification('Event Rejected', `Event ${eventName} was rejected. Reason: ${rejectReason}`, 'error');
                toggleModal('reject');
                setRejectEventId(null);
                setRejectReason('');
                showToast('Event rejected.', 'error');
            } catch (e) {
                console.error('confirmRejectEvent error:', e);
            }
        }, [rejectReason, events, rejectEventId, setEvents, selectedEvent, addNotification, toggleModal, showToast]);

        const parseNumber = (value) => {
            if (value === null || value === undefined || value === '') return 0;
            if (typeof value === 'number' && Number.isFinite(value)) return value;
            if (typeof value === 'string') {
                const cleaned = value.replace(/[^0-9.-]/g, '');
                const parsed = Number(cleaned);
                return Number.isFinite(parsed) ? parsed : 0;
            }
            if (typeof value === 'object') {
                return parseNumber(value.amount ?? value.cost ?? value.value ?? value.total);
            }
            return 0;
        };

        const createHistoryArchiveEntry = useCallback((eventToArchive, snapshotData = officesData) => {
            try {
                if (!eventToArchive) return null;

                const snapshot = {};
                let totalBuildingDamage = 0;
                let totalEquipmentDamage = 0;
                let totalCasualties = 0;
                let totalAffectedStaff = 0;
                const aggregatedDamage = [];
                const aggregatedEquipment = [];
                const aggregatedStaff = [];

                Object.keys(snapshotData || {}).forEach(key => {
                    const office = snapshotData[key] || {};
                    const damageItems = Array.isArray(office.damage_details) ? office.damage_details : [];
                    const equipmentItems = Array.isArray(office.equipment_details) ? office.equipment_details : [];
                    const staffItems = Array.isArray(office.affected_staff) ? office.affected_staff : [];
                    const buildingDamage = damageItems.reduce((sum, item) => sum + parseNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total), 0);
                    const equipmentDamage = equipmentItems.reduce((sum, item) => sum + parseNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total), 0);
                    const casualties = parseNumber(office.casualties);
                    const affectedStaff = staffItems.length;

                    snapshot[key] = {
                        ...office,
                        damage_details: damageItems,
                        equipment_details: equipmentItems,
                        affected_staff: staffItems,
                        casualties,
                        buildingDamage,
                        equipmentDamage,
                        affectedStaff,
                    };

                    totalBuildingDamage += buildingDamage;
                    totalEquipmentDamage += equipmentDamage;
                    totalCasualties += casualties;
                    totalAffectedStaff += affectedStaff;
                    aggregatedDamage.push(...damageItems);
                    aggregatedEquipment.push(...equipmentItems);
                    aggregatedStaff.push(...staffItems);
                });

                return {
                    ...eventToArchive,
                    deployment: 'Draft',
                    status: 'archived',
                    archivedAt: new Date().toISOString(),
                    officesSnapshot: snapshot,
                    buildingsSnapshot: snapshot,
                    buildingDamage: totalBuildingDamage,
                    equipmentDamage: totalEquipmentDamage,
                    casualties: totalCasualties,
                    affectedStaff: totalAffectedStaff,
                    damage_details: aggregatedDamage,
                    equipment_details: aggregatedEquipment,
                    affected_staff: aggregatedStaff,
                };
            } catch (e) {
                console.error('createHistoryArchiveEntry error:', e);
                return null;
            }
        }, [officesData]);

        const appendHistoryEntry = useCallback((eventToArchive, snapshotData = officesData) => {
            try {
                const historyEntry = createHistoryArchiveEntry(eventToArchive, snapshotData);
                if (!historyEntry) return;

                setTyphoonHistory(prev => {
                    const next = prev.some(entry => entry.id === historyEntry.id)
                        ? prev.map(entry => entry.id === historyEntry.id ? historyEntry : entry)
                        : [historyEntry, ...prev];
                    saveToStorage(STORAGE_KEYS.HISTORY, next);
                    return next;
                });
            } catch (e) {
                console.error('appendHistoryEntry error:', e);
            }
        }, [createHistoryArchiveEntry, setTyphoonHistory]);

        const handleDeployEvent = useCallback((eventId) => {
            try {
                if (!canDeployEvents) {
                    showToast('Only super admins can deploy events.', 'warning');
                    return;
                }
                const eventToDeploy = events.find(e => e.id === eventId);
                if (!eventToDeploy) {
                    showToast('Event not found.', 'error');
                    return;
                }
                if (eventToDeploy.status !== 'approved') {
                    showToast('Only approved events can be deployed.', 'warning');
                    return;
                }
                if (!window.confirm('Deploy this event? It will become the active event.')) return;

                // Find currently deployed event
                const currentlyDeployed = events.find(e => e.deployment === 'Deployed' && e.id !== eventId);

                if (currentlyDeployed) {
                    appendHistoryEntry(currentlyDeployed, officesData);
                }

                // Update events - mark the new one as deployed
                setEvents(events.map(e => ({
                    ...e,
                    deployment: e.id === eventId ? 'Deployed' : (e.deployment === 'Deployed' ? 'Draft' : e.deployment),
                    status: e.id === eventId ? 'active' : (e.status === 'active' ? 'draft' : e.status)
                })));

                addNotification('Event Deployed', `Event ${eventToDeploy.name} is now the active typhoon.`, 'success');
                showToast('Event deployed.', 'success');

                // Reset PSTO office data for the newly deployed event
                try {
                    resetPSTODataForNewEvent();
                } catch (e) {
                    console.error('Failed to reset PSTO data after deploy:', e);
                }
            } catch (e) {
                console.error('handleDeployEvent error:', e);
                showToast('Failed to deploy event.', 'error');
            }
        }, [canDeployEvents, events, officesData, setEvents, appendHistoryEntry, addNotification, showToast, resetPSTODataForNewEvent]);

        const handleAddEvent = useCallback(() => {
            try {
                if (!canEditEvents && !isEditingEvent) {
                    showToast('Only admins can add/edit events.', 'warning');
                    return;
                }
                if (!newEvent.name.trim()) {
                    showToast('Event name is required.', 'warning');
                    return;
                }

                const existingEvents = Array.isArray(events) ? events : [];

                if (isEditingEvent && newEvent.id) {
                    const formattedDate = newEvent.startDateTime ?
                        new Date(newEvent.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                        (newEvent.date || new Date().toLocaleDateString());
                    const provinces = newEvent.sendToAllUsers ? ALL_PROVINCES : newEvent.provinces;
                    setEvents(existingEvents.map(e => e.id === newEvent.id ? ({ ...e, ...newEvent, provinces, date: formattedDate, type: e.type || 'Tropical Cyclone' }) : e));
                    if (newEvent.deployment === 'Deployed') {
                        const currentlyDeployed = existingEvents.find(e => e.deployment === 'Deployed' && e.id !== newEvent.id);
                        if (currentlyDeployed) {
                            appendHistoryEntry(currentlyDeployed, officesData);
                        }
                    }
                    addNotification('Event Edited', `Event ${newEvent.name} has been updated.`, 'info');
                    showToast('Event edited successfully.', 'success');
                    setIsEditingEvent(false);
                    resetNewEventForm();
                    toggleModal('add');
                    return;
                }

                const newId = existingEvents.length > 0 ? Math.max(...existingEvents.map(e => Number(e.id) || 0)) + 1 : 1;
                const formattedDate = newEvent.startDateTime ?
                    new Date(newEvent.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
                    new Date().toLocaleDateString();
                const newStatus = newEvent.deployment === 'Deployed' ? 'active' : 'pending';
                const provinces = newEvent.sendToAllUsers ? ALL_PROVINCES : (newEvent.provinces.length > 0 ? newEvent.provinces : ALL_PROVINCES);

                const newEventObj = {
                    ...newEvent,
                    id: newId,
                    date: formattedDate,
                    status: newStatus,
                    type: 'Tropical Cyclone',
                    provinces: provinces,
                    rejectionReason: '',
                    createdAt: new Date().toISOString()
                };

                setEvents([newEventObj, ...existingEvents]);

                if (newEvent.deployment === 'Deployed') {
                    const currentlyDeployed = existingEvents.find(e => e.deployment === 'Deployed');
                    if (currentlyDeployed) {
                        appendHistoryEntry(currentlyDeployed, officesData);
                    }
                    addNotification('Event Created', `New event "${newEvent.name}" has been created and is now active.`, 'success');
                    showToast('Event created successfully.', 'success');
                } else {
                    addNotification('Event Created', `New event "${newEvent.name}" has been created.`, 'success');
                    showToast('Event created successfully.', 'success');
                }

                resetNewEventForm();
                toggleModal('add');
            } catch (e) {
                console.error('handleAddEvent error:', e);
                showToast('Failed to create event.', 'error');
            }
        }, [canEditEvents, isEditingEvent, newEvent, events, officesData, setEvents, appendHistoryEntry, resetPSTODataForNewEvent, addNotification, toggleModal, showToast, resetNewEventForm]);

        const handleEditEvent = useCallback((event) => {
            try {
                setNewEvent({
                    id: event.id,
                    name: event.name || '',
                    startDateTime: event.startDateTime || '',
                    endDateTime: event.endDateTime || '',
                    alertLevel: event.alertLevel || '',
                    category: event.category || event.type || '',
                    deployment: event.deployment || 'Draft',
                    provinces: event.provinces ? [...event.provinces] : [],
                    sendToAllUsers: event.provinces?.length === ALL_PROVINCES.length,
                    reportLink: event.reportLink || '',
                    trackPositions: event.trackPositions || '',
                    intensity: event.intensity || '',
                    related_incidents: event.related_incidents ?? 0,
                    remark_related_incidents: event.remark_related_incidents || '',
                    casualties: event.casualties ?? 0,
                    remark_casualties: event.remark_casualties || '',
                    power_status: event.power_status || '',
                    remark_power_status: event.remark_power_status || '',
                    communication_lines: event.communication_lines || '',
                    remark_communication_lines: event.remark_communication_lines || '',
                    damage_facilities: event.damage_facilities || '',
                    remark_damage_facilities: event.remark_damage_facilities || '',
                    work_suspension: event.work_suspension || false,
                    remark_work_suspension: event.remark_work_suspension || '',
                    assistance_provided: event.assistance_provided || '',
                    remark_assistance_provided: event.remark_assistance_provided || '',
                    imageUrl: event.imageUrl || '',
                    status: event.status || 'pending',
                    rejectionReason: event.rejectionReason || ''
                });
                setIsEditingEvent(true);
                toggleModal('add');
                toggleModal('details');
            } catch (e) {
                console.error('handleEditEvent error:', e);
            }
        }, [toggleModal]);

        const handleDeleteEvent = useCallback((eventId) => {
            try {
                if (!window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) return;
                const eventName = events.find(e => e.id === eventId)?.name;
                setEvents(events.filter(e => e.id !== eventId));
                toggleModal('details');
                addNotification('Event Deleted', `Event ${eventName} has been permanently deleted.`, 'error');
                showToast('Event deleted.', 'error');
            } catch (e) {
                console.error('handleDeleteEvent error:', e);
            }
        }, [events, setEvents, toggleModal, addNotification, showToast]);

        const handleViewEvent = useCallback((event) => {
            try {
                setSelectedEvent(event);
                toggleModal('details');
            } catch (e) {
                console.error('handleViewEvent error:', e);
            }
        }, [toggleModal]);

        const handleSaveReportLink = useCallback(() => {
            try {
                setEvents(events.map(event =>
                    event.id === selectedEvent.id ? { ...event, reportLink: reportLinkInput } : event
                ));
                setSelectedEvent({ ...selectedEvent, reportLink: reportLinkInput });
                setIsEditingReportLink(false);
                setReportLinkInput('');
                showToast('Report link saved.', 'success');
            } catch (e) {
                console.error('handleSaveReportLink error:', e);
            }
        }, [events, selectedEvent, reportLinkInput, setEvents, showToast]);

        // --- User Management ---
        const handleSaveUser = useCallback(() => {
            try {
                if (!userForm.name || !userForm.email) {
                    showToast('Name and email are required.', 'warning');
                    return;
                }
                if (!/\S+@\S+\.\S+/.test(userForm.email)) {
                    showToast('Invalid email format.', 'warning');
                    return;
                }
                if (!isEditingUser && (!userForm.password || userForm.password.length < 6)) {
                    showToast('Password must be at least 6 characters.', 'warning');
                    return;
                }
                if (isEditingUser) {
                    setUsers(users.map(u => u.id === userForm.id ? { ...u, ...userForm, password: userForm.password || u.password } : u));
                    addNotification('User Updated', `User ${userForm.name} has been updated.`, 'info');
                    showToast('User updated.', 'success');
                } else {
                    const newId = Math.max(0, ...users.map(u => u.id)) + 1;
                    setUsers([{ ...userForm, id: newId }, ...users]);
                    addNotification('User Created', `New user ${userForm.name} (${userForm.role}) has been created.`, 'success');
                    showToast('User created.', 'success');
                }
                toggleModal('user');
                setIsEditingUser(false);
                setUserForm({ id: null, name: '', email: '', office: selectedOffice || 'PSTO-La Union', role: 'USER', status: 'Active', password: '', profileImage: '' });
            } catch (e) {
                console.error('handleSaveUser error:', e);
            }
        }, [userForm, isEditingUser, users, setUsers, selectedOffice, addNotification, showToast, toggleModal]);

        const handleDeleteUser = useCallback((userId) => {
            try {
                if (!window.confirm('Delete this user? This action cannot be undone.')) return;
                const userName = users.find(u => u.id === userId)?.name;
                setUsers(users.filter(u => u.id !== userId));
                addNotification('User Deleted', `User ${userName} has been deleted.`, 'error');
                showToast('User deleted.', 'error');
            } catch (e) {
                console.error('handleDeleteUser error:', e);
            }
        }, [users, setUsers, addNotification, showToast]);

        // --- Export / Import ---
        const exportData = useCallback(() => {
            try {
                const exportObj = {
                    officesData,
                    events,
                    users,
                    pendingReports,
                    notifications,
                    typhoonHistory,
                    settings: settingsData,
                    version: '2.0'
                };
                const dataStr = JSON.stringify(exportObj, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `dost_dashboard_backup_${new Date().toISOString().slice(0, 19)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                addNotification('Data Exported', 'Backup exported successfully.', 'info');
                showToast('Data exported successfully.', 'success');
            } catch (e) {
                console.error('exportData error:', e);
                showToast('Failed to export data.', 'error');
            }
        }, [officesData, events, users, pendingReports, notifications, typhoonHistory, settingsData, addNotification, showToast]);

        const importData = useCallback((e) => {
            try {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const imported = JSON.parse(ev.target.result);
                        if (imported.officesData) setOfficesData(imported.officesData);
                        if (imported.events) setEvents(archiveOldEvents(imported.events));
                        if (imported.users) setUsers(imported.users);
                        if (imported.pendingReports) setPendingReports(imported.pendingReports);
                        if (imported.notifications) setNotifications(imported.notifications);
                        if (imported.typhoonHistory) setTyphoonHistory(imported.typhoonHistory);
                        if (imported.settings) setSettingsData(imported.settings);
                        addNotification('Data Imported', 'Dashboard data has been restored from backup.', 'success');
                        showToast('Data imported successfully.', 'success');
                    } catch (err) {
                        console.error('Import parse error:', err);
                        showToast('Invalid file format.', 'error');
                    }
                };
                reader.onerror = () => showToast('Failed to read file.', 'error');
                reader.readAsText(file);
                e.target.value = '';
            } catch (e) {
                console.error('importData error:', e);
                showToast('Failed to import data.', 'error');
            }
        }, [setOfficesData, setEvents, setUsers, setPendingReports, setNotifications, setTyphoonHistory, setSettingsData, addNotification, showToast]);

        const resetToDefaultData = useCallback(() => {
            try {
                if (!isSuperAdmin) return;
                if (window.confirm('⚠️ Reset all data to factory defaults?')) {
                    setOfficesData(DEFAULT_OFFICE_DATA);
                    setEvents(archiveOldEvents(DEFAULT_EVENTS));
                    setUsers(DEFAULT_USERS);
                    setPendingReports([]);
                    setNotifications([]);
                    setTyphoonHistory([]);
                    addNotification('System Reset', 'All data has been reset to factory defaults.', 'warning');
                    showToast('Data reset to default.', 'success');
                }
            } catch (e) {
                console.error('resetToDefaultData error:', e);
            }
        }, [isSuperAdmin, setOfficesData, setEvents, setUsers, setPendingReports, setNotifications, setTyphoonHistory, addNotification, showToast]);

        const clearAllNotifications = useCallback(() => {
            try {
                setNotifications([]);
                addNotification('Notifications Cleared', 'All notification history has been cleared.', 'info');
                showToast('Notifications cleared.', 'success');
            } catch (e) {
                console.error('clearAllNotifications error:', e);
            }
        }, [setNotifications, addNotification, showToast]);

        const markNotificationRead = useCallback((id) => {
            try {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            } catch (e) {
                console.error('markNotificationRead error:', e);
            }
        }, [setNotifications]);

        const toggleSection = useCallback((section) => {
            try {
                setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
            } catch (e) {
                console.error('toggleSection error:', e);
            }
        }, []);

        // --- Excel Export ---
        const handleExportExcel = useCallback(() => {
            try {
                const wb = XLSX.utils.book_new();

                const reportData = [];
                reportData.push(['SITUATIONAL REPORT']);
                reportData.push([]);
                reportData.push(['SITUATIONAL REPORT NO.', '2']);
                reportData.push(['TROPICAL CYCLONE:', activeEvent?.name || 'N/A']);
                reportData.push(['CATEGORY:', activeEvent?.category || 'N/A']);
                reportData.push(['DATE:', new Date().toLocaleString()]);
                reportData.push([]);
                reportData.push(['I. SITUATION SUMMARY']);
                reportData.push([]);
                reportData.push(['A. GENERAL WEATHER CONDITION']);
                reportData.push(['PROVINCE', 'TROPICAL CYCLONE WARNING SIGNAL', 'GENERAL WEATHER SITUATION']);

                ALL_PROVINCES.forEach(prov => {
                    const officeKey = Object.keys(officesData).find(key => key.includes(prov));
                    const data = officeKey ? officesData[officeKey] : null;
                    const signals = data?.warning_signals ?
                        Object.entries(data.warning_signals).map(([mun, sig]) => `${mun} (Signal ${sig})`).join('; ') :
                        'No signal';
                    reportData.push([prov, signals, data?.general_weather || '']);
                });
                reportData.push([]);
                reportData.push(['II. EFFECTS']);
                reportData.push([]);
                reportData.push(['A. RELATED INCIDENTS']);
                reportData.push(['OFFICE', 'INCIDENTS', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    const incidents = data.related_incidents || 0;
                    reportData.push([
                        office,
                        `${incidents} - ${incidents === 0 ? 'No incidents reported' : incidents + ' incident(s) reported'}`,
                        data.remark_related_incidents || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['B. CASUALTIES']);
                reportData.push(['PROVINCE', 'CASUALTIES', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    const casualties = data.casualties || 0;
                    reportData.push([
                        office,
                        `${casualties} - ${casualties === 0 ? 'No casualties reported' : casualties + ' casualty(ies) reported'}`,
                        data.remark_casualties || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['C. POWER']);
                reportData.push(['PROVINCE', 'POWER STATUS', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    reportData.push([
                        office,
                        data.power_status || '0 - No data',
                        data.remark_power_status || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['D. COMMUNICATION LINES']);
                reportData.push(['PROVINCE', 'COMMUNICATION STATUS', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    reportData.push([
                        office,
                        data.communication_lines || '0 - No data',
                        data.remark_communication_lines || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['E. DAMAGE TO FACILITIES/EQUIPMENT']);
                reportData.push(['PROVINCE', 'DAMAGE STATUS', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    reportData.push([
                        office,
                        data.damage_facilities || '0 - No damage reported',
                        data.remark_damage_facilities || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['F. WORK SUSPENSION']);
                reportData.push(['PROVINCE', 'SUSPENSION STATUS', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    const suspension = data.work_suspension ? '1 - Work Suspension declared' : '0 - No suspension';
                    reportData.push([
                        office,
                        suspension,
                        data.remark_work_suspension || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['G. ASSISTANCE PROVIDED']);
                reportData.push(['PROVINCE', 'ASSISTANCE', 'REMARKS']);
                Object.entries(officesData).forEach(([office, data]) => {
                    reportData.push([
                        office,
                        data.assistance_provided || 'None',
                        data.remark_assistance_provided || ''
                    ]);
                });
                reportData.push([]);
                reportData.push(['DAMAGE BUILDING DETAILS']);
                reportData.push(['PROVINCE', 'DESCRIPTION', 'COST', 'STATUS', 'DATE']);
                let hasBuildingDamage = false;
                Object.entries(officesData).forEach(([office, data]) => {
                    if (data.damage_details && data.damage_details.length > 0) {
                        hasBuildingDamage = true;
                        data.damage_details.forEach(damage => {
                            reportData.push([
                                office,
                                damage.description || '',
                                damage.cost ? `₱${damage.cost}` : '',
                                damage.status || 'Reported',
                                damage.date ? new Date(damage.date).toLocaleDateString() : ''
                            ]);
                        });
                    }
                });
                if (!hasBuildingDamage) {
                    reportData.push(['No building damage records reported.', '', '', '', '']);
                }
                reportData.push([]);
                reportData.push(['EQUIPMENT DAMAGE DETAILS']);
                reportData.push(['PROVINCE', 'EQUIPMENT NAME', 'DESCRIPTION', 'COST', 'STATUS', 'DATE']);
                let hasEquipmentDamage = false;
                Object.entries(officesData).forEach(([office, data]) => {
                    if (data.equipment_details && data.equipment_details.length > 0) {
                        hasEquipmentDamage = true;
                        data.equipment_details.forEach(equip => {
                            reportData.push([
                                office,
                                equip.name || '',
                                equip.description || '',
                                equip.cost ? `₱${equip.cost}` : '',
                                equip.status || 'Reported',
                                equip.date ? new Date(equip.date).toLocaleDateString() : ''
                            ]);
                        });
                    }
                });
                if (!hasEquipmentDamage) {
                    reportData.push(['No equipment damage records reported.', '', '', '', '', '']);
                }
                reportData.push([]);
                reportData.push(['AFFECTED STAFF DETAILS']);
                reportData.push(['PROVINCE', 'STAFF NAME', 'AREA', 'ASSISTANCE', 'STATUS']);
                let hasStaff = false;
                Object.entries(officesData).forEach(([office, data]) => {
                    if (data.affected_staff && data.affected_staff.length > 0) {
                        hasStaff = true;
                        data.affected_staff.forEach(staff => {
                            reportData.push([
                                office,
                                staff.name || '',
                                staff.area || '',
                                staff.assistance || 'None',
                                staff.status || 'Active'
                            ]);
                        });
                    }
                });
                if (!hasStaff) {
                    reportData.push(['No affected staff records reported.', '', '', '', '']);
                }
                reportData.push([]);
                reportData.push(['NARRATIVE SUMMARY']);
                const narrative = Object.values(officesData).map(office => office.remark).filter(Boolean).join(' ') || 'No additional remarks.';
                reportData.push([narrative]);
                reportData.push([]);
                reportData.push(['Prepared by:']);
                reportData.push(['DOST 1 DRRM OFFICERS']);
                reportData.push(['Regional/Provincial Focal']);
                reportData.push(['']);
                reportData.push(['EDRUSSELL S. CASTILLO']);
                reportData.push(['Project Technical Assistant I']);
                reportData.push(['DRRM Unit Staff']);
                reportData.push(['']);
                reportData.push(['MICHAEL JOHN C. MAQUILING']);
                reportData.push(['Supervising Science Research Specialist']);
                reportData.push(['DRRMU Regional Focal']);
                reportData.push([]);
                reportData.push(['Noted by:']);
                reportData.push([]);
                reportData.push(['DR. TERESITA A. TABAOG']);
                reportData.push(['Regional Director']);

                const ws = XLSX.utils.aoa_to_sheet(reportData);

                // Set professional column widths
                ws['!cols'] = [
                    { wch: 20 }, { wch: 35 }, { wch: 35 }, { wch: 20 }, { wch: 20 }
                ].concat(Array(95).fill({ wch: 18 }));

                // Define styles
                const titleStyle = {
                    fill: { fgColor: { rgb: 'FF203864' } },
                    font: { bold: true, color: { rgb: 'FFFFFFFF' }, size: 14 },
                    alignment: { horizontal: 'left', vertical: 'center' },
                    border: { bottom: { style: 'medium' } }
                };
                const headerStyle = {
                    fill: { fgColor: { rgb: 'FF4472C4' } },
                    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
                };
                const sectionHeaderStyle = {
                    fill: { fgColor: { rgb: 'FF70AD47' } },
                    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
                    alignment: { horizontal: 'left', vertical: 'center' },
                    border: { bottom: { style: 'thin' } }
                };
                const dataStyle = {
                    alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
                    border: { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' } }
                };

                // Apply styles to cells
                let rowNum = 1;
                // Title row
                if (ws[`A${rowNum}`]) ws[`A${rowNum}`].s = titleStyle;

                // Apply header styles to all header rows
                for (const cellRef in ws) {
                    if (cellRef.match(/^[A-Z]+\d+$/)) {
                        const row = parseInt(cellRef.match(/\d+$/)[0]);
                        const col = cellRef.match(/^[A-Z]+/)[0];
                        const cellValue = ws[cellRef]?.v;

                        // Apply title style to main title
                        if (row === 1) {
                            ws[cellRef].s = titleStyle;
                        }
                        // Apply section header style to roman numeral sections (I., II., III., etc.)
                        else if (cellValue && String(cellValue).match(/^(I+|IV|IX|X+)\./)) {
                            ws[cellRef].s = sectionHeaderStyle;
                        }
                        // Apply section header style to subsection headers (A., B., C., etc.)
                        else if (cellValue && String(cellValue).match(/^[A-G]\./)) {
                            ws[cellRef].s = sectionHeaderStyle;
                        }
                        // Apply header style to table headers (PROVINCE, INCIDENTS, REMARKS, etc.)
                        else if (cellValue && (String(cellValue).includes('PROVINCE') || String(cellValue).includes('OFFICE') ||
                            String(cellValue).includes('INCIDENTS') || String(cellValue).includes('REMARKS') ||
                            String(cellValue).includes('TROPICAL CYCLONE') || String(cellValue).includes('GENERAL WEATHER') ||
                            String(cellValue).includes('CASUALTIES') || String(cellValue).includes('POWER') ||
                            String(cellValue).includes('COMMUNICATION') || String(cellValue).includes('DAMAGE') ||
                            String(cellValue).includes('SUSPENSION') || String(cellValue).includes('ASSISTANCE') ||
                            String(cellValue).includes('DESCRIPTION') || String(cellValue).includes('COST') ||
                            String(cellValue).includes('STATUS') || String(cellValue).includes('DATE') ||
                            String(cellValue).includes('EQUIPMENT') || String(cellValue).includes('STAFF') ||
                            String(cellValue).includes('AREA') || String(cellValue).includes('NAME'))) {
                            ws[cellRef].s = headerStyle;
                        }
                        // Apply data style with wrapping
                        else if (!ws[cellRef].s) {
                            ws[cellRef].s = dataStyle;
                        }
                    }
                }

                // Set row heights for better visibility
                ws['!rows'] = [];
                ws['!rows'][0] = { hpt: 25 }; // Title row
                ws['!rows'][10] = { hpt: 20 }; // Header rows
                ws['!rows'][22] = { hpt: 20 };

                XLSX.utils.book_append_sheet(wb, ws, 'SITREP');

                // Raw data sheet
                const rawData = [];
                const headers = [
                    'PSTO Office', 'Warning Signals', 'General Weather', 'Related Incidents',
                    'Incident Remarks', 'Casualties', 'Casualty Remarks', 'Power Status',
                    'Power Remarks', 'Communication', 'Comm Remarks', 'Damage',
                    'Damage Remarks', 'Work Suspension', 'Work Suspension Remarks',
                    'Assistance', 'Assistance Remarks', 'Overall Remarks',
                    'Building Damage Count', 'Equipment Damage Count', 'Affected Staff Count'
                ];
                rawData.push(headers);
                Object.entries(officesData).forEach(([office, data]) => {
                    const signals = Object.entries(data.warning_signals || {})
                        .map(([mun, sig]) => `${mun}: ${sig}`)
                        .join('; ') || 'None';
                    rawData.push([
                        office, signals, data.general_weather || '',
                        data.related_incidents ?? 0, data.remark_related_incidents || '',
                        data.casualties ?? 0, data.remark_casualties || '',
                        data.power_status || '', data.remark_power_status || '',
                        data.communication_lines || '', data.remark_communication_lines || '',
                        data.damage_facilities || '', data.remark_damage_facilities || '',
                        data.work_suspension ? 'Yes' : 'No', data.remark_work_suspension || '',
                        data.assistance_provided || '', data.remark_assistance_provided || '',
                        data.remark || '',
                        (data.damage_details || []).length,
                        (data.equipment_details || []).length,
                        (data.affected_staff || []).length
                    ]);
                });

                const wsRaw = XLSX.utils.aoa_to_sheet(rawData);

                // Set compact uniform column widths for alignment
                wsRaw['!cols'] = Array(headers.length).fill({ wch: 15 });

                // Format header row in raw data
                headers.forEach((_, idx) => {
                    const cellRef = XLSX.utils.encode_col(idx) + '1';
                    if (wsRaw[cellRef]) {
                        wsRaw[cellRef].s = { ...headerStyle };
                    }
                });

                // Enable wrapping for all cells in raw data
                for (const key in wsRaw) {
                    if (key.match(/^[A-Z]+\d+$/)) {
                        if (!wsRaw[key].s) wsRaw[key].s = {};
                        wsRaw[key].s.alignment = { ...wsRaw[key].s.alignment, wrapText: true };
                    }
                }

                XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw Data');
                XLSX.writeFile(wb, `SITREP_${activeEvent?.name || 'NO_EVENT'}_${new Date().toISOString().slice(0, 19)}.xlsx`);
                showToast('Situational Report exported successfully.', 'success');
                addNotification('Excel Exported', 'Complete SITREP exported with proper formatting.', 'success');
            } catch (e) {
                console.error('handleExportExcel error:', e);
                showToast('Failed to export Excel.', 'error');
            }
        }, [officesData, activeEvent, showToast, addNotification]);

        // --- Report Generation ---
        const buildReportHtml = useCallback(() => {
            try {
                const generatedAt = new Date().toLocaleString();
                const reportOffices = Object.entries(officesData);

                const summaryRows = reportOffices.map(([officeName, officeData]) => {
                    const warningTags = Object.entries(officeData.warning_signals || {}).map(([mun, signal]) => `${mun} (Signal ${signal})`).join('; ') || 'None';
                    return `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${warningTags}</td><td style="border:1px solid #000;padding:8px;">${officeData.general_weather || 'N/A'}</td></tr>`;
                }).join('');

                return `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>DOST-1 Situational Report</title>
                        <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { font-size: 18px; margin: 10px 0; }
                            h2 { font-size: 16px; margin: 10px 0; }
                            h3 { font-size: 14px; margin: 10px 0; }
                            h4 { font-size: 13px; margin: 8px 0; }
                            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                            th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
                            th { background: #f0f0f0; font-weight: bold; }
                            .footer { margin-top: 20px; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <h1>SITUATIONAL REPORT NO. 1</h1>
                        <p><strong>Event:</strong> ${activeEvent?.name || 'None'} | <strong>Category:</strong> ${activeEvent?.category || 'N/A'} | <strong>Alert Level:</strong> ${activeEvent?.alertLevel || 'N/A'} | <strong>Generated:</strong> ${generatedAt}</p>
                        
                        <h3>I. TROPICAL CYCLONE WARNING SIGNALS</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>WARNING SIGNALS</th>
                                    <th>GENERAL WEATHER</th>
                                </tr>
                            </thead>
                            <tbody>${summaryRows}</tbody>
                        </table>
                        
                        <h3>II. EFFECTS</h3>
                        
                        <h4>A. Related Incidents</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>INCIDENTS</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.related_incidents ?? 0}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_related_incidents || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>
                        
                        <h4>B. Casualties</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>CASUALTIES</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.casualties ?? 0}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_casualties || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>
                        
                        <h4>C. Power Status</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>STATUS</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.power_status || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_power_status || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>
                        
                        <h4>D. Communication Lines</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>STATUS</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.communication_lines || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_communication_lines || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>
                        
                        <h4>E. Damage to Facilities</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>DAMAGE</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.damage_facilities || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_damage_facilities || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>
                        
                        <h4>F. Work Suspension</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>SUSPENSION</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.work_suspension ? 'Suspended' : 'No suspension'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_work_suspension || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>
                        
                        <h4>G. Assistance Provided</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>ASSISTANCE</th>
                                    <th>REMARKS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) =>
                    `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.assistance_provided || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_assistance_provided || '-'}</td></tr>`
                ).join('')}</tbody>
                        </table>

                        <h3>III. DAMAGE BUILDING</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>DAMAGE RECORDS</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) => {
                    const buildingDamages = (officeData.damage_details || []).map(d =>
                        `<div>${d.description || ''}${d.cost ? ` - ₱${d.cost}` : ''}${d.status ? ` (${d.status})` : ''}${d.image ? ` <img src="${d.image}" style="max-width:50px;max-height:50px;" />` : ''}</div>`
                    ).join('');
                    const equipmentDamages = (officeData.equipment_details || []).map(e =>
                        `<div>${e.name || ''}${e.description ? ` - ${e.description}` : ''}${e.cost ? ` - ₱${e.cost}` : ''}${e.status ? ` (${e.status})` : ''}${e.image ? ` <img src="${e.image}" style="max-width:50px;max-height:50px;" />` : ''}</div>`
                    ).join('');
                    const damages = (buildingDamages + equipmentDamages) || 'No damage details';
                    return `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${damages}</td></tr>`;
                }).join('')}</tbody>
                        </table>

                        <h3>IV. AFFECTED STAFF</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>OFFICE</th>
                                    <th>STAFF</th>
                                </tr>
                            </thead>
                            <tbody>${reportOffices.map(([officeName, officeData]) => {
                    const staff = (officeData.affected_staff || []).map(s =>
                        `<div>${s.name || ''}${s.area ? ` - ${s.area}` : ''}${s.status ? ` (${s.status})` : ''}${s.assistance ? ` - Assistance: ${s.assistance}` : ''}</div>`
                    ).join('') || 'No staff affected';
                    return `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${staff}</td></tr>`;
                }).join('')}</tbody>
                        </table>
                        
                        <p><strong>Narrative Summary:</strong> ${Object.values(officesData).map(office => office.remark).filter(Boolean).join(' ') || 'No additional remarks.'}</p>
                        <p class="footer">Prepared by: DOST 1 DRRM Unit</p>
                    </body>
                    </html>
                `;
            } catch (e) {
                console.error('buildReportHtml error:', e);
                return '<html><body><h1>Error generating report</h1></body></html>';
            }
        }, [officesData, activeEvent]);

        const handleGenerateReport = useCallback(() => {
            try {
                const reportHtml = buildReportHtml();
                const printWindow = window.open('', '_blank');
                if (!printWindow) {
                    showToast('Pop-up blocked. Allow pop-ups to generate the report.', 'warning');
                    return;
                }
                printWindow.document.write(reportHtml);
                printWindow.document.close();
            } catch (e) {
                console.error('handleGenerateReport error:', e);
                showToast('Failed to generate report.', 'error');
            }
        }, [buildReportHtml, showToast]);

        const handleDownloadDoc = useCallback(() => {
            try {
                const reportHtml = buildReportHtml();
                const blob = new Blob([reportHtml], { type: 'application/msword' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `SITREP_${activeEvent?.name || 'NO_EVENT'}_${new Date().toISOString().slice(0, 19)}.doc`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                showToast('Document downloaded.', 'success');
            } catch (e) {
                console.error('handleDownloadDoc error:', e);
                showToast('Failed to download document.', 'error');
            }
        }, [buildReportHtml, activeEvent, showToast]);

        // --- Image Preview ---
        const openImageModal = useCallback((src) => {
            try {
                setImageModalSrc(src);
                toggleModal('image');
            } catch (e) {
                console.error('openImageModal error:', e);
            }
        }, [toggleModal]);

        const closeImageModal = useCallback(() => {
            try {
                setImageModalSrc('');
                toggleModal('image');
            } catch (e) {
                console.error('closeImageModal error:', e);
            }
        }, [toggleModal]);

        // ============================================================
        // RENDER HELPERS
        // ============================================================

        const officeStatusRemarks = useMemo(() => {
            try {
                return [
                    { label: 'Incident', value: currentOfficeData.related_incidents, remark: currentOfficeData.remark_related_incidents || '' },
                    { label: 'Casualties', value: currentOfficeData.casualties, remark: currentOfficeData.remark_casualties || '' },
                    { label: 'Power Status', value: currentOfficeData.power_status || 'Not specified', remark: currentOfficeData.remark_power_status || '' },
                    { label: 'Communication Lines', value: currentOfficeData.communication_lines || 'Not specified', remark: currentOfficeData.remark_communication_lines || '' },
                    { label: 'Damage to Facilities', value: currentOfficeData.damage_facilities || 'Not specified', remark: currentOfficeData.remark_damage_facilities || '' },
                    {
                        label: 'Damage Building',
                        value: Array.isArray(currentOfficeData.damage_details)
                            ? `${currentOfficeData.damage_details.length} record(s)`
                            : 'Not specified',
                        remark: ''
                    },
                    {
                        label: 'Equipment Damage',
                        value: Array.isArray(currentOfficeData.equipment_details)
                            ? `${currentOfficeData.equipment_details.length} record(s)`
                            : 'Not specified',
                        remark: ''
                    },
                    {
                        label: 'Affected Staff',
                        value: Array.isArray(currentOfficeData.affected_staff)
                            ? `${currentOfficeData.affected_staff.length} record(s)`
                            : 'Not specified',
                        remark: ''
                    },
                    { label: 'Work Suspension', value: currentOfficeData.work_suspension ? 'Yes' : 'No', remark: currentOfficeData.remark_work_suspension || '' },
                    { label: 'Assistance Provided', value: currentOfficeData.assistance_provided || 'Not specified', remark: currentOfficeData.remark_assistance_provided || '' }
                ];
            } catch (e) {
                console.error('officeStatusRemarks error:', e);
                return [];
            }
        }, [currentOfficeData]);

        const municipalitiesList = useMemo(() => {
            try {
                return (editMode ? formData : currentOfficeData)?.municipalities || [];
            } catch (e) {
                return [];
            }
        }, [editMode, formData, currentOfficeData]);

        const displayEvent = useMemo(() => {
            try {
                return editMode ? formData : currentOfficeData;
            } catch (e) {
                return { warning_signals: {}, municipalities: [], damage_details: [], equipment_details: [], affected_staff: [] };
            }
        }, [editMode, formData, currentOfficeData]);

        // ============================================================
        // MAIN RENDER
        // ============================================================
        return (
            <div className={`dashboard-container ${settingsData.darkMode ? 'dark-mode' : ''}`}>
                <DashboardSidebar
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    unreadCount={unreadCount}
                    canApproveReports={canApproveReports}
                    canManageUsers={canManageUsers}
                    currentUser={currentUser}
                    isSuperAdmin={isSuperAdmin}
                    isAdmin={isAdmin}
                    onOpenSettings={() => toggleModal('settings')}
                    onLogout={onLogout}
                />
                <div className="main-content" ref={mainContentRef} onScroll={handleScroll}>
                    {/* Dashboard */}
                    {activeMenu === 'dashboard' && (
                        <div>
                            <ToastBanner toast={toast} setToast={() => { }} />

                            <NotificationWidget
                                unreadCount={unreadCount}
                                showNotificationsDropdown={modals.notifications}
                                setShowNotificationsDropdown={(val) => setModals(prev => ({ ...prev, notifications: val }))}
                                notifications={notifications}
                                clearAllNotifications={clearAllNotifications}
                                markNotificationRead={markNotificationRead}
                            />

                            <TopInfoBar activeEvent={activeEvent} displayWeather={displayWeather} />

                            <InfoBar
                                displayWeather={displayWeather}
                                activeEvent={activeEvent}
                                typhoonHistory={typhoonHistory}
                                summaryStats={summaryStats}
                                getAlertColor={getAlertColor}
                            />

                            <NotificationBanner
                                activeEvent={activeEvent}
                                handleGenerateReport={handleGenerateReport}
                                handleDownloadDoc={handleDownloadDoc}
                                handleExportExcel={handleExportExcel}
                            />

                            {/* PSTO Controls */}
                            <div className="psto-controls">
                                <div className="psto-controls-header">
                                    <h3>📋 PSTO Offices</h3>
                                    <div className="psto-controls-actions">
                                        <span className="psto-count">
                                            {Object.keys(visibleOffices).length} of {Object.keys(officesData).length} visible
                                            {hiddenCount > 0 && ` (${hiddenCount} hidden)`}
                                        </span>
                                        {hiddenCount > 0 && (
                                            <button className="show-all-btn" onClick={showAllOffices}>
                                                👁️ Show All
                                            </button>
                                        )}
                                        {hiddenCount < Object.keys(officesData).length && (
                                            <button className="hide-all-btn" onClick={hideAllOffices}>
                                                👁️‍🗨️ Hide All
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <PSTOSelector
                                isUser={isUser}
                                currentUser={currentUser}
                                officesData={visibleOffices}
                                selectedOffice={selectedOffice}
                                regionSummary={regionSummary}
                                handleOfficeClick={handleOfficeClick}
                                expandedOffices={expandedOffices}
                                toggleOfficeExpansion={toggleOfficeExpansion}
                                hiddenOffices={hiddenOffices}
                                toggleOfficeVisibility={toggleOfficeVisibility}
                            />

                            <EditControlsBar
                                selectedOffice={selectedOffice}
                                isUser={isUser}
                                editMode={editMode}
                                handleEditToggle={handleEditToggle}
                                openReportModal={openReportModal}
                                handleSave={handleSave}
                            />

                            {/* Main Warning Card */}
                            <div className="main-grid">
                                <div className="card warning-card">
                                    <div className="warning-card-header">
                                        <h3 className="warning-header">
                                            <span className="warning-icon">⚠️</span> TROPICAL CYCLONE WARNING SIGNAL
                                        </h3>
                                    </div>
                                    <div className="warning-card-body">
                                        {editMode ? (
                                            <div className="improved-edit-form">
                                                {/* Warning Signals Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('warningSignals')}>
                                                        <h4>📡 Warning Signals</h4>
                                                        <span>{expandedSections.warningSignals ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.warningSignals && (
                                                        <div className="edit-section-content">
                                                            {municipalitiesList.map(mun => (
                                                                <div key={mun} className="signal-edit-row">
                                                                    <span className="municipality-name">{mun}</span>
                                                                    <select
                                                                        value={displayEvent.warning_signals?.[mun] || 0}
                                                                        onChange={(e) => handleSignalChange(mun, e.target.value)}
                                                                    >
                                                                        <option value={0}>No Signal</option>
                                                                        <option value={1}>Signal #1</option>
                                                                        <option value={2}>Signal #2</option>
                                                                        <option value={3}>Signal #3</option>
                                                                        <option value={4}>Signal #4</option>
                                                                        <option value={5}>Signal #5</option>
                                                                    </select>
                                                                    <button className="remove-mun-btn" onClick={() => handleRemoveMunicipality(mun)}>🗑️</button>
                                                                </div>
                                                            ))}
                                                            <div className="add-municipality-row">
                                                                <input
                                                                    type="text"
                                                                    placeholder="New municipality"
                                                                    value={newMunicipality}
                                                                    onChange={(e) => setNewMunicipality(e.target.value)}
                                                                />
                                                                <select
                                                                    value={newSignal}
                                                                    onChange={(e) => setNewSignal(parseInt(e.target.value))}
                                                                >
                                                                    <option value={1}>Signal #1</option>
                                                                    <option value={2}>Signal #2</option>
                                                                    <option value={3}>Signal #3</option>
                                                                    <option value={4}>Signal #4</option>
                                                                    <option value={5}>Signal #5</option>
                                                                </select>
                                                                <button className="add-mun-btn" onClick={handleAddMunicipality}>+ Add</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* General Weather Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('generalWeather')}>
                                                        <h4>🌤️ General Weather</h4>
                                                        <span>{expandedSections.generalWeather ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.generalWeather && (
                                                        <div className="edit-section-content">
                                                            <div className="form-group">
                                                                <label>General Weather Situation</label>
                                                                <input
                                                                    type="text"
                                                                    name="general_weather"
                                                                    value={displayEvent.general_weather || ''}
                                                                    onChange={(e) => handleReportFieldChange('general_weather', e.target.value)}
                                                                    placeholder="e.g., Heavy Rain, Strong Winds"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Effects Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('effects')}>
                                                        <h4>📊 Effects</h4>
                                                        <span>{expandedSections.effects ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.effects && (
                                                        <div className="edit-section-content">
                                                            <div className="form-row">
                                                                <div className="form-group">
                                                                    <label>Related Incidents</label>
                                                                    <input
                                                                        type="number"
                                                                        name="related_incidents"
                                                                        value={reportFormData?.related_incidents || 0}
                                                                        onChange={(e) => handleReportFieldChange('related_incidents', parseInt(e.target.value, 10) || 0)}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_related_incidents"
                                                                        value={reportFormData?.remark_related_incidents || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_related_incidents', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <div className="form-group">
                                                                    <label>Casualties</label>
                                                                    <input
                                                                        type="number"
                                                                        name="casualties"
                                                                        value={reportFormData?.casualties || 0}
                                                                        onChange={(e) => handleReportFieldChange('casualties', parseInt(e.target.value, 10) || 0)}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_casualties"
                                                                        value={reportFormData?.remark_casualties || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_casualties', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <div className="form-group">
                                                                    <label>Power Status</label>
                                                                    <input
                                                                        type="text"
                                                                        name="power_status"
                                                                        value={reportFormData?.power_status || ''}
                                                                        onChange={(e) => handleReportFieldChange('power_status', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_power_status"
                                                                        value={reportFormData?.remark_power_status || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_power_status', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <div className="form-group">
                                                                    <label>Communication Lines</label>
                                                                    <input
                                                                        type="text"
                                                                        name="communication_lines"
                                                                        value={reportFormData?.communication_lines || ''}
                                                                        onChange={(e) => handleReportFieldChange('communication_lines', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_communication_lines"
                                                                        value={reportFormData?.remark_communication_lines || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_communication_lines', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <div className="form-group">
                                                                    <label>Damage to Facilities</label>
                                                                    <input
                                                                        type="text"
                                                                        name="damage_facilities"
                                                                        value={reportFormData?.damage_facilities || ''}
                                                                        onChange={(e) => handleReportFieldChange('damage_facilities', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_damage_facilities"
                                                                        value={reportFormData?.remark_damage_facilities || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_damage_facilities', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <div className="form-group checkbox-group">
                                                                    <label>
                                                                        <input
                                                                            type="checkbox"
                                                                            name="work_suspension"
                                                                            checked={reportFormData?.work_suspension || false}
                                                                            onChange={(e) => handleReportFieldChange('work_suspension', e.target.checked)}
                                                                        /> Work Suspension
                                                                    </label>
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_work_suspension"
                                                                        value={reportFormData?.remark_work_suspension || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_work_suspension', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="form-row">
                                                                <div className="form-group">
                                                                    <label>Assistance Provided</label>
                                                                    <input
                                                                        type="text"
                                                                        name="assistance_provided"
                                                                        value={reportFormData?.assistance_provided || ''}
                                                                        onChange={(e) => handleReportFieldChange('assistance_provided', e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="form-group">
                                                                    <label>Remarks</label>
                                                                    <input
                                                                        type="text"
                                                                        name="remark_assistance_provided"
                                                                        value={reportFormData?.remark_assistance_provided || ''}
                                                                        onChange={(e) => handleReportFieldChange('remark_assistance_provided', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Damage Building Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('damageDetails')}>
                                                        <h4>🏗️ Damage Building</h4>
                                                        <span>{expandedSections.damageDetails ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.damageDetails && (
                                                        <div className="edit-section-content">
                                                            <div className="damage-form">
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Damage Description</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newDamage.description}
                                                                            onChange={(e) => setNewDamage({ ...newDamage, description: e.target.value })}
                                                                            placeholder="e.g., Building collapsed"
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Cost (₱)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={newDamage.cost}
                                                                            onChange={(e) => setNewDamage({ ...newDamage, cost: e.target.value })}
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Status</label>
                                                                        <select
                                                                            value={newDamage.status}
                                                                            onChange={(e) => setNewDamage({ ...newDamage, status: e.target.value })}
                                                                        >
                                                                            <option>Reported</option>
                                                                            <option>Assessing</option>
                                                                            <option>Under Repair</option>
                                                                            <option>Repaired</option>
                                                                            <option>Condemned</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Image</label>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onload = () => setNewDamage({ ...newDamage, image: reader.result });
                                                                                    reader.readAsDataURL(file);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {newDamage.image && (
                                                                    <div className="image-preview">
                                                                        <img src={newDamage.image} alt="Damage preview" className="preview-thumbnail" />
                                                                        <button className="remove-image-btn" onClick={() => setNewDamage({ ...newDamage, image: null })}>✕</button>
                                                                    </div>
                                                                )}
                                                                <div className="form-buttons">
                                                                    {editingDamageIndex !== null ? (
                                                                        <button className="success" onClick={handleUpdateDamage}>Update Damage</button>
                                                                    ) : (
                                                                        <button className="add-mun-btn" onClick={handleAddDamage}>+ Add Damage</button>
                                                                    )}
                                                                    {editingDamageIndex !== null && (
                                                                        <button onClick={() => {
                                                                            setEditingDamageIndex(null);
                                                                            setNewDamage(EMPTY_DAMAGE);
                                                                        }}>Cancel</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="damage-list">
                                                                {(formData?.damage_details || []).map((damage, index) => (
                                                                    <div key={index} className="damage-item">
                                                                        <div className="damage-info">
                                                                            <strong>{damage.description}</strong>
                                                                            <span>₱{damage.cost || 0}</span>
                                                                            <span className={`status-badge ${damage.status ? damage.status.toLowerCase().replace(/\s+/g, '-') : 'reported'}`}>
                                                                                {damage.status}
                                                                            </span>
                                                                            {damage.image && (
                                                                                <img
                                                                                    src={damage.image}
                                                                                    alt="Damage"
                                                                                    className="damage-thumbnail"
                                                                                    onClick={() => openImageModal(damage.image)}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="damage-actions">
                                                                            <button className="view-btn" onClick={() => handleEditDamage(index)}>✏️</button>
                                                                            <button className="danger" onClick={() => handleDeleteDamage(index)}>🗑️</button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(formData?.damage_details || []).length === 0 && (
                                                                    <p className="no-items">No damage records added.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Equipment Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('equipmentDetails')}>
                                                        <h4>🛠️ Damage Equipment</h4>
                                                        <span>{expandedSections.equipmentDetails ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.equipmentDetails && (
                                                        <div className="edit-section-content">
                                                            <div className="damage-form">
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Equipment Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newEquipment.name}
                                                                            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                                                            placeholder="e.g., Generator"
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Cost (₱)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={newEquipment.cost}
                                                                            onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })}
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Description</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newEquipment.description}
                                                                            onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })}
                                                                            placeholder="e.g., Portable radio"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Status</label>
                                                                        <select
                                                                            value={newEquipment.status}
                                                                            onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value })}
                                                                        >
                                                                            <option>Reported</option>
                                                                            <option>Assessing</option>
                                                                            <option>Under Repair</option>
                                                                            <option>Repaired</option>
                                                                            <option>Condemned</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Image</label>
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files[0];
                                                                                if (file) {
                                                                                    const reader = new FileReader();
                                                                                    reader.onload = () => setNewEquipment({ ...newEquipment, image: reader.result });
                                                                                    reader.readAsDataURL(file);
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {newEquipment.image && (
                                                                    <div className="image-preview">
                                                                        <img src={newEquipment.image} alt="Equipment preview" className="preview-thumbnail" />
                                                                        <button className="remove-image-btn" onClick={() => setNewEquipment({ ...newEquipment, image: null })}>✕</button>
                                                                    </div>
                                                                )}
                                                                <div className="form-buttons">
                                                                    {editingEquipmentIndex !== null ? (
                                                                        <button className="success" onClick={handleUpdateEquipment}>Update Equipment</button>
                                                                    ) : (
                                                                        <button className="add-mun-btn" onClick={handleAddEquipment}>+ Add Equipment</button>
                                                                    )}
                                                                    {editingEquipmentIndex !== null && (
                                                                        <button onClick={() => {
                                                                            setEditingEquipmentIndex(null);
                                                                            setNewEquipment(EMPTY_EQUIPMENT);
                                                                        }}>Cancel</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="damage-list">
                                                                {(formData?.equipment_details || []).map((equip, index) => (
                                                                    <div key={index} className="damage-item">
                                                                        <div className="damage-info">
                                                                            <strong>{equip.name}</strong>
                                                                            <span>{equip.description}</span>
                                                                            <span>₱{equip.cost || 0}</span>
                                                                            <span className={`status-badge ${equip.status ? equip.status.toLowerCase().replace(/\s+/g, '-') : 'reported'}`}>
                                                                                {equip.status}
                                                                            </span>
                                                                            {equip.image && (
                                                                                <img
                                                                                    src={equip.image}
                                                                                    alt="Equipment"
                                                                                    className="damage-thumbnail"
                                                                                    onClick={() => openImageModal(equip.image)}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div className="damage-actions">
                                                                            <button className="view-btn" onClick={() => handleEditEquipment(index)}>✏️</button>
                                                                            <button className="danger" onClick={() => handleDeleteEquipment(index)}>🗑️</button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(formData?.equipment_details || []).length === 0 && (
                                                                    <p className="no-items">No equipment records added.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Staff Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('affectedStaff')}>
                                                        <h4>👥 Affected Staff</h4>
                                                        <span>{expandedSections.affectedStaff ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.affectedStaff && (
                                                        <div className="edit-section-content">
                                                            <div className="staff-form">
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Name</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newStaff.name}
                                                                            onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                                                                            placeholder="Staff name"
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Area</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newStaff.area}
                                                                            onChange={(e) => setNewStaff({ ...newStaff, area: e.target.value })}
                                                                            placeholder="Area/Location"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="form-row">
                                                                    <div className="form-group">
                                                                        <label>Assistance Given</label>
                                                                        <input
                                                                            type="text"
                                                                            value={newStaff.assistance}
                                                                            onChange={(e) => setNewStaff({ ...newStaff, assistance: e.target.value })}
                                                                            placeholder="e.g., Food pack, Medical"
                                                                        />
                                                                    </div>
                                                                    <div className="form-group">
                                                                        <label>Status</label>
                                                                        <select
                                                                            value={newStaff.status}
                                                                            onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}
                                                                        >
                                                                            <option>Active</option>
                                                                            <option>Injured</option>
                                                                            <option>Evacuated</option>
                                                                            <option>Rescued</option>
                                                                            <option>Deceased</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="form-buttons">
                                                                    {editingStaffIndex !== null ? (
                                                                        <button className="success" onClick={handleUpdateStaff}>Update Staff</button>
                                                                    ) : (
                                                                        <button className="add-mun-btn" onClick={handleAddStaff}>+ Add Staff</button>
                                                                    )}
                                                                    {editingStaffIndex !== null && (
                                                                        <button onClick={() => {
                                                                            setEditingStaffIndex(null);
                                                                            setNewStaff(EMPTY_STAFF);
                                                                        }}>Cancel</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="staff-list">
                                                                {(formData?.affected_staff || []).map((staff, index) => (
                                                                    <div key={index} className="staff-item">
                                                                        <div className="staff-info">
                                                                            <strong>{staff.name}</strong>
                                                                            <span>{staff.area}</span>
                                                                            <span>Assistance: {staff.assistance || 'None'}</span>
                                                                            <span className={`status-badge ${staff.status ? staff.status.toLowerCase().replace(/\s+/g, '-') : 'active'}`}>
                                                                                {staff.status}
                                                                            </span>
                                                                        </div>
                                                                        <div className="staff-actions">
                                                                            <button className="view-btn" onClick={() => handleEditStaff(index)}>✏️</button>
                                                                            <button className="danger" onClick={() => handleDeleteStaff(index)}>🗑️</button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {(formData?.affected_staff || []).length === 0 && (
                                                                    <p className="no-items">No staff records added.</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Image Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('officeImage')}>
                                                        <h4>🖼️ Office Image</h4>
                                                        <span>{expandedSections.officeImage ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.officeImage && (
                                                        <div className="edit-section-content">
                                                            <div className="form-group">
                                                                <label>Upload Office Image</label>
                                                                <input type="file" accept="image/*" onChange={handleOfficeImageChange} />
                                                                {formData?.imageUrl && (
                                                                    <div style={{ marginTop: '10px' }}>
                                                                        <img
                                                                            src={formData.imageUrl}
                                                                            alt="Office"
                                                                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }}
                                                                        />
                                                                        <button onClick={handleRemoveOfficeImage} style={{ marginLeft: '10px', padding: '4px 10px' }}>
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remarks Section */}
                                                <div className="edit-section">
                                                    <div className="edit-section-header" onClick={() => toggleSection('remarks')}>
                                                        <h4>📝 General Remarks</h4>
                                                        <span>{expandedSections.remarks ? '▼' : '►'}</span>
                                                    </div>
                                                    {expandedSections.remarks && (
                                                        <div className="edit-section-content">
                                                            <div className="form-group">
                                                                <label>Overall Remarks</label>
                                                                <textarea
                                                                    name="remark"
                                                                    value={displayEvent.remark || ''}
                                                                    onChange={(e) => handleReportFieldChange('remark', e.target.value)}
                                                                    rows="3"
                                                                    placeholder="Additional notes or instructions..."
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="warning-grid">
                                                    <div className="warning-grid-row header">
                                                        <div className="warning-col">
                                                            <div className="warning-title">
                                                                TROPICAL CYCLONE WARNING SIGNAL
                                                                <div className="warning-sub">(based on DOST-PAGASA Weather Updates)</div>
                                                            </div>
                                                        </div>
                                                        <div className="warning-col">
                                                            <div className="weather-title">
                                                                GENERAL WEATHER SITUATION
                                                                <div className="warning-sub">(Actual Weather situation)</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="warning-grid-row content">
                                                        <div className="warning-col signals-col">
                                                            <div className="warning-panel">
                                                                <div className="warning-signals-list">
                                                                    {Object.entries(displayEvent.warning_signals || {}).map(([mun, signal]) => (
                                                                        <div key={mun} className="signal-item">
                                                                            <span className="mun-name">{mun}</span>
                                                                            <span className="signal-number">Signal No. {signal}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {Object.keys(displayEvent.warning_signals || {}).length === 0 && (
                                                                    <div className="no-signals">No warning signals currently in effect.</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="warning-col weather-col">
                                                            <div className="warning-panel weather-panel">
                                                                <div className="weather-text">
                                                                    {selectedOffice === 'PSTO-Region-1' ? displayWeather : (displayEvent.general_weather || 'No weather data reported')}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="effects-section">
                                                    <h4>📊 EFFECTS</h4>
                                                    <div className="effects-panel">
                                                        <div className="effects-list">
                                                            {[
                                                                { label: 'Related Incidents', value: displayEvent.related_incidents, remarkField: 'remark_related_incidents' },
                                                                { label: 'Casualties', value: displayEvent.casualties, remarkField: 'remark_casualties' },
                                                                { label: 'Power', value: displayEvent.power_status || '—', remarkField: 'remark_power_status' },
                                                                { label: 'Communication', value: displayEvent.communication_lines || '—', remarkField: 'remark_communication_lines' },
                                                                { label: 'Damage', value: displayEvent.damage_facilities || '—', remarkField: 'remark_damage_facilities' },
                                                                { label: 'Work Suspension', value: displayEvent.work_suspension ? 'Yes' : 'No', remarkField: 'remark_work_suspension' },
                                                                { label: 'Assistance', value: displayEvent.assistance_provided || '—', remarkField: 'remark_assistance_provided' },
                                                            ].map((item) => (
                                                                <div key={item.label} className="effect-row">
                                                                    <span className="effect-label">{item.label}:</span>
                                                                    <span className="effect-value">{item.value}</span>
                                                                    <span className="effect-remark">{displayEvent[item.remarkField] || '-'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="effects-section">
                                                    <h4>🏗️ DAMAGE BUILDING</h4>
                                                    <div className="effects-panel">
                                                        {(displayEvent.damage_details && displayEvent.damage_details.length > 0) ? (
                                                            <div className="damage-table-container">
                                                                <table className="damage-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Description</th>
                                                                            <th>Cost</th>
                                                                            <th>Status</th>
                                                                            <th>Image</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {(displayEvent.damage_details || []).map((damage, idx) => (
                                                                            <tr key={idx}>
                                                                                <td>{damage.description || '—'}</td>
                                                                                <td>₱{damage.cost || 0}</td>
                                                                                <td>
                                                                                    <span className={`status-badge ${(damage.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                                        {damage.status || 'Reported'}
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    {damage.image ? (
                                                                                        <img
                                                                                            src={damage.image}
                                                                                            alt="Damage"
                                                                                            className="damage-thumbnail"
                                                                                            onClick={() => openImageModal(damage.image)}
                                                                                        />
                                                                                    ) : '—'}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="no-items">No building damage records reported.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="effects-section">
                                                    <h4>🛠️ DAMAGE EQUIPMENT</h4>
                                                    <div className="effects-panel">
                                                        {((displayEvent.equipment_details || [])).length > 0 ? (
                                                            <div className="damage-table-container">
                                                                <table className="damage-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Equipment</th>
                                                                            <th>Description</th>
                                                                            <th>Cost</th>
                                                                            <th>Status</th>
                                                                            <th>Image</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {(displayEvent.equipment_details || []).map((equip, idx) => (
                                                                            <tr key={idx}>
                                                                                <td>{equip.name || equip.equipment || '—'}</td>
                                                                                <td>{equip.description || '—'}</td>
                                                                                <td>₱{equip.cost || 0}</td>
                                                                                <td>
                                                                                    <span className={`status-badge ${(equip.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                                        {equip.status || 'Reported'}
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    {equip.image ? (
                                                                                        <img
                                                                                            src={equip.image}
                                                                                            alt="Equipment"
                                                                                            className="damage-thumbnail"
                                                                                            onClick={() => openImageModal(equip.image)}
                                                                                        />
                                                                                    ) : '—'}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="no-items">No equipment damage records reported.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="effects-section">
                                                    <h4>👥 AFFECTED STAFF</h4>
                                                    <div className="effects-panel">
                                                        {(displayEvent.affected_staff && displayEvent.affected_staff.length > 0) ? (
                                                            <div className="damage-table-container">
                                                                <table className="damage-table staff-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Name</th>
                                                                            <th>Area</th>
                                                                            <th>Assistance</th>
                                                                            <th>Status</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {(displayEvent.affected_staff || []).map((staff, idx) => (
                                                                            <tr key={idx}>
                                                                                <td>{staff.name || '—'}</td>
                                                                                <td>{staff.area || '—'}</td>
                                                                                <td>{staff.assistance || 'None'}</td>
                                                                                <td>
                                                                                    <span className={`status-badge ${(staff.status || 'active').toLowerCase().replace(/\s+/g, '-')}`}>
                                                                                        {staff.status || 'Active'}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        ) : (
                                                            <p className="no-items">No staff records reported.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <OfficeModal
                                isOpen={modals.office}
                                onClose={() => toggleModal('office')}
                                selectedOffice={selectedOffice}
                                displayWeather={displayWeather}
                                currentOfficeData={currentOfficeData}
                                officeStatusRemarks={officeStatusRemarks}
                            />
                        </div>
                    )}

                    {/* Typhoon Events */}
                    {activeMenu === 'typhoon' && (
                        <div className="events-management">
                            <div className="events-header">
                                <h1>🌊 Manage Events</h1>
                                <div className="header-actions">
                                    <div className="search-box-enhanced">
                                        <span className="search-icon">🔍</span>
                                        <input
                                            type="text"
                                            placeholder="Search events..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            className="search-input-enhanced"
                                        />
                                        {searchTerm && (
                                            <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
                                        )}
                                    </div>
                                    {canEditEvents && (
                                        <button
                                            className="new-event-btn"
                                            onClick={() => {
                                                setIsEditingEvent(false);
                                                resetNewEventForm();
                                                toggleModal('add');
                                            }}
                                        >
                                            ➕ Add New Event
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="filter-bar">
                                <label>Status filter:</label>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="active">Active</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                            <div className="events-table-container">
                                <table className="events-table">
                                    <thead>
                                        <tr>
                                            <th>EVENT NAME</th>
                                            <th>DATE</th>
                                            <th>ALERT LVL</th>
                                            <th>STATUS</th>
                                            <th>PROVINCES</th>
                                            <th>CATEGORY</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEvents.length > 0 ? filteredEvents.map(event => (
                                            <tr key={event.id} className={event.status === 'archived' ? 'archived-row' : ''}>
                                                <td className="event-name">{event.name}</td>
                                                <td>{event.date}</td>
                                                <td>
                                                    <span className="alert-badge" style={{ background: getAlertColor(event.alertLevel) }}>
                                                        {event.alertLevel}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="status-badge" style={{ background: getStatusColor(event.status) }}>
                                                        {getEventStatusLabel(event)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="provinces-list">
                                                        {event.provinces?.length === ALL_PROVINCES.length ?
                                                            <span className="province-tag">All PSTO Offices</span> :
                                                            event.provinces?.map((p, i) => <span key={i} className="province-tag">{p}</span>)
                                                        }
                                                    </div>
                                                </td>
                                                <td>{event.category || event.type || '-'}</td>
                                                <td className="actions-cell">
                                                    {event.deployment !== 'Deployed' && event.status === 'approved' ? (
                                                        canDeployEvents ?
                                                            <button className="action-btn deploy-btn" onClick={() => handleDeployEvent(event.id)}>Deploy</button> :
                                                            <span className="status-badge" style={{ background: '#17a2b8' }}>Approved</span>
                                                    ) : event.deployment === 'Deployed' ?
                                                        <span className="status-badge" style={{ background: '#198754' }}>Active</span> :
                                                        <span className="status-badge" style={{ background: '#ffc107' }}>
                                                            {event.status === 'pending' ? 'Awaiting Approval' : 'Draft'}
                                                        </span>
                                                    }
                                                    <button className="action-btn view-btn" onClick={() => handleViewEvent(event)}>View Details</button>
                                                    {canEditEvents && event.status === 'pending' && (
                                                        <button className="action-btn success" onClick={() => handleApproveEvent(event.id)}>Approve</button>
                                                    )}
                                                    {canRejectEvents && event.status === 'pending' && (
                                                        <button className="action-btn danger" onClick={() => openRejectModal(event.id)}>Reject</button>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                                                    No events found. {canEditEvents && 'Click "➕ Add New Event" to add a new event.'}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {activeMenu === 'history' && (
                        <TyphoonHistoryContent
                            typhoonHistory={typhoonHistory}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            handleSearchChange={handleSearchChange}
                            setSelectedEvent={setSelectedEvent}
                            setShowDetailsModal={() => toggleModal('details')}
                            getAlertColor={getAlertColor}
                            events={events}
                            officesData={officesData}
                        />
                    )}

                    {/* Live Typhoon */}
                    {activeMenu === 'live-typhoon' && (
                        <div className="forecast-section card">
                            <h1>Live Typhoon (Panahon)</h1>
                            <div className="windy-embed-container">
                                <iframe title="Panahon" src="https://www.panahon.gov.ph/" frameBorder="0" allowFullScreen />
                            </div>
                        </div>
                    )}

                    {/* Notifications */}
                    {activeMenu === 'notifications' && (
                        <div className="events-management">
                            <div className="events-header">
                                <h1>🔔 Notifications {unreadCount > 0 && `(${unreadCount} new)`}</h1>
                                <div className="header-actions">
                                    <button className="new-event-btn" onClick={clearAllNotifications}>Clear All</button>
                                </div>
                            </div>
                            <div className="events-subtitle">System events, report updates, and alerts</div>
                            <div className="notifications-list">
                                {notifications.length === 0 ? (
                                    <div className="no-notifications">No notifications yet.</div>
                                ) : (
                                    notifications.map(notif => (
                                        <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.type}`} onClick={() => markNotificationRead(notif.id)}>
                                            <div className="notification-header">
                                                <span className="notification-title">{notif.title}</span>
                                                <span className="notification-time">{new Date(notif.timestamp).toLocaleString()}</span>
                                            </div>
                                            <div className="notification-message">{notif.message}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pending Reports */}
                    {activeMenu === 'pending-reports' && canApproveReports && (
                        <div className="events-management">
                            <div className="events-header">
                                <h1>Pending PSTO Reports</h1>
                            </div>
                            <div className="events-subtitle">Review and approve reports submitted by PSTO offices</div>
                            <div className="events-table-container">
                                <table className="events-table">
                                    <thead>
                                        <tr>
                                            <th>Office</th>
                                            <th>Submitted By</th>
                                            <th>Submitted At</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingReports.filter(r => r.status === 'pending').map(report => (
                                            <tr key={report.id}>
                                                <td>{report.office}</td>
                                                <td>{report.submittedBy}</td>
                                                <td>{formatDateTime(report.submittedAt, 'Unknown Date')}</td>
                                                <td><span className="status-badge" style={{ background: '#ffc107' }}>Pending</span></td>
                                                <td className="actions-cell">
                                                    <button className="success" onClick={() => approveReport(report.id)}>Approve</button>
                                                    <button className="danger" onClick={() => openRejectReportModal(report)}>Reject</button>
                                                    <button className="view-btn" onClick={() => {
                                                        setSelectedReport(report);
                                                        toggleModal('reportReview');
                                                    }}>Review</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pendingReports.filter(r => r.status === 'pending').length === 0 && (
                                            <tr>
                                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No pending reports.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users */}
                    {activeMenu === 'users' && canManageUsers && (
                        <div className="events-management users-management">
                            <div className="events-header">
                                <h1>👥 User Management</h1>
                                <div className="header-actions">
                                    <div className="search-box-enhanced">
                                        <span className="search-icon">🔍</span>
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={userSearchTerm}
                                            onChange={handleUserSearchChange}
                                            className="search-input-enhanced"
                                        />
                                        {userSearchTerm && (
                                            <button className="search-clear" onClick={() => setUserSearchTerm('')}>✕</button>
                                        )}
                                    </div>
                                    <button className="new-event-btn" onClick={() => {
                                        setUserForm({
                                            id: null, name: '', email: '', office: selectedOffice,
                                            role: 'USER', status: 'Active', password: '', profileImage: ''
                                        });
                                        setIsEditingUser(false);
                                        toggleModal('user');
                                    }}>
                                        + New User
                                    </button>
                                </div>
                            </div>
                            <div className="events-table-container">
                                <table className="events-table users-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Office</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>{user.office}</td>
                                                <td><span className="role-badge">{user.role}</span></td>
                                                <td>{user.status}</td>
                                                <td className="actions-cell">
                                                    <button className="view-btn" onClick={() => {
                                                        setUserForm(user);
                                                        setIsEditingUser(true);
                                                        toggleModal('user');
                                                    }}>Edit</button>
                                                    <button className="deploy-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <EventDetailsModal
                    isOpen={modals.details}
                    onClose={() => toggleModal('details')}
                    selectedEvent={selectedEvent}
                    isEditingReportLink={isEditingReportLink}
                    reportLinkInput={reportLinkInput}
                    setReportLinkInput={setReportLinkInput}
                    setIsEditingReportLink={setIsEditingReportLink}
                    handleSaveReportLink={handleSaveReportLink}
                    canEditEvents={canEditEvents}
                    handleDeleteEvent={handleDeleteEvent}
                    handleEditEvent={handleEditEvent}
                    getAlertColor={getAlertColor}
                    openImageModal={openImageModal}
                    handleRejectEvent={(eventId, reason) => {
                        try {
                            if (!reason || !reason.trim()) {
                                showToast('Please provide a rejection reason.', 'warning');
                                return;
                            }
                            const updatedEvents = events.map(event => {
                                if (event.id === eventId) {
                                    return { ...event, status: 'rejected', rejectionReason: reason, deployment: 'Draft' };
                                }
                                return event;
                            });
                            setEvents(updatedEvents);
                            if (selectedEvent?.id === eventId) {
                                setSelectedEvent({ ...selectedEvent, status: 'rejected', rejectionReason: reason, deployment: 'Draft' });
                            }
                            toggleModal('details');
                            const eventName = events.find(e => e.id === eventId)?.name;
                            addNotification('Event Rejected', `Event "${eventName}" has been rejected. Reason: ${reason}`, 'error');
                            showToast(`Event "${eventName}" rejected.`, 'error');
                        } catch (e) {
                            console.error('handleRejectEvent error:', e);
                            showToast('Failed to reject event.', 'error');
                        }
                    }}
                />

                <AddEventModal
                    isOpen={modals.add}
                    onClose={() => {
                        toggleModal('add');
                        setIsEditingEvent(false);
                        resetNewEventForm();
                    }}
                    isEditingEvent={isEditingEvent}
                    newEvent={newEvent}
                    handleNewEventFieldChange={(field, value) => setNewEvent(prev => ({ ...prev, [field]: value }))}
                    setNewEvent={setNewEvent}
                    handleAddEvent={handleAddEvent}
                    allProvinces={ALL_PROVINCES}
                />

                <ReportReviewModal
                    isOpen={modals.reportReview}
                    onClose={() => toggleModal('reportReview')}
                    selectedReport={selectedReport}
                    officesData={officesData}
                    approveReport={approveReport}
                    openRejectReportModal={openRejectReportModal}
                />

                <ReportRejectModal
                    isOpen={modals.reportReject}
                    onClose={() => {
                        setReportRejectReason('');
                        toggleModal('reportReject');
                    }}
                    selectedReport={selectedReport}
                    rejectReason={reportRejectReason}
                    setRejectReason={setReportRejectReason}
                    confirmRejectReport={confirmRejectReport}
                />

                <SettingsModal
                    isOpen={modals.settings}
                    onClose={() => toggleModal('settings')}
                    settingsData={settingsData}
                    setSettingsData={setSettingsData}
                    exportData={exportData}
                    importData={importData}
                    resetToDefaultData={resetToDefaultData}
                    onSaveSettings={() => {
                        saveToStorage(STORAGE_KEYS.SETTINGS, settingsData);
                        showToast('Settings saved.', 'success');
                        toggleModal('settings');
                    }}
                />

                <RejectEventModal
                    isOpen={modals.reject}
                    onClose={() => toggleModal('reject')}
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                    confirmRejectEvent={confirmRejectEvent}
                />

                <ImagePreviewModal
                    isOpen={modals.image}
                    imageModalSrc={imageModalSrc}
                    onClose={closeImageModal}
                />

                <ReportSubmissionModal
                    isOpen={modals.report}
                    selectedOffice={selectedOffice}
                    onClose={() => {
                        toggleModal('report');
                        setReportFormData(null);
                    }}
                    reportFormData={reportFormData}
                    setReportFormData={setReportFormData}
                    newMunicipality={newMunicipality}
                    setNewMunicipality={setNewMunicipality}
                    newSignal={newSignal}
                    setNewSignal={setNewSignal}
                    handleReportAddMunicipality={() => {
                        try {
                            if (newMunicipality.trim() && !reportFormData?.municipalities?.includes(newMunicipality)) {
                                setReportFormData(prev => ({
                                    ...prev,
                                    municipalities: [...(prev?.municipalities || []), newMunicipality],
                                    warning_signals: { ...(prev?.warning_signals || {}), [newMunicipality]: newSignal }
                                }));
                                setNewMunicipality('');
                                setNewSignal(1);
                                showToast('Municipality added.', 'success');
                            }
                        } catch (e) {
                            console.error('handleReportAddMunicipality error:', e);
                        }
                    }}
                    handleReportSignalChange={(mun, signal) => {
                        try {
                            setReportFormData(prev => ({
                                ...prev,
                                warning_signals: { ...(prev?.warning_signals || {}), [mun]: parseInt(signal) }
                            }));
                        } catch (e) {
                            console.error('handleReportSignalChange error:', e);
                        }
                    }}
                    handleReportRemoveMunicipality={(mun) => {
                        try {
                            setReportFormData(prev => {
                                const updatedMuns = (prev?.municipalities || []).filter(m => m !== mun);
                                const updatedSignals = { ...(prev?.warning_signals || {}) };
                                delete updatedSignals[mun];
                                return { ...prev, municipalities: updatedMuns, warning_signals: updatedSignals };
                            });
                            showToast('Municipality removed.', 'info');
                        } catch (e) {
                            console.error('handleReportRemoveMunicipality error:', e);
                        }
                    }}
                    handleReportFieldChange={handleReportFieldChange}
                    reportNewDamage={reportNewDamage}
                    setReportNewDamage={setReportNewDamage}
                    editingReportDamageIndex={editingReportDamageIndex}
                    setEditingReportDamageIndex={setEditingReportDamageIndex}
                    handleReportUpdateDamage={() => {
                        try {
                            if (editingReportDamageIndex !== null && reportFormData) {
                                const updated = [...(reportFormData.damage_details || [])];
                                const existing = updated[editingReportDamageIndex];
                                if (existing) {
                                    updated[editingReportDamageIndex] = {
                                        ...reportNewDamage,
                                        id: existing.id,
                                        date: existing.date,
                                        reportedBy: existing.reportedBy
                                    };
                                    setReportFormData(prev => ({ ...prev, damage_details: updated }));
                                    setReportNewDamage(EMPTY_DAMAGE);
                                    setEditingReportDamageIndex(null);
                                    showToast('Damage updated.', 'success');
                                }
                            }
                        } catch (e) {
                            console.error('handleReportUpdateDamage error:', e);
                        }
                    }}
                    handleReportAddDamage={handleReportAddDamage}
                    handleReportEditDamage={(index) => {
                        try {
                            if (reportFormData) {
                                const damage = reportFormData.damage_details?.[index];
                                if (damage) {
                                    setReportNewDamage({ ...damage });
                                    setEditingReportDamageIndex(index);
                                }
                            }
                        } catch (e) {
                            console.error('handleReportEditDamage error:', e);
                        }
                    }}
                    handleReportDeleteDamage={(index) => {
                        try {
                            if (reportFormData && window.confirm('Delete this damage record?')) {
                                const updated = (reportFormData.damage_details || []).filter((_, i) => i !== index);
                                setReportFormData(prev => ({ ...prev, damage_details: updated }));
                                showToast('Damage deleted.', 'info');
                            }
                        } catch (e) {
                            console.error('handleReportDeleteDamage error:', e);
                        }
                    }}
                    reportNewEquipment={reportNewEquipment}
                    setReportNewEquipment={setReportNewEquipment}
                    editingReportEquipmentIndex={editingReportEquipmentIndex}
                    setEditingReportEquipmentIndex={setEditingReportEquipmentIndex}
                    handleReportUpdateEquipment={() => {
                        try {
                            if (editingReportEquipmentIndex !== null && reportFormData) {
                                const updated = [...(reportFormData.equipment_details || [])];
                                const existing = updated[editingReportEquipmentIndex];
                                if (existing) {
                                    updated[editingReportEquipmentIndex] = {
                                        ...reportNewEquipment,
                                        id: existing.id,
                                        date: existing.date,
                                        reportedBy: existing.reportedBy
                                    };
                                    setReportFormData(prev => ({ ...prev, equipment_details: updated }));
                                    setReportNewEquipment(EMPTY_EQUIPMENT);
                                    setEditingReportEquipmentIndex(null);
                                    showToast('Equipment updated.', 'success');
                                }
                            }
                        } catch (e) {
                            console.error('handleReportUpdateEquipment error:', e);
                        }
                    }}
                    handleReportAddEquipment={handleReportAddEquipment}
                    handleReportEditEquipment={(index) => {
                        try {
                            if (reportFormData) {
                                const equipment = reportFormData.equipment_details?.[index];
                                if (equipment) {
                                    setReportNewEquipment({ ...equipment });
                                    setEditingReportEquipmentIndex(index);
                                }
                            }
                        } catch (e) {
                            console.error('handleReportEditEquipment error:', e);
                        }
                    }}
                    handleReportDeleteEquipment={(index) => {
                        try {
                            if (reportFormData && window.confirm('Delete this equipment record?')) {
                                const updated = (reportFormData.equipment_details || []).filter((_, i) => i !== index);
                                setReportFormData(prev => ({ ...prev, equipment_details: updated }));
                                showToast('Equipment deleted.', 'info');
                            }
                        } catch (e) {
                            console.error('handleReportDeleteEquipment error:', e);
                        }
                    }}
                    reportNewStaff={reportNewStaff}
                    setReportNewStaff={setReportNewStaff}
                    editingReportStaffIndex={editingReportStaffIndex}
                    setEditingReportStaffIndex={setEditingReportStaffIndex}
                    handleReportUpdateStaff={() => {
                        try {
                            if (editingReportStaffIndex !== null && reportFormData) {
                                const updated = [...(reportFormData.affected_staff || [])];
                                const existing = updated[editingReportStaffIndex];
                                if (existing) {
                                    updated[editingReportStaffIndex] = {
                                        ...reportNewStaff,
                                        id: existing.id,
                                        dateAdded: existing.dateAdded
                                    };
                                    setReportFormData(prev => ({ ...prev, affected_staff: updated }));
                                    setReportNewStaff(EMPTY_STAFF);
                                    setEditingReportStaffIndex(null);
                                    showToast('Staff updated.', 'success');
                                }
                            }
                        } catch (e) {
                            console.error('handleReportUpdateStaff error:', e);
                        }
                    }}
                    handleReportAddStaff={handleReportAddStaff}
                    handleReportEditStaff={(index) => {
                        try {
                            if (reportFormData) {
                                const staff = reportFormData.affected_staff?.[index];
                                if (staff) {
                                    setReportNewStaff({ ...staff });
                                    setEditingReportStaffIndex(index);
                                }
                            }
                        } catch (e) {
                            console.error('handleReportEditStaff error:', e);
                        }
                    }}
                    handleReportDeleteStaff={(index) => {
                        try {
                            if (reportFormData && window.confirm('Delete this staff record?')) {
                                const updated = (reportFormData.affected_staff || []).filter((_, i) => i !== index);
                                setReportFormData(prev => ({ ...prev, affected_staff: updated }));
                                showToast('Staff deleted.', 'info');
                            }
                        } catch (e) {
                            console.error('handleReportDeleteStaff error:', e);
                        }
                    }}
                    submitReport={submitReport}
                />

                <UserModal
                    isOpen={modals.user}
                    onClose={() => toggleModal('user')}
                    isEditingUser={isEditingUser}
                    userForm={userForm}
                    setUserForm={setUserForm}
                    isSuperAdmin={isSuperAdmin}
                    handleSaveUser={handleSaveUser}
                    officeOptions={Object.keys(officesData || {})}
                />
            </div>
        );
    } catch (error) {
        console.error('Dashboard render error:', error);
        return (
            <div style={{
                padding: '40px',
                color: '#dc3545',
                fontFamily: 'Arial, sans-serif',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                <h1 style={{ color: '#dc3545' }}>⚠️ Error Loading Dashboard</h1>
                <p style={{ fontSize: '16px' }}>{error.message}</p>
                <details style={{ marginTop: '20px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Error Details</summary>
                    <pre style={{
                        background: '#f5f5f5',
                        padding: '20px',
                        overflow: 'auto',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        fontSize: '13px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {error.stack}
                    </pre>
                </details>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#0d6efd',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    🔄 Reload Page
                </button>
            </div>
        );
    }
};

export default Dashboard;