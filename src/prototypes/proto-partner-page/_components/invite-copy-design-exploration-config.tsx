"use client";

import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";
import type { ReactNode } from "react";

import { INVITE_COPY, type InviteCopyVariant } from "./invite-copy-content";
import { InviteCopyBlock } from "./invite-copy-block";

export type { InviteCopyVariant };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "efc80ea4-3ddf-483b-96e3-5f51ebf77534",
    appName: "Craft",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/7f8e8b0e-8e0a-4a5a-9c0a-8e0a4a5a9c0a.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/efc80ea4-3ddf-483b-96e3-5f51ebf77534",
    relevance:
      "Bold welcome headline with two intro paragraphs at the same size and weight — no eyebrow label.",
    variantHint: "Equal body",
  },
  {
    id: "d7e49aa5-cc0a-48b0-ba80-0f2940c72f1b",
    appName: "Notion",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/a1203d38-eb63-4e2b-8c6a-52a07920136e.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/d7e49aa5-cc0a-48b0-ba80-0f2940c72f1b",
    relevance:
      "Tips-style onboarding copy: headline punch, then body blocks separated by spacing rather than hierarchy.",
    variantHint: "Split rule",
  },
  {
    id: "fe89de50-f657-4227-bcc1-0aa99aea37ae",
    appName: "Kitchen Stories",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/d8e49aa5-cc0a-48b0-ba80-0f2940c72f1b.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/fe89de50-f657-4227-bcc1-0aa99aea37ae",
    relevance:
      "Simple welcome headline over instructional body — keeps celebration and logistics in one column.",
    variantHint: "Split rule",
  },
  {
    id: "3404e799-16c9-482d-9c8e-034ec3c8df01",
    appName: "Headspace",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/a3404e79-916c-482d-9c8e-034ec3c8df01.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/3404e799-16c9-482d-9c8e-034ec3c8df01",
    relevance:
      "Friend-invite screen with centered headline and evenly weighted supporting copy.",
  },
];

export const INVITE_COPY_VARIANT_OPTIONS: Array<{
  value: InviteCopyVariant;
  label: string;
}> = [
  { value: "open-card", label: "Open card" },
  { value: "oversized", label: "Oversized" },
  { value: "card-invite", label: "Card invite" },
  { value: "verse", label: "Verse" },
  { value: "stamp", label: "Stamp" },
  { value: "flush-bottom", label: "Flush bottom" },
  { value: "drop-through", label: "Drop through" },
  { value: "top-air", label: "Top air" },
  { value: "lower-center", label: "Lower center" },
  { value: "stagger-drop", label: "Stagger drop" },
  { value: "equal-body", label: "Equal body" },
  { value: "split-rule", label: "Split rule" },
  { value: "hero-stack", label: "Hero stack" },
  { value: "left-rail", label: "Left rail" },
  { value: "inline-actions", label: "Inline actions" },
  { value: "two-beat", label: "Two beat" },
];

export const INVITE_COPY_BASELINE = {
  value: "type-contrast" as const satisfies InviteCopyVariant,
  hint: "Partner invite layout before copy exploration",
};

export const DEFAULT_INVITE_COPY_VARIANT: InviteCopyVariant =
  INVITE_COPY_VARIANT_OPTIONS[0].value;

const COMPONENT_ID_PREFIX = "invite-copy-explorer";
const VARIANT_TABS_ID_PREFIX = "invite-copy-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-invite-copy";

const renderers = buildDesignExplorationRenderers<InviteCopyVariant>(
  INVITE_COPY_VARIANT_OPTIONS,
  (variant) => <InviteCopyBlock variant={variant} />,
  INVITE_COPY_BASELINE,
);

export function buildInviteCopyDesignExplorationConfig(
  variant: InviteCopyVariant,
  onVariantChange: (next: InviteCopyVariant) => void,
): DesignExplorationConfig<InviteCopyVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: INVITE_COPY_VARIANT_OPTIONS,
    baseline: INVITE_COPY_BASELINE,
    defaultVariant: DEFAULT_INVITE_COPY_VARIANT,
    renderers,
    brief: {
      titleDefault: "Invite copy layout",
      descriptionDefault:
        "Explore how to arrange and format the partner invite message on mobile-first layouts that also work on desktop — one column, no platform-specific variants.",
    },
    context: {
      label: "Copy",
      panelId: "invite-copy",
      defaultExpanded: true,
      data: INVITE_COPY,
      render: (data) => {
        const copy = data as typeof INVITE_COPY;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Headline</span>
              <br />
              <span className="text-muted-foreground">{copy.headline}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Invite</span>
              <br />
              <span className="text-muted-foreground">{copy.invite}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Follow-up headline</span>
              <br />
              <span className="text-muted-foreground">{copy.followUpHeadline}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Follow-up</span>
              <br />
              <span className="text-muted-foreground">{copy.followUp}</span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Layout directions",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "invite copy layout",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/invite-copy-design-exploration-config.tsx",
  };
}

export function renderInviteCopyVariant(variant: InviteCopyVariant): ReactNode {
  return renderers[variant]();
}
