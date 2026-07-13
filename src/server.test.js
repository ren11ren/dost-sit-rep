const fs = require('fs');
const path = require('path');
const { createFallbackStore, loadFallbackStore } = require('../server');

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

    test('persists fallback data to disk so it survives restarts', () => {
        const tempFile = path.join(__dirname, '..', '.tmp-fallback-store.json');
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        const store = createFallbackStore({ persistToFile: tempFile });
        store.events.push({ id: 99, name: 'Test event' });

        const reloaded = loadFallbackStore(tempFile);

        expect(reloaded.events).toEqual(expect.arrayContaining([expect.objectContaining({ id: 99 })]));
        fs.unlinkSync(tempFile);
    });
});
