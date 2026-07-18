import fs from "node:fs";
import path from "node:path";

export type HostSyncConfig = {
  syncFiles: string[];
  syncDirs: string[];
  syncGlobs: string[];
};

export type BootstrapSyncPaths = {
  designTokens: string[];
  uiPrimitives: string[];
  sharedBlocks: string[];
};

function parseBashStringArray(
  content: string,
  arrayName: "SYNC_FILES" | "SYNC_DIRS" | "SYNC_GLOBS",
): string[] {
  const match = content.match(
    new RegExp(`${arrayName}\\s*=\\s*\\(([^)]*)\\)`, "s"),
  );
  if (!match) return [];

  const entries: string[] = [];
  const stringPattern = /"([^"]+)"/g;
  let capture = stringPattern.exec(match[1]);
  while (capture) {
    entries.push(capture[1]);
    capture = stringPattern.exec(match[1]);
  }

  return entries;
}

export function parseHostSyncConfigContent(content: string): HostSyncConfig {
  return {
    syncFiles: parseBashStringArray(content, "SYNC_FILES"),
    syncDirs: parseBashStringArray(content, "SYNC_DIRS"),
    syncGlobs: parseBashStringArray(content, "SYNC_GLOBS"),
  };
}

function isDesignTokenSyncDir(relativePath: string): boolean {
  return (
    /(?:^|\/)styles(?:\/|$)/.test(relativePath) ||
    /(?:^|\/)fonts(?:\/|$)/.test(relativePath) ||
    /(?:^|\/)config(?:\/|$)/.test(relativePath)
  );
}

function isUiPrimitiveSyncDir(relativePath: string): boolean {
  return /(?:^|\/)components\/ui(?:\/|$)/.test(relativePath);
}

function isSharedBlockSyncFile(relativePath: string): boolean {
  if (!/\.(?:tsx?|jsx?)$/.test(relativePath)) return false;
  return /(?:^|\/)lib\//.test(relativePath) || /utils\.tsx?$/.test(relativePath);
}

function isDesignTokenSyncGlob(relativeGlob: string): boolean {
  return /\.css(?:\*|$)/.test(relativeGlob);
}

export function deriveBootstrapPathsFromSyncConfig(
  config: HostSyncConfig,
): BootstrapSyncPaths {
  const designTokenPaths = new Set<string>();
  const uiPrimitivePaths = new Set<string>();
  const sharedBlockPaths = new Set<string>();

  for (const relativePath of config.syncFiles) {
    if (relativePath.endsWith(".css")) {
      designTokenPaths.add(relativePath);
      continue;
    }

    if (isSharedBlockSyncFile(relativePath)) {
      sharedBlockPaths.add(relativePath);
    }
  }

  for (const relativePath of config.syncDirs) {
    if (isDesignTokenSyncDir(relativePath)) {
      designTokenPaths.add(relativePath);
    }

    if (isUiPrimitiveSyncDir(relativePath)) {
      uiPrimitivePaths.add(relativePath);
    }
  }

  for (const relativeGlob of config.syncGlobs) {
    if (isDesignTokenSyncGlob(relativeGlob)) {
      designTokenPaths.add(relativeGlob);
    }
  }

  return {
    designTokens: [...designTokenPaths],
    uiPrimitives: [...uiPrimitivePaths],
    sharedBlocks: [...sharedBlockPaths],
  };
}

const DEFAULT_SYNC_CONFIG_RELATIVE_PATH = "prototype.sync.config.sh";

export function resolveBootstrapSyncPathsFromHost(
  hostRoot: string,
  syncConfigRelativePath = DEFAULT_SYNC_CONFIG_RELATIVE_PATH,
): BootstrapSyncPaths | null {
  const configPath = path.join(hostRoot, syncConfigRelativePath);

  if (!fs.existsSync(configPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, "utf8");
    return deriveBootstrapPathsFromSyncConfig(parseHostSyncConfigContent(content));
  } catch {
    return null;
  }
}
