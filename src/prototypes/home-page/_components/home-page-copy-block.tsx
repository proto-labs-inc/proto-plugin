"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";
import { cn } from "@prototype/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

import {
  inviteBlockClassName,
  inviteBodyClass,
  inviteBodyStackClass,
  inviteContentShellClass,
  inviteHeadlineClass,
} from "../../proto-partner-page/_components/invite-layout-classes";
import { HOME_PAGE_COPY } from "./home-page-copy-content";

const easeOut = [0.22, 1, 0.36, 1] as const;

const [, bodyAfterProto] = HOME_PAGE_COPY.body.split("Proto");

function BodyWithBoldProto() {
  return (
    <>
      <span className="font-bold">Proto</span>
      {bodyAfterProto}
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
          <h1 className={inviteHeadlineClass}>{HOME_PAGE_COPY.headline}</h1>
          <div className={inviteBodyStackClass}>
            <p className={inviteBodyClass}>
              <BodyWithBoldProto />
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
          className={cn(inviteHeadlineClass, "flex flex-wrap gap-x-[0.28em]")}
        >
          {headlineWords.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
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
            <BodyWithBoldProto />
          </motion.p>
        </div>
      </div>
    </PrototypeComponent>
  );
}
