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
