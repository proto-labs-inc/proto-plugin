import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

export type WithPrototypeOptions = {
  configPath?: string;
  nextConfig?: NextConfig;
};

/** Package root — resolved lazily so this module is safe if ever pulled into a bundle. */
function getPackageRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
}

function getPrototypeInternalAlias() {
  return {
    "@prototype": path.join(getPackageRoot(), "src"),
  } as const;
}

export function withPrototype(
  options: WithPrototypeOptions = {},
): NextConfig {
  const { nextConfig = {} } = options;
  const prototypeInternalAlias = getPrototypeInternalAlias();

  const existingTurbopack = nextConfig.turbopack ?? {};
  const existingResolveAlias = existingTurbopack.resolveAlias ?? {};

  return {
    ...nextConfig,
    // Next.js 16 blocks cross-origin dev asset/HMR requests by default.
    // Include ngrok (mobile testing) and common local host aliases (Glass browser, 127.0.0.1).
    allowedDevOrigins: [
      ...(nextConfig.allowedDevOrigins ?? []),
      "127.0.0.1",
      "[::1]",
      "*.ngrok-free.app",
      "*.ngrok-free.dev",
      "*.ngrok.app",
      "*.ngrok.io",
      "*.ngrok.dev",
    ],
    transpilePackages: [
      ...(nextConfig.transpilePackages ?? []),
      "proto-plugin",
    ],
    turbopack: {
      ...existingTurbopack,
      resolveAlias: {
        ...existingResolveAlias,
        ...prototypeInternalAlias,
      },
    },
    webpack: (config, ctx) => {
      config.resolve ??= {};
      config.resolve.alias = {
        ...config.resolve.alias,
        ...prototypeInternalAlias,
      };
      return nextConfig.webpack?.(config, ctx) ?? config;
    },
    images: {
      ...nextConfig.images,
      localPatterns: [
        {
          pathname: "/prototypes/screenshots/**",
        },
        {
          pathname: "/starter-screens/screenshots/**",
        },
        ...(nextConfig.images?.localPatterns ?? []),
      ],
    },
  };
}
