import type { PartnerPageId } from "./_components/partner-page-flow-block";

export const PARTNER_PAGE_PROTOTYPE_SLUG = "proto-partner-page";

const PARTNER_PAGE_PATH_SEGMENTS: Record<PartnerPageId, string | null> = {
  invite: null,
  "invite-follow-up": "invite-follow-up",
  customize: "customize",
};

const PARTNER_PAGE_SEGMENT_TO_ID = Object.fromEntries(
  (
    Object.entries(PARTNER_PAGE_PATH_SEGMENTS) as Array<
      [PartnerPageId, string | null]
    >
  )
    .filter(([, segment]) => segment !== null)
    .map(([pageId, segment]) => [segment, pageId]),
) as Record<string, PartnerPageId>;

export function getPartnerPagePath(pageId: PartnerPageId): string {
  const segment = PARTNER_PAGE_PATH_SEGMENTS[pageId];
  const base = `/prototypes/${PARTNER_PAGE_PROTOTYPE_SLUG}`;
  return segment ? `${base}/${segment}` : base;
}

export function getPartnerPageFromPathname(pathname: string): PartnerPageId {
  const prefix = `/prototypes/${PARTNER_PAGE_PROTOTYPE_SLUG}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return "invite";
  }

  if (!pathname.startsWith(`${prefix}/`)) {
    return "invite";
  }

  const segment = pathname.slice(prefix.length + 1).split("/")[0];
  return PARTNER_PAGE_SEGMENT_TO_ID[segment] ?? "invite";
}

export function isValidPartnerPagePath(pathname: string): boolean {
  const prefix = `/prototypes/${PARTNER_PAGE_PROTOTYPE_SLUG}`;
  if (pathname === prefix || pathname === `${prefix}/`) {
    return true;
  }

  if (!pathname.startsWith(`${prefix}/`)) {
    return false;
  }

  const rest = pathname.slice(prefix.length + 1);
  if (!rest || rest.includes("/")) {
    return false;
  }

  return rest in PARTNER_PAGE_SEGMENT_TO_ID;
}

export const PARTNER_PAGE_STATIC_SEGMENTS = Object.values(
  PARTNER_PAGE_PATH_SEGMENTS,
)
  .filter((segment): segment is string => segment !== null)
  .map((segment) => [segment] as [string]);
