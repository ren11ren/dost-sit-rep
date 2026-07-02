import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';

// ----------------------------- INITIAL MOCK DATA -----------------------------
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

// Typhoon History Storage
const TYPHOON_HISTORY_KEY = 'dash_typhoon_history';

const DEFAULT_EVENTS = [];

const DEFAULT_USERS = [
    { id: 1, name: 'Admin User', email: 'admin@dostregion1.ph', office: 'PSTO-La Union', role: 'SADMIN', status: 'Active', password: 'admin123', profileImage: '' },
    { id: 2, name: 'Regional Admin', email: 'admin-ilocosnorte@dostregion1.ph', office: 'PSTO-Ilocos Norte', role: 'ADMIN', status: 'Active', password: 'admin123', profileImage: '' },
    { id: 3, name: 'General User', email: 'user-ilocossur@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 4, name: 'La Union User', email: 'user-launion@dostregion1.ph', office: 'PSTO-La Union', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 5, name: 'Pangasinan User', email: 'user-pangasinan@dostregion1.ph', office: 'PSTO-Pangasinan', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 6, name: 'Ilocos Sur User', email: 'user-ilocossur2@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 7, name: 'Ilocos Norte User', email: 'user-ilocosnorte@dostregion1.ph', office: 'PSTO-Ilocos Norte', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 8, name: 'Ilocos Sur User 3', email: 'user-ilocossur3@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
];

// Helper functions
const loadFromStorage = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            const parsedValue = JSON.parse(stored);
            if (Array.isArray(defaultValue) && !Array.isArray(parsedValue)) {
                return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
            }
            return parsedValue;
        } catch (e) {
            return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        }
    }
    return typeof defaultValue === 'function' ? defaultValue() : defaultValue;
};

const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        // QuotaExceededError — storage is full (usually caused by large base64 images)
        // Try clearing only the stale/heavy keys before retrying once
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            try {
                // Remove the previous value for this key to make room
                localStorage.removeItem(key);
                localStorage.setItem(key, JSON.stringify(data));
            } catch (_) {
                console.warn('saveToStorage: still over quota after clear, skipping key:', key);
            }
        }
    }
};

