import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SHE Beauty Academy",
  description: "SHE Beauty Academy",
};

// Temporary until Phase 4 adds locale-aware routing.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}