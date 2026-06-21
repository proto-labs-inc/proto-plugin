import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

type EmptyStateProps = {
  children: ReactNode;
  className?: string;
};

export function EmptyState({ children, className }: EmptyStateProps) {
  return (
    <p className={cn("px-1 py-2 text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