const archiveOldEvents = (events) => {
    if (!Array.isArray(events)) return [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return events.map(event => {
        if (event.status !== 'archived' && event.endDateTime) {
            const endDate = new Date(event.endDateTime);
            if (endDate < sevenDaysAgo) {
                return { ...event, status: 'archived', deployment: event.deployment === 'Deployed' ? 'Draft' : event.deployment };
            }
        }
        return event;
    });
};

// Fetch live weather
const fetchLiveWeather = async () => {
    const lat = 16.5;
    const lon = 120.5;
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=Asia/Manila`
        );
        const data = await response.json();
        if (data.current_weather) {
            const w = data.current_weather;
            const temp = w.temperature;
            const weatherCode = w.weathercode;
            let condition = '';
            if (weatherCode === 0) condition = 'Clear sky';
            else if (weatherCode === 1 || weatherCode === 2) condition = 'Partly cloudy';
            else if (weatherCode === 3) condition = 'Overcast';
            else if (weatherCode >= 45 && weatherCode <= 49) condition = 'Fog';
            else if (weatherCode >= 51 && weatherCode <= 67) condition = 'Drizzle / Rain';
            else if (weatherCode >= 71 && weatherCode <= 77) condition = 'Snow';
            else if (weatherCode >= 80 && weatherCode <= 99) condition = 'Rain / Thunderstorm';
            else condition = 'Unknown';
            return { temp: Math.round(temp), condition, windSpeed: w.windspeed };
        }
    } catch (err) {
        console.error('Weather fetch failed:', err);
    }
    return null;
};

// Deep clone function
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const toHistoryNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[^0-9.-]/g, '');
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    if (typeof value === 'object') {
        return toHistoryNumber(value.amount ?? value.cost ?? value.value ?? value.total);
    }
    return 0;
};

const parseHistoryValue = (value) => {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (!trimmed) return null;

    try {
        const parsed = JSON.parse(trimmed);
        return parsed;
    } catch (_) {
        return value;
    }
};

const normalizeHistoryArray = (value) => {
    const parsed = parseHistoryValue(value);
    if (Array.isArray(parsed)) return parsed.filter(item => item !== null && item !== undefined);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return [parsed];
    }
    return [];
};

const normalizeHistoryObject = (value) => {
    const parsed = parseHistoryValue(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
    }
    return {};
};

const getHistoryArray = (source, keys) => {
    for (const key of keys) {
        const value = source?.[key];
        const normalized = normalizeHistoryArray(value);
        if (normalized.length > 0) return normalized;
    }
    return [];
};

const getHistoryNumber = (source, keys) => {
    for (const key of keys) {
        const value = source?.[key];
        if (value !== undefined && value !== null && value !== '') {
            return toHistoryNumber(value);
        }
    }
    return 0;
};

const getHistorySnapshot = (event = {}) => {
    const candidates = [
        event?.officesSnapshot,
        event?.offices_snapshot,
        event?.snapshot,
        event?.snapshotData,
        event?.officesData,
        event?.offices,
        event?.data?.officesSnapshot,
        event?.data?.offices_snapshot,
        event?.data?.snapshot,
        event?.data?.officesData,
        event?.data?.offices,
        event?.payload?.officesSnapshot,
        event?.payload?.offices_snapshot,
        event?.payload?.officesData,
        event?.payload?.offices,
    ];

    for (const candidate of candidates) {
        const normalized = normalizeHistoryObject(candidate);
        if (Object.keys(normalized).length > 0) {
            return normalized;
        }
    }

    return {};
};

const getHistoryProvinces = (event = {}) => {
    const candidateValues = [
        event?.provinces,
        event?.data?.provinces,
        event?.payload?.provinces,
        event?.provincesList,
        event?.data?.provincesList,
        event?.payload?.provincesList,
    ];

    for (const candidate of candidateValues) {
        const normalized = normalizeHistoryArray(candidate);
        if (normalized.length > 0) {
            return normalized.map(item => typeof item === 'string' ? item : (item?.name || item?.label || '')).filter(Boolean);
        }
    }

    const plainValue = parseHistoryValue(event?.provinces);
    if (typeof plainValue === 'string') {
        return plainValue
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }

    return [];
};

const getHistoryTotalsFromSource = (source = {}) => {
    const buildingItems = getHistoryArray(source, ['damage_details', 'damageDetails', 'building_damage', 'buildingDamage', 'damageData', 'damage']);
    const buildingFallback = getHistoryNumber(source, ['building_damage_total', 'buildingDamageTotal', 'damage_total', 'damageTotal', 'totalDamage', 'damageCost']);
    const explicitBuildingDamage = getHistoryNumber(source, ['buildingDamage', 'building_damage', 'buildingDamageCost', 'building_damage_cost']);
    const equipmentItems = getHistoryArray(source, ['equipment_details', 'equipmentDetails', 'equipment_damage', 'equipmentDamage', 'equipmentData', 'equipment']);
    const equipmentFallback = getHistoryNumber(source, ['equipment_damage_total', 'equipmentDamageTotal', 'equipment_cost', 'equipmentCost']);
    const explicitEquipmentDamage = getHistoryNumber(source, ['equipmentDamage', 'equipment_damage', 'equipmentDamageCost', 'equipment_damage_cost']);
    const staffItems = getHistoryArray(source, ['affected_staff', 'affectedStaff', 'staffAffected', 'staff']);
    const explicitStaffCount = getHistoryNumber(source, ['affectedStaff', 'staffCount', 'affected_staff_count', 'staff_count']);
    const explicitCasualtyCount = getHistoryNumber(source, ['casualties', 'casualtyCount', 'totalCasualties', 'casualty_count']);

    const arrayBuildingCost = buildingItems.reduce((sum, item) => sum + toHistoryNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total), 0);
    const arrayEquipmentCost = equipmentItems.reduce((sum, item) => sum + toHistoryNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total), 0);
    const hasExplicitTotals = explicitBuildingDamage > 0 || explicitEquipmentDamage > 0 || explicitStaffCount > 0 || explicitCasualtyCount > 0;

    return {
        buildingCost: hasExplicitTotals ? (explicitBuildingDamage || buildingFallback || arrayBuildingCost) : (arrayBuildingCost + (buildingFallback || 0)),
        equipmentCost: hasExplicitTotals ? (explicitEquipmentDamage || equipmentFallback || arrayEquipmentCost) : (arrayEquipmentCost + (equipmentFallback || 0)),
        staffCount: hasExplicitTotals ? (explicitStaffCount || staffItems.length) : (staffItems.length > 0 ? staffItems.length : explicitStaffCount),
        casualtyCount: hasExplicitTotals ? (explicitCasualtyCount || 0) : explicitCasualtyCount,
    };
};

export const getHistoryTotals = (event = {}) => {
    const snapshot = getHistorySnapshot(event);
    const officeEntries = Object.entries(snapshot)
        .filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
        .filter(([key]) => key !== 'PSTO-Region-1');

    const officeTotals = officeEntries.reduce((totals, [, office]) => {
        const officeTotalsForSource = getHistoryTotalsFromSource(office);
        return {
            buildingCost: totals.buildingCost + officeTotalsForSource.buildingCost,
            equipmentCost: totals.equipmentCost + officeTotalsForSource.equipmentCost,
            staffCount: totals.staffCount + officeTotalsForSource.staffCount,
            casualtyCount: totals.casualtyCount + officeTotalsForSource.casualtyCount,
        };
    }, { buildingCost: 0, equipmentCost: 0, staffCount: 0, casualtyCount: 0 });

    const rootSources = [event, event?.data, event?.payload, event?.record, event?.details].filter(source => source && typeof source === 'object' && !Array.isArray(source));
    const rootTotals = rootSources.reduce((totals, source) => {
        const sourceTotals = getHistoryTotalsFromSource(source);
        return {
            buildingCost: totals.buildingCost + sourceTotals.buildingCost,
            equipmentCost: totals.equipmentCost + sourceTotals.equipmentCost,
            staffCount: totals.staffCount + sourceTotals.staffCount,
            casualtyCount: totals.casualtyCount + sourceTotals.casualtyCount,
        };
    }, { buildingCost: 0, equipmentCost: 0, staffCount: 0, casualtyCount: 0 });

    const hasRootTotals = rootTotals.buildingCost > 0 || rootTotals.equipmentCost > 0 || rootTotals.staffCount > 0 || rootTotals.casualtyCount > 0;

    const totals = hasRootTotals ? rootTotals : officeTotals;

    return {
        buildingCost: totals.buildingCost,
        equipmentCost: totals.equipmentCost,
        totalDamage: totals.buildingCost + totals.equipmentCost,
        staffCount: totals.staffCount,
        casualtyCount: totals.casualtyCount,
        officeCount: officeEntries.length
    };
};

// ======================== REJECT MODAL COMPONENT ========================
const RejectModal = ({ isOpen, onClose, onConfirm, title, itemName }) => {
    const [reason, setReason] = useState('');

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setReason('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert('Please provide a rejection reason.');
            return;
        }
        onConfirm(reason);
        setReason('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content reject-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title || 'Reject Item'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p><strong>Item:</strong> {itemName || 'Unnamed item'}</p>
                    <p>Please provide a reason for rejecting this item:</p>
                    <textarea
                        className="reject-reason-textarea"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter rejection reason..."
                        rows="4"
                    />
                </div>
                <div className="modal-buttons">
                    <button className="danger" onClick={handleConfirm}>Confirm Rejection</button>
                    <button className="modal-close-footer-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

// ======================== EXTRACTED COMPONENTS ========================

// Toast component
const ToastBanner = ({ toast, setToast }) => {
    if (!toast.visible) return null;
    return (
        <div className={`toast-banner toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => setToast(prev => ({ ...prev, visible: false }))}>×</button>
        </div>
    );
};

// Notification Widget component
const NotificationWidget = ({ unreadCount, showNotificationsDropdown, setShowNotificationsDropdown, notifications, clearAllNotifications, markNotificationRead }) => (
    <div className="notification-widget">
        <button type="button" className="notification-button" onClick={() => setShowNotificationsDropdown(prev => !prev)}>
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
        {showNotificationsDropdown && (
            <div className="notification-dropdown">
                <div className="notification-dropdown-header">
                    <span>Notifications</span>
                    <button type="button" onClick={() => { clearAllNotifications(); setShowNotificationsDropdown(false); }}>Clear All</button>
                </div>
                {notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                ) : (
                    notifications.slice(0, 6).map(notif => (
                        <div key={notif.id} className={`notification-item ${notif.read ? 'read' : 'unread'}`}>
                            <div className="notification-title">{notif.title}</div>
                            <div className="notification-message">{notif.message}</div>
                            <div className="notification-time">{new Date(notif.timestamp).toLocaleString()}</div>
                            {!notif.read && <button type="button" onClick={() => markNotificationRead(notif.id)}>Mark read</button>}
                        </div>
                    ))
                )}
            </div>
        )}
    </div>
);

