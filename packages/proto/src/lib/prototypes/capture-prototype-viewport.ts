import { toPng } from "html-to-image";

const DEFAULT_CAPTURE_DELAY_MS = 600;

export async function capturePrototypeViewportPng(
  delayMs = DEFAULT_CAPTURE_DELAY_MS,
): Promise<string | null> {
  const root = document.querySelector<HTMLElement>("[data-prototype-screenshot]");
  if (!root) return null;

  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const pixelRatio = Math.max(2, window.devicePixelRatio || 1);

  return toPng(root, {
    pixelRatio,
    cacheBust: true,
    width: root.clientWidth,
    height: root.clientHeight,
    filter: (node) => {
      if (!(node instanceof HTMLElement)) return true;
      if (node.dataset.prototypeControls !== undefined) return false;
      if (node.dataset.prototypeCommentRoot !== undefined) return false;
      if (node.closest("[data-prototype-comment-root]")) return false;
      if (node.dataset.commentCaptureToolbar !== undefined) return false;
      if (node.dataset.commentsSidebar !== undefined) return false;
      if (node.dataset.prototypeStateCanvas !== undefined) return false;
      return true;
    },
  });
}
