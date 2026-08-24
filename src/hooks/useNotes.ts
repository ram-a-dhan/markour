"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ILocalNote,
  getAllLocalNotes,
  putLocalNote,
  getLocalNote,
  getLastUserId,
  clearAllLocalNotes,
  setLastUserId,
} from "@/src/lib/localdb";
import {
  pushDirtyNotes,
  pullRemoteChanges,
  fullResync,
} from "@/src/lib/syncManager";
import { useSession } from "@/src/context/SessionContext";

const DEBOUNCE_MS = 1500;
const POLL_MS = 3000;

export function useNotes() {
  const { user } = useSession();
  const userId = user?.id ?? null;

  const [notes, setNotes] = useState<ILocalNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setNotes(await getAllLocalNotes(userId));
  }, [userId]);

  // Initial load: read whatever's cached instantly, then reconcile
  // with the server in the background.
  useEffect(() => {
    if (!userId) return;
    (async () => {
      await refresh();
      setLoaded(true);
      await fullResync(userId);
      await refresh();
    })();
  }, [userId, refresh]);

  // Poll loop
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(async () => {
      await pullRemoteChanges(userId);
      await refresh();
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [userId, refresh]);

  const createNote = useCallback(async () => {
    if (!userId) throw new Error("cannot create a note without a logged-in user");
    const now = Date.now();
    const newNote: ILocalNote = {
      id: crypto.randomUUID(),
      userId,
      title: "",
      content: "",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      version: 1,
      dirty: true,
      synced: false,
    };
    await putLocalNote(newNote);
    await refresh();
    pushDirtyNotes(userId).then(refresh); // fire-and-forget, don't block the UI on network
    return newNote.id;
  }, [userId, refresh]);

  const updateNote = useCallback(
    async (
      id: string,
      patch: Partial<Pick<ILocalNote, "title" | "content">>,
    ) => {
      if (!userId) throw new Error("cannot update a note without a logged-in user");
      const current = await getLocalNote(id);
      if (!current) return;
      const updated: ILocalNote = {
        ...current,
        ...patch,
        updatedAt: Date.now(),
        dirty: true,
      };
      await putLocalNote(updated);
      await refresh();

      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(async () => {
        await pushDirtyNotes(userId);
        await refresh();
      }, DEBOUNCE_MS);
    },
    [userId, refresh],
  );

  const deleteNote = useCallback(
    async (id: string) => {
      if (!userId) throw new Error("cannot delete a note without a logged-in user");
      const current = await getLocalNote(id);
      if (!current) return;
      await putLocalNote({
        ...current,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
        dirty: true,
      });
      await refresh();
      await pushDirtyNotes(userId);
      await refresh();
    },
    [userId, refresh],
  );

  return {
    notes,
    loaded,
    createNote,
    updateNote,
    deleteNote,
    refresh
  };
}
