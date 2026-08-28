import {
  PROTOTYPE_VIEW_SHELL_CLASS,
  PrototypeComponent,
} from "proto-plugin";
import { cn } from "ui";
import { useEffect, useRef } from "react";

import { CommunitySection } from "./community-section";
import { CtaSection } from "./cta-section";
import { DashboardSection } from "./dashboard-section";
import { ExamplesSection } from "./examples-section";
import { FrameworksSection } from "./frameworks-section";
import type { FrontCoverLiveState } from "./front-cover-types";
import type {
  FrontCoverDashboardTab,
  FrontCoverFrameworkId,
  FrontCoverHeroVariant,
  FrontCoverNavMenu,
} from "./front-cover-types";
import { HeroSection } from "./hero-section";
import { HeroVariantToggle } from "./hero-variant-toggle";
import { LogosSection } from "./logos-section";
import { OpenSourceSection } from "./open-source-section";
import { ProductsSection } from "./products-section";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { StoriesSection } from "./stories-section";

type HomePageProps = {
  liveState: FrontCoverLiveState;
  onNavMenuChange: (menu: FrontCoverNavMenu) => void;
  onDashboardTabChange: (tab: FrontCoverDashboardTab) => void;
  onFrameworkChange: (id: FrontCoverFrameworkId) => void;
  onHeroVariantChange: (variant: FrontCoverHeroVariant) => void;
};

export function HomePage({
  liveState,
  onNavMenuChange,
  onDashboardTabChange,
  onFrameworkChange,
  onHeroVariantChange,
}: HomePageProps) {
  const productsRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const frameworksRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target =
      liveState.scrollTarget === "products"
        ? productsRef.current
        : liveState.scrollTarget === "dashboard"
          ? dashboardRef.current
          : liveState.scrollTarget === "frameworks"
            ? frameworksRef.current
            : heroRef.current;

    target?.scrollIntoView({ block: "start" });
  }, [liveState.scrollTarget, liveState.previewStateId]);

  return (
    <PrototypeComponent
      id="home-page"
      className={cn(PROTOTYPE_VIEW_SHELL_CLASS, "flex h-full w-full flex-col bg-background")}
    >
      <SiteNav navMenu={liveState.navMenu} onNavMenuChange={onNavMenuChange} />
      <div className="relative min-h-0 flex-1 overflow-y-auto">
        <div ref={heroRef}>
          <header>
            <HeroSection variant={liveState.heroVariant} />
          </header>
        </div>
        <div ref={productsRef} id="products">
          <ProductsSection />
        </div>
        <section id="social-proof">
          <LogosSection />
        </section>
        <div ref={dashboardRef} id="dashboard">
          <DashboardSection
            dashboardTab={liveState.dashboardTab}
            onDashboardTabChange={onDashboardTabChange}
          />
        </div>
        <div ref={frameworksRef} id="frameworks">
          <FrameworksSection
            frameworkId={liveState.frameworkId}
            onFrameworkChange={onFrameworkChange}
          />
        </div>
        <ExamplesSection />
        <StoriesSection />
        <CommunitySection />
        <OpenSourceSection />
        <CtaSection />
        <SiteFooter />
      </div>
      <HeroVariantToggle
        variant={liveState.heroVariant}
        onVariantChange={onHeroVariantChange}
        registerOnly
      />
    </PrototypeComponent>
  );
}
