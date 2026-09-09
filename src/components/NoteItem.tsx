import { NavLink } from "@mantine/core";
import { type ILocalNote } from "@/src/lib/localdb";
import { PushPinIcon } from "@phosphor-icons/react";
import { useNotes } from "@/src/context/NotesContext";

interface INoteItemProps {
  note: ILocalNote;
  onClickOpen: (id: string) => void;
}

export default function NoteItem({ note, onClickOpen }: INoteItemProps) {
  const [title, ...content] = note.content.trimStart().split("\n");

  const { selectedNoteId } = useNotes();

  return (
    <NavLink
      label={title.replace(/(&nbsp;|#)/g, "").trim() || "Untitled"}
      description={content.join(" ").trim()}
      active={note.id === selectedNoteId}
      onClick={() => onClickOpen(note.id)}
      variant="light"
      component="div"
      className="p-4!"
      classNames={{
        label: "text-base! truncate",
        description: "text-xs! truncate",
      }}
      rightSection={note.pinned && <PushPinIcon />}
    />
  );
}
