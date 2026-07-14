"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { partnerEaseOut } from "./partner-page-motion";

import {
  ProtoColorSwatch,
  ProtoShapeIcon,
  ProtoTextureSwatch,
} from "./proto-shape-icons";
import {
  getProtoColor,
  getProtoShape,
  getProtoTexture,
} from "./proto-shape-content";
import {
  ShapeColorPickerControls,
  type ShapeColorPickerSelection,
} from "./shape-color-picker-block";
import type { ShapeColorPickerVariant } from "./shape-color-picker-content";

import { usePanelMotionEntranceComplete } from "./mobile-panel-motion-shell";

import {
  type MobilePickerLayoutVariant,
  MOBILE_PICKER_DOCK_BORDER_CLASS,
  MOBILE_PICKER_SURFACE,
  MOBILE_PICKER_TOGGLE_BORDER,
  MOBILE_PICKER_TOGGLE_TRACK,
  type PickerSection,
  PICKER_SECTION_LABELS,
  PICKER_SECTIONS,
  DEFAULT_PICKER_SECTION,
} from "./mobile-picker-layout-content";

type MobilePickerLayoutBlockProps = {
  variant: MobilePickerLayoutVariant;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  pickerVariant?: ShapeColorPickerVariant;
  animateEntrance?: boolean;
  entranceKey?: string | number;
  /** Scopes shared layout ids so multiple previews do not cross-animate. */
  layoutGroupScope?: string;
};

type PickerPanelProps = {
  section: PickerSection;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  pickerVariant?: ShapeColorPickerVariant;
  animateEntrance?: boolean;
  entranceKey?: string | number;
};

function PickerPanel({
  section,
  selection,
  onSelectionChange,
  pickerVariant = "labeled-tiles",
  animateEntrance,
  entranceKey,
}: PickerPanelProps) {
  return (
    <ShapeColorPickerControls
      variant={pickerVariant}
      selection={selection}
      onSelectionChange={onSelectionChange}
      density="compact"
      visibleSections={[section]}
      showSectionLabels={false}
      animateEntrance={animateEntrance}
      entranceKey={entranceKey}
    />
  );
}

function usePickerSectionWithSlide(
  initial: PickerSection = DEFAULT_PICKER_SECTION,
) {
  const [active, setActive] = useState<PickerSection>(initial);
  const [direction, setDirection] = useState(1);

  const setActiveWithDirection = (next: PickerSection) => {
    if (next === active) return;
    const prevIndex = PICKER_SECTIONS.indexOf(active);
    const nextIndex = PICKER_SECTIONS.indexOf(next);
    setDirection(nextIndex > prevIndex ? 1 : -1);
    setActive(next);
  };

  return { active, direction, setActive: setActiveWithDirection };
}

const PICKER_DRAG_SNAP_DURATION = 0.28;
const PICKER_DRAG_TAB_DURATION = 0.32;

function clampPickerIndex(index: number) {
  return Math.max(0, Math.min(PICKER_SECTIONS.length - 1, index));
}

