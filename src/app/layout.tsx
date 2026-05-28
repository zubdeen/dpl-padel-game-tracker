import type { Metadata } from "next";
import { Providers } from "./providers";
import "../styles.css";

export const metadata: Metadata = {
  title: "DPL App",
  description: "DPL Generated Project",
  authors: [{ name: "DPL" }],
  openGraph: {
    title: "DPL App",
    description: "DPL Generated Project",
    type: "website",
  },
  twitter: {
    card: "summary",
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
      </body>
    </html>
  );
}
