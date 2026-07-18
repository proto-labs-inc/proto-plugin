type FileWithPath = File & { path?: string };

export function looksLikeAbsolutePath(value: string): boolean {
  return value.startsWith("/") || /^[A-Za-z]:[\\/]/.test(value);
}

export function dirnameFromAbsolutePath(filePath: string): string {
  const normalized = filePath.replace(/[/\\]+$/, "");
  const index = Math.max(normalized.lastIndexOf("/"), normalized.lastIndexOf("\\"));
  return index >= 0 ? normalized.slice(0, index) : normalized;
}

/** Electron/Cursor expose `file.path`; webkitdirectory also sets `webkitRelativePath`. */
export function resolveAbsoluteFilePath(file: File): string | undefined {
  const electronPath = (file as FileWithPath).path?.trim();
  if (!electronPath) return undefined;

  const relativePath = file.webkitRelativePath?.trim();
  if (!relativePath) return electronPath;

  const normalizedElectron = electronPath.replace(/\\/g, "/");
  const normalizedRelative = relativePath.replace(/\\/g, "/");

  if (normalizedElectron.endsWith(normalizedRelative)) {
    return normalizedElectron;
  }

  return electronPath;
}

export function resolveSourceRootFromAbsoluteFilePath(
  filePath: string | undefined,
): string | undefined {
  const trimmed = filePath?.trim();
  if (!trimmed || !looksLikeAbsolutePath(trimmed)) return undefined;
  return dirnameFromAbsolutePath(trimmed);
}
