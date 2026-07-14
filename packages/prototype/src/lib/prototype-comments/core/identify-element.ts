import {
  getAccessibilityInfo,
  getDetailedComputedStyles,
  getElementClasses,
  getElementPath,
  getForensicComputedStyles,
  getFullElementPath,
  getNearbyElements,
  getNearbyText,
  identifyElement,
} from "./element-identification";
import { getReactComponentName } from "./react-detection";
import {
  formatSourceLocation,
  findNearestComponentSource,
  getSourceLocation,
} from "./source-location";

export type ReactComponentMode = "smart" | "filtered" | "all" | "off";

export function identifyElementWithReact(
  element: HTMLElement,
  reactMode: ReactComponentMode = "filtered",
): {
  name: string;
  elementName: string;
  path: string;
  reactComponents: string | null;
} {
  const { name: elementName, path } = identifyElement(element);

  if (reactMode === "off") {
    return { name: elementName, elementName, path, reactComponents: null };
  }

  const reactInfo = getReactComponentName(element, { mode: reactMode });

  return {
    name: reactInfo.path ? `${reactInfo.path} ${elementName}` : elementName,
    elementName,
    path,
    reactComponents: reactInfo.path,
  };
}

export function isElementFixed(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const position = style.position;
    if (position === "fixed" || position === "sticky") {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

export function detectSourceFile(element: Element): string | undefined {
  const result = getSourceLocation(element as HTMLElement);
  const loc = result.found ? result : findNearestComponentSource(element as HTMLElement);
  if (loc.found && loc.source) {
    return formatSourceLocation(loc.source, "path");
  }
  return undefined;
}

export {
  getAccessibilityInfo,
  getDetailedComputedStyles,
  getElementClasses,
  getForensicComputedStyles,
  getFullElementPath,
  getNearbyElements,
  getNearbyText,
};
