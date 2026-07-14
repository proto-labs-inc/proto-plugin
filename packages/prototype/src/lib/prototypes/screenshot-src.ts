export function screenshotSrc(
  basePath: string,
  version: number | undefined,
): string {
  if (!version) return basePath;
  return `${basePath}?v=${version}`;
}
