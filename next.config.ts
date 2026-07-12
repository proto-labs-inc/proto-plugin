import type { NextConfig } from "next";
import { withPrototype } from "proto-plugin/with-prototype";

export default withPrototype({
  nextConfig: {
    transpilePackages: ["@calcom/ui", "@coss/ui", "@calcom/lib"],
    images: {
      localPatterns: [
        { pathname: "/prototypes/screenshots/**" },
        { pathname: "/starter-screens/screenshots/**" },
      ],
    },
  },
});
