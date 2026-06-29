"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export const partnerEaseOut = [0.22, 1, 0.36, 1] as const;

export const partnerFadeUpHidden = { opacity: 0, y: 18 };
export const partnerFadeUpVisible = { opacity: 1, y: 0 };

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
    <motion.div
      className={className}
      initial={partnerFadeUpHidden}
      animate={partnerFadeUpVisible}
      transition={{
        duration: 0.55,
        ease: partnerEaseOut,
        delay,
      }}
    >
      {children}
    </motion.div>
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
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        ...partnerPopSpring,
        delay,
      }}
    >
      {children}
    </motion.div>
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
    <motion.button
      {...props}
      className={className}
      initial={{ opacity: 0, scale: 0.88, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        ...partnerCtaSpring,
        delay: delay + (withCtaBeat ? PARTNER_CTA_ENTRANCE_DELAY_EXTRA : 0),
      }}
    >
      {children}
    </motion.button>
  );
}

export function partnerStaggerDelay(base: number, index: number, step = 0.06) {
  return base + index * step;
}

/** Customize page: back → shape₁ color₁ … shape₅ color₅ → save. */
export const PARTNER_CUSTOMIZE_ENTRANCE_BASE = 0.05;
export const PARTNER_CUSTOMIZE_ENTRANCE_STEP = 0.06;

export const PARTNER_CUSTOMIZE_ENTRANCE_INDEX = {
  back: 0,
  save: 11,
} as const;

export function partnerCustomizeEntranceDelay(index: number) {
  return (
    PARTNER_CUSTOMIZE_ENTRANCE_BASE + index * PARTNER_CUSTOMIZE_ENTRANCE_STEP
  );
}

export function partnerCustomizeShapeDelay(shapeIndex: number) {
  return partnerCustomizeEntranceDelay(1 + shapeIndex * 2);
}

export function partnerCustomizeColorDelay(colorIndex: number) {
  return partnerCustomizeEntranceDelay(2 + colorIndex * 2);
}

/** Extra pause after the save CTA lands before the canvas shape appears. */
export const PARTNER_SHAPE_REVEAL_DELAY_EXTRA = 0.35;

/** Ms to wait before revealing the canvas after the save CTA lands. */
export function partnerCustomizeEntranceCompleteMs() {
  const saveDelay =
    partnerCustomizeEntranceDelay(PARTNER_CUSTOMIZE_ENTRANCE_INDEX.save) +
    PARTNER_CTA_ENTRANCE_DELAY_EXTRA;
  return Math.round(
    (saveDelay + 0.55 + PARTNER_SHAPE_REVEAL_DELAY_EXTRA) * 1000,
  );
}

export function useCustomizeShapeEntranceReady(
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
      partnerCustomizeEntranceCompleteMs(),
    );
    return () => window.clearTimeout(timer);
  }, [defer, entranceKey, reduceMotion]);

  return ready;
}
