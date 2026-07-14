"use client";

import type { DesignExplorationRationale } from "proto-plugin";
import { PrototypeComponent } from "proto-plugin";
import { FormItemLayout } from "ui-patterns/form/FormItemLayout/FormItemLayout";
import { ChevronsUpDown, ChevronDown, ExternalLink, Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  InputGroup,
  InputGroupInput,
  SidePanel,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  cn,
} from "ui";

export type InsertColumnVariant =
  | "essential-first"
  | "tabbed-workflow"
  | "type-hero"
  | "accordion-sections"
  | "stacked-compact"
  | "sectioned-sidebar";

export const INSERT_COLUMN_FIELD_GROUPS = {
  identity: ["Name", "Description"],
  schema: ["Type", "Define as Array", "Default Value"],
  relations: ["Foreign Keys"],
  constraints: ["Is Primary Key", "Allow Nullable", "Is Unique", "CHECK constraint"],
  privacy: ["Mark as sensitive data"],
} as const;

export const INSERT_COLUMN_VARIANT_OPTIONS: Array<{
  value: InsertColumnVariant;
  label: string;
  hint?: string;
  rationale?: DesignExplorationRationale;
}> = [
  {
    value: "essential-first",
    label: "Essential first",
    hint: "Name and type up top; constraints and relations tucked into Advanced",
    rationale: {
      good: "Surfaces the two fields users need on every add-column flow before optional schema tuning.",
      bad: "Power users may need an extra click to reach constraints or foreign keys.",
    },
  },
  {
    value: "tabbed-workflow",
    label: "Tabbed workflow",
    hint: "Basics, Type, Constraints, and More tabs split concerns and cut scroll",
    rationale: {
      good: "Groups related fields by task — good when reviewers compare mental models step-by-step.",
      bad: "Hides cross-section context; switching tabs adds friction for quick edits.",
    },
  },
  {
    value: "type-hero",
    label: "Type hero",
    hint: "Prominent type picker with quick chips for common Postgres types",
    rationale: {
      good: "Type selection is the highest-friction step — making it the focal point speeds common paths.",
      bad: "Less room for constraint copy; chip row may feel crowded on narrow panels.",
    },
  },
  {
    value: "accordion-sections",
    label: "Accordion sections",
    hint: "Collapsible General, Data Type, Constraints, and Privacy — General open by default",
    rationale: {
      good: "Keeps the full Studio section model while letting users collapse what they do not need.",
      bad: "Still a long page when every section is expanded; accordion affordance adds visual noise.",
    },
  },
  {
    value: "stacked-compact",
    label: "Stacked compact",
    hint: "Single-column stack without left section labels — dense but scannable",
    rationale: {
      good: "Maximizes usable width for inputs and descriptions on the side panel.",
      bad: "Loses the section hierarchy that helps orient users across many field groups.",
    },
  },
];

export const INSERT_COLUMN_BASELINE = {
  value: "sectioned-sidebar" as const satisfies InsertColumnVariant,
  label: "Sectioned sidebar",
  hint: "Two-column sections with left labels — current Supabase Studio add-column panel",
  rationale: {
    good: "Matches production Studio and mirrors how other database forms are structured.",
    bad: "Long vertical scroll; advanced fields compete equally with name and type.",
  },
};

export const DEFAULT_INSERT_COLUMN_VARIANT: InsertColumnVariant =
  INSERT_COLUMN_BASELINE.value;

const QUICK_TYPE_CHIPS = ["text", "int8", "bool", "timestamptz", "uuid"] as const;

function ColumnTextInput({
  id,
  placeholder,
  className,
}: {
  id?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        type="text"
        placeholder={placeholder}
        readOnly
        data-1p-ignore
        data-lpignore="true"
        data-form-type="other"
        data-bwignore
        className={className}
      />
    </InputGroup>
  );
}

