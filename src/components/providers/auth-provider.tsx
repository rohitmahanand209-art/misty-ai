"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { DemoUser } from "@/lib/demo-data";
import {
  getSession,
  getUsers,
  makeSessionUser,
  setSession,
  subscribeStore,
  upsertUser,
} from "@/lib/demo-store";

type AuthResult = { ok: boolean; error?: string; user?: DemoUser };

type AuthContextValue = {
  user: DemoUser | null;
  ready: boolean;
  signIn: (email: string, password: string) => AuthResult;
  signUp: (name: string, email: string, password: string) => AuthResult;
  signOut: () => void;
  updateUser: (patch: Partial<DemoUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setUser(getSession());
      setReady(true);
    };
    sync();
    return subscribeStore(sync);
  }, []);

  const signIn = useCallback((email: string, password: string): AuthResult => {
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const sessionUser = makeSessionUser("", normalized, password);
    const exists = getUsers().some(
      (item) => item.email.toLowerCase() === normalized,
    );
    if (!exists) upsertUser(sessionUser);
    setSession(sessionUser);
    return { ok: true, user: sessionUser };
  }, []);

  const signUp = useCallback(
    (name: string, email: string, password: string): AuthResult => {
      const normalized = email.trim().toLowerCase();
      if (name.trim().length < 2) {
        return { ok: false, error: "Please enter your name." };
      }
      if (!EMAIL_RE.test(normalized)) {
        return { ok: false, error: "Enter a valid email address." };
      }
      if (password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
      }
      const sessionUser = makeSessionUser(name, normalized, password);
      upsertUser(sessionUser);
      setSession(sessionUser);
      return { ok: true, user: sessionUser };
    },
    [],
  );

  const signOut = useCallback(() => {
    setSession(null);
  }, []);

  const updateUser = useCallback((patch: Partial<DemoUser>) => {
    const current = getSession();
    if (!current) return;
    const next = { ...current, ...patch };
    upsertUser(next);
    setSession(next);
  }, []);

  const value = useMemo(
    () => ({ user, ready, signIn, signUp, signOut, updateUser }),
    [user, ready, signIn, signUp, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
