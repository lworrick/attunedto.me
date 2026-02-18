import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-attune-sans",
  weight: ["400", "500", "600", "700"],
});

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
      <body className={`${dmSans.variable} font-sans min-h-screen bg-attune-sand text-attune-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
