import { fetcher } from "@/src/lib/fetcher";
import {
  getDirtyNotes,
  getLastSyncedAt,
  setLastSyncedAt,
  putLocalNote,
} from "@/src/lib/localdb";
import {
  NOTES_API_PATH,
  SYNC_PULL_API_PATH,
  SYNC_PUSH_API_PATH,
} from "@/src/constants/url";
import { HTTP_STATUS, REQUEST_METHOD } from "@/src/constants/misc";

interface IMeta {
  serverTime: number;
}

// Push every locally-dirty note. Each is independent — one conflict
// doesn't block the others.
export async function pushDirtyNotes(userId: string): Promise<void> {
  const dirty = await getDirtyNotes(userId);

  for (const note of dirty) {
    try {
      if (!note.synced) {
        try {
          // Never confirmed by the server yet — create, not update.
          const res = await fetcher<INoteFE>(NOTES_API_PATH, {
            method: REQUEST_METHOD.POST,
            data: {
              id: note.id,
              title: note.title,
              content: note.content,
              createdAt: note.createdAt,
              updatedAt: note.updatedAt,
              // no tagIds here — new notes always start untagged, per your
              // earlier decision, and POST /api/notes doesn't read tagIds anyway
            }
          });
          const created = res.data;
  
          await putLocalNote({
            ...created,
            userId,
            tagIds: [],
            dirty: false,
            synced: true,
          });
        } catch (error) {
          const err = error as IFetchErr;
  
          if (err.status === HTTP_STATUS.CONFLICT) {
            try {
              // Extremely unlikely (ID collision), but if it happens, the
              // note actually already exists server-side — fall through to
              // a normal push instead, so it isn't silently dropped.
              const res = await fetcher<INoteFE>(SYNC_PUSH_API_PATH, {
                method: REQUEST_METHOD.POST,
                data: {
                  id: note.id,
                  title: note.title,
                  content: note.content,
                  updatedAt: note.updatedAt,
                  deletedAt: note.deletedAt,
                  tagIds: note.tagIds,
                },
              });
              const existing = res.data;
    
              await putLocalNote({
                ...existing,
                userId,
                tagIds: existing.tagIds ?? [],
                dirty: false,
                synced: true,
              });
            } catch {
              // fallback push also failed — leave dirty, retry next cycle
            }
          }
        }
      } else {
        try {
          // Already known to the server — normal LWW push.
          const res = await fetcher<INoteFE>(SYNC_PUSH_API_PATH, {
            method: REQUEST_METHOD.POST,
            data: {
              id: note.id,
              title: note.title,
              content: note.content,
              updatedAt: note.updatedAt,
              deletedAt: note.deletedAt,
              tagIds: note.tagIds,
            },
          });
          const pushed = res.data;
  
          await putLocalNote({
            ...pushed,
            userId,
            tagIds: pushed.tagIds ?? [],
            dirty: false,
            synced: true,
          });
        } catch (error) {
          const err = error as IFetchErr<IFetchRes<INoteFE>>;
  
          if (err.status === HTTP_STATUS.CONFLICT && err.details) {
            // If pushed note is outdated compared to
            // the one existing on server-side
            const newer = err.details.data;
  
            await putLocalNote({
              ...newer,
              userId,
              tagIds: newer.tagIds ?? [],
              dirty: false,
              synced: true,
            });
          }
        }
      }
    } catch {
      // outer safety net — genuinely guarantees one note's total failure
      // (including failures in fallback/nested logic) never blocks the rest
    }
  }
}

// Pull everything changed since last sync, merge into local cache.
// Dirty local notes are protected from being clobbered by a pull that's
// actually older than an unsynced local edit sitting in the queue.
export async function pullRemoteChanges(userId: string): Promise<void> {
  const since = await getLastSyncedAt();

  try {
    const res = await fetcher<INoteFE[], IMeta>(SYNC_PULL_API_PATH, {
      params: { since },
    });
    const { data, meta } = res;

    for (const remote of data) {
      await putLocalNote({
        ...remote,
        userId,
        tagIds: remote.tagIds ?? [],
        dirty: false,
        synced: true,
      });
    }

    await setLastSyncedAt(meta.serverTime);
  } catch {
    // offline — just skip this cycle
  }
}

// Initial full load — used on first app open (empty local cache) or
// whenever you want a full resync rather than an incremental pull.
export async function fullResync(userId: string): Promise<void> {
  try {
    const res = await fetcher<INoteFE[], IMeta>(NOTES_API_PATH);
    const { data, meta } = res;

    for (const remote of data) {
      await putLocalNote({
        ...remote,
        userId,
        tagIds: remote.tagIds ?? [],
        dirty: false,
        synced: true,
      });
    }

    await setLastSyncedAt(meta.serverTime);
  } catch {
    // offline on first load — local cache (if any) is all we have
  }
}
