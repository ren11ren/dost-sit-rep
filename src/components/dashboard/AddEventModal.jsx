// AddEventModal.js - Complete Component with Simple Emojis

import React from 'react';

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
    if (!isOpen) return null;

    const handleProvinceToggle = (province) => {
        setNewEvent(prev => {
            const provinces = prev.provinces.includes(province)
                ? prev.provinces.filter(p => p !== province)
                : [...prev.provinces, province];
            return { ...prev, provinces };
        });
    };

    const handleSelectAllProvinces = () => {
        setNewEvent(prev => ({
            ...prev,
            provinces: [...allProvinces],
            sendToAllUsers: true
        }));
    };

    const handleDeselectAllProvinces = () => {
        setNewEvent(prev => ({
            ...prev,
            provinces: [],
            sendToAllUsers: false
        }));
    };

    const isFormValid = () => {
        return newEvent.name.trim() !== '';
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-event-modal" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="modal-header">
                    <h3>{isEditingEvent ? '✏️ Edit Event' : '➕ Add New Event'}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Modal Body */}
                <div className="modal-body add-event-body">
                    {/* Basic Information Section */}
                    <div className="form-section">
                        <h4 className="form-section-title">📋 Basic Information</h4>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Event Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g., Typhoon Ketsana"
                                    value={newEvent.name}
                                    onChange={(e) => handleNewEventFieldChange('name', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    value={newEvent.category}
                                    onChange={(e) => handleNewEventFieldChange('category', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Tropical Depression">Tropical Depression</option>
                                    <option value="Tropical Storm">Tropical Storm</option>
                                    <option value="Severe Tropical Storm">Severe Tropical Storm</option>
                                    <option value="Typhoon">Typhoon</option>
                                    <option value="Super Typhoon">Super Typhoon</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Alert Level</label>
                                <select
                                    value={newEvent.alertLevel}
                                    onChange={(e) => handleNewEventFieldChange('alertLevel', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">Select Alert Level</option>
                                    <option value="WHITE">White</option>
                                    <option value="BLUE">Blue</option>
                                    <option value="RED">Red</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Deployment Status</label>
                                <select
                                    value={newEvent.deployment}
                                    onChange={(e) => handleNewEventFieldChange('deployment', e.target.value)}
                                    className="form-select"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Deployed">Deployed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date & Time Section */}
                    <div className="form-section">
                        <h4 className="form-section-title">📅 Date & Time</h4>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date/Time</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.startDateTime}
                                    onChange={(e) => handleNewEventFieldChange('startDateTime', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date/Time</label>
                                <input
                                    type="datetime-local"
                                    value={newEvent.endDateTime}
                                    onChange={(e) => handleNewEventFieldChange('endDateTime', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Track & Intensity Section */}
                    <div className="form-section">
                        <h4 className="form-section-title">📍 Track & Intensity</h4>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Track Positions</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 13.9N 121.2E - 13.9N 122.1E"
                                    value={newEvent.trackPositions}
                                    onChange={(e) => handleNewEventFieldChange('trackPositions', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Intensity</label>
                                <input
                                    type="text"
                                    placeholder="e.g., 95 km/h / 52 ft"
                                    value={newEvent.intensity}
                                    onChange={(e) => handleNewEventFieldChange('intensity', e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Affected Areas Section */}
                    <div className="form-section">
                        <h4 className="form-section-title">📍 Affected Areas</h4>

                        <div className="affected-areas-controls">
                            <button
                                type="button"
                                className="select-all-btn"
                                onClick={handleSelectAllProvinces}
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                className="deselect-all-btn"
                                onClick={handleDeselectAllProvinces}
                            >
                                Deselect All
                            </button>
                            <span className="selected-count">
                                {newEvent.provinces.length} of {allProvinces.length} selected
                            </span>
                        </div>

                        <div className="province-grid">
                            {allProvinces.map(province => (
                                <div
                                    key={province}
                                    className={`province-chip ${newEvent.provinces.includes(province) ? 'selected' : ''}`}
                                    onClick={() => handleProvinceToggle(province)}
                                >
                                    <span className="province-chip-icon">
                                        {newEvent.provinces.includes(province) ? '✓' : '○'}
                                    </span>
                                    <span className="province-chip-name">{province}</span>
                                </div>
                            ))}
                        </div>

                        {newEvent.provinces.length === 0 && (
                            <p className="no-provinces-selected">No provinces selected. Please select at least one province.</p>
                        )}
                    </div>

                    {/* Report Link Section */}
                    <div className="form-section">
                        <h4 className="form-section-title">🔗 Report Link</h4>
                        <div className="form-group">
                            <label>Report URL</label>
                            <input
                                type="url"
                                placeholder="https://example.com/report"
                                value={newEvent.reportLink}
                                onChange={(e) => handleNewEventFieldChange('reportLink', e.target.value)}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="form-section">
                        <h4 className="form-section-title">🖼️ Event Image</h4>
                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                type="url"
                                placeholder="https://example.com/image.jpg"
                                value={newEvent.imageUrl}
                                onChange={(e) => handleNewEventFieldChange('imageUrl', e.target.value)}
                                className="form-input"
                            />
                        </div>
                        {newEvent.imageUrl && (
                            <div className="image-preview-container">
                                <img
                                    src={newEvent.imageUrl}
                                    alt="Event preview"
                                    className="event-image-preview"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-buttons">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-save"
                        onClick={handleAddEvent}
                        disabled={!isFormValid()}
                    >
                        {isEditingEvent ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEventModal;