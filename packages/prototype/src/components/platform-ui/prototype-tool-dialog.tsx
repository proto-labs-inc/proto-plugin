"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { cn } from "@prototype/lib/utils";
import { ChevronDown, X } from "lucide-react";
import type { ReactNode } from "react";

export const PROTOTYPE_TOOL_MODAL_CLOSE_CLASS =
  "text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-70 transition-opacity duration-200 ease hover:opacity-100 outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:hover:text-muted-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const PROTOTYPE_TOOL_MODAL_TEXTAREA_CLASS =
  "field-sizing-content min-h-[min(50vh,20rem)] w-full resize-y border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0";

/** Shared min height for workspace onboarding / bootstrap gate modals. */
export const PROTOTYPE_ONBOARDING_MODAL_MIN_HEIGHT_CLASS =
  "min-h-[min(26rem,72svh)]";

const MODAL_SIZE_CLASS = {
  md: "w-[min(42rem,calc(100vw-2rem))] max-w-[min(42rem,calc(100vw-2rem))] sm:max-w-[min(42rem,calc(100vw-2rem))]",
  wide: "w-[min(96rem,calc(100vw-2rem))] max-w-[min(96rem,calc(100vw-2rem))] sm:max-w-[min(96rem,calc(100vw-2rem))]",
} as const;

export type PrototypeToolDialogXylophoneProps = {
  children: ReactNode;
  className?: string;
};

export function PrototypeToolDialogXylophone({
  children,
  className,
}: PrototypeToolDialogXylophoneProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-2", className)}>
      {children}
    </div>
  );
}

export type PrototypeToolDialogXylophoneSectionProps = {
  step: string;
  title: string;
  description: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export function PrototypeToolDialogXylophoneSection({
  step,
  title,
  description,
  expanded,
  onExpandedChange,
  children,
  className,
  contentClassName,
}: PrototypeToolDialogXylophoneSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-[var(--tool-chrome-border)] bg-[var(--tool-chrome-surface-muted)]",
        expanded && "min-h-0 flex-1",
        className,
      )}
    >
      <button
        type="button"
        className="tool-dialog-xylophone-header flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3 text-left transition-colors duration-200 ease"
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="tool-dialog-xylophone-heading">
            <span className="tool-dialog-xylophone-step">{step}</span>
            <span className="tool-dialog-xylophone-separator" aria-hidden>
              ·
            </span>
            <span className="tool-dialog-xylophone-title">{title}</span>
          </h3>
          <p className="tool-dialog-section-description">{description}</p>
        </div>
        <ChevronDown
          className={cn(
            "tool-panel-section-chevron mt-0.5 size-4 shrink-0 text-muted-foreground",
            expanded && "is-expanded",
          )}
          aria-hidden
        />
      </button>
      <div
        className={cn(
          "tool-panel-section-content min-h-0 border-t border-[var(--tool-chrome-border)]",
          expanded && "is-expanded flex flex-1 flex-col",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "flex flex-col gap-4 p-4",
              expanded && "min-h-0 flex-1",
              contentClassName,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export type PrototypeToolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  titleLeading?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  headerActions?: ReactNode;
  overlayClassName?: string;
  size?: keyof typeof MODAL_SIZE_CLASS;
  bodyClassName?: string;
  className?: string;
  hideHeader?: boolean;
  dismissible?: boolean;
};

export function PrototypeToolDialog({
  open,
  onOpenChange,
  title,
  description,
  titleLeading,
  children,
  footer,
  footerClassName,
  headerActions,
  overlayClassName,
  size = "md",
  bodyClassName,
  className,
  hideHeader = false,
  dismissible = true,
}: PrototypeToolDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (dismissible || nextOpen) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent
        portalScope="tool"
        showCloseButton={false}
        overlayClassName={overlayClassName}
        onPointerDownOutside={
          dismissible
            ? undefined
            : (event) => {
                event.preventDefault();
              }
        }
        onInteractOutside={
          dismissible
            ? undefined
            : (event) => {
                event.preventDefault();
              }
        }
        onEscapeKeyDown={
          dismissible
            ? undefined
            : (event) => {
                event.preventDefault();
              }
        }
        className={cn(
          "tool-dialog-surface flex max-h-[min(92svh,calc(100%-2rem))] flex-col gap-0 overflow-hidden border-0 p-0",
          MODAL_SIZE_CLASS[size],
          className,
        )}
      >
        {hideHeader ? (
          <>
            <DialogTitle className="sr-only">{title}</DialogTitle>
            {headerActions}
            {dismissible ? (
              <DialogClose
                className={cn(
                  PROTOTYPE_TOOL_MODAL_CLOSE_CLASS,
                  "absolute right-4 top-4 z-10",
                )}
              >
                <X />
                <span className="sr-only">Close</span>
              </DialogClose>
            ) : null}
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 px-5 py-4">
              <div className="flex min-w-0 items-start gap-2">
                {titleLeading}
                <div className="flex min-w-0 flex-col gap-1">
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    {title}
                  </DialogTitle>
                  {description ? (
                    <p className="tool-dialog-description">{description}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                {headerActions}
                {dismissible ? (
                  <DialogClose className={PROTOTYPE_TOOL_MODAL_CLOSE_CLASS}>
                    <X />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                ) : null}
              </div>
            </div>
          </>
        )}

        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4",
            bodyClassName,
          )}
        >
          {children}
        </div>

        {footer ? (
          <>
            <div
              className={cn(
                "flex items-center gap-2 p-5",
                footerClassName,
              )}
            >
              {footer}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
