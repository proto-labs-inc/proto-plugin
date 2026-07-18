export const CUSTOM_AGENT_CONTEXT_PATH = ".proto/agent/custom-context.md";

/** @deprecated Use CUSTOM_AGENT_CONTEXT_PATH */
export const HOST_AGENT_CONTEXT_PATH = CUSTOM_AGENT_CONTEXT_PATH;

export function buildAgentContextPrompt({
  content,
}: {
  content: string;
}): string {
  const trimmedContent = content.trim();

  return [
    "Update custom agent context for this prototype workspace.",
    "",
    "## Goal",
    "Persist the agent instructions below so future agents read them before building prototypes.",
    "",
    "## Target file",
    `Create \`.proto/agent/\` if it does not exist, then write \`${CUSTOM_AGENT_CONTEXT_PATH}\` at the host repo root.`,
    "",
    "## Content",
    "Write the following markdown to the target file (replace any existing file unless the user asks to merge):",
    "",
    "```markdown",
    trimmedContent,
    "```",
    "",
    "## Steps",
    "1. Create `.proto/agent/` if it does not exist.",
    `2. Write the content above to \`${CUSTOM_AGENT_CONTEXT_PATH}\`.`,
    "3. Confirm the file exists and is readable.",
    "4. Do not modify unrelated paths.",
  ].join("\n");
}

export function buildAgentContextCopyText(
  options: Parameters<typeof buildAgentContextPrompt>[0],
): string {
  return buildAgentContextPrompt(options);
}
