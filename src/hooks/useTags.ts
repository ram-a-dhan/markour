"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/src/context/SessionContext";
import { fetcher } from "@/src/lib/fetcher";
import { TAGS_API_PATH, TAGS_BY_ID_API_PATH } from "@/src/constants/url";
import { REQUEST_METHOD } from "@/src/constants/misc";

export function useTags() {
  const { user } = useSession();
  const [tags, setTags] = useState<ITagFE[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetcher<ITagFE[]>(TAGS_API_PATH);
      setTags(res.data);
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

  const createTag = useCallback(async (name: string): Promise<ITagFE> => {
    try {
      const res = await fetcher<ITagFE>(TAGS_API_PATH, {
        method: REQUEST_METHOD.POST,
        data: { name },
      });
      await refresh();
      return res.data;
    } catch (error) {
      throw error; // e.g. 409 duplicate name — caller should refresh + look it up instead
    }
  }, [refresh]);

  const deleteTag = useCallback(async (tagId: string): Promise<void> => {
    try {
      await fetcher(TAGS_BY_ID_API_PATH(tagId), {
        method: REQUEST_METHOD.DELETE,
      });
      await refresh();
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  return { tags, loaded, createTag, deleteTag, refresh };
}
