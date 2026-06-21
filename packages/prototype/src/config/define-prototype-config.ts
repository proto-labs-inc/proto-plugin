import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";
import { setPrototypeConfig } from "@prototype/lib/prototypes/create-prototype-registry";

export function definePrototypeConfig(config: PrototypeConfig): PrototypeConfig {
  setPrototypeConfig(config);
  return config;
}
