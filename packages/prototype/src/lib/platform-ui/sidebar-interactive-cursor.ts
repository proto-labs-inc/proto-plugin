/** Interactive targets inside review/platform sidebars that should show pointer. */
export const SIDEBAR_INTERACTIVE_POINTER_SELECTOR =
  ":is(button:not(:disabled), [role='button']:not([aria-disabled='true']), a[href], summary, label:has([role='switch']), label:has(input[type='checkbox']))";

export const SIDEBAR_ROOT_SELECTORS = [
  "[data-prototype-review-sidebar]",
  "[data-comments-sidebar]",
  "[data-platform-sidebar]",
  "#prototype-comments-sidebar-root",
] as const;

export function buildSidebarInteractivePointerCss(options?: {
  important?: boolean;
}): string {
  const suffix = options?.important ? " !important" : "";
  return SIDEBAR_ROOT_SELECTORS.map(
    (root) => `${root} ${SIDEBAR_INTERACTIVE_POINTER_SELECTOR}`,
  ).join(",\n") + ` { cursor: pointer${suffix}; }`;
}