// Top Info Bar component
const TopInfoBar = ({ activeEvent, displayWeather }) => (
    <div className="top-info-bar">
        <div className="top-info-item top-info-main">
            <span className="top-info-label">Current Event</span>
            <span className="top-info-value">{activeEvent ? activeEvent.name : 'No Active Typhoon'}</span>
        </div>
        <div className="top-info-item">
            <span className="top-info-label">Category</span>
            <span className="top-info-value">{activeEvent?.category || '—'}</span>
        </div>
        <div className="top-info-item">
            <span className="top-info-label">Alert Level</span>
            <span className="top-info-value">{activeEvent?.alertLevel || '—'}</span>
        </div>
        <div className="top-info-item">
            <span className="top-info-label">Live Weather</span>
            <span className="top-info-value">{displayWeather}</span>
        </div>
    </div>
);

// Info Bar component
const InfoBar = ({ displayWeather, activeEvent, typhoonHistory }) => (
    <div className="info-bar">
        <div className="info-item"><span className="info-value">Region 1</span></div>
        <div className="info-item"><span className="info-label">Current Weather:</span><span className="info-value">{displayWeather}</span></div>
        <div className="info-item"><span className="info-label">Active Event:</span><span className="info-value">{activeEvent ? activeEvent.name : 'None'}</span></div>
        <div className="info-item"><span className="info-label">Total Events:</span><span className="info-value">{typhoonHistory.length}</span></div>
    </div>
);

// Notification Banner component
const NotificationBanner = ({ activeEvent, handleGenerateReport, handleDownloadDoc, handleExportExcel }) => (
    <div className="notification-banner">
        <span className="notification-badge">SYSTEM NOTICE</span>
        <span>{activeEvent ? `Active tropical cyclone ${activeEvent.name} (${activeEvent.alertLevel}) is being monitored.` : 'No active tropical cyclone at the moment. Systems are stable.'}</span>
        <div style={{ display: 'flex', gap: '10px', marginLeft: '16px', flexWrap: 'wrap' }}>
            <button className="secondary-btn" onClick={handleGenerateReport}>📄 Generate Report</button>
            <button className="secondary-btn" onClick={handleDownloadDoc}>📥 Download DOC</button>
            <button className="secondary-btn" onClick={handleExportExcel}>📊 Export Excel</button>
        </div>
    </div>
);

