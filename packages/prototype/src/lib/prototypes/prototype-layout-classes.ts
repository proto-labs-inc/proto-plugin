/**
 * Canonical Tailwind fill classes for prototype pages inside #prototype-viewport.
 * The preview shell only auto-sizes direct children of .viewportPage — every nested
 * layer must repeat this chain or content pins to a corner and clips.
 *
 * @see packages/prototype/AGENTS.md — "Prototype viewport fill"
 */

/** `PrototypeComponent` with id="scroll-container" */
export const PROTOTYPE_SCROLL_CONTAINER_CLASS =
  "flex h-full min-h-0 flex-1 flex-col overflow-hidden";

/** `PrototypeComponent` with id="page" */
export const PROTOTYPE_PAGE_CLASS =
  "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden";

/** Step/view roots, AnimatePresence wrappers, motion.div page shells */
export const PROTOTYPE_VIEW_SHELL_CLASS =
  "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden";
