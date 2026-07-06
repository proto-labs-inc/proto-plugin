/** Last path segment of SOURCE_PATH for gallery chrome, e.g. `/path/to/proto-site` → `proto-site`. */
export function formatSourceDirectoryName(
  sourcePath: string | undefined,
): string | undefined {
  const trimmed = sourcePath?.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.replace(/[/\\]+$/, "");
  const segments = normalized.split(/[/\\]/);
  const name = segments.at(-1);
  return name || undefined;
}
