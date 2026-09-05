import { NavLink } from "@mantine/core";
import { useParams } from "next/navigation";
import { type ILocalNote } from "@/src/lib/localdb";

interface INoteItemProps {
  note: ILocalNote;
  onClickOpen: (id: string) => void;
}

export default function NoteItem({ note, onClickOpen }: INoteItemProps) {
  const [title, ...content] = note.content.trimStart().split("\n");

  const params = useParams<{ id?: string }>();

  return (
    <NavLink
      label={title.replace(/(&nbsp;|#)/g, "").trim() || "Untitled"}
      description={content.join(" ").trim()}
      active={params.id === note.id}
      onClick={() => onClickOpen(note.id)}
      variant="light"
      component="div"
      className="p-4!"
      classNames={{
        label: "text-base! truncate",
        description: "text-xs! truncate",
      }}
    />
  );
}
