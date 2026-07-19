import { buildPhaseHardStopLines } from "@prototype/lib/prototypes/bootstrap-setup-phase-gates";

export const CUSTOM_AGENT_CONTEXT_PATH = ".proto/agent/custom-context.md";

/** @deprecated Use CUSTOM_AGENT_CONTEXT_PATH */
export const HOST_AGENT_CONTEXT_PATH = CUSTOM_AGENT_CONTEXT_PATH;

/** Shared copy for agent-context prompts — user-supplied content only. */
export const AGENT_CONTEXT_USER_CONTENT_ONLY_LINES = [
  "## Content rules (mandatory)",
  "",
  "- Write **only** what the user provided — pasted markdown or the contents of their selected file.",
  "- Copy verbatim. Do **not** add headers, boilerplate, placeholder text, or Proto documentation.",
  "- If the user did not provide agent context, **do not** create or update `.proto/agent/custom-context.md`.",
  "",
] as const;

const AGENT_CONTEXT_HARD_STOP = buildPhaseHardStopLines("agent-context", {
  extraVerifyLines: [
    "",
    "Confirm the target file exists:",
    "",
    "```bash",
    `test -f ${CUSTOM_AGENT_CONTEXT_PATH}`,
    "```",
  ],
});

const AGENT_CONTEXT_CLEAR_HARD_STOP = buildPhaseHardStopLines("agent-context", {
  extraVerifyLines: [
    "",
    "Confirm the target file is removed:",
    "",
    "```bash",
    `test ! -f ${CUSTOM_AGENT_CONTEXT_PATH}`,
    "```",
  ],
});

export function buildAgentContextPrompt({
  content,
}: {
  content: string;
}): string {
  const trimmedContent = content.trim();
  const isClearing = trimmedContent.length === 0;

  return [
    "Update custom agent context for this prototype workspace.",
    "",
    "## Goal",
    isClearing
      ? "Clear custom agent instructions so future agents rely on default Proto guidance only."
      : "Persist the agent instructions below so future agents read them before building prototypes.",
    "",
    ...AGENT_CONTEXT_USER_CONTENT_ONLY_LINES,
    "## Target file",
    isClearing
      ? `Delete \`${CUSTOM_AGENT_CONTEXT_PATH}\` at the host repo root if it exists.`
      : `Create \`.proto/agent/\` if it does not exist, then write \`${CUSTOM_AGENT_CONTEXT_PATH}\` at the host repo root.`,
    "",
    ...(isClearing
      ? []
      : [
          "## Content",
          "Write **only** the following markdown to the target file — nothing else (replace any existing file unless the user asks to merge):",
          "",
          "```markdown",
          trimmedContent,
          "```",
          "",
        ]),
    "## Steps",
    ...(isClearing
      ? [
          `1. Delete \`${CUSTOM_AGENT_CONTEXT_PATH}\` if it exists.`,
          "2. Confirm the file is gone.",
          "3. Do not modify unrelated paths.",
        ]
      : [
          "1. Create `.proto/agent/` if it does not exist.",
          `2. Write the content above to \`${CUSTOM_AGENT_CONTEXT_PATH}\`.`,
          "3. Confirm the file exists and is readable.",
          "4. Do not modify unrelated paths.",
        ]),
    ...(isClearing ? AGENT_CONTEXT_CLEAR_HARD_STOP : AGENT_CONTEXT_HARD_STOP),
  ].join("\n");
}

export function buildAgentContextCopyText(
  options: Parameters<typeof buildAgentContextPrompt>[0],
): string {
  return buildAgentContextPrompt(options);
}

export function buildAgentContextFromPathPrompt({
  contextFilePath,
  destinationFilePath = CUSTOM_AGENT_CONTEXT_PATH,
}: {
  contextFilePath: string;
  destinationFilePath?: string;
}): string {
  const trimmedSourcePath = contextFilePath.trim();

  return [
    "Update custom agent context for this prototype workspace.",
    "",
    "## Goal",
    "Persist agent instructions so future agents read them before building prototypes.",
    "",
    ...AGENT_CONTEXT_USER_CONTENT_ONLY_LINES,
    "## Source file",
    `Read the agent context at \`${trimmedSourcePath}\`.`,
    "",
    "## Target file",
    `Create \`.proto/agent/\` if it does not exist, then write \`${destinationFilePath}\` at the host repo root with that content.`,
    "",
    "## Steps",
    "1. Read the source file at the absolute path above.",
    `2. Write **only** its contents to \`${destinationFilePath}\` in this host repo — verbatim, with no additions (replace any existing file unless the user asks to merge).`,
    "3. Confirm the target file exists and is readable.",
    "4. Do not modify unrelated paths.",
    ...buildPhaseHardStopLines("agent-context", {
      extraVerifyLines: [
        "",
        "Confirm the target file exists:",
        "",
        "```bash",
        `test -f ${destinationFilePath}`,
        "```",
      ],
    }),
  ].join("\n");
}

export function buildAgentContextFromPathCopyText(
  options: Parameters<typeof buildAgentContextFromPathPrompt>[0],
): string {
  return buildAgentContextFromPathPrompt(options);
}
