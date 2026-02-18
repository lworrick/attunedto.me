import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Attune — Gentle wellness tracking",
  description: "Body-neutral tracking for food, water, movement, sleep, and stress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
