import { NavLink, ThemeIcon } from "@mantine/core";
import { type UseRovingIndexGetItemPropsInput } from "@mantine/hooks";
import { PushPinIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";
import { type ILocalNote } from "@/src/lib/localdb";
import { onKeyDownNavLink } from "@/src/utils/eventListener";

interface INoteItemProps {
  note: ILocalNote;
  onClickOpen: (id: string) => void;
  getItemProps: (options: UseRovingIndexGetItemPropsInput) => {
    tabIndex: 0 | -1;
    onKeyDown: React.KeyboardEventHandler;
    onClick: React.MouseEventHandler;
    ref: React.RefCallback<HTMLElement>;
  };
  index: number;
}

export default function NoteItem({
  note,
  onClickOpen,
  getItemProps,
  index,
}: INoteItemProps) {
  const [title, ...content] = note.content.trimStart().split("\n");

  const { selectedNoteId } = useNotes();

  return (
    <NavLink
      label={title.replace(/(&nbsp;|#)/g, "").trim() || "Untitled"}
      description={content.join(" ").trim()}
      active={note.id === selectedNoteId}
      variant="light"
      component="div"
      role="button"
      className="p-4!"
      classNames={{
        root: "focus:bg-(--mantine-color-gray-0)! dark:focus:bg-(--mantine-color-dark-6)! data-active:focus:bg-(--mantine-color-blue-light-hover)!",
        label: "text-base! truncate",
        description: "text-xs! truncate",
        // section: "sendnudes"
      }}
      rightSection={note.pinned && (
        <ThemeIcon
          variant="transparent"
          color="dark"
        >
          <PushPinIcon />
        </ThemeIcon>
      )}
      {...getItemProps({
        index,
        onClick: () => onClickOpen(note.id),
        onKeyDown: (e) => onKeyDownNavLink(e, () => onClickOpen(note.id)),
      })}
    />
  );
}
