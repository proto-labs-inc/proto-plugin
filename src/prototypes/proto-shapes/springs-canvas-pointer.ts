export type SpringsCanvasPointerHandlers = {
  onPointerDown: (event: PointerEvent) => boolean;
  onPointerMove: (event: PointerEvent) => void;
  onPointerEnd: (event: PointerEvent) => void;
};

/** Binds pointer drag handling that survives releases outside the canvas bounds. */
export function bindSpringsCanvasPointerHandlers(
  canvas: HTMLCanvasElement,
  handlers: SpringsCanvasPointerHandlers,
): () => void {
  let activePointerId: number | null = null;

  const isActivePointer = (event: PointerEvent) =>
    activePointerId !== null && event.pointerId === activePointerId;

  const releaseCapture = (event: PointerEvent) => {
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  };

  const detachWindowListeners = () => {
    window.removeEventListener("pointermove", onWindowPointerMove);
    window.removeEventListener("pointerup", onWindowPointerEnd);
    window.removeEventListener("pointercancel", onWindowPointerEnd);
  };

  const endDrag = (event: PointerEvent) => {
    if (!isActivePointer(event)) return;

    activePointerId = null;
    detachWindowListeners();
    releaseCapture(event);
    handlers.onPointerEnd(event);
  };

  const onWindowPointerMove = (event: PointerEvent) => {
    if (!isActivePointer(event)) return;
    handlers.onPointerMove(event);
  };

  const onWindowPointerEnd = (event: PointerEvent) => {
    endDrag(event);
  };

  const onCanvasPointerDown = (event: PointerEvent) => {
    if (activePointerId !== null) return;
    if (!handlers.onPointerDown(event)) return;

    activePointerId = event.pointerId;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerup", onWindowPointerEnd);
    window.addEventListener("pointercancel", onWindowPointerEnd);
  };

  const onLostPointerCapture = (event: PointerEvent) => {
    if (!isActivePointer(event)) return;

    activePointerId = null;
    detachWindowListeners();
    handlers.onPointerEnd(event);
  };

  canvas.addEventListener("pointerdown", onCanvasPointerDown);
  canvas.addEventListener("lostpointercapture", onLostPointerCapture);

  return () => {
    canvas.removeEventListener("pointerdown", onCanvasPointerDown);
    canvas.removeEventListener("lostpointercapture", onLostPointerCapture);
    detachWindowListeners();
    activePointerId = null;
  };
}
