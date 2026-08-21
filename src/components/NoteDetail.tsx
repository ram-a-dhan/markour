import { PropsWithChildren } from "react";
import { ActionIcon, AppShell, Burger, Tooltip } from "@mantine/core";
import { SidebarSimpleIcon } from "@phosphor-icons/react";

interface INoteDetailProps extends PropsWithChildren {
  openedNavbarDesktop: boolean;
  toggleNavbarDesktop: () => void;
  openedNavbarMobile: boolean;
  toggleNavbarMobile: () => void;
}

export default function NoteDetail({
  openedNavbarDesktop,
  toggleNavbarDesktop,
  openedNavbarMobile,
  toggleNavbarMobile,
  children,
}: INoteDetailProps) {
  return (
    <>
      {/* NOTE HEADER */}
      <AppShell.Header p="md">
        <div className="flex items-center gap-4">
          <Tooltip label="Toggle Sidebar">
            <ActionIcon
             variant="transparent"
             color="dark"
             onClick={toggleNavbarDesktop}
             visibleFrom="sm"
            >
              <SidebarSimpleIcon
                size={26}
                weight={openedNavbarDesktop ? "fill" : "regular"}
              />
            </ActionIcon>
          </Tooltip>
          <Burger
            opened={openedNavbarMobile}
            onClick={toggleNavbarMobile}
            hiddenFrom="sm"
            size="sm"
          />
        </div>
      </AppShell.Header>

      {/* NOTE CONTENT */}
      <AppShell.Main>{children}</AppShell.Main>
    </>
  );
}
