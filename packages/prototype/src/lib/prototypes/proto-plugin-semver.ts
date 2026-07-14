/** True when latest bumps the minor (second) semver segment vs installed, e.g. 1.2.x → 1.3.x. */
export function isMinorProtoPluginVersionBump(installed: string, latest: string): boolean {
  const installedParts = parseSemver(installed);
  const latestParts = parseSemver(latest);
  if (!installedParts || !latestParts) return false;

  if (latestParts[0] !== installedParts[0]) return false;
  return latestParts[1] > installedParts[1];
}

export function isNewerProtoPluginVersion(latest: string, installed: string): boolean {
  const latestParts = parseSemver(latest);
  const installedParts = parseSemver(installed);
  if (!latestParts || !installedParts) return false;

  for (let index = 0; index < 3; index += 1) {
    if (latestParts[index]! > installedParts[index]!) return true;
    if (latestParts[index]! < installedParts[index]!) return false;
  }

  return false;
}

function parseSemver(version: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}
