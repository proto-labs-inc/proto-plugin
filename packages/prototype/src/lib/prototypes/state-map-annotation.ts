export type ParsedStateMapBullet = {
  text: string;
  index: number;
  highlightId?: string;
};

export type ParsedStateMapAnnotation = {
  lead: string;
  bullets: ParsedStateMapBullet[];
};

const BULLET_LINE = /^\s*[•*-]\s+(.+)$/;
const HIGHLIGHT_SUFFIX = /\s+@([a-z0-9-]+)$/i;

export function parseStateMapAnnotation(text: string): ParsedStateMapAnnotation {
  const lines = text.split("\n");
  const leadLines: string[] = [];
  const bullets: ParsedStateMapBullet[] = [];
  let bulletIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (leadLines.length > 0 && bullets.length === 0) {
        leadLines.push("");
      }
      continue;
    }

    const bulletMatch = trimmed.match(BULLET_LINE);
    if (bulletMatch) {
      let body = bulletMatch[1]!.trim();
      let highlightId: string | undefined;
      const highlightMatch = body.match(HIGHLIGHT_SUFFIX);
      if (highlightMatch) {
        highlightId = highlightMatch[1]!.toLowerCase();
        body = body.slice(0, highlightMatch.index).trim();
      }
      bullets.push({ text: body, index: bulletIndex, highlightId });
      bulletIndex += 1;
      continue;
    }

    if (bullets.length === 0) {
      leadLines.push(trimmed);
    }
  }

  return { lead: leadLines.join("\n").trim(), bullets };
}

export function resolveBulletHighlightId(
  bullet: ParsedStateMapBullet,
  highlightRegions?: readonly string[],
): string | null {
  if (bullet.highlightId) return bullet.highlightId;
  return highlightRegions?.[bullet.index] ?? null;
}

export function stateMapAnnotationHasInteractiveBullets(
  text: string,
  highlightRegions?: readonly string[],
): boolean {
  const { bullets } = parseStateMapAnnotation(text);
  if (bullets.length === 0) return false;
  if (!highlightRegions?.length) {
    return bullets.some((bullet) => bullet.highlightId);
  }
  return true;
}
