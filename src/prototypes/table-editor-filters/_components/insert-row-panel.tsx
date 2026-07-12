"use client";

import { PrototypeComponent, usePrototypeProductOverlayPortal } from "proto-plugin";
import { Button, KeyboardShortcut, Label, SidePanel, Switch } from "ui";

import { MOCK_COLUMNS } from "./table-editor-filters-mock-data";
import { RowFieldInput } from "./row-editor-fields";

type InsertRowPanelProps = {
  visible: boolean;
  onClose: () => void;
};

function RowEditorHeaderTitle() {
  return (
    <span>
      Add new row to <code className="text-code-inline text-sm!">employees</code>
    </span>
  );
}

export function InsertRowPanel({ visible, onClose }: InsertRowPanelProps) {
  const portalContainer = usePrototypeProductOverlayPortal();
  const requiredFields = MOCK_COLUMNS.filter((column) => !column.isNullable);
  const optionalFields = MOCK_COLUMNS.filter((column) => column.isNullable);

  return (
    <SidePanel
      data-testid="table-editor-side-panel"
      size="large"
      visible={visible}
      portalContainer={portalContainer}
      header={<RowEditorHeaderTitle />}
      onCancel={onClose}
      customFooter={
        <div className="flex w-full items-center gap-3 border-t border-default px-3 py-4">
          <div className="flex items-center space-x-2">
            <Switch id="create-more" size="small" aria-label="Toggle create more" />
            <Label htmlFor="create-more">Create more</Label>
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
      <PrototypeComponent id="insert-row-panel" className="h-full">
        <form className="h-full">
          <div className="flex h-full flex-col">
            <div className="flex grow flex-col">
              <SidePanel.Content>
                <div className="space-y-10 py-6">
                  {requiredFields.map((field) => (
                    <RowFieldInput key={field.name} {...field} />
                  ))}
                </div>
              </SidePanel.Content>
              <SidePanel.Separator />
              <SidePanel.Content>
                <div className="space-y-10 py-6">
                  <div>
                    <h3 className="text-base text-foreground">Optional Fields</h3>
                    <p className="text-sm text-foreground-lighter">
                      These are columns that do not need any value
                    </p>
                  </div>
                  {optionalFields.map((field) => (
                    <RowFieldInput key={field.name} {...field} />
                  ))}
                </div>
              </SidePanel.Content>
            </div>
          </div>
        </form>
      </PrototypeComponent>
    </SidePanel>
  );
}
