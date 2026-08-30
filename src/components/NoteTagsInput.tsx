"use client";

import { TagsInput } from "@mantine/core";
import { TagIcon } from "@phosphor-icons/react";
import { useTags } from "@/src/context/TagsContext";
import { useNotes } from "@/src/context/NotesContext";
import { type KeyboardEvent, useState } from "react";

interface INoteTagsInputProps {
  noteId: string;
  tagIds: string[];
}

export function NoteTagsInput({ noteId, tagIds }: INoteTagsInputProps) {
  const [searchValue, setSearchValue] = useState("");
  const { tags, createTag, refresh } = useTags();
  const { updateNoteTags } = useNotes();

  // ID -> name for display; skip any ID that doesn't resolve (e.g. a tag
  // deleted on another device that hasn't synced here yet).
  const idToName = new Map(tags.map((t) => [t.id, t.name]));
  const currentNames = tagIds
    .map((id) => idToName.get(id))
    .filter((n): n is string => !!n);

  const onChange = async (names: string[]) => {
    const nameToId = new Map(tags.map((t) => [t.name, t.id]));
    const resolvedIds: string[] = [];

    for (const name of names) {
      const trimmed = name.trim();
      if (!trimmed) continue;

      const existingId = nameToId.get(trimmed);
      if (existingId) {
        resolvedIds.push(existingId);
        continue;
      }

      // Not an existing tag — create it.
      const created = await createTag(trimmed);
      if (created) {
        resolvedIds.push(created.id);
      } else {
        // Creation failed (likely a race condition — someone/something else created
        // the same name a moment ago). Refresh and try to resolve again.
        await refresh();
        const retryId = tags.find((t) => t.name === trimmed)?.id;
        if (retryId) resolvedIds.push(retryId);
      }
    }

    await updateNoteTags(noteId, resolvedIds);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // If input is empty and user hits Backspace, block tag deletion
    if (event.key === "Backspace" && searchValue === "") {
      event.preventDefault();
    }
  };

  return (
    <TagsInput
      variant="unstyled"
      leftSection={<TagIcon size={24} />}
      placeholder="Add Tags..."
      value={currentNames}
      data={tags.map((t) => t.name)}
      onChange={onChange}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onKeyDown={onKeyDown}
      splitChars={[]}
      acceptValueOnBlur={false}
      className="sticky bottom-0 bg-(--mantine-color-body) py-4 border-t border-t-(--mantine-color-default-border)"
      classNames={{
        pill: "[:where([data-mantine-color-scheme='dark'])_&]:bg-(--mantine-color-gray-8)!"
      }}
    />
  );
}
