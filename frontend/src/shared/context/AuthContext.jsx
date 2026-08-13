import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loginUser,
  registerUser,
  loginWithGoogle,
  getStoredSession,
  clearStoredSession,
  persistSession,
} from '../../modules/participant/services/authService';
import { AuthContext } from './AuthContextBase.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (session) setUser(session);
    setIsInitializing(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const register = useCallback(async (details) => {
    const res = await registerUser(details);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const loginGoogle = useCallback(async (credential) => {
    const res = await loginWithGoogle(credential);
    if (res.success) setUser(res.data);
    return res;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      persistSession(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      register,
      loginGoogle,
      logout,
      updateUser,
    }),
    [user, isInitializing, login, register, loginGoogle, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
