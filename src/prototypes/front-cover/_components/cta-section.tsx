import { PrototypeComponent } from "proto-plugin";
import { Button } from "ui";

import { HERO_COPY } from "./front-cover-mock-data";

export function CtaSection() {
  return (
    <PrototypeComponent id="cta-section">
      <div className="relative overflow-hidden py-32">
        <div className="relative z-20 flex flex-col items-center gap-6 text-center">
          <h2 className="h2">
            <span className="text-foreground-lighter">Build in a weekend,</span>
            <span className="text-foreground block sm:inline"> scale to millions</span>
          </h2>
          <div className="flex items-center gap-2">
            <Button size="medium">{HERO_COPY.primaryCta}</Button>
            <Button size="medium" variant="default">
              {HERO_COPY.secondaryCta}
            </Button>
          </div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
