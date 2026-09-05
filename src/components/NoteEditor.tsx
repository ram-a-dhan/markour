"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { TableKit } from "@tiptap/extension-table";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions/placeholder";
import styles from "@/src/styles/modules/NoteEditor.module.scss";

const EDITOR_EXTENSIONS = [
  StarterKit,
  Markdown,
  TableKit,
  TaskList,
  TaskItem,
  Placeholder.configure({
    placeholder: "Start Writing...",
  }),
];

type NoteEditorProps = {
  noteId: string;
  content: string;
  onChange: (markdown: string) => void;
  disabled: boolean;
};

export function NoteEditor({ noteId, content, onChange, disabled}: NoteEditorProps) {
  const loadedNoteId = useRef<string | null>(null);

  const editor = useEditor({
    extensions: EDITOR_EXTENSIONS,
    content,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.getMarkdown();
      onChange(markdown);
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (!editor) return;

    if (loadedNoteId.current !== noteId) {
      editor.commands.setContent(content, { contentType: "markdown" });
      loadedNoteId.current = noteId;
    }
  }, [editor, noteId]);

  return (
    <div className="prose dark:prose-invert w-full max-w-full flex-1 overflow-y-auto [&>div]:h-full [&>div>div]:h-full">
      <EditorContent
        editor={editor}
        style={styles}
      />
    </div>
  );
}
