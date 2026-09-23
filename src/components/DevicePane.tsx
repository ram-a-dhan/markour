"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const NOTE_ID = "04ba4c41-0485-4aa8-9114-7d01644945e7";
const DEBOUNCE_MS = 1200;
const POLL_MS = 3000;

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function DevicePane({
  clientId,
  label,
}: {
  clientId: string;
  label: string;
}) {
  const [note, setNote] = useState<INoteFE | null>(null);
  const [dirty, setDirty] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(0);
  const [status, setStatus] = useState<"idle" | "editing" | "pushing" | "conflict" | "pulled">(
    "idle"
  );
  const [log, setLog] = useState<string[]>([]);

  const noteRef = useRef<INoteFE | null>(null);
  const dirtyRef = useRef(false);
  const lastSyncedAtRef = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  useEffect(() => {
    lastSyncedAtRef.current = lastSyncedAt;
  }, [lastSyncedAt]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`${fmt(Date.now())}  ${msg}`, ...prev].slice(0, 8));
  }, []);

  useEffect(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => {
        const n: INoteFE | undefined = data.notes.find((x: INoteFE) => x.id === NOTE_ID);
        if (n) {
          setNote(n);
          setLastSyncedAt(n.updatedAt);
          addLog("loaded initial note");
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const push = useCallback(async () => {
    const current = noteRef.current;
    if (!current || !dirtyRef.current) return;
    setStatus("pushing");
    try {
      const res = await fetch("/api/sync/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: current.id,
          title: current.title,
          content: current.content,
          updatedAt: current.updatedAt,
          deletedAt: current.deletedAt,
          clientId,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        addLog(`conflict — server had newer write, taking server version`);
        setNote(data.serverNote);
        setLastSyncedAt(data.serverNote.updatedAt);
        setDirty(false);
        setStatus("conflict");
        return;
      }

      addLog(`pushed local edit (v${data.serverNote.version})`);
      setNote(data.serverNote);
      setLastSyncedAt(data.serverNote.updatedAt);
      setDirty(false);
      setStatus("idle");
    } catch {
      addLog("push failed (network) — will retry on next edit");
      setStatus("idle");
    }
  }, [clientId, addLog]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (dirtyRef.current) return;
      try {
        const res = await fetch(`/api/sync/pull?since=${lastSyncedAtRef.current}`);
        const data = await res.json();
        const incoming: INoteFE | undefined = data.notes.find((n: INoteFE) => n.id === NOTE_ID);
        if (incoming && incoming.updatedAt > lastSyncedAtRef.current) {
          setNote(incoming);
          setLastSyncedAt(incoming.updatedAt);
          setStatus("pulled");
          addLog(
            incoming.deletedAt
              ? "pulled: note deleted elsewhere (tombstone)"
              : `pulled remote edit (v${incoming.version})`
          );
          setTimeout(() => setStatus("idle"), 800);
        }
      } catch {
        // offline is fine, retry next tick
      }
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [addLog]);

  const onEdit = (field: "title" | "content", value: string) => {
    if (!note) return;
    const updated = { ...note, [field]: value, updatedAt: Date.now() };
    setNote(updated);
    setDirty(true);
    setStatus("editing");
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(push, DEBOUNCE_MS);
  };

  const onDelete = () => {
    if (!note) return;
    const updated = { ...note, deletedAt: Date.now(), updatedAt: Date.now() };
    setNote(updated);
    setDirty(true);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(push, 200);
  };

  const statusColor: Record<string, string> = {
    idle: "bg-neutral-700 text-neutral-300",
    editing: "bg-amber-500/20 text-amber-400",
    pushing: "bg-blue-500/20 text-blue-400",
    conflict: "bg-red-500/20 text-red-400",
    pulled: "bg-emerald-500/20 text-emerald-400",
  };

  if (note?.deletedAt) {
    return (
      <div className="flex-1 min-w-0 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
        <div className="text-sm font-medium text-neutral-400 mb-3">{label}</div>
        <div className="text-neutral-500 italic">This note was deleted (tombstoned).</div>
        <SyncLog log={log} />
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-neutral-400">{label}</div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[status]}`}>
          {status}
        </span>
      </div>

      {!note ? (
        <div className="text-neutral-500 text-sm">loading...</div>
      ) : (
        <>
          <input
            className="bg-transparent text-lg font-semibold outline-none border-b border-neutral-800 pb-2 focus:border-neutral-600"
            value={note.title}
            onChange={(e) => onEdit("title", e.target.value)}
          />
          <textarea
            className="bg-transparent outline-none resize-none flex-1 min-h-35 text-sm text-neutral-300"
            value={note.content}
            onChange={(e) => onEdit("content", e.target.value)}
          />
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>v{note.version} · updated {fmt(note.updatedAt)}</span>
            <button
              onClick={onDelete}
              className="text-neutral-600 hover:text-red-400 transition-colors"
            >
              delete
            </button>
          </div>
        </>
      )}

      <SyncLog log={log} />
    </div>
  );
}

function SyncLog({ log }: { log: string[] }) {
  return (
    <div className="mt-2 pt-3 border-t border-neutral-800">
      <div className="text-[10px] uppercase tracking-wide text-neutral-600 mb-1">sync log</div>
      <div className="space-y-0.5 text-[11px] font-mono text-neutral-500 max-h-28 overflow-y-auto">
        {log.length === 0 && <div className="text-neutral-700">—</div>}
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}
