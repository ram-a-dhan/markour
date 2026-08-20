import { AppShell, Burger } from "@mantine/core";
import { PropsWithChildren } from "react";

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
          <Burger
            opened={openedNavbarDesktop}
            onClick={toggleNavbarDesktop}
            visibleFrom="sm"
            size="sm"
          />
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
