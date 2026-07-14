"use client";

import { PrototypeComponent } from "proto-plugin";
import { cn } from "@/lib/cn";

import {
  INVITE_COPY,
  type InviteCopyVariant,
  type InviteStep,
} from "./invite-copy-content";
import {
  inviteBlockClassName,
  inviteBodyClass,
  inviteBodyStackClass,
  inviteContentShellClass,
  inviteFollowUpHeadlineClass,
  inviteFollowUpStackClass,
  inviteHeadlineClass,
  inviteBodyLineHighlightClass,
  inviteLineHighlightClass,
} from "./invite-layout-classes";
import { InviteEyebrowHeader } from "./invite-eyebrow-header";

type InviteCopyBlockProps = {
  variant: InviteCopyVariant;
  step?: InviteStep;
};

const equalBodyClass =
  "pointer-events-none text-foreground text-[0.875rem] leading-[1.6]";

export function InviteFollowUpCopy() {
  return (
    <PrototypeComponent id="invite-copy-block.invite-follow-up-copy">
      {INVITE_COPY.followUp}
    </PrototypeComponent>
  );
}

export function InviteFollowUpTitle() {
  return (
    <PrototypeComponent id="invite-copy-block.invite-follow-up-title">
      <h2 className={inviteFollowUpHeadlineClass}>
        <span className={inviteLineHighlightClass}>
          {INVITE_COPY.followUpHeadline}
        </span>
      </h2>
    </PrototypeComponent>
  );
}

export function InviteFollowUpBody() {
  return (
    <PrototypeComponent id="invite-copy-block.invite-follow-up-body">
      <p className={inviteBodyClass}>
        <span className={inviteBodyLineHighlightClass}>
          <InviteFollowUpCopy />
        </span>
      </p>
    </PrototypeComponent>
  );
}

export function InviteFollowUpContent() {
  return (
    <PrototypeComponent id="invite-copy-block.invite-follow-up-content">
      <div className={inviteFollowUpStackClass}>
        <InviteFollowUpTitle />
        <InviteFollowUpBody />
      </div>
    </PrototypeComponent>
  );
}

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

export function InviteCopyBlock({
  variant,
  step = "intro",
}: InviteCopyBlockProps) {
  if (variant === "open-card") {
    return (
      <PrototypeComponent
        id="invite-copy-block"
        className={cn(inviteBlockClassName, "sm:px-5")}
      >
        <div className={inviteContentShellClass}>
          {step === "intro" ? (
            <>
              <InviteEyebrowHeader />
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
              <InviteFollowUpCopy />
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
              <InviteFollowUpCopy />
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
            <InviteFollowUpCopy />
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
              <InviteFollowUpCopy />
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
            <InviteFollowUpCopy />
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
            <p className={equalBodyClass}>
              <InviteFollowUpCopy />
            </p>
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
            <p className={equalBodyClass}>
              <InviteFollowUpCopy />
            </p>
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
            <InviteFollowUpCopy />
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
              <InviteFollowUpCopy />
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
            <p className={equalBodyClass}>
              <InviteFollowUpCopy />
            </p>
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
            <InviteFollowUpCopy />
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
            <InviteFollowUpCopy />
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
              <InviteFollowUpCopy />
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
            <InviteFollowUpCopy />
          </p>
        </div>
      </PrototypeComponent>
    );
  }

  if (variant === "inline-actions") {
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
              <InviteFollowUpCopy />
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
          <InviteFollowUpCopy />
        </p>
      </div>
    </PrototypeComponent>
  );
}
