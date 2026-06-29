import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import { createPrototypeSiteLayout } from "proto-plugin";
import "proto-plugin/styles/globals.css";

import "./globals.css";

const PrototypeSiteLayout = createPrototypeSiteLayout();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prototypes",
  description: "UI experiments and concept explorations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PrototypeSiteLayout>{children}</PrototypeSiteLayout>
      </body>
    </html>
  );
}
