"use client";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame-dark.css";

import { useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx, prosePluginsCtx, remarkStringifyOptionsCtx } from "@milkdown/kit/core";
import { remarkPreserveEmptyLinePlugin } from "@milkdown/kit/preset/commonmark";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { Plugin, PluginKey, Selection } from "@milkdown/kit/prose/state";
import { DOMParser as ProseDOMParser } from "@milkdown/kit/prose/model";
import { type EditorView } from "@milkdown/kit/prose/view";
import { replaceAll } from "@milkdown/kit/utils";
import { useEditor } from "@/src/context/EditorContext";
import styles from "@/src/styles/modules/NoteEditor.module.scss";

interface INoteEditorProps {
  noteId: string;
  content: string;
  onChange: (markdown: string) => void;
  disabled: boolean;
};

export default function NoteEditor({
  noteId,
  content,
  onChange,
  disabled,
}: INoteEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const crepeRef = useRef<Crepe | null>(null);
  const loadedNoteId = useRef<string | null>(null);
  const lastKnownMarkdownRef = useRef<string>(content); // tracks current content without needing getMarkdown
  const suppressNextUpdateRef = useRef<boolean>(false);

  const { setEditor } = useEditor();

  const handlePaste = (view: EditorView, event: ClipboardEvent) => {
    const cb = event.clipboardData;
    if (!cb) return false;
    
    const hasFiles = cb.files.length > 0;
    const hasHtml = Array.from(cb.types).includes('text/html');

    // If there is a file in the clipboard
    if (hasFiles) {
      event.preventDefault(); // Stop Crepe's default upload loading state

      // If it also has HTML (meaning it was copied from a web browser)
      if (hasHtml) {
        const html = cb.getData('text/html');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Use ProseMirror's built-in parser to safely convert the web HTML into an editor image
        const slice = ProseDOMParser.fromSchema(view.state.schema).parseSlice(tempDiv);
        const tr = view.state.tr.replaceSelection(slice);
        view.dispatch(tr);
        // Local files are dropped entirely. Web images are pasted via the HTML parser above.
      } else {
        notifications.show({
          color: "red",
          title: "Failed Pasting File",
          message: "File uploads are not allowed.",
        });
      }

      return true; // Return true to stop the event chain. 
    }

    return false; // Let standard text/URLs pass through normally
  };

  const handleDrop = (view: EditorView, event: DragEvent) => {
    const dt = event.dataTransfer;
    if (!dt) return false;

    const hasFiles = dt.files.length > 0;
    const hasHtml = Array.from(dt.types).includes('text/html');

    if (hasFiles) {
      event.preventDefault();

      if (hasHtml) {
        const html = dt.getData('text/html');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // For drop events, we have to calculate exactly where the mouse let go of the drag
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (pos) {
          const slice = ProseDOMParser.fromSchema(view.state.schema).parseSlice(tempDiv);
          const tr = view.state.tr.insert(pos.pos, slice.content);
          view.dispatch(tr);
        }
      } else {
        notifications.show({
          color: "red",
          title: "Failed Drag & Drop File",
          message: "File uploads are not allowed.",
        });
      }

      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!rootRef.current) return;
    if (!noteId) setEditor(null);

    let destroyed = false;
    let needsInitalParse = (/\- |1. /m).test(content);

    const crepe = new Crepe({
      root: rootRef.current,
      defaultValue: content,
      featureConfigs: {
        [Crepe.Feature.BlockEdit]: {
          blockHandle: {
            root: { hidden: true },
          },
        },
        [Crepe.Feature.Placeholder]: {
          text: "Start writing or type \"/\" for commands...",
        },
      },
    });

    crepe.editor
      .config((ctx) => {
        ctx.update(prosePluginsCtx, (plg) => [
          ...plg,
          new Plugin({
            key: new PluginKey("block-file-paste-drop"),
            props: { handlePaste, handleDrop },
          }),
        ]);

        ctx.update(remarkStringifyOptionsCtx, (cfg) => ({
          ...cfg,
          bullet: "-" as const, // Milkdown's default is "*"
          rule: "-" as const,
        }));

        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (needsInitalParse) {
            needsInitalParse = false; // This skips the initial parse/normalization firing, not a real edit.
            lastKnownMarkdownRef.current = markdown;
            return;
          }
          if (suppressNextUpdateRef.current) {
            suppressNextUpdateRef.current = false;
            lastKnownMarkdownRef.current = markdown;
            return;
          }
          if (markdown !== prevMarkdown) {
            lastKnownMarkdownRef.current = markdown;
            onChange(markdown);
          }
        });
      })
      .use(listener); 
      
    // stops the stray <br /> insertion on blank lines
    crepe.editor.remove(remarkPreserveEmptyLinePlugin);

    crepe.create().then(() => {
      if (destroyed) {
        crepe.destroy();
        return;
      };
      loadedNoteId.current = noteId;
      crepe.setReadonly(!!disabled);
      setEditor(crepe.editor);
    });

    crepeRef.current = crepe;

    return () => {
      destroyed = true;
      crepe.destroy();
      crepeRef.current = null;
      setEditor(null);
    };
    // recreate per note switch
    // Crepe doesn't cleanly support swapping `defaultValue` post-creation
  }, [noteId]);

  useEffect(() => {
    crepeRef.current?.setReadonly(!!disabled);
  }, [disabled]);


  useEffect(() => {
    const crepe = crepeRef.current;
    if (!crepe) return;
    if (loadedNoteId.current !== noteId) return;
    if (content === lastKnownMarkdownRef.current) return; // no real change, avoid pointless replace + cursor reset

    crepe.editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      // Only skip if the user is BOTH focused on this editor's DOM node
      // AND the browser tab itself is actually active — otherwise
      // view.hasFocus() can stay stuck `true` after switching tabs,
      // since browsers don't blur the last-focused element on tab switch.
      if (view.hasFocus() && document.hasFocus()) return;

      const prevSelection = view.state.selection;
      const prevAnchor = prevSelection.anchor;

      // lastKnownMarkdownRef is now updated by the listener above, since
      // replaceAll's markdownUpdated firing will hit the suppression branch.
      suppressNextUpdateRef.current = true;
      replaceAll(content)(ctx);

      // Restore roughly where the cursor was, clamped to the new doc's
      // length, so returning to this tab doesn't land at the very end.
      const newDoc = view.state.doc;
      const safeAnchor = Math.min(prevAnchor, newDoc.content.size);
      const tr = view.state.tr.setSelection(Selection.near(newDoc.resolve(safeAnchor)));
      view.dispatch(tr);
    });
  }, [content, noteId]);

  return <div ref={rootRef} className="h-full flex-1 overflow-y-auto" style={styles} />;
}
