"use client";

import { type KeyboardEvent, useState } from "react";
import { TagsInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { TagIcon } from "@phosphor-icons/react";
import { useTags } from "@/src/context/TagsContext";
import { useNotes } from "@/src/context/NotesContext";
import { HTTP_STATUS } from "@/src/constants/misc";

interface INoteTagsInputProps {
  noteId: string;
  tagIds: string[];
  disabled: boolean;
}

export function NoteTagsInput({ noteId, tagIds, disabled }: INoteTagsInputProps) {
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

      try {
        const created = await createTag(trimmed);
        resolvedIds.push(created.id);
      } catch (error) {
        const err = error as IFetchErr;
        if (err.status === HTTP_STATUS.CONFLICT) {
          // Race condition — other devices created this name a moment ago.
          // Refresh and resolve it by name instead of failing this tag.
          await refresh();
          const retryId = tags.find((t) => t.name === trimmed)?.id;
          if (retryId) resolvedIds.push(retryId);
        } else {
          notifications.show({
            color: "red",
            title: "Failed Creating Tag",
            message: err.message,
          })
        }
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
      placeholder={!disabled ? "Add Tags..." : !tagIds.length ? "No Tags" : ""}
      value={currentNames}
      data={tags.map((t) => t.name).sort((a, b) => a.localeCompare(b))}
      onChange={onChange}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onKeyDown={onKeyDown}
      splitChars={[]}
      acceptValueOnBlur={false}
      className="sticky bottom-0 bg-(--mantine-color-body) p-4 border-t border-t-(--app-shell-border-color)"
      classNames={{
        pill: "[:where([data-mantine-color-scheme='dark'])_&]:bg-(--mantine-color-gray-8)!"
      }}
      readOnly={disabled}
    />
  );
}
