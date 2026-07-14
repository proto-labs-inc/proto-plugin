"use client";

import { PrototypeComponent } from "proto-plugin";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import type { MobilePanelMotionVariant } from "./mobile-panel-motion-content";

export const partnerEaseOut = [0.22, 1, 0.36, 1] as const;

// NOTE: Entrance transforms are written as full `transform` strings (not the
// `x`/`y`/`scale` shorthands) so Motion runs them via the compositor (WAAPI)
// instead of the main-thread JS frameloop. Mobile browsers throttle rAF (e.g.
// iOS Low Power Mode) which desyncs shorthand-driven delays and scrambles the
// staggered entrance order; WAAPI transforms stay correctly timed.
export const partnerFadeUpHidden = { opacity: 0, transform: "translateY(18px)" };
export const partnerFadeUpVisible = { opacity: 1, transform: "translateY(0px)" };

export const partnerPopSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 26,
};

export const partnerCtaSpring = {
  type: "spring" as const,
  stiffness: 360,
  damping: 22,
};

/** Extra beat after controls land before the primary action enters. */
export const PARTNER_CTA_ENTRANCE_DELAY_EXTRA = 0.25;

export const PARTNER_FADE_UP_DURATION = 0.55;

export function usePartnerEntranceMotion(enabled: boolean) {
  const reduceMotion = useReducedMotion();
  return enabled && !reduceMotion;
}

type PartnerMotionFadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function PartnerMotionFadeUp({
  children,
  className,
  delay = 0,
}: PartnerMotionFadeUpProps) {
  return (
    <PrototypeComponent id="partner-page-motion.partner-motion-fade-up" className={className}>
      <motion.div
        initial={partnerFadeUpHidden}
        animate={partnerFadeUpVisible}
        transition={{
          duration: PARTNER_FADE_UP_DURATION,
          ease: partnerEaseOut,
          delay,
        }}
      >
        {children}
      </motion.div>
    </PrototypeComponent>
  );
}

type PartnerMotionSpringPopProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function PartnerMotionSpringPop({
  children,
  className,
  delay = 0,
}: PartnerMotionSpringPopProps) {
  return (
    <PrototypeComponent id="partner-page-motion.partner-motion-spring-pop" className={className}>
      <motion.div
        initial={{ opacity: 0, transform: "translateY(14px) scale(0.92)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{
          ...partnerPopSpring,
          delay,
        }}
      >
        {children}
      </motion.div>
    </PrototypeComponent>
  );
}

type PartnerMotionSpringButtonProps = Pick<
  HTMLMotionProps<"button">,
  "type" | "className" | "onClick" | "children" | "whileHover"
> & {
  delay?: number;
  /** When false, skip the extra beat used for trailing CTAs (e.g. Back enters first). */
  withCtaBeat?: boolean;
};

export function PartnerMotionSpringButton({
  children,
  className,
  delay = 0,
  withCtaBeat = true,
  ...props
}: PartnerMotionSpringButtonProps) {
  return (
    <PrototypeComponent id="partner-page-motion.partner-motion-spring-button">
      <motion.button
        {...props}
        className={className}
        initial={{ opacity: 0, transform: "translateY(12px) scale(0.88)" }}
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{
          ...partnerCtaSpring,
          delay: delay + (withCtaBeat ? PARTNER_CTA_ENTRANCE_DELAY_EXTRA : 0),
        }}
      >
        {children}
      </motion.button>
    </PrototypeComponent>
  );
}

export function partnerStaggerDelay(base: number, index: number, step = 0.06) {
  return base + index * step;
}

/** Customize page: back → panel → save → shape. */
export const PARTNER_CUSTOMIZE_ENTRANCE_BASE = 0;

/** Choreography estimate — next beat starts before the prior spring fully settles. */
export const PARTNER_CUSTOMIZE_CTA_SPRING_DURATION = 0.3;

/** Brief beat after the panel lands before save enters. */
export const PARTNER_CUSTOMIZE_SAVE_AFTER_PANEL_EXTRA = 0.04;

/** Brief beat after save lands before the canvas shape appears. */
export const PARTNER_SHAPE_REVEAL_DELAY_EXTRA = 0.14;

export const PARTNER_CUSTOMIZE_ENTRANCE_STEP = 0.06;

export const PARTNER_CUSTOMIZE_ENTRANCE_INDEX = {
  back: 0,
  panel: 1,
  save: 2,
} as const;

