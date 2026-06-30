"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import type { ReactNode } from "react";

import {
  PartnerMotionFadeUp,
  partnerCustomizeColorDelay,
  partnerCustomizeShapeDelay,
  partnerCustomizeTextureDelay,
  usePartnerEntranceMotion,
} from "./partner-page-motion";
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
  type ProtoRgb,
  type ProtoShapeId,
  type ProtoTextureId,
} from "./proto-shape-content";
import type { ShapeColorPickerVariant } from "./shape-color-picker-content";

export type ShapeColorPickerSelection = {
  shapeId: ProtoShapeId;
  colorId: ProtoColorId;
  textureId: ProtoTextureId;
};

type ShapeColorPickerControlsProps = {
  variant: ShapeColorPickerVariant;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  density?: "default" | "compact";
  animateEntrance?: boolean;
  entranceKey?: string | number;
};

const LABEL_CLASS =
  "text-muted-foreground text-[0.625rem] font-medium tracking-[0.14em] uppercase";

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={LABEL_CLASS}>{children}</p>;
}

function EntranceWrap({
  animateEntrance,
  delay,
  children,
  className,
}: {
  animateEntrance: boolean;
  delay: number;
  children: ReactNode;
  className?: string;
}) {
  if (!animateEntrance) return <>{children}</>;
  return (
    <PartnerMotionFadeUp delay={delay} className={className}>
      {children}
    </PartnerMotionFadeUp>
  );
}

function ShapeColorPickerRows({
  variant,
  selection,
  onSelectionChange,
  density = "compact",
  animateEntrance = false,
  entranceKey,
}: ShapeColorPickerControlsProps) {
  const color = getProtoColor(selection.colorId).rgb;
  const mk = entranceKey ?? "live";
  const motionOn = usePartnerEntranceMotion(animateEntrance);

  const sectionGap = density === "compact" ? "gap-1" : "gap-2";
  const outerGap = sectionGap === "gap-1" ? "gap-4" : "gap-5";

  const shapeSection = (
    <div className={`flex flex-col ${sectionGap}`}>
      <SectionLabel>Shape</SectionLabel>
      {variant === "list-radio" ? (
        <div className="flex flex-col gap-1">
          {PROTO_SHAPES.map((shape, shapeIndex) => {
            const selected = shape.id === selection.shapeId;
            const button = (
              <button
                key={shape.id}
                type="button"
                onClick={() => onSelectionChange({ ...selection, shapeId: shape.id })}
                aria-pressed={selected}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
                  selected ? "bg-muted" : "hover:bg-muted/50",
                )}
              >
                <ProtoShapeIcon shapeId={shape.id} color={color} size={20} />
                <span className="flex-1 text-[0.8125rem] font-medium">{shape.label}</span>
                <span
                  className={cn(
                    "size-4 rounded-full border-2",
                    selected ? "border-foreground bg-foreground" : "border-border",
                  )}
                />
              </button>
            );
            return (
              <EntranceWrap
                key={shape.id}
                animateEntrance={motionOn}
                delay={partnerCustomizeShapeDelay(shapeIndex)}
              >
                {button}
              </EntranceWrap>
            );
          })}
        </div>
      ) : (
        <ShapeRow
          variant={variant}
          selection={selection}
          onSelect={(shapeId) => onSelectionChange({ ...selection, shapeId })}
          color={color}
          animateEntrance={motionOn}
        />
      )}
    </div>
  );

  const colorRowContent = (
    <ColorRow
      variant={variant}
      selection={selection}
      onSelect={(colorId) => onSelectionChange({ ...selection, colorId })}
      shapeId={selection.shapeId}
      animateEntrance={motionOn}
    />
  );

  const listRadioColorSection = (
    <div className="flex flex-col gap-1">
      {PROTO_COLORS.map((colorOption, colorIndex) => {
        const selected = colorOption.id === selection.colorId;
        const button = (
          <button
            key={colorOption.id}
            type="button"
            onClick={() =>
              onSelectionChange({ ...selection, colorId: colorOption.id })
            }
            aria-pressed={selected}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
              selected ? "bg-muted" : "hover:bg-muted/50",
            )}
          >
            <ProtoColorSwatch
              colorId={colorOption.id}
              rgb={colorOption.rgb}
              selected={false}
              size="sm"
            />
            <span className="flex-1 text-[0.8125rem] font-medium">{colorOption.label}</span>
            <span
              className={cn(
                "size-4 rounded-full border-2",
                selected ? "border-foreground bg-foreground" : "border-border",
              )}
            />
          </button>
        );
        return (
          <EntranceWrap
            key={colorOption.id}
            animateEntrance={motionOn}
            delay={partnerCustomizeColorDelay(colorIndex)}
          >
            {button}
          </EntranceWrap>
        );
      })}
    </div>
  );

  return (
    <div className={`flex flex-col ${outerGap}`} key={mk}>
      {shapeSection}
      <div className={`flex flex-col ${sectionGap}`}>
        <SectionLabel>Color</SectionLabel>
        {variant === "list-radio" ? listRadioColorSection : colorRowContent}
      </div>
      <div className={`flex flex-col ${sectionGap}`}>
        <SectionLabel>Texture</SectionLabel>
        {variant === "list-radio" ? (
          <div className="flex flex-col gap-1">
            {PROTO_TEXTURE_OPTIONS.map((textureOption, textureIndex) => {
              const selected = textureOption.id === selection.textureId;
              const button = (
                <button
                  key={textureOption.id}
                  type="button"
                  onClick={() =>
                    onSelectionChange({ ...selection, textureId: textureOption.id })
                  }
                  aria-pressed={selected}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
                    selected ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  <ProtoTextureSwatch
                    textureId={textureOption.id}
                    color={color}
                    selected={false}
                    size="sm"
                  />
                  <span className="flex-1 text-[0.8125rem] font-medium">
                    {textureOption.label}
                  </span>
                  <span
                    className={cn(
                      "size-4 rounded-full border-2",
                      selected ? "border-foreground bg-foreground" : "border-border",
                    )}
                  />
                </button>
              );
              return (
                <EntranceWrap
                  key={textureOption.id}
                  animateEntrance={motionOn}
                  delay={partnerCustomizeTextureDelay(textureIndex)}
                >
                  {button}
                </EntranceWrap>
              );
            })}
          </div>
        ) : (
          <TextureRow
            variant={variant}
            selection={selection}
            onSelect={(textureId) => onSelectionChange({ ...selection, textureId })}
            color={color}
            animateEntrance={motionOn}
          />
        )}
      </div>
    </div>
  );
}

