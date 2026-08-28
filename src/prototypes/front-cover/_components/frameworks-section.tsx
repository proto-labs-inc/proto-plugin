import { PrototypeComponent } from "proto-plugin";
import { cn } from "ui";

import { FRAMEWORKS } from "./front-cover-mock-data";
import type { FrontCoverFrameworkId } from "./front-cover-types";

type FrameworksSectionProps = {
  frameworkId: FrontCoverFrameworkId;
  onFrameworkChange: (id: FrontCoverFrameworkId) => void;
};

export function FrameworksSection({
  frameworkId,
  onFrameworkChange,
}: FrameworksSectionProps) {
  const active = FRAMEWORKS.find((framework) => framework.id === frameworkId) ?? FRAMEWORKS[0];

  return (
    <PrototypeComponent id="frameworks-section" className="border-b border-border">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 md:gap-0">
          <h3 className="text-2xl text-foreground-lighter md:text-4xl">
            Use Supabase with <span className="text-foreground md:block">{active.name}</span>
          </h3>
          <div className="flex flex-col overflow-hidden rounded-md border border-border">
            <PrototypeComponent
              id="frameworks-section.tabs"
              className="grid grid-cols-6 border-b border-border"
              role="tablist"
              aria-label="Framework"
            >
              {FRAMEWORKS.map((framework) => (
                <button
                  key={framework.id}
                  type="button"
                  role="tab"
                  aria-selected={framework.id === frameworkId}
                  aria-label={framework.name}
                  onClick={() => onFrameworkChange(framework.id)}
                  className={cn(
                    "flex items-center justify-center border-r border-border py-4 text-xs last:border-r-0",
                    framework.id === frameworkId
                      ? "bg-surface-75 text-foreground"
                      : "text-foreground-muted hover:bg-surface-75/50 hover:text-foreground-light",
                  )}
                >
                  {framework.name.slice(0, 2)}
                </button>
              ))}
            </PrototypeComponent>
            <PrototypeComponent
              id="frameworks-section.code"
              className="bg-foreground p-5 font-mono text-xs leading-relaxed text-brand"
            >
              <pre>{active.snippet}</pre>
            </PrototypeComponent>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
