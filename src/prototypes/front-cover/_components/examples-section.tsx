import { PrototypeComponent } from "proto-plugin";

import { EXAMPLES } from "./front-cover-mock-data";

export function ExamplesSection() {
  return (
    <PrototypeComponent id="examples-section" className="border-b border-border">
      <div className="section-container space-y-8 py-16">
        <h3 className="text-2xl text-foreground-lighter md:text-4xl">
          <span className="text-foreground">Start building in seconds</span>
          <br className="hidden sm:block" /> Kickstart your next project with templates
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMPLES.map((example) => (
            <div
              key={example.title}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface-75 p-4"
            >
              <div className="h-28 rounded-md border border-border bg-surface-200" />
              <p className="text-sm text-foreground">{example.title}</p>
              <p className="text-xs text-foreground-lighter">{example.stack}</p>
            </div>
          ))}
        </div>
      </div>
    </PrototypeComponent>
  );
}
