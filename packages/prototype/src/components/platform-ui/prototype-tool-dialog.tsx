"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { cn } from "@prototype/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export const PROTOTYPE_TOOL_MODAL_CLOSE_CLASS =
  "text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-70 transition-opacity duration-200 ease hover:opacity-100 outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:hover:text-muted-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export const PROTOTYPE_TOOL_MODAL_TEXTAREA_CLASS =
  "field-sizing-content min-h-[min(50vh,20rem)] w-full resize-y border-0 bg-transparent px-0 py-0 text-sm leading-relaxed text-foreground shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0";

const MODAL_SIZE_CLASS = {
  md: "w-[min(42rem,calc(100vw-2rem))] max-w-[min(42rem,calc(100vw-2rem))] sm:max-w-[min(42rem,calc(100vw-2rem))]",
  wide: "w-[min(96rem,calc(100vw-2rem))] max-w-[min(96rem,calc(100vw-2rem))] sm:max-w-[min(96rem,calc(100vw-2rem))]",
} as const;

function PrototypeToolDialogSeparator() {
  return (
    <div
      className="tool-dialog-separator h-px w-full shrink-0"
      role="separator"
      aria-hidden
    />
  );
}

export type PrototypeToolDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  footerClassName?: string;
  headerActions?: ReactNode;
  size?: keyof typeof MODAL_SIZE_CLASS;
  bodyClassName?: string;
  className?: string;
};

export function PrototypeToolDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  footerClassName,
  headerActions,
  size = "md",
  bodyClassName,
  className,
}: PrototypeToolDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        portalScope="tool"
        showCloseButton={false}
        className={cn(
          "tool-dialog-surface flex max-h-[min(92svh,calc(100%-2rem))] flex-col gap-0 overflow-hidden border-0 p-0",
          MODAL_SIZE_CLASS[size],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle className="text-base font-medium text-foreground">
              {title}
            </DialogTitle>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {headerActions}
            <DialogClose className={PROTOTYPE_TOOL_MODAL_CLOSE_CLASS}>
              <X />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        <PrototypeToolDialogSeparator />

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
            <PrototypeToolDialogSeparator />
            <div
              className={cn(
                "flex items-center gap-2 px-5 py-3",
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
