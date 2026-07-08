"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import {
  buildInviteFollowUpShapeLayoutDesignExplorationConfig,
  type InviteFollowUpShapeLayoutVariant,
} from "./invite-follow-up-shape-layout-design-exploration-config";
import { INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_SET } from "./partner-variant-sets";

type InviteFollowUpShapeLayoutVariantToggleProps = {
  variant: InviteFollowUpShapeLayoutVariant;
  onVariantChange: (next: InviteFollowUpShapeLayoutVariant) => void;
  overlayLayout?: boolean;
  registerOnly?: boolean;
};

export function InviteFollowUpShapeLayoutVariantToggle({
  variant,
  onVariantChange,
  overlayLayout = false,
  registerOnly = false,
}: InviteFollowUpShapeLayoutVariantToggleProps) {
  return (
    <PrototypeComponent
      id="invite-follow-up-shape-layout-variant-toggle"
      className={overlayLayout ? "relative z-20 mt-auto shrink-0" : "shrink-0"}
    >
      <PrototypeVariantExplorer
        {...buildInviteFollowUpShapeLayoutDesignExplorationConfig(
          variant,
          onVariantChange,
        )}
        variantSet={INVITE_FOLLOW_UP_SHAPE_LAYOUT_VARIANT_SET}
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
