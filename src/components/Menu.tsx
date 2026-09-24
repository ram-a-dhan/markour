import {
  type KeyboardEvent,
  useEffect,
  type MouseEventHandler,
} from "react";
import {
  ActionIcon,
  Avatar,
  Button,
  Collapse,
  NavLink,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useRovingIndex } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  CaretDownIcon,
  NotepadIcon,
  SignOutIcon,
  TagIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useSession } from "@/src/context/SessionContext";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import TagItem from "@/src/components/TagItem";
import { onKeyDownNavLink } from "@/src/utils/eventListener";

interface IMenuProps {
  openedDrawer: boolean;
  closeDrawer: () => void;
}

export default function Menu({ openedDrawer, closeDrawer }: IMenuProps) {
  const [expandedTags, { toggle: toggleTags }] = useDisclosure();
  const [editModeTags, { toggle: toggleEdit, close: closeEdit }] = useDisclosure();

  const { user, logout } = useSession();
  const { setSelectedNoteId, view, setView } = useNotes();
  const { tags, loaded } = useTags();

  const { getItemProps } = useRovingIndex({
    total: tags.length + 3,
    orientation: "vertical",
    loop: false,
  });

  const { getItemProps: tagGetItemProps } = useRovingIndex({
    total: tags.length,
    orientation: "vertical",
    loop: false,
  });

  useEffect(() => {
    if (!expandedTags || !openedDrawer) closeEdit();
  }, [expandedTags, openedDrawer, closeEdit]);

  const onClickNavItem = (mode: IView["mode"]) => {
    setView({ mode, tagId: undefined });
    setSelectedNoteId(null);
    closeDrawer();
  };

  const onClickEditMode: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    toggleEdit();
  };

  const onKeyDownEditMode = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      toggleEdit();
    }
  };

  const onClickLogout = async () => {
    const modalId = "confirm-logout";
    modals.openConfirmModal({
      modalId,
      title: "Sign Out",
      children: "Are you sure you want to sign out?",
      labels: { confirm: "Sign Out", cancel: "Cancel" },
      overlayProps: { blur: 2 },
      closeOnConfirm: false,
      onConfirm: async () => {
        modals.updateModal({ modalId, confirmProps: { loading: true } });
        await logout(() => {
          notifications.show({
            color: "blue",
            title: "Success Signing Out",
            message: "You have successfully signed out.",
          });
          modals.close(modalId);
        });
      },
    });
  };

  return (
    <>
      {/* MENU LIST */}
      <div className="h-full overflow-y-auto">
        <NavLink
          leftSection={<NotepadIcon size={24} />}
          label="Notes"
          active={view.mode === "notes"}
          variant="light"
          component="div"
          role="button"
          className="p-4!"
          classNames={{
            root: "focus:bg-(--mantine-color-gray-0)! dark:focus:bg-(--mantine-color-dark-6)! data-active:focus:bg-(--mantine-color-blue-light-hover)!", 
            label: "text-base!",
          }}
          {...getItemProps({
            index: 0,
            onClick: () => onClickNavItem("notes"),
            onKeyDown: (e) => onKeyDownNavLink(e, () => onClickNavItem("notes")),
          })}
        />
        <NavLink
          leftSection={<TrashIcon size={24} />}
          label="Trash"
          active={view.mode === "trash"}
          variant="light"
          component="div"
          role="button"
          className="p-4!"
          classNames={{
            root: "focus:bg-(--mantine-color-gray-0)! dark:focus:bg-(--mantine-color-dark-6)! data-active:focus:bg-(--mantine-color-blue-light-hover)!", 
            label: "text-base!",
          }}
          {...getItemProps({
            index: 1,
            onClick: () => onClickNavItem("trash"),
            onKeyDown: (e) => onKeyDownNavLink(e, () => onClickNavItem("trash")),
          })}
        />
        <NavLink
          leftSection={<TagIcon size={24} />}
          rightSection={
            <>
              {expandedTags && !!tags.length && (
                <Button
                  size="compact-xs"
                  variant="filled"
                  onClick={onClickEditMode}
                  onKeyDown={onKeyDownEditMode}
                >
                  {editModeTags ? "Stop Edit" : "Edit"}
                </Button>
              )}
              <CaretDownIcon
                size={24}
                className={`transition-transform duration-200 ${expandedTags ? "rotate-180" : "rotate-0"}`}
              />
            </>
          }
          label="Tags"
          active={false}
          variant="filled"
          component="div"
          role="button"
          className="p-4!"
          classNames={{
            root: "focus:bg-(--mantine-color-gray-0)! dark:focus:bg-(--mantine-color-dark-6)! data-active:focus:bg-(--mantine-color-blue-light-hover)!", 
            label: "text-base!",
            section: "gap-4"
          }}
          {...getItemProps({
            index: 2,
            onClick: toggleTags,
            onKeyDown: (e) => onKeyDownNavLink(e, toggleTags),
          })}
        />
        <Collapse expanded={expandedTags}>
          {loaded && !!tags.length && tags.map((t, i) => (
            <TagItem
              key={t.id}
              tag={t}
              editModeTags={editModeTags}
              closeDrawer={closeDrawer}
              getItemProps={getItemProps}
              index={i + 3}
              tagGetItemProps={tagGetItemProps}
              tagIndex={i}
            />
          ))}
          {loaded && !tags.length && (
            <div className="flex items-center justify-center h-14">
              <span className="italic text-(--mantine-color-dimmed)">
                Nothing here.
              </span>
            </div>
          )}
        </Collapse>
      </div>

      {/* USER ACCOUNT */}
      <footer
        key="footer"
        className="p-4 flex items-center gap-2 bg-(--mantine-color-body) border-t border-t-(--mantine-color-default-border) sticky bottom-0"
      >
        <Avatar
          src={user?.picture}
          size="40px"
          color="dark"
          name={user?.name}
          imageProps={{
            crossOrigin: "anonymous",
            referrerPolicy: "no-referrer",
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="mb-1 truncate">
            {user?.name}
          </p>
          <p className="text-xs text-(--mantine-color-dimmed) truncate">
            {user?.email}
          </p>
        </div>
        <Tooltip label="Sign Out">
          <ActionIcon
            variant="transparent"
            color="dark"
            onClick={onClickLogout}
          >
            <SignOutIcon size={26} />
          </ActionIcon>
        </Tooltip>
      </footer>
    </>
  );
}
