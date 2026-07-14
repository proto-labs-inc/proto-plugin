"use client";

import { DropdownMenuItem } from "@prototype/components/ui/dropdown-menu";
import { Separator } from "@prototype/components/ui/separator";
import { cn } from "@prototype/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type ReviewDropdownMenuItemProps = ComponentProps<typeof DropdownMenuItem> & {
  selected?: boolean;
  children: ReactNode;
};

export function ReviewDropdownMenuItem({
  selected = false,
  className,
  children,
  ...props
}: ReviewDropdownMenuItemProps) {
  return (
    <DropdownMenuItem
      className={cn(selected && "bg-accent", className)}
      {...props}
    >
      {children}
    </DropdownMenuItem>
  );
}

export function ReviewDropdownMenuSeparator({
  className,
}: {
  className?: string;
}) {
  return <Separator className={cn("my-1", className)} />;
}
