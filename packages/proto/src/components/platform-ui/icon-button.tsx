"use client";

import { Button } from "@prototype/components/ui/button";
import { cn } from "@prototype/lib/utils";
import type { ComponentProps } from "react";

type IconButtonProps = ComponentProps<typeof Button>;

export function IconButton({ className, size = "icon", variant = "ghost", ...props }: IconButtonProps) {
  return (
    <Button
      size={size}
      variant={variant}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
