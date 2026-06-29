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
    // Allow mobile testing via ngrok (Next.js blocks cross-origin dev assets by default).
    allowedDevOrigins: [
      ...(nextConfig.allowedDevOrigins ?? []),
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
    images: {
      ...nextConfig.images,
      localPatterns: [
        {
          pathname: "/prototypes/screenshots/**",
        },
        ...(nextConfig.images?.localPatterns ?? []),
      ],
    },
  };
}
