import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PrototypeShell } from "@prototype/components/shell/prototype-shell";
import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";

type PrototypePageProps = {
  params: Promise<{ slug: string }>;
};

export function createPrototypePage(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);

  function generateStaticParams() {
    return registry.getAllPrototypes().map((prototype) => ({
      slug: prototype.slug,
    }));
  }

  async function PrototypePage({ params }: PrototypePageProps) {
    const { slug } = await params;
    const prototype = registry.getPrototype(slug);
    const Component = registry.getPrototypeComponent(slug);
    const componentRegistry = registry.getPrototypeComponentRegistryForSlug(slug);

    if (!prototype || !Component) {
      notFound();
    }

    return (
      <Suspense fallback={null}>
        <PrototypeShell slug={slug} componentRegistry={componentRegistry}>
          <Component />
        </PrototypeShell>
      </Suspense>
    );
  }

  return { default: PrototypePage, generateStaticParams };
}
