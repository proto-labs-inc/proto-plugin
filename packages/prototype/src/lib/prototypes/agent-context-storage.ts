import { CUSTOM_AGENT_CONTEXT_PATH } from "@prototype/lib/prototypes/agent-context-prompt";

export const AGENT_CONTEXT_LOCAL_STORAGE_KEY = "prototype-profile:agent-context";

export const PROTOTYPE_AGENT_CONTEXT_API_PATH = "/api/prototypes/agent-context";

export type AgentContextResponse = {
  content: string;
  exists: boolean;
  path: string;
};

export async function fetchAgentContext(): Promise<AgentContextResponse> {
  const response = await fetch(PROTOTYPE_AGENT_CONTEXT_API_PATH);

  if (!response.ok) {
    throw new Error("Failed to load agent instructions.");
  }

  return (await response.json()) as AgentContextResponse;
}

export function readLocalAgentContextDraft(): string {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(AGENT_CONTEXT_LOCAL_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLocalAgentContextDraft(content: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(AGENT_CONTEXT_LOCAL_STORAGE_KEY, content);
  } catch {
    // Ignore localStorage write failures.
  }
}

export function resolveInitialAgentContextContent(
  remote: AgentContextResponse,
  localDraft: string,
): string {
  if (remote.exists && remote.content.trim()) {
    return remote.content;
  }

  return localDraft.trim() ? localDraft : remote.content;
}

export { CUSTOM_AGENT_CONTEXT_PATH };
