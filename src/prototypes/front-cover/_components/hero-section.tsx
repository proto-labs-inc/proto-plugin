import { PrototypeComponent } from "proto-plugin";
import { Button, cn } from "ui";

import { HERO_COPY } from "./front-cover-mock-data";
import type { FrontCoverHeroVariant } from "./front-cover-types";
import {
  OrbitCanvasDiagram,
  SignalFieldDiagram,
  StackCutawayDiagram,
} from "./hero-diagrams";

type HeroSectionProps = {
  variant: FrontCoverHeroVariant;
};

function HeroActions({ inverted }: { inverted?: boolean }) {
  return (
    <PrototypeComponent id="hero-section.actions" className="flex items-center gap-2">
      <Button size="medium" variant={inverted ? "secondary" : undefined}>
        {HERO_COPY.primaryCta}
      </Button>
      <Button size="medium" variant="default">
        {HERO_COPY.secondaryCta}
      </Button>
    </PrototypeComponent>
  );
}

function OriginalHero() {
  return (
    <div className="section-container pt-12 pb-8 md:pt-40 md:pb-16">
      <div className="flex flex-col gap-6 lg:gap-8">
        <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-2">
          <PrototypeComponent id="hero-section.headline">
            <h1 className="text-foreground text-4xl sm:text-5xl sm:leading-none">
              <span className="block">{HERO_COPY.lineOne}</span>
              <span className="text-brand block">{HERO_COPY.lineTwo}</span>
            </h1>
          </PrototypeComponent>
          <p className="text-foreground-lighter text-balance">{HERO_COPY.body}</p>
        </div>
        <HeroActions />
      </div>
    </div>
  );
}

function SignalFieldHero() {
  return (
    <div className="relative overflow-hidden bg-brand">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 16%, transparent) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="section-container relative grid items-center gap-10 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:py-28">
        <div className="flex flex-col gap-6">
          <PrototypeComponent id="hero-section.headline">
            <h1 className="text-foreground text-4xl sm:text-6xl sm:leading-none">
              <span className="block">{HERO_COPY.lineOne}</span>
              <span className="block">{HERO_COPY.lineTwo}</span>
            </h1>
          </PrototypeComponent>
          <p className="max-w-xl text-balance text-foreground/80">{HERO_COPY.body}</p>
          <HeroActions inverted />
        </div>
        <SignalFieldDiagram className="mx-auto aspect-square w-full max-w-[520px]" />
      </div>
    </div>
  );
}

function OrbitCanvasHero() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 70% at 78% 40%, color-mix(in oklch, var(--brand-500) 42%, transparent), transparent 62%), radial-gradient(50% 50% at 18% 80%, color-mix(in oklch, var(--warning) 22%, transparent), transparent 58%)",
        }}
      />
      <div className="section-container relative grid items-center gap-8 py-16 md:grid-cols-2 md:py-28">
        <div className="flex flex-col gap-6">
          <PrototypeComponent id="hero-section.headline">
            <h1 className="text-foreground text-4xl sm:text-5xl sm:leading-none">
              <span className="block">{HERO_COPY.lineOne}</span>
              <span className="text-brand block">{HERO_COPY.lineTwo}</span>
            </h1>
          </PrototypeComponent>
          <p className="max-w-xl text-balance text-foreground-lighter">{HERO_COPY.body}</p>
          <HeroActions />
        </div>
        <OrbitCanvasDiagram className="aspect-[6/5] w-full" />
      </div>
    </div>
  );
}

function StackCutawayHero() {
  return (
    <div className="border-b border-border bg-surface-75">
      <div className="section-container grid items-end gap-8 py-16 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:py-24">
        <div className="flex flex-col gap-6 pb-2">
          <PrototypeComponent id="hero-section.headline">
            <h1 className="text-foreground text-4xl sm:text-5xl sm:leading-none">
              <span className="block text-foreground-lighter">{HERO_COPY.lineOne}</span>
              <span className="block">{HERO_COPY.lineTwo}</span>
            </h1>
          </PrototypeComponent>
          <p className="max-w-md text-balance text-foreground-lighter">{HERO_COPY.body}</p>
          <HeroActions />
        </div>
        <StackCutawayDiagram className="aspect-[7/5] w-full" />
      </div>
    </div>
  );
}

export function HeroSection({ variant }: HeroSectionProps) {
  return (
    <PrototypeComponent
      id="hero-section"
      className={cn(variant === "original" && "bg-background")}
    >
      {variant === "signal-field" ? (
        <SignalFieldHero />
      ) : variant === "orbit-canvas" ? (
        <OrbitCanvasHero />
      ) : variant === "stack-cutaway" ? (
        <StackCutawayHero />
      ) : (
        <OriginalHero />
      )}
    </PrototypeComponent>
  );
}
