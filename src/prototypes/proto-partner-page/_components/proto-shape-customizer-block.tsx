"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { useState } from "react";

import {
  partnerCustomizePanelDelay,
} from "./partner-page-motion";
import {
  ProtoColorSwatch,
  ProtoShapeIcon,
  ProtoTextureSwatch,
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
import { MobilePickerLayoutControls } from "./mobile-picker-layout-block";
import type { MobilePickerLayoutVariant } from "./mobile-picker-layout-content";
import { MOBILE_PICKER_DOCK_DIVIDER_CLASS, MOBILE_PICKER_SURFACE } from "./mobile-picker-layout-content";
import {
  isUnifiedPanelMotionVariant,
  type MobilePanelMotionVariant,
} from "./mobile-panel-motion-content";
import { MobilePanelMotionShell } from "./mobile-panel-motion-shell";

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
  mobileLayoutVariant?: MobilePickerLayoutVariant;
  panelMotionVariant?: MobilePanelMotionVariant;
  panelMotionReplayKey?: string | number;
  animateEntrance?: boolean;
  entranceKey?: string | number;
};

type CustomizerTab = "shape" | "color";

const PICKER_TILE_BASE_CLASS =
  "flex aspect-square size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg p-0 transition-transform duration-150 ease-in-out";

const PICKER_SHAPE_TEXTURE_HOVER_CLASS = "hover:scale-[1.12]";

const PICKER_ROW_CLASS =
  "flex min-h-10 flex-wrap items-center justify-center gap-1.5 py-1 md:gap-2 [&>button]:cursor-pointer";

const SHAPE_PICKER_ROW_CLASS =
  "flex min-h-10 flex-wrap items-center justify-center gap-2.5 py-1 md:gap-4 [&>button]:cursor-pointer";

const TEXTURE_PICKER_ROW_CLASS =
  "flex min-h-10 flex-wrap items-center justify-center gap-2.5 py-1 md:gap-3 [&>button]:cursor-pointer";

const PICKER_TILE_SELECTED_CLASS = "shadow-[0_0_0_1px_rgb(0_0_0/0.85)]";

const SHAPE_TILE_ICON_CLASS = "size-8 md:size-7";

function pickerTileClasses(selected: boolean) {
  return cn(
    PICKER_TILE_BASE_CLASS,
    PICKER_SHAPE_TEXTURE_HOVER_CLASS,
    selected && PICKER_TILE_SELECTED_CLASS,
  );
}

