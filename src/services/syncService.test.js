import syncService from './syncService';
import dbService from './dbService';

jest.mock('./dbService', () => ({
    __esModule: true,
    default: {
        getOfficesData: jest.fn(),
        getEvents: jest.fn(),
        getUsers: jest.fn(),
        getPendingReports: jest.fn(),
        getNotifications: jest.fn(),
        getActiveMenu: jest.fn(),
        getTyphoonHistory: jest.fn(),
    },
}));

describe('syncService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        syncService.listeners = [];
        syncService.stopAutoSync();
        syncService.lastSyncTime = null;
    });

    it('includes history and active menu in sync payloads', async () => {
        dbService.getOfficesData.mockResolvedValue({ office: {} });
        dbService.getEvents.mockResolvedValue([]);
        dbService.getUsers.mockResolvedValue([]);
        dbService.getPendingReports.mockResolvedValue([]);
        dbService.getNotifications.mockResolvedValue([]);
        dbService.getActiveMenu.mockResolvedValue('history');
        dbService.getTyphoonHistory.mockResolvedValue([{ id: 1, name: 'Test Event' }]);

        const listener = jest.fn();
        syncService.onSync(listener);

        const result = await syncService.syncData();

        expect(result.activeMenu).toBe('history');
        expect(result.typhoonHistory).toEqual([{ id: 1, name: 'Test Event' }]);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            activeMenu: 'history',
            typhoonHistory: [{ id: 1, name: 'Test Event' }],
        }));
    });
});
