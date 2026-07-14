"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";

import { PartnerShapeCanvas } from "../partner-shape-canvas";
import { renderSubmitModalCardPattern } from "./submit-modal-card-patterns";
import {
  isSubmitModalLayoutVariant,
  renderSubmitModalLayout,
  SubmitModalActions,
} from "./submit-modal-layouts";
import {
  SUBMIT_MODAL_CARD_THEMES,
  SUBMIT_MODAL_TITLE,
  type SubmitModalCardThemeVariant,
  type SubmitModalVariant,
} from "./submit-modal-content";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import { getProtoColor } from "./proto-shape-content";

type SubmitShapeModalBlockProps = {
  variant: SubmitModalVariant;
  selection: ProtoShapeSelection;
  onKeepEditing: () => void;
  onSeeOnHomepage: () => void;
  title?: string;
  className?: string;
  dragAttributionLabel?: string;
};

function SubmitModalCardHeader({
  variant,
  selection,
  title,
}: {
  variant: SubmitModalCardThemeVariant | "plain-header" | "proto-tint";
  selection: ProtoShapeSelection;
  title: string;
}) {
  if (variant === "plain-header") {
    return (
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-foreground text-[1.125rem] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
      </div>
    );
  }

  const theme =
    variant === "proto-tint"
      ? {
          background: `rgb(${getProtoColor(selection.colorId).rgb.join(", ")})`,
          patternForeground: "rgba(255,255,255,0.35)",
          titleClass:
            selection.colorId === "gold" || selection.colorId === "pink"
              ? "text-[#1a1a1a]"
              : "text-white",
        }
      : SUBMIT_MODAL_CARD_THEMES[variant];

  return (
    <div
      className="relative min-h-[7.5rem] overflow-hidden"
      style={{ backgroundColor: theme.background }}
    >
      {renderSubmitModalCardPattern(variant, theme, selection.colorId)}
      <div className="relative flex min-h-[7.5rem] flex-col justify-end px-5 pt-8 pb-4">
        <h2
          className={cn(
            "font-serif text-[1.375rem] leading-[1.1] tracking-[-0.02em]",
            theme.titleClass,
          )}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

export function SubmitShapeModalBlock({
  variant,
  selection,
  onKeepEditing,
  onSeeOnHomepage,
  title = SUBMIT_MODAL_TITLE,
  className,
  dragAttributionLabel,
}: SubmitShapeModalBlockProps) {
  if (isSubmitModalLayoutVariant(variant)) {
    return (
      <PrototypeComponent
        id="submit-shape-modal-block"
        className={cn("pointer-events-none flex flex-col gap-4", className)}
      >
        {renderSubmitModalLayout(variant, {
          selection,
          title,
          onKeepEditing,
          onSeeOnHomepage,
          dragAttributionLabel,
        })}
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="submit-shape-modal-block"
      className={cn("pointer-events-none flex flex-col gap-4", className)}
    >
      <div className="border-border bg-background pointer-events-auto overflow-hidden rounded-2xl border shadow-lg">
        <SubmitModalCardHeader
          variant={variant}
          selection={selection}
          title={title}
        />
        <div className="relative h-[min(52vw,16rem)] min-h-[12rem] touch-none">
          <PartnerShapeCanvas
            prototypeId="submit-shape-modal.partner-shape-canvas"
            shapeId={selection.shapeId}
            colorId={selection.colorId}
            textureId={selection.textureId}
            className="absolute inset-0 min-h-0"
          />
        </div>
      </div>

      <SubmitModalActions
        colorId={selection.colorId}
        onSeeOnHomepage={onSeeOnHomepage}
      />
    </PrototypeComponent>
  );
}