function ShapeRow({
  variant,
  selection,
  onSelect,
  color,
  animateEntrance = false,
}: {
  variant: ShapeColorPickerVariant;
  selection: ShapeColorPickerSelection;
  onSelect: (shapeId: ProtoShapeId) => void;
  color: ProtoRgb;
  animateEntrance?: boolean;
}) {
  const wrapShape = (
    shapeId: string,
    shapeIndex: number,
    node: ReactNode,
    className?: string,
  ) => (
    <EntranceWrap
      key={shapeId}
      animateEntrance={animateEntrance}
      delay={partnerCustomizeShapeDelay(shapeIndex)}
      className={className}
    >
      {node}
    </EntranceWrap>
  );

  if (variant === "segmented-icons") {
    return (
      <div
        className="bg-muted inline-flex w-full rounded-xl p-0.5 [&_button]:cursor-pointer"
        role="group"
        aria-label="Shape"
      >
        {PROTO_SHAPES.map((shape, shapeIndex) => {
          const selected = shape.id === selection.shapeId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              aria-label={shape.label}
              className={cn(
                "flex flex-1 items-center justify-center rounded-[0.625rem] py-2 transition-colors",
                selected
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ProtoShapeIcon shapeId={shape.id} color={color} size={20} />
            </button>
          );
          return wrapShape(shape.id, shapeIndex, button, "flex flex-1");
        })}
      </div>
    );
  }

  if (variant === "pill-labels") {
    return (
      <div className="flex flex-wrap justify-center gap-1.5 [&_button]:cursor-pointer">
        {PROTO_SHAPES.map((shape, shapeIndex) => {
          const selected = shape.id === selection.shapeId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              className={cn(
                "rounded-full px-3 py-1 text-[0.6875rem] font-medium transition-colors",
                selected
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {shape.label}
            </button>
          );
          return wrapShape(shape.id, shapeIndex, button);
        })}
      </div>
    );
  }

  if (variant === "minimal-underline") {
    return (
      <div className="flex justify-between px-1 [&_button]:cursor-pointer">
        {PROTO_SHAPES.map((shape, shapeIndex) => {
          const selected = shape.id === selection.shapeId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(shape.id)}
              aria-pressed={selected}
              aria-label={shape.label}
              className="flex flex-col items-center gap-1.5 pb-0.5"
            >
              <ProtoShapeIcon shapeId={shape.id} color={color} size={22} />
              <span
                className={cn(
                  "h-0.5 w-5 rounded-full transition-colors",
                  selected ? "bg-foreground" : "bg-transparent",
                )}
              />
            </button>
          );
          return wrapShape(shape.id, shapeIndex, button);
        })}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-5 gap-1.5 [&_button]:w-full [&_button]:cursor-pointer">
      {PROTO_SHAPES.map((shape, shapeIndex) => {
        const selected = shape.id === selection.shapeId;
        const button = (
          <button
            type="button"
            onClick={() => onSelect(shape.id)}
            aria-pressed={selected}
            aria-label={shape.label}
            className={shapeButtonClass(variant, selected, color)}
          >
            <ShapeButtonContent
              variant={variant}
              shapeId={shape.id}
              color={color}
              selected={selected}
            />
          </button>
        );
        return wrapShape(shape.id, shapeIndex, button, "w-full");
      })}
    </div>
  );
}

function shapeButtonClass(
  variant: ShapeColorPickerVariant,
  selected: boolean,
  color: ProtoRgb,
): string {
  const base = "flex items-center justify-center transition-all";

  if (variant === "neon-glow") {
    const glow = selected
      ? `shadow-[0_0_12px_rgb(${color[0]}_${color[1]}_${color[2]}/0.55)]`
      : "";
    return cn(
      base,
      "h-9 rounded-xl border border-white/10 bg-white/5",
      selected ? `border-white/30 ${glow}` : "hover:bg-white/10",
    );
  }

  if (variant === "stamp-outlined") {
    return cn(
      base,
      "aspect-square rounded-sm border-2 p-1",
      selected
        ? "border-foreground bg-background"
        : "border-foreground/25 bg-background hover:border-foreground/50",
    );
  }

  if (variant === "material-tonal") {
    return cn(
      base,
      "aspect-square rounded-2xl p-1.5",
      selected
        ? "bg-muted shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_2px_8px_rgb(0_0_0/0.08)]"
        : "hover:bg-muted/60",
    );
  }

  if (variant === "filled-silhouette") {
    return cn(
      base,
      "aspect-square rounded-xl border p-1",
      selected
        ? "border-transparent bg-transparent"
        : "border-border/60 bg-muted/30 hover:border-foreground/20",
    );
  }

  if (variant === "combo-mini") {
    return cn(
      base,
      "aspect-square rounded-xl border p-0.5",
      selected
        ? "border-foreground bg-background shadow-sm"
        : "border-border bg-muted/30 hover:border-foreground/30",
    );
  }

  if (variant === "ring-gradient") {
    return cn(
      base,
      "aspect-square rounded-xl p-0.5",
      selected
        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
        : "hover:bg-muted/50",
    );
  }

  return cn(
    base,
    "aspect-square w-full overflow-hidden rounded-lg border p-1 sm:aspect-auto sm:h-10",
    selected
      ? "border-foreground bg-background shadow-sm"
      : "border-border bg-muted/40 hover:border-foreground/30",
  );
}

function ShapeButtonContent({
  variant,
  shapeId,
  color,
  selected,
}: {
  variant: ShapeColorPickerVariant;
  shapeId: ProtoShapeId;
  color: ProtoRgb;
  selected: boolean;
}) {
  const muted: ProtoRgb = [160, 160, 170];
  const iconColor = variant === "filled-silhouette" && !selected ? muted : color;

  if (variant === "combo-mini") {
    return <ProtoShapeIcon shapeId={shapeId} color={iconColor} size={24} />;
  }

  if (variant === "stamp-outlined") {
    return <ProtoShapeIcon shapeId={shapeId} color={iconColor} size={20} />;
  }

  return (
    <ProtoShapeIcon
      shapeId={shapeId}
      color={iconColor}
      className="size-7 sm:size-5"
    />
  );
}

function ColorRow({
  variant,
  selection,
  onSelect,
  shapeId,
  animateEntrance = false,
}: {
  variant: ShapeColorPickerVariant;
  selection: ShapeColorPickerSelection;
  onSelect: (colorId: ProtoColorId) => void;
  shapeId: ProtoShapeId;
  animateEntrance?: boolean;
}) {
  const wrapColor = (
    colorId: string,
    colorIndex: number,
    node: ReactNode,
    className?: string,
  ) => (
    <EntranceWrap
      key={colorId}
      animateEntrance={animateEntrance}
      delay={partnerCustomizeColorDelay(colorIndex)}
      className={className}
    >
      {node}
    </EntranceWrap>
  );

  if (variant === "segmented-icons") {
    return (
      <div className="flex justify-center gap-4 [&_button]:cursor-pointer">
        {PROTO_COLORS.map((colorOption, colorIndex) => {
          const selected = colorOption.id === selection.colorId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(colorOption.id)}
              aria-pressed={selected}
              aria-label={colorOption.label}
              className="rounded-full p-0.5 transition-transform hover:scale-105"
            >
              <ProtoColorSwatch
                colorId={colorOption.id}
                rgb={colorOption.rgb}
                selected={selected}
                size="sm"
              />
            </button>
          );
          return wrapColor(colorOption.id, colorIndex, button);
        })}
      </div>
    );
  }

  if (variant === "pill-labels") {
    return (
      <div className="flex flex-wrap justify-center gap-4 [&_button]:cursor-pointer">
        {PROTO_COLORS.map((colorOption, colorIndex) => {
          const selected = colorOption.id === selection.colorId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(colorOption.id)}
              aria-pressed={selected}
              className="flex flex-col items-center gap-1"
            >
              <ProtoColorSwatch
                colorId={colorOption.id}
                rgb={colorOption.rgb}
                selected={selected}
                size="md"
              />
              <span
                className={cn(
                  "text-[0.625rem] font-medium",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {colorOption.label}
              </span>
            </button>
          );
          return wrapColor(colorOption.id, colorIndex, button);
        })}
      </div>
    );
  }

  if (variant === "minimal-underline") {
    return (
      <div className="flex justify-center gap-4 [&_button]:cursor-pointer">
        {PROTO_COLORS.map((colorOption, colorIndex) => {
          const selected = colorOption.id === selection.colorId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(colorOption.id)}
              aria-pressed={selected}
              aria-label={colorOption.label}
              className="flex flex-col items-center gap-1.5 pb-0.5"
            >
              <ProtoColorSwatch
                colorId={colorOption.id}
                rgb={colorOption.rgb}
                selected={false}
                size="sm"
              />
              <span
                className={cn(
                  "h-0.5 w-5 rounded-full transition-colors",
                  selected ? "bg-foreground" : "bg-transparent",
                )}
              />
            </button>
          );
          return wrapColor(colorOption.id, colorIndex, button);
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 [&_button]:cursor-pointer">
      {PROTO_COLORS.map((colorOption, colorIndex) => {
        const selected = colorOption.id === selection.colorId;
        const button = (
          <button
            type="button"
            onClick={() => onSelect(colorOption.id)}
            aria-pressed={selected}
            aria-label={colorOption.label}
            className={colorButtonClass(variant, selected, colorOption.rgb)}
          >
            <ColorButtonContent
              variant={variant}
              colorOption={colorOption}
              selected={selected}
              shapeId={shapeId}
            />
          </button>
        );
        return wrapColor(colorOption.id, colorIndex, button);
      })}
    </div>
  );
}

function colorButtonClass(
  variant: ShapeColorPickerVariant,
  selected: boolean,
  rgb: ProtoRgb,
): string {
  if (variant === "neon-glow") {
    const glow = selected
      ? `shadow-[0_0_14px_rgb(${rgb[0]}_${rgb[1]}_${rgb[2]}/0.65)]`
      : "";
    return cn("rounded-full p-0.5 transition-transform hover:scale-105", glow);
  }

  if (variant === "stamp-outlined") {
    return cn(
      "rounded-sm p-0.5 transition-transform hover:scale-105",
      selected && "ring-2 ring-foreground ring-offset-2 ring-offset-[#1a1a22]",
    );
  }

  if (variant === "ring-gradient") {
    return cn(
      "rounded-full p-0.5 transition-transform hover:scale-105",
      selected &&
        "ring-2 ring-offset-2 ring-offset-background ring-[color-mix(in_srgb,rgb(var(--ring))_70%,transparent)]",
    );
  }

  return cn("rounded-full p-0.5 transition-transform hover:scale-105");
}

function ColorButtonContent({
  variant,
  colorOption,
  selected,
  shapeId,
}: {
  variant: ShapeColorPickerVariant;
  colorOption: (typeof PROTO_COLORS)[number];
  selected: boolean;
  shapeId: ProtoShapeId;
}) {
  if (variant === "combo-mini") {
    return (
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-full",
          selected && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
        )}
        style={{ backgroundColor: `rgb(${colorOption.rgb.join(",")})` }}
      >
        <ProtoShapeIcon shapeId={shapeId} color={[255, 255, 255]} size={14} />
      </span>
    );
  }

  if (variant === "filled-silhouette") {
    return (
      <span className="relative inline-flex">
        <ProtoColorSwatch
          colorId={colorOption.id}
          rgb={colorOption.rgb}
          selected={selected}
          size="sm"
        />
        {selected ? (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[0.625rem] font-bold text-white drop-shadow-sm">
            ✓
          </span>
        ) : null}
      </span>
    );
  }

  if (variant === "material-tonal") {
    return (
      <span
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-full shadow-[inset_0_2px_4px_rgb(255_255_255/0.35),0_2px_6px_rgb(0_0_0/0.06)]",
          selected && "ring-2 ring-foreground/80 ring-offset-2 ring-offset-background",
        )}
        style={{ backgroundColor: `rgb(${colorOption.rgb.join(",")})` }}
      />
    );
  }

  if (variant === "stamp-outlined") {
    return (
      <span
        className="inline-block size-7 rounded-sm border-2 border-foreground/20"
        style={{ backgroundColor: `rgb(${colorOption.rgb.join(",")})` }}
      />
    );
  }

  return (
    <ProtoColorSwatch
      colorId={colorOption.id}
      rgb={colorOption.rgb}
      selected={selected}
      size="mobile-md"
    />
  );
}

