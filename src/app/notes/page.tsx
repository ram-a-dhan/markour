"use client";

import { Skeleton } from "@mantine/core";
import { useNotes } from "@/src/context/NotesContext";
import NoteEditor from "@/src/components/NoteEditor";
import NoteTagsInput from "@/src/components/NoteTagsInput";

export default function Notes() {
  const { allNotes, selectedNoteId, loaded, updateNote, view } = useNotes();

  const note = selectedNoteId ? allNotes.find((n) => n.id === selectedNoteId) : undefined;

  const onChange = (markdown: string) => {
    if (!note?.id) return;
    updateNote(note.id, { content: markdown });
  };

  if (!loaded) return (
    <div className="flex flex-col gap-2 p-4">
      <Skeleton height={32} width="33.33%" />
      <Skeleton height={16} className="mt-2" />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <Skeleton height={16} width="66.66%" />
      <Skeleton height={16} className="mt-2" />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <Skeleton height={16} width="66.66%" />
      <Skeleton height={16} className="mt-2" />
      <Skeleton height={16} />
      <Skeleton height={16} />
      <Skeleton height={16} width="66.66%" />
    </div>
  );

  if (!selectedNoteId && view.mode === "notes") return (
    <div className="flex items-center justify-center h-12">
      <span className="italic text-(--mantine-color-dimmed)">
        Open a note or create a new one.
      </span>
    </div>
  );

  if (!selectedNoteId) return null;

  if (!note) return (
    <div className="flex items-center justify-center h-12">
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
