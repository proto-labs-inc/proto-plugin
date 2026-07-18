import { PrototypeComponentLibraryBootstrapGate } from "@prototype/components/shell/prototype-component-library-bootstrap-gate";
import { PrototypeComponentLibraryShell } from "@prototype/components/shell/prototype-component-library-shell";
import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import type { ComponentLibraryProductTheme } from "@prototype/lib/use-component-library-product-theme";
import type { ReactNode } from "react";

type PrototypeComponentLibraryPageOptions = {
  children?: ReactNode;
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
  /** Product themes synced from the source design system (default: light + dark). */
  productThemes?: readonly ComponentLibraryProductTheme[];
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
    productThemes,
  } = options;

  const sourceDirectoryName = formatSourceDirectoryName(sourcePath);
  const isEmpty = !children;

  function ComponentLibraryPage() {
    return (
      <PrototypeComponentLibraryShell
        title={COMPONENT_LIBRARY_HEADER_TITLE}
        description={COMPONENT_LIBRARY_HEADER_DESCRIPTION}
        isEmpty={isEmpty}
        productThemes={productThemes}
      >
        <PrototypeComponentLibraryBootstrapGate
          isEmpty={isEmpty}
          sourcePath={sourceDirectoryName ?? sourcePath}
          syncConfigPath={syncConfigPath}
          componentLibraryPagePath={componentLibraryPagePath}
        >
          {children}
        </PrototypeComponentLibraryBootstrapGate>
      </PrototypeComponentLibraryShell>
    );
  }

  return ComponentLibraryPage;
}
