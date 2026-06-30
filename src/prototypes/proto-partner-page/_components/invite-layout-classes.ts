/** Shared invite/home screen layout — mobile-first, capped at md width on larger screens. */
export const inviteBlockClassName =
  "shrink-0 px-4 pt-0 pb-0 font-[family-name:var(--font-dm-sans)]! sm:px-5 md:px-8";

export const inviteContentShellClass =
  "mx-auto w-full max-w-md px-4 pb-0 sm:px-6 md:max-w-2xl md:px-10";

export const inviteCtaShellClass =
  "mx-auto flex w-full max-w-md justify-end px-4 sm:px-6 md:max-w-2xl md:px-10";

export const inviteEyebrowClass =
  "text-muted-foreground mb-6 text-[0.75rem] font-medium tracking-[0.18em] uppercase sm:mb-5 md:mb-7 md:text-[0.6875rem]";

export const inviteHeadlineClass =
  "text-foreground mb-6 text-[2.25rem] leading-[1.25] font-semibold tracking-[-0.03em] sm:mb-5 sm:text-[2rem] md:mb-7 md:text-[2.75rem] lg:text-[3.25rem]";

export const inviteBodyClass =
  "text-foreground text-[1rem] leading-[1.6] md:text-[1rem] md:leading-[1.65]";

export const inviteBodyStackClass = "flex flex-col gap-6 sm:gap-5 md:gap-7";

export const inviteBodyStackTightClass = "sm:pb-3 md:pb-4";

export const inviteCtaSectionClass =
  "pointer-events-auto relative z-30 shrink-0 px-4 pb-4 pt-6 sm:px-5 sm:pb-6 sm:pt-5 md:px-8 md:pb-8 md:pt-7";

export const inviteCtaButtonClass =
  "group bg-foreground text-background hover:bg-foreground/90 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg px-4 py-3 text-[1rem] font-medium tracking-[-0.01em] transition-colors md:text-[0.875rem]";

export const submitModalActionsClass = "flex w-full items-center gap-2";

export const submitModalSeeHomepageButtonClass =
  "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-[1rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color] hover:[background-color:var(--btn-bg-hover)] md:text-[0.875rem]";

export const submitModalKeepEditingButtonClass =
  "text-muted-foreground hover:text-foreground bg-background hover:bg-gray-100 inline-flex w-fit cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors";

export const submitModalCtaButtonClass =
  "group bg-foreground text-background hover:bg-gray-800 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors";
