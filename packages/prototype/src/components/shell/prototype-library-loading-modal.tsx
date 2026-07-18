"use client";

import { PrototypeToolDialog } from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeComponentLibraryLoadingPanel } from "@prototype/components/shell/prototype-component-library-loading-panel";

type PrototypeLibraryLoadingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrototypeLibraryLoadingModal({
  open,
  onOpenChange,
}: PrototypeLibraryLoadingModalProps) {
  return (
    <PrototypeToolDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Component library syncing"
      description="New prototypes need synced base components. Browse existing prototypes while setup finishes."
      bodyClassName="gap-4"
      footer={null}
    >
      <PrototypeComponentLibraryLoadingPanel
        telemetryModal="library-loading-gate"
      />
    </PrototypeToolDialog>
  );
}
