import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "@prototype/components/shell/prototype-gallery-shell";
import { PrototypeComponentLibraryClearButton } from "@prototype/components/shell/prototype-component-library-clear-button";
import { PrototypeComponentLibraryEmptyState } from "@prototype/components/shell/prototype-component-library-empty-state";
import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import { PROTOTYPE_SOURCE_SURFACE_ATTR } from "@prototype/lib/tool-portal";
import type { ReactNode } from "react";

type PrototypeComponentLibraryPageOptions = {
  children?: ReactNode;
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
};

const COMPONENT_LIBRARY_HEADER_TITLE = "Component Library";
const COMPONENT_LIBRARY_HEADER_DESCRIPTION =
  "Base components from the source directory.";

export function createPrototypeComponentLibraryPage(
  options: PrototypeComponentLibraryPageOptions = {},
) {
  const {
    children,
    sourcePath = process.env.SOURCE_PATH,
    syncConfigPath,
    componentLibraryPagePath,
  } = options;

  const sourceDirectoryName = formatSourceDirectoryName(sourcePath);
  const isEmpty = !children;

  function ComponentLibraryPage() {
    return (
      <PrototypeGalleryPageLayout
        scrollClassName="bg-white"
        header={
          <PrototypeGalleryHeader
            title={COMPONENT_LIBRARY_HEADER_TITLE}
            description={COMPONENT_LIBRARY_HEADER_DESCRIPTION}
            className="mb-0"
          />
        }
      >
        {isEmpty ? (
          <PrototypeComponentLibraryEmptyState
            sourcePath={sourceDirectoryName ?? sourcePath}
            syncConfigPath={syncConfigPath}
            componentLibraryPagePath={componentLibraryPagePath}
          />
        ) : (
          // Isolate synced host design-system components from the tool chrome
          // theme scoped to [data-prototype-root]. This surface pins neutral
          // product tokens (see packages/prototype/src/styles/globals.css), so
          // previews never inherit tool-chrome --primary/--font-sans. Hosts layer
          // their brand token values by scoping to [data-prototype-source-surface].
          <>
            <div
              className="light"
              data-theme="light"
              {...{ [PROTOTYPE_SOURCE_SURFACE_ATTR]: "" }}
            >
              {children}
            </div>
            <PrototypeComponentLibraryClearButton
              componentLibraryPagePath={componentLibraryPagePath}
            />
          </>
        )}
      </PrototypeGalleryPageLayout>
    );
  }

  return ComponentLibraryPage;
}
