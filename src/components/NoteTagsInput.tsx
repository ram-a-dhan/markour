"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import { TagsInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
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

export default function NoteTagsInput({ noteId, tagIds, disabled }: INoteTagsInputProps) {
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimisticNames, setOptimisticNames] = useState<string[] | null>(null);
  const { tags, createTag, refresh, loaded } = useTags();
  const { updateNoteTags } = useNotes();

  const submissionIdRef = useRef(0);

  // ID -> name for display; skip any ID that doesn't resolve (e.g. a tag
  // deleted on another device that hasn't synced here yet).
  const idToName = new Map(tags.map((t) => [t.id, t.name]));
  const currentNames = loaded
    ? tagIds
        .map((id) => idToName.get(id))
        .filter((n): n is string => !!n)
        .sort((a, b) => a.localeCompare(b))
    : []; // don't show anything while tags are being fetched
  const displayedNames = optimisticNames ?? currentNames;

  // Debounced persist for pure add/remove of already-known tags — no
  // network cost until this fires, so coalescing rapid clicks is safe.
  const debouncedPersist = useDebouncedCallback((id: string, resolvedIds: string[], mySubmissionId: number) => {
    updateNoteTags(id, resolvedIds)
      .catch(() => {
        notifications.show({
          color: "red",
          title: "Failed Saving Tags",
          message: "Your tag changes couldn't be saved.",
        });
      })
      .finally(() => {
        if (submissionIdRef.current === mySubmissionId) {
          setOptimisticNames(null);
          setLoading(false);
        }
      });
  }, { delay: 400, flushOnUnmount: true });

  const onChange = async (names: string[]) => {
    const mySubmissionId = ++submissionIdRef.current;
    setOptimisticNames(names.sort((a, b) => a.localeCompare(b))); // show the change immediately, no waiting
    setLoading(true);

    const nameToId = new Map(tags.map((t) => [t.name, t.id]));
    const resolvedIds: string[] = [];
    const newNames: string[] = [];

    for (const name of names) {
      const trimmed = name.trim();
      if (!trimmed) continue;
      const existingId = nameToId.get(trimmed);
      if (existingId) {
        resolvedIds.push(existingId);
      } else {
        newNames.push(trimmed);
      }
    }

    if (newNames.length === 0) {
      setLoading(true);
      debouncedPersist(noteId, resolvedIds, mySubmissionId);
      return;
    }

    debouncedPersist.cancel();
    setLoading(true);

    for (const trimmed of newNames) {
      try {
        const created = await createTag(trimmed);
        resolvedIds.push(created.id);
      } catch (error) {
        const err = error as IFetchErr;
        if (err.status === HTTP_STATUS.CONFLICT) {
          const freshTags = await refresh();
          const retryId = freshTags.find((t) => t.name === trimmed)?.id;
          if (retryId) {
            resolvedIds.push(retryId);
          } else {
            notifications.show({
              color: "red",
              title: "Failed Adding Tag",
              message: `Failed to add "${trimmed}" tag. Please try again.`,
            });
          }
        } else {
          notifications.show({
            color: "red",
            title: "Failed Creating Tag",
            message: err.message,
          });
        }
      }
    }

    try {
      await updateNoteTags(noteId, resolvedIds);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed Updating Tags",
        message: (error as IFetchErr).message,
      });
    } finally {
      if (submissionIdRef.current === mySubmissionId) {
        setOptimisticNames(null);
        setLoading(false);
      }
    }
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
      placeholder={
        !loaded ? "Loading Tags..." :
        !disabled ? "Add Tags..." :
        !tagIds.length ? "No Tags" :
        ""
      }
      value={displayedNames}
      data={tags.map((t) => t.name).sort((a, b) => a.localeCompare(b))}
      onChange={onChange}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onKeyDown={onKeyDown}
      splitChars={[]}
      acceptValueOnBlur={false}
      className="sticky bottom-0 bg-(--mantine-color-body) p-4 border-t border-t-(--app-shell-border-color)"
      classNames={{
        input: disabled ? "cursor-not-allowed!" : "",
        inputField: disabled ? "cursor-not-allowed!" : "",
        pill: "[:where([data-mantine-color-scheme='dark'])_&]:bg-(--mantine-color-gray-8)!"
      }}
      readOnly={disabled || !loaded}
      loading={loading || !loaded}
    />
  );
}
