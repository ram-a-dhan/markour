import { useRouter } from "next/navigation";
import { ActionIcon, Avatar, Tooltip } from "@mantine/core";
import { HOME_PATH, LOGOUT_API_PATH } from "@/src/constants/url";
import { REQUEST_METHOD } from "@/src/constants/misc";

const user = {
  name: "Carl Johnson",
  email: "carl.johnson@gtamail.com",
};

const menu = [
  {
    title: "Notes",
    icon: "🗒️",
  },
  {
    title: "Trash",
    icon: "🗑️",
  },
  {
    title: "Tags",
    icon: "🏷️",
  },
];

interface IMenuProps {
  closeDrawer: () => void;
}

export default function Menu({ closeDrawer }: IMenuProps) {
  const router = useRouter();

  const logout = async () => {
    try {
      await fetch(LOGOUT_API_PATH, { method: REQUEST_METHOD.POST });
      router.push(HOME_PATH);
      router.refresh();
    } catch (error) {
      console.log((error as Error).message);
    }
  };

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
            <span>{item.icon}</span>
            <p>{item.title}</p>
          </div>
        ))}
      </div>

      {/* USER ACCOUNT */}
      <footer
        key="footer"
        className="p-4 flex items-center gap-2 bg-(--mantine-color-body) border-t border-t-(--mantine-color-default-border) sticky bottom-0"
      >
        <Avatar size="40px" name={user.name} color="blue" />
        <div className="flex-1">
          <p className="mb-1">{user.name}</p>
          <p className="text-xs text-(--mantine-color-dimmed)">{user.email}</p>
        </div>
        <Tooltip label="Sign Out">
          <ActionIcon onClick={logout}>🚪</ActionIcon>
        </Tooltip>
      </footer>
    </>
  );
}
