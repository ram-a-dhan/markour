import { useRouter } from "next/navigation";
import { ActionIcon, AppShell, ScrollArea, Tooltip } from "@mantine/core";
import { GearFineIcon, NotePencilIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { NOTE_DETAIL_PATH } from "../constants/url";

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

  const { notes, createNote } = useNotes();

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
        className="grow-0 shrink-0 flex items-center justify-between border-b border-b-(--app-shell-border-color) overflow-hidden"
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

        <h2>Notes</h2>

        <Tooltip label="Create New Note">
          <ActionIcon
            variant="transparent"
            color="dark"
            onClick={onClickCreate}
          >
            <NotePencilIcon size={26} />
          </ActionIcon>
        </Tooltip>
      </AppShell.Section>

      {/* NOTE LIST */}
      <AppShell.Section
        className="overscroll-contain"
        grow
        component={ScrollArea}
      >
        {notes.map((item) => (
          <div
            key={item.id}
            onClick={() => onClickOpen(item.id)}
            className="p-4 cursor-pointer hover:bg-(--mantine-color-default-hover) active:bg-(--mantine-color-default-border) select-none"
          >
            <p className="mb-1 truncate">
              {item.title || "Untitled"}
            </p>
            <p className="text-xs text-(--mantine-color-dimmed) truncate">
              {item.content}
            </p>
          </div>
        ))}
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
