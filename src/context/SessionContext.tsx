"use client";

import { createContext, useContext, type PropsWithChildren,} from "react";
import { useSession as useSessionHook } from "@/src/hooks/useSession";

type ISessionContextValue = ReturnType<typeof useSessionHook>;

const SessionContext = createContext<ISessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const value = useSessionHook();

  return (
    <SessionContext.Provider value={value}>
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
