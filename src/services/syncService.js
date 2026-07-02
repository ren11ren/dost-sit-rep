import dbService from './dbService';

class SyncService {
  constructor() {
    this.lastSyncTime = null;
    this.syncInterval = null;
    this.listeners = [];
    this.isSyncing = false;
  }

  startAutoSync() {
    if (this.syncInterval) clearInterval(this.syncInterval);

    this.syncInterval = setInterval(() => {
      this.syncData();
    }, 10000); // Sync every 10 seconds for near-real-time updates
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async syncData() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    console.log('🔄 Syncing data...');

    try {
      const [offices, events, users, reports, notifications, activeMenu, typhoonHistory] = await Promise.all([
        dbService.getOfficesData(),
        dbService.getEvents(),
        dbService.getUsers(),
        dbService.getPendingReports(),
        dbService.getNotifications(),
        dbService.getActiveMenu(),
        dbService.getTyphoonHistory()
      ]);

      this.lastSyncTime = new Date();

      this.listeners.forEach(listener => {
        listener({
          offices: offices || {},
          events: events || [],
          users: users || [],
          reports: reports || [],
          notifications: notifications || [],
          activeMenu: activeMenu || 'dashboard',
          typhoonHistory: Array.isArray(typhoonHistory) ? typhoonHistory : [],
          timestamp: this.lastSyncTime
        });
      });

      console.log('✅ Sync complete at', this.lastSyncTime.toLocaleTimeString());
      return { offices, events, users, reports, notifications, activeMenu, typhoonHistory };

    } catch (error) {
      console.error('❌ Sync failed:', error);
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  onSync(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  getLastSyncTime() {
    return this.lastSyncTime;
  }
}

export default new SyncService();
