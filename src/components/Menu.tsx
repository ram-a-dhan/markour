import { useRouter } from "next/navigation";
import { ActionIcon, Avatar, Collapse, NavLink, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { CaretDownIcon, NotepadIcon, SignOutIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";
import { useSession } from "@/src/context/SessionContext";
import { useNotes } from "@/src/context/NotesContext";
import { useTags } from "@/src/context/TagsContext";
import { NOTE_LIST_PATH } from "@/src/constants/url";

interface IMenuProps {
  closeDrawer: () => void;
}

export default function Menu({ closeDrawer }: IMenuProps) {
  const [expandedTags, { toggle: toggleTags }] = useDisclosure();

  const router = useRouter();

  const { user, logout } = useSession();
  const { view, setView } = useNotes();
  const { tags } = useTags();

  const onClickNavItem = (mode: IView["mode"], tagId?: IView["tagId"]) => {
    setView({ mode, tagId: tagId ?? undefined });
    router.replace(NOTE_LIST_PATH);
    closeDrawer();
  };
  
  return (
    <>
      {/* MENU LIST */}
      <div className="flex-1">
        <NavLink
          leftSection={<NotepadIcon size={24} />}
          label="Notes"
          active={view.mode === "notes"}
          onClick={() => onClickNavItem("notes")}
          variant="filled"
          component="button"
          className="p-4!"
          classNames={{
            label: "text-base!",
          }}
        />
        <NavLink
          leftSection={<TrashIcon size={24} />}
          label="Trash"
          active={view.mode === "trash"}
          onClick={() => onClickNavItem("trash")}
          variant="filled"
          component="button"
          className="p-4!"
          classNames={{
            label: "text-base!",
          }}
        />
        <NavLink
          leftSection={<TagIcon size={24} />}
          rightSection={
            <CaretDownIcon
              size={24}
              className={`transition-transform duration-200 ${expandedTags ? "rotate-180" : "rotate-0"}`}
            />
          }
          label="Tags"
          active={false}
          onClick={toggleTags}
          variant="filled"
          component="button"
          className="p-4!"
          classNames={{
            label: "text-base!",
          }}
        />
        <Collapse expanded={expandedTags}>
          {tags.map((t) => (
            <NavLink
              key={t.id}
              leftSection={<div className="w-6" />}
              label={t.name}
              active={view.mode === "tag" && view.tagId === t.id}
              onClick={() => onClickNavItem("tag", t.id)}
              variant="filled"
              component="button"
              className="p-4!"
              classNames={{
                label: "text-base!"
              }}
            />
          ))}
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
          name={user?.name}
          color="dark"
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
            onClick={logout}
          >
            <SignOutIcon size={26} />
          </ActionIcon>
        </Tooltip>
      </footer>
    </>
  );
}
