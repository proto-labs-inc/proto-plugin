import { IconSprites } from "@calcom/ui/components/icon";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import localFont from "next/font/local";
import { createPrototypeSiteLayout } from "proto-plugin";
import "proto-plugin/styles/globals.css";

import "./globals.css";
import { CalTooltipProvider } from "./providers";

const PrototypeSiteLayout = createPrototypeSiteLayout();

// Product fonts loaded from the synced source files (apps/web/…), not the network,
// so previews match the source app exactly and stay in sync via pnpm sync-from-source.
const inter = localFont({
  src: "../../apps/web/public/fonts/Inter-roman.var.woff2",
  variable: "--font-sans",
  preload: true,
  display: "swap",
  weight: "100 900",
});

const calFont = localFont({
  src: "../../apps/web/fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  preload: true,
  display: "swap",
  weight: "600",
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
      className={`${inter.variable} ${calFont.variable} ${dmSans.variable} h-full overflow-hidden antialiased`}
      style={
        {
          "--font-sans": inter.style.fontFamily.replace(/'/g, ""),
          "--font-cal": calFont.style.fontFamily.replace(/'/g, ""),
          "--font-product-sans": inter.style.fontFamily.replace(/'/g, ""),
          "--font-product-cal": calFont.style.fontFamily.replace(/'/g, ""),
        } as React.CSSProperties
      }
    >
      <body className="bg-default text-default flex h-full min-h-0 flex-col overflow-hidden">
        <div className="pointer-events-none fixed size-0 overflow-hidden" aria-hidden>
          <IconSprites />
        </div>
        <CalTooltipProvider>
          <PrototypeSiteLayout>{children}</PrototypeSiteLayout>
        </CalTooltipProvider>
      </body>
    </html>
  );
}
