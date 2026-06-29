import React from 'react';

const IconBase = ({ children, viewBox = '0 0 24 24' }) => (
    <svg
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        {children}
    </svg>
);

const DashboardIcon = () => (
    <IconBase>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </IconBase>
);

const TyphoonIcon = () => (
    <IconBase>
        <path d="M6 12h8.5a3.5 3.5 0 1 0-3.2-4.9A4.7 4.7 0 0 0 3 10.4 3.6 3.6 0 0 0 6 17h9" />
        <path d="M15 18.5h6" />
        <path d="M13.5 21h5" />
    </IconBase>
);

const HistoryIcon = () => (
    <IconBase>
        <path d="M3 5h18" />
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4" />
        <path d="M8 10h8M8 14h5" />
    </IconBase>
);

const MapIcon = () => (
    <IconBase>
        <path d="M9 4 3.8 6.2A1.2 1.2 0 0 0 3 7.3v12a1 1 0 0 0 1.4.9L9 18" />
        <path d="M9 4v14" />
        <path d="M15 6v14" />
        <path d="m15 6 5.2-2.2a1 1 0 0 1 1.4.9v12a1.2 1.2 0 0 1-.8 1.1L15 20" />
    </IconBase>
);

const BellIcon = () => (
    <IconBase>
        <path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4c1-1.2 1.7-2.6 1.7-5A6 6 0 0 1 18 9.6c0 2.4.7 3.8 1.7 5a1.5 1.5 0 0 1-1.2 2.4H15" />
        <path d="M9 19a3 3 0 0 0 6 0" />
    </IconBase>
);

const ReportsIcon = () => (
    <IconBase>
        <path d="M8 4h10a2 2 0 0 1 2 2v14H8a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2z" />
        <path d="M10 9h7M10 13h7M10 17h5" />
    </IconBase>
);

const UsersIcon = () => (
    <IconBase>
        <path d="M16 19a4 4 0 0 0-8 0" />
        <circle cx="12" cy="8" r="3" />
        <path d="M19 19a3 3 0 0 0-3-3" />
        <path d="M18 9.5a2.5 2.5 0 1 0 0-5" />
    </IconBase>
);

const SettingsIcon = () => (
    <IconBase>
        <path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z" />
        <path d="M19.4 15.2a1 1 0 0 0 .2 1.1l.1.1a1.8 1.8 0 1 1-2.5 2.5l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1.8 1.8 0 1 1-3.6 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1.8 1.8 0 1 1-2.5-2.5l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1.8 1.8 0 1 1 0-3.6h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1.8 1.8 0 1 1 2.5-2.5l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1.8 1.8 0 1 1 3.6 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a1.8 1.8 0 1 1 2.5 2.5l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1.8 1.8 0 1 1 0 3.6h-.2a1 1 0 0 0-.9.7z" />
    </IconBase>
);

const LogoutIcon = () => (
    <IconBase>
        <path d="M10 17v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1" />
        <path d="M14 16l4-4-4-4" />
        <path d="M8 12h10" />
    </IconBase>
);

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
                    <span className="nav-icon"><DashboardIcon /></span>
                    <span>Dashboard</span>
                </div>
                <div className={`nav-item ${activeMenu === 'typhoon' ? 'active' : ''}`} onClick={() => setActiveMenu('typhoon')}>
                    <span className="nav-icon"><TyphoonIcon /></span>
                    <span>Typhoon</span>
                </div>
                <div className={`nav-item ${activeMenu === 'history' ? 'active' : ''}`} onClick={() => setActiveMenu('history')}>
                    <span className="nav-icon"><HistoryIcon /></span>
                    <span>History</span>
                </div>
                <div className={`nav-item ${activeMenu === 'live-typhoon' ? 'active' : ''}`} onClick={() => setActiveMenu('live-typhoon')}>
                    <span className="nav-icon"><MapIcon /></span>
                    <span>Live Typhoon (Panahon)</span>
                </div>
                <div className={`nav-item ${activeMenu === 'notifications' ? 'active' : ''}`} onClick={() => setActiveMenu('notifications')}>
                    <span className="nav-icon"><BellIcon /></span>
                    <span>Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                </div>
                {canApproveReports && (
                    <div className={`nav-item ${activeMenu === 'pending-reports' ? 'active' : ''}`} onClick={() => setActiveMenu('pending-reports')}>
                        <span className="nav-icon"><ReportsIcon /></span>
                        <span>Pending Reports</span>
                    </div>
                )}
                {canManageUsers && (
                    <div className={`nav-item ${activeMenu === 'users' ? 'active' : ''}`} onClick={() => setActiveMenu('users')}>
                        <span className="nav-icon"><UsersIcon /></span>
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
                        <span className="settings-icon"><SettingsIcon /></span>
                        <span>Settings</span>
                    </div>
                </div>
                <div className="user-actions">
                    <div className="action-item logout" onClick={onLogout}>
                        <span className="settings-icon"><LogoutIcon /></span>
                        <span>Logout</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;