function FormSection({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  return (
    <SidePanel.Content>
      <div className="grid grid-cols-12 gap-6 py-4 md:py-8 opacity-100">
        {header}
        {children}
      </div>
    </SidePanel.Content>
  );
}

function FormSectionLabel({
  children,
  className = "",
  description,
}: {
  children: React.ReactNode;
  className?: string;
  description?: React.ReactNode;
}) {
  if (description !== undefined) {
    return (
      <div className={`flex flex-col space-y-2 col-span-5 ${className}`}>
        <label className="text-foreground text-sm">{children}</label>
        {description}
      </div>
    );
  }

  return (
    <label className={`text-foreground col-span-5 text-sm ${className}`}>{children}</label>
  );
}

function FormSectionContent({ children }: { children: React.ReactNode }) {
  return <div className="relative col-span-7 flex flex-col gap-6">{children}</div>;
}

function IdentityFields({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <FormItemLayout
        isReactForm={false}
        id="name"
        label="Name"
        description={
          compact ? undefined : (
            <>
              Recommended to use lowercase and use an underscore to separate words e.g.{" "}
              <code className="text-code-inline">column_name</code>
            </>
          )
        }
      >
        <ColumnTextInput id="name" placeholder="column_name" />
      </FormItemLayout>
      <FormItemLayout
        isReactForm={false}
        id="description"
        label="Description"
        labelOptional="Optional"
      >
        <ColumnTextInput id="description" />
      </FormItemLayout>
    </>
  );
}

function DataTypeLinks() {
  return (
    <div className="space-y-2">
      <Button asChild type="button" variant="default" size="tiny" icon={<Plus />}>
        <a target="_blank" rel="noreferrer" href="/project/default/database/types">
          Create enum types
        </a>
      </Button>
      <Button asChild type="button" variant="default" size="tiny" icon={<ExternalLink />}>
        <a
          target="_blank"
          rel="noreferrer"
          href="https://supabase.com/docs/guides/database/tables#data-types"
        >
          About data types
        </a>
      </Button>
    </div>
  );
}

function TypePickerField({ emphasized = false }: { emphasized?: boolean }) {
  return (
    <div className="flex flex-col gap-y-2">
      <label className="text-sm leading-none text-foreground-light">Type</label>
      <Button
        type="button"
        variant="default"
        size={emphasized ? "medium" : "small"}
        className={cn(
          "w-full justify-between text-foreground-lighter font-regular",
          emphasized && "min-h-10 border-strong",
        )}
        iconRight={<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
      >
        <span className="truncate">Choose a column type...</span>
      </Button>
    </div>
  );
}

function SchemaFields({ showTypeLinks = true }: { showTypeLinks?: boolean }) {
  return (
    <>
      {showTypeLinks ? (
        <div className="rounded-md border border-default bg-surface-100 px-3 py-2">
          <DataTypeLinks />
        </div>
      ) : null}
      <TypePickerField />
      <FormItemLayout
        isReactForm={false}
        layout="flex"
        id="isArray"
        label="Define as Array"
        description="Allow column to be defined as variable-length multidimensional arrays"
      >
        <Checkbox id="isArray" />
      </FormItemLayout>
      <FormItemLayout
        isReactForm={false}
        id="column-default"
        label="Default Value"
        description="Can either be a literal or an expression. When using an expression wrap your expression in brackets, e.g. (gen_random_uuid())"
      >
        <ColumnTextInput id="column-default" placeholder="NULL" />
      </FormItemLayout>
    </>
  );
}

function ForeignKeyFields() {
  return (
    <div className="flex flex-col gap-y-2">
      <Button type="button" variant="default" size="tiny" className="w-min">
        Add foreign key
      </Button>
    </div>
  );
}

function ConstraintFields() {
  return (
    <>
      <FormItemLayout
        isReactForm={false}
        layout="flex"
        id="isPrimaryKey"
        label="Is Primary Key"
        description="A primary key indicates that a column or group of columns can be used as a unique identifier for rows in the table"
      >
        <Switch id="isPrimaryKey" aria-label="Toggle primary key" />
      </FormItemLayout>
      <FormItemLayout
        isReactForm={false}
        layout="flex"
        id="isNullable"
        label="Allow Nullable"
        description="Allow the column to assume a NULL value if no value is provided"
      >
        <Switch id="isNullable" aria-label="Toggle is nullable" defaultChecked />
      </FormItemLayout>
      <FormItemLayout
        isReactForm={false}
        layout="flex"
        id="isUnique"
        label="Is Unique"
        description="Enforce values in the column to be unique across rows"
      >
        <Switch id="isUnique" aria-label="Toggle is unique" />
      </FormItemLayout>
      <FormItemLayout isReactForm={false} label="CHECK constraint" labelOptional="Optional">
        <ColumnTextInput placeholder="column_name > 0" className="font-mono" />
      </FormItemLayout>
    </>
  );
}

function PrivacyFields() {
  return (
    <FormItemLayout
      isReactForm={false}
      layout="flex"
      id="isSensitiveData"
      label="Mark as sensitive data"
      description="Column will be masked when viewing table data by default"
    >
      <Switch id="isSensitiveData" />
    </FormItemLayout>
  );
}

function SectionedSidebarLayout() {
  return (
    <>
      <FormSection header={<FormSectionLabel>General</FormSectionLabel>}>
        <FormSectionContent>
          <IdentityFields />
        </FormSectionContent>
      </FormSection>

      <SidePanel.Separator />

      <FormSection
        header={
          <FormSectionLabel description={<DataTypeLinks />}>Data Type</FormSectionLabel>
        }
      >
        <FormSectionContent>
          <SchemaFields showTypeLinks={false} />
        </FormSectionContent>
      </FormSection>

      <SidePanel.Separator />

      <FormSection header={<FormSectionLabel>Foreign Keys</FormSectionLabel>}>
        <FormSectionContent>
          <ForeignKeyFields />
        </FormSectionContent>
      </FormSection>

      <SidePanel.Separator />

      <FormSection header={<FormSectionLabel>Constraints</FormSectionLabel>}>
        <FormSectionContent>
          <ConstraintFields />
        </FormSectionContent>
      </FormSection>

      <SidePanel.Separator />

      <FormSection header={<FormSectionLabel>Data Privacy</FormSectionLabel>}>
        <FormSectionContent>
          <PrivacyFields />
        </FormSectionContent>
      </FormSection>
    </>
  );
}

function EssentialFirstLayout() {
  return (
    <SidePanel.Content className="flex flex-col gap-6 py-6">
      <div className="rounded-lg border border-default bg-surface-100 p-4 space-y-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-foreground-lighter">
            Required
          </p>
          <p className="mt-1 text-sm text-foreground-light">
            Name and type are needed before saving a new column.
          </p>
        </div>
        <IdentityFields compact />
        <TypePickerField emphasized />
        <FormItemLayout
          isReactForm={false}
          id="column-default-essential"
          label="Default Value"
          labelOptional="Optional"
        >
          <ColumnTextInput id="column-default-essential" placeholder="NULL" />
        </FormItemLayout>
      </div>

      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="text"
            className="group w-full justify-between px-0 hover:bg-transparent"
            iconRight={
              <ChevronDown className="h-4 w-4 text-foreground-lighter transition-transform group-data-[state=open]:rotate-180" />
            }
          >
            <span className="text-sm font-medium text-foreground">Advanced options</span>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-4">
          <FormItemLayout
            isReactForm={false}
            layout="flex"
            id="isArray-essential"
            label="Define as Array"
          >
            <Checkbox id="isArray-essential" />
          </FormItemLayout>
          <ForeignKeyFields />
          <ConstraintFields />
          <PrivacyFields />
        </CollapsibleContent>
      </Collapsible>
    </SidePanel.Content>
  );
}

function TabbedWorkflowLayout() {
  return (
    <SidePanel.Content className="py-4">
      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="mb-6 w-full justify-start gap-4 px-0">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="constraints">Constraints</TabsTrigger>
          <TabsTrigger value="more">More</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-6 mt-0">
          <IdentityFields />
        </TabsContent>

        <TabsContent value="type" className="space-y-6 mt-0">
          <SchemaFields />
        </TabsContent>

        <TabsContent value="constraints" className="space-y-6 mt-0">
          <ConstraintFields />
        </TabsContent>

        <TabsContent value="more" className="space-y-6 mt-0">
          <ForeignKeyFields />
          <PrivacyFields />
        </TabsContent>
      </Tabs>
    </SidePanel.Content>
  );
}

function TypeHeroLayout() {
  return (
    <SidePanel.Content className="flex flex-col gap-6 py-6">
      <FormItemLayout
        isReactForm={false}
        id="name-hero"
        label="Column name"
        description={
          <>
            Use lowercase with underscores, e.g.{" "}
            <code className="text-code-inline">column_name</code>
          </>
        }
      >
        <ColumnTextInput id="name-hero" placeholder="column_name" />
      </FormItemLayout>

      <div className="space-y-3 rounded-lg border border-default bg-surface-100 p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Data type</p>
          <p className="text-sm text-foreground-lighter">
            Pick a common type or search the full Postgres catalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_TYPE_CHIPS.map((type) => (
            <Button key={type} type="button" variant="default" size="tiny" className="font-mono">
              {type}
            </Button>
          ))}
        </div>
        <TypePickerField emphasized />
      </div>

      <FormItemLayout
        isReactForm={false}
        id="column-default-hero"
        label="Default Value"
        labelOptional="Optional"
      >
        <ColumnTextInput id="column-default-hero" placeholder="NULL" />
      </FormItemLayout>

      <div className="grid grid-cols-2 gap-4">
        <FormItemLayout
          isReactForm={false}
          layout="flex"
          id="isNullable-hero"
          label="Allow Nullable"
        >
          <Switch id="isNullable-hero" aria-label="Toggle is nullable" defaultChecked />
        </FormItemLayout>
        <FormItemLayout
          isReactForm={false}
          layout="flex"
          id="isUnique-hero"
          label="Is Unique"
        >
          <Switch id="isUnique-hero" aria-label="Toggle is unique" />
        </FormItemLayout>
      </div>

      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="small"
            className="group w-full justify-between"
            iconRight={
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
            }
          >
            More schema options
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-6 pt-4">
          <FormItemLayout
            isReactForm={false}
            id="description-hero"
            label="Description"
            labelOptional="Optional"
          >
            <ColumnTextInput id="description-hero" />
          </FormItemLayout>
          <FormItemLayout
            isReactForm={false}
            layout="flex"
            id="isPrimaryKey-hero"
            label="Is Primary Key"
          >
            <Switch id="isPrimaryKey-hero" aria-label="Toggle primary key" />
          </FormItemLayout>
          <ForeignKeyFields />
          <PrivacyFields />
        </CollapsibleContent>
      </Collapsible>
    </SidePanel.Content>
  );
}

function AccordionSectionsLayout() {
  return (
    <SidePanel.Content className="py-2">
      <Accordion type="multiple" defaultValue={["general", "data-type"]} className="w-full">
        <AccordionItem value="general">
          <AccordionTrigger className="text-sm font-medium">General</AccordionTrigger>
          <AccordionContent className="space-y-6 pb-4">
            <IdentityFields />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="data-type">
          <AccordionTrigger className="text-sm font-medium">Data Type</AccordionTrigger>
          <AccordionContent className="space-y-6 pb-4">
            <DataTypeLinks />
            <SchemaFields showTypeLinks={false} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="foreign-keys">
          <AccordionTrigger className="text-sm font-medium">Foreign Keys</AccordionTrigger>
          <AccordionContent className="pb-4">
            <ForeignKeyFields />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="constraints">
          <AccordionTrigger className="text-sm font-medium">Constraints</AccordionTrigger>
          <AccordionContent className="space-y-6 pb-4">
            <ConstraintFields />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="privacy">
          <AccordionTrigger className="text-sm font-medium">Data Privacy</AccordionTrigger>
          <AccordionContent className="pb-4">
            <PrivacyFields />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </SidePanel.Content>
  );
}

function StackedCompactLayout() {
  return (
    <SidePanel.Content className="flex flex-col gap-8 py-6">
      <div className="space-y-6">
        <IdentityFields />
      </div>
      <div className="w-full h-px bg-border" />
      <div className="space-y-6">
        <DataTypeLinks />
        <SchemaFields showTypeLinks={false} />
      </div>
      <div className="w-full h-px bg-border" />
      <ForeignKeyFields />
      <div className="w-full h-px bg-border" />
      <div className="space-y-6">
        <ConstraintFields />
      </div>
      <div className="w-full h-px bg-border" />
      <PrivacyFields />
    </SidePanel.Content>
  );
}

type InsertColumnFormContentProps = {
  variant: InsertColumnVariant;
};

export function InsertColumnFormContent({ variant }: InsertColumnFormContentProps) {
  return (
    <PrototypeComponent id="insert-column-content.insert-column-form-content">
      <form className="h-full">
        {variant === "sectioned-sidebar" ? <SectionedSidebarLayout /> : null}
        {variant === "essential-first" ? <EssentialFirstLayout /> : null}
        {variant === "tabbed-workflow" ? <TabbedWorkflowLayout /> : null}
        {variant === "type-hero" ? <TypeHeroLayout /> : null}
        {variant === "accordion-sections" ? <AccordionSectionsLayout /> : null}
        {variant === "stacked-compact" ? <StackedCompactLayout /> : null}
      </form>
    </PrototypeComponent>
  );
}
