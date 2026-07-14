import { useEffect, useState } from "react";

/**
 * Increments a counter whenever page layout shifts in ways that don't fire
 * window resize — e.g. comments sidebar open/close animating body margin.
 */
export function useLayoutShift(): number {
  const [layoutVersion, setLayoutVersion] = useState(0);

  useEffect(() => {
    const bump = () => setLayoutVersion((v) => v + 1);

    const resizeObserver = new ResizeObserver(bump);
    resizeObserver.observe(document.body);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "data-comments-sidebar-open" ||
            mutation.attributeName === "data-prototype-review-sidebar-open")
        ) {
          bump();
          break;
        }
      }
    });
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-comments-sidebar-open",
        "data-prototype-review-sidebar-open",
        "data-comments-sidebar-resizing",
        "data-prototype-review-sidebar-resizing",
        "style",
      ],
    });

    const handleTransitionEnd = (event: TransitionEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (
        target === document.body &&
        event.propertyName === "margin-right"
      ) {
        bump();
        return;
      }

      if (
        target.id === "prototype-comments-sidebar-root" &&
        event.propertyName === "width"
      ) {
        bump();
      }
    };
    document.body.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      document.body.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  return layoutVersion;
}