// PSTO Selector component
const PSTOSelector = ({ isUser, currentUser, officesData, selectedOffice, regionSummary, handleOfficeClick }) => (
    <div className="psto-selector-section">
        <div className="psto-section-header"><h2>{isUser && currentUser?.office ? '🏢 Your PSTO Office' : '🏢 Select PSTO Office'}</h2></div>
        <div className="psto-selector-grid">
            {isUser && currentUser?.office ? (
                <div
                    className={`psto-selector-card active ${officesData[currentUser.office]?.imageUrl ? 'has-image' : ''}`}
                    data-office={currentUser.office}
                    style={officesData[currentUser.office]?.imageUrl ? { backgroundImage: `url(${officesData[currentUser.office].imageUrl})` } : {}}
                    onClick={() => handleOfficeClick(currentUser.office)}
                >
                    <div className="psto-selector-overlay">
                        <div className="psto-selector-name">{currentUser.office}</div>
                        <div className="psto-selector-stats">
                            <span>📊 {officesData[currentUser.office]?.related_incidents ?? 0}</span>
                            <span>⚠️ {officesData[currentUser.office]?.casualties ?? 0}</span>
                            <span>🏗️ {(officesData[currentUser.office]?.damage_details || []).length}</span>
                            <span>👥 {(officesData[currentUser.office]?.affected_staff || []).length}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <div
                        className={`psto-selector-card ${selectedOffice === 'PSTO-Region-1' ? 'active' : ''}`}
                        data-office="PSTO-Region-1"
                        onClick={() => handleOfficeClick('PSTO-Region-1')}
                    >
                        <div className="psto-selector-overlay">
                            <div className="psto-selector-name">PSTO Region 1</div>
                            <div className="psto-selector-stats">
                                <span>📊 {regionSummary.incidents}</span>
                                <span>⚠️ {regionSummary.casualties}</span>
                                <span>🏗️ {regionSummary.damageDetails}</span>
                                <span>👥 {regionSummary.affectedStaff}</span>
                            </div>
                        </div>
                    </div>
                    {Object.keys(officesData).map(office => (
                        <div
                            key={office}
                            className={`psto-selector-card ${selectedOffice === office ? 'active' : ''} ${officesData[office]?.imageUrl ? 'has-image' : ''}`}
                            data-office={office}
                            style={officesData[office]?.imageUrl ? { backgroundImage: `url(${officesData[office].imageUrl})` } : {}}
                            onClick={() => handleOfficeClick(office)}
                        >
                            <div className="psto-selector-overlay">
                                <div className="psto-selector-name">{office}</div>
                                <div className="psto-selector-stats">
                                    <span>📊 {officesData[office].related_incidents}</span>
                                    <span>⚠️ {officesData[office].casualties}</span>
                                    <span>🏗️ {(officesData[office].damage_details || []).length}</span>
                                    <span>👥 {(officesData[office].affected_staff || []).length}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    </div>
);

// Edit Controls Bar component
const EditControlsBar = ({ selectedOffice, isUser, editMode, handleEditToggle, openReportModal, handleSave }) => (
    <div className="edit-controls-bar">
        <div><strong>Current PSTO:</strong> {selectedOffice}</div>
        <div className="edit-buttons">
            {!isUser && selectedOffice !== 'PSTO-Region-1' && <button onClick={handleEditToggle}>{editMode ? 'Cancel' : '✏️ Edit PSTO Data'}</button>}
            {isUser && <button className="success" onClick={openReportModal}>📤 Submit Report</button>}
            {editMode && <button className="success" onClick={handleSave}>💾 Save Changes</button>}
        </div>
    </div>
);

// Office Modal component
const OfficeModal = ({
    isOpen,
    onClose,
    selectedOffice,
    displayWeather,
    currentOfficeData,
    officeStatusRemarks
}) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !selectedOffice) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content event-details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="details-header">
                    <div className="details-title">{selectedOffice} Summary</div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Office Overview</div>
                    <div className="summary-panel">
                        <p><strong>General Weather:</strong> {displayWeather}</p>
                    </div>
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Quick Summary</div>
                    <div className="summary-grid">
                        <div className="summary-card summary-card-total summary-card-total-building">
                            <span className="summary-card-label">Building Damage Cost</span>
                            <span className="summary-card-value">
                                ₱{(Array.isArray(currentOfficeData.damage_details) ? currentOfficeData.damage_details : [])
                                    .reduce((sum, item) => sum + toHistoryNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total), 0)
                                    .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="summary-card summary-card-total summary-card-total-equipment">
                            <span className="summary-card-label">Equipment Damage Cost</span>
                            <span className="summary-card-value">
                                ₱{(Array.isArray(currentOfficeData.equipment_details) ? currentOfficeData.equipment_details : [])
                                    .reduce((sum, item) => sum + toHistoryNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total), 0)
                                    .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-card-label">Damage Building</span>
                            <span className="summary-card-value">{Array.isArray(currentOfficeData.damage_details) ? currentOfficeData.damage_details.length : '0'} record(s)</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-card-label">Equipment Damage</span>
                            <span className="summary-card-value">{Array.isArray(currentOfficeData.equipment_details) ? currentOfficeData.equipment_details.length : '0'} record(s)</span>
                        </div>
                        <div className="summary-card">
                            <span className="summary-card-label">Affected Staff</span>
                            <span className="summary-card-value">{Array.isArray(currentOfficeData.affected_staff) ? currentOfficeData.affected_staff.length : '0'} record(s)</span>
                        </div>
                    </div>
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Damage Building</div>
                    {Array.isArray(currentOfficeData.damage_details) && currentOfficeData.damage_details.length > 0 ? (
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Description</th>
                                    <th>Cost (₱)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOfficeData.damage_details.map((damage, idx) => (
                                    <tr key={damage.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>{damage.description || 'No description'}</td>
                                        <td>{toHistoryNumber(damage?.cost ?? damage?.amount ?? damage?.value ?? damage?.total).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td><span className={`status-badge status-${(damage.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>{damage.status || 'Reported'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="summary-empty">No damage records reported.</p>
                    )}
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Equipment Damage</div>
                    {Array.isArray(currentOfficeData.equipment_details) && currentOfficeData.equipment_details.length > 0 ? (
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Cost (₱)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOfficeData.equipment_details.map((equip, idx) => (
                                    <tr key={equip.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>{equip.name || 'No name'}</td>
                                        <td>{equip.description || '—'}</td>
                                        <td>{toHistoryNumber(equip?.cost ?? equip?.amount ?? equip?.value ?? equip?.total).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td><span className={`status-badge status-${(equip.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>{equip.status || 'Reported'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="summary-empty">No equipment damage records reported.</p>
                    )}
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Affected Staff</div>
                    {Array.isArray(currentOfficeData.affected_staff) && currentOfficeData.affected_staff.length > 0 ? (
                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Area</th>
                                    <th>Assistance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentOfficeData.affected_staff.map((staff, idx) => (
                                    <tr key={staff.id || idx}>
                                        <td>{idx + 1}</td>
                                        <td>{staff.name || 'Unknown'}</td>
                                        <td>{staff.area || 'Not specified'}</td>
                                        <td>{staff.assistance || 'None'}</td>
                                        <td><span className={`status-badge status-${(staff.status || 'active').toLowerCase().replace(/\s+/g, '-')}`}>{staff.status || 'Active'}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="summary-empty">No affected staff reported.</p>
                    )}
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Effects Summary</div>
                    <div className="summary-panel">
                        <div className="effects-summary-grid">
                            {officeStatusRemarks.map((item) => (
                                <div key={item.label} className="effect-summary-item">
                                    <span className="effect-summary-label">{item.label}:</span>
                                    <span className="effect-summary-value">{item.value || '—'}</span>
                                    {item.remark && item.remark.trim() !== '' && (
                                        <span className="effect-summary-remark">({item.remark})</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {currentOfficeData.municipalities && currentOfficeData.municipalities.length > 0 && (
                    <div className="detail-section">
                        <div className="detail-section-title">Municipalities</div>
                        <div className="scope-tags">
                            {currentOfficeData.municipalities.map((mun) => (
                                <span key={mun} className="scope-tag">{mun}</span>
                            ))}
                        </div>
                    </div>
                )}

                {currentOfficeData.remark && currentOfficeData.remark.trim() !== '' && (
                    <div className="detail-section">
                        <div className="detail-section-title">General Remarks</div>
                        <div className="summary-panel">
                            <p>{currentOfficeData.remark}</p>
                        </div>
                    </div>
                )}

                <div className="modal-buttons">
                    <button className="modal-close-footer-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

// ===== ADD/EDIT EVENT MODAL - MODERN DESIGN =====
const AddEventModal = ({
    isOpen,
    onClose,
    isEditingEvent,
    newEvent,
    handleNewEventFieldChange,
    setNewEvent,
    handleAddEvent,
    allProvinces
}) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content large-modal modern-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header modern-modal-header">
                    <h3 className="modal-title">{isEditingEvent ? '✏️ Edit Event' : '🌪️ Add New Event'}</h3>
                    <button type="button" className="modal-close" onClick={onClose}>×</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="event-form modern-form">
                    {/* Basic Information - Two Column Grid */}
                    <div className="form-section modern-form-section">
                        <h4 className="form-section-title">📋 Basic Information</h4>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Event Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newEvent.name}
                                    onChange={(e) => handleNewEventFieldChange('name', e.target.value)}
                                    required
                                    placeholder="e.g., Typhoon Kristine"
                                    className="form-input modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={newEvent.category}
                                    onChange={(e) => handleNewEventFieldChange('category', e.target.value)}
                                    className="form-select modern-select"
                                >
                                    <option value="">-- Select --</option>
                                    <option value="Super Typhoon">🌪️ Super Typhoon</option>
                                    <option value="Typhoon">🌀 Typhoon</option>
                                    <option value="Severe Tropical Storm">🌧️ Severe Tropical Storm</option>
                                    <option value="Tropical Storm">🌧️ Tropical Storm</option>
                                    <option value="Tropical Depression">☁️ Tropical Depression</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Alert Level</label>
                                <select
                                    name="alertLevel"
                                    value={newEvent.alertLevel}
                                    onChange={(e) => handleNewEventFieldChange('alertLevel', e.target.value)}
                                    className="form-select modern-select"
                                >
                                    <option value="">-- Select --</option>
                                    <option value="RED">🔴 RED</option>
                                    <option value="BLUE">🔵 BLUE</option>
                                    <option value="WHITE">⚪ WHITE</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Deployment Status</label>
                                <select
                                    name="deployment"
                                    value={newEvent.deployment}
                                    onChange={(e) => handleNewEventFieldChange('deployment', e.target.value)}
                                    className="form-select modern-select"
                                >
                                    <option value="Draft">📄 Draft</option>
                                    <option value="Deployed">🚀 Deployed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time - Two Column Grid */}
                    <div className="form-section modern-form-section">
                        <h4 className="form-section-title">📅 Date & Time</h4>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Start Date/Time</label>
                                <input
                                    type="datetime-local"
                                    name="startDateTime"
                                    value={newEvent.startDateTime}
                                    onChange={(e) => handleNewEventFieldChange('startDateTime', e.target.value)}
                                    className="form-input modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date/Time</label>
                                <input
                                    type="datetime-local"
                                    name="endDateTime"
                                    value={newEvent.endDateTime}
                                    onChange={(e) => handleNewEventFieldChange('endDateTime', e.target.value)}
                                    className="form-input modern-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Track & Intensity - Two Column Grid */}
                    <div className="form-section modern-form-section">
                        <h4 className="form-section-title">🎯 Track & Intensity</h4>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Track Positions</label>
                                <input
                                    type="text"
                                    name="trackPositions"
                                    value={newEvent.trackPositions}
                                    onChange={(e) => handleNewEventFieldChange('trackPositions', e.target.value)}
                                    placeholder="e.g., 13.0N 121.2E → 13.8N 122.1E"
                                    className="form-input modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Intensity</label>
                                <input
                                    type="text"
                                    name="intensity"
                                    value={newEvent.intensity}
                                    onChange={(e) => handleNewEventFieldChange('intensity', e.target.value)}
                                    placeholder="e.g., 95 kph / 52 kt"
                                    className="form-input modern-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Affected Areas */}
                    <div className="form-section modern-form-section">
                        <h4 className="form-section-title">📍 Affected Areas</h4>
                        <div className="scope-grid-modern">
                            {allProvinces.map(p => {
                                const selected = newEvent.provinces.includes(p);
                                return (
                                    <button
                                        type="button"
                                        key={p}
                                        className={`scope-item-modern ${selected ? 'selected' : ''}`}
                                        onClick={() => {
                                            setNewEvent(prev => {
                                                const provinces = selected ? prev.provinces.filter(x => x !== p) : [...prev.provinces, p];
                                                return {
                                                    ...prev,
                                                    provinces,
                                                    sendToAllUsers: provinces.length === allProvinces.length
                                                };
                                            });
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="form-group" style={{ marginTop: '12px' }}>
                            <label className="checkbox-group modern-checkbox">
                                <input
                                    type="checkbox"
                                    name="sendToAllUsers"
                                    checked={newEvent.sendToAllUsers}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setNewEvent(prev => ({
                                            ...prev,
                                            sendToAllUsers: checked,
                                            provinces: checked ? allProvinces : prev.provinces
                                        }));
                                    }}
                                />
                                Send to all offices
                            </label>
                        </div>
                    </div>

                    {/* Event Image */}
                    <div className="form-section modern-form-section">
                        <h4 className="form-section-title">🖼️ Event Image</h4>
                        <div className="form-group">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => handleNewEventFieldChange('imageUrl', reader.result);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="form-input modern-input"
                            />
                            {newEvent.imageUrl && (
                                <div className="image-preview-container" style={{ marginTop: '12px' }}>
                                    <img src={newEvent.imageUrl} alt="Preview" className="event-image-preview" />
                                    <button
                                        type="button"
                                        className="remove-image-btn"
                                        onClick={() => handleNewEventFieldChange('imageUrl', '')}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-buttons modern-modal-buttons">
                        <button type="submit" className="btn-primary">
                            {isEditingEvent ? '💾 Save Changes' : '🌪️ Create Event'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ===== EVENT DETAILS MODAL =====
const EventDetailsModal = ({
    isOpen,
    onClose,
    selectedEvent,
    isEditingReportLink,
    reportLinkInput,
    setReportLinkInput,
    setIsEditingReportLink,
    handleSaveReportLink,
    canEditEvents,
    handleDeleteEvent,
    handleEditEvent,
    getAlertColor,
    openImageModal,
    handleRejectEvent
}) => {
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !selectedEvent) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleRejectClick = () => {
        setShowRejectModal(true);
    };

    const handleRejectConfirm = (reason) => {
        if (handleRejectEvent) {
            handleRejectEvent(selectedEvent.id, reason);
        }
        setShowRejectModal(false);
    };

    const fmtPeso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const snapshot = getHistorySnapshot(selectedEvent);
    const snapshotKeys = Object.keys(snapshot).filter(k => k !== 'PSTO-Region-1');

    return (
        <>
            <div className="modal-overlay" onClick={handleOverlayClick}>
                <div className="modal-content event-details-modal" onClick={e => e.stopPropagation()}>
                    <div className="details-header">
                        <div className="details-title">{selectedEvent.name}</div>
                        <button className="modal-close" onClick={onClose}>×</button>
                    </div>
                    <div className="detail-section">
                        <div className="detail-section-title">📋 TROPICAL CYCLONE PRELIMINARY REPORT</div>
                        <div className="report-panel">
                            {isEditingReportLink ? (
                                <div className="report-edit-group">
                                    <input
                                        type="url"
                                        value={reportLinkInput}
                                        onChange={(e) => setReportLinkInput(e.target.value)}
                                        placeholder="Enter report URL..."
                                    />
                                    <button className="success" onClick={handleSaveReportLink}>Save</button>
                                    <button onClick={() => setIsEditingReportLink(false)}>Cancel</button>
                                </div>
                            ) : (
                                <div className="report-display-group">
                                    {selectedEvent.reportLink ?
                                        <a href={selectedEvent.reportLink} target="_blank" rel="noopener noreferrer">📄 View Report</a> :
                                        <span>No report link</span>
                                    }
                                    {canEditEvents && (
                                        <button className="edit-link-btn" onClick={() => {
                                            setReportLinkInput(selectedEvent.reportLink || '');
                                            setIsEditingReportLink(true);
                                        }}>
                                            ✏️ Add/Edit Link
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="details-grid">
                        <div className="detail-box">
                            <div className="detail-label">Category</div>
                            <div className="detail-value">{selectedEvent.category || selectedEvent.type || '—'}</div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-label">Alert Level</div>
                            <div className="detail-value">
                                <span className="alert-badge" style={{ background: getAlertColor(selectedEvent.alertLevel) }}>
                                    {selectedEvent.alertLevel || '—'}
                                </span>
                            </div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-label">Start Date</div>
                            <div className="detail-value">{selectedEvent.startDateTime ? new Date(selectedEvent.startDateTime).toLocaleString() : selectedEvent.date || '—'}</div>
                        </div>
                        <div className="detail-box">
                            <div className="detail-label">End Date</div>
                            <div className="detail-value">{selectedEvent.endDateTime ? new Date(selectedEvent.endDateTime).toLocaleString() : 'Ongoing'}</div>
                        </div>
                    </div>
                    <div className="detail-section">
                        <div className="detail-section-title">📍 Deployment Scope</div>
                        <div className="scope-tags">
                            {selectedEvent.provinces?.map((p, i) => (
                                <span key={i} className="scope-tag">{p}</span>
                            ))}
                        </div>
                    </div>
                    <div className="detail-section">
                        <div className="detail-section-title">🎯 Track & Intensity</div>
                        <div className="summary-panel">
                            <p><strong>Positions:</strong> {selectedEvent.trackPositions || 'Not specified'}</p>
                            <p><strong>Intensity:</strong> {selectedEvent.intensity || 'Not specified'}</p>
                        </div>
                    </div>
                    {selectedEvent.imageUrl && (
                        <div className="detail-section">
                            <img src={selectedEvent.imageUrl} alt="Event" className="event-image-preview" onClick={() => openImageModal(selectedEvent.imageUrl)} />
                        </div>
                    )}
                    {(selectedEvent.casualties || selectedEvent.power_status || selectedEvent.communication_lines || selectedEvent.damage_facilities || selectedEvent.assistance_provided || selectedEvent.related_incidents) && (
                        <div className="detail-section">
                            <div className="detail-section-title">💔 Damage Effects</div>
                            <div className="damage-summary-grid">
                                {selectedEvent.related_incidents > 0 && (
                                    <div className="damage-item">
                                        <span className="damage-label">Related Incidents</span>
                                        <span className="damage-value">{selectedEvent.related_incidents}</span>
                                        {selectedEvent.remark_related_incidents && <span className="damage-remark">{selectedEvent.remark_related_incidents}</span>}
                                    </div>
                                )}
                                {selectedEvent.casualties > 0 && (
                                    <div className="damage-item">
                                        <span className="damage-label">Casualties</span>
                                        <span className="damage-value">{selectedEvent.casualties}</span>
                                        {selectedEvent.remark_casualties && <span className="damage-remark">{selectedEvent.remark_casualties}</span>}
                                    </div>
                                )}
                                {selectedEvent.power_status && (
                                    <div className="damage-item">
                                        <span className="damage-label">Power Status</span>
                                        <span className="damage-value">{selectedEvent.power_status}</span>
                                        {selectedEvent.remark_power_status && <span className="damage-remark">{selectedEvent.remark_power_status}</span>}
                                    </div>
                                )}
                                {selectedEvent.communication_lines && (
                                    <div className="damage-item">
                                        <span className="damage-label">Communication Lines</span>
                                        <span className="damage-value">{selectedEvent.communication_lines}</span>
                                        {selectedEvent.remark_communication_lines && <span className="damage-remark">{selectedEvent.remark_communication_lines}</span>}
                                    </div>
                                )}
                                {selectedEvent.damage_facilities && (
                                    <div className="damage-item">
                                        <span className="damage-label">Damage to Facilities</span>
                                        <span className="damage-value">{selectedEvent.damage_facilities}</span>
                                        {selectedEvent.remark_damage_facilities && <span className="damage-remark">{selectedEvent.remark_damage_facilities}</span>}
                                    </div>
                                )}
                                {selectedEvent.assistance_provided && (
                                    <div className="damage-item">
                                        <span className="damage-label">Assistance Provided</span>
                                        <span className="damage-value">{selectedEvent.assistance_provided}</span>
                                        {selectedEvent.remark_assistance_provided && <span className="damage-remark">{selectedEvent.remark_assistance_provided}</span>}
                                    </div>
                                )}
                                {selectedEvent.work_suspension && (
                                    <div className="damage-item">
                                        <span className="damage-label">Work Suspension</span>
                                        <span className="damage-value">✓ Yes</span>
                                        {selectedEvent.remark_work_suspension && <span className="damage-remark">{selectedEvent.remark_work_suspension}</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {snapshotKeys.length > 0 && (
                        <div className="detail-section">
                            <div className="detail-section-title">🏢 PSTO Snapshot</div>
                            <div className="snapshot-grid">
                                {snapshotKeys.map((office) => {
                                    const officeData = snapshot[office] || {};
                                    const totals = getHistoryTotalsFromSource(officeData);
                                    return (
                                        <div key={office} className="snapshot-office-card">
                                            <div className="snapshot-office-title">{office}</div>
                                            <div className="snapshot-office-values">
                                                <div><strong>Building</strong>: {fmtPeso(totals.buildingCost)}</div>
                                                <div><strong>Equipment</strong>: {fmtPeso(totals.equipmentCost)}</div>
                                                <div><strong>Staff</strong>: {totals.staffCount}</div>
                                                <div><strong>Casualties</strong>: {totals.casualtyCount}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {selectedEvent.rejectionReason && (
                        <div className="rejection-reason">
                            <strong>Rejection reason:</strong> {selectedEvent.rejectionReason}
                        </div>
                    )}
                    <div className="modal-buttons details-actions">
                        {canEditEvents && (
                            <>
                                <button className="btn-danger" onClick={() => handleDeleteEvent(selectedEvent.id)}>🗑️ Delete</button>
                                <button className="btn-primary" onClick={() => handleEditEvent(selectedEvent)}>✏️ Edit</button>
                                {selectedEvent.status === 'pending' && (
                                    <button className="btn-danger" onClick={handleRejectClick}>🚫 Reject</button>
                                )}
                            </>
                        )}
                        <button className="btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
            <RejectModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={handleRejectConfirm}
                title="Reject Event"
                itemName={selectedEvent?.name}
            />
        </>
    );
};

// ===== TYPHOON HISTORY CONTENT =====
const HistoryEventCard = ({ event, getAlertColor, setSelectedEvent, setShowDetailsModal }) => {
    const [showSnapshot, setShowSnapshot] = React.useState(false);
    const snapshot = getHistorySnapshot(event);
    const officeKeys = Object.keys(snapshot).filter(k => k !== 'PSTO-Region-1');
    const historyTotals = getHistoryTotals(event);
    const provinces = getHistoryProvinces(event);

    const fmtPeso = (n) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className={`hist-card ${showSnapshot ? 'hist-card-open' : ''}`}>
            <div className="hist-card-header">
                <div className="hist-card-title-group">
                    <span className="hist-card-name">{event.name}</span>
                    <span className="alert-badge" style={{ background: getAlertColor(event.alertLevel), marginLeft: 8 }}>
                        {event.alertLevel || '—'}
                    </span>
                    {event.category && <span className="hist-card-cat">{event.category}</span>}
                    <span className={`hist-status-badge status-${(event.status || 'archived').toLowerCase()}`}>{event.status?.toUpperCase() || 'ARCHIVED'}</span>
                </div>
                <div className="hist-card-meta">
                    <span>{event.date}</span>
                    {event.archivedAt && (
                        <span className="hist-card-archived">
                            Archived {new Date(event.archivedAt).toLocaleDateString()}
                        </span>
                    )}
                    <span className="hist-card-tag">{provinces.length} province{provinces.length !== 1 ? 's' : ''}</span>
                    <span className="hist-chevron">{showSnapshot ? '▲' : '▼'}</span>
                </div>
            </div>

            <div className="hist-summary-strip">
                <div className="hist-stat">
                    <span className="hist-stat-label">Building Damage</span>
                    <span className="hist-stat-value hist-stat-orange">{fmtPeso(historyTotals.buildingCost)}</span>
                </div>
                <div className="hist-stat">
                    <span className="hist-stat-label">Equipment Damage</span>
                    <span className="hist-stat-value hist-stat-green">{fmtPeso(historyTotals.equipmentCost)}</span>
                </div>
                <div className="hist-stat">
                    <span className="hist-stat-label">Total Damage</span>
                    <span className="hist-stat-value hist-stat-blue">{fmtPeso(historyTotals.totalDamage)}</span>
                </div>
                <div className="hist-stat">
                    <span className="hist-stat-label">Casualties</span>
                    <span className="hist-stat-value">{historyTotals.casualtyCount}</span>
                </div>
                <div className="hist-stat">
                    <span className="hist-stat-label">Affected Staff</span>
                    <span className="hist-stat-value">{historyTotals.staffCount}</span>
                </div>
                <button
                    className="hist-snapshot-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowSnapshot(prev => !prev);
                    }}
                    disabled={officeKeys.length === 0}
                >
                    {showSnapshot ? 'Hide PSTO Snapshot' : 'View PSTO Snapshot'}
                </button>
                <button
                    className="hist-detail-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setShowDetailsModal(true);
                    }}
                >
                    View Details
                </button>
            </div>

            {showSnapshot && (
                <div className="hist-body">
                    {officeKeys.length === 0 ? (
                        <p className="hist-empty">No PSTO snapshot available for this event.</p>
                    ) : officeKeys.map(office => {
                        const d = snapshot[office] || {};
                        const damageArray = getHistoryArray(d, ['damage_details', 'damageDetails', 'building_damage', 'buildingDamage', 'damageData']);
                        const equipArray = getHistoryArray(d, ['equipment_details', 'equipmentDetails', 'equipment_damage', 'equipmentDamage', 'equipmentData']);
                        const staffArray = getHistoryArray(d, ['affected_staff', 'affectedStaff', 'staffAffected', 'staff']);
                        const bCost = damageArray.reduce((s, x) => s + toHistoryNumber(x?.cost ?? x?.amount ?? x?.value ?? x?.total), 0);
                        const eCost = equipArray.reduce((s, x) => s + toHistoryNumber(x?.cost ?? x?.amount ?? x?.value ?? x?.total), 0);
                        const hasDamage = damageArray.length > 0;
                        const hasEquip = equipArray.length > 0;
                        const hasStaff = staffArray.length > 0;

                        return (
                            <div key={office} className="hist-office-block">
                                <div className="hist-office-header">
                                    <span className="hist-office-name">{office}</span>
                                    <div className="hist-office-costs">
                                        {bCost > 0 && <span className="hist-cost-tag hist-cost-orange">Bldg: {fmtPeso(bCost)}</span>}
                                        {eCost > 0 && <span className="hist-cost-tag hist-cost-green">Equip: {fmtPeso(eCost)}</span>}
                                        {bCost === 0 && eCost === 0 && <span className="hist-cost-tag">No damage recorded</span>}
                                    </div>
                                </div>

                                <div className="hist-effects-row">
                                    {[
                                        { label: 'Casualties', val: d.casualties || 0 },
                                        { label: 'Power', val: d.power_status || '—' },
                                        { label: 'Communication', val: d.communication_lines || '—' },
                                        { label: 'Work Suspension', val: d.work_suspension ? 'Yes' : 'No' },
                                    ].map(item => (
                                        <div key={item.label} className="hist-effect-chip">
                                            <span className="hist-effect-label">{item.label}</span>
                                            <span className="hist-effect-val">{item.val}</span>
                                        </div>
                                    ))}
                                </div>

                                {hasDamage && (
                                    <div className="hist-sub-section">
                                        <div className="hist-sub-title">Damage Building</div>
                                        <table className="summary-table">
                                            <thead><tr><th>#</th><th>Description</th><th>Cost (₱)</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {damageArray.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>{item.description || item.name || '—'}</td>
                                                        <td>{fmtPeso(toHistoryNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total))}</td>
                                                        <td><span className={`status-badge status-${(item.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>{item.status || 'Reported'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {hasEquip && (
                                    <div className="hist-sub-section">
                                        <div className="hist-sub-title">Equipment Damage</div>
                                        <table className="summary-table">
                                            <thead><tr><th>#</th><th>Name</th><th>Description</th><th>Cost (₱)</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {equipArray.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>{item.name || item.description || '—'}</td>
                                                        <td>{item.description || item.details || '—'}</td>
                                                        <td>{fmtPeso(toHistoryNumber(item?.cost ?? item?.amount ?? item?.value ?? item?.total))}</td>
                                                        <td><span className={`status-badge status-${(item.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>{item.status || 'Reported'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {hasStaff && (
                                    <div className="hist-sub-section">
                                        <div className="hist-sub-title">Affected Staff</div>
                                        <table className="summary-table">
                                            <thead><tr><th>#</th><th>Name</th><th>Area</th><th>Assistance</th><th>Status</th></tr></thead>
                                            <tbody>
                                                {staffArray.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>{item.name || '—'}</td>
                                                        <td>{item.area || '—'}</td>
                                                        <td>{item.assistance || 'None'}</td>
                                                        <td><span className={`status-badge status-${(item.status || 'active').toLowerCase().replace(/\s+/g, '-')}`}>{item.status || 'Active'}</span></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {!hasDamage && !hasEquip && !hasStaff && (
                                    <p className="hist-empty">No damage or staff records for this office.</p>
                                )}
                            </div>
                        );
                    })}

                    {officeKeys.length > 0 && (
                        <div className="hist-psto-total-row">
                            <div className="hist-psto-total-label">Event PSTO Total</div>
                            <div className="hist-psto-total-stats">
                                <div className="hist-psto-total-stat">
                                    <span className="hist-psto-total-key">Building Damage</span>
                                    <span className="hist-psto-total-val hist-stat-orange">{fmtPeso(historyTotals.buildingCost)}</span>
                                </div>
                                <div className="hist-psto-total-stat">
                                    <span className="hist-psto-total-key">Equipment Damage</span>
                                    <span className="hist-psto-total-val hist-stat-green">{fmtPeso(historyTotals.equipmentCost)}</span>
                                </div>
                                <div className="hist-psto-total-stat">
                                    <span className="hist-psto-total-key">Combined Damage</span>
                                    <span className="hist-psto-total-val hist-stat-blue">{fmtPeso(historyTotals.totalDamage)}</span>
                                </div>
                                <div className="hist-psto-total-stat">
                                    <span className="hist-psto-total-key">Casualties</span>
                                    <span className="hist-psto-total-val">{historyTotals.casualtyCount}</span>
                                </div>
                                <div className="hist-psto-total-stat">
                                    <span className="hist-psto-total-key">Affected Staff</span>
                                    <span className="hist-psto-total-val">{historyTotals.staffCount}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TyphoonHistoryContent = ({ typhoonHistory, searchTerm, setSearchTerm, handleSearchChange, setSelectedEvent, setShowDetailsModal, getAlertColor }) => {
    const normalizedSearch = (searchTerm || '').trim().toLowerCase();
    const filtered = (typhoonHistory || []).filter(e => {
        if (!normalizedSearch) return true;
        const provinceMatches = getHistoryProvinces(e).some(p => p.toLowerCase().includes(normalizedSearch));
        return e.name?.toLowerCase().includes(normalizedSearch) ||
            e.category?.toLowerCase().includes(normalizedSearch) ||
            provinceMatches;
    });

    const sortedEvents = [...filtered].sort((a, b) => {
        const aDate = new Date(a.archivedAt || a.date || 0).getTime();
        const bDate = new Date(b.archivedAt || b.date || 0).getTime();
        return bDate - aDate;
    });

    const fmtPeso = (n) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Cumulative totals across ALL archived events (not filtered, so always shows full picture)
    const allEvents = typhoonHistory || [];
    const uniqueProvinces = [...new Set(allEvents.flatMap(e => e.provinces || []))].length;
    const totalsByEvent = allEvents.map(getHistoryTotals);
    const totalRecordedOffices = totalsByEvent.reduce((sum, totals) => sum + totals.officeCount, 0);
    const cumBuilding = totalsByEvent.reduce((sum, totals) => sum + totals.buildingCost, 0);
    const cumEquip = totalsByEvent.reduce((sum, totals) => sum + totals.equipmentCost, 0);
    const cumCasualties = totalsByEvent.reduce((sum, totals) => sum + totals.casualtyCount, 0);
    const cumStaff = totalsByEvent.reduce((sum, totals) => sum + totals.staffCount, 0);

    return (
        <div className="events-management">
            <div className="events-header">
                <h1>📜 Typhoon History</h1>
                <div className="header-actions">
                    <div className="search-box-enhanced">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="search-input-enhanced"
                        />
                        {searchTerm && <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>}
                    </div>
                </div>
            </div>

            {/* ── Cumulative Summary Card ── */}
            {allEvents.length > 0 && (
                <div className="hist-cumulative-card">
                    <div className="hist-cumulative-title">
                        <span className="hist-cumulative-icon">📊</span>
                        Cumulative Summary
                        <span className="hist-cumulative-badge">{allEvents.length} event{allEvents.length !== 1 ? 's' : ''} total</span>
                    </div>
                    <div className="hist-cumulative-stats">
                        <div className="hist-cum-stat hist-cum-orange">
                            <span className="hist-cum-label">Grand Total Building Damage</span>
                            <span className="hist-cum-value">{fmtPeso(cumBuilding)}</span>
                        </div>
                        <div className="hist-cum-stat hist-cum-green">
                            <span className="hist-cum-label">Grand Total Equipment Damage</span>
                            <span className="hist-cum-value">{fmtPeso(cumEquip)}</span>
                        </div>
                        <div className="hist-cum-stat hist-cum-blue">
                            <span className="hist-cum-label">Combined Total Damage</span>
                            <span className="hist-cum-value">{fmtPeso(cumBuilding + cumEquip)}</span>
                        </div>
                        <div className="hist-cum-stat hist-cum-red">
                            <span className="hist-cum-label">Total Casualties</span>
                            <span className="hist-cum-value">{cumCasualties}</span>
                        </div>
                        <div className="hist-cum-stat hist-cum-purple">
                            <span className="hist-cum-label">Total Affected Staff</span>
                            <span className="hist-cum-value">{cumStaff}</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="events-subtitle">
                {sortedEvents.length} archived event{sortedEvents.length !== 1 ? 's' : ''} • {uniqueProvinces} province{uniqueProvinces !== 1 ? 's' : ''} impacted • {totalRecordedOffices} PSTO office snapshot{totalRecordedOffices !== 1 ? 's' : ''}
            </div>

            {sortedEvents.length === 0 ? (
                <div className="hist-empty-state">No typhoon history available yet.<br />Events will appear here after a new event is deployed.</div>
            ) : (
                <div className="hist-list">
                    {sortedEvents.map(event => (
                        <HistoryEventCard
                            key={event.id}
                            event={event}
                            getAlertColor={getAlertColor}
                            setSelectedEvent={setSelectedEvent}
                            setShowDetailsModal={setShowDetailsModal}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export {
    DEFAULT_OFFICE_DATA,
    TYPHOON_HISTORY_KEY,
    DEFAULT_EVENTS,
    DEFAULT_USERS,
    loadFromStorage,
    saveToStorage,
    archiveOldEvents,
    fetchLiveWeather,
    deepClone,
    RejectModal,
    ToastBanner,
    NotificationWidget,
    TopInfoBar,
    InfoBar,
    NotificationBanner,
    PSTOSelector,
    EditControlsBar,
    OfficeModal,
    AddEventModal,
    EventDetailsModal,
    TyphoonHistoryContent
};
