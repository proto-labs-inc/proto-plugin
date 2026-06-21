"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@prototype/components/ui/dialog";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

const MODAL_CHROME_BUTTON_CLASS =
  "text-muted-foreground hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-sm border-0 bg-transparent p-0 opacity-70 transition-opacity hover:opacity-100 outline-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 disabled:hover:opacity-40 disabled:hover:text-muted-foreground motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

export type PrototypeVercelPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  previewUrl: string | null;
  inspectorUrl?: string | null;
  loading?: boolean;
  error?: string | null;
};

export function PrototypeVercelPreviewModal({
  open,
  onOpenChange,
  title,
  previewUrl,
  inspectorUrl,
  loading = false,
  error = null,
}: PrototypeVercelPreviewModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!open) {
      setIframeLoaded(false);
    }
  }, [open, previewUrl]);

  const showIframe = Boolean(previewUrl) && !loading && !error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[min(92svh,calc(100%-2rem))] max-h-[min(92svh,calc(100%-2rem))] w-[min(96rem,calc(100vw-2rem))] max-w-[min(96rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(96rem,calc(100vw-2rem))]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <DialogTitle className="min-w-0 truncate text-sm font-medium">
            {title}
          </DialogTitle>
          <div className="flex shrink-0 items-center gap-0.5">
            {previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className={MODAL_CHROME_BUTTON_CLASS}
                aria-label="Open preview in new tab"
              >
                <ExternalLink />
              </a>
            ) : null}
            {inspectorUrl ? (
              <a
                href={inspectorUrl}
                target="_blank"
                rel="noreferrer"
                className={MODAL_CHROME_BUTTON_CLASS}
                aria-label="Open Vercel inspector"
              >
                <span className="text-[10px] font-medium uppercase tracking-wide">
                  Vercel
                </span>
              </a>
            ) : null}
            <DialogClose className={MODAL_CHROME_BUTTON_CLASS}>
              <X />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-[var(--bg-subtle)]">
          {loading ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading preview…
            </div>
          ) : null}

          {!loading && error ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {error}
            </div>
          ) : null}

          {showIframe ? (
            <>
              {!iframeLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Loading deployment…
                </div>
              ) : null}
              <iframe
                title={title}
                src={previewUrl ?? undefined}
                className="h-full w-full border-0 bg-background"
                onLoad={() => setIframeLoaded(true)}
              />
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
