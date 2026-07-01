"use client";

import { PrototypeComponent } from "@prototype/components/prototypes/prototype-target";

import { INVITE_COPY, type InviteCopyVariant } from "./invite-copy-content";
import {
  inviteBodyClass,
  inviteBodyStackClass,
  inviteContentShellClass,
  inviteHeadlineClass,
} from "./invite-layout-classes";
import { InviteEyebrowHeader } from "./invite-eyebrow-header";

type InviteCopyBlockProps = {
  variant: InviteCopyVariant;
  onHome?: () => void;
};

function ActionHint({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-foreground font-medium underline decoration-foreground/30 underline-offset-[3px]">
      {children}
    </span>
  );
}

const equalBodyClass = "text-foreground text-[0.875rem] leading-[1.6]";

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

export function InviteCopyBlock({ variant, onHome }: InviteCopyBlockProps) {
  if (variant === "open-card") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-0 pb-0 font-[family-name:var(--font-dm-sans)]! sm:px-5"
      >
        <div className={inviteContentShellClass}>
          <InviteEyebrowHeader onHome={onHome} />
          <h1 className={inviteHeadlineClass}>
            {INVITE_COPY.headline}
          </h1>
          <div className={inviteBodyStackClass}>
            <p className={inviteBodyClass}>
              <InviteWithBoldProto />
            </p>
            <p className={inviteBodyClass}>{INVITE_COPY.followUp}</p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "oversized") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-8 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-4 sm:gap-5">
          <h1 className="text-foreground text-[2.25rem] leading-[0.95] font-bold tracking-[-0.055em] sm:text-[3.25rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="flex flex-col gap-4">
            <p className="text-foreground text-[0.9375rem] leading-[1.65]">
              {INVITE_COPY.invite}
            </p>
            <p className="text-muted-foreground text-[0.875rem] leading-[1.7]">
              {INVITE_COPY.followUp}
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "card-invite") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-5 sm:pt-7 sm:pb-5"
      >
        <div className="border-border mx-auto max-w-md rounded-2xl border bg-transparent p-4 sm:p-6">
          <p className="text-muted-foreground mb-3 text-[0.6875rem] font-medium tracking-[0.18em] uppercase sm:mb-4">
            Design partner invite
          </p>
          <h1 className="text-foreground mb-3 text-[1.5rem] leading-[1.08] font-semibold tracking-[-0.03em] sm:mb-4 sm:text-[1.875rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="flex flex-col gap-4">
            <p className="text-foreground text-[1rem] leading-[1.6]">
              {INVITE_COPY.invite}
            </p>
            <p className="text-muted-foreground text-[0.9375rem] leading-[1.65]">
              {INVITE_COPY.followUp}
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "verse") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-9 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <p className="text-foreground text-[1.125rem] leading-[1.8] font-semibold">
            {INVITE_COPY.headline}
          </p>
          <p className="text-foreground text-[1rem] leading-[1.8]">
            {INVITE_COPY.invite}
          </p>
          <p className="text-foreground text-[1rem] leading-[1.8]">
            {INVITE_COPY.followUp}
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "stamp") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-7 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <div className="flex items-baseline gap-4">
            <span className="text-foreground/15 select-none text-[5rem] leading-none font-bold tracking-[-0.06em]">
              01
            </span>
            <div className="bg-foreground/10 h-px flex-1" />
          </div>
          <h1 className="text-foreground -mt-1 text-[1.625rem] leading-[1.05] font-bold tracking-[-0.04em] sm:text-[2rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="flex flex-col gap-4">
            <p className="text-foreground text-[1rem] leading-[1.55]">
              {INVITE_COPY.invite}
            </p>
            <p className="text-muted-foreground text-[0.9375rem] leading-[1.65]">
              {INVITE_COPY.followUp}
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "flush-bottom") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="flex shrink-0 flex-col justify-end px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-16 sm:pb-5"
      >
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <p className="text-muted-foreground text-[0.6875rem] font-medium tracking-[0.2em] uppercase">
            Proto partner
          </p>
          <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
            {INVITE_COPY.headline}
          </h1>
          <p className="text-foreground text-[1rem] leading-[1.55]">
            {INVITE_COPY.invite}
          </p>
          <p className="text-muted-foreground text-[0.9375rem] leading-[1.65]">
            {INVITE_COPY.followUp}
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "drop-through") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="pointer-events-none shrink-0 px-4 pt-4 pb-3 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pb-4 sm:pt-[7.5rem]"
      >
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="mt-2 flex flex-col gap-4">
            <p className={equalBodyClass}>{INVITE_COPY.invite}</p>
            <p className={equalBodyClass}>{INVITE_COPY.followUp}</p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "top-air") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pb-5 sm:pt-24"
      >
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="mt-2 flex flex-col gap-4">
            <p className={equalBodyClass}>{INVITE_COPY.invite}</p>
            <p className={equalBodyClass}>{INVITE_COPY.followUp}</p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "lower-center") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pb-5 sm:pt-[5.5rem]"
      >
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <h1 className="text-foreground text-center text-[1.625rem] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[2rem]">
            {INVITE_COPY.headline}
          </h1>
          <p className="text-foreground text-center text-[1.0625rem] leading-[1.55]">
            {INVITE_COPY.invite}
          </p>
          <p className="text-muted-foreground text-center text-[0.9375rem] leading-[1.6]">
            {INVITE_COPY.followUp}
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "stagger-drop") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-10 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col">
          <p className="text-muted-foreground text-[0.6875rem] leading-none font-medium tracking-[0.2em] uppercase">
            Proto partner
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:mt-16">
            <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
              {INVITE_COPY.headline}
            </h1>
            <p className={equalBodyClass}>{INVITE_COPY.invite}</p>
            <p className={`${equalBodyClass} text-muted-foreground`}>
              {INVITE_COPY.followUp}
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "equal-body") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-8 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="mt-2 flex flex-col gap-4">
            <p className={equalBodyClass}>{INVITE_COPY.invite}</p>
            <p className={equalBodyClass}>{INVITE_COPY.followUp}</p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "split-rule") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-8 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
            {INVITE_COPY.headline}
          </h1>
          <p className={`${equalBodyClass} mt-2`}>{INVITE_COPY.invite}</p>
          <p className={`${equalBodyClass} border-border/70 border-t pt-4`}>
            {INVITE_COPY.followUp}
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "hero-stack") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-8 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <h1 className="text-foreground text-center text-[1.625rem] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[2rem]">
            {INVITE_COPY.headline}
          </h1>
          <p className="text-foreground text-[1.0625rem] leading-[1.55]">
            {INVITE_COPY.invite}
          </p>
          <p className="text-muted-foreground text-[0.9375rem] leading-[1.6]">
            {INVITE_COPY.followUp}
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "left-rail") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-5 sm:pt-7 sm:pb-5"
      >
        <div className="border-foreground/15 mx-auto max-w-md border-l-2 pl-3 sm:pl-4">
          <p className="text-muted-foreground mb-3 text-[0.6875rem] leading-none font-medium tracking-[0.18em] uppercase">
            Design partner invite
          </p>
          <h1 className="text-foreground mb-3 text-[1.375rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:mb-4 sm:text-[1.75rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="flex flex-col gap-4">
            <p className="text-foreground text-[1rem] leading-[1.55]">
              {INVITE_COPY.invite}
            </p>
            <p className="text-muted-foreground text-[0.9375rem] leading-[1.6]">
              {INVITE_COPY.followUp}
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "type-contrast") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-8 sm:pb-5"
      >
        <div className="mx-auto flex max-w-md flex-col gap-3">
          <p className="text-muted-foreground text-[0.6875rem] leading-none font-medium tracking-[0.2em] uppercase">
            Proto partner
          </p>
          <h1 className="text-foreground text-[1.625rem] leading-[1] font-bold tracking-[-0.04em] sm:text-[2.125rem]">
            {INVITE_COPY.headline}
          </h1>
          <p className="text-foreground mt-2 text-[1.0625rem] leading-[1.5] font-medium">
            {INVITE_COPY.invite}
          </p>
          <p className="text-muted-foreground border-border/70 mt-1 border-t pt-4 text-[0.875rem] leading-[1.65]">
            {INVITE_COPY.followUp}
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "inline-actions") {
    const followUpParts = INVITE_COPY.followUp.split("make your own protoshape");

    return (
      <PrototypeComponent
        id="invite-copy-block"
        className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-7 sm:pb-5"
      >
        <div className="mx-auto max-w-md">
          <h1 className="text-foreground mb-3 text-[1.5rem] leading-[1.08] font-semibold tracking-[-0.02em] sm:mb-4 sm:text-[1.875rem]">
            {INVITE_COPY.headline}
          </h1>
          <div className="flex flex-col gap-4 text-[1rem] leading-[1.55]">
            <p className="text-foreground">{INVITE_COPY.invite}</p>
            <p className="text-muted-foreground">
              {followUpParts[0]}
              <ActionHint>make your own protoshape</ActionHint>
              {followUpParts[1]}
            </p>
          </div>
        </div>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="invite-copy-block"
      className="shrink-0 px-4 pt-4 pb-4 font-[family-name:var(--font-dm-sans)]! sm:px-6 sm:pt-7 sm:pb-5"
    >
      <div className="mx-auto flex max-w-md flex-col gap-4 sm:gap-5">
        <div className="flex flex-col gap-3">
          <h1 className="text-foreground text-[1.375rem] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[1.75rem]">
            {INVITE_COPY.headline}
          </h1>
          <p className="text-foreground text-[1.0625rem] leading-[1.55]">
            {INVITE_COPY.invite}
          </p>
        </div>
        <div aria-hidden className="bg-border/80 h-px w-full" />
        <p className="text-muted-foreground text-[0.9375rem] leading-[1.65]">
          {INVITE_COPY.followUp}
        </p>
      </div>
    </PrototypeComponent>
  );
}
