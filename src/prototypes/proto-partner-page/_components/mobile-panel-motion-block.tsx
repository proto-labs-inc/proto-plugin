"use client";

import { PrototypeComponent } from "proto-plugin";

import { MobilePickerLayoutControls } from "./mobile-picker-layout-block";
import {
  DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT,
  MOBILE_PICKER_DOCK_DIVIDER_CLASS,
  MOBILE_PICKER_DOCK_BORDER_CLASS,
  MOBILE_PICKER_SURFACE,
} from "./mobile-picker-layout-content";
import {
  isUnifiedPanelMotionVariant,
  type MobilePanelMotionVariant,
} from "./mobile-panel-motion-content";
import { MobilePanelMotionShell } from "./mobile-panel-motion-shell";
import type { ShapeColorPickerSelection } from "./shape-color-picker-block";

type MobilePanelMotionBlockProps = {
  variant: MobilePanelMotionVariant;
  selection: ShapeColorPickerSelection;
  onSelectionChange: (next: ShapeColorPickerSelection) => void;
  replayKey?: string | number;
};

const PANEL_CONTROLS_PADDING_CLASS =
  `${MOBILE_PICKER_DOCK_BORDER_CLASS} mx-auto max-w-md px-4 pt-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5`;

const PANEL_CONTROLS_INNER_PADDING_CLASS =
  "mx-auto max-w-md px-4 pt-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5";

function MobilePanelMotionControls({
  selection,
  onSelectionChange,
  layoutGroupScope,
}: Pick<
  MobilePanelMotionBlockProps,
  "selection" | "onSelectionChange" | "replayKey"
> & {
  layoutGroupScope: string;
}) {
  return (
    <MobilePickerLayoutControls
      variant={DEFAULT_MOBILE_PICKER_LAYOUT_VARIANT}
      selection={selection}
      onSelectionChange={onSelectionChange}
      animateEntrance={false}
      layoutGroupScope={layoutGroupScope}
    />
  );
}

export function MobilePanelMotionBlock({
  variant,
  selection,
  onSelectionChange,
  replayKey,
}: MobilePanelMotionBlockProps) {
  const unifiedPanel = isUnifiedPanelMotionVariant(variant);
  const layoutGroupScope = String(replayKey ?? variant);

  if (unifiedPanel) {
    return (
      <PrototypeComponent
        id="mobile-panel-motion-block"
        className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 w-full overflow-hidden"
      >
        <MobilePanelMotionShell
          variant={variant}
          replayKey={replayKey ?? variant}
          forceMotion
          className="w-full"
        >
          <div className={MOBILE_PICKER_DOCK_DIVIDER_CLASS} aria-hidden />
          <div
            className="w-full"
            style={{ backgroundColor: MOBILE_PICKER_SURFACE }}
          >
            <div className={PANEL_CONTROLS_INNER_PADDING_CLASS}>
              <MobilePanelMotionControls
                selection={selection}
                onSelectionChange={onSelectionChange}
                layoutGroupScope={layoutGroupScope}
              />
            </div>
          </div>
        </MobilePanelMotionShell>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent
      id="mobile-panel-motion-block"
      className="pointer-events-auto absolute inset-x-0 bottom-0 z-40 w-full overflow-hidden"
      style={{ backgroundColor: MOBILE_PICKER_SURFACE }}
    >
      <div className={PANEL_CONTROLS_PADDING_CLASS}>
        <MobilePanelMotionShell
          variant={variant}
          replayKey={replayKey ?? variant}
          forceMotion
        >
          <MobilePanelMotionControls
            selection={selection}
            onSelectionChange={onSelectionChange}
            layoutGroupScope={layoutGroupScope}
          />
        </MobilePanelMotionShell>
      </div>
    </PrototypeComponent>
  );
}
