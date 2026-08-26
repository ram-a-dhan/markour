import { PropsWithChildren } from "react";
import { ActionIcon, AppShell, Burger, Menu, Tooltip } from "@mantine/core";
import { DotsThreeOutlineVerticalIcon, SidebarSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useNotes } from "@/src/context/NotesContext";
import { NOTE_LIST_PATH } from "@/src/constants/url";

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

  const { notes, loaded, deleteNote } = useNotes();

  const note = notes.find((n) => n.id === params.id);

  const onClickDelete = async (noteId: string) => {
    await deleteNote(noteId);
    router.replace(NOTE_LIST_PATH);
  };

  return (
    <>
      {/* NOTE HEADER */}
      <AppShell.Header p="md">
        <div className="flex items-center justify-between gap-4">
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

          <div className="flex items-center gap-4">
            {loaded && !!note?.id && (
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
                  <Menu.Item
                    color="red"
                    leftSection={<TrashIcon />}
                    onClick={() => onClickDelete(note.id)}
                  >
                    Move To Trash
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
        </div>
      </AppShell.Header>

      {/* NOTE CONTENT */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </>
  );
}
