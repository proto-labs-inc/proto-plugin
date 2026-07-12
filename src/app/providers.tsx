"use client";

import type { ReactNode } from "react";
import { TooltipProvider } from "ui";

export function SupabaseTooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipProvider delayDuration={0}>{children}</TooltipProvider>;
}
