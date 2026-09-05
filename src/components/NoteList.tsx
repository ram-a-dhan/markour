import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ActionIcon, AppShell, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { GearFineIcon, NotePencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import { NOTE_DETAIL_PATH, NOTE_LIST_PATH } from "@/src/constants/url";
import NoteItem from "@/src/components/NoteItem";

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

  const { notes, createNote, purgeNotes, view } = useNotes();
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

  const onConfirmPurge = async () => {
    await purgeNotes(notes.map((n) => n.id));
    if (!openedNavbarMobile) closeNavbarMobile();
    router.replace(NOTE_LIST_PATH);
  }

  const onClickPurge = async () => {
    let count = 10;
    const modalId = "confirm-delete-permanently-many";
    modals.openConfirmModal({
      modalId,
      title: "Clear Trash",
      children: (
        <div className="flex flex-col gap-4">
          <p>Are you sure deleting all notes in trash permanently? They will be lost forever.</p>
          <p>To proceed please click the button 10 times.</p>
        </div>
      ),
      labels: { confirm: <span>Clear Trash ({count})</span>, cancel: "Cancel" },
      confirmProps: { color: "red" },
      closeOnConfirm: false,
      onConfirm: async () => {
        if (count > 1) {
          count--;
          modals.updateModal({
            modalId,
            confirmProps: { color: "red" },
            labels: { confirm: <span>Clear Trash ({count})</span>, cancel: "Cancel" },
          });
          return;
        }

        try {
          modals.updateModal({
            modalId,
            confirmProps: { color: "red", loading: true },
            labels: { confirm: <span>Clear Trash</span>, cancel: "Cancel" },
          });
          await onConfirmPurge();
          modals.close(modalId);
        } catch (error) {
          modals.updateModal({ modalId, confirmProps: { color: "red", loading: false } });
          notifications.show({ title: "Error", message: (error as Error).message , color: "red" });
        }
      },
    });
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
          <>
            {!!notes.length ? (
              <Tooltip label="Clear Trash">
                <ActionIcon
                  variant="transparent"
                  color="dark"
                  onClick={() => onClickPurge()}
                >
                  <TrashIcon size={26} />
                </ActionIcon>
              </Tooltip>
            ): (
              <div className="w-7" />
            )}
          </>
        )}
        {view.mode === "tag" && (
          <div className="w-7" />
        )}
      </AppShell.Section>

      {/* NOTE LIST */}
      <AppShell.Section
        className="overscroll-contain overflow-y-auto"
        grow
      >
        {notes.map((n) => (
          <NoteItem
            key={n.id}
            note={n}
            onClickOpen={onClickOpen}
          />
        ))}
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
