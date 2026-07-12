const { createFallbackStore } = require('../server');

describe('fallback store', () => {
    test('creates a usable default store when the database is unavailable', () => {
        const store = createFallbackStore();

        expect(store.users).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    email: 'admin@dostregion1.ph',
                    role: 'SADMIN',
                    status: 'Active'
                })
            ])
        );
        expect(store.settings[0].setting_value).toBe(JSON.stringify('dashboard'));
        expect(store.events).toEqual([]);
    });
});
