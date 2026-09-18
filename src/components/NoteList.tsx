import { type ChangeEvent, useMemo } from "react";
import { ActionIcon, AppShell, Skeleton, TextInput, ThemeIcon, Tooltip } from "@mantine/core";
import { useRovingIndex } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
  GearFineIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import NoteItem from "@/src/components/NoteItem";

const DUMMY_LIST = Array.from({ length: 7 }, (_, i) => i + 1);

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
  const {
    loaded,
    notes,
    setSelectedNoteId,
    createNote,
    purgeNotes,
    view,
    searchQuery,
    setSearchQuery,
  } = useNotes();
  const { tags } = useTags();

  const { getItemProps } = useRovingIndex({
    total: notes.length,
    orientation: "vertical",
    loop: false,
  });

  const selectedTag = useMemo(() => {
    return tags.find((t) => t.id === view.tagId);
  }, [tags, view.tagId]);

  const onChangeSearchQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value);
  };

  const onDeleteSearchQuery = () => {
    setSearchQuery("");
  };

  const onClickCreate = async () => {
    const id = await createNote();
    if (openedNavbarMobile) closeNavbarMobile();
    setSelectedNoteId(id);
  };

  const onClickOpen = (id: string) => {
    if (openedNavbarMobile) closeNavbarMobile();
    setSelectedNoteId(id);
  };

  const onConfirmPurge = async () => {
    await purgeNotes(notes.map((n) => n.id));
    if (!openedNavbarMobile) closeNavbarMobile();
    setSelectedNoteId(null);
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
          modals.updateModal({
            modalId,
            confirmProps: { color: "red", loading: false },
          });
          notifications.show({
            color: "red",
            title: "Failed Deleting Notes",
            message: (error as IFetchErr).message ,
          });
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

      {/* NOTE SEARCHBAR */}
      <AppShell.Section
        px="md"
        h={48}
        className="grow-0 shrink-0 flex items-center border-b border-b-(--app-shell-border-color)"
        classNames={{
          section: searchQuery.length
            ? "bg-(--mantine-color-blue-light) hover:bg-(--mantine-color-blue-light-hover)"
            : "hover:bg-(--mantine-color-gray-0) dark:hover:bg-(--mantine-color-dark-6)",
        }}
      >
        <ThemeIcon
          variant="transparent"
          color="dark"
          classNames={{
            root: searchQuery.length
              ? "[&_svg]:text-(--mantine-color-blue-light-color)"
              : "",
          }}
        >
          <MagnifyingGlassIcon size={22} />
        </ThemeIcon>
        <TextInput
          size="md"
          variant="unstyled"
          placeholder="Search Notes..."
          className="flex-1 px-2"
          classNames={{
            input: searchQuery.length
              ? "text-(--mantine-color-blue-light-color)!"
              : "",
          }}
          value={searchQuery}
          onChange={onChangeSearchQuery}
        />
        <ActionIcon
          variant="transparent"
          color="dark"
          onClick={onDeleteSearchQuery}
          classNames={{
            root: searchQuery.length
              ? "[&_svg]:text-(--mantine-color-blue-light-color)"
              : "",
          }}
        >
          <XCircleIcon size={22} />
        </ActionIcon>
      </AppShell.Section>

      {/* NOTE LIST */}
      <AppShell.Section
        className="overscroll-contain overflow-y-auto"
        grow
      >
        {!loaded && DUMMY_LIST.map((i) => (
          <div key={`dummy${i}`} className="flex flex-col gap-2 p-4">
            <Skeleton height={16} width="50%" />
            <Skeleton height={12} />
          </div>
        ))}
        {loaded && !!notes.length && notes.map((n, i) => (
          <NoteItem
            key={n.id}
            note={n}
            onClickOpen={onClickOpen}
            getItemProps={getItemProps}
            index={i}
          />
        ))}
        {loaded && !notes.length && (
          <div className="flex items-center justify-center h-12">
            <span className="italic text-(--mantine-color-dimmed)">
              Nothing here.
            </span>
          </div>
        )}
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
