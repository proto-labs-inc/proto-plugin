import { Edit } from "lucide-react";
import { PrototypeComponent } from "proto-plugin";
import { FormItemLayout } from "ui-patterns/form/FormItemLayout/FormItemLayout";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "ui";

import type { EmployeeRow, MockColumn } from "./table-editor-filters-mock-data";

const TEXT_TYPES = ["text", "varchar", "char", "citext"];
const DATETIME_TYPES = ["timestamp", "timestamptz", "time", "timetz", "date"];

function textPlaceholder(defaultValue: string | null | undefined) {
  return `Default: ${defaultValue === null || defaultValue === undefined ? "NULL" : defaultValue}`;
}

export function formatTimestampForInput(timestamp: string): string {
  const match = timestamp.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})/);
  if (match) return `${match[1]}T${match[2]}`;
  return timestamp;
}

export function getRowFieldValue(row: EmployeeRow, columnName: string): string | null {
  switch (columnName) {
    case "id":
      return String(row.id);
    case "name":
      return row.name;
    case "email":
      return row.email;
    case "created_at":
      return row.created_at ? formatTimestampForInput(row.created_at) : null;
    case "department":
      return row.department;
    default:
      return null;
  }
}

type RowFieldInputProps = MockColumn & {
  value?: string | null;
};

export function RowFieldInput({
  name,
  format,
  isIdentity,
  defaultValue,
  value,
}: RowFieldInputProps) {
  const fieldValue = value ?? undefined;

  if (isIdentity) {
    return (
      <PrototypeComponent id="row-editor-fields.row-field-input">
        <FormItemLayout
          isReactForm={false}
          layout="horizontal"
          label={name}
          labelOptional={format}
        >
          <InputGroup>
            <InputGroupInput
              data-testid={`${name}-input`}
              placeholder="Automatically generated as identity"
              value={fieldValue ?? ""}
              readOnly
            />
          </InputGroup>
        </FormItemLayout>
      </PrototypeComponent>
    );
  }

  if (DATETIME_TYPES.includes(format)) {
    return (
      <PrototypeComponent id="row-editor-fields.row-field-input">
        <FormItemLayout
          isReactForm={false}
          layout="horizontal"
          label={name}
          labelOptional={format}
          description={
            <div className="space-y-1">
              <p>{textPlaceholder(defaultValue)}</p>
              {format.includes("tz") && (
                <p>Your local timezone will be automatically applied (-0400)</p>
              )}
            </div>
          }
        >
          <InputGroup>
            <InputGroupInput
              data-testid={`${name}-input`}
              size="small"
              type="datetime-local"
              step="1"
              value={fieldValue ?? ""}
              readOnly
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="default" icon={<Edit />} className="px-1.5" />
            </InputGroupAddon>
          </InputGroup>
        </FormItemLayout>
      </PrototypeComponent>
    );
  }

  if (TEXT_TYPES.includes(format)) {
    return (
      <PrototypeComponent id="row-editor-fields.row-field-input">
        <FormItemLayout
          isReactForm={false}
          layout="horizontal"
          label={name}
          labelOptional={format}
        >
          <InputGroup>
            <InputGroupTextarea
              data-testid={`${name}-input`}
              className="text-sm"
              rows={5}
              placeholder={textPlaceholder(defaultValue)}
              value={fieldValue ?? ""}
              readOnly
            />
            <InputGroupAddon align="block-end">
              <InputGroupButton
                data-testid={`${name}-field-actions`}
                variant="default"
                icon={<Edit />}
                className="ml-auto px-1.5"
              />
            </InputGroupAddon>
          </InputGroup>
        </FormItemLayout>
      </PrototypeComponent>
    );
  }

  return (
    <PrototypeComponent id="row-editor-fields.row-field-input">
      <FormItemLayout
        isReactForm={false}
        layout="horizontal"
        label={name}
        labelOptional={format}
      >
        <InputGroup>
          <InputGroupInput
            data-testid={`${name}-input`}
            placeholder={textPlaceholder(defaultValue)}
            value={fieldValue ?? ""}
            readOnly
          />
        </InputGroup>
      </FormItemLayout>
    </PrototypeComponent>
  );
}
