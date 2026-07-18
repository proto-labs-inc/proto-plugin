"use client";

import { PrototypeProvider } from "@prototype/components/prototype-provider";
import { PrototypeBootstrapOnboardingModal } from "@prototype/components/shell/prototype-bootstrap-onboarding-modal";
import { PrototypeBootstrapPreviewFloatingStepper } from "@prototype/components/shell/prototype-bootstrap-preview-floating-stepper";
import { PrototypeGalleryNav } from "@prototype/components/shell/prototype-gallery-nav";
import {
  BootstrapPreviewProvider,
  useBootstrapPreview,
} from "@prototype/lib/prototypes/use-bootstrap-preview";
import { GalleryHostConfigProvider } from "@prototype/lib/prototypes/use-gallery-host-config";
import { cn } from "@prototype/lib/utils";
import type { HTMLAttributes, ReactNode, RefObject } from "react";

/** Uniform gallery gutter — tile gaps match content inset on every side. */
export const PROTOTYPE_GALLERY_GRID_GAP_CLASS = "gap-6";
export const PROTOTYPE_GALLERY_CONTENT_INSET_CLASS = "p-6";
export const PROTOTYPE_GALLERY_HEADER_INSET_CLASS = "px-6 py-4";
export const PROTOTYPE_GALLERY_FOOTER_INSET_CLASS = "px-6 py-3";

type PrototypeGalleryShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  sourceDirectoryName?: string;
  sourcePath?: string;
  syncConfigPath?: string;
  componentLibraryPagePath?: string;
};

function PrototypeGalleryShellMain({
  children,
}: Pick<PrototypeGalleryShellProps, "children">) {
  return (
    <main className="bg-[var(--bg-ground)] flex min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </main>
  );
}

export function PrototypeGalleryShell({
  children,
  footer,
  sourceDirectoryName,
  sourcePath,
  syncConfigPath,
  componentLibraryPagePath,
}: PrototypeGalleryShellProps) {
  return (
    <BootstrapPreviewProvider>
      <GalleryHostConfigProvider
        value={{
          currentSourcePath: sourcePath,
          syncConfigPath,
          componentLibraryPagePath,
        }}
      >
        <PrototypeGalleryShellContent
          footer={footer}
          sourceDirectoryName={sourceDirectoryName}
          sourcePath={sourcePath}
          syncConfigPath={syncConfigPath}
          componentLibraryPagePath={componentLibraryPagePath}
        >
          {children}
        </PrototypeGalleryShellContent>
      </GalleryHostConfigProvider>
    </BootstrapPreviewProvider>
  );
}

function PrototypeGalleryShellContent({
  children,
  footer,
  sourceDirectoryName,
  sourcePath,
  syncConfigPath,
  componentLibraryPagePath,
}: PrototypeGalleryShellProps) {
  const {
    bootstrapStep,
    openModalForStep,
    isOnboardingBackdropActive,
    isOnboardingInProgress,
    isOnboardingMinimized,
    isDevelopmentToggleVisible,
  } = useBootstrapPreview();

  const showResumeOnboardingPill =
    isOnboardingInProgress && isOnboardingMinimized;

  return (
    <PrototypeProvider className="bg-[var(--bg-main)] flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      {footer && !isOnboardingBackdropActive ? (
        <div
          className={cn(
            "border-[var(--tool-chrome-border)] bg-[var(--bg-main)] flex shrink-0 items-center justify-end border-b",
            PROTOTYPE_GALLERY_FOOTER_INSET_CLASS,
          )}
        >
          {footer}
        </div>
      ) : null}

      <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
        {isOnboardingBackdropActive ? (
          <div
            className="absolute inset-0 z-0 bg-[var(--tool-chrome-ground)]"
            aria-hidden
            data-prototype-bootstrap-backdrop=""
          />
        ) : (
          <>
            <PrototypeGalleryNav
              sourceDirectoryName={sourceDirectoryName}
              sourcePath={sourcePath}
            />
            <PrototypeGalleryShellMain>{children}</PrototypeGalleryShellMain>
          </>
        )}

        <PrototypeBootstrapOnboardingModal
          currentSourcePath={sourcePath}
          syncConfigPath={syncConfigPath}
          componentLibraryPagePath={componentLibraryPagePath}
        />

        {showResumeOnboardingPill ? (
          <button
            type="button"
            onClick={() => openModalForStep(bootstrapStep)}
            className="border-[var(--tool-chrome-border)] bg-[var(--bg-main)] text-[var(--tool-chrome-text-heading)] absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg transition-colors hover:bg-[var(--tool-chrome-ground)]"
            data-prototype-bootstrap-resume=""
          >
            <span
              className="size-2 animate-pulse rounded-full bg-[var(--tool-chrome-accent,#6366f1)]"
              aria-hidden
            />
            Finish workspace setup
          </button>
        ) : null}

        {isDevelopmentToggleVisible ? (
          <PrototypeBootstrapPreviewFloatingStepper
            activeStep={bootstrapStep}
            onStepChange={openModalForStep}
          />
        ) : null}
      </div>
    </PrototypeProvider>
  );
}

