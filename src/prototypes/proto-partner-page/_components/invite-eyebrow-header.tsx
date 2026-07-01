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
};

export function InviteEyebrowHeader({
  onHome,
  className,
}: InviteEyebrowHeaderProps) {
  return (
    <div className={cn(inviteHeaderRowClass, className)}>
      <p className={cn(inviteEyebrowClass, "mb-0", onHome && "pr-10")}>
        Design partner invite
      </p>
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
  ...motionProps
}: InviteEyebrowHeaderProps & HTMLMotionProps<"div">) {
  return (
    <motion.div className={cn(inviteHeaderRowClass, className)} {...motionProps}>
      <p className={cn(inviteEyebrowClass, "mb-0", onHome && "pr-10")}>
        Design partner invite
      </p>
      {onHome ? (
        <div className="absolute top-0 right-0 -mr-2.5">
          <PartnerPageHomeButton onClick={onHome} />
        </div>
      ) : null}
    </motion.div>
  );
}
