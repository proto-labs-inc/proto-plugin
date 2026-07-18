import { NextResponse } from "next/server";

import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";

import { evaluateHostBootstrapStatus } from "./evaluate-prototype-bootstrap-status";

export function createPrototypeBootstrapStatusRoute(config: PrototypeConfig) {
  return function GET() {
    const status = evaluateHostBootstrapStatus({
      bootstrap: config.bootstrap,
    });

    return NextResponse.json(status);
  };
}
