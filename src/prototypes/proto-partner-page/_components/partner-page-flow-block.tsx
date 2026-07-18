"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { INVITE_COPY } from "./invite-copy-content";
import { inviteCtaButtonClass, inviteBlockClassName, inviteCtaSectionClass, inviteCtaShellClass } from "./invite-layout-classes";
import type { MobilePanelMotionVariant } from "./mobile-panel-motion-content";
import { PartnerPageBackButton } from "./partner-page-nav-button";
import {
  PARTNER_CUSTOMIZE_ENTRANCE_INDEX,
  PartnerMotionSpringButton,
  partnerCustomizeEntranceDelay,
  partnerCustomizeSaveDelay,
  usePartnerEntranceMotion,
} from "./partner-page-motion";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import type { SubmitModalVariant } from "./submit-modal-content";
import { saveSubmittedProtoShape } from "./submitted-proto-shapes";
import { SubmitShapeModal } from "./submit-shape-modal";

const submitButtonClassName = cn(
  inviteCtaButtonClass,
  "shrink-0 px-4 py-2.5 text-[0.875rem] md:px-3.5 md:py-2 md:text-[0.8125rem]",
);

function SubmitShapeButton({
  motionOn,
  delay,
  entranceKey,
  onClick,
}: {
  motionOn: boolean;
  delay: number;
  entranceKey: string | number;
  onClick: () => void;
}) {
  if (motionOn) {
    return (
      <PartnerMotionSpringButton
        type="button"
        delay={delay}
        withCtaBeat={false}
        key={entranceKey}
        onClick={onClick}
        className={submitButtonClassName}
      >
        Preview shape
      </PartnerMotionSpringButton>
    );
  }

  return (
    <button type="button" onClick={onClick} className={submitButtonClassName}>
      Preview shape
    </button>
  );
}

export type PartnerPageId = "invite" | "invite-follow-up" | "customize";

type PartnerPageFlowBlockProps = {
  activePage: PartnerPageId;
  onPageChange: (page: PartnerPageId) => void;
  className?: string;
  animateEntrance?: boolean;
  entranceKey?: string | number;
  panelMotionVariant?: MobilePanelMotionVariant;
  shapeSelection?: ProtoShapeSelection;
  submitModalVariant?: SubmitModalVariant;
  onSubmitModalOpenChange?: (open: boolean) => void;
  dragAttributionLabel?: string;
};

export function PartnerPageFlowBlock({
  activePage,
  onPageChange,
  className,
  animateEntrance = false,
  entranceKey = "customize",
  panelMotionVariant = "slide-up",
  shapeSelection,
  submitModalVariant = "plain-header",
  onSubmitModalOpenChange,
  dragAttributionLabel,
}: PartnerPageFlowBlockProps) {
  const motionOn = usePartnerEntranceMotion(animateEntrance);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const handleSubmitModalOpenChange = (open: boolean) => {
    setSubmitModalOpen(open);
    onSubmitModalOpenChange?.(open);
  };
  if (activePage === "invite" || activePage === "invite-follow-up") {
    const isFollowUp = activePage === "invite-follow-up";
    return (
      <PrototypeComponent
        id="partner-page-flow-block"
        className={cn(
          inviteBlockClassName,
          inviteCtaSectionClass,
          "font-[family-name:var(--font-dm-sans)]!",
          className,
        )}
      >
        <div className={inviteCtaShellClass}>
          <button
            type="button"
            onClick={() =>
              onPageChange(isFollowUp ? "customize" : "invite-follow-up")
            }
            className={inviteCtaButtonClass}
          >
            <span>{isFollowUp ? INVITE_COPY.cta : INVITE_COPY.continueCta}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        </div>
      </PrototypeComponent>
    );
  }

  return (
    <>
      <PrototypeComponent
        id="partner-page-flow-block"
        className={cn(
          "pointer-events-auto relative z-30 shrink-0 px-4 pt-3 pb-1 font-[family-name:var(--font-dm-sans)]! sm:px-5",
          className,
        )}
      >
        <div className="mx-auto flex w-full max-w-md items-center justify-between md:max-w-none">
          <div className="flex items-center gap-0.5">
            <PartnerPageBackButton
              onClick={() => onPageChange("invite-follow-up")}
              motionOn={motionOn}
              motionDelay={partnerCustomizeEntranceDelay(
                PARTNER_CUSTOMIZE_ENTRANCE_INDEX.back,
              )}
              motionEntranceKey={entranceKey}
            />
          </div>
          <SubmitShapeButton
            motionOn={motionOn}
            delay={partnerCustomizeSaveDelay(panelMotionVariant)}
            entranceKey={entranceKey}
            onClick={() => handleSubmitModalOpenChange(true)}
          />
        </div>
      </PrototypeComponent>
      {shapeSelection ? (
        <SubmitShapeModal
          open={submitModalOpen}
          onOpenChange={handleSubmitModalOpenChange}
          selection={shapeSelection}
          variant={submitModalVariant}
          onKeepEditing={() => handleSubmitModalOpenChange(false)}
          onSeeOnHomepage={() => {
            saveSubmittedProtoShape(shapeSelection);
            handleSubmitModalOpenChange(false);
          }}
          dragAttributionLabel={dragAttributionLabel}
        />
      ) : null}
    </>
  );
}