function AnimatedPickerPanel({
  section,
  direction: _direction,
  animateEntrance: _animateEntrance,
  entranceKey: _entranceKey,
  onSectionChange,
  ...pickerProps
}: PickerPanelProps & {
  direction: number;
  onSectionChange?: (next: PickerSection) => void;
}) {
  const reduceMotion = useReducedMotion();
  const index = PICKER_SECTIONS.indexOf(section);
  const isDraggable = Boolean(onSectionChange && !reduceMotion);
  const containerRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const x = useMotionValue(0);
  const isDragging = useRef(false);
  const hasInitializedPosition = useRef(false);

  useEffect(() => {
    if (!isDraggable) return;

    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setPanelWidth(container.clientWidth);
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, [isDraggable]);

  useEffect(() => {
    if (!isDraggable || !panelWidth) return;

    const targetX = -index * panelWidth;
    if (!hasInitializedPosition.current) {
      x.set(targetX);
      hasInitializedPosition.current = true;
      return;
    }

    if (isDragging.current) return;

    animate(x, targetX, {
      duration: PICKER_DRAG_TAB_DURATION,
      ease: partnerEaseOut,
    });
  }, [index, isDraggable, panelWidth, x]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    isDragging.current = false;
    if (!onSectionChange || !panelWidth) return;

    const projectedIndex = clampPickerIndex(Math.round(-x.get() / panelWidth));
    let targetIndex = projectedIndex;

    const velocityThreshold = 450;
    if (info.velocity.x <= -velocityThreshold) {
      targetIndex = clampPickerIndex(index + 1);
    } else if (info.velocity.x >= velocityThreshold) {
      targetIndex = clampPickerIndex(index - 1);
    }

    const targetX = -targetIndex * panelWidth;
    animate(x, targetX, {
      duration: PICKER_DRAG_SNAP_DURATION,
      ease: partnerEaseOut,
    });

    const nextSection = PICKER_SECTIONS[targetIndex];
    if (nextSection && nextSection !== section) {
      onSectionChange(nextSection);
    }
  };

  const panelTrack = (
    <>
      <div
        className="invisible pointer-events-none grid [&>*]:col-start-1 [&>*]:row-start-1"
        aria-hidden
      >
        {PICKER_SECTIONS.map((pickerSection) => (
          <PickerPanel
            key={pickerSection}
            section={pickerSection}
            {...pickerProps}
            animateEntrance={false}
          />
        ))}
      </div>
      <motion.div
        className={cn(
          "absolute inset-x-0 top-0 flex",
          isDraggable && "cursor-grab active:cursor-grabbing",
        )}
        style={{ x }}
        drag={isDraggable && panelWidth ? "x" : false}
        dragDirectionLock
        dragMomentum={false}
        dragElastic={0.12}
        dragConstraints={
          panelWidth
            ? {
                left: -(PICKER_SECTIONS.length - 1) * panelWidth,
                right: 0,
              }
            : undefined
        }
        onDragStart={() => {
          isDragging.current = true;
        }}
        onDragEnd={handleDragEnd}
      >
        {PICKER_SECTIONS.map((pickerSection) => (
          <div key={pickerSection} className="w-full shrink-0">
            <PickerPanel
              section={pickerSection}
              {...pickerProps}
              animateEntrance={false}
            />
          </div>
        ))}
      </motion.div>
    </>
  );

  if (reduceMotion) {
    return (
      <div className="py-1">
        <PickerPanel
          section={section}
          {...pickerProps}
          animateEntrance={false}
        />
      </div>
    );
  }

  if (!onSectionChange) {
    return (
      <div className="relative overflow-x-hidden py-1">
        <div
          className="invisible pointer-events-none grid [&>*]:col-start-1 [&>*]:row-start-1"
          aria-hidden
        >
          {PICKER_SECTIONS.map((pickerSection) => (
            <PickerPanel
              key={pickerSection}
              section={pickerSection}
              {...pickerProps}
              animateEntrance={false}
            />
          ))}
        </div>
        <motion.div
          className="absolute inset-x-0 top-0 flex"
          animate={{ transform: `translateX(-${index * 100}%)` }}
          transition={{
            duration: PICKER_DRAG_TAB_DURATION,
            ease: partnerEaseOut,
          }}
        >
          {PICKER_SECTIONS.map((pickerSection) => (
            <div key={pickerSection} className="w-full shrink-0">
              <PickerPanel
                section={pickerSection}
                {...pickerProps}
                animateEntrance={false}
              />
            </div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative touch-pan-y overflow-x-hidden py-1"
    >
      {panelTrack}
    </div>
  );
}

function SectionSummary({
  section,
  selection,
}: {
  section: PickerSection;
  selection: ShapeColorPickerSelection;
}) {
  const color = getProtoColor(selection.colorId).rgb;

  if (section === "shape") {
    const shape = getProtoShape(selection.shapeId);
    return (
      <span className="flex items-center gap-2">
        <ProtoShapeIcon shapeId={shape.id} color={color} size={18} />
        <span className="text-[0.8125rem] font-medium">{shape.label}</span>
      </span>
    );
  }

  if (section === "color") {
    const colorOption = getProtoColor(selection.colorId);
    return (
      <span className="flex items-center gap-2">
        <ProtoColorSwatch
          colorId={colorOption.id}
          rgb={colorOption.rgb}
          selected={false}
          size="sm"
        />
        <span className="text-[0.8125rem] font-medium">
          {colorOption.label}
        </span>
      </span>
    );
  }

  const texture = getProtoTexture(selection.textureId);
  return (
    <span className="flex items-center gap-2">
      <ProtoTextureSwatch
        textureId={texture.id}
        color={color}
        selected={false}
        size="sm"
      />
      <span className="text-[0.8125rem] font-medium">{texture.label}</span>
    </span>
  );
}

function ThreeWayTabs({
  active,
  onChange,
}: {
  active: PickerSection;
  onChange: (next: PickerSection) => void;
}) {
  return (
    <div
      className="bg-muted inline-flex w-full rounded-full p-0.5 [&_button]:cursor-pointer"
      role="tablist"
      aria-label="Picker type"
    >
      {PICKER_SECTIONS.map((section) => (
        <button
          key={section}
          type="button"
          role="tab"
          aria-selected={active === section}
          onClick={() => onChange(section)}
          className={cn(
            "flex-1 rounded-full px-2 py-1.5 text-[0.75rem] font-medium capitalize transition-colors",
            active === section
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {PICKER_SECTION_LABELS[section]}
        </button>
      ))}
    </div>
  );
}

function SlidingGreyTabThumb({ layoutId }: { layoutId: string }) {
  const entranceComplete = usePanelMotionEntranceComplete();
  const borderWidth = useMotionValue(entranceComplete ? 1 : 0);
  const boxShadow = useMotionTemplate`inset 0 0 0 ${borderWidth}px ${MOBILE_PICKER_TOGGLE_BORDER}, 0 1px 2px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.08)`;

  const revealBorder = () => {
    borderWidth.set(0);
    void animate(borderWidth, 1, {
      duration: 0.22,
      ease: [0.22, 1, 0.36, 1],
    });
  };

  useEffect(() => {
    if (!entranceComplete) return;
    revealBorder();
  }, [entranceComplete]);

  if (!entranceComplete) {
    return (
      <span
        className="absolute inset-0 rounded-md bg-white"
        style={{
          backgroundColor: "#ffffff",
          boxShadow: `inset 0 0 0 1px ${MOBILE_PICKER_TOGGLE_BORDER}, 0 1px 2px rgb(0 0 0 / 0.06), 0 1px 3px rgb(0 0 0 / 0.08)`,
        }}
      />
    );
  }

  return (
    <motion.span
      layoutId={layoutId}
      className="absolute inset-0 rounded-md bg-white"
      style={{
        backgroundColor: "#ffffff",
        boxShadow,
      }}
      onLayoutAnimationStart={() => borderWidth.set(0)}
      onLayoutAnimationComplete={revealBorder}
      transition={{
        layout: { type: "spring", stiffness: 380, damping: 34 },
      }}
    />
  );
}

function SlidingGreyTabs({
  active,
  onChange,
  layoutGroupScope = "default",
}: {
  active: PickerSection;
  onChange: (next: PickerSection) => void;
  layoutGroupScope?: string;
}) {
  const layoutGroupId = `mobile-picker-sliding-grey-tabs-${layoutGroupScope}`;
  const thumbLayoutId = `mobile-picker-sliding-grey-tab-thumb-${layoutGroupScope}`;

  return (
    <LayoutGroup id={layoutGroupId}>
      <div
        className="inline-flex w-fit rounded-lg border p-0.5 [&_button]:cursor-pointer"
        style={{
          backgroundColor: MOBILE_PICKER_TOGGLE_TRACK,
          borderColor: MOBILE_PICKER_TOGGLE_BORDER,
        }}
        role="group"
        aria-label="Picker type"
      >
        {PICKER_SECTIONS.map((section) => {
          const selected = active === section;
          return (
            <button
              key={section}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(section)}
              className="relative z-10 inline-flex items-center justify-center rounded-md px-4 py-1.5"
            >
              {selected ? (
                <SlidingGreyTabThumb layoutId={thumbLayoutId} />
              ) : null}
              <span
                className={cn(
                  "relative z-10 text-[0.8125rem] capitalize transition-colors duration-200",
                  selected
                    ? "font-semibold text-[#18181b]"
                    : "font-normal text-[#71717a] hover:text-[#52525b]",
                )}
              >
                {PICKER_SECTION_LABELS[section]}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

function SectionIconButton({
  section,
  active,
  selection,
  onClick,
}: {
  section: PickerSection;
  active: boolean;
  selection: ShapeColorPickerSelection;
  onClick: () => void;
}) {
  const color = getProtoColor(selection.colorId).rgb;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={PICKER_SECTION_LABELS[section]}
      className={cn(
        "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border transition-colors",
        active
          ? "border-foreground bg-muted"
          : "border-transparent hover:bg-muted/60",
      )}
    >
      {section === "shape" ? (
        <ProtoShapeIcon shapeId={selection.shapeId} color={color} size={22} />
      ) : section === "color" ? (
        <ProtoColorSwatch
          colorId={selection.colorId}
          rgb={color}
          selected={false}
          size="sm"
        />
      ) : (
        <ProtoTextureSwatch
          textureId={selection.textureId}
          color={color}
          selected={false}
          size="sm"
        />
      )}
    </button>
  );
}

function StackedRowsLayout(props: MobilePickerLayoutBlockProps) {
  return (
    <ShapeColorPickerControls
      variant={props.pickerVariant ?? "labeled-tiles"}
      selection={props.selection}
      onSelectionChange={props.onSelectionChange}
      density="compact"
      visibleSections={PICKER_SECTIONS}
      animateEntrance={props.animateEntrance}
      entranceKey={props.entranceKey}
    />
  );
}

function ThreeWayTabsLayout(props: MobilePickerLayoutBlockProps) {
  const { active, direction, setActive } = usePickerSectionWithSlide();

  return (
    <div className="flex flex-col gap-3">
      <AnimatedPickerPanel
        section={active}
        direction={direction}
        onSectionChange={setActive}
        {...props}
      />
      <ThreeWayTabs active={active} onChange={setActive} />
    </div>
  );
}

function SlidingGreyTabsLayout(props: MobilePickerLayoutBlockProps) {
  const { active, direction, setActive } = usePickerSectionWithSlide();

  return (
    <div className="flex flex-col gap-0.5">
      <AnimatedPickerPanel
        section={active}
        direction={direction}
        onSectionChange={setActive}
        {...props}
      />
      <div className="flex justify-center">
        <SlidingGreyTabs
          active={active}
          onChange={setActive}
          layoutGroupScope={props.layoutGroupScope}
        />
      </div>
    </div>
  );
}

function IconRailLayout(props: MobilePickerLayoutBlockProps) {
  const { active, direction, setActive } = usePickerSectionWithSlide();

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-1.5">
        {PICKER_SECTIONS.map((section) => (
          <SectionIconButton
            key={section}
            section={section}
            active={active === section}
            selection={props.selection}
            onClick={() => setActive(section)}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-muted-foreground mb-2 text-[0.625rem] font-medium tracking-[0.14em] uppercase">
          {PICKER_SECTION_LABELS[active]}
        </p>
        <AnimatedPickerPanel
          section={active}
          direction={direction}
          onSectionChange={setActive}
          {...props}
        />
      </div>
    </div>
  );
}

function AccordionLayout(props: MobilePickerLayoutBlockProps) {
  const [expanded, setExpanded] = useState<PickerSection | null>(
    DEFAULT_PICKER_SECTION,
  );

  return (
    <div className="flex flex-col gap-1">
      {PICKER_SECTIONS.map((section) => {
        const open = expanded === section;
        return (
          <div
            key={section}
            className={cn(
              "overflow-hidden rounded-xl border transition-colors",
              open ? "border-foreground/20 bg-muted/30" : "border-border",
            )}
          >
            <button
              type="button"
              onClick={() => setExpanded(open ? null : section)}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-left"
            >
              <span className="text-muted-foreground text-[0.625rem] font-medium tracking-[0.14em] uppercase">
                {PICKER_SECTION_LABELS[section]}
              </span>
              <span className="flex min-w-0 flex-1 items-center justify-end gap-2">
                {!open ? (
                  <SectionSummary
                    section={section}
                    selection={props.selection}
                  />
                ) : null}
                {open ? (
                  <ChevronUp className="text-muted-foreground size-4 shrink-0" />
                ) : (
                  <ChevronDown className="text-muted-foreground size-4 shrink-0" />
                )}
              </span>
            </button>
            {open ? (
              <div className="border-border border-t px-3 pt-2 pb-3">
                <PickerPanel section={section} {...props} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PeekBarLayout(props: MobilePickerLayoutBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const { active, direction, setActive } = usePickerSectionWithSlide();

  if (!expanded) {
    const color = getProtoColor(props.selection.colorId).rgb;
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="border-border bg-muted/40 flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-left"
      >
        <span className="text-muted-foreground shrink-0 text-[0.625rem] font-medium tracking-[0.12em] uppercase">
          Customize
        </span>
        <span className="flex min-w-0 flex-1 items-center justify-center gap-2.5">
          <ProtoTextureSwatch
            textureId={props.selection.textureId}
            color={color}
            selected={false}
            size="sm"
          />
          <ProtoShapeIcon
            shapeId={props.selection.shapeId}
            color={color}
            size={20}
          />
          <ProtoColorSwatch
            colorId={props.selection.colorId}
            rgb={color}
            selected={false}
            size="sm"
          />
        </span>
        <ChevronUp className="text-muted-foreground size-4 shrink-0 rotate-180" />
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatedPickerPanel
        section={active}
        direction={direction}
        onSectionChange={setActive}
        {...props}
      />
      <div className="flex items-center justify-between gap-2">
        <ThreeWayTabs active={active} onChange={setActive} />
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Collapse pickers"
          className="text-muted-foreground hover:text-foreground flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  );
}

function SwipeDotsLayout(props: MobilePickerLayoutBlockProps) {
  const [index, setIndex] = useState(0);
  const active = PICKER_SECTIONS[index]!;
  const [direction, setDirection] = useState(1);

  const goToIndex = (nextIndex: number) => {
    if (nextIndex === index) return;
    setDirection(nextIndex > index ? 1 : -1);
    setIndex(nextIndex);
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatedPickerPanel
        section={active}
        direction={direction}
        onSectionChange={(next) => goToIndex(PICKER_SECTIONS.indexOf(next))}
        {...props}
      />
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goToIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          aria-label="Previous picker"
          className="text-muted-foreground hover:text-foreground flex size-8 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[0.8125rem] font-medium">
            {PICKER_SECTION_LABELS[active]}
          </p>
          <div
            className="flex gap-1.5"
            role="tablist"
            aria-label="Picker panels"
          >
            {PICKER_SECTIONS.map((section, dotIndex) => (
              <button
                key={section}
                type="button"
                role="tab"
                aria-selected={dotIndex === index}
                onClick={() => goToIndex(dotIndex)}
                className={cn(
                  "size-1.5 cursor-pointer rounded-full transition-colors",
                  dotIndex === index ? "bg-foreground" : "bg-border",
                )}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() =>
            goToIndex(Math.min(PICKER_SECTIONS.length - 1, index + 1))
          }
          disabled={index === PICKER_SECTIONS.length - 1}
          aria-label="Next picker"
          className="text-muted-foreground hover:text-foreground flex size-8 cursor-pointer items-center justify-center rounded-lg disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

function StepWizardLayout(props: MobilePickerLayoutBlockProps) {
  const [step, setStep] = useState(0);
  const active = PICKER_SECTIONS[step]!;
  const [direction, setDirection] = useState(1);

  const goToStep = (nextStep: number) => {
    if (nextStep === step) return;
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  return (
    <div className="flex flex-col gap-3">
      <AnimatedPickerPanel
        section={active}
        direction={direction}
        onSectionChange={(next) => goToStep(PICKER_SECTIONS.indexOf(next))}
        {...props}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-muted-foreground text-[0.6875rem] font-medium">
          Step {step + 1} of {PICKER_SECTIONS.length}
        </p>
        <p className="text-[0.8125rem] font-medium">
          {PICKER_SECTION_LABELS[active]}
        </p>
      </div>
      <div className="bg-muted h-1 overflow-hidden rounded-full">
        <div
          className="bg-foreground h-full rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / PICKER_SECTIONS.length) * 100}%` }}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => goToStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="border-border text-muted-foreground hover:text-foreground flex-1 cursor-pointer rounded-lg border py-2.5 text-[0.8125rem] font-medium disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() =>
            goToStep(Math.min(PICKER_SECTIONS.length - 1, step + 1))
          }
          disabled={step === PICKER_SECTIONS.length - 1}
          className="bg-foreground text-background flex-1 cursor-pointer rounded-lg py-2.5 text-[0.8125rem] font-medium disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ScrubberPillsLayout(props: MobilePickerLayoutBlockProps) {
  const { active, direction, setActive } = usePickerSectionWithSlide();

  return (
    <div className="flex flex-col gap-3">
      <AnimatedPickerPanel
        section={active}
        direction={direction}
        onSectionChange={setActive}
        {...props}
      />
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>button]:cursor-pointer">
        {PICKER_SECTIONS.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setActive(section)}
            aria-pressed={active === section}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[0.75rem] font-medium capitalize transition-colors",
              active === section
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {PICKER_SECTION_LABELS[section]}
          </button>
        ))}
      </div>
    </div>
  );
}

const LAYOUT_RENDERERS: Record<
  MobilePickerLayoutVariant,
  (props: MobilePickerLayoutBlockProps) => ReactNode
> = {
  "stacked-rows": StackedRowsLayout,
  "sliding-grey-tabs": SlidingGreyTabsLayout,
  "three-way-tabs": ThreeWayTabsLayout,
  "icon-rail": IconRailLayout,
  accordion: AccordionLayout,
  "peek-bar": PeekBarLayout,
  "swipe-dots": SwipeDotsLayout,
  "step-wizard": StepWizardLayout,
  "scrubber-pills": ScrubberPillsLayout,
};

export function MobilePickerLayoutControls(
  props: MobilePickerLayoutBlockProps,
) {
  const Renderer = LAYOUT_RENDERERS[props.variant];
  return (
    <PrototypeComponent id="mobile-picker-layout-block.mobile-picker-layout-controls">
      {Renderer(props)}
    </PrototypeComponent>
  );
}

export function MobilePickerLayoutBlock({
  variant,
  selection,
  onSelectionChange,
}: Omit<MobilePickerLayoutBlockProps, "animateEntrance" | "entranceKey">) {
  return (
    <PrototypeComponent
      id="mobile-picker-layout-block"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 w-full"
      style={{ backgroundColor: MOBILE_PICKER_SURFACE }}
    >
      <div
        className={`${MOBILE_PICKER_DOCK_BORDER_CLASS} mx-auto max-w-md px-4 pt-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5`}
      >
        <MobilePickerLayoutControls
          variant={variant}
          selection={selection}
          onSelectionChange={onSelectionChange}
        />
      </div>
    </PrototypeComponent>
  );
}
