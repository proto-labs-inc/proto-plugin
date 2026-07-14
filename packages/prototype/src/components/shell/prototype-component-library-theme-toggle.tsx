"use client";

import { IconButton } from "@prototype/components/platform-ui/icon-button";
import { cn } from "@prototype/lib/utils";
import type { ComponentLibraryProductTheme } from "@prototype/lib/use-component-library-product-theme";
import { Moon, Sun } from "lucide-react";

type PrototypeComponentLibraryThemeToggleProps = {
  theme: ComponentLibraryProductTheme;
  onToggle: () => void;
};

/** Product-surface tokens — inherits from the managed scroll container theme. */
const TOGGLE_BUTTON_CLASS =
  "rounded-lg border-default bg-background text-foreground shadow-none hover:bg-accent hover:text-foreground";

export function PrototypeComponentLibraryThemeToggle({
  theme,
  onToggle,
}: PrototypeComponentLibraryThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <IconButton
      type="button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label={
        isDark
          ? "Switch component previews to Supabase Light"
          : "Switch component previews to Supabase Dark"
      }
      className={cn("size-9 shrink-0", TOGGLE_BUTTON_CLASS)}
    >
      {isDark ? (
        <Moon size={16} strokeWidth={2} aria-hidden />
      ) : (
        <Sun size={16} strokeWidth={2} aria-hidden />
      )}
    </IconButton>
  );
}