function DualRowControls({
  selection,
  onSelectionChange,
  shapeLayout = "tiles",
  colorLayout = "row",
  density = "default",
  pickerVariant,
  mobileLayoutVariant,
  panelMotionVariant = "none",
  panelMotionReplayKey,
  entranceKey,
  layoutGroupScope,
}: {
  selection: ProtoShapeSelection;
  onSelectionChange: (next: ProtoShapeSelection) => void;
  shapeLayout?: "grid" | "carousel" | "tiles" | "compact-tiles";
  colorLayout?: "row" | "grid";
  density?: "default" | "compact";
  pickerVariant?: ShapeColorPickerVariant;
  mobileLayoutVariant?: MobilePickerLayoutVariant;
  panelMotionVariant?: MobilePanelMotionVariant;
  panelMotionReplayKey?: string | number;
  animateEntrance?: boolean;
  entranceKey?: string | number;
  layoutGroupScope?: string;
}) {
  if (mobileLayoutVariant) {
    return (
      <>
        <div className="md:hidden">
          <MobilePickerLayoutControls
            variant={mobileLayoutVariant}
            selection={selection}
            onSelectionChange={onSelectionChange}
            pickerVariant={pickerVariant}
            animateEntrance={false}
            entranceKey={entranceKey}
            layoutGroupScope={layoutGroupScope}
          />
        </div>
        <div className="hidden md:block">
          <ShapeColorPickerControls
            variant={pickerVariant ?? "labeled-tiles"}
            selection={selection}
            onSelectionChange={onSelectionChange}
            density={density === "compact" ? "compact" : "default"}
            animateEntrance={false}
            entranceKey={entranceKey}
          />
        </div>
      </>
    );
  }

  if (pickerVariant) {
    return (
      <ShapeColorPickerControls
        variant={pickerVariant}
        selection={selection}
        onSelectionChange={onSelectionChange}
        density={density === "compact" ? "compact" : "default"}
        animateEntrance={false}
        entranceKey={entranceKey}
      />
    );
  }

  const labelClass =
    density === "compact"
      ? "text-muted-foreground text-[0.625rem] font-medium tracking-[0.14em] uppercase"
      : "text-muted-foreground text-[0.6875rem] font-medium tracking-[0.14em] uppercase";
  const sectionGap = density === "compact" ? "gap-2.5" : "gap-2";

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

  if (layout === "compact-tiles") {
    return (
      <div className={SHAPE_PICKER_ROW_CLASS}>
        {PROTO_SHAPES.map((shape) => {
          const selected = shape.id === selection.shapeId;
          return (
            <button
              key={shape.id}
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              aria-label={shape.label}
              className={pickerTileClasses(selected)}
            >
              <ProtoShapeIcon
                shapeId={shape.id}
                color={color}
                className={SHAPE_TILE_ICON_CLASS}
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
    const iconSize = density === "compact" ? undefined : 28;
    const iconClass = density === "compact" ? SHAPE_TILE_ICON_CLASS : undefined;

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
                density === "compact"
                  ? pickerTileClasses(selected)
                  : cn(
                      "flex aspect-square items-center justify-center rounded-xl border transition-colors",
                      selected
                        ? "border-foreground bg-background shadow-sm"
                        : "border-border bg-muted/40 hover:border-foreground/30",
                    ),
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
        className={cn(
          "cursor-pointer rounded-full p-0.5 transition-transform duration-150 ease-in-out",
          "hover:scale-110",
        )}
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
        PICKER_ROW_CLASS,
        layout === "grid"
          ? "grid grid-cols-5 justify-items-center gap-3"
          : density === "compact"
            ? "gap-2"
            : "gap-3",
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

  return (
    <div className={TEXTURE_PICKER_ROW_CLASS}>
      {PROTO_TEXTURE_OPTIONS.map((texture) => {
        const selected = texture.id === selection.textureId;
        return (
          <button
            key={texture.id}
            type="button"
            onClick={() => onSelect(texture.id)}
            aria-pressed={selected}
            aria-label={texture.label}
            className={cn(
              "cursor-pointer p-0 transition-transform duration-150 ease-in-out",
              PICKER_SHAPE_TEXTURE_HOVER_CLASS,
            )}
          >
            <ProtoTextureSwatch
              textureId={texture.id}
              color={color}
              selected={selected}
              size="tile"
              className="rounded-md"
            />
          </button>
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
  mobileLayoutVariant,
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
          mobileLayoutVariant={mobileLayoutVariant}
          animateEntrance={animateEntrance}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}

const CUSTOMIZER_DOCK_DIVIDER_CLASS = MOBILE_PICKER_DOCK_DIVIDER_CLASS;

function CompactMinimalDockControls({
  selection,
  onSelectionChange,
  pickerVariant,
  mobileLayoutVariant,
  panelMotionVariant,
  panelMotionReplayKey,
  animateEntrance,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant"> & {
  panelMotionVariant: MobilePanelMotionVariant;
}) {
  const layoutGroupScope = String(
    panelMotionReplayKey ?? entranceKey ?? "customizer-dock",
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 pt-2 pb-3 sm:px-5 sm:pt-4 sm:pb-3 md:max-w-none md:px-8 md:pt-2 md:pb-2">
      <DualRowControls
        selection={selection}
        onSelectionChange={onSelectionChange}
        shapeLayout="compact-tiles"
        density="compact"
        pickerVariant={pickerVariant ?? "labeled-tiles"}
        mobileLayoutVariant={mobileLayoutVariant}
        panelMotionVariant={panelMotionVariant}
        panelMotionReplayKey={panelMotionReplayKey}
        animateEntrance={animateEntrance}
        entranceKey={entranceKey}
        layoutGroupScope={layoutGroupScope}
      />
    </div>
  );
}

function CompactMinimalDockCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  mobileLayoutVariant,
  panelMotionVariant = "none",
  panelMotionReplayKey,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  const unifiedPanel = isUnifiedPanelMotionVariant(panelMotionVariant);
  const panelEntranceDelay = animateEntrance ? partnerCustomizePanelDelay() : 0;
  const controls = (
    <CompactMinimalDockControls
      selection={selection}
      onSelectionChange={onSelectionChange}
      pickerVariant={pickerVariant}
      mobileLayoutVariant={mobileLayoutVariant}
      panelMotionVariant={panelMotionVariant}
      panelMotionReplayKey={panelMotionReplayKey}
      animateEntrance={animateEntrance}
      entranceKey={entranceKey}
    />
  );

  const dockChrome = (
    <>
      <div className={CUSTOMIZER_DOCK_DIVIDER_CLASS} aria-hidden />
      <div
        className="w-full"
        style={{ backgroundColor: MOBILE_PICKER_SURFACE }}
      >
        {controls}
      </div>
    </>
  );

  if (unifiedPanel) {
    return (
      <PrototypeComponent
        id="proto-shape-customizer-block"
        className="pointer-events-auto relative z-40 w-full shrink-0 overflow-hidden"
      >
        <MobilePanelMotionShell
          variant={panelMotionVariant}
          replayKey={panelMotionReplayKey ?? entranceKey}
          className="w-full"
          entranceDelay={panelEntranceDelay}
        >
          {dockChrome}
        </MobilePanelMotionShell>
      </PrototypeComponent>
    );
  }

  if (panelMotionVariant !== "none") {
    return (
      <PrototypeComponent
        id="proto-shape-customizer-block"
        className="pointer-events-auto relative z-40 w-full shrink-0"
      >
        <div className={CUSTOMIZER_DOCK_DIVIDER_CLASS} aria-hidden />
        <div
          className="w-full overflow-hidden"
          style={{ backgroundColor: MOBILE_PICKER_SURFACE }}
        >
          <MobilePanelMotionShell
            variant={panelMotionVariant}
            replayKey={panelMotionReplayKey ?? entranceKey}
            entranceDelay={panelEntranceDelay}
          >
            {controls}
          </MobilePanelMotionShell>
        </div>
      </PrototypeComponent>
    );
  }

  if (panelMotionVariant === "none" && animateEntrance) {
    return (
      <PrototypeComponent
        id="proto-shape-customizer-block"
        className="pointer-events-auto relative z-40 w-full shrink-0 overflow-hidden"
      >
        <MobilePanelMotionShell
          variant="slide-up"
          replayKey={panelMotionReplayKey ?? entranceKey}
          className="w-full"
          entranceDelay={panelEntranceDelay}
        >
          {dockChrome}
        </MobilePanelMotionShell>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="pointer-events-auto relative z-40 w-full shrink-0"
    >
      {dockChrome}
    </PrototypeComponent>
  );
}

function DualRowReservedCustomizer({
  selection,
  onSelectionChange,
  pickerVariant,
  mobileLayoutVariant,
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
          mobileLayoutVariant={mobileLayoutVariant}
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
  mobileLayoutVariant,
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
          mobileLayoutVariant={mobileLayoutVariant}
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
  mobileLayoutVariant,
  animateEntrance = false,
  entranceKey,
}: Omit<ProtoShapeCustomizerBlockProps, "variant">) {
  return (
    <PrototypeComponent
      id="proto-shape-customizer-block"
      className="border-border bg-background pointer-events-auto absolute inset-x-0 bottom-0 z-40 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {pickerVariant || mobileLayoutVariant ? (
          <DualRowControls
            selection={selection}
            onSelectionChange={onSelectionChange}
            pickerVariant={pickerVariant}
            mobileLayoutVariant={mobileLayoutVariant}
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
  mobileLayoutVariant,
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
            mobileLayoutVariant={mobileLayoutVariant}
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
  mobileLayoutVariant,
  panelMotionVariant = "none",
  panelMotionReplayKey,
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
        mobileLayoutVariant={mobileLayoutVariant}
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
        mobileLayoutVariant={mobileLayoutVariant}
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
        mobileLayoutVariant={mobileLayoutVariant}
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
        mobileLayoutVariant={mobileLayoutVariant}
        panelMotionVariant={panelMotionVariant}
        panelMotionReplayKey={panelMotionReplayKey}
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
        mobileLayoutVariant={mobileLayoutVariant}
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
        mobileLayoutVariant={mobileLayoutVariant}
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
        mobileLayoutVariant={mobileLayoutVariant}
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
        mobileLayoutVariant={mobileLayoutVariant}
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
            mobileLayoutVariant={mobileLayoutVariant}
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