function TextureRow({
  variant,
  selection,
  onSelect,
  color,
  animateEntrance = false,
}: {
  variant: ShapeColorPickerVariant;
  selection: ShapeColorPickerSelection;
  onSelect: (textureId: ProtoTextureId) => void;
  color: ProtoRgb;
  animateEntrance?: boolean;
}) {
  const wrapTexture = (
    textureId: string,
    textureIndex: number,
    node: ReactNode,
    className?: string,
  ) => (
    <EntranceWrap
      key={textureId}
      animateEntrance={animateEntrance}
      delay={partnerCustomizeTextureDelay(textureIndex)}
      className={className}
    >
      {node}
    </EntranceWrap>
  );

  if (variant === "pill-labels") {
    return (
      <div className="flex flex-wrap justify-center gap-3 [&_button]:cursor-pointer">
        {PROTO_TEXTURE_OPTIONS.map((textureOption, textureIndex) => {
          const selected = textureOption.id === selection.textureId;
          const button = (
            <button
              type="button"
              onClick={() => onSelect(textureOption.id)}
              aria-pressed={selected}
              className="flex flex-col items-center gap-1"
            >
              <ProtoTextureSwatch
                textureId={textureOption.id}
                color={color}
                selected={selected}
                size="sm"
              />
              <span
                className={cn(
                  "text-[0.625rem] font-medium",
                  selected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {textureOption.label}
              </span>
            </button>
          );
          return wrapTexture(textureOption.id, textureIndex, button);
        })}
      </div>
    );
  }

  if (variant === "minimal-underline") {
    return (
      <div className="flex flex-wrap justify-center gap-3 [&_button]:cursor-pointer">
        {PROTO_TEXTURE_OPTIONS.map((textureOption, textureIndex) => {
          const selected = textureOption.id === selection.textureId;
          const button = (
            <ProtoTextureTooltip label={textureOption.label}>
              <button
                type="button"
                onClick={() => onSelect(textureOption.id)}
                aria-pressed={selected}
                aria-label={textureOption.label}
                className="flex flex-col items-center gap-1.5 pb-0.5"
              >
                <ProtoTextureSwatch
                  textureId={textureOption.id}
                  color={color}
                  selected={false}
                  size="sm"
                />
                <span
                  className={cn(
                    "h-0.5 w-5 rounded-full transition-colors",
                    selected ? "bg-foreground" : "bg-transparent",
                  )}
                />
              </button>
            </ProtoTextureTooltip>
          );
          return wrapTexture(textureOption.id, textureIndex, button);
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2.5 [&_button]:cursor-pointer">
      {PROTO_TEXTURE_OPTIONS.map((textureOption, textureIndex) => {
        const selected = textureOption.id === selection.textureId;
        const button = (
          <ProtoTextureTooltip label={textureOption.label}>
            <button
              type="button"
              onClick={() => onSelect(textureOption.id)}
              aria-pressed={selected}
              aria-label={textureOption.label}
              className={textureButtonClass(variant, selected, color)}
            >
              <ProtoTextureSwatch
                textureId={textureOption.id}
                color={color}
                selected={selected}
                size={variant === "stamp-outlined" ? "sm" : "md"}
              />
            </button>
          </ProtoTextureTooltip>
        );
        return wrapTexture(textureOption.id, textureIndex, button);
      })}
    </div>
  );
}

function textureButtonClass(
  variant: ShapeColorPickerVariant,
  selected: boolean,
  rgb: ProtoRgb,
): string {
  if (variant === "neon-glow") {
    const glow = selected
      ? `shadow-[0_0_14px_rgb(${rgb[0]}_${rgb[1]}_${rgb[2]}/0.65)]`
      : "";
    return cn("rounded-md p-0.5 transition-transform hover:scale-105", glow);
  }

  if (variant === "stamp-outlined") {
    return cn(
      "rounded-sm p-0.5 transition-transform hover:scale-105",
      selected && "ring-2 ring-foreground ring-offset-2 ring-offset-[#1a1a22]",
    );
  }

  if (variant === "ring-gradient") {
    return cn(
      "rounded-md p-0.5 transition-transform hover:scale-105",
      selected &&
        "ring-2 ring-offset-2 ring-offset-background ring-[color-mix(in_srgb,rgb(var(--ring))_70%,transparent)]",
    );
  }

  if (variant === "material-tonal") {
    return cn(
      "rounded-xl p-0.5 transition-transform hover:scale-105",
      selected && "bg-muted shadow-sm",
    );
  }

  return cn("rounded-md p-0.5 transition-transform hover:scale-105");
}

export function ShapeColorPickerControls({
  variant,
  selection,
  onSelectionChange,
  density = "compact",
  animateEntrance = false,
  entranceKey,
}: ShapeColorPickerControlsProps) {
  const isNeon = variant === "neon-glow";
  const motionOn = usePartnerEntranceMotion(animateEntrance);

  return (
    <PrototypeComponent id="shape-color-picker-block.shape-color-picker-controls">
      <div
        className={cn(
          isNeon &&
            "rounded-2xl bg-[#1a1a22] px-3 py-3 [&_.text-muted-foreground]:text-white/50",
        )}
      >
        <ShapeColorPickerRows
          variant={variant}
          selection={selection}
          onSelectionChange={onSelectionChange}
          density={density}
          animateEntrance={motionOn}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}

type ShapeColorPickerBlockProps = ShapeColorPickerControlsProps;

export function ShapeColorPickerBlock({
  variant,
  selection,
  onSelectionChange,
}: ShapeColorPickerBlockProps) {
  return (
    <PrototypeComponent
      id="shape-color-picker-block"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto flex max-w-md flex-col gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
        <ShapeColorPickerControls
          variant={variant}
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </PrototypeComponent>
  );
}
