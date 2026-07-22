"use client";

import { PrototypeDesignSystemEmptyState } from "@prototype/components/shell/prototype-design-system-empty-state";
import { PrototypeDesignSystemLoadingPanel } from "@prototype/components/shell/prototype-design-system-loading-panel";
import { useBootstrapPreview } from "@prototype/lib/prototypes/use-bootstrap-preview";
import type { ReactNode } from "react";

type PrototypeDesignSystemBootstrapGateProps = {
  children?: ReactNode;
  sourcePath?: string;
  syncConfigPath?: string;
  designSystemPagePath?: string;
  isEmpty?: boolean;
};

export function PrototypeDesignSystemBootstrapGate({
  children,
  sourcePath,
  syncConfigPath,
  designSystemPagePath,
  isEmpty = false,
}: PrototypeDesignSystemBootstrapGateProps) {
  const { isDesignSystemLoadingPanelVisible } = useBootstrapPreview();

  if (isEmpty) {
    return (
      <PrototypeDesignSystemEmptyState
        sourcePath={sourcePath}
        syncConfigPath={syncConfigPath}
        designSystemPagePath={designSystemPagePath}
      />
    );
  }

  if (isDesignSystemLoadingPanelVisible) {
    return <PrototypeDesignSystemLoadingPanel />;
  }

  return children;
}
