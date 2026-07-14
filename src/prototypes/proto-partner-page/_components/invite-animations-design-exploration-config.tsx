"use client";

import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";
import type { ReactNode } from "react";

import { InviteAnimationsBlock } from "./invite-animations-block";
import type { InviteAnimationsVariant } from "./invite-animations-content";

export type { InviteAnimationsVariant };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "3404e799-16c9-482d-9c8e-034ec3c8df01",
    appName: "Headspace",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/a3404e79-916c-482d-9c8e-034ec3c8df01.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/3404e799-16c9-482d-9c8e-034ec3c8df01",
    relevance:
      "Friend-invite screen with centered headline and evenly weighted supporting copy — good baseline for staggered text entrance.",
    variantHint: "Stagger rise",
  },
  {
    id: "efc80ea4-3ddf-483b-96e3-5f51ebf77534",
    appName: "Craft",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/7f8e8b0e-8e0a-4a5a-9c0a-8e0a4a5a9c0a.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/efc80ea4-3ddf-483b-96e3-5f51ebf77534",
    relevance:
      "Bold welcome headline lands first with body copy following — maps to headline-first timing.",
    variantHint: "Headline first",
  },
  {
    id: "2a7ef919-41a1-4157-8517-bb0d3e8f6466",
    appName: "On",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/2a7ef919-41a1-4157-8517-bb0d3e8f6466.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/2a7ef919-41a1-4157-8517-bb0d3e8f6466",
    relevance:
      "Welcome screen with primary and secondary actions — reference for delaying the main CTA after copy.",
    variantHint: "Button only",
  },
  {
    id: "b5ffe641-6299-43fa-95ab-bcf09ed1527b",
    appName: "stoic.",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/b5ffe641-6299-43fa-95ab-bcf09ed1527b.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/b5ffe641-6299-43fa-95ab-bcf09ed1527b",
    relevance:
      "App introduction with a soft title and tagline — each line can sharpen into focus sequentially.",
    variantHint: "Blur in",
  },
  {
    id: "d7e49aa5-cc0a-48b0-ba80-0f2940c72f1b",
    appName: "Notion",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/a1203d38-eb63-4e2b-8c6a-52a07920136e.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/d7e49aa5-cc0a-48b0-ba80-0f2940c72f1b",
    relevance:
      "Tips-style onboarding with headline punch then body blocks — word-level headline emphasis fits word-pop.",
    variantHint: "Word pop",
  },
];

export const INVITE_ANIMATIONS_VARIANT_OPTIONS: Array<{
  value: InviteAnimationsVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "word-pop-button-spring",
    label: "Word pop + spring",
    hint: "Headline words spring in one at a time; body follows; CTA bounces in with a spring",
  },
  {
    value: "blur-in-button-spring",
    label: "Blur in + spring",
    hint: "Each line sharpens from blur; CTA bounces in with a spring after copy",
  },
  {
    value: "headline-first-button-spring",
    label: "Headline first + spring",
    hint: "Headline scales up, body fades as a block; CTA springs in after",
  },
  {
    value: "text-only-button-spring",
    label: "Text only + spring",
    hint: "Stagger the copy; CTA bounces in with a spring once text lands",
  },
  {
    value: "blur-in",
    label: "Blur in",
    hint: "Each line sharpens from blur — text and button in sequence",
  },
  {
    value: "word-pop",
    label: "Word pop",
    hint: "Headline words spring in one at a time; body and CTA follow",
  },
  {
    value: "button-spring",
    label: "Button spring",
    hint: "Copy fades in quickly; CTA bounces in with a spring",
  },
  {
    value: "headline-first",
    label: "Headline first",
    hint: "Headline scales up, body fades as a block, button slides from the right",
  },
  {
    value: "text-only",
    label: "Text only",
    hint: "Stagger the copy; CTA is visible immediately",
  },
  {
    value: "button-only",
    label: "Button only",
    hint: "Copy is static; CTA rises and slides in after a beat",
  },
  {
    value: "stagger-rise",
    label: "Stagger rise",
    hint: "Classic top-to-bottom fade-up cascade ending on the CTA",
  },
];

export const INVITE_ANIMATIONS_BASELINE = {
  value: "none" as const satisfies InviteAnimationsVariant,
  label: "Static",
  hint: "Invite screen before motion exploration — no entrance animation",
};

export const DEFAULT_INVITE_ANIMATIONS_VARIANT: InviteAnimationsVariant =
  INVITE_ANIMATIONS_VARIANT_OPTIONS[0].value;

const COMPONENT_ID_PREFIX = "invite-animations-explorer";
const VARIANT_TABS_ID_PREFIX = "invite-animations-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-invite-animations";

const renderers = buildDesignExplorationRenderers<InviteAnimationsVariant>(
  INVITE_ANIMATIONS_VARIANT_OPTIONS,
  (variant) => <InviteAnimationsBlock variant={variant} replayKey={variant} />,
  INVITE_ANIMATIONS_BASELINE,
);

export function buildInviteAnimationsDesignExplorationConfig(
  variant: InviteAnimationsVariant,
  onVariantChange: (next: InviteAnimationsVariant) => void,
): DesignExplorationConfig<InviteAnimationsVariant> {
  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: INVITE_ANIMATIONS_VARIANT_OPTIONS,
    baseline: INVITE_ANIMATIONS_BASELINE,
    defaultVariant: DEFAULT_INVITE_ANIMATIONS_VARIANT,
    renderers,
    brief: {
      titleDefault: "Invite entrance motion",
      descriptionDefault:
        "What animations can we add to this page? Explore motion on the invite copy and CTA — together or independently — on the open-card layout.",
    },
    variantsSection: {
      title: "Animation directions",
      description:
        "Each variant replays on select. Animations apply on the live page when the invite copy layout is Open card.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "invite entrance animation",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/invite-animations-design-exploration-config.tsx",
  };
}

export function renderInviteAnimationsVariant(
  variant: InviteAnimationsVariant,
): ReactNode {
  return renderers[variant]();
}
