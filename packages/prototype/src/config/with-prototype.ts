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
