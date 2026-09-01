import { openDB, DBSchema, IDBPDatabase, } from "idb";

export interface ILocalNote extends INoteFE {
  dirty: boolean; // true = has local edits not yet confirmed pushed
  synced: boolean; // false = server has never seen this note yet (needs POST, not PUT-style push)
};

interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: ILocalNote;
    indexes: { "by-updatedAt": number };
  };
  meta: {
    key: string;
    value: { key: string; value: number };
  };
}

let dbPromise: Promise<IDBPDatabase<NotesDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<NotesDB>("notes-app", 1, {
      upgrade(db) {
        const notesStore = db.createObjectStore("notes", { keyPath: "id" });
        notesStore.createIndex("by-updatedAt", "updatedAt");
        db.createObjectStore("meta", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export async function getAllLocalNotes(
  userId: string,
  filter: (note: ILocalNote) => boolean = () => true
): Promise<ILocalNote[]> {
  const db = await getDB();
  const all = await db.getAll("notes");
  return all
    .filter((n) => n.userId === userId && filter(n))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getLocalNote(id: string): Promise<ILocalNote | undefined> {
  const db = await getDB();
  return db.get("notes", id);
}

export async function putLocalNote(note: ILocalNote): Promise<void> {
  const db = await getDB();
  await db.put("notes", note);
}

export async function getLastSyncedAt(): Promise<number> {
  const db = await getDB();
  const row = await db.get("meta", "lastSyncedAt");
  return row?.value ?? 0;
}

export async function setLastSyncedAt(ts: number): Promise<void> {
  const db = await getDB();
  await db.put("meta", { key: "lastSyncedAt", value: ts });
}

export async function getDirtyNotes(userId: string): Promise<ILocalNote[]> {
  const db = await getDB();
  const all = await db.getAll("notes");
  return all.filter((n) => n.userId === userId && n.dirty);
}

export async function getLastUserId(): Promise<string | null> {
  const db = await getDB();
  const row = await db.get("meta", "lastUserId");
  return (row?.value as unknown as string) ?? null;
}

export async function setLastUserId(userId: string): Promise<void> {
  const db = await getDB();
  await db.put("meta", { key: "lastUserId", value: userId as unknown as number });
}

export async function clearAllLocalNotes(): Promise<void> {
  const db = await getDB();
  await db.clear("notes");
  await db.clear("meta");
}
