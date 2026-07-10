"use client";

import { useEffect, useState, type RefObject } from "react";

const AUTOMAT_SHELL_COMPACT_MAX_WIDTH = 1024;

export function useAutomatShellCompact(ref: RefObject<HTMLElement | null>) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      setIsCompact(
        element.getBoundingClientRect().width < AUTOMAT_SHELL_COMPACT_MAX_WIDTH,
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return isCompact;
}
