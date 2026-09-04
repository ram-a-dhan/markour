import { PropsWithChildren } from "react";
import { ActionIcon, AppShell, Burger, Menu, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  ArrowUUpLeftIcon,
  DotsThreeOutlineVerticalIcon,
  SidebarSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useNotes } from "@/src/context/NotesContext";
import { NOTE_LIST_PATH } from "@/src/constants/url";
import { notifications } from "@mantine/notifications";

interface INoteDetailProps extends PropsWithChildren {
  openedNavbarDesktop: boolean;
  toggleNavbarDesktop: () => void;
  openedNavbarMobile: boolean;
  toggleNavbarMobile: () => void;
}

export default function NoteDetail({
  openedNavbarDesktop,
  toggleNavbarDesktop,
  openedNavbarMobile,
  toggleNavbarMobile,
  children,
}: INoteDetailProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { notes, loaded, deleteNote, restoreNote, purgeNotes } = useNotes();

  const note = notes.find((n) => n.id === params.id);

  const onClickRestore = async (noteId: string) => {
    await restoreNote(noteId);
    if (!openedNavbarMobile) toggleNavbarMobile();
    router.replace(NOTE_LIST_PATH);
  };

  const onConfirmDelete = async (noteId: string) => {
    await deleteNote(noteId);
    if (!openedNavbarMobile) toggleNavbarMobile();
    router.replace(NOTE_LIST_PATH);
  };

  const onClickDelete = async (noteId: string) => {
    const modalId = "confirm-move-to-trash";
    modals.openConfirmModal({
      modalId,
      title: "Move to Trash",
      children: "Are you sure moving this note to the trash? It will still be accessible in the trash and can be restored later.",
      labels: { confirm: "Move to Trash", cancel: "Cancel" },
      confirmProps: { color: "red" },
      closeOnConfirm: false,
      onConfirm: async () => {
        modals.updateModal({ modalId, confirmProps: { color: "red", loading: true } });
        await onConfirmDelete(noteId);
        modals.close(modalId);
      },
    });
  };

  const onConfirmPurge = async (noteId: string) => {
    await purgeNotes([noteId]);
    if (!openedNavbarMobile) toggleNavbarMobile();
    router.replace(NOTE_LIST_PATH);
  }

  const onClickPurge = async (noteId: string) => {
    const modalId = "confirm-delete-permanently-one";
    modals.openConfirmModal({
      modalId,
      title: "Delete Permanently",
      children: "Are you sure deleting this note permanently? It will be lost forever.",
      labels: { confirm: "Delete Permanently", cancel: "Cancel" },
      confirmProps: { color: "red" },
      closeOnConfirm: false,
      onConfirm: async () => {
        try {
          modals.updateModal({ modalId, confirmProps: { color: "red", loading: true } });
          await onConfirmPurge(noteId);
          modals.close(modalId);
        } catch (error) {
          modals.updateModal({ modalId, confirmProps: { color: "red", loading: false } });
          notifications.show({ title: "Error", message: (error as Error).message , color: "red" });
        }
      },
    });
  };

  return (
    <>
      {/* NOTE HEADER */}
      <AppShell.Header p="md">
        <div className="flex items-center justify-between gap-4">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <Tooltip label="Toggle Sidebar">
              <ActionIcon
                variant="transparent"
                color="dark"
                onClick={toggleNavbarDesktop}
                visibleFrom="sm"
              >
                <SidebarSimpleIcon
                  size={26}
                  weight={openedNavbarDesktop ? "fill" : "regular"}
                />
              </ActionIcon>
            </Tooltip>
            <Burger
              opened={openedNavbarMobile}
              onClick={toggleNavbarMobile}
              hiddenFrom="sm"
              size="sm"
            />
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {loaded && !!note?.id && (
              <>
                {!!note.deletedAt && (
                  <Tooltip label="Restore Note">
                    <ActionIcon
                      variant="transparent"
                      color="dark"
                      onClick={() => onClickRestore(note.id)}
                    >
                      <ArrowUUpLeftIcon
                        size={26}
                        weight="fill"
                      />
                    </ActionIcon>
                  </Tooltip>
                )}
                {/* NOTE OPTIONS */}
                <Menu shadow="md">
                  <Menu.Target>
                    <Tooltip label="Note Options">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                      >
                        <DotsThreeOutlineVerticalIcon />
                      </ActionIcon>
                    </Tooltip>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {!!note.deletedAt ? (
                      <>
                        <Menu.Item
                          color="red"
                          leftSection={<TrashIcon />}
                          onClick={() => onClickPurge(note.id)}
                        >
                          Delete Permanently
                        </Menu.Item>
                      </>
                    ) : (
                      <>
                        <Menu.Item
                          color="red"
                          leftSection={<TrashIcon />}
                          onClick={() => onClickDelete(note.id)}
                        >
                          Move To Trash
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
          </div>
        </div>
      </AppShell.Header>

      {/* NOTE CONTENT */}
      <AppShell.Main>
        <div className="h-full flex flex-col">
          {children}
        </div>
      </AppShell.Main>
    </>
  );
}
