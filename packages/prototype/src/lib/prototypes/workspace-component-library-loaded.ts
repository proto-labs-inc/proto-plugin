/** Host repo marker written when the component library sync is complete. */
export const COMPONENT_LIBRARY_LOADED_RELATIVE_PATH =
  ".proto/component-library-loaded";

export function buildMarkComponentLibraryLoadedPromptLines(): string[] {
  return [
    "## Mark component library loaded",
    "",
    "After the component library sync is complete and `/component-library` renders correctly, write the loaded flag at the host repo root:",
    "",
    "```bash",
    "mkdir -p .proto && printf 'true\\n' > .proto/component-library-loaded",
    "```",
    "",
    "Proto unlocks the component library page and new-prototype creation when `.proto/component-library-loaded` contains `true`. Write this flag **immediately after** the library sync — before agent context or marking the workspace onboarded.",
  ];
}
