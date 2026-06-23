import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "./providers";
import "../styles.css";
import { dplLogo } from "@/lib/team-logos";

export const metadata: Metadata = {
  title: "DPL",
  description: "DPL Built Project",
  authors: [{ name: "DPL" }],
  openGraph: {
    title: "DPL",
    description: "DPL Built Project",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
  icons: {
    icon: dplLogo,
    shortcut: dplLogo,
    apple: dplLogo,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
