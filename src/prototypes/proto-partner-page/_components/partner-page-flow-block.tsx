"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

import { inviteCtaButtonClass, inviteCtaSectionClass, inviteCtaShellClass } from "./invite-layout-classes";
import type { MobilePanelMotionVariant } from "./mobile-panel-motion-content";
import {
  PARTNER_CUSTOMIZE_ENTRANCE_INDEX,
  PartnerMotionSpringButton,
  partnerCustomizeEntranceDelay,
  partnerCustomizeSaveDelay,
  usePartnerEntranceMotion,
} from "./partner-page-motion";
import type { ProtoShapeSelection } from "./proto-shape-customizer-block";
import type { SubmitModalVariant } from "./submit-modal-content";
import { SubmitShapeModal } from "./submit-shape-modal";

const submitButtonClassName = cn(
  inviteCtaButtonClass,
  "shrink-0 px-3.5 py-2 text-[0.8125rem] md:text-[0.8125rem]",
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
        Submit shape
      </PartnerMotionSpringButton>
    );
  }

  return (
    <button type="button" onClick={onClick} className={submitButtonClassName}>
      Submit shape
    </button>
  );
}

export type PartnerPageId = "invite" | "customize";

type PartnerPageFlowBlockProps = {
  activePage: PartnerPageId;
  onPageChange: (page: PartnerPageId) => void;
  className?: string;
  animateEntrance?: boolean;
  entranceKey?: string | number;
  panelMotionVariant?: MobilePanelMotionVariant;
  shapeSelection?: ProtoShapeSelection;
  submitModalVariant?: SubmitModalVariant;
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
}: PartnerPageFlowBlockProps) {
  const motionOn = usePartnerEntranceMotion(animateEntrance);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  if (activePage === "invite") {
    return (
      <PrototypeComponent
        id="partner-page-flow-block"
        className={cn(
          inviteCtaSectionClass,
          "font-[family-name:var(--font-dm-sans)]!",
          className,
        )}
      >
        <div className={inviteCtaShellClass}>
          <button
            type="button"
            onClick={() => onPageChange("customize")}
            className={inviteCtaButtonClass}
          >
            <span>Customize your Proto Shape</span>
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
          {motionOn ? (
            <PartnerMotionSpringButton
              type="button"
              withCtaBeat={false}
              delay={partnerCustomizeEntranceDelay(
                PARTNER_CUSTOMIZE_ENTRANCE_INDEX.back,
              )}
              key={entranceKey}
              onClick={() => onPageChange("invite")}
              className="group text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors"
            >
              <ArrowLeft
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1"
                aria-hidden
              />
              <span>Back</span>
            </PartnerMotionSpringButton>
          ) : (
            <button
              type="button"
              onClick={() => onPageChange("invite")}
              className="group text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors"
            >
              <ArrowLeft
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1"
                aria-hidden
              />
              <span>Back</span>
            </button>
          )}
          <SubmitShapeButton
            motionOn={motionOn}
            delay={partnerCustomizeSaveDelay(panelMotionVariant)}
            entranceKey={entranceKey}
            onClick={() => setSubmitModalOpen(true)}
          />
        </div>
      </PrototypeComponent>
      {shapeSelection ? (
        <SubmitShapeModal
          open={submitModalOpen}
          onOpenChange={setSubmitModalOpen}
          selection={shapeSelection}
          variant={submitModalVariant}
          onKeepEditing={() => setSubmitModalOpen(false)}
          onSeeOnHomepage={() => {
            setSubmitModalOpen(false);
            onPageChange("invite");
          }}
        />
      ) : null}
    </>
  );
}
