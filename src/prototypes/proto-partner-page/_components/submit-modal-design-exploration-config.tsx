"use client";

import { DesignExplorationVariantPreviewShell } from "proto-plugin";
import type {
  DesignExplorationConfig,
  MobbinReference,
} from "proto-plugin";
import { buildDesignExplorationRenderers } from "proto-plugin";

import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import {
  DEFAULT_PROTO_COLOR_ID,
  DEFAULT_PROTO_SHAPE_ID,
  DEFAULT_PROTO_TEXTURE_ID,
} from "./proto-shape-content";
import { SubmitShapeModalBlock } from "./submit-shape-modal-block";
import {
  DEFAULT_SUBMIT_MODAL_VARIANT,
  SUBMIT_MODAL_CONTEXT,
  type SubmitModalVariant,
} from "./submit-modal-content";

export type { SubmitModalVariant };
export { DEFAULT_SUBMIT_MODAL_VARIANT };

const MOBBIN_REFERENCES: MobbinReference[] = [
  {
    id: "f91fdc51-be1d-4e45-9882-36c03a3959e6",
    appName: "Flo",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/f91fdc51-be1d-4e45-9882-36c03a3959e6.png",
    relevance:
      "Soft elevated card with a tonal header band — maps to a patterned card cap above the shape preview.",
    variantHint: "Block texture",
  },
  {
    id: "5345df64-f1a1-4305-bbae-efb0c5a76012",
    appName: "Snapchat",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/5345df64-f1a1-4305-bbae-efb0c5a76012.png",
    relevance:
      "Celebration sheet with bold color blocking and a clear title anchor — reference for card-like modal headers.",
    variantHint: "Vertical ridges",
  },
  {
    id: "4859c50f-1770-4866-9077-d2bb8b0d495d",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/4859c50f-1770-4866-9077-d2bb8b0d495d.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/4859c50f-1770-4866-9077-d2bb8b0d495d.png",
    relevance:
      "Bottom sheet with structured content zones — title sits in a distinct header region above the main preview.",
    variantHint: "Wireframe grid",
  },
  {
    id: "1d38806a-712e-4344-a504-40870769764f",
    appName: "Reddit",
    imageUrl:
      "https://bytescale.mobbin.com/FW25bBB/image/mobbin.com/prod/content/app_screens/1d38806a-712e-4344-a504-40870769764f.png",
    mobbinUrl:
      "https://mobbin.com/explore/screens/1d38806a-712e-4344-a504-40870769764f.png",
    relevance:
      "Minimal modal with a single accent color wash — maps to a proto-tint header keyed to the selected shape color.",
    variantHint: "Proto tint",
  },
];

export const SUBMIT_MODAL_VARIANT_OPTIONS: Array<{
  value: SubmitModalVariant;
  label: string;
  hint?: string;
}> = [
  {
    value: "square-cap",
    label: "Square cap",
    hint: "Grey card — shape in a white inset at top, large serif title anchored bottom-left",
  },
  {
    value: "square-cap-full-bleed",
    label: "Square cap full bleed",
    hint: "Same grey card — shape canvas edge-to-edge at top, title anchored bottom-left",
  },
  {
    value: "grey-title-top",
    label: "Grey title top",
    hint: "Same grey card — centered title above the shape inset rectangle",
  },
  {
    value: "poster-scrim",
    label: "Poster scrim",
    hint: "Full-bleed canvas with title on a bottom gradient over indigo glow",
  },
  {
    value: "split-pane",
    label: "Split pane",
    hint: "Coral sidebar with vertical title beside a white preview pane",
  },
  {
    value: "orbit-halo",
    label: "Orbit halo",
    hint: "Circular preview in concentric rings on a deep space background",
  },
  {
    value: "ticket-notch",
    label: "Ticket notch",
    hint: "Gold ticket header with perforated tear line above cream canvas",
  },
  {
    value: "glass-mesh",
    label: "Glass mesh",
    hint: "Frosted card on a conic color mesh with compact centered preview",
  },
  {
    value: "wireframe-grid",
    label: "Wireframe grid",
    hint: "Dark card with UI wireframe pattern and serif title",
  },
  {
    value: "block-texture",
    label: "Block texture",
    hint: "Mint field with dense block grid and dark serif title",
  },
  {
    value: "fluid-waves",
    label: "Fluid waves",
    hint: "Sky blue card with horizontal wave lines",
  },
  {
    value: "mosaic-pixels",
    label: "Mosaic pixels",
    hint: "Cream card with scattered square mosaic",
  },
  {
    value: "vertical-ridges",
    label: "Vertical ridges",
    hint: "Orange card with vertical line silhouette",
  },
  {
    value: "proto-tint",
    label: "Proto tint",
    hint: "Header color matches the selected proto shape color",
  },
];

