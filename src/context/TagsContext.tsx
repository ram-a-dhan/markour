"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { useTags as useTagsHook } from "@/src/hooks/useTags";

type ITagsContextValue = ReturnType<typeof useTagsHook>;

const TagsContext = createContext<ITagsContextValue | null>(null);

export function TagsProvider({ children }: PropsWithChildren) {
  const value = useTagsHook();

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
}

export function useTags() {
  const ctx = useContext(TagsContext);
  if (!ctx) {
    throw new Error("useTags must be used within a TagsProvider");
  }
  return ctx;
}
