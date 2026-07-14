"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, type ReactNode } from "react";

import type { InviteAnimationsVariant } from "./invite-animations-content";
import { INVITE_COPY, type InviteStep } from "./invite-copy-content";
import {
  InviteFollowUpBody,
  InviteFollowUpContent,
  InviteFollowUpTitle,
} from "./invite-copy-block";
import {
  inviteBlockClassName,
  inviteBodyClass,
  inviteBodyStackClass,
  inviteBodyStackTightClass,
  inviteContentShellClass,
  inviteCtaButtonClass,
  inviteCtaSectionClass,
  inviteCtaShellClass,
  inviteFollowUpStackClass,
  inviteHeadlineClass,
  inviteMotionPassThroughClass,
} from "./invite-layout-classes";
import {
  AnimatedInviteEyebrowHeader,
  InviteEyebrowHeader,
} from "./invite-eyebrow-header";
import {
  inviteFollowUpBodyDelay,
  inviteFollowUpCtaDelay,
  inviteFollowUpTitleDelay,
  PARTNER_FADE_UP_DURATION,
  partnerEaseOut,
  PartnerMotionSpringButton,
} from "./partner-page-motion";

type InviteAnimationsBlockProps = {
  variant: InviteAnimationsVariant;
  step?: InviteStep;
  onContinue?: () => void;
  className?: string;
  /** Remount animations when the design brief switches variants. */
  replayKey?: string;
  hideEyebrow?: boolean;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Extra beat after copy lands before the CTA enters. */
export const INVITE_CTA_ENTRANCE_DELAY_EXTRA = 0.15;

const CTA_ENTRANCE_DELAY_EXTRA = INVITE_CTA_ENTRANCE_DELAY_EXTRA;

/** One choreographic beat between follow-up example shape pops. */
export const INVITE_FOLLOW_UP_BEAT = 0.24;

/** @deprecated Use inviteFollowUpTitleDelay from partner-page-motion. */
export const INVITE_FOLLOW_UP_TITLE_DELAY = 0;

/** @deprecated Use inviteFollowUpTitleDelay from partner-page-motion. */
export const INVITE_FOLLOW_UP_TEXT_DELAY = INVITE_FOLLOW_UP_TITLE_DELAY;

function inviteFollowUpUsesSpringCta(variant: InviteAnimationsVariant) {
  return variant.endsWith("button-spring") || variant === "button-spring";
}

export {
  inviteFollowUpBodyDelay,
  inviteFollowUpCtaDelay,
  inviteFollowUpShapeEntranceCompleteMs,
  inviteFollowUpShapeEntranceDelayS,
  inviteFollowUpTitleDelay,
} from "./partner-page-motion";

// Transforms are written as full `transform` strings (not `x`/`y`/`scale`
// shorthands) so Motion animates them via the compositor (WAAPI) rather than
// the main-thread JS frameloop. Mobile browsers throttle rAF (e.g. iOS Low
// Power Mode), which desyncs shorthand-driven `delay`s and scrambles the
// staggered entrance order; WAAPI transforms stay correctly sequenced.
const fadeUpHidden = { opacity: 0, transform: "translateY(18px)" };
const fadeUpVisible = { opacity: 1, transform: "translateY(0px)" };

const [inviteBeforeProto, inviteAfterProto] = INVITE_COPY.invite.split("Proto");

function InviteWithBoldProto() {
  return (
    <>
      {inviteBeforeProto}
      <span className="font-bold">Proto</span>
      {inviteAfterProto}
    </>
  );
}

function StaticInviteContent({
  onContinue,
  className,
  hideEyebrow,
  step = "intro",
}: {
  onContinue?: () => void;
  className?: string;
  hideEyebrow?: boolean;
  step?: InviteStep;
}) {
  const ctaLabel =
    step === "follow-up" ? INVITE_COPY.cta : INVITE_COPY.continueCta;

  return (
    <PrototypeComponent
      id="invite-animations-block"
      className={cn(inviteBlockClassName, className)}
    >
      <div className={inviteContentShellClass}>
        {step === "intro" ? (
          <>
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
            <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
            <div className={inviteBodyStackClass}>
              <p className={inviteBodyClass}>
                <InviteWithBoldProto />
              </p>
            </div>
          </>
        ) : (
          <InviteFollowUpContent />
        )}
      </div>
      <div className={inviteCtaSectionClass}>
        <div className={inviteCtaShellClass}>
          <button
            type="button"
            onClick={onContinue}
            className={inviteCtaButtonClass}
          >
            <span>{ctaLabel}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </PrototypeComponent>
  );
}

type MotionItemProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  hidden?: Record<string, number | string>;
  visible?: Record<string, number | string>;
  transition?: Record<string, unknown>;
};