export function partnerCustomizeEntranceDelay(index: number) {
  return (
    PARTNER_CUSTOMIZE_ENTRANCE_BASE + index * PARTNER_CUSTOMIZE_ENTRANCE_STEP
  );
}

/** Choreography estimate for panel motion — tuned for overlap, not full settle. */
export function partnerCustomizePanelEntranceDuration(
  panelVariant: MobilePanelMotionVariant = "slide-up",
): number {
  switch (panelVariant) {
    case "spring-sheet":
    case "spring-sheet-whole-panel":
      return 0.48;
    case "stagger-inside":
      return 0.58;
    case "blur-fade":
      return 0.46;
    case "scale-reveal":
      return 0.4;
    case "curtain-expand":
      return 0.44;
    case "slide-up":
    case "none":
    default:
      return 0.42;
  }
}

/** Panel enters after the back button lands. */
export function partnerCustomizePanelDelay() {
  return (
    partnerCustomizeEntranceDelay(PARTNER_CUSTOMIZE_ENTRANCE_INDEX.back) +
    PARTNER_CUSTOMIZE_CTA_SPRING_DURATION
  );
}

export function partnerCustomizeShapeDelay(shapeIndex: number) {
  return partnerCustomizeEntranceDelay(1 + shapeIndex * 2);
}

export function partnerCustomizeColorDelay(colorIndex: number) {
  return partnerCustomizeEntranceDelay(2 + colorIndex * 2);
}

export function partnerCustomizeTextureDelay(textureIndex: number) {
  return partnerCustomizeEntranceDelay(3 + textureIndex * 2);
}

/** Save enters after the bottom panel lands. */
export function partnerCustomizeSaveDelay(
  panelVariant: MobilePanelMotionVariant = "slide-up",
) {
  return (
    partnerCustomizePanelDelay() +
    partnerCustomizePanelEntranceDuration(panelVariant) +
    PARTNER_CUSTOMIZE_SAVE_AFTER_PANEL_EXTRA
  );
}

export function partnerCustomizeEntranceCompleteMs(
  panelVariant: MobilePanelMotionVariant = "slide-up",
) {
  const saveDelay = partnerCustomizeSaveDelay(panelVariant);
  return Math.round(
    (saveDelay +
      PARTNER_CUSTOMIZE_CTA_SPRING_DURATION +
      PARTNER_SHAPE_REVEAL_DELAY_EXTRA) *
      1000,
  );
}

/** Follow-up page: title → body → CTA → shapes — equal beat between each step. */
export function inviteFollowUpTitleDelay() {
  return PARTNER_CUSTOMIZE_ENTRANCE_BASE;
}

export function inviteFollowUpBodyDelay() {
  return inviteFollowUpTitleDelay() + PARTNER_CUSTOMIZE_CTA_SPRING_DURATION;
}

export function inviteFollowUpCtaDelay() {
  return inviteFollowUpBodyDelay() + PARTNER_CUSTOMIZE_CTA_SPRING_DURATION;
}

export function inviteFollowUpShapeEntranceDelayS() {
  return (
    inviteFollowUpCtaDelay() +
    PARTNER_CUSTOMIZE_CTA_SPRING_DURATION +
    PARTNER_SHAPE_REVEAL_DELAY_EXTRA
  );
}

export function inviteFollowUpShapeEntranceCompleteMs() {
  return Math.round(inviteFollowUpShapeEntranceDelayS() * 1000);
}

export function useCustomizeShapeEntranceReady(
  defer: boolean,
  entranceKey: string | number,
  panelVariant: MobilePanelMotionVariant = "slide-up",
) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(!defer || !!reduceMotion);

  useEffect(() => {
    if (!defer || reduceMotion) {
      setReady(true);
      return;
    }

    setReady(false);
    const timer = window.setTimeout(
      () => setReady(true),
      partnerCustomizeEntranceCompleteMs(panelVariant),
    );
    return () => window.clearTimeout(timer);
  }, [defer, entranceKey, panelVariant, reduceMotion]);

  return ready;
}

export function useInviteFollowUpShapeEntranceReady(
  defer: boolean,
  entranceKey: string | number,
) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(!defer || !!reduceMotion);

  useEffect(() => {
    if (!defer || reduceMotion) {
      setReady(true);
      return;
    }

    setReady(false);
    const timer = window.setTimeout(
      () => setReady(true),
      inviteFollowUpShapeEntranceCompleteMs(),
    );
    return () => window.clearTimeout(timer);
  }, [defer, entranceKey, reduceMotion]);

  return ready;
}
