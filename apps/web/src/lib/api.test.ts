import { apiFetch } from './api';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('apiFetch', () => {
  beforeEach(() => {
    localStorageMock.clear();
    mockFetch.mockReset();
  });

  it('should call fetch with correct URL', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: [], error: null }) });
    await apiFetch('/features');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/features'),
      expect.any(Object),
    );
  });

  it('should include Authorization header when token exists', async () => {
    localStorageMock.setItem('token', 'test-jwt-token');
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: null, error: null }) });
    await apiFetch('/features');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token',
        }),
      }),
    );
  });

  it('should not include Authorization header when no token', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: null, error: null }) });
    await apiFetch('/features');
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.headers.Authorization).toBeUndefined();
  });

  it('should set Content-Type to application/json', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: null, error: null }) });
    await apiFetch('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should pass through additional options', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({ data: null, error: null }) });
    await apiFetch('/test', { method: 'POST', body: JSON.stringify({ name: 'x' }) });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'x' }),
      }),
    );
  });

  it('should return parsed JSON response', async () => {
    const response = { data: { id: '1' }, error: null };
    mockFetch.mockResolvedValue({ json: () => Promise.resolve(response) });
    const result = await apiFetch('/test');
    expect(result).toEqual(response);
  });
});
