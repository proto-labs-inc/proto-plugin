"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, type ReactNode } from "react";

import type { InviteAnimationsVariant } from "./invite-animations-content";
import { INVITE_COPY } from "./invite-copy-content";
import {
  inviteBlockClassName,
  inviteBodyClass,
  inviteBodyStackClass,
  inviteBodyStackTightClass,
  inviteContentShellClass,
  inviteCtaButtonClass,
  inviteCtaSectionClass,
  inviteCtaShellClass,
  inviteEyebrowClass,
  inviteHeadlineClass,
} from "./invite-layout-classes";

type InviteAnimationsBlockProps = {
  variant: InviteAnimationsVariant;
  onContinue?: () => void;
  className?: string;
  /** Remount animations when the design brief switches variants. */
  replayKey?: string;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Extra beat after copy lands before the CTA enters. */
const CTA_ENTRANCE_DELAY_EXTRA = 0.15;

const fadeUpHidden = { opacity: 0, y: 18 };
const fadeUpVisible = { opacity: 1, y: 0 };

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
}: {
  onContinue?: () => void;
  className?: string;
}) {
  return (
    <PrototypeComponent
      id="invite-animations-block"
      className={cn(inviteBlockClassName, className)}
    >
      <div className={inviteContentShellClass}>
        <p className={inviteEyebrowClass}>Design partner invite</p>
        <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
        <div className={inviteBodyStackClass}>
          <p className={inviteBodyClass}>
            <InviteWithBoldProto />
          </p>
          <p className={inviteBodyClass}>{INVITE_COPY.followUp}</p>
        </div>
      </div>
      <div className={inviteCtaSectionClass}>
        <div className={inviteCtaShellClass}>
          <button
            type="button"
            onClick={onContinue}
            className={inviteCtaButtonClass}
          >
            <span>Customize your Proto Shape</span>
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
      className={className}
      initial={hidden}
      animate={visible}
      transition={{
        duration: 0.55,
        ease: easeOut,
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
}: {
  onContinue?: () => void;
  delay?: number;
}) {
  return (
    <div className={inviteCtaSectionClass}>
      <div className={inviteCtaShellClass}>
        <motion.button
          type="button"
          onClick={onContinue}
          className="group bg-foreground text-background hover:bg-foreground/90 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors"
          initial={{ opacity: 0, scale: 0.88, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 360,
            damping: 22,
            delay: delay + CTA_ENTRANCE_DELAY_EXTRA,
          }}
        >
          <span>Customize your Proto Shape</span>
          <ArrowRight
            className="size-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1"
            aria-hidden
          />
        </motion.button>
      </div>
    </div>
  );
}

function AnimatedInviteContent({
  variant,
  onContinue,
  className,
  replayKey,
}: InviteAnimationsBlockProps) {
  const reduceMotion = useReducedMotion();
  const mountKey = `${variant}-${replayKey ?? "live"}`;

  const headlineWords = useMemo(() => INVITE_COPY.headline.split(/\s+/), []);

  if (reduceMotion || variant === "none") {
    return (
      <StaticInviteContent onContinue={onContinue} className={className} />
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
          </MotionItem>
          <h1
            className={cn(inviteHeadlineClass, "flex flex-wrap gap-x-[0.28em]")}
          >
            {headlineWords.map((word, index) => (
              <motion.span
                key={`${mountKey}-${word}-${index}`}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
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
            <MotionItem delay={0.5}>
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
            </MotionItem>
          </div>
        </div>
        <SpringCtaSection onContinue={onContinue} delay={0.82} />
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
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
            <MotionItem
              delay={0.34}
              hidden={blurHidden}
              visible={blurVisible}
              transition={{ duration: 0.65 }}
            >
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
            </MotionItem>
          </div>
        </div>
        <SpringCtaSection onContinue={onContinue} delay={0.56} />
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
          <motion.p
            className={inviteEyebrowClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            Design partner invite
          </motion.p>
          <motion.h1
            className={inviteHeadlineClass}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
          >
            {INVITE_COPY.headline}
          </motion.h1>
          <motion.div
            className={cn(inviteBodyStackClass, inviteBodyStackTightClass)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.26 }}
          >
            <p className={bodyClass}>
              <InviteWithBoldProto />
            </p>
            <p className={bodyClass}>{INVITE_COPY.followUp}</p>
          </motion.div>
        </div>
        <SpringCtaSection onContinue={onContinue} delay={0.62} />
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
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
            <MotionItem delay={0.28}>
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
            </MotionItem>
          </div>
        </div>
        <SpringCtaSection onContinue={onContinue} delay={0.42} />
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
          </MotionItem>
          <h1
            className={cn(inviteHeadlineClass, "flex flex-wrap gap-x-[0.28em]")}
          >
            {headlineWords.map((word, index) => (
              <motion.span
                key={`${mountKey}-${word}-${index}`}
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
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
            <MotionItem delay={0.5}>
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
            </MotionItem>
          </div>
        </div>
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
              <span>Customize your Proto Shape</span>
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
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
            <MotionItem
              delay={0.34}
              hidden={blurHidden}
              visible={blurVisible}
              transition={{ duration: 0.65 }}
            >
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
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
              <span>Customize your Proto Shape</span>
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
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
            <MotionItem
              delay={0.2}
              hidden={{ opacity: 0 }}
              visible={{ opacity: 1 }}
            >
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
            </MotionItem>
          </div>
        </div>
        <div className={inviteCtaSectionClass}>
          <div className={inviteCtaShellClass}>
            <motion.button
              type="button"
              onClick={onContinue}
              className={inviteCtaButtonClass}
              initial={{ opacity: 0, scale: 0.88, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 22,
                delay: 0.48 + CTA_ENTRANCE_DELAY_EXTRA,
              }}
            >
              <span>Customize your Proto Shape</span>
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
          <motion.p
            className={inviteEyebrowClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            Design partner invite
          </motion.p>
          <motion.h1
            className={inviteHeadlineClass}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.08 }}
          >
            {INVITE_COPY.headline}
          </motion.h1>
          <motion.div
            className={cn(inviteBodyStackClass, inviteBodyStackTightClass)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.26 }}
          >
            <p className={bodyClass}>
              <InviteWithBoldProto />
            </p>
            <p className={bodyClass}>{INVITE_COPY.followUp}</p>
          </motion.div>
        </div>
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
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
              <span>Customize your Proto Shape</span>
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
            <p className={inviteEyebrowClass}>Design partner invite</p>
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
            <MotionItem delay={0.28}>
              <p className={bodyClass}>{INVITE_COPY.followUp}</p>
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
              <span>Customize your Proto Shape</span>
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
          <p className={inviteEyebrowClass}>Design partner invite</p>
          <h1 className={inviteHeadlineClass}>{INVITE_COPY.headline}</h1>
          <div className={inviteBodyStackClass}>
            <p className={bodyClass}>
              <InviteWithBoldProto />
            </p>
            <p className={bodyClass}>{INVITE_COPY.followUp}</p>
          </div>
        </div>
        <motion.div
          className={inviteCtaSectionClass}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.45,
                ease: easeOut,
                delay: 0.45 + CTA_ENTRANCE_DELAY_EXTRA,
              }}
            >
              <span>Customize your Proto Shape</span>
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
        <motion.p
          className={inviteEyebrowClass}
          variants={{
            hidden: fadeUpHidden,
            visible: fadeUpVisible,
          }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          Design partner invite
        </motion.p>
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
          <motion.p
            className={bodyClass}
            variants={{
              hidden: fadeUpHidden,
              visible: fadeUpVisible,
            }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            {INVITE_COPY.followUp}
          </motion.p>
        </div>
      </motion.div>
      <motion.div
        className={inviteCtaSectionClass}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
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
            <span>Customize your Proto Shape</span>
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
