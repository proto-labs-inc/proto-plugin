import { PROTOTYPE_SOURCE_SURFACE_ATTR } from "@prototype/lib/tool-portal";
import type { ReactNode } from "react";

import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "./prototype-gallery-shell";

type PrototypeComponentLibraryShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/** Component library content area — pinned to Supabase Light product tokens. */
export function PrototypeComponentLibraryShell({
  title,
  description,
  children,
}: PrototypeComponentLibraryShellProps) {
  return (
    <PrototypeGalleryPageLayout
      header={
        <PrototypeGalleryHeader
          title={title}
          description={description}
          className="mb-0"
        />
      }
      scrollClassName="light"
      scrollContainerProps={{
        "data-theme": "light",
        [PROTOTYPE_SOURCE_SURFACE_ATTR]: "",
        style: {
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
        },
      }}
    >
      {children}
    </PrototypeGalleryPageLayout>
  );
}
