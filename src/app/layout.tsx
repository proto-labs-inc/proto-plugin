import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import localFont from "next/font/local";
import { createPrototypeSiteLayout } from "proto-plugin";
import "proto-plugin/styles/globals.css";

import "./globals.css";
import {
  SUPABASE_PRODUCT_THEME,
} from "./supabase-product-theme.constants";
import { SupabaseProductTheme } from "./supabase-product-theme";
import { SupabaseTooltipProvider } from "./providers";

const PrototypeSiteLayout = createPrototypeSiteLayout();

const manrope = Manrope({
  variable: "--font-manrope",
  display: "swap",
  subsets: ["latin"],
});

const inter = localFont({
  src: "../../apps/studio/fonts/inter/InterVariable.woff2",
  variable: "--font-inter",
  preload: true,
  display: "swap",
  weight: "100 900",
});

const sourceCodePro = localFont({
  src: "../../apps/studio/fonts/source-code-pro/SourceCodePro-Variable.woff2",
  variable: "--font-source-code-pro",
  preload: true,
  display: "swap",
  weight: "200 900",
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
      className={`${SUPABASE_PRODUCT_THEME} ${inter.variable} ${manrope.variable} ${sourceCodePro.variable} h-full overflow-hidden antialiased`}
      data-theme={SUPABASE_PRODUCT_THEME}
      style={
        {
          "--font-sans": inter.style.fontFamily.replace(/'/g, ""),
          "--font-inter": inter.style.fontFamily.replace(/'/g, ""),
          "--font-heading": manrope.style.fontFamily.replace(/'/g, ""),
          "--font-manrope": manrope.style.fontFamily.replace(/'/g, ""),
          "--font-source-code-pro": sourceCodePro.style.fontFamily.replace(/'/g, ""),
        } as React.CSSProperties
      }
    >
      <body className="bg-dash-sidebar text-foreground flex h-full min-h-0 flex-col overflow-hidden">
        <SupabaseTooltipProvider>
          <SupabaseProductTheme />
          <PrototypeSiteLayout>{children}</PrototypeSiteLayout>
        </SupabaseTooltipProvider>
      </body>
    </html>
  );
}
