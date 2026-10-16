import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { authService } from "../services/auth";
import { SESSION_EXPIRED_EVENT, tokenStore } from "../services/token";
import { userService } from "../services/users";
import type { ProfileUpdate, RegisterInput, User } from "../types";
import { AuthContext } from "./contexts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Sahifa yangilanganda saqlangan token bilan foydalanuvchini tiklash: GET /auth/me
  useEffect(() => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => tokenStore.clear())
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    const onExpired = () => setUser(null);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(async (login: string, password: string) => {
    const me = await authService.login(login, password);
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const me = await authService.register(input);
    setUser(me);
    return me;
  }, []);

  const updateProfile = useCallback(async (patch: ProfileUpdate) => {
    const me = await userService.update(patch);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, updateProfile, logout }),
    [user, ready, login, register, updateProfile, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
