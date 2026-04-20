import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLatestRates, convertCurrency, getHistory } from '../services/ratesService';

// Mock apiClient
vi.mock('../services/apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '../services/apiClient';

const mockGet = vi.mocked(api.get);
const mockPost = vi.mocked(api.post);

describe('ratesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLatestRates', () => {
    it('calls GET with correct URL and default base', async () => {
      mockGet.mockResolvedValueOnce({ base: 'EUR', date: '2024-01-15', rates: {} });

      await getLatestRates();

      expect(mockGet).toHaveBeenCalledWith('/rates/latest?base_=EUR');
    });

    it('calls GET with custom base currency', async () => {
      mockGet.mockResolvedValueOnce({ base: 'USD', date: '2024-01-15', rates: {} });

      await getLatestRates('USD');

      expect(mockGet).toHaveBeenCalledWith('/rates/latest?base_=USD');
    });
  });

  describe('convertCurrency', () => {
    it('calls POST with correct URL and body', async () => {
      const request = { amount: 100, from: 'USD', to: 'EUR' };
      mockPost.mockResolvedValueOnce({
        amount: 100,
        from: 'USD',
        to: 'EUR',
        convertedAmount: 92,
      });

      await convertCurrency(request);

      expect(mockPost).toHaveBeenCalledWith('/rates/convert', request);
    });
  });

  describe('getHistory', () => {
    it('calls GET with correct URL and all parameters', async () => {
      mockGet.mockResolvedValueOnce({
        base: 'EUR',
        rates: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      });

      await getHistory('EUR', '2024-01-01', '2024-01-31', 2, 20);

      expect(mockGet).toHaveBeenCalledWith(
        '/rates/history?base_=EUR&start=2024-01-01&end=2024-01-31&page=2&pageSize=20',
      );
    });

    it('uses default page and pageSize', async () => {
      mockGet.mockResolvedValueOnce({
        base: 'EUR',
        rates: [],
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0,
      });

      await getHistory('EUR', '2024-01-01', '2024-01-31');

      expect(mockGet).toHaveBeenCalledWith(
        '/rates/history?base_=EUR&start=2024-01-01&end=2024-01-31&page=1&pageSize=10',
      );
    });
  });
});
