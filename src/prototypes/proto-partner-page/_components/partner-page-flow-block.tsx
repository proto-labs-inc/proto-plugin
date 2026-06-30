"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { inviteCtaButtonClass, inviteCtaSectionClass, inviteCtaShellClass } from "./invite-layout-classes";
import {
  PARTNER_CUSTOMIZE_ENTRANCE_INDEX,
  PartnerMotionSpringButton,
  partnerCustomizeEntranceDelay,
  partnerEaseOut,
  usePartnerEntranceMotion,
} from "./partner-page-motion";

const saveButtonClassName =
  "border border-border bg-muted/40 text-muted-foreground hover:border-foreground/30 hover:bg-foreground/[0.08] inline-flex shrink-0 cursor-pointer items-center rounded-lg px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors";

/** How long "Saved!" stays visible before fading back. */
const SAVE_LABEL_REVERT_MS = 3_000;

function SaveShapeButton({
  motionOn,
  delay,
  entranceKey,
}: {
  motionOn: boolean;
  delay: number;
  entranceKey: string | number;
}) {
  const reduceMotion = useReducedMotion();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (saved) return;
    setSaved(true);
  };

  useEffect(() => {
    if (!saved) return;

    const timer = window.setTimeout(() => {
      setSaved(false);
    }, SAVE_LABEL_REVERT_MS);

    return () => window.clearTimeout(timer);
  }, [saved]);

  const label = (
    <span className="inline-grid">
      <span className="invisible col-start-1 row-start-1" aria-hidden>
        Save your shape
      </span>
      <span className="col-start-1 row-start-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={saved ? `${entranceKey}-saved` : `${entranceKey}-save`}
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: partnerEaseOut,
            }}
          >
            {saved ? "Saved!" : "Save your shape"}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );

  if (motionOn) {
    return (
      <PartnerMotionSpringButton
        type="button"
        delay={delay}
        key={entranceKey}
        onClick={handleSave}
        className={saveButtonClassName}
      >
        {label}
      </PartnerMotionSpringButton>
    );
  }

  return (
    <button type="button" onClick={handleSave} className={saveButtonClassName}>
      {label}
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
};

export function PartnerPageFlowBlock({
  activePage,
  onPageChange,
  className,
  animateEntrance = false,
  entranceKey = "customize",
}: PartnerPageFlowBlockProps) {
  const motionOn = usePartnerEntranceMotion(animateEntrance);
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
            className="group text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors"
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
            className="group text-muted-foreground hover:text-foreground hover:bg-foreground/5 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors"
          >
            <ArrowLeft
              className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-x-1"
              aria-hidden
            />
            <span>Back</span>
          </button>
        )}
        <SaveShapeButton
          motionOn={motionOn}
          delay={partnerCustomizeEntranceDelay(
            PARTNER_CUSTOMIZE_ENTRANCE_INDEX.save,
          )}
          entranceKey={entranceKey}
        />
      </div>
    </PrototypeComponent>
  );
}
