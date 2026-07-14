"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import {
  buildInviteCopyDesignExplorationConfig,
  type InviteCopyVariant,
} from "./invite-copy-design-exploration-config";
import { INVITE_COPY_VARIANT_SET } from "./partner-variant-sets";

type InviteCopyVariantToggleProps = {
  variant: InviteCopyVariant;
  onVariantChange: (next: InviteCopyVariant) => void;
  overlayLayout?: boolean;
  registerOnly?: boolean;
};

export function InviteCopyVariantToggle({
  variant,
  onVariantChange,
  overlayLayout = false,
  registerOnly = false,
}: InviteCopyVariantToggleProps) {
  return (
    <PrototypeComponent
      id="invite-copy-variant-toggle"
      className={
        overlayLayout
          ? "relative z-20 mt-auto shrink-0"
          : "shrink-0"
      }
    >
      <PrototypeVariantExplorer
        {...buildInviteCopyDesignExplorationConfig(variant, onVariantChange)}
        variantSet={INVITE_COPY_VARIANT_SET}
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
