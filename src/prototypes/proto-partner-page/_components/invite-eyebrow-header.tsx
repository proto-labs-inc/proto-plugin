"use client";

import { cn } from "@prototype/lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

import {
  inviteEyebrowClass,
  inviteHeaderRowClass,
} from "./invite-layout-classes";
import { PartnerPageHomeButton } from "./partner-page-nav-button";

type InviteEyebrowHeaderProps = {
  onHome?: () => void;
  className?: string;
  hideLabel?: boolean;
};

export function InviteEyebrowHeader({
  onHome,
  className,
  hideLabel,
}: InviteEyebrowHeaderProps) {
  if (hideLabel && !onHome) {
    return null;
  }

  return (
    <div className={cn(inviteHeaderRowClass, className)}>
      {!hideLabel ? (
        <p className={cn(inviteEyebrowClass, "mb-0", onHome && "pr-10")}>
          Design partner invite
        </p>
      ) : null}
      {onHome ? (
        <div className="absolute top-0 right-0 -mr-2.5">
          <PartnerPageHomeButton onClick={onHome} />
        </div>
      ) : null}
    </div>
  );
}

export function AnimatedInviteEyebrowHeader({
  onHome,
  className,
  hideLabel,
  ...motionProps
}: InviteEyebrowHeaderProps & HTMLMotionProps<"div">) {
  if (hideLabel && !onHome) {
    return null;
  }

  return (
    <motion.div className={cn(inviteHeaderRowClass, className)} {...motionProps}>
      {!hideLabel ? (
        <p className={cn(inviteEyebrowClass, "mb-0", onHome && "pr-10")}>
          Design partner invite
        </p>
      ) : null}
      {onHome ? (
        <div className="absolute top-0 right-0 -mr-2.5">
          <PartnerPageHomeButton onClick={onHome} />
        </div>
      ) : null}
    </motion.div>
  );
}
