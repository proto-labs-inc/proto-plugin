export function getPrototypeShareCommand(slug: string): string {
  return `pnpm share-prototype ${slug}`;
}

export function getPrototypeSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/prototypes\/([^/]+)/);
  return match?.[1] ?? null;
}
