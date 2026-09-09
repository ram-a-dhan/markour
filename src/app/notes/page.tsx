"use client";

import { useNotes } from "@/src/context/NotesContext";
import { NoteEditor } from "@/src/components/NoteEditor";
import { NoteTagsInput } from "@/src/components/NoteTagsInput";
import { Skeleton } from "@mantine/core";

export default function Notes() {
  const { allNotes, selectedNoteId, loaded, updateNote } = useNotes();

  const note = selectedNoteId ? allNotes.find((n) => n.id === selectedNoteId) : undefined;

  const onChange = (markdown: string) => {
    if (!note?.id) return;
    updateNote(note.id, { content: markdown });
  };

  if (!selectedNoteId) return null;

  if (!note) return (
    <div className="flex justify-center gap-4 p-4">
      <span className="italic text-(--mantine-color-dimmed)">
        Note not found.
      </span>
    </div>
  );

  if (!loaded) return (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton height="2rem" width="33.33%" mb="sm" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" width="66.66%" mb="sm" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" width="66.66%" mb="sm" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" />
      <Skeleton height="1rem" width="66.66%" mb="sm" />
    </div>
  );

  return (
    <>
      <NoteEditor
        key={note.id}
        noteId={note.id}
        content={note.content}
        onChange={onChange}
        disabled={!!note.deletedAt}
      />
      <NoteTagsInput
        noteId={note.id}
        tagIds={note.tagIds}
        disabled={!!note.deletedAt}
      />
    </>
  );
}
