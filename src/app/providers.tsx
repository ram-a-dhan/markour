"use client";

import { PropsWithChildren } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { IconContext, type IconProps } from "@phosphor-icons/react";
import { SessionProvider } from "@/src/context/SessionContext";

const theme = createTheme({});

const iconsTheme: IconProps = {
  size: 20,
};

export default function Providers({ children }: PropsWithChildren) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications />
      <ModalsProvider>
        <IconContext.Provider value={iconsTheme}>
          <SessionProvider>
            {children}
          </SessionProvider>
        </IconContext.Provider>
      </ModalsProvider>
    </MantineProvider>
  );
}
