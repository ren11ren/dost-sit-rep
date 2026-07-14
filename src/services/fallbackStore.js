const createFallbackStore = () => ({
  offices: {},
  events: [],
  users: [],
  settings: {},
  activeMenu: 'dashboard'
});

const hydrateFallbackStore = (store, payload = {}) => {
  if (!store) return;

  if (payload.officesData && typeof payload.officesData === 'object') {
    Object.entries(payload.officesData).forEach(([officeName, data]) => {
      saveFallbackOffice(store, officeName, data);
    });
  }

  if (Array.isArray(payload.events)) {
    payload.events.forEach((event) => saveFallbackEvent(store, event));
  }
};

const saveFallbackOffice = (store, officeName, data) => {
  if (!store) return;
  store.offices = {
    ...(store.offices || {}),
    [officeName]: data
  };
};

const getFallbackOffices = (store) => ({ ...(store?.offices || {}) });

const saveFallbackEvent = (store, event) => {
  if (!store) return;
  const nextEvents = [...(store.events || [])];
  const index = nextEvents.findIndex((item) => item && item.id === event?.id);
  if (index >= 0) {
    nextEvents[index] = event;
  } else {
    nextEvents.push(event);
  }
  store.events = nextEvents;
};

const getFallbackEvents = (store) => [...(store?.events || [])];

const saveFallbackUser = (store, user) => {
  if (!store) return;
  const nextUsers = [...(store.users || [])];
  const index = nextUsers.findIndex((item) => item && item.id === user?.id);
  if (index >= 0) {
    nextUsers[index] = user;
  } else {
    nextUsers.push(user);
  }
  store.users = nextUsers;
};

const getFallbackUsers = (store) => [...(store?.users || [])];

const saveFallbackSettings = (store, settings = {}) => {
  if (!store) return;
  store.settings = { ...(store.settings || {}), ...settings };
};

const getFallbackSettings = (store) => ({ ...(store?.settings || {}) });

const setFallbackActiveMenu = (store, menu) => {
  if (!store) return;
  store.activeMenu = menu || 'dashboard';
};

const getFallbackActiveMenu = (store) => store?.activeMenu || 'dashboard';

module.exports = {
  createFallbackStore,
  hydrateFallbackStore,
  saveFallbackOffice,
  getFallbackOffices,
  saveFallbackEvent,
  getFallbackEvents,
  saveFallbackUser,
  getFallbackUsers,
  saveFallbackSettings,
  getFallbackSettings,
  setFallbackActiveMenu,
  getFallbackActiveMenu
};
