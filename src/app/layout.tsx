import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/src/styles/tailwind.css";
import "@/src/styles/reset.scss";
import "@/src/styles/global.scss";

import type { Metadata } from "next";
import { PropsWithChildren } from "react";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import Providers from "@/src/app/providers";
import VueFlags from "@/src/components/VueFlags";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.BASE_URL!),
  title: "Markour - Markdown Notes",
  description: "Agile & Flexible Makdown Notes",
  icons: {
    icon: [
      { url: "/markour.svg", type: "image/svg+xml" },
      { url: "/markour-192.png", sizes: "192x192", type: "image/png" },
      { url: "/markour-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Markour - Markdown Notes",
    siteName: "Markour - Markdown Notes",
    description: "Agile & Flexible Markdown Notes",
    url: "/",
    images: [
      {
        url: "/markour-og.png",
        width: 1200,
        height: 630,
        alt: "Markour - Markdown Notes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/markour-og.png"],
  },
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <VueFlags />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
