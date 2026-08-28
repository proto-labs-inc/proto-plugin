import { PrototypeComponent } from "proto-plugin";
import { Button } from "ui";

import { GITHUB_STAR_LABEL } from "./front-cover-mock-data";

export function OpenSourceSection() {
  return (
    <PrototypeComponent id="open-source-section" className="overflow-hidden border-b border-border">
      <div className="section-container grid items-center gap-10 py-16 lg:grid-cols-2">
        <div className="space-y-5">
          <h3 className="text-2xl text-foreground-lighter md:text-4xl">
            <span className="text-foreground">Open source</span>
            <br />
            from day one
          </h3>
          <p className="max-w-md text-foreground-lighter">
            Supabase is open source and built on Postgres. Self-host the stack or start a managed
            project in minutes.
          </p>
          <Button variant="default" size="medium">
            {GITHUB_STAR_LABEL} on GitHub
          </Button>
        </div>
        <div className="grid grid-cols-12 gap-[3px]">
          {Array.from({ length: 96 }).map((_, index) => {
            const intensity = (index * 13) % 7;
            return (
              <div
                key={index}
                className="aspect-square rounded-[2px]"
                style={{
                  background:
                    intensity > 4
                      ? "var(--brand-500)"
                      : intensity > 2
                        ? "color-mix(in oklch, var(--brand-500) 45%, transparent)"
                        : "var(--surface-200)",
                }}
              />
            );
          })}
        </div>
      </div>
    </PrototypeComponent>
  );
}
