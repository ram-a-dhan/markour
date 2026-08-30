"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { useNotes as useNotesHook } from "@/src/hooks/useNotes";

type INotesContextValue = ReturnType<typeof useNotesHook>;

const NotesContext = createContext<INotesContextValue | null>(null);

export function NotesProvider({ children }: PropsWithChildren) {
  const value = useNotesHook();

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return ctx;
}
