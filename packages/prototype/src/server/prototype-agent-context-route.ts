import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

import { CUSTOM_AGENT_CONTEXT_PATH } from "@prototype/lib/prototypes/agent-context-prompt";

function resolveCustomAgentContextPath(hostRoot: string): string {
  const normalized = CUSTOM_AGENT_CONTEXT_PATH.replace(/^\/+/, "");
  const fullPath = path.join(hostRoot, normalized);

  if (!fullPath.startsWith(hostRoot)) {
    throw new Error("Invalid agent context path.");
  }

  return fullPath;
}

export function createPrototypeAgentContextRoute(options?: {
  hostRoot?: string;
}) {
  const hostRoot = options?.hostRoot ?? process.cwd();

  async function GET() {
    try {
      const filePath = resolveCustomAgentContextPath(hostRoot);

      try {
        const content = await readFile(filePath, "utf8");
        return NextResponse.json({
          content,
          exists: true,
          path: CUSTOM_AGENT_CONTEXT_PATH,
        });
      } catch (error) {
        const nodeError = error as NodeJS.ErrnoException;
        if (nodeError.code === "ENOENT") {
          return NextResponse.json({
            content: "",
            exists: false,
            path: CUSTOM_AGENT_CONTEXT_PATH,
          });
        }
        throw error;
      }
    } catch (error) {
      console.error("Prototype agent-context GET error:", error);
      return NextResponse.json(
        { error: "Failed to load agent instructions." },
        { status: 500 },
      );
    }
  }

  return { GET };
}

export const PROTOTYPE_AGENT_CONTEXT_PATH = "/api/prototypes/agent-context";
