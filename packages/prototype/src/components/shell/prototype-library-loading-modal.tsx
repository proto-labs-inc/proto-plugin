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
      hideHeader
      bodyClassName="gap-4"
      footer={null}
    >
      <PrototypeComponentLibraryLoadingPanel
        telemetryModal="library-loading-gate"
        className="max-w-none rounded-none border-0 bg-transparent p-0"
      />
    </PrototypeToolDialog>
  );
}
