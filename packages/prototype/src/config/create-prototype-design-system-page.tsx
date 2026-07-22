import { PrototypeDesignSystemBootstrapGate } from "@prototype/components/shell/prototype-design-system-bootstrap-gate";
import { PrototypeDesignSystemShell } from "@prototype/components/shell/prototype-design-system-shell";
import { formatSourceDirectoryName } from "@prototype/lib/format-source-directory-name";
import type { ComponentLibraryProductTheme } from "@prototype/lib/use-component-library-product-theme";
import type { ReactNode } from "react";

type PrototypeDesignSystemPageOptions = {
  children?: ReactNode;
  sourcePath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
  productThemes?: readonly ComponentLibraryProductTheme[];
};

const DESIGN_SYSTEM_HEADER_TITLE = "Design system";
const DESIGN_SYSTEM_HEADER_DESCRIPTION =
  "Design tokens from the source directory.";

export function createPrototypeDesignSystemPage(
  options: PrototypeDesignSystemPageOptions = {},
) {
  const {
    children,
    sourcePath = process.env.SOURCE_PATH,
    syncConfigPath,
    designSystemPagePath,
    productThemes,
  } = options;

  const sourceDirectoryName = formatSourceDirectoryName(sourcePath);
  const isEmpty = !children;

  function DesignSystemPage() {
    return (
      <PrototypeDesignSystemShell
        title={DESIGN_SYSTEM_HEADER_TITLE}
        description={DESIGN_SYSTEM_HEADER_DESCRIPTION}
        isEmpty={isEmpty}
        productThemes={productThemes}
      >
        <PrototypeDesignSystemBootstrapGate
          isEmpty={isEmpty}
          sourcePath={sourceDirectoryName ?? sourcePath}
          syncConfigPath={syncConfigPath}
          designSystemPagePath={designSystemPagePath}
        >
          {children}
        </PrototypeDesignSystemBootstrapGate>
      </PrototypeDesignSystemShell>
    );
  }

  return DesignSystemPage;
}
