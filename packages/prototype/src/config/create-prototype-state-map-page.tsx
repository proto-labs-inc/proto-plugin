import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PrototypeDefaultStateMapPage } from "@prototype/components/prototypes/prototype-default-state-map-page";
import { PrototypeShell } from "@prototype/components/shell/prototype-shell";
import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";

type PrototypeStateMapPageProps = {
  params: Promise<{ slug: string }>;
};

export function createPrototypeStateMapPage(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);

  function generateStaticParams() {
    return registry.getAllPrototypes().map(({ slug }) => ({ slug }));
  }

  async function PrototypeStateMapPage({ params }: PrototypeStateMapPageProps) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);
    const StateMapComponent = registry.getPrototypeStateMapComponent(slug);
    const componentRegistry = registry.getPrototypeComponentRegistryForSlug(slug);

    if (!prototype) {
      notFound();
    }

    return (
      <Suspense fallback={null}>
        <PrototypeShell slug={slug} componentRegistry={componentRegistry}>
          {StateMapComponent ? (
            <StateMapComponent />
          ) : (
            <PrototypeDefaultStateMapPage slug={slug} />
          )}
        </PrototypeShell>
      </Suspense>
    );
  }

  return { default: PrototypeStateMapPage, generateStaticParams };
}
