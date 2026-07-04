"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import {
  inviteBlockClassName,
  inviteBodyClass,
  inviteBodyLineHighlightClass,
  inviteBodyStackClass,
  inviteContentShellClass,
  inviteHeadlineClass,
  inviteInteractiveClass,
  inviteLineHighlightClass,
} from "../../proto-partner-page/_components/invite-layout-classes";
import {
  HOME_PAGE_COPY,
  MAAYAN_SITE_URL,
  MAAYAN_X_URL,
} from "./home-page-copy-content";

const easeOut = [0.22, 1, 0.36, 1] as const;

const [, bodyAfterProto] = HOME_PAGE_COPY.body.split("Proto");
const [beforeFirstMaayan, middleSection, afterSecondMaayan] =
  bodyAfterProto.split("Maayan");
const [beforeDM, afterDM] = middleSection.split("DM");

const homePageBodyLinkClassName =
  `${inviteInteractiveClass} text-foreground font-medium underline decoration-foreground/30 underline-offset-[3px]`;

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
  const headlineWords = useMemo(
    () => HOME_PAGE_COPY.headline.split(/\s+/),
    [],
  );

  if (reduceMotion) {
    return (
      <PrototypeComponent
        id="home-page-copy-block"
        className={inviteBlockClassName}
      >
        <div className={inviteContentShellClass}>
          <h1 className={inviteHeadlineClass}>
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
        <h1 className={inviteHeadlineClass}>
          {headlineWords.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              className={inviteLineHighlightClass}
              initial={{ opacity: 0, transform: "translateY(14px) scale(0.92)" }}
              animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 26,
                delay: 0.12 + index * 0.07,
              }}
            >
              {word}
              {index < headlineWords.length - 1 ? " " : ""}
            </motion.span>
          ))}
        </h1>
        <div className={inviteBodyStackClass}>
          <motion.p
            className={inviteBodyClass}
            initial={{ opacity: 0, transform: "translateY(18px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.55, ease: easeOut, delay: 0.38 }}
          >
            <span className={inviteBodyLineHighlightClass}>
              <BodyWithBoldProto />
            </span>
          </motion.p>
        </div>
      </div>
    </PrototypeComponent>
  );
}
