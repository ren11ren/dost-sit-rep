import dbService, { getApiBaseUrl } from './dbService';

describe('getApiBaseUrl', () => {
  const originalApiUrl = process.env.REACT_APP_API_URL;
  const originalApiPort = process.env.REACT_APP_API_PORT;

  afterEach(() => {
    if (typeof originalApiUrl === 'undefined') {
      delete process.env.REACT_APP_API_URL;
    } else {
      process.env.REACT_APP_API_URL = originalApiUrl;
    }

    if (typeof originalApiPort === 'undefined') {
      delete process.env.REACT_APP_API_PORT;
    } else {
      process.env.REACT_APP_API_PORT = originalApiPort;
    }
  });

  test('defaults to a same-origin /api path for hosted deployments', () => {
    expect(getApiBaseUrl('example.com')).toBe('/api');
  });

  test('uses a configured API URL when provided', () => {
    process.env.REACT_APP_API_URL = 'https://api.example.com';
    expect(getApiBaseUrl('example.com')).toBe('https://api.example.com');
  });
});

describe('pending report syncing', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  test('sends pending reports as a reports payload to the backend', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });

    await dbService.savePendingReports([{ id: 7, office: 'PSTO-La Union', data: { remark: 'ok' } }]);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/pending-reports'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ reports: [{ id: 7, office: 'PSTO-La Union', data: { remark: 'ok' } }] })
      })
    );
  });
});