function MotionItem({
  children,
  className,
  delay = 0,
  hidden = fadeUpHidden,
  visible = fadeUpVisible,
  transition,
}: MotionItemProps) {
  return (
    <motion.div
      className={cn(inviteMotionPassThroughClass, className)}
      initial={hidden}
      animate={visible}
      transition={{
        duration: PARTNER_FADE_UP_DURATION,
        ease: partnerEaseOut,
        delay,
        ...transition,
      }}
    >
      {children}
    </motion.div>
  );
}

function SpringCtaSection({
  onContinue,
  delay = 0.48,
  label = INVITE_COPY.cta,
}: {
  onContinue?: () => void;
  delay?: number;
  label?: string;
}) {
  return (
    <div className={inviteCtaSectionClass}>
      <div className={inviteCtaShellClass}>
        <motion.button
          type="button"
          onClick={onContinue}
          className={inviteCtaButtonClass}
          initial={{ opacity: 0, transform: "translateY(12px) scale(0.88)" }}
          animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 22,
            delay: delay + CTA_ENTRANCE_DELAY_EXTRA,
          }}
        >
          <span>{label}</span>
          <ArrowRight
            className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
            aria-hidden
          />
        </motion.button>
      </div>
    </div>
  );
}

function AnimatedInviteFollowUp({
  variant,
  onContinue,
  className,
  replayKey,
}: InviteAnimationsBlockProps) {
  const reduceMotion = useReducedMotion();
  const mountKey = `${variant}-${replayKey ?? "live"}-follow-up`;

  if (reduceMotion || variant === "none") {
    return (
      <StaticInviteContent
        step="follow-up"
        onContinue={onContinue}
        className={className}
      />
    );
  }

  const usesSpringCta =
    variant.endsWith("button-spring") || variant === "button-spring";

  return (
    <PrototypeComponent
      id="invite-animations-block"
      className={cn(inviteBlockClassName, className)}
      key={mountKey}
    >
      <div className={inviteContentShellClass}>
        <div className={inviteFollowUpStackClass}>
          <MotionItem delay={inviteFollowUpTitleDelay()}>
            <InviteFollowUpTitle />
          </MotionItem>
          <MotionItem delay={inviteFollowUpBodyDelay()}>
            <InviteFollowUpBody />
          </MotionItem>
        </div>
      </div>
      {usesSpringCta ? (
        <div className={inviteCtaSectionClass}>
          <div className={inviteCtaShellClass}>
            <PartnerMotionSpringButton
              type="button"
              withCtaBeat={false}
              delay={inviteFollowUpCtaDelay()}
              onClick={onContinue}
              className={inviteCtaButtonClass}
            >
              <span>{INVITE_COPY.cta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </PartnerMotionSpringButton>
          </div>
        </div>
      ) : (
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, transform: "translateY(18px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{
            duration: PARTNER_FADE_UP_DURATION,
            ease: partnerEaseOut,
            delay: inviteFollowUpCtaDelay(),
          }}
        >
          <div className={inviteCtaShellClass}>
            <button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
            >
              <span>{INVITE_COPY.cta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
        </motion.div>
      )}
    </PrototypeComponent>
  );
}

