import type { ComponentType } from "react";

import type { GalleryConfig } from "@prototype/server/gallery/gallery-types";
import type { BootstrapRequirementId } from "./prototype-bootstrap-status";
import type { PrototypeComponentRegistry } from "./prototype-component-registry";

export type PrototypeBootstrapConfig = {
  /** Order requirements are evaluated for auto onboarding. */
  requirementOrder?: BootstrapRequirementId[];
  /** Filesystem paths per sync requirement (any path passing = requirement satisfied). */
  paths?: {
    designTokens?: string[];
    uiPrimitives?: string[];
    sharedBlocks?: string[];
  };
};

export type PrototypeDefinition = {
  slug: string;
  title: string;
  screenshot: string;
  component: ComponentType;
  componentRegistry: PrototypeComponentRegistry;
  /** Full-page state map at `/prototypes/<slug>/states`. Omit to show the default empty map. */
  stateMapComponent?: ComponentType;
};

export type PrototypeExtraRoute = {
  /** URL segments, e.g. `["prototypes", "example-feature", "states"]` or `["section", "[groupId]", "[itemId]", "view"]`. */
  segments: string[];
  /** When set, wrap the page in `PrototypeShell` for this slug. */
  shellSlug?: string;
  component: ComponentType<Record<string, string>>;
  componentRegistry?: PrototypeComponentRegistry;
};

export type PrototypeMetadata = {
  slug: string;
  title: string;
  screenshot: string;
};

export type PrototypeConfig = {
  prototypes: PrototypeDefinition[];
  extraRoutes?: PrototypeExtraRoute[];
  /** KV + Blob gallery routes at `/api/gallery/*`. Set `false` to disable. */
  gallery?: GalleryConfig | false;
  /** Workspace bootstrap checks for auto onboarding. */
  bootstrap?: PrototypeBootstrapConfig;
};
