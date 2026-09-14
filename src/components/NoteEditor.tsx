"use client";

import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame-dark.css";

import { useEffect, useRef } from "react";
import { notifications } from "@mantine/notifications";
import { Crepe } from "@milkdown/crepe";
import { prosePluginsCtx, remarkStringifyOptionsCtx } from "@milkdown/kit/core";
import { remarkPreserveEmptyLinePlugin } from "@milkdown/kit/preset/commonmark";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { DOMParser as ProseDOMParser } from "@milkdown/kit/prose/model";
import { type EditorView } from "@milkdown/kit/prose/view";
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
          text: "Start writing...",
        },
      },
    });

    crepe.editor
      .config((ctx) => {
        ctx.update(prosePluginsCtx, (plg) => [
          ...plg,
          new Plugin({
            key: new PluginKey("block-file-paste-drop"),
            props: {
              handlePaste,
              handleDrop,
            },
          }),
        ]);

        ctx.update(remarkStringifyOptionsCtx, (cfg) => ({
          ...cfg,
          bullet: "-" as const, // Milkdown's default is "*"
        }));

        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prevMarkdown) => {
          if (needsInitalParse) {
            needsInitalParse = false;
            // This skips the initial parse/normalization firing, not a real edit.
            return;
          }
          if (markdown !== prevMarkdown) {
            onChange(markdown);
          }
        });
      })
      .use(listener); 
      
    // stops the stray <br /> insertion on blank lines
    crepe.editor.remove(remarkPreserveEmptyLinePlugin);

    crepe.create().then(() => {
      loadedNoteId.current = noteId;
      crepe.setReadonly(!!disabled);
    });

    crepeRef.current = crepe;

    return () => {
      crepe.destroy();
      crepeRef.current = null;
    };
    // recreate per note switch
    // Crepe doesn't cleanly support swapping `defaultValue` post-creation
  }, [noteId]);

  useEffect(() => {
    crepeRef.current?.setReadonly(!!disabled);
  }, [disabled]);

  return <div ref={rootRef} className="h-full flex-1 overflow-y-auto" style={styles} />;
}