function AnimatedInviteContent({
  variant,
  step = "intro",
  onContinue,
  className,
  replayKey,
  hideEyebrow,
}: InviteAnimationsBlockProps) {
  const reduceMotion = useReducedMotion();
  const mountKey = `${variant}-${replayKey ?? "live"}`;
  const headlineWords = useMemo(() => INVITE_COPY.headline.split(/\s+/), []);

  if (step === "follow-up") {
    return (
      <AnimatedInviteFollowUp
        variant={variant}
        onContinue={onContinue}
        className={className}
        replayKey={replayKey}
      />
    );
  }

  if (reduceMotion || variant === "none") {
    return (
      <StaticInviteContent
        onContinue={onContinue}
        className={className}
        hideEyebrow={hideEyebrow}
      />
    );
  }

  const bodyClass = inviteBodyClass;

  if (variant === "word-pop-button-spring") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem delay={0.05}>
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <h1
            className={cn(inviteHeadlineClass, "flex flex-wrap gap-x-[0.28em]")}
          >
            {headlineWords.map((word, index) => (
              <motion.span
                key={`${mountKey}-${word}-${index}`}
                className={inviteMotionPassThroughClass}
                initial={{
                  opacity: 0,
                  transform: "translateY(14px) scale(0.92)",
                }}
                animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 26,
                  delay: 0.12 + index * 0.07,
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <div className={inviteBodyStackClass}>
            <MotionItem delay={0.38}>
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <SpringCtaSection
          onContinue={onContinue}
          delay={0.82}
          label={INVITE_COPY.continueCta}
        />
      </PrototypeComponent>
    );
  }

  if (variant === "blur-in-button-spring") {
    const blurHidden = { opacity: 0, filter: "blur(10px)" };
    const blurVisible = { opacity: 1, filter: "blur(0px)" };

    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem
            delay={0.04}
            hidden={blurHidden}
            visible={blurVisible}
            transition={{ duration: 0.65 }}
          >
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <MotionItem
            delay={0.16}
            hidden={blurHidden}
            visible={blurVisible}
            transition={{ duration: 0.65 }}
          >
            <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          </MotionItem>
          <div className={inviteBodyStackClass}>
            <MotionItem
              delay={0.22}
              hidden={blurHidden}
              visible={blurVisible}
              transition={{ duration: 0.65 }}
            >
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <SpringCtaSection
          onContinue={onContinue}
          delay={0.56}
          label={INVITE_COPY.continueCta}
        />
      </PrototypeComponent>
    );
  }

  if (variant === "headline-first-button-spring") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <AnimatedInviteEyebrowHeader
            hideLabel={hideEyebrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          />
          <motion.h1
            className={inviteHeadlineClass}
            initial={{ opacity: 0, transform: "translateY(10px) scale(0.94)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
          >
            {INVITE_COPY.headline}
          </motion.h1>
          <motion.div
            className={cn(inviteBodyStackClass, inviteBodyStackTightClass)}
            initial={{ opacity: 0, transform: "translateY(12px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.26 }}
          >
            <p className={bodyClass}>
              <InviteWithBoldProto />
            </p>
          </motion.div>
        </div>
        <SpringCtaSection
          onContinue={onContinue}
          delay={0.62}
          label={INVITE_COPY.continueCta}
        />
      </PrototypeComponent>
    );
  }

  if (variant === "text-only-button-spring") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem delay={0.04}>
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <MotionItem delay={0.12}>
            <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          </MotionItem>
          <div className={inviteBodyStackClass}>
            <MotionItem delay={0.18}>
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <SpringCtaSection
          onContinue={onContinue}
          delay={0.42}
          label={INVITE_COPY.continueCta}
        />
      </PrototypeComponent>
    );
  }

  if (variant === "word-pop") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem delay={0.05}>
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <h1
            className={cn(inviteHeadlineClass, "flex flex-wrap gap-x-[0.28em]")}
          >
            {headlineWords.map((word, index) => (
              <motion.span
                key={`${mountKey}-${word}-${index}`}
                className={inviteMotionPassThroughClass}
                initial={{
                  opacity: 0,
                  transform: "translateY(14px) scale(0.92)",
                }}
                animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 26,
                  delay: 0.12 + index * 0.07,
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <div className={inviteBodyStackClass}>
            <MotionItem delay={0.38}>
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, transform: "translateY(20px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{
            duration: 0.5,
            ease: easeOut,
            delay: 0.82 + CTA_ENTRANCE_DELAY_EXTRA,
          }}
        >
          <div className={inviteCtaShellClass}>
            <button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
            >
              <span>{INVITE_COPY.continueCta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
        </motion.div>
      </PrototypeComponent>
    );
  }

  if (variant === "blur-in") {
    const blurHidden = { opacity: 0, filter: "blur(10px)" };
    const blurVisible = { opacity: 1, filter: "blur(0px)" };

    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem
            delay={0.04}
            hidden={blurHidden}
            visible={blurVisible}
            transition={{ duration: 0.65 }}
          >
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <MotionItem
            delay={0.16}
            hidden={blurHidden}
            visible={blurVisible}
            transition={{ duration: 0.65 }}
          >
            <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          </MotionItem>
          <div className={inviteBodyStackClass}>
            <MotionItem
              delay={0.22}
              hidden={blurHidden}
              visible={blurVisible}
              transition={{ duration: 0.65 }}
            >
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <MotionItem
          className={inviteCtaSectionClass}
          delay={0.56 + CTA_ENTRANCE_DELAY_EXTRA}
          hidden={blurHidden}
          visible={blurVisible}
          transition={{ duration: 0.65 }}
        >
          <div className={inviteCtaShellClass}>
            <button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
            >
              <span>{INVITE_COPY.continueCta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
        </MotionItem>
      </PrototypeComponent>
    );
  }

  if (variant === "button-spring") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem
            delay={0.04}
            hidden={{ opacity: 0 }}
            visible={{ opacity: 1 }}
          >
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <MotionItem
            delay={0.1}
            hidden={{ opacity: 0 }}
            visible={{ opacity: 1 }}
          >
            <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          </MotionItem>
          <div className={inviteBodyStackClass}>
            <MotionItem
              delay={0.14}
              hidden={{ opacity: 0 }}
              visible={{ opacity: 1 }}
            >
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <div className={inviteCtaSectionClass}>
          <div className={inviteCtaShellClass}>
            <motion.button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
              initial={{
                opacity: 0,
                transform: "translateY(12px) scale(0.88)",
              }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 22,
                delay: 0.48 + CTA_ENTRANCE_DELAY_EXTRA,
              }}
            >
              <span>{INVITE_COPY.continueCta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </motion.button>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "headline-first") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <AnimatedInviteEyebrowHeader
            hideLabel={hideEyebrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          />
          <motion.h1
            className={inviteHeadlineClass}
            initial={{ opacity: 0, transform: "translateY(10px) scale(0.94)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
          >
            {INVITE_COPY.headline}
          </motion.h1>
          <motion.div
            className={cn(inviteBodyStackClass, inviteBodyStackTightClass)}
            initial={{ opacity: 0, transform: "translateY(12px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.26 }}
          >
            <p className={bodyClass}>
              <InviteWithBoldProto />
            </p>
          </motion.div>
        </div>
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, transform: "translateX(28px)" }}
          animate={{ opacity: 1, transform: "translateX(0px)" }}
          transition={{
            duration: 0.55,
            ease: easeOut,
            delay: 0.62 + CTA_ENTRANCE_DELAY_EXTRA,
          }}
        >
          <div className={inviteCtaShellClass}>
            <button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
            >
              <span>{INVITE_COPY.continueCta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
        </motion.div>
      </PrototypeComponent>
    );
  }

  if (variant === "text-only") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem delay={0.04}>
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <MotionItem delay={0.12}>
            <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          </MotionItem>
          <div className={inviteBodyStackClass}>
            <MotionItem delay={0.18}>
              <p className={bodyClass}>
                <InviteWithBoldProto />
              </p>
            </MotionItem>
          </div>
        </div>
        <div className={inviteCtaSectionClass}>
          <div className={inviteCtaShellClass}>
            <button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
            >
              <span>{INVITE_COPY.continueCta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </button>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "button-only") {
    return (
      <PrototypeComponent
        id="invite-animations-block"
        className={cn(inviteBlockClassName, className)}
        key={mountKey}
      >
        <div className={inviteContentShellClass}>
          <MotionItem delay={0.04}>
            <InviteEyebrowHeader hideLabel={hideEyebrow} />
          </MotionItem>
          <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          <div className={inviteBodyStackClass}>
            <p className={bodyClass}>
              <InviteWithBoldProto />
            </p>
          </div>
        </div>
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, transform: "translateY(24px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{
            duration: 0.55,
            ease: easeOut,
            delay: 0.35 + CTA_ENTRANCE_DELAY_EXTRA,
          }}
        >
          <div className={inviteCtaShellClass}>
            <motion.button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
              initial={{ opacity: 0, transform: "translateX(16px)" }}
              animate={{ opacity: 1, transform: "translateX(0px)" }}
              transition={{
                duration: 0.45,
                ease: easeOut,
                delay: 0.45 + CTA_ENTRANCE_DELAY_EXTRA,
              }}
            >
              <span>{INVITE_COPY.continueCta}</span>
              <ArrowRight
                className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </motion.button>
          </div>
        </motion.div>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="invite-animations-block"
      className={cn(inviteBlockClassName, className)}
      key={mountKey}
    >
      <motion.div
        className={inviteContentShellClass}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.06 },
          },
        }}
      >
        <AnimatedInviteEyebrowHeader
          hideLabel={hideEyebrow}
          variants={{
            hidden: fadeUpHidden,
            visible: fadeUpVisible,
          }}
          transition={{ duration: 0.5, ease: easeOut }}
        />
        <motion.h1
          className={inviteHeadlineClass}
          variants={{
            hidden: fadeUpHidden,
            visible: fadeUpVisible,
          }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          {INVITE_COPY.headline}
        </motion.h1>
        <div className={inviteBodyStackClass}>
          <motion.p
            className={bodyClass}
            variants={{
              hidden: fadeUpHidden,
              visible: fadeUpVisible,
            }}
            transition={{ duration: 0.5, ease: easeOut, delay: -0.06 }}
          >
            <InviteWithBoldProto />
          </motion.p>
        </div>
      </motion.div>
      <motion.div
        className={inviteCtaSectionClass}
        initial={{ opacity: 0, transform: "translateY(18px)" }}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        transition={{
          duration: 0.5,
          ease: easeOut,
          delay: 0.58 + CTA_ENTRANCE_DELAY_EXTRA,
        }}
      >
        <div className={inviteCtaShellClass}>
          <button
            type="button"
            onClick={onContinue}
            className={inviteCtaButtonClass}
          >
            <span>{INVITE_COPY.continueCta}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden
            />
          </button>
        </div>
      </motion.div>
    </PrototypeComponent>
  );
}

export function InviteAnimationsBlock(props: InviteAnimationsBlockProps) {
  return <AnimatedInviteContent {...props} />;
}
