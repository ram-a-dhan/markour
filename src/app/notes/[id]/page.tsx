"use client";

import type { ChangeEvent } from "react";
import { useParams } from "next/navigation";
import { Textarea, TextInput } from "@mantine/core";
import { useNotes } from "@/src/context/NotesContext";
import { CircleNotchIcon } from "@phosphor-icons/react";

export default function NotesById() {
  const params = useParams<{ id: string }>();

  const { notes, loaded, updateNote } = useNotes();

  const note = notes.find((n) => n.id === params.id);

  const onChangeTitle = (event: ChangeEvent<HTMLInputElement, HTMLInputElement>) => {
    if (!note?.id) return;
    updateNote(note.id, { title: event.target.value });
  };

  const onChangeContent = (event: ChangeEvent<HTMLTextAreaElement, HTMLTextAreaElement>) => {
    if (!note?.id) return;
    updateNote(note.id, { content: event.target.value });
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
    <div className="flex flex-col items-center gap-4">
      <TextInput
        className="w-full"
        variant="unstyled"
        placeholder="Untitled"
        value={note.title}
        onChange={onChangeTitle}
        size="xl"
        // styles={{ input: { fontSize: "1.5rem" } }}
      />
      <hr className="w-full text-(--mantine-color-default-border)" />
      <Textarea
        className="w-full"
        variant="unstyled"
        autosize
        autoComplete="off"
        placeholder="Start Typing..."
        value={note.content}
        onChange={onChangeContent}
      />
    </div>
  );
}
