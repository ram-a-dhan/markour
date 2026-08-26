"use client";

import { PropsWithChildren } from "react";
import { AppShell, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Menu from "@/src/components/Menu";
import NoteList from "@/src/components/NoteList";
import NoteDetail from "@/src/components/NoteDetail";
import { NotesProvider } from "@/src/context/NotesContext";

export default function NotesLayout({ children }: PropsWithChildren) {
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [openedNavbarDesktop, { toggle: toggleNavbarDesktop }] = useDisclosure(true);
  const [openedNavbarMobile, { toggle: toggleNavbarMobile, close: closeNavbarMobile }] = useDisclosure(true);

  return (
    <NotesProvider>
      <Drawer
        opened={openedDrawer}
        onClose={closeDrawer}
        size={300}
        overlayProps={{ blur: 2 }}
        classNames={{
          header: "h-15 border-b border-b-(--mantine-color-default-border)",
          body: "p-0! flex flex-col h-[calc(100%-60px)]",
        }}
        keepMounted
        keepMountedMode="display-none"
      >
        <Menu closeDrawer={closeDrawer} />
      </Drawer>

      <AppShell
        padding="md"
        layout="alt"
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: {
            mobile: !openedNavbarMobile,
            desktop: !openedNavbarDesktop,
          },
        }}
        classNames={{
          root: "h-full",
          main: "h-full flex flex-col",
        }}
      >
        <NoteList
          openDrawer={openDrawer}
          openedNavbarMobile={openedNavbarMobile}
          closeNavbarMobile={closeNavbarMobile}
        />

        <NoteDetail
          openedNavbarDesktop={openedNavbarDesktop}
          toggleNavbarDesktop={toggleNavbarDesktop}
          openedNavbarMobile={openedNavbarMobile}
          toggleNavbarMobile={toggleNavbarMobile}
        >
          {children}
        </NoteDetail>
      </AppShell>
    </NotesProvider>
  );
}
