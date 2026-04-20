import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as authService from '../services/authService';
import type { TokenRequest } from '../types/api';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  role: string | null;
  login: (creds: TokenRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export function AuthProvider({ children }: { children: ReactNode }) {
  const payload = authService.getTokenPayload();
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
  const [username, setUsername] = useState(payload?.sub ?? null);
  const [role, setRole] = useState(payload?.[ROLE_CLAIM] ?? null);

  const login = useCallback(async (creds: TokenRequest) => {
    await authService.login(creds);
    const p = authService.getTokenPayload();
    setIsLoggedIn(true);
    setUsername(p?.sub ?? null);
    setRole(p?.[ROLE_CLAIM] ?? null);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsLoggedIn(false);
    setUsername(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
