export const getApiBaseUrl = (hostname = window.location.hostname) => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return `http://${hostname}:${process.env.REACT_APP_API_PORT || '5010'}/api`;
  }

  return '/api';
};

const API_URL = getApiBaseUrl();

const apiCall = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data !== null && typeof data !== 'undefined') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
};

export const dbService = {
  async getOfficesData() {
    const result = await apiCall('/offices');
    if (Array.isArray(result)) {
      return result.reduce((map, row) => {
        const key = row.office_name || row.officeName || row.office || null;
        if (key) {
          map[key] = row;
        }
        return map;
      }, {});
    }
    return result || {};
  },
  async saveOfficesData(officesData) { return await apiCall('/offices', 'POST', officesData); },
  async getEvents() { return await apiCall('/events'); },
  async saveEvents(events) { return await apiCall('/events', 'POST', events); },
  async getUsers() { return await apiCall('/users'); },
  async saveUsers(users) { return await apiCall('/users', 'POST', users); },
  async getPendingReports() { return await apiCall('/pending-reports'); },
  async savePendingReports(reports) { return await apiCall('/pending-reports', 'POST', { reports }); },
  async getNotifications() { return await apiCall('/notifications'); },
  async saveNotifications(notifications) { return await apiCall('/notifications', 'POST', notifications); },
  async getActiveMenu() { const result = await apiCall('/active-menu'); return result?.menu || 'dashboard'; },
  async saveActiveMenu(menu) { return await apiCall('/active-menu', 'POST', { menu }); },
  async getTyphoonHistory() { return await apiCall('/typhoon-history'); },
  async saveTyphoonHistory(history) { return await apiCall('/typhoon-history', 'POST', history); },
  async syncAllData(data) { return await apiCall('/sync-all', 'POST', data); }
};

export default dbService;
