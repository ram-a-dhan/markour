import "@mantine/core/styles.css";
import "@/src/styles/tailwind.css";
import "@/src/styles/reset.scss";
import "@/src/styles/global.scss";

import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Markour",
  description: "Agile & Flexible Makdown Notes",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
