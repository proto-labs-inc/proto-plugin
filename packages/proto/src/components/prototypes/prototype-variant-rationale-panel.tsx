"use client";

import { Panel, PanelSection } from "@prototype/components/platform-ui/panel";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import type { DesignExplorationRationale } from "@prototype/lib/prototypes/design-exploration-types";
import { cn } from "@prototype/lib/utils";

type PrototypeVariantRationalePanelProps = {
  componentId: string;
  rationale: DesignExplorationRationale;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  layout?: "default" | "sidebar";
  bodyClassName?: string;
};

export function PrototypeVariantRationalePanel({
  componentId,
  rationale,
  expanded,
  onExpandedChange,
  layout = "default",
  bodyClassName,
}: PrototypeVariantRationalePanelProps) {
  const isSidebar = layout === "sidebar";

  return (
    <PrototypeComponent id={componentId}>
      <Panel
        className={cn(
          "overflow-hidden rounded-lg bg-muted",
          isSidebar && "rounded-md",
        )}
      >
        <PanelSection
          title="Notes"
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          headerClassName={isSidebar ? "px-2.5 py-2 normal-case" : undefined}
          className="border-t-0"
        >
          <p className={cn("leading-relaxed", bodyClassName)}>
            {rationale.good} {rationale.bad}
          </p>
        </PanelSection>
      </Panel>
    </PrototypeComponent>
  );
}
