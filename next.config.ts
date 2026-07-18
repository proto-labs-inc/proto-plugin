import type { NextConfig } from "next";
import { withPrototype } from "proto-plugin/with-prototype";

export default withPrototype({
  nextConfig: {
    images: {
      localPatterns: [{ pathname: "/prototypes/screenshots/**" }],
    },
  },
});
