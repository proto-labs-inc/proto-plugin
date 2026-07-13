import { PrototypeComponentLibraryClearButton } from "@prototype/components/shell/prototype-component-library-clear-button";
import { PrototypeComponentLibraryEmptyState } from "@prototype/components/shell/prototype-component-library-empty-state";
import { PrototypeComponentLibraryShell } from "@prototype/components/shell/prototype-component-library-shell";
import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
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
      <PrototypeComponentLibraryShell
        title={COMPONENT_LIBRARY_HEADER_TITLE}
        description={COMPONENT_LIBRARY_HEADER_DESCRIPTION}
      >
        {isEmpty ? (
          <PrototypeComponentLibraryEmptyState
            sourcePath={sourceDirectoryName ?? sourcePath}
            syncConfigPath={syncConfigPath}
            componentLibraryPagePath={componentLibraryPagePath}
          />
        ) : (
          <>
            {children}
            <PrototypeComponentLibraryClearButton
              componentLibraryPagePath={componentLibraryPagePath}
            />
          </>
        )}
      </PrototypeComponentLibraryShell>
    );
  }

  return ComponentLibraryPage;
}
