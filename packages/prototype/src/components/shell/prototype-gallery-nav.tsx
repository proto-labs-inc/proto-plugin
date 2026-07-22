"use client";

import { ProtoLogoMark } from "@prototype/components/brand/proto-logo-mark";
import { useTrackEvent } from "@prototype/lib/prototypes/telemetry/prototype-telemetry-context";
import { cn } from "@prototype/lib/utils";
import { LayoutGrid, LibraryBig, ScrollText, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const GALLERY_NAV_ITEMS = [
  {
    href: "/",
    label: "Prototypes",
    icon: LayoutGrid,
  },
  {
    href: "/design-system",
    label: "Design system",
    icon: LibraryBig,
  },
  {
    href: "/agent-instructions",
    label: "Agent instructions",
    icon: ScrollText,
  },
] as const;

const GALLERY_NAV_ITEM_CLASS =
  "flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors text-[var(--tool-chrome-text-muted)] hover:bg-[var(--tool-chrome-gray-highlight)] hover:text-[var(--tool-chrome-text-heading)]";

type PrototypeGalleryNavProps = {
  sourceDirectoryName?: string;
  sourcePath?: string;
};

export function PrototypeGalleryNav(_props: PrototypeGalleryNavProps = {}) {
  const pathname = usePathname();
  const track = useTrackEvent();
  const isSettingsActive =
    pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <aside className="border-[var(--tool-chrome-border)] bg-[var(--bg-main)] flex h-full min-h-0 w-56 shrink-0 flex-col self-stretch overflow-hidden border-r">
      <nav aria-label="Gallery" className="flex flex-col gap-1 p-3">
        <div className="mb-2 flex items-center gap-2 px-3">
          <ProtoLogoMark className="size-3.5" />
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
              onClick={() => track("nav.clicked", { target: href, label })}
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
        <Link
          href="/settings"
          aria-current={isSettingsActive ? "page" : undefined}
          onClick={() => track("nav.clicked", { target: "/settings", label: "Settings" })}
          className={cn(
            GALLERY_NAV_ITEM_CLASS,
            "w-full min-w-0",
            isSettingsActive &&
              "bg-[var(--tool-chrome-gray-highlight)] text-[var(--tool-chrome-text-heading)]",
          )}
        >
          <Settings className="size-4 shrink-0" aria-hidden />
          Settings
        </Link>
      </div>
    </aside>
  );
}
