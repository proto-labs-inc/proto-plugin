"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const bookingEase = [0.22, 1, 0.36, 1] as const;

export function useBookingMotion() {
  const reduceMotion = useReducedMotion();
  return !reduceMotion;
}

type BookingFadeProps = {
  children: ReactNode;
  className?: string;
  key?: string;
};

export const BOOKING_PAGE_SHELL_CLASS =
  "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden";

export const BookingViewTransition = ({
  children,
  className,
  key,
}: BookingFadeProps) => {
  const motionEnabled = useBookingMotion();

  if (!motionEnabled) {
    return (
      <div className={cn(BOOKING_PAGE_SHELL_CLASS, className)}>{children}</div>
    );
  }

  return (
    <motion.div
      key={key}
      className={cn(BOOKING_PAGE_SHELL_CLASS, className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: bookingEase }}
    >
      {children}
    </motion.div>
  );
};

export const BookingColumnTransition = ({
  children,
  className,
  key,
}: BookingFadeProps) => {
  const motionEnabled = useBookingMotion();

  if (!motionEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={key}
      className={className}
      initial={{ opacity: 0, transform: "translateY(8px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      exit={{ opacity: 0, transform: "translateY(-8px)" }}
      transition={{ duration: 0.22, ease: bookingEase }}
    >
      {children}
    </motion.div>
  );
};

type BookingModalBackdropProps = {
  children: ReactNode;
  onClose?: () => void;
};

export const BookingModalBackdrop = ({
  children,
  onClose,
}: BookingModalBackdropProps) => {
  const motionEnabled = useBookingMotion();

  return (
    <PrototypeComponent
      id="booking-confirm-modal"
      className="absolute inset-0 z-40 flex items-center justify-center"
    >
      <motion.button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#101010]/40 backdrop-blur-[2px]"
        onClick={onClose}
        initial={motionEnabled ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: bookingEase }}
      />
      <motion.div
        className="relative z-10 w-full max-w-[520px] px-4"
        initial={
          motionEnabled
            ? { opacity: 0, transform: "translateY(12px) scale(0.98)" }
            : false
        }
        animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{ duration: 0.28, ease: bookingEase }}
      >
        {children}
      </motion.div>
    </PrototypeComponent>
  );
};

export const BookingPageTransition = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const motionEnabled = useBookingMotion();

  return (
    <motion.div
      className={cn(BOOKING_PAGE_SHELL_CLASS, className)}
      initial={motionEnabled ? { opacity: 0, transform: "translateY(12px)" } : false}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      exit={motionEnabled ? { opacity: 0, transform: "translateY(-8px)" } : undefined}
      transition={{ duration: 0.28, ease: bookingEase }}
    >
      {children}
    </motion.div>
  );
};
