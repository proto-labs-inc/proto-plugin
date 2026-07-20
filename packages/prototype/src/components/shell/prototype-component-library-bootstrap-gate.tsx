"use client";

import { PrototypeComponentLibraryLoadingPanel } from "@prototype/components/shell/prototype-component-library-loading-panel";
import { useBootstrapPreview } from "@prototype/lib/prototypes/use-bootstrap-preview";
import type { ReactNode } from "react";

type PrototypeComponentLibraryBootstrapGateProps = {
  children?: ReactNode;
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
  isEmpty?: boolean;
};

export function PrototypeComponentLibraryBootstrapGate({
  children,
  sourcePath,
  syncConfigPath,
  componentLibraryPagePath,
  isEmpty = false,
}: PrototypeComponentLibraryBootstrapGateProps) {
  const { isComponentLibraryLoadingPanelVisible } = useBootstrapPreview();

  if (isComponentLibraryLoadingPanelVisible || isEmpty) {
    return <PrototypeComponentLibraryLoadingPanel />;
  }

  return children;
}
