export type InviteCopyVariant =
  | "open-card"
  | "oversized"
  | "card-invite"
  | "verse"
  | "stamp"
  | "flush-bottom"
  | "drop-through"
  | "top-air"
  | "lower-center"
  | "stagger-drop"
  | "equal-body"
  | "split-rule"
  | "hero-stack"
  | "left-rail"
  | "type-contrast"
  | "inline-actions"
  | "two-beat";

/** Variants that pin copy over the shape canvas so the triangle can fall through behind it. */
export const INVITE_COPY_OVERLAY_VARIANTS = [
  "open-card",
  "oversized",
  "card-invite",
  "verse",
  "stamp",
  "flush-bottom",
  "drop-through",
] as const satisfies readonly InviteCopyVariant[];

export function isInviteCopyOverlayVariant(
  variant: InviteCopyVariant,
): variant is (typeof INVITE_COPY_OVERLAY_VARIANTS)[number] {
  return (
    INVITE_COPY_OVERLAY_VARIANTS as readonly InviteCopyVariant[]
  ).includes(variant);
}

export const INVITE_COPY = {
  headline: "Congrats Amelie!",
  invite:
    "You've been invited to be a design partner for Maayan's new prototyping tool, Proto. This is because you're excellent and talented and also someone she thinks is cool.",
  followUpHeadline: "Invite accepted",
  followUp:
    "Maayan is currently in the process of onboarding everyone, so it may take some time to get you access. In the meantime, help her decorate this website's home page by making a custom proto shape (like the ones here) to put on it.",
  continueCta: "Accept invite",
  cta: "Make your proto shape",
} as const;

export type InviteStep = "intro" | "follow-up";
