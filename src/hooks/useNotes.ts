"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ILocalNote,
  getAllLocalNotes,
  putLocalNote,
  getLocalNote,
  deleteLocalNotes,
} from "@/src/lib/localdb";
import {
  pushDirtyNotes,
  pullRemoteChanges,
  fullResync,
} from "@/src/lib/syncManager";
import { useSession } from "@/src/context/SessionContext";
import { NOTES_PURGE_API_PATH } from "@/src/constants/url";

const DEBOUNCE_MS = 1500;
const POLL_MS = 3000;

export function useNotes() {
  const { user } = useSession();
  const userId = user?.id ?? null;

  const [view, setView] = useState<IView>({ mode: "notes" });
  const [allNotes, setAllNotes] = useState<ILocalNote[]>([]);
  const [loaded, setLoaded] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setAllNotes(await getAllLocalNotes(userId));
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

  const notes = useMemo(() => {
    switch (view.mode) {
      case "tag":
        return allNotes.filter((n) => n.tagIds.includes(view.tagId!));
      case "trash":
        return allNotes.filter((n) => !!n.deletedAt);
      case "notes":
      default:
        return allNotes.filter((n) => !n.deletedAt);
    }
  }, [allNotes, view.mode, view.tagId]);

  const createNote = useCallback(async () => {
    if (!userId) throw new Error("Cannot create a note without a logged-in user.");
    const id = uuidv4();
    const existing = await getLocalNote(id);
    if (existing) throw new Error("UUID collision! Please try again.")
    const now = Date.now();
    const newNote: ILocalNote = {
      id,
      userId,
      title: "",
      content: "",
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      tagIds: [],
      version: 1,
      dirty: true,
      synced: false,
    };
    await putLocalNote(newNote);
    await refresh();
    pushDirtyNotes(userId).then(refresh); // fire-and-forget, don't block the UI on network
    return newNote.id;
  }, [userId, refresh]);

  const updateNote = useCallback(async (id: string, patch: Partial<Pick<ILocalNote, "title" | "content">>) => {
    if (!userId) throw new Error("Cannot update a note without a logged-in user.");
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
  }, [userId, refresh]);

  const deleteNote = useCallback(async (id: string) => {
    if (!userId) throw new Error("Cannot delete a note without a logged-in user.");
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
  }, [userId, refresh]);

  const restoreNote = useCallback(async (id: string) => {
    if (!userId) throw new Error("Cannot restore a note without a logged-in user.");
    const current = await getLocalNote(id);
    if (!current) return;
    await putLocalNote({
      ...current,
      deletedAt: null,
      updatedAt: Date.now(),
      dirty: true,
    });
    await refresh();
    await pushDirtyNotes(userId);
    await refresh();
  }, [userId, refresh]);

  const purgeNotes = useCallback(async (ids: string[]) => {
    if (!userId) throw new Error("Cannot purge notes without a logged-in user.");
    if (ids.length === 0) throw new Error("Cannot purge notes without ids.");

    const res = await fetch(NOTES_PURGE_API_PATH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || error?.message || error);
    }

    const data = (await res.json()) as { purgedIds: string[] };
    await deleteLocalNotes(data.purgedIds);
    // if offline/failed: local copies stay put, still tombstoned,
    // still visible in trash — user can retry purge later. No local-only
    // hard delete without server confirmation, to avoid a note vanishing
    // locally while still existing server-side (would resurrect on next pull).

    await refresh();
  }, [userId, refresh]);

  const updateNoteTags = useCallback(async (id: string, tagIds: string[]) => {
    if (!userId) throw new Error("Cannot update note tags without a logged-in user.");
    const current = await getLocalNote(id);
    if (!current) return;
    await putLocalNote({
      ...current,
      tagIds,
      updatedAt: Date.now(),
      dirty: true,
    });
    await refresh();
    await pushDirtyNotes(userId);
    await refresh();
  }, [userId, refresh]);

  return {
    notes,
    loaded,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    purgeNotes,
    updateNoteTags,
    refresh,
    view,
    setView,
  };
}
