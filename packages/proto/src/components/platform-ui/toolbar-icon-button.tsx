"use client";

import { IconButton } from "@prototype/components/platform-ui/icon-button";
import { cn } from "@prototype/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type ToolbarIconButtonProps = ComponentProps<typeof IconButton> & {
  children: ReactNode;
  wrapperClassName?: string;
};

/** Sidebar / panel icon control — shadcn ghost button. */
export function ToolbarIconButton({
  className,
  wrapperClassName,
  children,
  ...props
}: ToolbarIconButtonProps) {
  return (
    <div className={cn("inline-flex shrink-0", wrapperClassName)}>
      <IconButton
        variant="ghost"
        size="icon"
        className={cn(
          "size-8 text-[var(--tool-chrome-icon)] hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-icon-hover)]",
          className,
        )}
        {...props}
      >
        {children}
      </IconButton>
    </div>
  );
}
