"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import styles from "@/src/styles/modules/NoteEditor.module.scss";

type NoteEditorProps = {
  noteId: string;
  content: string;
  onChange: (markdown: string) => void;
};

export function NoteEditor({ noteId, content, onChange }: NoteEditorProps) {
  const loadedNoteId = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content,
    contentType: "markdown",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "focus:outline-none h-full flex-1 m-0!",
      },
    },
    onUpdate: ({ editor }) => {
      if (!editor.markdown) return;
      const markdown = editor.markdown.serialize(editor.getJSON());
      onChange(markdown);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (loadedNoteId.current !== noteId) {
      editor.commands.setContent(content, { contentType: "markdown" });
      loadedNoteId.current = noteId;
    }
  }, [editor, noteId, content]);

  return (
    <div className="prose dark:prose-invert w-full max-w-full h-full flex-1 flex flex-col [&>div]:h-full [&>div]:flex-1 [&>div]:flex [&>div]:flex-col">
      <EditorContent
        editor={editor}
        style={styles}
      />
    </div>
  );
}
