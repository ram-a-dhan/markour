import { PropsWithChildren } from "react";
import { ActionIcon, AppShell, Menu, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  ArrowUUpLeftIcon,
  DotsThreeOutlineVerticalIcon,
  ListIcon,
  PushPinIcon,
  PushPinSimpleSlashIcon,
  QuestionIcon,
  ShareNetworkIcon,
  SidebarSimpleIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { EditorProvider } from "@/src/context/EditorContext";
import HelpModal from "@/src/components/HelpModal";
import ShareModal from "@/src/components/ShareModal";

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
  const [openedHelpModal, { open: openHelpModal, close: closeHelpModal }] = useDisclosure();
  const [openedShareModal, { open: openShareModal, close: closeShareModal }] = useDisclosure();

  const {
    allNotes,
    selectedNoteId,
    setSelectedNoteId,
    loaded,
    togglePinnedNote,
    deleteNote,
    restoreNote,
    purgeNotes,
  } = useNotes();

  const note = selectedNoteId ? allNotes.find((n) => n.id === selectedNoteId) : undefined;

  const onClickRestore = async (noteId: string) => {
    await restoreNote(noteId);
    if (!openedNavbarMobile) toggleNavbarMobile();
    setSelectedNoteId(null);
    notifications.show({
      title: "Success Restoring Note",
      message: "Note restored successfully.",
    });
  };

  const onConfirmDelete = async (noteId: string) => {
    await deleteNote(noteId);
    if (!openedNavbarMobile) toggleNavbarMobile();
    setSelectedNoteId(null);
  };

  const onClickDelete = async (noteId: string) => {
    const modalId = "confirm-move-to-trash";
    modals.openConfirmModal({
      modalId,
      title: "Move to Trash",
      children: "Are you sure moving this note to the trash? It will still be accessible in the trash and can be restored later.",
      labels: { confirm: "Move to Trash", cancel: "Cancel" },
      overlayProps: { blur: 2 },
      confirmProps: { color: "red" },
      closeOnConfirm: false,
      onConfirm: async () => {
        modals.updateModal({ modalId, confirmProps: { color: "red", loading: true } });
        await onConfirmDelete(noteId);
        notifications.show({
          title: "Success Moving to Trash",
          message: "Note moved to Trash successfully.",
        });
        modals.close(modalId);
      },
    });
  };

  const onConfirmPurge = async (noteId: string) => {
    await purgeNotes([noteId]);
    if (!openedNavbarMobile) toggleNavbarMobile();
    setSelectedNoteId(null);
  }

  const onClickPurge = async (noteId: string) => {
    const modalId = "confirm-delete-permanently-one";
    modals.openConfirmModal({
      modalId,
      title: "Delete Permanently",
      children: "Are you sure deleting this note permanently? It will be lost forever.",
      labels: { confirm: "Delete Permanently", cancel: "Cancel" },
      overlayProps: { blur: 2 },
      confirmProps: { color: "red" },
      closeOnConfirm: false,
      onConfirm: async () => {
        try {
          modals.updateModal({
            modalId,
            confirmProps: { color: "red", loading: true },
          });
          await onConfirmPurge(noteId);
          notifications.show({
            title: "Success Deleting Note",
            message: "Note deleted successfully.",
          });
          modals.close(modalId);
        } catch (error) {
          modals.updateModal({
            modalId,
            confirmProps: { color: "red", loading: false },
          });
          notifications.show({
            color: "red",
            title: "Failed Deleting Note",
            message: (error as IFetchErr).message ,
          });
        }
      },
    });
  };

  const onClickTogglePinnedNote = async (noteId: string, isPinned: boolean) => {
    const titleAction = !isPinned ? "Pinning" : "Unpinning";
    const messageAction = !isPinned ? "pinned" : "unpinned";
    await togglePinnedNote(noteId);
    notifications.show({
      title: `Success ${titleAction} Note`,
      message: `Note ${messageAction} successfully.`,
    });
  };

  return (
    <EditorProvider>
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
            <Tooltip label="All Notes">
              <ActionIcon
                variant="transparent"
                color="dark"
                onClick={toggleNavbarMobile}
                hiddenFrom="sm"
              >
                {!!openedNavbarMobile ? (
                  <XIcon size={26} weight="bold" />
                ) : (
                  <ListIcon size={26} weight="bold" />
                )}
              </ActionIcon>
            </Tooltip>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {loaded && !!note?.id && (
              <>
                {!note.deletedAt && (
                  <>
                    <Tooltip label="Editor Guide">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        onClick={openHelpModal}
                        visibleFrom="xs"
                      >
                        <QuestionIcon size={26} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Share Note">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        onClick={openShareModal}
                        visibleFrom="xs"
                      >
                        <ShareNetworkIcon size={26} />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label={!note.pinned ? "Pin Note" : "Unpin Note"}>
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        onClick={() => onClickTogglePinnedNote(note.id, note.pinned)}
                        visibleFrom="xs"
                      >
                        {!note.pinned ? (
                          <PushPinIcon size={26} />
                        ) : (
                          <PushPinSimpleSlashIcon size={26} />
                        )}
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Move to Trash">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        onClick={() => onClickDelete(note.id)}
                        visibleFrom="xs"
                      >
                        <TrashIcon size={26} color="var(--mantine-color-red-6)" />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}

                {!!note.deletedAt && (
                  <>
                    <Tooltip label="Restore Note">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        onClick={() => onClickRestore(note.id)}
                        visibleFrom="xs"
                      >
                        <ArrowUUpLeftIcon
                          size={26}
                          weight="fill"
                        />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Delete Permanently">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        onClick={() => onClickPurge(note.id)}
                        visibleFrom="xs"
                      >
                        <TrashIcon size={26} color="var(--mantine-color-red-6)" />
                      </ActionIcon>
                    </Tooltip>
                  </>
                )}

                <Menu position="left-start" withOverlay overlayProps={{ blur: 2 }}>
                  <Menu.Target>
                    <Tooltip label="Note Options">
                      <ActionIcon
                        variant="transparent"
                        color="dark"
                        hiddenFrom="xs"
                      >
                        <DotsThreeOutlineVerticalIcon size={26} />
                      </ActionIcon>
                    </Tooltip>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {!note.deletedAt && (
                      <>
                        <Menu.Item
                          leftSection={<QuestionIcon size={26} />}
                          onClick={openHelpModal}
                          classNames={{ itemLabel: "text-base" }}
                        >
                          Editor Guide
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          leftSection={<ShareNetworkIcon size={26} />}
                          onClick={openShareModal}
                          classNames={{ itemLabel: "text-base" }}
                        >
                          Share Note
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          leftSection={!note.pinned ? (
                            <PushPinIcon size={26} />
                          ) : (
                            <PushPinSimpleSlashIcon size={26} />
                          )}
                          onClick={() => onClickTogglePinnedNote(note.id, note.pinned)}
                          classNames={{ itemLabel: "text-base" }}
                        >
                          {!note.pinned ? "Pin Note" : "Unpin Note"}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          color="red"
                          leftSection={<TrashIcon size={26} />}
                          onClick={() => onClickDelete(note.id)}
                        >
                          Move to Trash
                        </Menu.Item>
                      </>
                    )}

                    {!!note.deletedAt && (
                      <>
                        <Menu.Item
                          leftSection={<ArrowUUpLeftIcon size={26} />}
                          onClick={() => onClickRestore(note.id)}
                          classNames={{ itemLabel: "text-base" }}
                        >
                          Restore Note
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Item
                          color="red"
                          leftSection={<TrashIcon size={26} />}
                          onClick={() => onClickPurge(note.id)}
                        >
                          Delete Permanently
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

      {/* HELP MODAL */}
      <HelpModal
        opened={openedHelpModal}
        onClose={closeHelpModal}
      />

      {/* SHARE MODAL */}
      <ShareModal
        opened={openedShareModal}
        onClose={closeShareModal}
      />
    </EditorProvider>
  );
}
