import type { NextConfig } from "next";

export type WithPrototypeOptions = {
  configPath?: string;
  nextConfig?: NextConfig;
};

export function withPrototype(
  options: WithPrototypeOptions = {},
): NextConfig {
  const { nextConfig = {} } = options;

  return {
    ...nextConfig,
    transpilePackages: [
      ...(nextConfig.transpilePackages ?? []),
      "proto-plugin",
    ],
  };
}
