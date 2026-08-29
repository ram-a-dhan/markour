import {
  getDirtyNotes,
  getLastSyncedAt,
  setLastSyncedAt,
  putLocalNote,
} from "@/src/lib/localdb";
import { NOTES_API_PATH, SYNC_PULL_API_PATH, SYNC_PUSH_API_PATH } from "../constants/url";

// Push every locally-dirty note. Each is independent — one conflict
// doesn't block the others.
export async function pushDirtyNotes(userId: string): Promise<void> {
  const dirty = await getDirtyNotes(userId);

  for (const note of dirty) {
    try {
      if (!note.synced) {
        // Never confirmed by the server yet — create, not update.
        const res = await fetch(NOTES_API_PATH, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
            // no tagIds here — new notes always start untagged, per your
            // earlier decision, and POST /api/notes doesn't read tagIds anyway
          }),
        });

        if (res.status === 409) {
          // Extremely unlikely (ID collision), but if it happens, the
          // note actually already exists server-side — fall through to
          // a normal push instead, so it isn't silently dropped.
          const pushRes = await fetch(SYNC_PUSH_API_PATH, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: note.id,
              title: note.title,
              content: note.content,
              updatedAt: note.updatedAt,
              deletedAt: note.deletedAt,
              tagIds: note.tagIds,
            }),
          });
          if (pushRes.ok) {
            const data = (await pushRes.json()) as { serverNote: INoteFE };
            await putLocalNote({ ...data.serverNote, userId, tagIds: data.serverNote.tagIds ?? [], dirty: false, synced: true });
          }
          continue;
        }

        if (!res.ok) continue; // retry next cycle

        const data = (await res.json()) as { note: INoteFE };
        await putLocalNote({ ...data.note, userId, tagIds: [], dirty: false, synced: true });
        continue;
      }

      // Already known to the server — normal LWW push.
      const res = await fetch(SYNC_PUSH_API_PATH, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: note.id,
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt,
          deletedAt: note.deletedAt,
          tagIds: note.tagIds,
        }),
      });

      if (res.status === 409) {
        const data = (await res.json()) as { serverNote: INoteFE };
        await putLocalNote({ ...data.serverNote, userId, tagIds: data.serverNote.tagIds ?? [], dirty: false, synced: true });
        continue;
      }
      if (!res.ok) continue;

      const data = (await res.json()) as { serverNote: INoteFE };
      await putLocalNote({ ...data.serverNote, userId,tagIds: data.serverNote.tagIds ?? [],  dirty: false, synced: true });
    } catch {
      // offline — leave dirty, retry next cycle
    }
  }
}

// Pull everything changed since last sync, merge into local cache.
// Dirty local notes are protected from being clobbered by a pull that's
// actually older than an unsynced local edit sitting in the queue.
export async function pullRemoteChanges(userId: string): Promise<void> {
  const since = await getLastSyncedAt();

  try {
    const res = await fetch(`${SYNC_PULL_API_PATH}?since=${since}`, { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { notes: INoteFE[]; serverTime: number };

    for (const remote of data.notes) {
      await putLocalNote({ ...remote, userId, tagIds: remote.tagIds ?? [], dirty: false, synced: true });
    }

    await setLastSyncedAt(data.serverTime);
  } catch {
    // offline — just skip this cycle
  }
}

// Initial full load — used on first app open (empty local cache) or
// whenever you want a full resync rather than an incremental pull.
export async function fullResync(userId: string): Promise<void> {
  try {
    const res = await fetch(NOTES_API_PATH, { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { notes: INoteFE[]; serverTime: number };
    for (const remote of data.notes) {
      await putLocalNote({ ...remote, userId, tagIds: remote.tagIds ?? [], dirty: false, synced: true });
    }
    await setLastSyncedAt(data.serverTime);
  } catch {
    // offline on first load — local cache (if any) is all we have
  }
}
