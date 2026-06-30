"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { useState } from "react";

import { PartnerMotionFadeUp, usePartnerEntranceMotion } from "./partner-page-motion";
import {
  ProtoColorSwatch,
  ProtoShapeIcon,
  ProtoTextureSwatch,
  ProtoTextureTooltip,
} from "./proto-shape-icons";
import {
  getProtoColor,
  PROTO_COLORS,
  PROTO_SHAPES,
  PROTO_TEXTURE_OPTIONS,
  type ProtoColorId,
  type ProtoShapeCustomizerVariant,
  type ProtoShapeId,
  type ProtoTextureId,
} from "./proto-shape-content";
import { ShapeColorPickerControls } from "./shape-color-picker-block";
import type { ShapeColorPickerVariant } from "./shape-color-picker-content";

export type ProtoShapeSelection = {
  shapeId: ProtoShapeId;
  colorId: ProtoColorId;
  textureId: ProtoTextureId;
};

type ProtoShapeCustomizerBlockProps = {
  variant: ProtoShapeCustomizerVariant;
  selection: ProtoShapeSelection;
  onSelectionChange: (next: ProtoShapeSelection) => void;
  pickerVariant?: ShapeColorPickerVariant;
  animateEntrance?: boolean;
  entranceKey?: string | number;
};

type CustomizerTab = "shape" | "color";

