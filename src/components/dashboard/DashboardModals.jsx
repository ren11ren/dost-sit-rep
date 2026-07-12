import React, { useState } from 'react';

export const UserModal = ({
    isOpen,
    onClose,
    isEditingUser,
    userForm,
    setUserForm,
    isSuperAdmin,
    handleSaveUser,
    officeOptions = []
}) => {
    if (!isOpen) return null;

    const officeChoices = Array.isArray(officeOptions) && officeOptions.length > 0
        ? officeOptions
        : [
            'PSTO-Ilocos Norte',
            'PSTO-Ilocos Sur',
            'PSTO-La Union',
            'PSTO-Pangasinan',
            'PSTO-Ilocos Sur - FO',
            'PSTO-Pangasinan - FO',
            'PSTO-Ilocos Region'
        ];

    const options = Array.from(new Set([...(officeChoices || []), userForm?.office].filter(Boolean)));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{isEditingUser ? 'Edit User' : 'Create User'}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Office</label>
                    <select value={userForm.office} onChange={(e) => setUserForm({ ...userForm, office: e.target.value })}>
                        {options.map((off) => <option key={off} value={off}>{off}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Password {isEditingUser && '(leave blank to keep current)'}</label>
                    <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} />
                </div>
                <div className="form-group">
                    <label>Role</label>
                    <select value={userForm.role} onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}>
                        {isSuperAdmin && <option value="SADMIN">SADMIN</option>}
                        <option value="ADMIN">ADMIN</option>
                        <option value="USER">USER</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Status</label>
                    <select value={userForm.status} onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
                <div className="modal-buttons">
                    <button className="success" onClick={handleSaveUser}>{isEditingUser ? 'Save' : 'Create'}</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export const ReportReviewModal = ({
    isOpen,
    onClose,
    selectedReport,
    officesData,
    approveReport,
    openRejectReportModal
}) => {
    if (!isOpen || !selectedReport) return null;

    const changedKeys = Object.keys(selectedReport.data || {}).filter(
        (key) => JSON.stringify(officesData[selectedReport.office]?.[key]) !== JSON.stringify(selectedReport.data[key])
    );

    const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:image/');
    const shorten = (text, limit = 100) => {
        if (typeof text !== 'string') return text;
        return text.length > limit ? `${text.slice(0, limit)}…` : text;
    };

    const formatValue = (value) => {
        if (value === undefined || value === null || value === '') {
            return <span className="empty-value">—</span>;
        }

        if (typeof value === 'string') {
            if (isDataUrl(value)) {
                return <span className="value-tag">Image data · {value.length.toLocaleString()} chars</span>;
            }
            try {
                const parsed = JSON.parse(value);
                return formatValue(parsed);
            } catch (_e) {
                return <span className="value-text" title={value}>{shorten(value, 120)}</span>;
            }
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return <span className="empty-value">[]</span>;
            }
            const preview = value.slice(0, 3).map((item) => typeof item === 'string' ? item : JSON.stringify(item)).join(', ');
            return <span className="value-summary" title={JSON.stringify(value, null, 2)}>[Array({value.length})] {shorten(preview, 80)}</span>;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return <span className="empty-value">{'{ }'}</span>;
            }
            const preview = keys.slice(0, 4).map((key) => `${key}:${shorten(String(value[key]), 40)}`).join(', ');
            return <span className="value-summary" title={JSON.stringify(value, null, 2)}>[Object({keys.length})] {shorten(preview, 80)}</span>;
        }

        return <span>{String(value)}</span>;
    };

    const formatDate = (value) => {
        const date = new Date(value);
        return isNaN(date.getTime()) ? 'Unknown date' : date.toLocaleString();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large-modal report-review-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h3>Review Report</h3>
                        <p className="review-meta">{selectedReport.office} • Submitted by {selectedReport.submittedBy} • {formatDate(selectedReport.submittedAt)}</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="diff-section">
                    <h4>Changes</h4>
                    {changedKeys.length === 0 ? (
                        <p className="no-changes">No changes detected.</p>
                    ) : (
                        <div className="review-change-list">
                            {changedKeys.map((key) => (
                                <div key={key} className="review-change-row">
                                    <div className="review-field">{key}</div>
                                    <div className="review-value-blocks">
                                        <div className="review-value-block">
                                            <div className="review-label">Original</div>
                                            <div className="review-value">{formatValue(officesData[selectedReport.office]?.[key])}</div>
                                        </div>
                                        <div className="review-value-block">
                                            <div className="review-label">Submitted</div>
                                            <div className="review-value">{formatValue(selectedReport.data[key])}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {selectedReport.status === 'rejected' && (
                    <div className="rejection-reason">
                        <strong>Rejection reason:</strong> {selectedReport.remarks}
                    </div>
                )}
                <div className="modal-buttons report-review-actions">
                    {selectedReport.status === 'pending' && (
                        <>
                            <button className="success" onClick={() => { approveReport(selectedReport.id); onClose(); }}>Approve</button>
                            <button className="danger" onClick={() => { onClose(); openRejectReportModal(selectedReport); }}>Reject</button>
                        </>
                    )}
                    <button className="modal-close-footer-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export const SettingsModal = ({
    isOpen,
    onClose,
    settingsData,
    setSettingsData,
    exportData,
    importData,
    resetToDefaultData,
    onSaveSettings
}) => {
    if (!isOpen) return null;

    const [activeSection, setActiveSection] = useState('general');

    const developerDefaults = {
        name: 'Rainier Ganaden',
        email: 'rainierganaden1106@gmail.com',
        website: 'https://dostregion1.ph',
        notes: 'Developed and maintained by the DOST Region 1 IT team.'
    };

    const sectionMeta = {
        general: {
            title: 'General Settings',
            description: 'Manage core system behavior and default values.'
        },
        appearance: {
            title: 'Appearance',
            description: 'Adjust interface and visual preferences.'
        },
        notifications: {
            title: 'Notifications',
            description: 'Control alert and notification behavior.'
        },
        maintenance: {
            title: 'Maintenance',
            description: 'Back up, restore, and reset system data.'
        },
        developer: {
            title: 'Developer Profile',
            description: 'Reference system developer profile information. This section is view-only.'
        },
        advanced: {
            title: 'User Manual',
            description: 'Read the user guide and helpful documentation for this dashboard.'
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content profile-settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-settings-header">
                    <div>
                        <h3>Settings & Profile</h3>
                        <p>System configuration panel</p>
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="profile-settings-layout">
                    <aside className="profile-settings-sidebar">
                        {[
                            { key: 'general', label: 'General' },
                            { key: 'appearance', label: 'Appearance' },
                            { key: 'notifications', label: 'Notifications' },
                            { key: 'maintenance', label: 'Maintenance' },
                            { key: 'developer', label: 'Developer' },
                            { key: 'advanced', label: 'User Manual' }
                        ].map((item) => (
                            <button
                                key={item.key}
                                className={`profile-nav-item ${activeSection === item.key ? 'active' : ''}`}
                                onClick={() => setActiveSection(item.key)}
                                type="button"
                            >
                                {item.label}
                            </button>
                        ))}
                    </aside>

                    <section className="profile-settings-content">
                        <div className="profile-settings-section-head">
                            <h4>{sectionMeta[activeSection].title}</h4>
                            <p>{sectionMeta[activeSection].description}</p>
                        </div>

                        {activeSection === 'general' && (
                            <div className="settings-group">
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
                                    <input
                                        type="number"
                                        value={settingsData.autoArchiveDays}
                                        onChange={(e) => setSettingsData({ ...settingsData, autoArchiveDays: parseInt(e.target.value, 10) || 7 })}
                                        min="1"
                                        max="30"
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === 'appearance' && (
                            <div className="settings-group">
                                <div className="settings-item-row">
                                    <label>Dark Mode</label>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.darkMode}
                                        onChange={(e) => {
                                            setSettingsData({ ...settingsData, darkMode: e.target.checked });
                                            document.body.classList.toggle('dark-mode', e.target.checked);
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="settings-group">
                                <div className="settings-item-row">
                                    <label>Enable Notification Sound</label>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.notificationSound}
                                        onChange={(e) => setSettingsData({ ...settingsData, notificationSound: e.target.checked })}
                                    />
                                </div>
                            </div>
                        )}

                        {activeSection === 'maintenance' && (
                            <div className="settings-group">
                                <div className="settings-item-row">
                                    <button onClick={exportData}>Export All Data</button>
                                    <label className="import-btn" style={{ marginLeft: '10px' }}>
                                        <input type="file" onChange={importData} style={{ display: 'none' }} />
                                        Import Data
                                    </label>
                                </div>
                                <div className="settings-item-row">
                                    <button className="danger" onClick={resetToDefaultData}>Reset to Default</button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'developer' && (
                            <div className="settings-group developer-settings-group">
                                <div className="developer-card">
                                    <div className="developer-card-icon">👤</div>
                                    <div className="developer-card-content">
                                        <h5>Developer Profile</h5>
                                        <p>This profile is display-only and is maintained centrally by the system administrator.</p>
                                    </div>
                                </div>
                                <div className="developer-profile-grid">
                                    <div className="developer-profile-row">
                                        <span>Name</span>
                                        <strong>{settingsData.developerName || developerDefaults.name}</strong>
                                    </div>
                                    <div className="developer-profile-row">
                                        <span>Email</span>
                                        <a href={`mailto:${settingsData.developerEmail || developerDefaults.email}`}>
                                            {settingsData.developerEmail || developerDefaults.email}
                                        </a>
                                    </div>
                                    <div className="developer-profile-row">
                                        <span>Website</span>
                                        <a href={settingsData.developerWebsite || developerDefaults.website} target="_blank" rel="noreferrer">
                                            {settingsData.developerWebsite || developerDefaults.website}
                                        </a>
                                    </div>
                                </div>
                                <div className="developer-notes-block">
                                    <div className="developer-notes-label">Developer Notes</div>
                                    <div className="developer-notes-text">
                                        {settingsData.developerNotes || developerDefaults.notes}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'advanced' && (
                            <div className="settings-group user-manual-group">
                                <div className="user-manual-content">
                                    <h5>Dashboard User Manual</h5>
                                    <p>This guide helps you navigate the dashboard and use the main features.</p>
                                    <ul>
                                        <li><strong>General:</strong> Update the system name, default alert level, and archive settings.</li>
                                        <li><strong>Appearance:</strong> Toggle dark mode for a darker interface theme.</li>
                                        <li><strong>Notifications:</strong> Enable or disable notification sound alerts.</li>
                                        <li><strong>Maintenance:</strong> Export or import data and reset the dashboard to default settings.</li>
                                        <li><strong>Developer:</strong> View the developer profile and support contact details.</li>
                                    </ul>
                                    <p>If you need help, open the corresponding tab and follow the labels for the action you want to perform.</p>
                                </div>
                            </div>
                        )}

                        <div className="modal-buttons">
                            <button className="success" onClick={onSaveSettings}>Save Settings</button>
                            <button className="modal-close-footer-btn" onClick={onClose}>Close</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export const RejectEventModal = ({
    isOpen,
    onClose,
    rejectReason,
    setRejectReason,
    confirmRejectEvent
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content">
                <h3>Reject Event</h3>
                <textarea
                    className="reject-reason-textarea"
                    placeholder="Provide reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
                <div className="modal-buttons">
                    <button className="danger" onClick={confirmRejectEvent}>Confirm Rejection</button>
                    <button className="modal-close-footer-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export const ReportRejectModal = ({
    isOpen,
    onClose,
    selectedReport,
    rejectReason,
    setRejectReason,
    confirmRejectReport
}) => {
    if (!isOpen || !selectedReport) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content reject-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Reject Report - {selectedReport.office}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p><strong>Submitted by:</strong> {selectedReport.submittedBy}</p>
                    <p>Please provide a reason for rejecting this report:</p>
                    <textarea
                        className="reject-reason-textarea"
                        placeholder="Enter rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows="4"
                    />
                </div>
                <div className="modal-buttons">
                    <button className="danger" onClick={confirmRejectReport}>Confirm Rejection</button>
                    <button className="modal-close-footer-btn" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export const ImagePreviewModal = ({
    isOpen,
    imageModalSrc,
    onClose
}) => {
    if (!isOpen || !imageModalSrc) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content image-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <img src={imageModalSrc} alt="Enlarged" className="image-modal-img" />
            </div>
        </div>
    );
};

export const ReportSubmissionModal = ({
    isOpen,
    selectedOffice,
    onClose,
    reportFormData,
    setReportFormData,
    newMunicipality,
    setNewMunicipality,
    newSignal,
    setNewSignal,
    handleReportAddMunicipality,
    handleReportSignalChange,
    handleReportRemoveMunicipality,
    handleReportFieldChange,
    reportNewDamage,
    setReportNewDamage,
    editingReportDamageIndex,
    setEditingReportDamageIndex,
    handleReportUpdateDamage,
    handleReportAddDamage,
    handleReportEditDamage,
    handleReportDeleteDamage,
    reportNewEquipment,
    setReportNewEquipment,
    editingReportEquipmentIndex,
    setEditingReportEquipmentIndex,
    handleReportUpdateEquipment,
    handleReportAddEquipment,
    handleReportEditEquipment,
    handleReportDeleteEquipment,
    reportNewStaff,
    setReportNewStaff,
    editingReportStaffIndex,
    setEditingReportStaffIndex,
    handleReportUpdateStaff,
    handleReportAddStaff,
    handleReportEditStaff,
    handleReportDeleteStaff,
    submitReport
}) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>📤 Submit Report - {selectedOffice}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="report-form">
                    <div className="form-section">
                        <h4>📡 Warning Signals</h4>
                        <div className="signal-edit-row">
                            <input type="text" placeholder="New municipality" value={newMunicipality} onChange={(e) => setNewMunicipality(e.target.value)} />
                            <select value={newSignal} onChange={(e) => setNewSignal(parseInt(e.target.value, 10))}>
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
                                <div className="form-group">
                                    <label>Photo</label>
                                    <label className="img-upload-label">
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => setReportNewDamage(prev => ({ ...prev, image: reader.result }));
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }} />
                                        {reportNewDamage.image
                                            ? <img src={reportNewDamage.image} alt="preview" className="img-upload-preview" />
                                            : <span className="img-upload-placeholder">📷 Upload</span>}
                                    </label>
                                    {reportNewDamage.image && (
                                        <button type="button" className="img-remove-btn" onClick={() => setReportNewDamage(prev => ({ ...prev, image: null }))}>✕ Remove</button>
                                    )}
                                </div>
                            </div>
                            <div className="form-buttons">
                                {editingReportDamageIndex !== null ? (
                                    <button className="success" onClick={handleReportUpdateDamage}>Update</button>
                                ) : (
                                    <button className="add-mun-btn" onClick={handleReportAddDamage}>+ Add</button>
                                )}
                                {editingReportDamageIndex !== null && (
                                    <button onClick={() => { setEditingReportDamageIndex(null); setReportNewDamage({ description: '', cost: '', status: 'Reported', image: null }); }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="damage-list">
                            {(reportFormData?.damage_details || []).map((damage, index) => (
                                <div key={index} className="damage-item">
                                    {damage.image && <img src={damage.image} alt="damage" className="damage-item-thumb" />}
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
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Photo</label>
                                    <label className="img-upload-label">
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onload = () => setReportNewEquipment(prev => ({ ...prev, image: reader.result }));
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }} />
                                        {reportNewEquipment.image
                                            ? <img src={reportNewEquipment.image} alt="preview" className="img-upload-preview" />
                                            : <span className="img-upload-placeholder">📷 Upload</span>}
                                    </label>
                                    {reportNewEquipment.image && (
                                        <button type="button" className="img-remove-btn" onClick={() => setReportNewEquipment(prev => ({ ...prev, image: null }))}>✕ Remove</button>
                                    )}
                                </div>
                            </div>
                            <div className="form-buttons">
                                {editingReportEquipmentIndex !== null ? (
                                    <button className="success" onClick={handleReportUpdateEquipment}>Update</button>
                                ) : (
                                    <button className="add-mun-btn" onClick={handleReportAddEquipment}>+ Add</button>
                                )}
                                {editingReportEquipmentIndex !== null && (
                                    <button onClick={() => { setEditingReportEquipmentIndex(null); setReportNewEquipment({ name: '', description: '', cost: '', status: 'Reported', image: null }); }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="damage-list">
                            {(reportFormData?.equipment_details || []).map((equip, index) => (
                                <div key={index} className="damage-item">
                                    {equip.image && <img src={equip.image} alt="equipment" className="damage-item-thumb" />}
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
                                {editingReportStaffIndex !== null && (
                                    <button onClick={() => { setEditingReportStaffIndex(null); setReportNewStaff({ name: '', area: '', assistance: '', status: 'Active' }); }}>
                                        Cancel
                                    </button>
                                )}
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
                        <button className="modal-close-footer-btn" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
