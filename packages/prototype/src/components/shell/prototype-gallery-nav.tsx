"use client";

import { IconButton } from "@prototype/components/platform-ui/icon-button";
import { Button } from "@prototype/components/ui/button";
import { PrototypeLinkSourceModal } from "@prototype/components/shell/prototype-link-source-modal";
import { cn } from "@prototype/lib/utils";
import { usePrototypeToolTheme } from "@prototype/lib/prototypes/use-prototype-tool-theme";
import { LayoutGrid, LibraryBig, Moon, Pencil, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const GALLERY_NAV_ITEMS = [
  {
    href: "/",
    label: "Prototypes",
    icon: LayoutGrid,
  },
  {
    href: "/component-library",
    label: "Component Library",
    icon: LibraryBig,
  },
] as const;

type PrototypeGalleryNavProps = {
  sourceDirectoryName?: string;
  sourcePath?: string;
};

export function PrototypeGalleryNav({
  sourceDirectoryName,
  sourcePath,
}: PrototypeGalleryNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = usePrototypeToolTheme();
  const [linkSourceOpen, setLinkSourceOpen] = useState(false);

  return (
    <aside className="border-[var(--tool-chrome-border)] bg-[var(--bg-main)] flex h-full min-h-0 w-56 shrink-0 flex-col self-stretch overflow-hidden border-r">
      <nav aria-label="Gallery" className="flex flex-col gap-1 p-3">
        <div className="mb-2 flex items-center gap-2 px-3">
          <img
            src="/proto-logo.png"
            alt=""
            width={14}
            height={14}
            className="size-3.5 shrink-0 object-contain"
          />
          <span className="text-lg font-bold text-[var(--tool-chrome-text-heading)]">
            Proto
          </span>
        </div>
        {GALLERY_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--tool-chrome-gray-highlight)] text-[var(--tool-chrome-text-heading)]"
                  : "text-[var(--tool-chrome-text-muted)] hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-text-heading)]",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-[var(--tool-chrome-border)] mt-auto border-t p-3">
        <div className="flex min-w-0 items-center gap-2">
          <IconButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
            className="size-8 shrink-0 text-[var(--tool-chrome-text-muted)] hover:text-[var(--tool-chrome-text-heading)]"
          >
            {theme === "light" ? (
              <Moon size={16} strokeWidth={2} aria-hidden />
            ) : (
              <Sun size={16} strokeWidth={2} aria-hidden />
            )}
          </IconButton>
          {sourceDirectoryName ? (
            <>
              <span
                className="min-w-0 flex-1 truncate text-xs text-[var(--tool-chrome-text-muted)]"
                title={sourcePath ?? sourceDirectoryName}
              >
                {sourceDirectoryName}
              </span>
              <IconButton
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setLinkSourceOpen(true)}
                aria-label="Change linked source app"
                className="size-7 shrink-0 text-[var(--tool-chrome-text-muted)] hover:text-[var(--tool-chrome-text-heading)]"
              >
                <Pencil size={14} strokeWidth={2} aria-hidden />
              </IconButton>
            </>
          ) : (
            <Button
              type="button"
              variant="chrome"
              onClick={() => setLinkSourceOpen(true)}
              className="h-9 min-w-0 flex-1 justify-center rounded-lg text-sm font-medium"
            >
              Link source
            </Button>
          )}
        </div>
      </div>

      <PrototypeLinkSourceModal
        open={linkSourceOpen}
        onOpenChange={setLinkSourceOpen}
        currentSourcePath={sourcePath}
      />
    </aside>
  );
}
