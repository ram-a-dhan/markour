import { type KeyboardEvent, type MouseEvent, useState } from "react";
import { ActionIcon, NavLink, Tooltip } from "@mantine/core";
import { type UseRovingIndexGetItemPropsInput } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { XIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import { onKeyDownNavLink } from "@/src/utils/eventListener";

interface ITagItemProps {
  tag: ITagFE;
  editModeTags: boolean;
  closeDrawer: () => void;
  getItemProps: (options: UseRovingIndexGetItemPropsInput) => {
    tabIndex: 0 | -1;
    onKeyDown: React.KeyboardEventHandler;
    onClick: React.MouseEventHandler;
    ref: React.RefCallback<HTMLElement>;
  };
  index: number;
  tagGetItemProps: (options: UseRovingIndexGetItemPropsInput) => {
    tabIndex: 0 | -1;
    onKeyDown: React.KeyboardEventHandler;
    onClick: React.MouseEventHandler;
    ref: React.RefCallback<HTMLElement>;
  };
  tagIndex: number;
}

export default function TagItem({
  tag,
  editModeTags,
  closeDrawer,
  getItemProps,
  index,
  tagGetItemProps,
  tagIndex,
}: ITagItemProps) {
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

  const { setSelectedNoteId, view, setView } = useNotes();
  const { deleteTag } = useTags();

  const onClickTagItem = (mode: IView["mode"], tagId: IView["tagId"]) => {
    setView({ mode, tagId });
    setSelectedNoteId(null);
    closeDrawer();
  };

  const onConfirmDeleteTag = async (tagId: string): Promise<void> => {
    try {
      setIsLoadingDelete(true);
      await deleteTag(tagId);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Failed Deleting Tag",
        message: (error as IFetchErr).message,
      });
    } finally {
      if (tagId === tag.id) setView({ mode: "notes", tagId: undefined });
      setIsLoadingDelete(false);
    }
  }

  const onClickDeleteTag = async (event: MouseEvent, tagId: string): Promise<void> => {
    event.stopPropagation();
    await onConfirmDeleteTag(tagId);
  };

  const onKeyDownDeleteTag = async (event: KeyboardEvent, tagId: string): Promise<void> => {
    if (event.key === "Enter" || event.code === "Space") {
      event.preventDefault();
      event.stopPropagation();
      await onConfirmDeleteTag(tagId);
    }
  };

  return (
    <NavLink
      leftSection={<div className="w-6" />}
      rightSection={
        editModeTags && (
          <Tooltip label="Delete Tag">
            <ActionIcon
              color="red"
              size="sm"
              radius="xl"
              loading={isLoadingDelete}
              {...tagGetItemProps({
                index: tagIndex,
                onClick: (e) => onClickDeleteTag(e, tag.id),
                onKeyDown: (e) => onKeyDownDeleteTag(e, tag.id),
              })}
            >
              <XIcon />
            </ActionIcon>
          </Tooltip>
        )
      }
      label={tag.name}
      active={view.mode === "tag" && view.tagId === tag.id}
      variant="light"
      component="div"
      role="button"
      className="p-4!"
      classNames={{
        root: "focus:bg-(--mantine-color-gray-0)! dark:focus:bg-(--mantine-color-dark-6)! data-active:focus:bg-(--mantine-color-blue-light-hover)!", 
        label: "text-base!"
      }}
      {...getItemProps({
        index,
        onClick: () => onClickTagItem("tag", tag.id),
        onKeyDown: (e) => onKeyDownNavLink(e, () => onClickTagItem("tag", tag.id))
      })}
    />
  );
}