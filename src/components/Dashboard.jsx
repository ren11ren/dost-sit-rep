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
    { id: 8, name: 'Ilocos Sur FO Admin', email: 'admin-ilocossur-fo@dostregion1.ph', office: 'PSTO-Ilocos Sur - FO', role: 'ADMIN', status: 'Active', password: 'admin123', profileImage: '' },
    { id: 9, name: 'Ilocos Sur FO User', email: 'user-ilocossur-fo@dostregion1.ph', office: 'PSTO-Ilocos Sur - FO', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 10, name: 'Pangasinan FO Admin', email: 'admin-pangasinan-fo@dostregion1.ph', office: 'PSTO-Pangasinan - FO', role: 'ADMIN', status: 'Active', password: 'admin123', profileImage: '' },
    { id: 11, name: 'Pangasinan FO User', email: 'user-pangasinan-fo@dostregion1.ph', office: 'PSTO-Pangasinan - FO', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
    { id: 12, name: 'Ilocos Sur User 3', email: 'user-ilocossur3@dostregion1.ph', office: 'PSTO-Ilocos Sur', role: 'USER', status: 'Active', password: 'user123', profileImage: '' },
];

// Helper functions
const loadFromStorage = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try { return JSON.parse(stored); } catch (e) { return defaultValue; }
    }
    return defaultValue;
};

