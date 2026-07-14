"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
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
  return (
    <PrototypeComponent id="invite-eyebrow-header">
      {hideLabel ? null : (
        <div className={cn(inviteHeaderRowClass, className)}>
          <p className={cn(inviteEyebrowClass, "mb-0")}>Design partner invite</p>
        </div>
      )}
    </PrototypeComponent>
  );
}

export function AnimatedInviteEyebrowHeader({
  className,
  hideLabel,
  ...motionProps
}: InviteEyebrowHeaderProps & HTMLMotionProps<"div">) {
  return (
    <PrototypeComponent id="invite-eyebrow-header.animated-invite-eyebrow-header">
      {hideLabel ? null : (
        <motion.div className={cn(inviteHeaderRowClass, className)} {...motionProps}>
          <p className={cn(inviteEyebrowClass, "mb-0")}>Design partner invite</p>
        </motion.div>
      )}
    </PrototypeComponent>
  );
}
