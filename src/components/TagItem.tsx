import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionIcon, NavLink, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { XIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import { NOTE_LIST_PATH } from "@/src/constants/url";

interface ITagItemProps {
  tag: ITagFE;
  editModeTags: boolean;
  closeDrawer: () => void;
}

export default function TagItem({ tag, editModeTags, closeDrawer }: ITagItemProps) {
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);

  const { view, setView } = useNotes();
  const { deleteTag } = useTags();
  
  const router = useRouter();

  const onClickTagItem = (mode: IView["mode"], tagId: IView["tagId"]) => {
    setView({ mode, tagId });
    router.replace(NOTE_LIST_PATH);
    closeDrawer();
  };

  const onClickDeleteTag = async (tagId: string): Promise<void> => {
    try {
      setIsLoadingDelete(true);
      await deleteTag(tagId);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Error",
        message: (error as Error).message,
      });
    } finally {
      if (tagId === tag.id) setView({ mode: "notes", tagId: undefined });
      setIsLoadingDelete(false);
    }
  }

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
              onClick={(e) => {
                e.stopPropagation();
                onClickDeleteTag(tag.id);
              }}
              loading={isLoadingDelete}
            >
              <XIcon />
            </ActionIcon>
          </Tooltip>
        )
      }
      label={tag.name}
      active={view.mode === "tag" && view.tagId === tag.id}
      onClick={() => onClickTagItem("tag", tag.id)}
      variant="filled"
      component="div"
      className="p-4!"
      classNames={{
        label: "text-base!"
      }}
    />
  );
}