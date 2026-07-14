"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { PartnerMotionSpringButton } from "./partner-page-motion";

const partnerPageNavIconClass = "size-5 shrink-0 md:size-4";

export const partnerPageNavButtonClass =
  "pointer-events-auto group text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors md:size-8";

type PartnerPageNavButtonProps = {
  id: "partner-page-flow-block.partner-page-back-button";
  onClick: () => void;
  ariaLabel: string;
  icon: ReactNode;
  motionOn?: boolean;
  motionDelay?: number;
  motionEntranceKey?: string | number;
  className?: string;
};

function PartnerPageNavButton({
  id,
  onClick,
  ariaLabel,
  icon,
  motionOn = false,
  motionDelay = 0,
  motionEntranceKey = "nav",
  className,
}: PartnerPageNavButtonProps) {
  if (motionOn) {
    return (
      <PrototypeComponent id={id}>
        <PartnerMotionSpringButton
          type="button"
          withCtaBeat={false}
          delay={motionDelay}
          key={motionEntranceKey}
          onClick={onClick}
          aria-label={ariaLabel}
          className={cn(partnerPageNavButtonClass, className)}
        >
          {icon}
        </PartnerMotionSpringButton>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent id={id}>
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(partnerPageNavButtonClass, className)}
      >
        {icon}
      </button>
    </PrototypeComponent>
  );
}

type PartnerPageBackButtonProps = {
  onClick: () => void;
  motionOn?: boolean;
  motionDelay?: number;
  motionEntranceKey?: string | number;
  className?: string;
};

export function PartnerPageBackButton({
  onClick,
  motionOn = false,
  motionDelay = 0,
  motionEntranceKey = "back",
  className,
}: PartnerPageBackButtonProps) {
  return (
    <PartnerPageNavButton
      id="partner-page-flow-block.partner-page-back-button"
      onClick={onClick}
      ariaLabel="Back"
      motionOn={motionOn}
      motionDelay={motionDelay}
      motionEntranceKey={motionEntranceKey}
      className={className}
      icon={<ArrowLeft className={partnerPageNavIconClass} aria-hidden />}
    />
  );
}
