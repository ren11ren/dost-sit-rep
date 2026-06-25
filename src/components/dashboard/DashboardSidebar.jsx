import React from 'react';

const DashboardSidebar = ({
    activeMenu,
    setActiveMenu,
    unreadCount,
    canApproveReports,
    canManageUsers,
    currentUser,
    isSuperAdmin,
    isAdmin,
    onOpenSettings,
    onLogout
}) => {
    return (
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
                    <div className="settings-item" onClick={onOpenSettings}>
                        <span className="settings-icon">⚙️</span>
                        <span>Settings</span>
                    </div>
                </div>
                <div className="user-actions">
                    <div className="action-item logout" onClick={onLogout}>🚪 Logout</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;