export const SUBMIT_MODAL_BASELINE = {
  value: "plain-header" as const satisfies SubmitModalVariant,
  label: "Plain header",
  hint: "Sans-serif title above the canvas — before card exploration",
};

const COMPONENT_ID_PREFIX = "submit-modal-explorer";
const VARIANT_TABS_ID_PREFIX = "submit-modal-variant-tabs";
const STORAGE_KEY_PREFIX = "proto-partner-page-submit-modal";

export function defaultSubmitModalSelection(): ProtoShapeSelection {
  return {
    shapeId: DEFAULT_PROTO_SHAPE_ID,
    colorId: DEFAULT_PROTO_COLOR_ID,
    textureId: DEFAULT_PROTO_TEXTURE_ID,
  };
}

export function buildSubmitModalDesignExplorationConfig(
  variant: SubmitModalVariant,
  onVariantChange: (next: SubmitModalVariant) => void,
  selection: ProtoShapeSelection,
): DesignExplorationConfig<SubmitModalVariant> {
  const renderers = buildDesignExplorationRenderers<SubmitModalVariant>(
    SUBMIT_MODAL_VARIANT_OPTIONS,
    (optionVariant) => (
      <DesignExplorationVariantPreviewShell layout="overlay">
        <div className="flex h-full min-h-[28rem] items-center justify-center px-4 py-8">
          <div className="w-full max-w-[min(24rem,calc(100%-2rem))]">
            <SubmitShapeModalBlock
              variant={optionVariant}
              selection={selection}
              onKeepEditing={() => {}}
              onSeeOnHomepage={() => {}}
            />
          </div>
        </div>
      </DesignExplorationVariantPreviewShell>
    ),
    SUBMIT_MODAL_BASELINE,
  );

  return {
    componentIdPrefix: COMPONENT_ID_PREFIX,
    variantTabsIdPrefix: VARIANT_TABS_ID_PREFIX,
    storageKeyPrefix: STORAGE_KEY_PREFIX,
    variant,
    onVariantChange,
    options: SUBMIT_MODAL_VARIANT_OPTIONS,
    baseline: SUBMIT_MODAL_BASELINE,
    defaultVariant: DEFAULT_SUBMIT_MODAL_VARIANT,
    renderers,
    brief: {
      titleDefault: "Submit modal layout",
      descriptionDefault:
        "Totally different ways to present the submit shape modal — new layouts, backgrounds, and title placement while keeping the shape preview and actions.",
    },
    context: {
      label: "Modal content",
      panelId: "submit-modal",
      defaultExpanded: true,
      data: SUBMIT_MODAL_CONTEXT,
      render: (data) => {
        const context = data as typeof SUBMIT_MODAL_CONTEXT;
        return (
          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <p>
              <span className="text-foreground font-medium">Title</span>
              <br />
              <span className="text-muted-foreground">{context.title}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Default shape</span>
              <br />
              <span className="text-muted-foreground">
                {context.defaultShape} / {context.defaultColor}
              </span>
            </p>
            <p>
              <span className="text-foreground font-medium">Reference</span>
              <br />
              <span className="text-muted-foreground">
                interfacecraft.dev card headers — pattern in the top half, serif
                title anchored bottom-left
              </span>
            </p>
          </div>
        );
      },
    },
    variantsSection: {
      title: "Layout & background styles",
      description:
        "Each option rethinks the submit modal structure — different layouts, backgrounds, and title placement while keeping the same shape preview and actions.",
    },
    mobbin: {
      references: MOBBIN_REFERENCES,
      title: "Mobbin references",
      imagePathForReference: (id) => `/prototypes/mobbin-references/${id}.webp`,
    },
    variantTabAriaLabel: "submit modal card header",
    briefConfigFilePath:
      "src/prototypes/proto-partner-page/_components/submit-modal-design-exploration-config.tsx",
  };
}
