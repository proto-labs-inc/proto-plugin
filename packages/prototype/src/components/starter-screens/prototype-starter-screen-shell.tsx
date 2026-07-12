"use client";

import type { ReactNode } from "react";

import { PrototypeStarterScreenChrome } from "./prototype-starter-screen-chrome";

type PrototypeStarterScreenShellProps = {
  children: ReactNode;
};

export function PrototypeStarterScreenShell({
  children,
}: PrototypeStarterScreenShellProps) {
  return (
    <div className="bg-[var(--bg-ground)] flex h-svh min-h-0 w-full flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
      <PrototypeStarterScreenChrome />
    </div>
  );
}
