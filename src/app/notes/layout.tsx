"use client";

import Image from "next/image";
import { PropsWithChildren } from "react";
import { AppShell, Drawer } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Menu from "@/src/components/Menu";
import NoteList from "@/src/components/NoteList";
import NoteDetail from "@/src/components/NoteDetail";
import { NotesProvider } from "@/src/context/NotesContext";
import { TagsProvider } from "@/src/context/TagsContext";
import MarkourLogo from "@/public/markour.svg";
import styles from "@/src/styles/modules/Drawer.module.scss";

export default function NotesLayout({ children }: PropsWithChildren) {
  const [openedDrawer, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const [openedNavbarDesktop, { toggle: toggleNavbarDesktop }] = useDisclosure(true);
  const [openedNavbarMobile, { toggle: toggleNavbarMobile, close: closeNavbarMobile }] = useDisclosure(true);

  return (
    <NotesProvider>
      <TagsProvider>
        <Drawer
          opened={openedDrawer}
          onClose={closeDrawer}
          size={300}
          overlayProps={{ blur: 2 }}
          classNames={{
            content: "overflow-hidden!",
            header: "h-15 p-4! border-b border-b-(--mantine-color-default-border)",
            body: "p-0! flex flex-col h-[calc(100%-60px)]",
          }}
          style={styles}
          keepMounted
          keepMountedMode="display-none"
          title={
            <div className="flex items-center gap-3">
              <Image
                src={MarkourLogo}
                alt="Markour Logo"
                loading="eager"
                width={24}
                height={24}
              />
              <h1 className="font-bold">Markour</h1>
            </div>
          }
        >
          <Menu
            openedDrawer={openedDrawer}
            closeDrawer={closeDrawer}
          />
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
            main: "h-dvh overflow-hidden ps-(--app-shell-navbar-offset,0rem)! pe-(--app-shell-aside-offset,0rem)! pt-(--app-shell-header-offset,0rem)! pb-0!",
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
      </TagsProvider>
    </NotesProvider>
  );
}