type PrototypeGalleryPageLayoutProps = {
  header: ReactNode;
  children: ReactNode;
  scrollClassName?: string;
  scrollContainerProps?: HTMLAttributes<HTMLDivElement> &
    Record<`data-${string}`, string>;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
  scrollOverlay?: ReactNode;
};

/** Gallery pages: header stays fixed; only body scrolls. */
export function PrototypeGalleryPageLayout({
  header,
  children,
  scrollClassName,
  scrollContainerProps,
  scrollContainerRef,
  scrollOverlay,
}: PrototypeGalleryPageLayoutProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {header}
      <div
        ref={scrollContainerRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
          scrollClassName ?? "bg-[var(--bg-ground)]",
        )}
        {...scrollContainerProps}
      >
        {scrollOverlay ? (
          <div className="pointer-events-none absolute right-6 top-6 z-10">
            <div className="pointer-events-auto">{scrollOverlay}</div>
          </div>
        ) : null}
        <div className={cn("h-fit w-full", PROTOTYPE_GALLERY_CONTENT_INSET_CLASS)}>
          {children}
        </div>
      </div>
    </div>
  );
}

type PrototypeGalleryHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  actions?: ReactNode;
};

export function PrototypeGalleryHeader({
  eyebrow,
  title = "Prototypes",
  description = "UI experiments and concept explorations. Select a prototype to open it.",
  className,
  actions,
}: PrototypeGalleryHeaderProps) {
  const descriptionClassName =
    "mt-1 text-sm leading-normal text-[var(--tool-chrome-text-muted)]";
  const descriptionBelowActions = Boolean(actions && description);

  return (
    <div
      className={cn(
        "border-[var(--tool-chrome-border)] bg-[var(--bg-main)] shrink-0 border-b",
        PROTOTYPE_GALLERY_HEADER_INSET_CLASS,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-xs text-[var(--tool-chrome-text-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-0 text-xl font-medium tracking-tight text-[var(--tool-chrome-text-heading)]">
            {title}
          </h1>
          {description && !descriptionBelowActions ? (
            <p className={cn(descriptionClassName, "max-w-2xl")}>{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center pt-0.5">{actions}</div>
        ) : null}
      </div>
      {descriptionBelowActions ? (
        <p className={cn(descriptionClassName, "w-full")}>{description}</p>
      ) : null}
    </div>
  );
}

export function PrototypeGalleryPage({
  children,
  footer,
  header,
}: PrototypeGalleryShellProps & {
  header?: ReactNode;
}) {
  return (
    <PrototypeGalleryShell footer={footer}>
      <PrototypeGalleryPageLayout
        header={header ?? <PrototypeGalleryHeader className="mb-0" />}
      >
        {children}
      </PrototypeGalleryPageLayout>
    </PrototypeGalleryShell>
  );
}
