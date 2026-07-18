"use client";

import { useEffect } from "react";

import {
  getComponentLibraryThemeRescopeStyleId,
  rescopeComponentLibraryTheme,
  type ComponentLibraryRescopeMode,
} from "@prototype/lib/component-library-theme-rescope";

/**
 * Runs the component-library theme re-scoper after mount and keeps it fresh:
 * source stylesheets can load asynchronously (dev bundlers, fonts, HMR), so we
 * re-run on a few frames after mount and whenever stylesheets are added/removed.
 */
export function useComponentLibraryThemeRescope(
  modes: readonly ComponentLibraryRescopeMode[],
  themeKey: string,
): void {
  const modeKey = modes.join(",");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const activeModes = modeKey
      ? (modeKey.split(",") as ComponentLibraryRescopeMode[])
      : (["light", "dark"] as ComponentLibraryRescopeMode[]);

    let frame = 0;
    const timers: number[] = [];

    const run = () => {
      rescopeComponentLibraryTheme(activeModes);
    };

    // Run now, next frame, and after short delays to catch async stylesheet loads.
    run();
    frame = window.requestAnimationFrame(run);
    timers.push(window.setTimeout(run, 150));
    timers.push(window.setTimeout(run, 600));

    const ownStyleId = getComponentLibraryThemeRescopeStyleId();
    let scheduled = false;
    const scheduleRun = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        run();
      });
    };

    const isOwnNode = (node: Node): boolean =>
      node instanceof Element &&
      (node.id === ownStyleId ||
        node.querySelector?.(`#${ownStyleId}`) != null);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const changed = [
          ...Array.from(mutation.addedNodes),
          ...Array.from(mutation.removedNodes),
        ];
        const relevant = changed.some(
          (node) =>
            node instanceof Element &&
            !isOwnNode(node) &&
            (node.tagName === "STYLE" || node.tagName === "LINK"),
        );
        if (relevant) {
          scheduleRun();
          return;
        }
      }
    });

    observer.observe(document.head, { childList: true, subtree: true });

    if (document.fonts?.ready) {
      void document.fonts.ready.then(run);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      for (const timer of timers) window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [modeKey, themeKey]);
}
