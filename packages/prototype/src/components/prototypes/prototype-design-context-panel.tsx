"use client";

import { CodeBlock } from "@prototype/components/platform-ui/code-block";
import { Panel, PanelSection } from "@prototype/components/platform-ui/panel";
import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";

import type { DesignExplorationContext } from "@prototype/lib/prototypes/design-exploration-types";

function DefaultContextJsonView({
  data,
  compact = false,
}: {
  data: unknown;
  compact?: boolean;
}) {
  const formatted =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  return <CodeBlock compact={compact}>{formatted}</CodeBlock>;
}

type PrototypeDesignContextPanelProps = {
  componentId: string;
  context: DesignExplorationContext;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  layout?: "default" | "sidebar";
};

export function PrototypeDesignContextPanel({
  componentId,
  context,
  expanded,
  onExpandedChange,
  layout = "default",
}: PrototypeDesignContextPanelProps) {
  const isSidebar = layout === "sidebar";
  const panelId = context.panelId ?? `${componentId}-context-panel`;

  return (
    <PrototypeComponent id={componentId} className={isSidebar ? undefined : "mt-4"}>
      <Panel className={cn("overflow-hidden rounded-lg bg-muted", isSidebar && "rounded-md")}>
        <PanelSection
          title={context.label}
          expanded={expanded}
          onExpandedChange={onExpandedChange}
          headerClassName={isSidebar ? "px-2.5 py-2 normal-case" : undefined}
          className="border-t-0"
        >
          <div id={panelId} className={cn(isSidebar && "text-sm")}>
            {context.render ? (
              context.render(context.data)
            ) : (
              <DefaultContextJsonView
                data={context.data}
                compact={isSidebar}
              />
            )}
          </div>
        </PanelSection>
      </Panel>
    </PrototypeComponent>
  );
}
