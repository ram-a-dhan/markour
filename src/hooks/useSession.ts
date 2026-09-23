import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetcher } from "@/src/lib/fetcher";
import {
  clearAllLocalNotes,
  getLastUserId,
  setLastUserId,
} from "@/src/lib/localdb";
import {
  HOME_PATH,
  LOGOUT_API_PATH,
  SESSION_API_PATH,
} from "@/src/constants/url";
import { REQUEST_METHOD } from "@/src/constants/misc";

export function useSession() {
  const [user, setUser] = useState<IUserFE | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const router = useRouter();

  useEffect(() => {
    // fetch user
    (async () => {
      try {
        const response = await fetcher<IUserFE | null>(SESSION_API_PATH);
        const sessionUser = response.data;

        if (sessionUser) {
          // Stale-cache guard: if the last user this device synced for is
          // different from who's logged in now, wipe local notes before
          // anything reads from IndexedDB — prevents cross-account bleed
          // on shared devices or abandoned (non-logged-out) sessions.
          const lastUserId = await getLastUserId();
          if (lastUserId && lastUserId !== sessionUser.id) {
            await clearAllLocalNotes();
          }
          await setLastUserId(sessionUser.id);
        }

        setUser(sessionUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    })();
  }, []);

  const logout = useCallback(async () => {
    await fetcher(LOGOUT_API_PATH, {
      method: REQUEST_METHOD.POST,
    });
    await clearAllLocalNotes();
    setUser(null);
    router.push(HOME_PATH);
    router.refresh();
  }, [router]);

  return { user, isLoadingUser, logout };
}
