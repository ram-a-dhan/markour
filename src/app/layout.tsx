import "@mantine/core/styles.css";
import "@/src/styles/tailwind.css";
import "@/src/styles/reset.scss";
import "@/src/styles/global.scss";

import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import {
  ColorSchemeScript,
  MantineProvider,
  createTheme,
  mantineHtmlProps,
} from "@mantine/core";

export const metadata: Metadata = {
  title: "Markour",
  description: "Agile & Flexible Makdown Notes",
};

const theme = createTheme({});

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
