import { notFound } from "next/navigation";

import { createStarterScreenRegistry } from "@prototype/lib/prototypes/create-starter-screen-registry";
import type { StarterScreenConfig } from "@prototype/lib/prototypes/starter-screen-config-types";

export function createPrototypeStarterScreenPage(config: StarterScreenConfig) {
  const registry = createStarterScreenRegistry(config);

  function generateStaticParams() {
    return registry.getAllStarterScreens().map(({ slug }) => ({ slug }));
  }

  async function StarterScreenPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = await params;
    const screen = registry.getStarterScreen(slug);

    if (!screen) {
      notFound();
    }

    const Component = screen.component;

    return (
      <div className="light flex h-full min-h-0 w-full flex-col overflow-hidden" data-theme="light">
        <Component />
      </div>
    );
  }

  return { default: StarterScreenPage, generateStaticParams };
}
