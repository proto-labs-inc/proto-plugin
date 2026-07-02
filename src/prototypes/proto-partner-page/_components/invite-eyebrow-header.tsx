"use client";

import { cn } from "@prototype/lib/utils";
import { motion, type HTMLMotionProps } from "motion/react";

import {
  inviteEyebrowClass,
  inviteHeaderRowClass,
} from "./invite-layout-classes";

type InviteEyebrowHeaderProps = {
  className?: string;
  hideLabel?: boolean;
};

export function InviteEyebrowHeader({
  className,
  hideLabel,
}: InviteEyebrowHeaderProps) {
  if (hideLabel) {
    return null;
  }

  return (
    <div className={cn(inviteHeaderRowClass, className)}>
      <p className={cn(inviteEyebrowClass, "mb-0")}>Design partner invite</p>
    </div>
  );
}

export function AnimatedInviteEyebrowHeader({
  className,
  hideLabel,
  ...motionProps
}: InviteEyebrowHeaderProps & HTMLMotionProps<"div">) {
  if (hideLabel) {
    return null;
  }

  return (
    <motion.div className={cn(inviteHeaderRowClass, className)} {...motionProps}>
      <p className={cn(inviteEyebrowClass, "mb-0")}>Design partner invite</p>
    </motion.div>
  );
}