function DualRowControls({
  selection,
  onSelectionChange,
  shapeLayout = "tiles",
  colorLayout = "row",
  density = "default",
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: {
  selection: ProtoShapeSelection;
  onSelectionChange: (next: ProtoShapeSelection) => void;
  shapeLayout?: "grid" | "carousel" | "tiles" | "compact-tiles";
  colorLayout?: "row" | "grid";
  density?: "default" | "compact";
  pickerVariant?: ShapeColorPickerVariant;
  animateEntrance?: boolean;
  entranceKey?: string | number;
}) {
  if (pickerVariant) {
    return (
      <ShapeColorPickerControls
        variant={pickerVariant}
        selection={selection}
        onSelectionChange={onSelectionChange}
        density={density === "compact" ? "compact" : "default"}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  const labelClass =
    density === "compact"
      ? "text-muted-foreground text-[0.625rem] font-medium tracking-[0.14em] uppercase"
      : "text-muted-foreground text-[0.6875rem] font-medium tracking-[0.14em] uppercase";
  const sectionGap = density === "compact" ? "gap-1" : "gap-2";
  const motionOn = usePartnerEntranceMotion(animateEntrance);

  const shapeBlock = (
    <div className={`flex flex-col ${sectionGap}`}>
      <p className={labelClass}>Shape</p>
      <ShapePicker
        selection={selection}
        onSelect={(shapeId) => onSelectionChange({ ...selection, shapeId })}
        layout={shapeLayout}
        density={density}
      />
    </div>
  );

  const colorBlock = (
    <div className={`flex flex-col ${sectionGap}`}>
      <p className={labelClass}>Color</p>
      <ColorPicker
        selection={selection}
        onSelect={(colorId) => onSelectionChange({ ...selection, colorId })}
        layout={colorLayout}
        density={density}
      />
    </div>
  );

  const textureBlock = (
    <div className={`flex flex-col ${sectionGap}`}>
      <p className={labelClass}>Texture</p>
      <TexturePicker
        selection={selection}
        onSelect={(textureId) => onSelectionChange({ ...selection, textureId })}
        density={density}
      />
    </div>
  );

  if (motionOn) {
    return (
      <>
        <PartnerMotionFadeUp delay={0.12}>{shapeBlock}</PartnerMotionFadeUp>
        <PartnerMotionFadeUp delay={0.26}>{colorBlock}</PartnerMotionFadeUp>
        <PartnerMotionFadeUp delay={0.4}>{textureBlock}</PartnerMotionFadeUp>
      </>
    );
  }

  return (
    <>
      {shapeBlock}
      {colorBlock}
      {textureBlock}
    </>
  );
}

function SegmentTabs({
  value,
  onChange,
}: {
  value: CustomizerTab;
  onChange: (next: CustomizerTab) => void;
}) {
  return (
    <div
      className="bg-muted inline-flex rounded-full p-0.5 [&_button]:cursor-pointer"
      role="tablist"
      aria-label="Customize proto shape"
    >
      {(["shape", "color"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={value === tab}
          onClick={() => onChange(tab)}
          className={cn(
            "rounded-full px-4 py-1.5 text-[0.8125rem] font-medium capitalize transition-colors",
            value === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function ShapePicker({
  selection,
  onSelect,
  layout,
  density = "default",
}: {
  selection: ProtoShapeSelection;
  onSelect: (shapeId: ProtoShapeId) => void;
  layout: "grid" | "carousel" | "tiles" | "compact-tiles";
  density?: "default" | "compact";
}) {
  const color = getProtoColor(selection.colorId).rgb;
  const compactTileClass =
    "flex aspect-square items-center justify-center overflow-hidden rounded-lg border p-1 transition-colors sm:aspect-auto sm:h-8";
  const compactIconClass = "size-7 sm:size-5";
  const defaultIconSize = 28;

  if (layout === "compact-tiles") {
    return (
      <div className="grid grid-cols-5 gap-1.5 [&>button]:cursor-pointer">
        {PROTO_SHAPES.map((shape) => {
          const selected = shape.id === selection.shapeId;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              aria-label={shape.label}
              className={cn(
                compactTileClass,
                selected
                  ? "border-foreground bg-background shadow-sm"
                  : "border-border bg-muted/40 hover:border-foreground/30",
              )}
            >
              <ProtoShapeIcon
                shapeId={shape.id}
                color={color}
                className={compactIconClass}
              />
            </button>
          );
        })}
      </div>
    );
  }

  if (layout === "carousel") {
    return (
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:cursor-pointer">
        {PROTO_SHAPES.map((shape) => {
          const selected = shape.id === selection.shapeId;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              className={cn(
                "flex shrink-0 flex-col items-center gap-2 rounded-2xl border px-4 py-3 transition-colors",
                selected
                  ? "border-foreground bg-background shadow-sm"
                  : "border-border bg-background/70 hover:border-foreground/30",
              )}
            >
              <ProtoShapeIcon shapeId={shape.id} color={color} size={32} />
              <span className="text-[0.75rem] font-medium">{shape.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (layout === "tiles") {
    const iconSize = density === "compact" ? undefined : defaultIconSize;
    const iconClass = density === "compact" ? compactIconClass : undefined;
    const tileClass =
      density === "compact"
        ? compactTileClass
        : "flex aspect-square items-center justify-center rounded-xl border";

    return (
      <div
        className={cn(
          "grid grid-cols-5 [&>button]:cursor-pointer",
          density === "compact" ? "gap-1.5" : "gap-2",
        )}
      >
        {PROTO_SHAPES.map((shape) => {
          const selected = shape.id === selection.shapeId;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              aria-label={shape.label}
              className={cn(
                tileClass,
                "transition-colors",
                selected
                  ? "border-foreground bg-background shadow-sm"
                  : "border-border bg-muted/40 hover:border-foreground/30",
              )}
            >
              <ProtoShapeIcon
                shapeId={shape.id}
                color={color}
                size={iconSize}
                className={iconClass}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 [&>button]:cursor-pointer">
      {PROTO_SHAPES.map((shape) => {
        const selected = shape.id === selection.shapeId;
        return (
          <button
            key={shape.id}
            type="button"
            onClick={() => onSelect(shape.id)}
            aria-pressed={selected}
            aria-label={shape.label}
            className={cn(
              "flex size-11 items-center justify-center rounded-xl border transition-colors",
              selected
                ? "border-foreground bg-background shadow-sm"
                : "border-border bg-background/80 hover:border-foreground/30",
            )}
          >
            <ProtoShapeIcon shapeId={shape.id} color={color} />
          </button>
        );
      })}
    </div>
  );
}

function ColorPicker({
  selection,
  onSelect,
  layout,
  density = "default",
}: {
  selection: ProtoShapeSelection;
  onSelect: (colorId: ProtoColorId) => void;
  layout: "row" | "grid";
  density?: "default" | "compact";
}) {
  const swatchSize =
    density === "compact" ? "mobile-md" : layout === "grid" ? "md" : "sm";

  const swatches = PROTO_COLORS.map((color) => {
    const selected = color.id === selection.colorId;
    return (
      <button
        key={color.id}
        type="button"
        onClick={() => onSelect(color.id)}
        aria-pressed={selected}
        aria-label={color.label}
        className="rounded-full p-0.5 transition-transform hover:scale-105"
      >
        <ProtoColorSwatch
          colorId={color.id}
          rgb={color.rgb}
          selected={selected}
          size={swatchSize}
        />
      </button>
    );
  });

  return (
    <div
      className={cn(
        "[&>button]:cursor-pointer",
        layout === "grid"
          ? "grid grid-cols-5 justify-items-center gap-3"
          : density === "compact"
            ? "flex flex-wrap justify-center gap-2"
            : "flex flex-wrap justify-center gap-3",
      )}
    >
      {swatches}
    </div>
  );
}

function TexturePicker({
  selection,
  onSelect,
  density = "default",
}: {
  selection: ProtoShapeSelection;
  onSelect: (textureId: ProtoTextureId) => void;
  density?: "default" | "compact";
}) {
  const color = getProtoColor(selection.colorId).rgb;
  const swatchSize = density === "compact" ? "sm" : "md";

  return (
    <div
      className={cn(
        "flex flex-wrap justify-center [&>button]:cursor-pointer",
        density === "compact" ? "gap-2" : "gap-2.5",
      )}
    >
      {PROTO_TEXTURE_OPTIONS.map((texture) => {
        const selected = texture.id === selection.textureId;
        return (
          <ProtoTextureTooltip key={texture.id} label={texture.label}>
            <button
              type="button"
              onClick={() => onSelect(texture.id)}
              aria-pressed={selected}
              aria-label={texture.label}
              className="rounded-md p-0.5 transition-transform hover:scale-105"
            >
              <ProtoTextureSwatch
                textureId={texture.id}
                color={color}
                selected={selected}
                size={swatchSize}
              />
            </button>
          </ProtoTextureTooltip>
        );
      })}
    </div>
  );
}

function SegmentTabsCustomizer({
  selection,
  onSelectionChange,
  className,
}: Omit<ProtoShapeCustomizerBlockProps, "variant"> & { className?: string }) {
  const [tab, setTab] = useState<CustomizerTab>("shape");

  return (
    <div
      className={cn("flex flex-col items-center gap-4 px-5 py-4", className)}
    >
      <SegmentTabs value={tab} onChange={setTab} />
      {tab === "shape" ? (
        <ShapePicker
          selection={selection}
          onSelect={(shapeId) => onSelectionChange({ ...selection, shapeId })}
          layout="grid"
        />
      ) : (
        <ColorPicker
          selection={selection}
          onSelect={(colorId) => onSelectionChange({ ...selection, colorId })}
          layout="row"
        />
      )}
    </div>
  );
}

function FloatingToolbarCustomizer({
  selection,
  onSelectionChange,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  const [mode, setMode] = useState<CustomizerTab>("shape");
  const color = getProtoColor(selection.colorId).rgb;

  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="pointer-events-auto absolute inset-x-0 bottom-6 z-40 flex justify-center px-4"
    >
      <div className="border-border bg-background/95 flex max-w-md flex-col gap-3 rounded-2xl border px-3 py-3 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <SegmentTabs value={mode} onChange={setMode} />
          <span className="text-muted-foreground text-[0.6875rem] font-medium tracking-wide uppercase">
            Customize
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:cursor-pointer">
          {mode === "shape"
            ? PROTO_SHAPES.map((shape) => {
                const selected = shape.id === selection.shapeId;
                return (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() =>
                      onSelectionChange({ ...selection, shapeId: shape.id })
                    }
                    aria-pressed={selected}
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                      selected
                        ? "border-foreground bg-muted"
                        : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    <ProtoShapeIcon shapeId={shape.id} color={color} />
                  </button>
                );
              })
            : PROTO_COLORS.map((colorOption) => {
                const selected = colorOption.id === selection.colorId;
                return (
                  <button
                    key={colorOption.id}
                    type="button"
                    onClick={() =>
                      onSelectionChange({
                        ...selection,
                        colorId: colorOption.id,
                      })
                    }
                    aria-pressed={selected}
                    className="shrink-0 rounded-full p-0.5"
                  >
                    <ProtoColorSwatch
                      colorId={colorOption.id}
                      rgb={colorOption.rgb}
                      selected={selected}
                      size="sm"
                    />
                  </button>
                );
              })}
        </div>
      </div>
    </PrototypeComponent>
  );
}

function ShapeCarouselCustomizer({
  selection,
  onSelectionChange,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  const [panel, setPanel] = useState<CustomizerTab>("shape");

  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="border-border bg-background/95 mx-auto max-w-md rounded-2xl border px-4 py-4 shadow-lg backdrop-blur-md">
        <div className="mb-3 flex items-center justify-center gap-2 [&>button]:cursor-pointer">
          {(["shape", "color"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setPanel(tab)}
              className={cn(
                "rounded-full px-3 py-1 text-[0.75rem] font-medium capitalize",
                panel === tab
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        {panel === "shape" ? (
          <ShapePicker
            selection={selection}
            onSelect={(shapeId) => onSelectionChange({ ...selection, shapeId })}
            layout="carousel"
          />
        ) : (
          <ColorPicker
            selection={selection}
            onSelect={(colorId) => onSelectionChange({ ...selection, colorId })}
            layout="grid"
          />
        )}
      </div>
    </PrototypeComponent>
  );
}

function CompactDualRowCustomizer({
  selection,
  onSelectionChange,
  shapeLayout = "tiles",
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant"> & {
  shapeLayout?: "tiles" | "compact-tiles";
}) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="border-border bg-background pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t"
    >
      <div className="mx-auto flex max-w-md flex-col gap-2 px-5 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <DualRowControls
          selection={selection}
          onSelectionChange={onSelectionChange}
          shapeLayout={shapeLayout}
          density="compact"
          pickerVariant={pickerVariant}
          animateEntrance={animateEntrance}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}

function CompactMinimalDockCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto flex max-w-md flex-col gap-2 px-4 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-2">
        <DualRowControls
          selection={selection}
          onSelectionChange={onSelectionChange}
          shapeLayout="compact-tiles"
          density="compact"
          pickerVariant={pickerVariant ?? "labeled-tiles"}
          animateEntrance={animateEntrance}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}

function DualRowReservedCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="border-border bg-background pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <DualRowControls
          selection={selection}
          onSelectionChange={onSelectionChange}
          pickerVariant={pickerVariant}
          animateEntrance={animateEntrance}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}

function DualRowNudgeFirstCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="border-border bg-background/95 pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t shadow-[0_-8px_32px_rgb(0_0_0/0.06)] backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-md flex-col gap-4 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <DualRowControls
          selection={selection}
          onSelectionChange={onSelectionChange}
          pickerVariant={pickerVariant}
          animateEntrance={animateEntrance}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}

function DualRowColumnsCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="border-border bg-background pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {pickerVariant ? (
          <DualRowControls
            selection={selection}
            onSelectionChange={onSelectionChange}
            pickerVariant={pickerVariant}
            animateEntrance={animateEntrance}
            entranceKey={entranceKey}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-[0.6875rem] font-medium tracking-[0.14em] uppercase">
                Shape
              </p>
              <ShapePicker
                selection={selection}
                onSelect={(shapeId) =>
                  onSelectionChange({ ...selection, shapeId })
                }
                layout="grid"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-muted-foreground text-[0.6875rem] font-medium tracking-[0.14em] uppercase">
                Color
              </p>
              <ColorPicker
                selection={selection}
                onSelect={(colorId) =>
                  onSelectionChange({ ...selection, colorId })
                }
                layout="grid"
              />
            </div>
          </div>
        )}
      </div>
    </PrototypeComponent>
  );
}

function DualRowLiftedCardCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="border-border bg-background/95 mx-auto max-w-md rounded-2xl border px-4 py-4 shadow-lg backdrop-blur-md">
        <p className="text-muted-foreground mb-3 text-[0.6875rem] font-medium tracking-[0.14em] uppercase">
          Customize
        </p>
        <div className="flex flex-col gap-4">
          <DualRowControls
            selection={selection}
            onSelectionChange={onSelectionChange}
            pickerVariant={pickerVariant}
            animateEntrance={animateEntrance}
            entranceKey={entranceKey}
          />
        </div>
      </div>
    </PrototypeComponent>
  );
}

export function ProtoShapeCustomizerBlock({
  variant,
  selection,
  onSelectionChange,
  pickerVariant,
  animateEntrance = false,
  entranceKey,
}: ProtoShapeCustomizerBlockProps) {
  if (variant === "segment-tabs") {
    return (
      <PrototypeComponent id="proto-shape-customizer-block">
        <SegmentTabsCustomizer
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </PrototypeComponent>
    );
  }

  if (variant === "bottom-dock") {
    return (
      <PrototypeComponent
        id="proto-shape-customizer-block"
        className="border-border bg-background/95 pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t shadow-[0_-8px_32px_rgb(0_0_0/0.08)] backdrop-blur-md"
      >
        <SegmentTabsCustomizer
          selection={selection}
          onSelectionChange={onSelectionChange}
          className="pb-[max(1rem,env(safe-area-inset-bottom))]"
        />
      </PrototypeComponent>
    );
  }

  if (variant === "floating-toolbar") {
    return (
      <FloatingToolbarCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
      />
    );
  }

  if (variant === "compact-nudge-inline") {
    return (
      <CompactDualRowCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "compact-nudge-text-first") {
    return (
      <CompactDualRowCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "compact-link-nudge") {
    return (
      <CompactDualRowCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "compact-minimal-dock") {
    return (
      <CompactMinimalDockCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "dual-row-reserved") {
    return (
      <DualRowReservedCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "dual-row-nudge-first") {
    return (
      <DualRowNudgeFirstCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "dual-row-columns") {
    return (
      <DualRowColumnsCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "dual-row-lifted-card") {
    return (
      <DualRowLiftedCardCustomizer
        selection={selection}
        onSelectionChange={onSelectionChange}
        pickerVariant={pickerVariant}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
      />
    );
  }

  if (variant === "dual-row") {
    return (
      <PrototypeComponent
        id="proto-shape-customizer-block"
        className="border-border bg-background pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex max-w-md flex-col gap-4">
          <DualRowControls
            selection={selection}
            onSelectionChange={onSelectionChange}
            pickerVariant={pickerVariant}
            animateEntrance={animateEntrance}
            entranceKey={entranceKey}
          />
        </div>
      </PrototypeComponent>
    );
  }

  return (
    <ShapeCarouselCustomizer
      selection={selection}
      onSelectionChange={onSelectionChange}
    />
  );
}
