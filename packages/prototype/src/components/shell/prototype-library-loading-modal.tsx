"use client";

import {
  PROTOTYPE_ONBOARDING_MODAL_MIN_HEIGHT_CLASS,
  PrototypeToolDialog,
} from "@prototype/components/platform-ui/prototype-tool-dialog";
import { PrototypeDesignSystemLoadingPanel } from "@prototype/components/shell/prototype-design-system-loading-panel";

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
      className={PROTOTYPE_ONBOARDING_MODAL_MIN_HEIGHT_CLASS}
      bodyClassName="gap-4"
      footer={null}
    >
      <PrototypeDesignSystemLoadingPanel
        telemetryModal="library-loading-gate"
        className="max-w-none rounded-none border-0 bg-transparent p-0"
      />
    </PrototypeToolDialog>
  );
}
