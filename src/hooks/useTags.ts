"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/src/context/SessionContext";
import { TAGS_API_PATH, TAGS_BY_ID_API_PATH } from "@/src/constants/url";

export function useTags() {
  const { user } = useSession();
  const [tags, setTags] = useState<ITagFE[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(TAGS_API_PATH, { credentials: "include" });
      if (res.ok) {
        const data = (await res.json()) as { tags: ITagFE[] };
        setTags(data.tags);
      }
    } catch {
      // silent error
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoaded(true);
    })();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refresh, 5000); // mini "sync" for tags
    return () => clearInterval(interval);
  }, [user, refresh]);

  const createTag = useCallback(async (name: string): Promise<ITagFE | null> => {
    const res = await fetch(TAGS_API_PATH, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return null; // e.g. 409 duplicate name — caller should refresh + look it up instead
    const data = (await res.json()) as { tag: ITagFE };
    await refresh();
    return data.tag;
  }, [refresh]);

  const deleteTag = useCallback(async (tagId: string): Promise<void> => {
    const res = await fetch(TAGS_BY_ID_API_PATH(tagId), {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error?.error || error?.message || error);
    }
    await refresh();
  }, [refresh]);

  return { tags, loaded, createTag, deleteTag, refresh };
}
