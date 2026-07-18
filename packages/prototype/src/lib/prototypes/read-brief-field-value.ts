/**
 * Read the current value of a modal brief input/textarea by its element id.
 *
 * Modals read the latest DOM value at copy time (rather than relying solely on
 * React state) so in-flight IME/composition input is captured. Shared by the
 * gallery create modals.
 */
export function readBriefFieldValue(fieldId: string): string {
  const element = document.getElementById(fieldId);
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value;
  }

  return "";
}
