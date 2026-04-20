import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { login, logout, isAuthenticated, getTokenPayload } from '../services/authService';

// Mock apiClient
vi.mock('../services/apiClient', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { api } from '../services/apiClient';

const mockPost = vi.mocked(api.post);

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    it('stores token in localStorage and returns it', async () => {
      mockPost.mockResolvedValueOnce({ accessToken: 'test-jwt-token' });

      const token = await login({ username: 'admin', password: 'Admin@123!' });

      expect(token).toBe('test-jwt-token');
      expect(localStorage.getItem('token')).toBe('test-jwt-token');
      expect(mockPost).toHaveBeenCalledWith('/auth/token', {
        username: 'admin',
        password: 'Admin@123!',
      });
    });
  });

  describe('logout', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem('token', 'some-token');

      logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('token', 'some-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('getTokenPayload', () => {
    it('returns null when no token', () => {
      expect(getTokenPayload()).toBeNull();
    });

    it('decodes JWT payload correctly', () => {
      // Create a fake JWT with a known payload
      const payload = { sub: 'admin', role: 'Admin' };
      const encodedPayload = btoa(JSON.stringify(payload));
      const fakeJwt = `header.${encodedPayload}.signature`;
      localStorage.setItem('token', fakeJwt);

      const result = getTokenPayload();

      expect(result).toEqual(payload);
    });

    it('returns null for invalid token', () => {
      localStorage.setItem('token', 'not-a-valid-jwt');

      const result = getTokenPayload();

      expect(result).toBeNull();
    });
  });
});
