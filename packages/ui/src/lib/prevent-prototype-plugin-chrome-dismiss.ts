/**
 * Keep selectors in sync with
 * `packages/prototype/src/lib/prototype-comments/core/comment-capture-blocked.ts`.
 * Used by viewport-scoped SidePanel/Sheet so proto-plugin chrome clicks do not dismiss product overlays.
 */
const PROTOTYPE_PLUGIN_CHROME_SELECTORS = [
  '[data-feedback-toolbar]',
  '[data-comment-capture-toolbar]',
  '[data-prototype-review-trigger]',
  '[data-prototype-review-footer]',
  '[data-prototype-review-sidebar]',
  '[data-prototype-review-panel]',
  '[data-comments-sidebar]',
  '#prototype-comments-sidebar-root',
  '#prototype-chrome-root',
  '[data-prototype-tool-overlay-root]',
  '[data-annotation-popup]',
  '[data-annotation-marker]',
  '[data-prototype-share-hint]',
] as const

function isPrototypePluginChromeTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return PROTOTYPE_PLUGIN_CHROME_SELECTORS.some((selector) => target.closest(selector) != null)
}

export function preventDismissOnPrototypePluginChrome(event: {
  preventDefault: () => void
  target: EventTarget | null
}): void {
  if (isPrototypePluginChromeTarget(event.target)) {
    event.preventDefault()
  }
}
