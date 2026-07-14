"use client";

import { PrototypeComponent } from "proto";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "motion/react";

import {
  inviteBlockClassName,
  inviteBodyClass,
  inviteBodyLineHighlightClass,
  inviteBodyStackClass,
  inviteContentShellClass,
  inviteHeadlineClass,
  inviteInteractiveClass,
  inviteLineHighlightClass,
  inviteMotionPassThroughClass,
} from "../../proto-partner-page/_components/invite-layout-classes";
import {
  PARTNER_FADE_UP_DURATION,
  partnerEaseOut,
  partnerFadeUpHidden,
  partnerFadeUpVisible,
  partnerPopSpring,
} from "../../proto-partner-page/_components/partner-page-motion";
import {
  HOME_PAGE_COPY,
  MAAYAN_SITE_URL,
  MAAYAN_X_URL,
} from "./home-page-copy-content";

/** Matches invite word-pop intro — last copy beat before shapes. */
export const HOME_PAGE_BODY_ENTRANCE_DELAY = 0.38;

const INVITE_WORD_POP_HEADLINE_BASE_DELAY = 0.12;
const INVITE_WORD_POP_HEADLINE_STAGGER = 0.07;

const [, bodyAfterProto] = HOME_PAGE_COPY.body.split("Proto");
const [beforeFirstMaayan, middleSection, afterSecondMaayan] =
  bodyAfterProto.split("Maayan");
const [beforeDM, afterDM] = middleSection.split("DM");

const homePageBodyLinkClassName =
  `${inviteInteractiveClass} text-foreground font-medium underline decoration-foreground/30 underline-offset-[3px]`;

const homePageHeadlineClass = cn(
  inviteHeadlineClass,
  "font-bold md:text-[3.5rem] lg:text-[4rem]",
);

function BodyWithBoldProto() {
  return (
    <>
      <span className="font-bold">Proto</span>
      {beforeFirstMaayan}
      <a
        href={MAAYAN_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={homePageBodyLinkClassName}
      >
        Maayan
      </a>
      {beforeDM}
      <a
        href={MAAYAN_X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={homePageBodyLinkClassName}
      >
        DM
      </a>
      {afterDM}
      Maayan
      {afterSecondMaayan}
    </>
  );
}

export function HomePageCopyBlock() {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <PrototypeComponent
        id="home-page-copy-block"
        className={inviteBlockClassName}
      >
        <div className={inviteContentShellClass}>
          <h1 className={homePageHeadlineClass}>
            <span className={inviteLineHighlightClass}>
              {HOME_PAGE_COPY.headline}
            </span>
          </h1>
          <div className={inviteBodyStackClass}>
            <p className={inviteBodyClass}>
              <span className={inviteBodyLineHighlightClass}>
                <BodyWithBoldProto />
              </span>
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="home-page-copy-block"
      className={inviteBlockClassName}
    >
      <div className={inviteContentShellClass}>
        <h1
          className={cn(homePageHeadlineClass, "flex flex-wrap gap-x-[0.28em]")}
        >
          {HOME_PAGE_COPY.headlineParts.map((part, index) => (
            <motion.span
              key={part}
              className={inviteMotionPassThroughClass}
              initial={{
                opacity: 0,
                transform: "translateY(14px) scale(0.92)",
              }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              transition={{
                ...partnerPopSpring,
                delay:
                  INVITE_WORD_POP_HEADLINE_BASE_DELAY +
                  index * INVITE_WORD_POP_HEADLINE_STAGGER,
              }}
            >
              <span className={inviteLineHighlightClass}>{part}</span>
            </motion.span>
          ))}
        </h1>
        <div className={inviteBodyStackClass}>
          <motion.div
            className={inviteMotionPassThroughClass}
            initial={partnerFadeUpHidden}
            animate={partnerFadeUpVisible}
            transition={{
              duration: PARTNER_FADE_UP_DURATION,
              ease: partnerEaseOut,
              delay: HOME_PAGE_BODY_ENTRANCE_DELAY,
            }}
          >
            <p className={inviteBodyClass}>
              <span className={inviteBodyLineHighlightClass}>
                <BodyWithBoldProto />
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </PrototypeComponent>
  );
}
