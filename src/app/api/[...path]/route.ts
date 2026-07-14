import { type NextRequest } from "next/server";

import prototypeConfig from "../../../../prototype.config";
import { createPrototypeApiRoute } from "proto-plugin/server";

const { dispatch } = createPrototypeApiRoute(prototypeConfig);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return dispatch(request, context);
}
