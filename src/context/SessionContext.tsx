"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";
import { useRouter } from "next/navigation";
import {
  getLastUserId,
  setLastUserId,
  clearAllLocalNotes,
} from "@/src/lib/localdb";
import { HOME_PATH, LOGOUT_API_PATH, SESSION_API_PATH } from "@/src/constants/url";

interface ISessionContextValue {
  user: IUserFE | null;
  isLoadingUser: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<ISessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<ISessionContextValue["user"]>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // fetch user
    (async () => {
      try {
        const response = await fetch(SESSION_API_PATH, { credentials: "include" });
        const result: ISessionContextValue["user"] = response.ok
          ? await response.json()
          : null;

        if (result) {
          // Stale-cache guard: if the last user this device synced for is
          // different from who's logged in now, wipe local notes before
          // anything reads from IndexedDB — prevents cross-account bleed
          // on shared devices or abandoned (non-logged-out) sessions.
          const lastUserId = await getLastUserId();
          if (lastUserId && lastUserId !== result.id) {
            await clearAllLocalNotes();
          }
          await setLastUserId(result.id);
        }

        setUser(result);
      } catch {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    })();
  }, []);

  const logout = useCallback(async () => {
    await fetch(LOGOUT_API_PATH, { method: "POST", credentials: "include" });
    await clearAllLocalNotes();
    setUser(null);
    router.push(HOME_PATH);
    router.refresh();
  }, [router]);

  return (
    <SessionContext.Provider value={{ user, isLoadingUser, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
