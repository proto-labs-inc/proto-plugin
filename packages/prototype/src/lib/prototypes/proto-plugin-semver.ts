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
