"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

import {
  partnerEaseOut,
  partnerFadeUpHidden,
  partnerFadeUpVisible,
  partnerPopSpring,
  PARTNER_FADE_UP_DURATION,
} from "./partner-page-motion";
import type { MobilePanelMotionVariant } from "./mobile-panel-motion-content";

const PanelMotionEntranceContext = createContext(true);

/** False while the bottom panel entrance animation is running. */
export function usePanelMotionEntranceComplete(): boolean {
  return useContext(PanelMotionEntranceContext);
}

type ShellPhase = "pending" | "static" | "animate";

type MobilePanelMotionShellProps = {
  variant: MobilePanelMotionVariant;
  replayKey?: string | number;
  children: ReactNode;
  className?: string;
  /** When true, animate even outside the mobile device frame (design brief previews). */
  forceMotion?: boolean;
  /** Delay before the panel slide begins (customize-page choreography). */
  entranceDelay?: number;
};

function resolveShellPhase(
  variant: MobilePanelMotionVariant,
  reduceMotion: boolean | null,
): ShellPhase {
  if (variant === "none" || reduceMotion) return "static";
  return "animate";
}

function usePanelMotionShellState(
  variant: MobilePanelMotionVariant,
  replayKey: string | number,
) {
  const reduceMotion = useReducedMotion();
  const motionKey = `${variant}-${replayKey}`;
  const [phase, setPhase] = useState<ShellPhase>("pending");
  const motionEnabled = phase === "animate";

  useLayoutEffect(() => {
    setPhase(resolveShellPhase(variant, reduceMotion));
  }, [variant, reduceMotion, motionKey]);

  const [entranceComplete, setEntranceComplete] = useState(true);

  useEffect(() => {
    if (!motionEnabled) {
      setEntranceComplete(true);
      return;
    }

    setEntranceComplete(false);
  }, [motionKey, motionEnabled]);

  const handleAnimationComplete = () => {
    if (motionEnabled) {
      setEntranceComplete(true);
    }
  };

  return {
    phase,
    motionEnabled,
    motionKey,
    entranceComplete,
    handleAnimationComplete,
  };
}

function StaticPanelMotionShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <PrototypeComponent id="mobile-panel-motion-shell" className={className}>
      <PanelMotionEntranceContext.Provider value={true}>
        {children}
      </PanelMotionEntranceContext.Provider>
    </PrototypeComponent>
  );
}

function PendingPanelMotionShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <PrototypeComponent
      id="mobile-panel-motion-shell"
      className={cn(className, "overflow-hidden")}
    >
      <div className="w-full translate-y-full" aria-hidden>
        {children}
      </div>
    </PrototypeComponent>
  );
}

export function MobilePanelMotionShell({
  variant,
  replayKey = "panel",
  children,
  className,
  forceMotion = false,
  entranceDelay = 0,
}: MobilePanelMotionShellProps) {
  const {
    phase,
    motionEnabled,
    motionKey,
    entranceComplete,
    handleAnimationComplete,
  } = usePanelMotionShellState(variant, replayKey);

  if (phase === "pending") {
    return (
      <PendingPanelMotionShell className={className}>
        {children}
      </PendingPanelMotionShell>
    );
  }

  if (!motionEnabled) {
    return (
      <StaticPanelMotionShell className={className}>
        {children}
      </StaticPanelMotionShell>
    );
  }

  // Transforms use full `transform` strings (not the `y` shorthand) so Motion
  // runs them via the compositor (WAAPI). Mobile browsers throttle rAF (e.g.
  // iOS Low Power Mode), which desyncs shorthand-driven, delayed entrances and
  // scrambles their timing; WAAPI transforms stay correctly sequenced.
  const motionProps = {
    key: motionKey,
    className,
    layoutRoot: true as const,
    initial: { transform: "translateY(100%)" },
    animate: { transform: "translateY(0px)" },
    onAnimationComplete: handleAnimationComplete,
  };

  if (variant === "slide-up") {
    return (
      <PrototypeComponent id="mobile-panel-motion-shell">
        <PanelMotionEntranceContext.Provider value={entranceComplete}>
          <motion.div
            {...motionProps}
            transition={{
              duration: 0.55,
              ease: partnerEaseOut,
              delay: entranceDelay,
            }}
          >
            {children}
          </motion.div>
        </PanelMotionEntranceContext.Provider>
      </PrototypeComponent>
    );
  }

  if (variant === "spring-sheet" || variant === "spring-sheet-whole-panel") {
    return (
      <PrototypeComponent id="mobile-panel-motion-shell">
        <PanelMotionEntranceContext.Provider value={entranceComplete}>
          <motion.div
            {...motionProps}
            transition={{
              ...partnerPopSpring,
              stiffness: 380,
              damping: 28,
              delay: entranceDelay,
            }}
          >
            {children}
          </motion.div>
        </PanelMotionEntranceContext.Provider>
      </PrototypeComponent>
    );
  }

  if (variant === "stagger-inside") {
    return (
      <PrototypeComponent id="mobile-panel-motion-shell">
        <PanelMotionEntranceContext.Provider value={entranceComplete}>
          <motion.div
            {...motionProps}
            transition={{
              duration: 0.38,
              ease: partnerEaseOut,
              delay: entranceDelay,
            }}
          >
            <motion.div
              initial={partnerFadeUpHidden}
              animate={partnerFadeUpVisible}
              transition={{
                duration: PARTNER_FADE_UP_DURATION,
                ease: partnerEaseOut,
                delay: 0.28,
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        </PanelMotionEntranceContext.Provider>
      </PrototypeComponent>
    );
  }

  if (variant === "blur-fade") {
    return (
      <PrototypeComponent id="mobile-panel-motion-shell">
        <PanelMotionEntranceContext.Provider value={entranceComplete}>
          <motion.div
            {...motionProps}
            initial={{ opacity: 0, transform: "translateY(28px)", filter: "blur(10px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" }}
            transition={{
              duration: 0.6,
              ease: partnerEaseOut,
              delay: entranceDelay,
            }}
          >
            {children}
          </motion.div>
        </PanelMotionEntranceContext.Provider>
      </PrototypeComponent>
    );
  }

  if (variant === "scale-reveal") {
    return (
      <PrototypeComponent id="mobile-panel-motion-shell">
        <PanelMotionEntranceContext.Provider value={entranceComplete}>
          <motion.div
            {...motionProps}
            className={cn(className, "origin-bottom")}
            initial={{ opacity: 0, transform: "translateY(24px) scale(0.94)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{
              duration: 0.52,
              ease: partnerEaseOut,
              delay: entranceDelay,
            }}
          >
            {children}
          </motion.div>
        </PanelMotionEntranceContext.Provider>
      </PrototypeComponent>
    );
  }

  if (variant === "curtain-expand") {
    return (
      <PrototypeComponent id="mobile-panel-motion-shell">
        <PanelMotionEntranceContext.Provider value={entranceComplete}>
          <motion.div
            {...motionProps}
            className={cn(className, "overflow-hidden")}
            initial={{ clipPath: "inset(100% 0 0 0 round 0px)" }}
            animate={{ clipPath: "inset(0% 0 0 0 round 0px)" }}
            transition={{
              duration: 0.58,
              ease: partnerEaseOut,
              delay: entranceDelay,
            }}
          >
            {children}
          </motion.div>
        </PanelMotionEntranceContext.Provider>
      </PrototypeComponent>
    );
  }

  return (
    <StaticPanelMotionShell className={className}>
      {children}
    </StaticPanelMotionShell>
  );
}
