import "server-only";

import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PrototypeShell } from "@prototype/components/shell/prototype-shell";
import { PrototypeDefaultStateMapPage } from "@prototype/components/prototypes/prototype-default-state-map-page";
import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type {
  PrototypeConfig,
  PrototypeExtraRoute,
} from "@prototype/lib/prototypes/prototype-config-types";

import { createPrototypePage } from "./create-prototype-page";

function matchExtraRoute(
  path: string[],
  pattern: string[],
  params: Record<string, string>,
): boolean {
  if (path.length !== pattern.length) return false;

  for (let index = 0; index < pattern.length; index += 1) {
    const segment = pattern[index]!;
    const value = path[index]!;

    if (segment.startsWith("[") && segment.endsWith("]")) {
      params[segment.slice(1, -1)] = value;
      continue;
    }

    if (segment !== value) return false;
  }

  return true;
}

function findExtraRoute(
  path: string[],
  routes: PrototypeExtraRoute[] | undefined,
): { route: PrototypeExtraRoute; params: Record<string, string> } | null {
  for (const route of routes ?? []) {
    const params: Record<string, string> = {};
    if (matchExtraRoute(path, route.segments, params)) {
      return { route, params };
    }
  }
  return null;
}

export function createPrototypeCatchAllPage(config: PrototypeConfig) {
  const registry = createPrototypeRegistry(config);
  const prototypePage = createPrototypePage(config);

  function generateStaticParams() {
    const prototypePaths = prototypePage.generateStaticParams().map(({ slug }) => ({
      path: ["prototypes", slug],
    }));
    const stateMapPaths = registry.getAllPrototypes().map(({ slug }) => ({
      path: ["prototypes", slug, "states"],
    }));

    return [...prototypePaths, ...stateMapPaths];
  }

  async function CatchAllPage({
    params,
  }: {
    params: Promise<{ path?: string[] }>;
  }) {
    const { path = [] } = await params;

    if (path.length === 2 && path[0] === "prototypes") {
      const slug = path[1]!;
      return prototypePage.default({ params: Promise.resolve({ slug }) });
    }

    const extra = findExtraRoute(path, config.extraRoutes);
    if (extra) {
      const { route, params: routeParams } = extra;
      const Component = route.component;

      if (route.shellSlug && route.componentRegistry) {
        return (
          <Suspense fallback={null}>
            <PrototypeShell
              slug={route.shellSlug}
              componentRegistry={route.componentRegistry}
            >
              <Component {...routeParams} />
            </PrototypeShell>
          </Suspense>
        );
      }

      return <Component {...routeParams} />;
    }

    if (path.length === 3 && path[0] === "prototypes" && path[2] === "states") {
      const slug = path[1]!;
      const prototype = registry.getPrototype(slug);
      const componentRegistry = registry.getPrototypeComponentRegistryForSlug(slug);

      if (!prototype) {
        notFound();
      }

      return (
        <Suspense fallback={null}>
          <PrototypeShell slug={slug} componentRegistry={componentRegistry}>
            <PrototypeDefaultStateMapPage slug={slug} />
          </PrototypeShell>
        </Suspense>
      );
    }

    notFound();
  }

  return { default: CatchAllPage, generateStaticParams };
}
