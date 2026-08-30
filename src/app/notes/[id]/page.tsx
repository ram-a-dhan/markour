"use client";

import { useParams } from "next/navigation";
import { CircleNotchIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { NoteEditor } from "@/src/components/NoteEditor";
import { NoteTagsInput } from "@/src/components/NoteTagsInput";

export default function NotesById() {
  const params = useParams<{ id: string }>();

  const { notes, loaded, updateNote } = useNotes();

  const note = notes.find((n) => n.id === params.id);

  const onChange = (markdown: string) => {
    if (!note?.id) return;
    updateNote(note.id, { content: markdown })
  };

  if (!loaded) return (
    <div className="flex justify-center gap-4">
      <CircleNotchIcon size={34}>
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          dur="1s"
          from="0 0 0"
          to="360 0 0"
          repeatCount="indefinite"
        ></animateTransform>
      </CircleNotchIcon>
    </div>
  );

  if (!note) return (
    <div className="flex justify-center gap-4">
      <span className="italic text-(--mantine-color-dimmed)">
        Note not found.
      </span>
    </div>
  );

  return (
    <>
      <NoteEditor
        key={note.id}
        noteId={note.id}
        content={note.content}
        onChange={onChange}
      />
      <NoteTagsInput
        noteId={note.id}
        tagIds={note.tagIds}
      />
    </>
  );
}
