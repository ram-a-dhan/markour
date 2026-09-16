import { createContext, useContext, type PropsWithChildren } from "react";
import { useEditor as useEditorHook } from "@/src/hooks/useEditor";

type IEditorContextValue = ReturnType<typeof useEditorHook>;

const EditorContext = createContext<IEditorContextValue | null>(null);

export function EditorProvider({ children }: PropsWithChildren) {
  const value = useEditorHook();

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return ctx;
}