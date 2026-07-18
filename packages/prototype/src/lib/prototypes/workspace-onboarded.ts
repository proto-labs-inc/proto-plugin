/** Host repo marker written when workspace setup is complete. Defaults to not onboarded. */
export const WORKSPACE_ONBOARDED_RELATIVE_PATH = ".proto/onboarded";

export function buildMarkWorkspaceOnboardedPromptLines(): string[] {
  return [
    "## Mark workspace onboarded",
    "",
    "After **all** setup steps succeed (including `.proto/component-library-loaded`), create the onboarded flag at the host repo root:",
    "",
    "```bash",
    "mkdir -p .proto && printf 'true\\n' > .proto/onboarded",
    "```",
    "",
    "Proto dismisses onboarding when `.proto/onboarded` contains `true`. This is the **last** flag — write it only after the component library loaded flag is already set.",
  ];
}
