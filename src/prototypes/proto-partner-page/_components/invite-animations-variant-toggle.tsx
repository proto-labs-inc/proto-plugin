"use client";

import { PrototypeComponent } from "proto-plugin";
import { PrototypeVariantExplorer } from "proto-plugin";

import {
  buildInviteAnimationsDesignExplorationConfig,
  type InviteAnimationsVariant,
} from "./invite-animations-design-exploration-config";
import { INVITE_ANIMATIONS_VARIANT_SET } from "./partner-variant-sets";

type InviteAnimationsVariantToggleProps = {
  variant: InviteAnimationsVariant;
  onVariantChange: (next: InviteAnimationsVariant) => void;
  overlayLayout?: boolean;
  registerOnly?: boolean;
};

export function InviteAnimationsVariantToggle({
  variant,
  onVariantChange,
  overlayLayout = false,
  registerOnly = false,
}: InviteAnimationsVariantToggleProps) {
  return (
    <PrototypeComponent
      id="invite-animations-variant-toggle"
      className={overlayLayout ? "relative z-20 mt-auto shrink-0" : "shrink-0"}
    >
      <PrototypeVariantExplorer
        {...buildInviteAnimationsDesignExplorationConfig(variant, onVariantChange)}
        variantSet={INVITE_ANIMATIONS_VARIANT_SET}
        mobbinGalleryId="invite-animations-mobbin-inspiration-gallery"
        wrapRoot={false}
        registerOnly={registerOnly}
      />
    </PrototypeComponent>
  );
}
