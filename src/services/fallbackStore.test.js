const {
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
} = require('./fallbackStore');

describe('fallback store', () => {
  test('stores offices and returns them in memory', () => {
    const store = createFallbackStore();

    saveFallbackOffice(store, 'PSTO-La Union', { location: 'La Union' });

    expect(getFallbackOffices(store)).toEqual({
      'PSTO-La Union': { location: 'La Union' }
    });
  });

  test('stores events and returns them in memory', () => {
    const store = createFallbackStore();

    saveFallbackEvent(store, { id: 1, title: 'Storm' });

    expect(getFallbackEvents(store)).toEqual([{ id: 1, title: 'Storm' }]);
  });

  test('hydrates the fallback store from backup payload data', () => {
    const store = createFallbackStore();

    hydrateFallbackStore(store, {
      officesData: {
        'PSTO-La Union': { location: 'La Union' }
      },
      events: [{ id: 2, title: 'Typhoon' }]
    });

    expect(getFallbackOffices(store)).toEqual({
      'PSTO-La Union': { location: 'La Union' }
    });
    expect(getFallbackEvents(store)).toEqual([{ id: 2, title: 'Typhoon' }]);
  });

  test('stores users and settings in memory', () => {
    const store = createFallbackStore();

    saveFallbackUser(store, { id: 1, name: 'Ana' });
    saveFallbackSettings(store, { theme: 'dark' });
    setFallbackActiveMenu(store, 'reports');

    expect(getFallbackUsers(store)).toEqual([{ id: 1, name: 'Ana' }]);
    expect(getFallbackSettings(store)).toEqual({ theme: 'dark' });
    expect(getFallbackActiveMenu(store)).toBe('reports');
  });
});
