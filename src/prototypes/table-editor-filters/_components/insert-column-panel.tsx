"use client";

import { PrototypeComponent, usePrototypeProductOverlayPortal } from "proto-plugin";
import { Button, KeyboardShortcut, Label, SidePanel, Switch } from "ui";

import {
  InsertColumnFormContent,
  type InsertColumnVariant,
} from "./insert-column-content";

type InsertColumnPanelProps = {
  visible: boolean;
  variant: InsertColumnVariant;
  onClose: () => void;
};

function ColumnEditorHeaderTitle() {
  return (
    <span>
      Add new column to <code className="text-code-inline text-sm!">employees</code>
    </span>
  );
}

export function InsertColumnPanel({ visible, variant, onClose }: InsertColumnPanelProps) {
  const portalContainer = usePrototypeProductOverlayPortal();

  return (
    <SidePanel
      data-testid="table-editor-side-panel"
      size="large"
      visible={visible}
      portalContainer={portalContainer}
      header={<ColumnEditorHeaderTitle />}
      onCancel={onClose}
      customFooter={
        <div className="flex w-full items-center gap-3 border-t border-default px-3 py-4">
          <div className="flex items-center space-x-2">
            <Switch id="toggle-create-more" size="small" aria-label="Toggle create more" />
            <Label htmlFor="toggle-create-more">Create more</Label>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button type="button" variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              iconRight={<KeyboardShortcut keys={["Meta", "Enter"]} variant="inline" />}
            >
              Save
            </Button>
          </div>
        </div>
      }
    >
      <PrototypeComponent id="insert-column-panel" className="h-full">
        <InsertColumnFormContent variant={variant} />
      </PrototypeComponent>
    </SidePanel>
  );
}
