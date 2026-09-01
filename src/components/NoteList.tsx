import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ActionIcon, AppShell, ScrollArea, Tooltip } from "@mantine/core";
import { GearFineIcon, NotePencilIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import { NOTE_DETAIL_PATH } from "@/src/constants/url";

interface INoteListProps {
  openDrawer: () => void;
  openedNavbarMobile: boolean;
  closeNavbarMobile: () => void;
}

export default function NoteList({
  openDrawer,
  openedNavbarMobile,
  closeNavbarMobile,
}: INoteListProps) {
  const router = useRouter();

  const { notes, createNote, view } = useNotes();
  const { tags } = useTags();

  const selectedTag = useMemo(() => {
    return tags.find((t) => t.id === view.tagId);
  }, [tags, view.tagId]);

  const onClickCreate = async () => {
    const id = await createNote();
    if (openedNavbarMobile) closeNavbarMobile();
    router.replace(NOTE_DETAIL_PATH(id));
  };

  const onClickOpen = (id: string) => {
    if (openedNavbarMobile) closeNavbarMobile();
    router.replace(NOTE_DETAIL_PATH(id));
  };

  return (
    <AppShell.Navbar>
      {/* NOTE TOOLBAR */}
      <AppShell.Section
        p="md"
        h={60}
        className="grow-0 shrink-0 flex items-center justify-between gap-4 border-b border-b-(--app-shell-border-color) overflow-hidden"
      >
        <Tooltip label="Settings">
          <ActionIcon
            variant="transparent"
            color="dark"
            onClick={openDrawer}
          >
            <GearFineIcon size={26} />
          </ActionIcon>
        </Tooltip>

        <h2 className="text-ellipsis text-nowrap line-clamp-1">
           <span className="capitalize">{view.mode}</span>
           {!!selectedTag?.name && <span>: {selectedTag.name}</span>}
        </h2>

        {view.mode === "notes" && (
          <Tooltip label="Create New Note">
            <ActionIcon
              variant="transparent"
              color="dark"
              onClick={onClickCreate}
            >
              <NotePencilIcon size={26} />
            </ActionIcon>
          </Tooltip>
        )}
        {view.mode === "trash" && (
          <div className="w-7" />
        )}
        {view.mode === "tag" && (
          <div className="w-7" />
        )}
      </AppShell.Section>

      {/* NOTE LIST */}
      <AppShell.Section
        className="overscroll-contain"
        grow
        component={ScrollArea}
      >
        {notes.map((item) => {
          const [title, ...content] = item.content.trimStart().split("\n");
          return (
            <div
              key={item.id}
              onClick={() => onClickOpen(item.id)}
              className="p-4 cursor-pointer hover:bg-(--mantine-color-default-hover) active:bg-(--mantine-color-default-border) select-none"
            >
              <p className="mb-1 truncate">
                {title.replace(/(&nbsp;|#)/g, "").trim() || "Untitled"}
              </p>
              <p className="text-xs text-(--mantine-color-dimmed) truncate">
                {content.join(" ").trim()}
              </p>
            </div>
          );
        })}
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