const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const archiveOldEvents = (events) => {
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
                    <div className="summary-panel">
                        {Array.isArray(currentOfficeData.damage_details) && currentOfficeData.damage_details.length > 0 ? (
                            <div className="summary-list">
                                {currentOfficeData.damage_details.map((damage, idx) => (
                                    <div key={damage.id || idx} className="summary-list-item">
                                        <span className="summary-list-title">{damage.description || 'No description'}</span>
                                        <span>Cost: ₱{damage.cost || 0}</span>
                                        <span>Status: {damage.status || 'Reported'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No damage records reported.</p>
                        )}
                    </div>
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Equipment Damage</div>
                    <div className="summary-panel">
                        {Array.isArray(currentOfficeData.equipment_details) && currentOfficeData.equipment_details.length > 0 ? (
                            <div className="summary-list">
                                {currentOfficeData.equipment_details.map((equip, idx) => (
                                    <div key={equip.id || idx} className="summary-list-item">
                                        <span className="summary-list-title">{equip.name || 'No name'}</span>
                                        <span>{equip.description || ''}</span>
                                        <span>Cost: ₱{equip.cost || 0}</span>
                                        <span>Status: {equip.status || 'Reported'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No equipment damage records reported.</p>
                        )}
                    </div>
                </div>

                <div className="detail-section">
                    <div className="detail-section-title">Affected Staff</div>
                    <div className="summary-panel">
                        {Array.isArray(currentOfficeData.affected_staff) && currentOfficeData.affected_staff.length > 0 ? (
                            <div className="summary-list">
                                {currentOfficeData.affected_staff.map((staff, idx) => (
                                    <div key={staff.id || idx} className="summary-list-item">
                                        <span className="summary-list-title">{staff.name || 'Unknown staff'}</span>
                                        <span>Area: {staff.area || 'Not specified'}</span>
                                        <span>Assistance: {staff.assistance || 'None'}</span>
                                        <span>Status: {staff.status || 'Active'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No affected staff reported.</p>
                        )}
                    </div>
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
const TyphoonHistoryContent = ({ typhoonHistory, searchTerm, setSearchTerm, handleSearchChange, setSelectedEvent, setShowDetailsModal, getAlertColor }) => (
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
                    {searchTerm && (
                        <button className="search-clear" onClick={() => setSearchTerm('')}>✕</button>
                    )}
                </div>
            </div>
        </div>
        <div className="events-subtitle">Complete history of all typhoons and tropical cyclones</div>
        <div className="events-table-container">
            <table className="events-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Category</th>
                        <th>Alert Level</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {typhoonHistory.length > 0 ? typhoonHistory.map(event => (
                        <tr
                            key={event.id}
                            onClick={() => {
                                setSelectedEvent(event);
                                setShowDetailsModal(true);
                            }}
                            className="history-row-clickable"
                        >
                            <td className="event-name">{event.name}</td>
                            <td>{event.category || '—'}</td>
                            <td><span className="alert-badge" style={{ background: getAlertColor(event.alertLevel) }}>{event.alertLevel}</span></td>
                            <td>{event.date}</td>
                            <td><span className="status-badge" style={{ background: '#6c757d' }}>Archived</span></td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No typhoon history available.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================
const Dashboard = ({ onLogout, currentUser }) => {
    // ----------------------------- STATE -----------------------------
    const [officesData, setOfficesData] = useState(() => {
        const stored = loadFromStorage('dash_officesData', DEFAULT_OFFICE_DATA);
        const merged = { ...DEFAULT_OFFICE_DATA, ...stored };
        Object.keys(merged).forEach(key => {
            if (!merged[key].damage_details) merged[key].damage_details = [];
            if (!merged[key].equipment_details) merged[key].equipment_details = [];
            if (!merged[key].affected_staff) merged[key].affected_staff = [];
            if (!merged[key].municipalities) merged[key].municipalities = DEFAULT_OFFICE_DATA[key]?.municipalities || [];
        });
        return merged;
    });
    const [events, setEvents] = useState(() => archiveOldEvents(loadFromStorage('dash_events', DEFAULT_EVENTS)));
    const [typhoonHistory, setTyphoonHistory] = useState(() => loadFromStorage(TYPHOON_HISTORY_KEY, []));
    const [users, setUsers] = useState(() => loadFromStorage('dash_users', DEFAULT_USERS));
    const [pendingReports, setPendingReports] = useState(() => loadFromStorage('dash_pendingReports', []));
    const [notifications, setNotifications] = useState(() => loadFromStorage('dash_notifications', []));
    const [liveWeather, setLiveWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState(() => loadFromStorage('dash_activeMenu', 'dashboard'));
    const [selectedOffice, setSelectedOffice] = useState(currentUser?.office || 'PSTO-La Union');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState(null);
    const [newMunicipality, setNewMunicipality] = useState('');
    const [newSignal, setNewSignal] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showOfficeModal, setShowOfficeModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReportReviewModal, setShowReportReviewModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [isEditingReportLink, setIsEditingReportLink] = useState(false);
    const [reportLinkInput, setReportLinkInput] = useState('');
    const [isEditingUser, setIsEditingUser] = useState(false);
    const [userForm, setUserForm] = useState({ id: null, name: '', email: '', office: 'PSTO-La Union', role: 'USER', status: 'Active', password: '', profileImage: '' });
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [imageModalSrc, setImageModalSrc] = useState('');
    const [toast, setToast] = useState({ message: '', type: 'info', visible: false });
    const [rejectReason, setRejectReason] = useState('');
    const [rejectEventId, setRejectEventId] = useState(null);
    const [reportFormData, setReportFormData] = useState(null);
    const [reportNewDamage, setReportNewDamage] = useState({ description: '', cost: '', status: 'Reported' });
    const [reportNewEquipment, setReportNewEquipment] = useState({ name: '', description: '', cost: '', status: 'Reported' });
    const [reportNewStaff, setReportNewStaff] = useState({ name: '', area: '', assistance: '', status: 'Active' });
    const [editingReportDamageIndex, setEditingReportDamageIndex] = useState(null);
    const [editingReportEquipmentIndex, setEditingReportEquipmentIndex] = useState(null);
    const [editingReportStaffIndex, setEditingReportStaffIndex] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reportRejectReason, setReportRejectReason] = useState('');
    const toastTimerRef = useRef(null);
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

    const [settingsData, setSettingsData] = useState({
        systemName: 'DOST Region 1 Disaster Management',
        notificationSound: true,
        autoArchiveDays: 7,
        darkMode: false,
        defaultAlertLevel: 'WHITE'
    });

    const [newDamage, setNewDamage] = useState({ description: '', cost: '', status: 'Reported', image: null });
    const [newEquipment, setNewEquipment] = useState({ name: '', description: '', cost: '', status: 'Reported', image: null });
    const [newStaff, setNewStaff] = useState({ name: '', area: '', assistance: '', status: 'Active' });
    const [editingDamageIndex, setEditingDamageIndex] = useState(null);
    const [editingEquipmentIndex, setEditingEquipmentIndex] = useState(null);
    const [editingStaffIndex, setEditingStaffIndex] = useState(null);

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

    // ======================== REFS ========================
    const mainContentRef = useRef(null);
    const scrollPositionRef = useRef(0);

    const handleScroll = useCallback(() => {
        if (mainContentRef.current) {
            scrollPositionRef.current = mainContentRef.current.scrollTop;
        }
    }, []);

    useEffect(() => {
        if (mainContentRef.current && scrollPositionRef.current > 0) {
            mainContentRef.current.scrollTop = scrollPositionRef.current;
        }
    });

    useEffect(() => {
        scrollPositionRef.current = 0;
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
        }
    }, [activeMenu]);

    const handleSearchChange = useCallback((e) => {
        if (mainContentRef.current) {
            scrollPositionRef.current = mainContentRef.current.scrollTop;
        }
        setSearchTerm(e.target.value);
    }, []);

    const handleUserSearchChange = useCallback((e) => {
        if (mainContentRef.current) {
            scrollPositionRef.current = mainContentRef.current.scrollTop;
        }
        setUserSearchTerm(e.target.value);
    }, []);

    // ======================== MEMOIZED FILTERED EVENTS ========================
    const filteredEvents = useMemo(() => {
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
    }, [events, searchTerm, statusFilter]);

    const filteredUsers = useMemo(() => {
        const term = userSearchTerm.toLowerCase();
        return users.filter(u =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            u.role.toLowerCase().includes(term)
        );
    }, [users, userSearchTerm]);

    // Save active menu to localStorage
    useEffect(() => {
        saveToStorage('dash_activeMenu', activeMenu);
    }, [activeMenu]);

    useEffect(() => {
        const savedSettings = loadFromStorage('dash_settings', settingsData);
        setSettingsData(savedSettings);
    }, []);

    useEffect(() => {
        saveToStorage('dash_settings', settingsData);
    }, [settingsData]);

    const addNotification = (title, message, type = 'info') => {
        const newNotif = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false
        };
        setNotifications(prev => [newNotif, ...prev].slice(0, 50));
        showToast(message, type);
    };

    const resetPSTODataForNewEvent = () => {
        const resetData = {};
        Object.keys(DEFAULT_OFFICE_DATA).forEach(office => {
            resetData[office] = {
                ...DEFAULT_OFFICE_DATA[office],
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
                affected_staff: [],
                imageUrl: officesData[office]?.imageUrl || ''
            };
        });
        setOfficesData(resetData);
        addNotification('PSTO Data Reset', 'All PSTO warning signals and effects have been reset for the new event.', 'success');
    };

    useEffect(() => {
        const getWeather = async () => {
            setWeatherLoading(true);
            const weather = await fetchLiveWeather();
            setLiveWeather(weather);
            setWeatherLoading(false);
        };
        getWeather();
        const interval = setInterval(getWeather, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => { saveToStorage('dash_officesData', officesData); }, [officesData]);
    useEffect(() => { saveToStorage('dash_events', events); }, [events]);
    useEffect(() => { saveToStorage(TYPHOON_HISTORY_KEY, typhoonHistory); }, [typhoonHistory]);
    useEffect(() => { saveToStorage('dash_users', users); }, [users]);
    useEffect(() => { saveToStorage('dash_pendingReports', pendingReports); }, [pendingReports]);
    useEffect(() => { saveToStorage('dash_notifications', notifications); }, [notifications]);

    useEffect(() => {
        const archived = archiveOldEvents(events);
        if (JSON.stringify(archived) !== JSON.stringify(events)) setEvents(archived);
    }, [events]);

    const rawRole = currentUser?.role ?? '';
    const normalizedRole = rawRole.toString().trim().toUpperCase();
    const isSuperAdmin = normalizedRole.includes('SADMIN') || normalizedRole.includes('SUPER ADMIN') || normalizedRole.includes('SUPERADMIN');
    const isAdmin = !isSuperAdmin && (normalizedRole === 'ADMIN' || normalizedRole.includes('ADMIN'));
    const isUser = normalizedRole === 'USER';
    const canManageUsers = isSuperAdmin;
    const canEditEvents = isSuperAdmin || isAdmin;
    const canDeployEvents = isSuperAdmin;
    const canRejectEvents = isSuperAdmin;
    const canApproveReports = isSuperAdmin || isAdmin;

    useEffect(() => {
        if (isUser && currentUser?.office) setSelectedOffice(currentUser.office);
    }, [isUser, currentUser]);

    const allProvinces = ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'];
    const [activeEventId, setActiveEventId] = useState(() => {
        const active = events.find(e => e.deployment === 'Deployed')?.id || null;
        return active;
    });
    const activeEvent = events.find(e => e.id === activeEventId) || events.find(e => e.deployment === 'Deployed');

    const showToast = (message, type = 'info') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ message, type, visible: true });
        toastTimerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
            toastTimerRef.current = null;
        }, 3200);
    };

    const resetToDefaultData = () => {
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
    };

    const exportData = () => {
        const exportObj = { officesData, events, users, pendingReports, notifications, typhoonHistory, settings: settingsData, version: '2.0' };
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
    };

    const importData = (e) => {
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
                showToast('Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const clearAllNotifications = () => {
        setNotifications([]);
        addNotification('Notifications Cleared', 'All notification history has been cleared.', 'info');
    };

    const markNotificationRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const updateUser = (userId, updates) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
        addNotification('User Updated', `User ${updates.name || 'profile'} has been updated.`, 'info');
        showToast('User updated successfully.', 'success');
    };

    // ===== FIXED: Excel Export with proper table formatting =====
    const handleExportExcel = () => {
        const wb = XLSX.utils.book_new();

        // ===== SHEET 1: Main Report with Tables =====
        const reportData = [];

        // Title Section
        reportData.push(['SITUATIONAL REPORT']);
        reportData.push([]);
        reportData.push(['SITUATIONAL REPORT NO.', '2']);
        reportData.push(['TROPICAL CYCLONE:', activeEvent?.name || 'N/A']);
        reportData.push(['CATEGORY:', activeEvent?.category || 'N/A']);
        reportData.push(['DATE:', new Date().toLocaleString()]);
        reportData.push([]);

        // I. SITUATION SUMMARY
        reportData.push(['I. SITUATION SUMMARY']);
        reportData.push([]);
        reportData.push(['A. GENERAL WEATHER CONDITION']);

        // Weather Table Headers
        reportData.push(['PROVINCE', 'TROPICAL CYCLONE WARNING SIGNAL', 'GENERAL WEATHER SITUATION']);

        // Weather Data
        const provinces = ['Ilocos Norte', 'Ilocos Sur', 'La Union', 'Pangasinan'];
        provinces.forEach(prov => {
            const officeKey = Object.keys(officesData).find(key => key.includes(prov));
            const data = officeKey ? officesData[officeKey] : null;
            const signals = data?.warning_signals ?
                Object.entries(data.warning_signals).map(([mun, sig]) => `${mun} (Signal ${sig})`).join('; ') :
                'No signal';
            reportData.push([prov, signals, data?.general_weather || '']);
        });
        reportData.push([]);

        // II. EFFECTS
        reportData.push(['II. EFFECTS']);
        reportData.push([]);

        // A. RELATED INCIDENTS
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

        // B. CASUALTIES
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

        // C. POWER
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

        // D. COMMUNICATION LINES
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

        // E. DAMAGE TO FACILITIES/EQUIPMENT
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

        // F. WORK SUSPENSION
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

        // G. ASSISTANCE PROVIDED
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

        // ===== DAMAGE BUILDING DETAILS TABLE =====
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

        // ===== EQUIPMENT DAMAGE DETAILS TABLE =====
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

        // ===== AFFECTED STAFF DETAILS TABLE =====
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

        // Narrative Summary
        reportData.push(['NARRATIVE SUMMARY']);
        const narrative = Object.values(officesData).map(office => office.remark).filter(Boolean).join(' ') || 'No additional remarks.';
        reportData.push([narrative]);
        reportData.push([]);

        // Prepared by Section
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

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(reportData);

        // ===== Apply column widths =====
        const colWidths = [];
        const maxCols = reportData.reduce((max, row) => Math.max(max, row.length), 0);

        for (let col = 0; col < maxCols; col++) {
            let maxWidth = 15;
            for (let row = 0; row < reportData.length; row++) {
                const cell = reportData[row]?.[col];
                if (cell !== undefined && cell !== null) {
                    const cellStr = String(cell);
                    const width = Math.ceil(cellStr.length * 1.2);
                    if (width > maxWidth) {
                        maxWidth = Math.min(width, 60);
                    }
                }
            }
            colWidths.push({ wch: maxWidth });
        }
        ws['!cols'] = colWidths;

        // ===== Apply table formatting with borders =====
        const range = XLSX.utils.decode_range(ws['!ref']);

        // Find header rows dynamically
        let headerRows = [];
        for (let r = range.s.r; r <= range.e.r; r++) {
            const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
            if (cell && cell.v) {
                const val = String(cell.v);
                if (val.includes('PROVINCE') || val.includes('OFFICE') || val.includes('REMARKS') ||
                    val.includes('INCIDENTS') || val.includes('CASUALTIES') || val.includes('POWER') ||
                    val.includes('COMMUNICATION') || val.includes('DAMAGE') || val.includes('SUSPENSION') ||
                    val.includes('ASSISTANCE') || val.includes('DESCRIPTION') || val.includes('COST') ||
                    val.includes('STATUS') || val.includes('DATE') || val.includes('EQUIPMENT') ||
                    val.includes('STAFF')) {
                    headerRows.push(r);
                }
            }
        }

        // Apply formatting to all cells
        for (let r = range.s.r; r <= range.e.r; r++) {
            for (let c = range.s.c; c <= range.e.c; c++) {
                const address = XLSX.utils.encode_cell({ r, c });
                if (!ws[address]) continue;

                const cellValue = ws[address].v;
                const isTitle = r === 0;
                const isSectionHeader = typeof cellValue === 'string' &&
                    (cellValue.includes('I.') || cellValue.includes('II.') ||
                        cellValue.includes('A.') || cellValue.includes('B.') ||
                        cellValue.includes('C.') || cellValue.includes('D.') ||
                        cellValue.includes('E.') || cellValue.includes('F.') ||
                        cellValue.includes('G.') || cellValue.includes('DAMAGE BUILDING') ||
                        cellValue.includes('EQUIPMENT DAMAGE') || cellValue.includes('AFFECTED STAFF') ||
                        cellValue.includes('NARRATIVE SUMMARY'));

                const isTableHeader = headerRows.includes(r) && c < 7;
                const isPreparedBy = typeof cellValue === 'string' &&
                    (cellValue.includes('Prepared by:') || cellValue.includes('Noted by:') ||
                        cellValue.includes('DOST 1 DRRM') || cellValue.includes('Regional/Provincial') ||
                        cellValue.includes('EDRUSSELL') || cellValue.includes('MICHAEL') ||
                        cellValue.includes('DR. TERESITA'));

                // Determine if cell is in a table body
                let isTableBody = false;
                for (let i = 0; i < headerRows.length; i++) {
                    const headerRow = headerRows[i];
                    const nextHeaderRow = headerRows[i + 1] || range.e.r + 1;
                    if (r > headerRow && r < nextHeaderRow && c < 7) {
                        isTableBody = true;
                        break;
                    }
                }

                // Build cell style
                let style = {
                    font: {
                        bold: isTitle || isSectionHeader || isTableHeader || isPreparedBy,
                        sz: isTitle ? 16 : (isSectionHeader || isTableHeader ? 12 : 10)
                    },
                    alignment: {
                        wrapText: true,
                        vertical: 'center',
                        horizontal: isTableHeader ? 'center' : 'left'
                    },
                    border: {}
                };

                // Add borders for table cells
                if (isTableHeader || isTableBody) {
                    style.border = {
                        top: { style: 'thin', color: { rgb: "000000" } },
                        bottom: { style: 'thin', color: { rgb: "000000" } },
                        left: { style: 'thin', color: { rgb: "000000" } },
                        right: { style: 'thin', color: { rgb: "000000" } }
                    };

                    // Background color for headers
                    if (isTableHeader) {
                        style.fill = { fgColor: { rgb: "1a56db" } };
                        style.font.color = { rgb: "FFFFFF" };
                        style.font.bold = true;
                    }

                    // Alternate row colors for data
                    if (isTableBody && r % 2 === 0) {
                        style.fill = { fgColor: { rgb: "f3f4f6" } };
                    }
                }

                // Special formatting for Prepared by section
                if (isPreparedBy) {
                    style.font.bold = true;
                    style.font.sz = 11;
                }

                ws[address] = {
                    ...ws[address],
                    s: style
                };
            }
        }

        // ===== Merge cells for title =====
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: maxCols - 1 } }, // Main title
        ];

        // Append sheet
        XLSX.utils.book_append_sheet(wb, ws, 'SITREP');

        // ===== SHEET 2: Raw Data with Table Formatting =====
        const rawData = [];
        const headers = [
            'PSTO Office',
            'Warning Signals',
            'General Weather',
            'Related Incidents',
            'Incident Remarks',
            'Casualties',
            'Casualty Remarks',
            'Power Status',
            'Power Remarks',
            'Communication',
            'Comm Remarks',
            'Damage',
            'Damage Remarks',
            'Work Suspension',
            'Work Suspension Remarks',
            'Assistance',
            'Assistance Remarks',
            'Overall Remarks',
            'Building Damage Count',
            'Equipment Damage Count',
            'Affected Staff Count'
        ];
        rawData.push(headers);

        Object.entries(officesData).forEach(([office, data]) => {
            const signals = Object.entries(data.warning_signals || {})
                .map(([mun, sig]) => `${mun}: ${sig}`)
                .join('; ') || 'None';

            rawData.push([
                office,
                signals,
                data.general_weather || '',
                data.related_incidents ?? 0,
                data.remark_related_incidents || '',
                data.casualties ?? 0,
                data.remark_casualties || '',
                data.power_status || '',
                data.remark_power_status || '',
                data.communication_lines || '',
                data.remark_communication_lines || '',
                data.damage_facilities || '',
                data.remark_damage_facilities || '',
                data.work_suspension ? 'Yes' : 'No',
                data.remark_work_suspension || '',
                data.assistance_provided || '',
                data.remark_assistance_provided || '',
                data.remark || '',
                (data.damage_details || []).length,
                (data.equipment_details || []).length,
                (data.affected_staff || []).length
            ]);
        });

        const wsRaw = XLSX.utils.aoa_to_sheet(rawData);

        // Auto-fit columns for raw data
        const rawColWidths = [];
        for (let col = 0; col < rawData[0].length; col++) {
            let maxWidth = 15;
            for (let row = 0; row < rawData.length; row++) {
                const cell = rawData[row]?.[col];
                if (cell !== undefined && cell !== null) {
                    const cellStr = String(cell);
                    const width = Math.ceil(cellStr.length * 1.2);
                    if (width > maxWidth) {
                        maxWidth = Math.min(width, 40);
                    }
                }
            }
            rawColWidths.push({ wch: maxWidth });
        }
        wsRaw['!cols'] = rawColWidths;

        // Format raw data table with borders
        const rawRange = XLSX.utils.decode_range(wsRaw['!ref']);
        for (let r = rawRange.s.r; r <= rawRange.e.r; r++) {
            for (let c = rawRange.s.c; c <= rawRange.e.c; c++) {
                const address = XLSX.utils.encode_cell({ r, c });
                if (!wsRaw[address]) continue;

                const isHeader = r === 0;

                let style = {
                    font: { bold: isHeader, sz: isHeader ? 11 : 10 },
                    alignment: {
                        wrapText: true,
                        vertical: 'center',
                        horizontal: isHeader ? 'center' : 'left'
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: "000000" } },
                        bottom: { style: 'thin', color: { rgb: "000000" } },
                        left: { style: 'thin', color: { rgb: "000000" } },
                        right: { style: 'thin', color: { rgb: "000000" } }
                    }
                };

                if (isHeader) {
                    style.fill = { fgColor: { rgb: "1a56db" } };
                    style.font.color = { rgb: "FFFFFF" };
                    style.font.bold = true;
                } else if (r % 2 === 0) {
                    style.fill = { fgColor: { rgb: "f3f4f6" } };
                }

                wsRaw[address] = {
                    ...wsRaw[address],
                    s: style
                };
            }
        }

        XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw Data');

        // Generate file
        XLSX.writeFile(wb, `SITREP_${activeEvent?.name || 'NO_EVENT'}_${new Date().toISOString().slice(0, 19)}.xlsx`);
        showToast('Situational Report exported successfully.', 'success');
        addNotification('Excel Exported', 'Complete SITREP exported with table formatting.', 'success');
    };

    // ===== Reject Event Handler =====
    const handleRejectEvent = (eventId, reason) => {
        if (!reason || !reason.trim()) {
            showToast('Please provide a rejection reason.', 'warning');
            return;
        }

        const updatedEvents = events.map(event => {
            if (event.id === eventId) {
                return {
                    ...event,
                    status: 'rejected',
                    rejectionReason: reason,
                    deployment: 'Draft'
                };
            }
            return event;
        });

        setEvents(updatedEvents);

        if (selectedEvent?.id === eventId) {
            setSelectedEvent({
                ...selectedEvent,
                status: 'rejected',
                rejectionReason: reason,
                deployment: 'Draft'
            });
        }

        setShowDetailsModal(false);

        const eventName = events.find(e => e.id === eventId)?.name;
        addNotification(
            'Event Rejected',
            `Event "${eventName}" has been rejected. Reason: ${reason}`,
            'error'
        );
        showToast(`Event "${eventName}" rejected.`, 'error');

        try {
            saveToStorage('dash_events', updatedEvents);
        } catch (error) {
            console.error('Failed to sync rejection:', error);
            showToast('Failed to sync rejection to database.', 'error');
        }
    };

    // ===== Reject Report Handler =====
    const handleRejectReport = (reportId, reason) => {
        if (!reason || !reason.trim()) {
            showToast('Please provide a rejection reason.', 'warning');
            return;
        }

        setPendingReports(prev => prev.map(r =>
            r.id === reportId
                ? { ...r, status: 'rejected', remarks: reason }
                : r
        ));

        const report = pendingReports.find(r => r.id === reportId);
        addNotification(
            'Report Rejected',
            `Report from ${report?.office || 'Unknown office'} was rejected. Reason: ${reason}`,
            'error'
        );
        showToast('Report rejected.', 'error');

        try {
            const updatedReports = pendingReports.map(r =>
                r.id === reportId
                    ? { ...r, status: 'rejected', remarks: reason }
                    : r
            );
            saveToStorage('dash_pendingReports', updatedReports);
        } catch (error) {
            console.error('Failed to sync rejection:', error);
        }
    };

    // ----------------------------- REPORT FUNCTIONS -----------------------------
    const openReportModal = () => {
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
            imageUrl: currentData.imageUrl || ''
        });
        setShowReportModal(true);
    };

    const handleReportFieldChange = (field, value) => {
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
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleReportAddDamage = () => {
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
            return {
                ...prev,
                damage_details: [...(prev.damage_details || []), damage]
            };
        });
        setReportNewDamage({ description: '', cost: '', status: 'Reported' });
        showToast('Damage added.', 'success');
    };

    const handleReportEditDamage = (index) => {
        if (!reportFormData) return;
        const damage = reportFormData.damage_details?.[index];
        if (damage) {
            setReportNewDamage({ ...damage });
            setEditingReportDamageIndex(index);
        }
    };

    const handleReportUpdateDamage = () => {
        if (editingReportDamageIndex === null || !reportFormData) return;
        const updated = [...(reportFormData.damage_details || [])];
        const existing = updated[editingReportDamageIndex];
        if (!existing) return;
        updated[editingReportDamageIndex] = {
            ...reportNewDamage,
            id: existing.id,
            date: existing.date,
            reportedBy: existing.reportedBy
        };
        setReportFormData(prev => ({ ...prev, damage_details: updated }));
        setReportNewDamage({ description: '', cost: '', status: 'Reported' });
        setEditingReportDamageIndex(null);
        showToast('Damage updated.', 'success');
    };

    const handleReportDeleteDamage = (index) => {
        if (!window.confirm('Delete this damage record?')) return;
        if (!reportFormData) return;
        const updated = (reportFormData.damage_details || []).filter((_, i) => i !== index);
        setReportFormData(prev => ({ ...prev, damage_details: updated }));
        showToast('Damage deleted.', 'info');
    };

    const handleReportAddEquipment = () => {
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
            return {
                ...prev,
                equipment_details: [...(prev.equipment_details || []), equipment]
            };
        });
        setReportNewEquipment({ name: '', description: '', cost: '', status: 'Reported' });
        showToast('Equipment added.', 'success');
    };

    const handleReportEditEquipment = (index) => {
        if (!reportFormData) return;
        const equipment = reportFormData.equipment_details?.[index];
        if (equipment) {
            setReportNewEquipment({ ...equipment });
            setEditingReportEquipmentIndex(index);
        }
    };

    const handleReportUpdateEquipment = () => {
        if (editingReportEquipmentIndex === null || !reportFormData) return;
        const updated = [...(reportFormData.equipment_details || [])];
        const existing = updated[editingReportEquipmentIndex];
        if (!existing) return;
        updated[editingReportEquipmentIndex] = {
            ...reportNewEquipment,
            id: existing.id,
            date: existing.date,
            reportedBy: existing.reportedBy
        };
        setReportFormData(prev => ({ ...prev, equipment_details: updated }));
        setReportNewEquipment({ name: '', description: '', cost: '', status: 'Reported' });
        setEditingReportEquipmentIndex(null);
        showToast('Equipment updated.', 'success');
    };

    const handleReportDeleteEquipment = (index) => {
        if (!window.confirm('Delete this equipment record?')) return;
        if (!reportFormData) return;
        const updated = (reportFormData.equipment_details || []).filter((_, i) => i !== index);
        setReportFormData(prev => ({ ...prev, equipment_details: updated }));
        showToast('Equipment deleted.', 'info');
    };

    const handleReportAddStaff = () => {
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
            return {
                ...prev,
                affected_staff: [...(prev.affected_staff || []), staff]
            };
        });
        setReportNewStaff({ name: '', area: '', assistance: '', status: 'Active' });
        showToast('Staff added.', 'success');
    };

    const handleReportEditStaff = (index) => {
        if (!reportFormData) return;
        const staff = reportFormData.affected_staff?.[index];
        if (staff) {
            setReportNewStaff({ ...staff });
            setEditingReportStaffIndex(index);
        }
    };

    const handleReportUpdateStaff = () => {
        if (editingReportStaffIndex === null || !reportFormData) return;
        const updated = [...(reportFormData.affected_staff || [])];
        const existing = updated[editingReportStaffIndex];
        if (!existing) return;
        updated[editingReportStaffIndex] = {
            ...reportNewStaff,
            id: existing.id,
            dateAdded: existing.dateAdded
        };
        setReportFormData(prev => ({ ...prev, affected_staff: updated }));
        setReportNewStaff({ name: '', area: '', assistance: '', status: 'Active' });
        setEditingReportStaffIndex(null);
        showToast('Staff updated.', 'success');
    };

    const handleReportDeleteStaff = (index) => {
        if (!window.confirm('Delete this staff record?')) return;
        if (!reportFormData) return;
        const updated = (reportFormData.affected_staff || []).filter((_, i) => i !== index);
        setReportFormData(prev => ({ ...prev, affected_staff: updated }));
        showToast('Staff deleted.', 'info');
    };

    const handleReportSignalChange = (mun, signal) => {
        setReportFormData(prev => {
            if (!prev) {
                return {
                    warning_signals: { [mun]: parseInt(signal) },
                    municipalities: [],
                    damage_details: [],
                    equipment_details: [],
                    affected_staff: []
                };
            }
            return {
                ...prev,
                warning_signals: { ...(prev.warning_signals || {}), [mun]: parseInt(signal) }
            };
        });
    };

    const handleReportAddMunicipality = () => {
        setReportFormData(prev => {
            if (!prev) {
                if (newMunicipality.trim()) {
                    return {
                        warning_signals: { [newMunicipality]: newSignal },
                        municipalities: [newMunicipality],
                        damage_details: [],
                        equipment_details: [],
                        affected_staff: []
                    };
                }
                return null;
            }
            if (newMunicipality.trim() && !(prev.municipalities || []).includes(newMunicipality)) {
                return {
                    ...prev,
                    municipalities: [...(prev.municipalities || []), newMunicipality],
                    warning_signals: { ...(prev.warning_signals || {}), [newMunicipality]: newSignal },
                };
            }
            return prev;
        });
        setNewMunicipality('');
        setNewSignal(1);
    };

    const handleReportRemoveMunicipality = (mun) => {
        setReportFormData(prev => {
            if (!prev) return null;
            const updatedMuns = (prev.municipalities || []).filter(m => m !== mun);
            const updatedSignals = { ...(prev.warning_signals || {}) };
            delete updatedSignals[mun];
            return { ...prev, municipalities: updatedMuns, warning_signals: updatedSignals };
        });
    };

    const submitReport = () => {
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
        setShowReportModal(false);
        setReportFormData(null);

        addNotification(
            'Report Submitted',
            `${selectedOffice} has submitted a new report for approval.`,
            'info'
        );
        showToast('Report submitted for approval.', 'success');
    };

    const approveReport = (reportId) => {
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
                affected_staff: [...(report.data.affected_staff || prev[report.office]?.affected_staff || [])]
            }
        }));

        setPendingReports(prev => prev.map(r =>
            r.id === reportId ? { ...r, status: 'approved' } : r
        ));

        addNotification(
            'Report Approved',
            `Report from ${report.office} was approved and applied.`,
            'success'
        );
        showToast(`Report for ${report.office} approved and applied.`, 'success');
    };

    const openRejectReportModal = (report) => {
        setSelectedReport(report);
        setReportRejectReason('');
        setShowReportReviewModal(true);
    };

    const rejectReport = () => {
        if (!reportRejectReason.trim()) {
            showToast('Please provide a rejection reason.', 'warning');
            return;
        }
        setPendingReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, status: 'rejected', remarks: reportRejectReason } : r));
        addNotification('Report Rejected', `Report from ${selectedReport.office} was rejected. Reason: ${reportRejectReason}`, 'error');
        setShowReportReviewModal(false);
        setSelectedReport(null);
        setReportRejectReason('');
        showToast('Report rejected.', 'error');
    };

    // ----------------------------- DAMAGE DETAILS MANAGEMENT (Edit Mode) -----------------------------
    const handleAddDamage = () => {
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
        setNewDamage({ description: '', cost: '', status: 'Reported', image: null });
        showToast('Damage added successfully.', 'success');
    };

    const handleEditDamage = (index) => {
        const damage = formData.damage_details[index];
        setNewDamage({
            description: damage.description || '',
            cost: damage.cost || '',
            status: damage.status || 'Reported',
            image: damage.image || null
        });
        setEditingDamageIndex(index);
    };

    const handleUpdateDamage = () => {
        if (editingDamageIndex === null) return;
        const updatedDetails = [...formData.damage_details];
        updatedDetails[editingDamageIndex] = {
            ...newDamage,
            id: updatedDetails[editingDamageIndex].id,
            date: updatedDetails[editingDamageIndex].date,
            reportedBy: updatedDetails[editingDamageIndex].reportedBy
        };
        setFormData(prev => ({ ...prev, damage_details: updatedDetails }));
        setNewDamage({ description: '', cost: '', status: 'Reported', image: null });
        setEditingDamageIndex(null);
        showToast('Damage updated successfully.', 'success');
    };

    const handleDeleteDamage = (index) => {
        if (!window.confirm('Delete this damage record?')) return;
        const updatedDetails = formData.damage_details.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, damage_details: updatedDetails }));
        showToast('Damage deleted.', 'error');
    };

    // ----------------------------- EQUIPMENT MANAGEMENT (Edit Mode) -----------------------------
    const handleAddEquipment = () => {
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
        setNewEquipment({ name: '', description: '', cost: '', status: 'Reported', image: null });
        showToast('Equipment added successfully.', 'success');
    };

    const handleEditEquipment = (index) => {
        const equip = formData.equipment_details[index];
        setNewEquipment({
            name: equip.name || '',
            description: equip.description || '',
            cost: equip.cost || '',
            status: equip.status || 'Reported',
            image: equip.image || null
        });
        setEditingEquipmentIndex(index);
    };

    const handleUpdateEquipment = () => {
        if (editingEquipmentIndex === null) return;
        const updated = [...formData.equipment_details];
        updated[editingEquipmentIndex] = {
            ...newEquipment,
            id: updated[editingEquipmentIndex].id,
            date: updated[editingEquipmentIndex].date,
            reportedBy: updated[editingEquipmentIndex].reportedBy
        };
        setFormData(prev => ({ ...prev, equipment_details: updated }));
        setNewEquipment({ name: '', description: '', cost: '', status: 'Reported', image: null });
        setEditingEquipmentIndex(null);
        showToast('Equipment updated successfully.', 'success');
    };

    const handleDeleteEquipment = (index) => {
        if (!window.confirm('Delete this equipment record?')) return;
        const updated = formData.equipment_details.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, equipment_details: updated }));
        showToast('Equipment deleted.', 'error');
    };

    // ----------------------------- AFFECTED STAFF MANAGEMENT (Edit Mode) -----------------------------
    const handleAddStaff = () => {
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
        setNewStaff({ name: '', area: '', assistance: '', status: 'Active' });
        showToast('Staff added successfully.', 'success');
    };

    const handleEditStaff = (index) => {
        const staff = formData.affected_staff[index];
        setNewStaff({
            name: staff.name || '',
            area: staff.area || '',
            assistance: staff.assistance || '',
            status: staff.status || 'Active'
        });
        setEditingStaffIndex(index);
    };

    const handleUpdateStaff = () => {
        if (editingStaffIndex === null) return;
        const updatedStaff = [...formData.affected_staff];
        updatedStaff[editingStaffIndex] = {
            ...newStaff,
            id: updatedStaff[editingStaffIndex].id,
            dateAdded: updatedStaff[editingStaffIndex].dateAdded
        };
        setFormData(prev => ({ ...prev, affected_staff: updatedStaff }));
        setNewStaff({ name: '', area: '', assistance: '', status: 'Active' });
        setEditingStaffIndex(null);
        showToast('Staff updated successfully.', 'success');
    };

    const handleDeleteStaff = (index) => {
        if (!window.confirm('Delete this staff record?')) return;
        const updatedStaff = formData.affected_staff.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, affected_staff: updatedStaff }));
        showToast('Staff deleted.', 'error');
    };

    const handleOfficeImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageData = reader.result;
                setFormData(prev => ({ ...prev, imageUrl: imageData }));
                setOfficesData(prev => ({
                    ...prev,
                    [selectedOffice]: { ...prev[selectedOffice], imageUrl: imageData }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveOfficeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        setOfficesData(prev => ({
            ...prev,
            [selectedOffice]: { ...prev[selectedOffice], imageUrl: '' }
        }));
    };

    const handleSave = () => {
        if (selectedOffice === 'PSTO-Region-1') {
            showToast('Cannot save Region 1 data directly. Select a specific PSTO office.', 'warning');
            return;
        }

        const updatedData = {
            ...formData,
            damage_details: formData.damage_details || [],
            equipment_details: formData.equipment_details || [],
            affected_staff: formData.affected_staff || [],
            imageUrl: formData.imageUrl || currentOfficeData.imageUrl || ''
        };

        setOfficesData(prev => ({
            ...prev,
            [selectedOffice]: updatedData
        }));

        setEditMode(false);
        addNotification('PSTO Data Saved', `${selectedOffice} data was manually edited.`, 'info');
        showToast('PSTO data saved.', 'success');
    };

    // ----------------------------- EVENT MANAGEMENT -----------------------------
    const handleApproveEvent = (eventId) => {
        const event = events.find(e => e.id === eventId);
        setEvents(events.map(e => e.id === eventId ? { ...e, status: 'approved', rejectionReason: '' } : e));
        if (selectedEvent?.id === eventId) setSelectedEvent(prev => prev ? { ...prev, status: 'approved', rejectionReason: '' } : prev);
        addNotification('Event Approved', `Event ${event?.name} has been approved.`, 'success');
        showToast('Event approved and ready for deployment.', 'success');
    };

    const openRejectModal = (eventId) => {
        setRejectEventId(eventId);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const confirmRejectEvent = () => {
        if (!rejectReason.trim()) { showToast('Please provide a rejection reason.', 'warning'); return; }
        const eventName = events.find(e => e.id === rejectEventId)?.name;
        setEvents(events.map(e => e.id === rejectEventId ? { ...e, status: 'rejected', rejectionReason: rejectReason, deployment: 'Draft' } : e));
        if (selectedEvent?.id === rejectEventId) setSelectedEvent(prev => prev ? { ...prev, status: 'rejected', rejectionReason: rejectReason } : prev);
        addNotification('Event Rejected', `Event ${eventName} was rejected. Reason: ${rejectReason}`, 'error');
        setShowRejectModal(false);
        setRejectEventId(null);
        setRejectReason('');
        showToast('Event rejected.', 'error');
    };

    const handleDeployEvent = (eventId) => {
        if (!canDeployEvents) { showToast('Only super admins can deploy events.', 'warning'); return; }
        const eventToDeploy = events.find(e => e.id === eventId);
        if (!eventToDeploy) return;
        if (eventToDeploy.status !== 'approved') { showToast('Only approved events can be deployed.', 'warning'); return; }
        if (!window.confirm('Deploy this event? It will become the active event.')) return;
        setEvents(events.map(e => ({
            ...e,
            deployment: e.id === eventId ? 'Deployed' : (e.deployment === 'Deployed' ? 'Draft' : e.deployment),
            status: e.id === eventId ? 'active' : (e.status === 'active' ? 'draft' : e.status)
        })));
        setActiveEventId(eventId);

        addNotification('Event Deployed', `Event ${eventToDeploy.name} is now the active typhoon.`, 'success');
        showToast('Event deployed.', 'success');
    };

    const handleAddEvent = () => {
        if (!canEditEvents && !isEditingEvent) { showToast('Only admins can add/edit events.', 'warning'); return; }
        if (!newEvent.name.trim()) { showToast('Event name is required.', 'warning'); return; }

        if (isEditingEvent && newEvent.id) {
            const formattedDate = newEvent.startDateTime ? new Date(newEvent.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (newEvent.date || new Date().toLocaleDateString());
            const provinces = newEvent.sendToAllUsers ? allProvinces : newEvent.provinces;
            setEvents(events.map(e => e.id === newEvent.id ? ({ ...e, ...newEvent, provinces, date: formattedDate, type: e.type || 'Tropical Cyclone' }) : e));
            if (newEvent.deployment === 'Deployed') setActiveEventId(newEvent.id);
            addNotification('Event Edited', `Event ${newEvent.name} has been updated.`, 'info');
            showToast('Event edited successfully.', 'success');
            setIsEditingEvent(false);
            resetNewEventForm();
            setShowAddModal(false);
            return;
        }

        const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
        const formattedDate = newEvent.startDateTime ? new Date(newEvent.startDateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString();
        const newStatus = newEvent.deployment === 'Deployed' ? 'active' : 'pending';
        const provinces = newEvent.sendToAllUsers ? allProvinces : (newEvent.provinces.length > 0 ? newEvent.provinces : allProvinces);

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

        setEvents([newEventObj, ...events]);

        if (newEvent.deployment === 'Deployed') {
            setActiveEventId(newId);
        }

        resetPSTODataForNewEvent();
        addNotification('Event Created', `New event "${newEvent.name}" has been created. PSTO data has been reset.`, 'success');
        resetNewEventForm();
        setShowAddModal(false);
        showToast('Event created and PSTO data reset.', 'success');
    };

    const resetNewEventForm = () => {
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
    };

    const handleNewEventFieldChange = (field, value) => {
        setNewEvent(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditFormFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditEvent = (event) => {
        setNewEvent({
            id: event.id,
            name: event.name || '',
            startDateTime: event.startDateTime || '',
            endDateTime: event.endDateTime || '',
            alertLevel: event.alertLevel || '',
            category: event.category || event.type || '',
            deployment: event.deployment || 'Draft',
            provinces: event.provinces ? [...event.provinces] : [],
            sendToAllUsers: event.provinces?.length === allProvinces.length,
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
        setShowAddModal(true);
        setShowDetailsModal(false);
    };

    const handleDeleteEvent = (eventId) => {
        if (!window.confirm('Delete this event? This action cannot be undone.')) return;
        const eventName = events.find(e => e.id === eventId)?.name;
        setEvents(events.filter(e => e.id !== eventId));
        if (activeEventId === eventId) setActiveEventId(null);
        setShowDetailsModal(false);
        addNotification('Event Deleted', `Event ${eventName} has been permanently deleted.`, 'error');
        showToast('Event deleted.', 'error');
    };

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
    const validatePassword = (pwd) => pwd.length >= 6;

    const handleSaveUser = () => {
        if (!userForm.name || !userForm.email || (!userForm.password && !isEditingUser)) { showToast('Name, email, and password are required.', 'warning'); return; }
        if (!validateEmail(userForm.email)) { showToast('Invalid email format.', 'warning'); return; }
        if (!isEditingUser && !validatePassword(userForm.password)) { showToast('Password must be at least 6 characters.', 'warning'); return; }
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
        setShowUserModal(false);
        setIsEditingUser(false);
        setUserForm({ id: null, name: '', email: '', office: selectedOffice || 'PSTO-La Union', role: 'USER', status: 'Active', password: '', profileImage: '' });
    };

    const handleDeleteUser = (userId) => {
        if (!window.confirm('Delete this user? This action cannot be undone.')) return;
        const userName = users.find(u => u.id === userId)?.name;
        setUsers(users.filter(u => u.id !== userId));
        addNotification('User Deleted', `User ${userName} has been deleted.`, 'error');
        showToast('User deleted.', 'error');
    };

    // ----------------------------- REPORT GENERATION -----------------------------
    const buildReportHtml = () => {
        const generatedAt = new Date().toLocaleString();
        const reportOffices = Object.entries(officesData);

        const summaryRows = reportOffices.map(([officeName, officeData]) => {
            const warningTags = Object.entries(officeData.warning_signals || {}).map(([mun, signal]) => `${mun} (Signal ${signal})`).join('; ') || 'None';
            return `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${warningTags}</td><td style="border:1px solid #000;padding:8px;">${officeData.general_weather || 'N/A'}</td></tr>`;
        }).join('');

        const incidentsRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.related_incidents ?? 0}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_related_incidents || '-'}</td></tr>`).join('');
        const casualtiesRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.casualties ?? 0}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_casualties || '-'}</td></tr>`).join('');
        const powerRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.power_status || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_power_status || '-'}</td></tr>`).join('');
        const commsRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.communication_lines || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_communication_lines || '-'}</td></tr>`).join('');
        const damageRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.damage_facilities || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_damage_facilities || '-'}</td></tr>`).join('');
        const workRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.work_suspension ? 'Suspended' : 'No suspension'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_work_suspension || '-'}</td></tr>`).join('');
        const assistRows = reportOffices.map(([officeName, officeData]) => `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${officeData.assistance_provided || '—'}</td><td style="border:1px solid #000;padding:8px;">${officeData.remark_assistance_provided || '-'}</td></td>`).join('');

        const damageDetailsRows = reportOffices.map(([officeName, officeData]) => {
            const buildingDamages = (officeData.damage_details || []).map(d =>
                `<div>${d.description || ''}${d.cost ? ` - ₱${d.cost}` : ''}${d.status ? ` (${d.status})` : ''}${d.image ? ` <img src="${d.image}" style="max-width:50px;max-height:50px;" />` : ''}</div>`
            ).join('');
            const equipmentDamages = (officeData.equipment_details || []).map(e =>
                `<div>${e.name || ''}${e.description ? ` - ${e.description}` : ''}${e.cost ? ` - ₱${e.cost}` : ''}${e.status ? ` (${e.status})` : ''}${e.image ? ` <img src="${e.image}" style="max-width:50px;max-height:50px;" />` : ''}</div>`
            ).join('');
            const damages = (buildingDamages + equipmentDamages) || 'No damage details';
            return `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${damages}</td></tr>`;
        }).join('');

        const staffRows = reportOffices.map(([officeName, officeData]) => {
            const staff = (officeData.affected_staff || []).map(s =>
                `<div>${s.name || ''}${s.area ? ` - ${s.area}` : ''}${s.status ? ` (${s.status})` : ''}${s.assistance ? ` - Assistance: ${s.assistance}` : ''}</div>`
            ).join('') || 'No staff affected';
            return `<tr><td style="border:1px solid #000;padding:8px;">${officeName}</td><td style="border:1px solid #000;padding:8px;">${staff}</td></tr>`;
        }).join('');

        const footerNarrative = Object.values(officesData).map(office => office.remark).filter(Boolean).join(' ') || 'No additional remarks.';

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
          .damage-image { max-width: 50px; max-height: 50px; }
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
          <tbody>${incidentsRows}</tbody>
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
          <tbody>${casualtiesRows}</tbody>
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
          <tbody>${powerRows}</tbody>
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
          <tbody>${commsRows}</tbody>
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
          <tbody>${damageRows}</tbody>
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
          <tbody>${workRows}</tbody>
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
          <tbody>${assistRows}</tbody>
        </table>

        <h3>III. DAMAGE BUILDING</h3>
        <table>
          <thead>
            <tr>
              <th>OFFICE</th>
              <th>DAMAGE RECORDS</th>
            </tr>
          </thead>
          <tbody>${damageDetailsRows}</tbody>
        </table>

        <h3>IV. AFFECTED STAFF</h3>
        <table>
          <thead>
            <tr>
              <th>OFFICE</th>
              <th>STAFF</th>
            </tr>
          </thead>
          <tbody>${staffRows}</tbody>
        </table>
        
        <p><strong>Narrative Summary:</strong> ${footerNarrative}</p>
        <p class="footer">Prepared by: DOST 1 DRRM Unit</p>
      </body>
      </html>
    `;
    };

    const handleGenerateReport = () => {
        const reportHtml = buildReportHtml();
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showToast('Pop-up blocked. Allow pop-ups to generate the report.', 'warning');
            return;
        }
        printWindow.document.write(reportHtml);
        printWindow.document.close();
    };

    const handleDownloadDoc = () => {
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
    };

    const regionSummary = {
        offices: Object.keys(officesData).length,
        incidents: Object.values(officesData).reduce((sum, office) => sum + (office.related_incidents || 0), 0),
        casualties: Object.values(officesData).reduce((sum, office) => sum + (office.casualties || 0), 0),
        suspensions: Object.values(officesData).filter(office => office.work_suspension).length,
        damageDetails: Object.values(officesData).reduce((sum, office) => sum + ((office.damage_details && office.damage_details.length) || 0), 0),
        affectedStaff: Object.values(officesData).reduce((sum, office) => sum + ((office.affected_staff && office.affected_staff.length) || 0), 0),
    };

    const currentOfficeData = selectedOffice === 'PSTO-Region-1' ? {
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
        affected_staff: []
    } : (officesData[selectedOffice] || {
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
        affected_staff: []
    });

    const displayWeather = liveWeather ? `${liveWeather.condition}, ${liveWeather.temp}°C, Wind ${liveWeather.windSpeed} km/h` : (weatherLoading ? 'Loading live weather...' : currentOfficeData.general_weather);
    const displayEvent = editMode ? formData : currentOfficeData;
    const municipalitiesList = displayEvent?.municipalities || [];

    const officeStatusRemarks = [
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

    const handleOfficeClick = (officeName) => {
        setSelectedOffice(officeName);
        setEditMode(false);
        setShowOfficeModal(true);
    };

    const handleCloseOfficeModal = () => {
        setShowOfficeModal(false);
    };

    const handleEditToggle = () => {
        if (selectedOffice === 'PSTO-Region-1') {
            showToast('Cannot edit Region 1 summary. Select a specific PSTO office.', 'warning');
            return;
        }
        if (!editMode) {
            setFormData(deepClone({
                ...currentOfficeData,
                municipalities: [...(currentOfficeData.municipalities || [])],
                damage_details: [...(currentOfficeData.damage_details || [])],
                equipment_details: [...(currentOfficeData.equipment_details || [])],
                affected_staff: [...(currentOfficeData.affected_staff || [])],
                imageUrl: currentOfficeData.imageUrl || ''
            }));
        }
        setEditMode(!editMode);
    };

    const handleSignalChange = (municipality, value) => {
        setFormData(prev => ({
            ...prev,
            warning_signals: { ...prev.warning_signals, [municipality]: parseInt(value) }
        }));
    };

    const handleAddMunicipality = () => {
        if (newMunicipality.trim() && !formData.municipalities.includes(newMunicipality)) {
            setFormData({
                ...formData,
                municipalities: [...formData.municipalities, newMunicipality],
                warning_signals: { ...formData.warning_signals, [newMunicipality]: newSignal }
            });
            setNewMunicipality('');
            setNewSignal(1);
        }
    };

    const handleRemoveMunicipality = (municipality) => {
        const updatedMunicipalities = formData.municipalities.filter(m => m !== municipality);
        const updatedSignals = { ...formData.warning_signals };
        delete updatedSignals[municipality];
        setFormData({ ...formData, municipalities: updatedMunicipalities, warning_signals: updatedSignals });
    };

    const handleOpenAddModal = () => {
        if (!canEditEvents) return;
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setIsEditingEvent(false);
    };

    const handleViewEvent = (event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedEvent(null);
    };

    const handleSaveReportLink = () => {
        const updatedEvents = events.map(event => event.id === selectedEvent.id ? { ...event, reportLink: reportLinkInput } : event);
        setEvents(updatedEvents);
        setSelectedEvent({ ...selectedEvent, reportLink: reportLinkInput });
        setIsEditingReportLink(false);
        setReportLinkInput('');
    };

    const openImageModal = (src) => {
        setImageModalSrc(src);
        setShowImageModal(true);
    };

    const closeImageModal = () => {
        setShowImageModal(false);
        setImageModalSrc('');
    };

    const getAlertColor = (level) => ({ RED: '#dc3545', BLUE: '#007bff', WHITE: '#6c757d' }[level] || '#28a745');

    const getStatusColor = (status) => ({
        active: '#28a745',
        approved: '#0d6efd',
        pending: '#ffc107',
        draft: '#6c757d',
        rejected: '#dc3545',
        archived: '#adb5bd'
    }[status] || '#6c757d');

    const getEventStatusLabel = (event) => {
        if (event.deployment === 'Deployed') return 'Active';
        if (event.status === 'pending') return 'Pending Approval';
        if (event.status === 'approved') return 'Approved';
        if (event.status === 'rejected') return 'Rejected';
        if (event.status === 'archived') return 'Archived';
        return event.deployment || 'Draft';
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // ======================== DASHBOARD CONTENT ========================
    const renderDashboardContent = () => (
        <div>
            <ToastBanner toast={toast} setToast={setToast} />

            <NotificationWidget
                unreadCount={unreadCount}
                showNotificationsDropdown={showNotificationsDropdown}
                setShowNotificationsDropdown={setShowNotificationsDropdown}
                notifications={notifications}
                clearAllNotifications={clearAllNotifications}
                markNotificationRead={markNotificationRead}
            />

            <TopInfoBar activeEvent={activeEvent} displayWeather={displayWeather} />

            <InfoBar
                displayWeather={displayWeather}
                activeEvent={activeEvent}
                typhoonHistory={typhoonHistory}
            />

            <NotificationBanner
                activeEvent={activeEvent}
                handleGenerateReport={handleGenerateReport}
                handleDownloadDoc={handleDownloadDoc}
                handleExportExcel={handleExportExcel}
            />

            <PSTOSelector
                isUser={isUser}
                currentUser={currentUser}
                officesData={officesData}
                selectedOffice={selectedOffice}
                regionSummary={regionSummary}
                handleOfficeClick={handleOfficeClick}
            />

            <EditControlsBar
                selectedOffice={selectedOffice}
                isUser={isUser}
                editMode={editMode}
                handleEditToggle={handleEditToggle}
                openReportModal={openReportModal}
                handleSave={handleSave}
            />

            <div className="main-grid">
                <div className="card warning-card">
                    <div className="warning-card-header"><h3 className="warning-header"><span className="warning-icon">⚠️</span> TROPICAL CYCLONE WARNING SIGNAL</h3></div>
                    <div className="warning-card-body">
                        {editMode ? (
                            <div className="improved-edit-form">
                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('warningSignals')}><h4>📡 Warning Signals</h4><span>{expandedSections.warningSignals ? '▼' : '►'}</span></div>
                                    {expandedSections.warningSignals && (
                                        <div className="edit-section-content">
                                            {municipalitiesList.map(mun => (
                                                <div key={mun} className="signal-edit-row">
                                                    <span className="municipality-name">{mun}</span>
                                                    <select value={displayEvent.warning_signals?.[mun] || 0} onChange={(e) => handleSignalChange(mun, e.target.value)}>
                                                        <option value={0}>No Signal</option><option value={1}>Signal #1</option><option value={2}>Signal #2</option>
                                                        <option value={3}>Signal #3</option><option value={4}>Signal #4</option><option value={5}>Signal #5</option>
                                                    </select>
                                                    <button className="remove-mun-btn" onClick={() => handleRemoveMunicipality(mun)}>🗑️</button>
                                                </div>
                                            ))}
                                            <div className="add-municipality-row">
                                                <input type="text" placeholder="New municipality" value={newMunicipality} onChange={(e) => setNewMunicipality(e.target.value)} />
                                                <select value={newSignal} onChange={(e) => setNewSignal(parseInt(e.target.value))}>
                                                    <option value={1}>Signal #1</option><option value={2}>Signal #2</option>
                                                    <option value={3}>Signal #3</option><option value={4}>Signal #4</option><option value={5}>Signal #5</option>
                                                </select>
                                                <button className="add-mun-btn" onClick={handleAddMunicipality}>+ Add</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('generalWeather')}><h4>🌤️ General Weather</h4><span>{expandedSections.generalWeather ? '▼' : '►'}</span></div>
                                    {expandedSections.generalWeather && (
                                        <div className="edit-section-content">
                                            <div className="form-group">
                                                <label>General Weather Situation</label>
                                                <input type="text" name="general_weather" value={displayEvent.general_weather || ''} onChange={(e) => handleEditFormFieldChange('general_weather', e.target.value)} placeholder="e.g., Heavy Rain, Strong Winds" />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('effects')}><h4>📊 Effects</h4><span>{expandedSections.effects ? '▼' : '►'}</span></div>
                                    {expandedSections.effects && (
                                        <div className="edit-section-content">
                                            <div className="form-row"><div className="form-group"><label>Related Incidents</label><input type="number" name="related_incidents" value={displayEvent.related_incidents} onChange={(e) => handleEditFormFieldChange('related_incidents', parseInt(e.target.value, 10) || 0)} /></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_related_incidents" value={displayEvent.remark_related_incidents || ''} onChange={(e) => handleEditFormFieldChange('remark_related_incidents', e.target.value)} /></div></div>
                                            <div className="form-row"><div className="form-group"><label>Casualties</label><input type="number" name="casualties" value={displayEvent.casualties} onChange={(e) => handleEditFormFieldChange('casualties', parseInt(e.target.value, 10) || 0)} /></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_casualties" value={displayEvent.remark_casualties || ''} onChange={(e) => handleEditFormFieldChange('remark_casualties', e.target.value)} /></div></div>
                                            <div className="form-row"><div className="form-group"><label>Power Status</label><input type="text" name="power_status" value={displayEvent.power_status} onChange={(e) => handleEditFormFieldChange('power_status', e.target.value)} /></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_power_status" value={displayEvent.remark_power_status || ''} onChange={(e) => handleEditFormFieldChange('remark_power_status', e.target.value)} /></div></div>
                                            <div className="form-row"><div className="form-group"><label>Communication Lines</label><input type="text" name="communication_lines" value={displayEvent.communication_lines} onChange={(e) => handleEditFormFieldChange('communication_lines', e.target.value)} /></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_communication_lines" value={displayEvent.remark_communication_lines || ''} onChange={(e) => handleEditFormFieldChange('remark_communication_lines', e.target.value)} /></div></div>
                                            <div className="form-row"><div className="form-group"><label>Damage to Facilities</label><input type="text" name="damage_facilities" value={displayEvent.damage_facilities} onChange={(e) => handleEditFormFieldChange('damage_facilities', e.target.value)} /></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_damage_facilities" value={displayEvent.remark_damage_facilities || ''} onChange={(e) => handleEditFormFieldChange('remark_damage_facilities', e.target.value)} /></div></div>
                                            <div className="form-row"><div className="form-group checkbox-group"><label><input type="checkbox" name="work_suspension" checked={displayEvent.work_suspension} onChange={(e) => handleEditFormFieldChange('work_suspension', e.target.checked)} /> Work Suspension</label></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_work_suspension" value={displayEvent.remark_work_suspension || ''} onChange={(e) => handleEditFormFieldChange('remark_work_suspension', e.target.value)} /></div></div>
                                            <div className="form-row"><div className="form-group"><label>Assistance Provided</label><input type="text" name="assistance_provided" value={displayEvent.assistance_provided} onChange={(e) => handleEditFormFieldChange('assistance_provided', e.target.value)} /></div><div className="form-group"><label>Remarks</label><input type="text" name="remark_assistance_provided" value={displayEvent.remark_assistance_provided || ''} onChange={(e) => handleEditFormFieldChange('remark_assistance_provided', e.target.value)} /></div></div>
                                        </div>
                                    )}
                                </div>

                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('damageDetails')}>
                                        <h4>🏗️ Damage Building</h4>
                                        <span>{expandedSections.damageDetails ? '▼' : '►'}</span>
                                    </div>
                                    {expandedSections.damageDetails && (
                                        <div className="edit-section-content">
                                            <div className="damage-form">
                                                <div className="form-row">
                                                    <div className="form-group"><label>Damage Description</label><input type="text" value={newDamage.description} onChange={(e) => setNewDamage({ ...newDamage, description: e.target.value })} placeholder="e.g., Building collapsed" /></div>
                                                    <div className="form-group"><label>Cost (₱)</label><input type="number" value={newDamage.cost} onChange={(e) => setNewDamage({ ...newDamage, cost: e.target.value })} placeholder="0" /></div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group"><label>Status</label>
                                                        <select value={newDamage.status} onChange={(e) => setNewDamage({ ...newDamage, status: e.target.value })}>
                                                            <option>Reported</option><option>Assessing</option><option>Under Repair</option><option>Repaired</option><option>Condemned</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group"><label>Image</label>
                                                        <input type="file" accept="image/*" onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = () => setNewDamage({ ...newDamage, image: reader.result });
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }} />
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
                                                    {editingDamageIndex !== null && <button onClick={() => { setEditingDamageIndex(null); setNewDamage({ description: '', cost: '', status: 'Reported', image: null }); }}>Cancel</button>}
                                                </div>
                                            </div>
                                            <div className="damage-list">
                                                {(formData.damage_details || []).map((damage, index) => (
                                                    <div key={index} className="damage-item">
                                                        <div className="damage-info">
                                                            <strong>{damage.description}</strong>
                                                            <span>₱{damage.cost || 0}</span>
                                                            <span className={`status-badge ${damage.status ? damage.status.toLowerCase().replace(/\s+/g, '-') : 'reported'}`}>{damage.status}</span>
                                                            {damage.image && <img src={damage.image} alt="Damage" className="damage-thumbnail" onClick={() => openImageModal(damage.image)} />}
                                                        </div>
                                                        <div className="damage-actions">
                                                            <button className="view-btn" onClick={() => handleEditDamage(index)}>✏️</button>
                                                            <button className="danger" onClick={() => handleDeleteDamage(index)}>🗑️</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(formData.damage_details || []).length === 0 && <p className="no-items">No damage records added.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('equipmentDetails')}>
                                        <h4>🛠️ Damage Equipment</h4>
                                        <span>{expandedSections.equipmentDetails ? '▼' : '►'}</span>
                                    </div>
                                    {expandedSections.equipmentDetails && (
                                        <div className="edit-section-content">
                                            <div className="damage-form">
                                                <div className="form-row">
                                                    <div className="form-group"><label>Equipment Name</label><input type="text" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} placeholder="e.g., Generator" /></div>
                                                    <div className="form-group"><label>Cost (₱)</label><input type="number" value={newEquipment.cost} onChange={(e) => setNewEquipment({ ...newEquipment, cost: e.target.value })} placeholder="0" /></div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group"><label>Description</label><input type="text" value={newEquipment.description} onChange={(e) => setNewEquipment({ ...newEquipment, description: e.target.value })} placeholder="e.g., Portable radio" /></div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group"><label>Status</label>
                                                        <select value={newEquipment.status} onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value })}>
                                                            <option>Reported</option><option>Assessing</option><option>Under Repair</option><option>Repaired</option><option>Condemned</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group"><label>Image</label>
                                                        <input type="file" accept="image/*" onChange={(e) => {
                                                            const file = e.target.files[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = () => setNewEquipment({ ...newEquipment, image: reader.result });
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }} />
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
                                                    {editingEquipmentIndex !== null && <button onClick={() => { setEditingEquipmentIndex(null); setNewEquipment({ name: '', description: '', cost: '', status: 'Reported', image: null }); }}>Cancel</button>}
                                                </div>
                                            </div>
                                            <div className="damage-list">
                                                {(formData.equipment_details || []).map((equip, index) => (
                                                    <div key={index} className="damage-item">
                                                        <div className="damage-info">
                                                            <strong>{equip.name}</strong>
                                                            <span>{equip.description}</span>
                                                            <span>₱{equip.cost || 0}</span>
                                                            <span className={`status-badge ${equip.status ? equip.status.toLowerCase().replace(/\s+/g, '-') : 'reported'}`}>{equip.status}</span>
                                                            {equip.image && <img src={equip.image} alt="Equipment" className="damage-thumbnail" onClick={() => openImageModal(equip.image)} />}
                                                        </div>
                                                        <div className="damage-actions">
                                                            <button className="view-btn" onClick={() => handleEditEquipment(index)}>✏️</button>
                                                            <button className="danger" onClick={() => handleDeleteEquipment(index)}>🗑️</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(formData.equipment_details || []).length === 0 && <p className="no-items">No equipment records added.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('affectedStaff')}>
                                        <h4>👥 Affected Staff</h4>
                                        <span>{expandedSections.affectedStaff ? '▼' : '►'}</span>
                                    </div>
                                    {expandedSections.affectedStaff && (
                                        <div className="edit-section-content">
                                            <div className="staff-form">
                                                <div className="form-row">
                                                    <div className="form-group"><label>Name</label><input type="text" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Staff name" /></div>
                                                    <div className="form-group"><label>Area</label><input type="text" value={newStaff.area} onChange={(e) => setNewStaff({ ...newStaff, area: e.target.value })} placeholder="Area/Location" /></div>
                                                </div>
                                                <div className="form-row">
                                                    <div className="form-group"><label>Assistance Given</label><input type="text" value={newStaff.assistance} onChange={(e) => setNewStaff({ ...newStaff, assistance: e.target.value })} placeholder="e.g., Food pack, Medical" /></div>
                                                    <div className="form-group"><label>Status</label>
                                                        <select value={newStaff.status} onChange={(e) => setNewStaff({ ...newStaff, status: e.target.value })}>
                                                            <option>Active</option><option>Injured</option><option>Evacuated</option><option>Rescued</option><option>Deceased</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="form-buttons">
                                                    {editingStaffIndex !== null ? (
                                                        <button className="success" onClick={handleUpdateStaff}>Update Staff</button>
                                                    ) : (
                                                        <button className="add-mun-btn" onClick={handleAddStaff}>+ Add Staff</button>
                                                    )}
                                                    {editingStaffIndex !== null && <button onClick={() => { setEditingStaffIndex(null); setNewStaff({ name: '', area: '', assistance: '', status: 'Active' }); }}>Cancel</button>}
                                                </div>
                                            </div>
                                            <div className="staff-list">
                                                {(formData.affected_staff || []).map((staff, index) => (
                                                    <div key={index} className="staff-item">
                                                        <div className="staff-info">
                                                            <strong>{staff.name}</strong>
                                                            <span>{staff.area}</span>
                                                            <span>Assistance: {staff.assistance || 'None'}</span>
                                                            <span className={`status-badge ${staff.status ? staff.status.toLowerCase().replace(/\s+/g, '-') : 'active'}`}>{staff.status}</span>
                                                        </div>
                                                        <div className="staff-actions">
                                                            <button className="view-btn" onClick={() => handleEditStaff(index)}>✏️</button>
                                                            <button className="danger" onClick={() => handleDeleteStaff(index)}>🗑️</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(formData.affected_staff || []).length === 0 && <p className="no-items">No staff records added.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>

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
                                                        <img src={formData.imageUrl} alt="Office" style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', border: '1px solid #ddd' }} />
                                                        <button onClick={handleRemoveOfficeImage} style={{ marginLeft: '10px', padding: '4px 10px' }}>Remove</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="edit-section">
                                    <div className="edit-section-header" onClick={() => toggleSection('remarks')}><h4>📝 General Remarks</h4><span>{expandedSections.remarks ? '▼' : '►'}</span></div>
                                    {expandedSections.remarks && (
                                        <div className="edit-section-content"><div className="form-group"><label>Overall Remarks</label><textarea name="remark" value={displayEvent.remark || ''} onChange={(e) => handleEditFormFieldChange('remark', e.target.value)} rows="3" placeholder="Additional notes or instructions..." /></div></div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="warning-grid">
                                    <div className="warning-grid-row header">
                                        <div className="warning-col"><div className="warning-title">TROPICAL CYCLONE WARNING SIGNAL<div className="warning-sub">(based on DOST-PAGASA Weather Updates)</div></div></div>
                                        <div className="warning-col"><div className="weather-title">GENERAL WEATHER SITUATION<div className="warning-sub">(Actual Weather situation)</div></div></div>
                                    </div>
                                    <div className="warning-grid-row content">
                                        <div className="warning-col signals-col">
                                            <div className="warning-panel">
                                                <div className="warning-signals-list">{Object.entries(displayEvent.warning_signals || {}).map(([mun, signal]) => (<div key={mun} className="signal-item"><span className="mun-name">{mun}</span><span className="signal-number">Signal No. {signal}</span></div>))}</div>
                                                {Object.keys(displayEvent.warning_signals || {}).length === 0 && <div className="no-signals">No warning signals currently in effect.</div>}
                                            </div>
                                        </div>
                                        <div className="warning-col weather-col"><div className="warning-panel weather-panel"><div className="weather-text">{selectedOffice === 'PSTO-Region-1' ? displayWeather : (displayEvent.general_weather || 'No weather data reported')}</div></div></div>
                                    </div>
                                </div>

                                <div className="effects-section"><h4>📊 EFFECTS</h4>
                                    <div className="effects-panel"><div className="effects-list">
                                        {[
                                            { label: 'Related Incidents', value: displayEvent.related_incidents, remarkField: 'remark_related_incidents' },
                                            { label: 'Casualties', value: displayEvent.casualties, remarkField: 'remark_casualties' },
                                            { label: 'Power', value: displayEvent.power_status || '—', remarkField: 'remark_power_status' },
                                            { label: 'Communication', value: displayEvent.communication_lines || '—', remarkField: 'remark_communication_lines' },
                                            { label: 'Damage', value: displayEvent.damage_facilities || '—', remarkField: 'remark_damage_facilities' },
                                            { label: 'Work Suspension', value: displayEvent.work_suspension ? 'Yes' : 'No', remarkField: 'remark_work_suspension' },
                                            { label: 'Assistance', value: displayEvent.assistance_provided || '—', remarkField: 'remark_assistance_provided' },
                                        ].map((item) => (<div key={item.label} className="effect-row"><span className="effect-label">{item.label}:</span><span className="effect-value">{item.value}</span><span className="effect-remark">{displayEvent[item.remarkField] || '-'}</span></div>))}
                                    </div></div>
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
                                                                <td><span className={`status-badge ${(damage.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>{damage.status || 'Reported'}</span></td>
                                                                <td>{damage.image ? <img src={damage.image} alt="Damage" className="damage-thumbnail" onClick={() => openImageModal(damage.image)} /> : '—'}</td>
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
                                                                <td><span className={`status-badge ${(equip.status || 'reported').toLowerCase().replace(/\s+/g, '-')}`}>{equip.status || 'Reported'}</span></td>
                                                                <td>{equip.image ? <img src={equip.image} alt="Equipment" className="damage-thumbnail" onClick={() => openImageModal(equip.image)} /> : '—'}</td>
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
                                                                <td><span className={`status-badge ${(staff.status || 'active').toLowerCase().replace(/\s+/g, '-')}`}>{staff.status || 'Active'}</span></td>
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
                isOpen={showOfficeModal}
                onClose={handleCloseOfficeModal}
                selectedOffice={selectedOffice}
                displayWeather={displayWeather}
                currentOfficeData={currentOfficeData}
                officeStatusRemarks={officeStatusRemarks}
            />
        </div>
    );

    // ======================== MAIN RENDER ========================
    return (
        <div className={`dashboard-container ${settingsData.darkMode ? 'dark-mode' : ''}`}>
            <div className="sidebar-new">
                <div className="sidebar-logo">
                    <h2>DOST Region 1</h2>
                    <p>Disaster Management</p>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </div>
                    <div className={`nav-item ${activeMenu === 'typhoon' ? 'active' : ''}`} onClick={() => setActiveMenu('typhoon')}>
                        <span className="nav-icon">🌊</span>
                        <span>Typhoon</span>
                    </div>
                    <div className={`nav-item ${activeMenu === 'history' ? 'active' : ''}`} onClick={() => setActiveMenu('history')}>
                        <span className="nav-icon">📜</span>
                        <span>History</span>
                    </div>
                    <div className={`nav-item ${activeMenu === 'live-typhoon' ? 'active' : ''}`} onClick={() => setActiveMenu('live-typhoon')}>
                        <span className="nav-icon">🗺️</span>
                        <span>Live Typhoon (Panahon)</span>
                    </div>
                    <div className={`nav-item ${activeMenu === 'notifications' ? 'active' : ''}`} onClick={() => setActiveMenu('notifications')}>
                        <span className="nav-icon">🔔</span>
                        <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                    </div>
                    {canApproveReports && (
                        <div className={`nav-item ${activeMenu === 'pending-reports' ? 'active' : ''}`} onClick={() => setActiveMenu('pending-reports')}>
                            <span className="nav-icon">📋</span>
                            <span>Pending Reports</span>
                        </div>
                    )}
                    {canManageUsers && (
                        <div className={`nav-item ${activeMenu === 'users' ? 'active' : ''}`} onClick={() => setActiveMenu('users')}>
                            <span className="nav-icon">👥</span>
                            <span>Users</span>
                        </div>
                    )}
                </nav>
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-greeting">Hello, {currentUser?.name || 'Admin'}</div>
                        <div className="user-role">{isSuperAdmin ? 'SUPER ADMIN' : (isAdmin ? 'ADMIN' : 'USER')}</div>
                    </div>
                    <div className="sidebar-settings">
                        <div className="settings-item" onClick={() => setShowSettingsModal(true)}>
                            <span className="settings-icon">⚙️</span>
                            <span>Settings</span>
                        </div>
                    </div>
                    <div className="user-actions">
                        <div className="action-item logout" onClick={onLogout}>🚪 Logout</div>
                    </div>
                </div>
            </div>
            <div className="main-content" ref={mainContentRef} onScroll={handleScroll}>
                {activeMenu === 'dashboard' && renderDashboardContent()}
                {activeMenu === 'typhoon' && (
                    <div className="events-management">
                        <div className="events-header">
                            <h1>🌊 Manage Events</h1>
                            <div className="header-actions">
                                <div className="search-box-enhanced">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        key="event-search"
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
                                {(canEditEvents) && (
                                    <button className="new-event-btn" onClick={handleOpenAddModal}>
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
                                        <th>EVENT NAME</th><th>DATE</th><th>ALERT LVL</th><th>STATUS</th><th>PROVINCES</th><th>CATEGORY</th><th>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvents.length > 0 ? filteredEvents.map(event => (
                                        <tr key={event.id} className={event.status === 'archived' ? 'archived-row' : ''}>
                                            <td className="event-name">{event.name}</td>
                                            <td>{event.date}</td>
                                            <td><span className="alert-badge" style={{ background: getAlertColor(event.alertLevel) }}>{event.alertLevel}</span></td>
                                            <td><span className="status-badge" style={{ background: getStatusColor(event.status) }}>{getEventStatusLabel(event)}</span></td>
                                            <td><div className="provinces-list">{event.provinces?.length === allProvinces.length ? <span className="province-tag">All PSTO Offices</span> : event.provinces?.map((p, i) => <span key={i} className="province-tag">{p}</span>)}</div></td>
                                            <td>{event.category || event.type || '-'}</td>
                                            <td className="actions-cell">
                                                {event.deployment !== 'Deployed' && event.status === 'approved' ? (canDeployEvents ? <button className="action-btn deploy-btn" onClick={() => handleDeployEvent(event.id)}>Deploy</button> : <span className="status-badge" style={{ background: '#17a2b8' }}>Approved</span>) : event.deployment === 'Deployed' ? <span className="status-badge" style={{ background: '#198754' }}>Active</span> : <span className="status-badge" style={{ background: '#ffc107' }}>{event.status === 'pending' ? 'Awaiting Approval' : 'Draft'}</span>}
                                                <button className="action-btn view-btn" onClick={() => handleViewEvent(event)}>View Details</button>
                                                {canEditEvents && event.status === 'pending' && <button className="action-btn success" onClick={() => handleApproveEvent(event.id)}>Approve</button>}
                                                {canRejectEvents && event.status === 'pending' && <button className="action-btn danger" onClick={() => openRejectModal(event.id)}>Reject</button>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No events found. {canEditEvents && 'Click "➕ Add New Event" to add a new event.'}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeMenu === 'history' && (
                    <TyphoonHistoryContent
                        typhoonHistory={typhoonHistory}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        handleSearchChange={handleSearchChange}
                        setSelectedEvent={setSelectedEvent}
                        setShowDetailsModal={setShowDetailsModal}
                        getAlertColor={getAlertColor}
                    />
                )}
                {activeMenu === 'live-typhoon' && (
                    <div className="forecast-section card">
                        <h1>Live Typhoon (Panahon)</h1>
                        <div className="windy-embed-container"><iframe title="Panahon" src="https://www.panahon.gov.ph/" frameBorder="0" allowFullScreen /></div>
                    </div>
                )}
                {activeMenu === 'notifications' && (
                    <div className="events-management">
                        <div className="events-header">
                            <h1>🔔 Notifications {unreadCount > 0 && `(${unreadCount} new)`}</h1>
                            <div className="header-actions"><button className="new-event-btn" onClick={clearAllNotifications}>Clear All</button></div>
                        </div>
                        <div className="events-subtitle">System events, report updates, and alerts</div>
                        <div className="notifications-list">
                            {notifications.length === 0 ? (
                                <div className="no-notifications">No notifications yet.</div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''} ${notif.type}`} onClick={() => markNotificationRead(notif.id)}>
                                        <div className="notification-header"><span className="notification-title">{notif.title}</span><span className="notification-time">{new Date(notif.timestamp).toLocaleString()}</span></div>
                                        <div className="notification-message">{notif.message}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {activeMenu === 'pending-reports' && canApproveReports && (
                    <div className="events-management">
                        <div className="events-header"><h1>Pending PSTO Reports</h1></div>
                        <div className="events-subtitle">Review and approve reports submitted by PSTO offices</div>
                        <div className="events-table-container">
                            <table className="events-table">
                                <thead><tr><th>Office</th><th>Submitted By</th><th>Submitted At</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {pendingReports.filter(r => r.status === 'pending').map(report => (
                                        <tr key={report.id}>
                                            <td>{report.office}</td>
                                            <td>{report.submittedBy}</td>
                                            <td>{new Date(report.submittedAt).toLocaleString()}</td>
                                            <td><span className="status-badge" style={{ background: '#ffc107' }}>Pending</span></td>
                                            <td className="actions-cell">
                                                <button className="success" onClick={() => approveReport(report.id)}>Approve</button>
                                                <button className="danger" onClick={() => openRejectReportModal(report)}>Reject</button>
                                                <button className="view-btn" onClick={() => { setSelectedReport(report); setShowReportReviewModal(true); }}>Review</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {pendingReports.filter(r => r.status === 'pending').length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No pending reports.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeMenu === 'users' && canManageUsers && (
                    <div className="events-management users-management">
                        <div className="events-header">
                            <h1>👥 User Management</h1>
                            <div className="header-actions">
                                <div className="search-box-enhanced">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        key="user-search"
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
                                <button className="new-event-btn" onClick={() => { setUserForm({ id: null, name: '', email: '', office: selectedOffice, role: 'USER', status: 'Active', password: '', profileImage: '' }); setIsEditingUser(false); setShowUserModal(true); }}>+ New User</button>
                            </div>
                        </div>
                        <div className="events-table-container">
                            <table className="events-table users-table">
                                <thead>
                                    <tr><th>Name</th><th>Email</th><th>Office</th><th>Role</th><th>Status</th><th>Actions</th></tr>
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
                                                <button className="view-btn" onClick={() => { setUserForm(user); setIsEditingUser(true); setShowUserModal(true); }}>Edit</button>
                                                <button className="deploy-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {showUserModal && (
                            <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                                <div className="modal-content" onClick={e => e.stopPropagation()}>
                                    <div className="modal-header"><h3>{isEditingUser ? 'Edit User' : 'Create User'}</h3><button className="modal-close" onClick={() => setShowUserModal(false)}>×</button></div>
                                    <div className="form-group"><label>Name</label><input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} /></div>
                                    <div className="form-group"><label>Email</label><input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></div>
                                    <div className="form-group"><label>Office</label><select value={userForm.office} onChange={(e) => setUserForm({ ...userForm, office: e.target.value })}>{['PSTO-Ilocos Norte', 'PSTO-Ilocos Sur', 'PSTO-La Union', 'PSTO-Pangasinan', 'PSTO-Ilocos Sur - FO', 'PSTO-Pangasinan - FO'].map(off => <option key={off}>{off}</option>)}</select></div>
                                    <div className="form-group"><label>Password {isEditingUser && '(leave blank to keep current)'}</label><input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></div>
                                    <div className="form-group"><label>Role</label>
                                        <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                                            {isSuperAdmin && <option value="SADMIN">SADMIN</option>}
                                            <option value="ADMIN">ADMIN</option>
                                            <option value="USER">USER</option>
                                        </select>
                                    </div>
                                    <div className="form-group"><label>Status</label><select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}><option>Active</option><option>Inactive</option></select></div>
                                    <div className="modal-buttons"><button className="success" onClick={handleSaveUser}>{isEditingUser ? 'Save' : 'Create'}</button><button onClick={() => setShowUserModal(false)}>Cancel</button></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <EventDetailsModal
                isOpen={showDetailsModal}
                onClose={handleCloseDetailsModal}
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
                handleRejectEvent={handleRejectEvent}
            />

            <AddEventModal
                isOpen={showAddModal}
                onClose={handleCloseAddModal}
                isEditingEvent={isEditingEvent}
                newEvent={newEvent}
                handleNewEventFieldChange={handleNewEventFieldChange}
                setNewEvent={setNewEvent}
                handleAddEvent={handleAddEvent}
                allProvinces={allProvinces}
            />

            {showReportReviewModal && selectedReport && (
                <div className="modal-overlay" onClick={() => setShowReportReviewModal(false)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><h3>Review Report - {selectedReport.office}</h3><button className="modal-close" onClick={() => setShowReportReviewModal(false)}>×</button></div>
                        <div><strong>Submitted by:</strong> {selectedReport.submittedBy} on {new Date(selectedReport.submittedAt).toLocaleString()}</div>
                        <div className="diff-section">
                            <h4>Changes (original → submitted)</h4>
                            {Object.keys(selectedReport.data).filter(key => JSON.stringify(officesData[selectedReport.office]?.[key]) !== JSON.stringify(selectedReport.data[key])).length === 0 && <p>No changes detected.</p>}
                            {Object.keys(selectedReport.data).filter(key => JSON.stringify(officesData[selectedReport.office]?.[key]) !== JSON.stringify(selectedReport.data[key])).map(key => (
                                <div key={key} className="diff-row">
                                    <strong>{key}:</strong><br />
                                    <span className="diff-old">Original: {JSON.stringify(officesData[selectedReport.office]?.[key])}</span><br />
                                    <span className="diff-new">Submitted: {JSON.stringify(selectedReport.data[key])}</span>
                                </div>
                            ))}
                        </div>
                        {selectedReport.status === 'rejected' && <div className="rejection-reason"><strong>Rejection reason:</strong> {selectedReport.remarks}</div>}
                        {selectedReport.status === 'pending' && (
                            <div className="modal-buttons">
                                <button className="success" onClick={() => { approveReport(selectedReport.id); setShowReportReviewModal(false); }}>Approve</button>
                                <button className="danger" onClick={() => { setShowReportReviewModal(false); openRejectReportModal(selectedReport); }}>Reject</button>
                                <button className="modal-close-footer-btn" onClick={() => setShowReportReviewModal(false)}>Close</button>
                            </div>
                        )}
                        {selectedReport.status !== 'pending' && <button className="modal-close-footer-btn" onClick={() => setShowReportReviewModal(false)}>Close</button>}
                    </div>
                </div>
            )}

            {showSettingsModal && (
                <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>⚙️ System Settings</h3>
                            <button className="modal-close" onClick={() => setShowSettingsModal(false)}>×</button>
                        </div>
                        <div className="settings-grid">
                            <div className="settings-group">
                                <h4>General Settings</h4>
                                <div className="settings-item-row">
                                    <label>System Name</label>
                                    <input type="text" value={settingsData.systemName} onChange={(e) => setSettingsData({ ...settingsData, systemName: e.target.value })} />
                                </div>
                                <div className="settings-item-row">
                                    <label>Default Alert Level</label>
                                    <select value={settingsData.defaultAlertLevel} onChange={(e) => setSettingsData({ ...settingsData, defaultAlertLevel: e.target.value })}>
                                        <option>RED</option><option>BLUE</option><option>WHITE</option>
                                    </select>
                                </div>
                                <div className="settings-item-row">
                                    <label>Auto Archive Days</label>
                                    <input type="number" value={settingsData.autoArchiveDays} onChange={(e) => setSettingsData({ ...settingsData, autoArchiveDays: parseInt(e.target.value) || 7 })} min="1" max="30" />
                                </div>
                            </div>
                            <div className="settings-group">
                                <h4>Notification Settings</h4>
                                <div className="settings-item-row">
                                    <label>Enable Notification Sound</label>
                                    <input type="checkbox" checked={settingsData.notificationSound} onChange={(e) => setSettingsData({ ...settingsData, notificationSound: e.target.checked })} />
                                </div>
                                <div className="settings-item-row">
                                    <label>Dark Mode</label>
                                    <input type="checkbox" checked={settingsData.darkMode} onChange={(e) => {
                                        setSettingsData({ ...settingsData, darkMode: e.target.checked });
                                        document.body.classList.toggle('dark-mode', e.target.checked);
                                    }} />
                                </div>
                            </div>
                            <div className="settings-group">
                                <h4>Data Management</h4>
                                <div className="settings-item-row">
                                    <button onClick={exportData}>📤 Export All Data</button>
                                    <label className="import-btn" style={{ marginLeft: '10px' }}>
                                        <input type="file" onChange={importData} style={{ display: 'none' }} />
                                        📥 Import Data
                                    </label>
                                </div>
                                <div className="settings-item-row">
                                    <button className="danger" onClick={resetToDefaultData}>⚠️ Reset to Default</button>
                                </div>
                            </div>
                        </div>
                        <div className="modal-buttons">
                            <button className="success" onClick={() => {
                                saveToStorage('dash_settings', settingsData);
                                showToast('Settings saved.', 'success');
                                setShowSettingsModal(false);
                            }}>Save Settings</button>
                            <button className="modal-close-footer-btn" onClick={() => setShowSettingsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="modal-content">
                        <h3>Reject Event</h3>
                        <textarea className="reject-reason-textarea" placeholder="Provide reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
                        <div className="modal-buttons">
                            <button className="danger" onClick={confirmRejectEvent}>Confirm Rejection</button>
                            <button className="modal-close-footer-btn" onClick={() => setShowRejectModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showImageModal && imageModalSrc && (
                <div className="modal-overlay" onClick={closeImageModal}>
                    <div className="modal-content image-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeImageModal}>×</button>
                        <img src={imageModalSrc} alt="Enlarged" className="image-modal-img" />
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📤 Submit Report - {selectedOffice}</h3>
                            <button className="modal-close" onClick={() => { setShowReportModal(false); setReportFormData(null); }}>×</button>
                        </div>
                        <div className="report-form">
                            <div className="form-section">
                                <h4>📡 Warning Signals</h4>
                                <div className="signal-edit-row">
                                    <input type="text" placeholder="New municipality" value={newMunicipality} onChange={(e) => setNewMunicipality(e.target.value)} />
                                    <select value={newSignal} onChange={(e) => setNewSignal(parseInt(e.target.value))}>
                                        <option value={1}>Signal #1</option><option value={2}>Signal #2</option>
                                        <option value={3}>Signal #3</option><option value={4}>Signal #4</option><option value={5}>Signal #5</option>
                                    </select>
                                    <button className="add-mun-btn" onClick={handleReportAddMunicipality}>+ Add</button>
                                </div>
                                <div className="municipality-list">
                                    {(reportFormData?.municipalities || []).map((mun) => (
                                        <div key={mun} className="signal-edit-row">
                                            <span className="municipality-name">{mun}</span>
                                            <select value={reportFormData?.warning_signals?.[mun] || 0} onChange={(e) => handleReportSignalChange(mun, e.target.value)}>
                                                <option value={0}>No Signal</option><option value={1}>Signal #1</option><option value={2}>Signal #2</option>
                                                <option value={3}>Signal #3</option><option value={4}>Signal #4</option><option value={5}>Signal #5</option>
                                            </select>
                                            <button className="remove-mun-btn" onClick={() => handleReportRemoveMunicipality(mun)}>🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>🌤️ General Weather</h4>
                                <input type="text" placeholder="General weather situation" value={reportFormData?.general_weather || ''} onChange={(e) => handleReportFieldChange('general_weather', e.target.value)} />
                            </div>

                            <div className="form-section">
                                <h4>📊 Effects</h4>
                                <div className="form-row">
                                    <div className="form-group"><label>Related Incidents</label><input type="number" value={reportFormData?.related_incidents || 0} onChange={(e) => handleReportFieldChange('related_incidents', parseInt(e.target.value, 10) || 0)} /></div>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_related_incidents || ''} onChange={(e) => handleReportFieldChange('remark_related_incidents', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Casualties</label><input type="number" value={reportFormData?.casualties || 0} onChange={(e) => handleReportFieldChange('casualties', parseInt(e.target.value, 10) || 0)} /></div>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_casualties || ''} onChange={(e) => handleReportFieldChange('remark_casualties', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Power Status</label><input type="text" value={reportFormData?.power_status || ''} onChange={(e) => handleReportFieldChange('power_status', e.target.value)} /></div>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_power_status || ''} onChange={(e) => handleReportFieldChange('remark_power_status', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Communication Lines</label><input type="text" value={reportFormData?.communication_lines || ''} onChange={(e) => handleReportFieldChange('communication_lines', e.target.value)} /></div>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_communication_lines || ''} onChange={(e) => handleReportFieldChange('remark_communication_lines', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Damage to Facilities</label><input type="text" value={reportFormData?.damage_facilities || ''} onChange={(e) => handleReportFieldChange('damage_facilities', e.target.value)} /></div>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_damage_facilities || ''} onChange={(e) => handleReportFieldChange('remark_damage_facilities', e.target.value)} /></div>
                                </div>
                                <div className="form-row checkbox-group">
                                    <label><input type="checkbox" checked={reportFormData?.work_suspension || false} onChange={(e) => handleReportFieldChange('work_suspension', e.target.checked)} /> Work Suspension</label>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_work_suspension || ''} onChange={(e) => handleReportFieldChange('remark_work_suspension', e.target.value)} /></div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group"><label>Assistance Provided</label><input type="text" value={reportFormData?.assistance_provided || ''} onChange={(e) => handleReportFieldChange('assistance_provided', e.target.value)} /></div>
                                    <div className="form-group"><label>Remarks</label><input type="text" value={reportFormData?.remark_assistance_provided || ''} onChange={(e) => handleReportFieldChange('remark_assistance_provided', e.target.value)} /></div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>🏗️ Damage Building</h4>
                                <div className="damage-form">
                                    <div className="form-row">
                                        <div className="form-group"><label>Description</label><input type="text" value={reportNewDamage.description} onChange={(e) => setReportNewDamage({ ...reportNewDamage, description: e.target.value })} placeholder="Damage description" /></div>
                                        <div className="form-group"><label>Cost</label><input type="number" value={reportNewDamage.cost} onChange={(e) => setReportNewDamage({ ...reportNewDamage, cost: e.target.value })} placeholder="0" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Status</label>
                                            <select value={reportNewDamage.status} onChange={(e) => setReportNewDamage({ ...reportNewDamage, status: e.target.value })}>
                                                <option>Reported</option><option>Assessing</option><option>Under Repair</option><option>Repaired</option><option>Condemned</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-buttons">
                                        {editingReportDamageIndex !== null ? (
                                            <button className="success" onClick={handleReportUpdateDamage}>Update</button>
                                        ) : (
                                            <button className="add-mun-btn" onClick={handleReportAddDamage}>+ Add</button>
                                        )}
                                        {editingReportDamageIndex !== null && <button onClick={() => { setEditingReportDamageIndex(null); setReportNewDamage({ description: '', cost: '', status: 'Reported' }); }}>Cancel</button>}
                                    </div>
                                </div>
                                <div className="damage-list">
                                    {(reportFormData?.damage_details || []).map((damage, index) => (
                                        <div key={index} className="damage-item">
                                            <div className="damage-info">
                                                <strong>{damage.description}</strong>
                                                <span>₱{damage.cost || 0}</span>
                                                <span className="status-badge">{damage.status}</span>
                                            </div>
                                            <div className="damage-actions">
                                                <button className="view-btn" onClick={() => handleReportEditDamage(index)}>✏️</button>
                                                <button className="danger" onClick={() => handleReportDeleteDamage(index)}>🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>🛠️ Equipment Damage</h4>
                                <div className="damage-form">
                                    <div className="form-row">
                                        <div className="form-group"><label>Equipment Name</label><input type="text" value={reportNewEquipment.name} onChange={(e) => setReportNewEquipment({ ...reportNewEquipment, name: e.target.value })} placeholder="Equipment name" /></div>
                                        <div className="form-group"><label>Cost</label><input type="number" value={reportNewEquipment.cost} onChange={(e) => setReportNewEquipment({ ...reportNewEquipment, cost: e.target.value })} placeholder="0" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Description</label><input type="text" value={reportNewEquipment.description} onChange={(e) => setReportNewEquipment({ ...reportNewEquipment, description: e.target.value })} placeholder="Description" /></div>
                                        <div className="form-group"><label>Status</label>
                                            <select value={reportNewEquipment.status} onChange={(e) => setReportNewEquipment({ ...reportNewEquipment, status: e.target.value })}>
                                                <option>Reported</option><option>Assessing</option><option>Under Repair</option><option>Repaired</option><option>Condemned</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-buttons">
                                        {editingReportEquipmentIndex !== null ? (
                                            <button className="success" onClick={handleReportUpdateEquipment}>Update</button>
                                        ) : (
                                            <button className="add-mun-btn" onClick={handleReportAddEquipment}>+ Add</button>
                                        )}
                                        {editingReportEquipmentIndex !== null && <button onClick={() => { setEditingReportEquipmentIndex(null); setReportNewEquipment({ name: '', description: '', cost: '', status: 'Reported' }); }}>Cancel</button>}
                                    </div>
                                </div>
                                <div className="damage-list">
                                    {(reportFormData?.equipment_details || []).map((equip, index) => (
                                        <div key={index} className="damage-item">
                                            <div className="damage-info">
                                                <strong>{equip.name}</strong>
                                                <span>{equip.description}</span>
                                                <span>₱{equip.cost || 0}</span>
                                                <span className="status-badge">{equip.status}</span>
                                            </div>
                                            <div className="damage-actions">
                                                <button className="view-btn" onClick={() => handleReportEditEquipment(index)}>✏️</button>
                                                <button className="danger" onClick={() => handleReportDeleteEquipment(index)}>🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>👥 Affected Staff</h4>
                                <div className="staff-form">
                                    <div className="form-row">
                                        <div className="form-group"><label>Name</label><input type="text" value={reportNewStaff.name} onChange={(e) => setReportNewStaff({ ...reportNewStaff, name: e.target.value })} placeholder="Staff name" /></div>
                                        <div className="form-group"><label>Area</label><input type="text" value={reportNewStaff.area} onChange={(e) => setReportNewStaff({ ...reportNewStaff, area: e.target.value })} placeholder="Area" /></div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group"><label>Assistance</label><input type="text" value={reportNewStaff.assistance} onChange={(e) => setReportNewStaff({ ...reportNewStaff, assistance: e.target.value })} placeholder="Assistance provided" /></div>
                                        <div className="form-group"><label>Status</label>
                                            <select value={reportNewStaff.status} onChange={(e) => setReportNewStaff({ ...reportNewStaff, status: e.target.value })}>
                                                <option>Active</option><option>Injured</option><option>Evacuated</option><option>Rescued</option><option>Deceased</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-buttons">
                                        {editingReportStaffIndex !== null ? (
                                            <button className="success" onClick={handleReportUpdateStaff}>Update</button>
                                        ) : (
                                            <button className="add-mun-btn" onClick={handleReportAddStaff}>+ Add</button>
                                        )}
                                        {editingReportStaffIndex !== null && <button onClick={() => { setEditingReportStaffIndex(null); setReportNewStaff({ name: '', area: '', assistance: '', status: 'Active' }); }}>Cancel</button>}
                                    </div>
                                </div>
                                <div className="staff-list">
                                    {(reportFormData?.affected_staff || []).map((staff, index) => (
                                        <div key={index} className="staff-item">
                                            <div className="staff-info">
                                                <strong>{staff.name}</strong>
                                                <span>{staff.area}</span>
                                                <span>Assistance: {staff.assistance || 'None'}</span>
                                                <span className="status-badge">{staff.status}</span>
                                            </div>
                                            <div className="staff-actions">
                                                <button className="view-btn" onClick={() => handleReportEditStaff(index)}>✏️</button>
                                                <button className="danger" onClick={() => handleReportDeleteStaff(index)}>🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-section">
                                <h4>📝 Remarks</h4>
                                <textarea value={reportFormData?.remark || ''} onChange={(e) => handleReportFieldChange('remark', e.target.value)} rows="3" placeholder="Additional remarks..." />
                            </div>

                            <div className="modal-buttons">
                                <button className="success" onClick={submitReport}>📤 Submit Report</button>
                                <button className="modal-close-footer-btn" onClick={() => { setShowReportModal(false); setReportFormData(null); }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;