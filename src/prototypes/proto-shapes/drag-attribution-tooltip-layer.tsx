"use client";

import { PrototypeComponent } from "proto-plugin";
import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import {
  DRAG_ATTRIBUTION_TOOLTIP_CLASS,
  DRAG_ATTRIBUTION_TOOLTIP_LAYERED_CLASS,
} from "../proto-shapes/springs-drag-attribution-tooltip";

type DragAttributionTooltipLayerProps = {
  tooltipRef: RefObject<HTMLDivElement | null>;
  labelRef: RefObject<HTMLSpanElement | null>;
  /** When false, renders in-place below copy overlays so text highlights can mask it. */
  portaled?: boolean;
};

function DragAttributionTooltip({
  tooltipRef,
  labelRef,
  className,
}: {
  tooltipRef: RefObject<HTMLDivElement | null>;
  labelRef: RefObject<HTMLSpanElement | null>;
  className: string;
}) {
  return (
    <div
      ref={tooltipRef}
      className={className}
      style={{ display: "none" }}
      aria-hidden
    >
      <span ref={labelRef} />
    </div>
  );
}

/** Portals the drag tooltip to `document.body` so it sits above prototype overlays. */
export function DragAttributionTooltipLayer({
  tooltipRef,
  labelRef,
  portaled = true,
}: DragAttributionTooltipLayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (portaled) {
    return (
      <PrototypeComponent id="drag-attribution-tooltip-layer">
        {createPortal(
          <DragAttributionTooltip
            tooltipRef={tooltipRef}
            labelRef={labelRef}
            className={DRAG_ATTRIBUTION_TOOLTIP_CLASS}
          />,
          document.body,
        )}
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent id="drag-attribution-tooltip-layer">
      <DragAttributionTooltip
        tooltipRef={tooltipRef}
        labelRef={labelRef}
        className={DRAG_ATTRIBUTION_TOOLTIP_LAYERED_CLASS}
      />
    </PrototypeComponent>
  );
}
