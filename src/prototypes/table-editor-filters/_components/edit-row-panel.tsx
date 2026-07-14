"use client";

import { PrototypeComponent, usePrototypeProductOverlayPortal } from "proto-plugin";
import { Button, KeyboardShortcut, SidePanel } from "ui";

import {
  MOCK_COLUMNS,
  MOCK_EMPLOYEES,
} from "./table-editor-filters-mock-data";
import { getRowFieldValue, RowFieldInput } from "./row-editor-fields";

type EditRowPanelProps = {
  visible: boolean;
  rowId: number | null;
  onClose: () => void;
};

function EditRowHeaderTitle() {
  return (
    <span>
      Update row in <code className="text-code-inline text-sm!">employees</code>
    </span>
  );
}

export function EditRowPanel({ visible, rowId, onClose }: EditRowPanelProps) {
  const portalContainer = usePrototypeProductOverlayPortal();
  const row = MOCK_EMPLOYEES.find((employee) => employee.id === rowId) ?? null;
  const requiredFields = MOCK_COLUMNS.filter((column) => !column.isNullable);
  const optionalFields = MOCK_COLUMNS.filter((column) => column.isNullable);

  return (
    <SidePanel
      data-testid="table-editor-edit-row-panel"
      size="large"
      visible={visible && row !== null}
      portalContainer={portalContainer}
      header={<EditRowHeaderTitle />}
      onCancel={onClose}
      customFooter={
        <div className="flex w-full items-center gap-3 border-t border-default px-3 py-4">
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
      {row ? (
        <PrototypeComponent id="edit-row-panel" className="h-full">
          <form className="h-full">
            <div className="flex h-full flex-col">
              <div className="flex grow flex-col">
                <SidePanel.Content>
                  <div className="space-y-10 py-6">
                    {requiredFields.map((field) => (
                      <RowFieldInput
                        key={field.name}
                        {...field}
                        value={getRowFieldValue(row, field.name)}
                      />
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
                      <RowFieldInput
                        key={field.name}
                        {...field}
                        value={getRowFieldValue(row, field.name)}
                      />
                    ))}
                  </div>
                </SidePanel.Content>
              </div>
            </div>
          </form>
        </PrototypeComponent>
      ) : null}
    </SidePanel>
  );
}
