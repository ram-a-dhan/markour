import { ActionIcon, Avatar, Tooltip } from "@mantine/core";
import { NotepadIcon, SignOutIcon, TagIcon, TrashIcon } from "@phosphor-icons/react";
import { useSession } from "@/src/context/SessionContext";

const menu = [
  {
    title: "Notes",
    icon: NotepadIcon,
  },
  {
    title: "Trash",
    icon: TrashIcon,
  },
  {
    title: "Tags",
    icon: TagIcon,
  },
];

interface IMenuProps {
  closeDrawer: () => void;
}

export default function Menu({ closeDrawer }: IMenuProps) {
  const { user, logout } = useSession();

  return (
    <>
      {/* MENU LIST */}
      <div className="flex-1">
        {menu.map((item, index) => (
          <div
            key={index}
            className="p-4 flex items-center gap-2 cursor-pointer hover:bg-(--mantine-color-default-hover) active:bg-(--mantine-color-default-border) select-none"
            onClick={closeDrawer}
          >
            <span>
              {<item.icon size={24} />}
            </span>
            <p>
              {item.title}
            </p>
          </div>
        ))}
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
